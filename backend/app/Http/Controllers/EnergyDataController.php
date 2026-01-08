<?php

namespace App\Http\Controllers;

use App\Models\EnergyData;
use App\Models\DailySummary;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class EnergyDataController extends Controller
{
    /**
     * Display the dashboard
     */
    public function dashboard()
    {
        return view('dashboard');
    }

    /**
     * Get summary statistics for a selected date with filters.
     * If no date is provided, uses the earliest available date.
     * Accepts filters: floor, timeGranularity, weekday
     */
    public function getSummary(Request $request)
    {
        date_default_timezone_set('Asia/Manila');
        
        $date = $request->query('date');
        $floor = $request->query('floor');
        $timeGranularity = $request->query('timeGranularity', 'day');
        $weekday = $request->query('weekday', 'all');

        // Build base query with filters
        $query = EnergyData::query();

        // Apply floor filter
        if ($floor && $floor !== 'all') {
            $query->where('floor', $floor);
        }

        // Handle time granularity and date filtering
        if ($timeGranularity === 'week') {
            // For week view, we need to handle weekday filtering
            if ($weekday && $weekday !== 'all') {
                // Map weekday string to day number (0=Sunday, 1=Monday, etc.)
                $weekdayMap = [
                    'sunday' => 0,
                    'monday' => 1,
                    'tuesday' => 2,
                    'wednesday' => 3,
                    'thursday' => 4,
                    'friday' => 5,
                    'saturday' => 6
                ];
                $dayNumber = $weekdayMap[$weekday] ?? null;
                
                if ($dayNumber !== null) {
                    // Filter by weekday using SQLite date functions
                    $query->whereRaw("CAST(strftime('%w', date) AS INTEGER) = ?", [$dayNumber]);
                }
            }
            // For week view without specific weekday, use all available dates
            if (!$date) {
                $date = EnergyData::min('date');
            }
        } else {
            // For day view, filter by specific date
        if (!$date) {
            $date = EnergyData::min('date');
            }
            if ($date) {
                $query->where('date', $date);
            }
        }

        if (!$date && $timeGranularity === 'day') {
            return response()->json([
                'date' => null,
                'per_second' => ['avg_current' => 0, 'avg_energy' => 0, 'count' => 0],
                'per_minute' => ['avg_current' => 0, 'avg_energy' => 0, 'count' => 0],
                'per_hour' => ['avg_current' => 0, 'avg_energy' => 0, 'count' => 0],
                'per_day' => ['avg_current' => 0, 'total_energy' => 0],
                'total_records' => 0,
            ]);
        }

        // Use pre-aggregated daily_summary table for INSTANT results (< 10ms instead of 1.6s+)
        $summaryQuery = DB::table('daily_summary')->where('date', $date);
        
        if ($floor && $floor !== 'all') {
            $summaryQuery->where('floor', $floor);
        } else {
            $summaryQuery->whereNull('floor');
        }
        
        $dailySummary = $summaryQuery->first();
        
        if ($dailySummary) {
            // Use pre-aggregated data - INSTANT!
            $totalRecords = $dailySummary->total_records;
            $avgCurrentDay = (float) $dailySummary->avg_current;
            $totalEnergyDay = (float) $dailySummary->total_energy;
            $minuteCount = $dailySummary->minute_count;
            $avgCurrentPerMinute = (float) $dailySummary->avg_current_per_minute;
            $hourCount = $dailySummary->hour_count;
            $avgCurrentPerHour = (float) $dailySummary->avg_current_per_hour;
            
            // Derived averages
            $avgEnergyPerSecond = $totalRecords > 0 ? $totalEnergyDay / $totalRecords : 0.0;
            $avgEnergyPerMinute = $totalEnergyDay / $minuteCount;
            $avgEnergyPerHour = $totalEnergyDay / $hourCount;
        } else {
            // Fallback to raw query ONLY if summary table is empty (first time)
            $totalRecords = (clone $query)->count();
            $avgCurrentDay = (float) (clone $query)->avg('current_a');
            $totalEnergyDay = (float) (clone $query)->sum('energy_wh');

            // Per-minute groups
            $minuteGroups = (clone $query)
                ->selectRaw('minute, AVG(current_a) as avg_current, SUM(energy_wh) as total_energy')
                ->groupBy('minute')
                ->orderBy('minute', 'asc')
                ->get();
            $minuteCount = max(1, $minuteGroups->count());
            $avgCurrentPerMinute = (float) ($minuteGroups->avg('avg_current') ?? $avgCurrentDay);

            // Per-hour groups
            $hourGroups = (clone $query)
                ->selectRaw('hour, AVG(current_a) as avg_current, SUM(energy_wh) as total_energy')
                ->groupBy('hour')
                ->orderBy('hour', 'asc')
                ->get();
            $hourCount = max(1, $hourGroups->count());
            $avgCurrentPerHour = (float) ($hourGroups->avg('avg_current') ?? $avgCurrentDay);

            // Derived averages for energy per period
            $avgEnergyPerSecond = $totalRecords > 0 ? $totalEnergyDay / $totalRecords : 0.0;
            $avgEnergyPerMinute = $totalEnergyDay / $minuteCount;
            $avgEnergyPerHour = $totalEnergyDay / $hourCount;
        }

        return response()->json([
            'date' => $date,
            'per_second' => [
                'avg_current' => round($avgCurrentDay, 2),
                'avg_energy' => round($avgEnergyPerSecond, 5),
                'count' => $totalRecords,
            ],
            'per_minute' => [
                'avg_current' => round($avgCurrentPerMinute, 2),
                'avg_energy' => round($avgEnergyPerMinute, 2),
                'count' => $minuteCount,
            ],
            'per_hour' => [
                'avg_current' => round($avgCurrentPerHour, 2),
                'avg_energy' => round($avgEnergyPerHour, 2),
                'count' => $hourCount,
            ],
            'per_day' => [
                'avg_current' => round($avgCurrentDay, 2),
                'total_energy' => round($totalEnergyDay, 2),
            ],
            'total_records' => $totalRecords,
        ]);
    }

    /**
     * Get hourly data for a specific day with filters.
     * Accepts filters: floor, timeGranularity, weekday
     */
    public function getHourlyData(Request $request)
    {
        date_default_timezone_set('Asia/Manila');
        
        // Optimize: Get date efficiently using index
        $date = $request->input('date');
        if (!$date) {
            // Use a quick query with limit instead of min() which scans all rows
            $firstRecord = EnergyData::select('date')->orderBy('date', 'asc')->limit(1)->first();
            $date = $firstRecord ? $firstRecord->date : null;
        }
        
        $floor = $request->input('floor');
        $timeGranularity = $request->input('timeGranularity', 'day');
        $weekday = $request->input('weekday', 'all');

        // Build base query with filters - order matters for index usage
        $query = EnergyData::query();

        // Apply date filter FIRST (most selective, uses index)
        if ($timeGranularity === 'week' && $weekday && $weekday !== 'all') {
            // Filter by weekday for week view
            $weekdayMap = [
                'sunday' => 0,
                'monday' => 1,
                'tuesday' => 2,
                'wednesday' => 3,
                'thursday' => 4,
                'friday' => 5,
                'saturday' => 6
            ];
            $dayNumber = $weekdayMap[$weekday] ?? null;
            if ($dayNumber !== null) {
                // Use date index first, then filter by weekday
                $query->whereRaw("CAST(strftime('%w', date) AS INTEGER) = ?", [$dayNumber]);
                // If no date provided, find a matching date for the weekday
                if (!$date) {
                    $date = EnergyData::whereRaw("CAST(strftime('%w', date) AS INTEGER) = ?", [$dayNumber])
                        ->min('date');
                }
            }
        } else if ($date) {
            // Use index on date column
            $query->where('date', $date);
        }

        // Apply floor filter AFTER date (uses composite index)
        if ($floor && $floor !== 'all') {
            $query->where('floor', $floor);
        }

        // Use pre-aggregated hourly_summary table for INSTANT results
        // This table has pre-calculated hourly aggregations, making queries 30x+ faster
        // Query time: ~10ms instead of 300ms+ with 2M records
        // Only query hourly_summary if we have a date
        if (!$date) {
            // If no date, try to get first available date
            $firstRecord = DailySummary::select('date')->orderBy('date', 'asc')->limit(1)->first();
            $date = $firstRecord ? $firstRecord->date : null;
        }
        
        $summaryQuery = DB::table('hourly_summary');
        if ($date) {
            $summaryQuery->where('date', $date);
        }
        
        if ($floor && $floor !== 'all') {
            // Get data for specific floor
            $summaryQuery->where('floor', $floor);
        } else {
            // Get aggregated data for all floors (floor = null means all floors combined)
            $summaryQuery->whereNull('floor');
        }
        
        $hourlyDataRaw = $summaryQuery
            ->select('hour', 'avg_current', 'total_energy', 'max_current', 'max_energy')
            ->orderBy('hour', 'asc')
            ->get();
        
        // Convert to collection format matching EnergyData structure
        $hourlyData = $hourlyDataRaw->map(function($item) {
            return (object)[
                'hour' => (int)$item->hour,
                'avg_current' => (float)$item->avg_current,
                'total_energy' => (float)$item->total_energy,
                'max_current' => (float)$item->max_current,
                'max_energy' => (float)$item->max_energy,
            ];
        });
        
        // Fallback to raw query ONLY if summary table is completely empty (first time)
        if ($hourlyData->isEmpty() && $date) {
            $hourlyData = (clone $query)
                ->selectRaw('
                    hour,
                    AVG(current_a) as avg_current,
                    SUM(energy_wh) as total_energy,
                    MAX(current_a) as max_current,
                    MAX(energy_wh) as max_energy
                ')
                ->groupBy('hour')
                ->orderBy('hour', 'asc')
                ->get();
        }

        // Find peak hour
        $peakHour = $hourlyData->sortByDesc('total_energy')->first();

        // Format peak hour with full date/time in 12-hour format
        $formattedPeakHour = null;
        $formattedPeakDateTime = null;
        
        if ($peakHour && $peakHour->hour !== null) {
            $peakHourValue = $peakHour->hour;
            
            // Determine the date for peak hour
            $peakDate = $date;
            if ($timeGranularity === 'week' && $weekday && $weekday !== 'all') {
                // Find first matching date for the weekday
                $weekdayMap = [
                    'sunday' => 0,
                    'monday' => 1,
                    'tuesday' => 2,
                    'wednesday' => 3,
                    'thursday' => 4,
                    'friday' => 5,
                    'saturday' => 6
                ];
                $dayNumber = $weekdayMap[$weekday] ?? null;
                if ($dayNumber !== null) {
                    $peakDate = EnergyData::whereRaw("CAST(strftime('%w', date) AS INTEGER) = ?", [$dayNumber])
                        ->min('date');
                }
            }
            
            if ($peakDate) {
                // Create datetime string for peak hour
                $peakDateTime = $peakDate . ' ' . str_pad($peakHourValue, 2, '0', STR_PAD_LEFT) . ':00:00';
                $timestamp = strtotime($peakDateTime);
                
                if ($timestamp) {
                    // Format: "Monday, January 6, 2026 at 02:00 PM"
                    $formattedPeakDateTime = date('l, F j, Y \a\t g:i A', $timestamp);
                    $formattedPeakHour = date('g:i A', $timestamp);
                }
            }
        }

        return response()->json([
            'date' => $date,
            'hourly_data' => $hourlyData,
            'peak_hour' => [
                'hour' => $peakHour->hour ?? null,
                'avg_current' => round($peakHour->avg_current ?? 0, 2),
                'total_energy' => round($peakHour->total_energy ?? 0, 2),
                'formatted_time' => $formattedPeakHour,
                'formatted_datetime' => $formattedPeakDateTime,
            ],
        ]);
    }

    /**
     * Get weekly peak hours pattern
     * Analyzes peak consumption by weekday across all available dates
     */
    public function getWeeklyPeakHours(Request $request)
    {
        date_default_timezone_set('Asia/Manila');
        
        $floor = $request->input('floor');
        
        $weekdayMap = [
            'sunday' => 0,
            'monday' => 1,
            'tuesday' => 2,
            'wednesday' => 3,
            'thursday' => 4,
            'friday' => 5,
            'saturday' => 6
        ];
        
        $weeklyPeaks = [];
        
        foreach ($weekdayMap as $weekdayName => $dayNumber) {
            $query = EnergyData::query();
            
            // Apply floor filter if provided
            if ($floor && $floor !== 'all') {
                $query->where('floor', $floor);
            }
            
            // Filter by weekday
            $query->whereRaw("CAST(strftime('%w', date) AS INTEGER) = ?", [$dayNumber]);
            
            // Get hourly data for this weekday
            $hourlyData = (clone $query)
                ->selectRaw('
                    hour,
                    AVG(current_a) as avg_current,
                    SUM(energy_wh) as total_energy
                ')
                ->groupBy('hour')
                ->orderBy('hour', 'asc')
                ->get();
            
            // Find peak hour for this weekday
            $peakHour = $hourlyData->sortByDesc('total_energy')->first();
            
            if ($peakHour && $peakHour->hour !== null) {
                // Get a sample date for this weekday
                $sampleDate = EnergyData::whereRaw("CAST(strftime('%w', date) AS INTEGER) = ?", [$dayNumber])
                    ->when($floor && $floor !== 'all', function($q) use ($floor) {
                        return $q->where('floor', $floor);
                    })
                    ->min('date');
                
                $formattedTime = null;
                if ($sampleDate) {
                    $peakDateTime = $sampleDate . ' ' . str_pad($peakHour->hour, 2, '0', STR_PAD_LEFT) . ':00:00';
                    $timestamp = strtotime($peakDateTime);
                    if ($timestamp) {
                        $formattedTime = date('g:i A', $timestamp);
                    }
                }
                
                $weeklyPeaks[] = [
                    'weekday' => $weekdayName,
                    'day_number' => $dayNumber,
                    'peak_hour' => $peakHour->hour,
                    'formatted_time' => $formattedTime,
                    'total_energy' => round($peakHour->total_energy ?? 0, 2),
                    'avg_current' => round($peakHour->avg_current ?? 0, 2),
                ];
            }
        }
        
        return response()->json([
            'weekly_peak_hours' => $weeklyPeaks,
        ]);
    }

    /**
     * Get floor-level analytics
     * Returns floor-level insights: peak hours, consumption trends, efficiency metrics
     */
    public function getFloorAnalytics(Request $request)
    {
        date_default_timezone_set('Asia/Manila');
        
        $floor = $request->input('floor');
        $timeGranularity = $request->input('timeGranularity', 'day');
        $weekday = $request->input('weekday', 'all');
        
        // Get all floors or specific floor
        $floors = [];
        if ($floor && $floor !== 'all') {
            $floors = [(int)$floor];
        } else {
            $floors = EnergyData::select('floor')
                ->distinct()
                ->whereNotNull('floor')
                ->pluck('floor')
                ->toArray();
        }
        
        $floorAnalytics = [];
        
        foreach ($floors as $floorId) {
            $query = EnergyData::where('floor', $floorId);
            
            // Apply time granularity and weekday filters
            if ($timeGranularity === 'week' && $weekday && $weekday !== 'all') {
                $weekdayMap = [
                    'sunday' => 0,
                    'monday' => 1,
                    'tuesday' => 2,
                    'wednesday' => 3,
                    'thursday' => 4,
                    'friday' => 5,
                    'saturday' => 6
                ];
                $dayNumber = $weekdayMap[$weekday] ?? null;
                if ($dayNumber !== null) {
                    $query->whereRaw("CAST(strftime('%w', date) AS INTEGER) = ?", [$dayNumber]);
                }
            }
            
            // Calculate metrics
            $totalEnergy = (float) (clone $query)->sum('energy_wh');
            $totalRecords = (clone $query)->count();
            $avgEnergy = $totalRecords > 0 ? $totalEnergy / $totalRecords : 0;
            
            // Get peak hour
            $hourlyData = (clone $query)
                ->selectRaw('
                    hour,
                    SUM(energy_wh) as total_energy
                ')
                ->groupBy('hour')
                ->orderBy('hour', 'asc')
                ->get();
            
            $peakHour = $hourlyData->sortByDesc('total_energy')->first();
            
            // Get consumption trend (daily if available)
            $dailyTrend = (clone $query)
                ->selectRaw('
                    date,
                    SUM(energy_wh) as total_energy
                ')
                ->groupBy('date')
                ->orderBy('date', 'asc')
                ->get()
                ->map(function($item) {
                    return [
                        'date' => $item->date,
                        'total_energy' => round((float)$item->total_energy, 2),
                    ];
                });
            
            // Calculate cost (assuming 10 PHP per kWh)
            $totalCost = ($totalEnergy / 1000) * 10;
            
            $floorAnalytics[] = [
                'floor' => $floorId,
                'total_energy' => round($totalEnergy, 2),
                'total_energy_kwh' => round($totalEnergy / 1000, 2),
                'total_cost' => round($totalCost, 2),
                'total_records' => $totalRecords,
                'avg_energy_per_record' => round($avgEnergy, 5),
                'peak_hour' => $peakHour ? [
                    'hour' => $peakHour->hour,
                    'total_energy' => round((float)$peakHour->total_energy, 2),
                ] : null,
                'daily_trend' => $dailyTrend,
            ];
        }
        
        return response()->json([
            'floor_analytics' => $floorAnalytics,
        ]);
    }

    /**
     * Get minute-by-minute data for a specific hour
     */
    public function getMinuteData(Request $request)
    {
        $date = $request->input('date', EnergyData::min('date'));
        $hour = $request->input('hour', 0);

        $minuteData = EnergyData::selectRaw('
                minute,
                AVG(current_a) as avg_current,
                SUM(energy_wh) as total_energy,
                COUNT(*) as count
            ')
            ->where('date', $date)
            ->where('hour', $hour)
            ->groupBy('minute')
            ->orderBy('minute', 'asc')
            ->get();

        return response()->json([
            'date' => $date,
            'hour' => $hour,
            'minute_data' => $minuteData,
        ]);
    }

    /**
     * Get available dates
     */
    public function getAvailableDates()
    {
        $dates = EnergyData::select('date')
            ->distinct()
            ->orderBy('date', 'asc')
            ->pluck('date');

        return response()->json([
            'dates' => $dates,
        ]);
    }

    /**
     * API endpoint for summary (kept for backward compatibility)
     */
    public function summary(Request $request)
    {
        $dailyConsumption = EnergyData::selectRaw('date, SUM(energy_wh) as total_energy')
            ->groupBy('date')
            ->orderBy('date', 'asc')
            ->get();

        $peakPower = EnergyData::max('power_w');
        $avgVoltage = EnergyData::avg('voltage_v');
        $avgCurrent = EnergyData::avg('current_a');

        return response()->json([
            'daily_consumption' => $dailyConsumption,
            'peak_power' => $peakPower,
            'average_voltage' => $avgVoltage,
            'average_current' => $avgCurrent,
        ]);
    }
}
