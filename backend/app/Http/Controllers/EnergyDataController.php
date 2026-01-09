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
            
            // Calculate correct counts: distinct hours and minutes
            // Use COUNT(DISTINCT) for accurate results (distinct()->count() doesn't work correctly in SQLite)
            $hourCount = (int) (clone $query)->selectRaw('COUNT(DISTINCT hour) as cnt')->value('cnt');
            $minuteCount = (int) (clone $query)->selectRaw('COUNT(DISTINCT minute) as cnt')->value('cnt');
            
            // Use stored averages if available, otherwise calculate
            $avgCurrentPerMinute = (float) $dailySummary->avg_current_per_minute;
            $avgCurrentPerHour = (float) $dailySummary->avg_current_per_hour;
            
            // Ensure counts are valid (at least 1)
            $hourCount = max(1, $hourCount);
            $minuteCount = max(1, $minuteCount);
            
            // Derived averages
            $avgEnergyPerSecond = $totalRecords > 0 ? $totalEnergyDay / $totalRecords : 0.0;
            $avgEnergyPerMinute = $minuteCount > 0 ? $totalEnergyDay / $minuteCount : 0.0;
            $avgEnergyPerHour = $hourCount > 0 ? $totalEnergyDay / $hourCount : 0.0;
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
     * Get hourly data with filters.
     * Properly handles: date, floor, timeGranularity, weekday
     * Returns aggregated hourly data and accurate peak hour
     */
    public function getHourlyData(Request $request)
    {
        date_default_timezone_set('Asia/Manila');
        
        $date = $request->input('date');
        $floor = $request->input('floor');
        $timeGranularity = $request->input('timeGranularity', 'day');
        $weekday = $request->input('weekday', 'all');

        // Determine which dates to query based on filters
        $datesToQuery = [];

        if ($timeGranularity === 'week' && $weekday && $weekday !== 'all') {
            // For week view with specific weekday, get all matching weekdays
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
                $datesToQuery = EnergyData::whereRaw("CAST(strftime('%w', date) AS INTEGER) = ?", [$dayNumber])
                    ->distinct()
                    ->pluck('date')
                    ->toArray();
            }
        } elseif ($date) {
            // Single date query
            $datesToQuery = [$date];
        } else {
            // No date specified, get first available date
            $firstRecord = DailySummary::select('date')->orderBy('date', 'asc')->limit(1)->first();
            if ($firstRecord) {
                $datesToQuery = [$firstRecord->date];
                $date = $firstRecord->date; // Set for response
            }
        }

        // If no dates found, return empty response
        if (empty($datesToQuery)) {
            return response()->json([
                'date' => $date,
                'hourly_data' => [],
                'peak_hour' => [
                    'hour' => null,
                    'avg_current' => 0,
                    'total_energy' => 0,
                    'formatted_time' => null,
                    'formatted_datetime' => null,
                ],
            ]);
        }

        // Query hourly_summary table for fast results
        // For single date, use summary table directly
        // For multiple dates, we need to aggregate properly
        if (count($datesToQuery) === 1) {
            // Single date - use summary table directly
            $summaryQuery = DB::table('hourly_summary')
                ->where('date', $datesToQuery[0]);
            
            // Apply floor filter
        if ($floor && $floor !== 'all') {
            $summaryQuery->where('floor', $floor);
        } else {
            // Get aggregated data for all floors (floor = null means all floors combined)
            $summaryQuery->whereNull('floor');
        }
        
        $hourlyDataRaw = $summaryQuery
                ->selectRaw('
                    hour,
                    avg_current,
                    total_energy,
                    max_current,
                    max_energy
                ')
                ->orderBy('hour', 'asc')
                ->get();
        } else {
            // Multiple dates - aggregate from raw data to ensure accuracy
            $query = EnergyData::whereIn('date', $datesToQuery);
            
            if ($floor && $floor !== 'all') {
                $query->where('floor', $floor);
            }
            
            $hourlyDataRaw = $query
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
        
        // Convert to collection format
        $hourlyData = $hourlyDataRaw->map(function($item) {
            return (object)[
                'hour' => (int)$item->hour,
                'avg_current' => (float)$item->avg_current,
                'total_energy' => (float)$item->total_energy,
                'max_current' => (float)$item->max_current,
                'max_energy' => (float)$item->max_energy,
            ];
        });
        
        // Fallback to raw query if summary table is empty
        if ($hourlyData->isEmpty() && !empty($datesToQuery)) {
            $query = EnergyData::whereIn('date', $datesToQuery);
            
            if ($floor && $floor !== 'all') {
                $query->where('floor', $floor);
            }
            
            $hourlyData = $query
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

        // Find peak hour (hour with highest total_energy)
        $peakHour = $hourlyData->sortByDesc('total_energy')->first();

        // Format peak hour with full date/time
        $formattedPeakHour = null;
        $formattedPeakDateTime = null;
        
        if ($peakHour && $peakHour->hour !== null) {
            $peakHourValue = $peakHour->hour;
            
            // Determine the date for peak hour display
            // Use the first date from datesToQuery, or the specific date
            $peakDate = $date ?? ($datesToQuery[0] ?? null);
            
            // If week view with weekday, find the actual date where peak occurred
            if ($timeGranularity === 'week' && $weekday && $weekday !== 'all' && !empty($datesToQuery)) {
                // Find the date where this hour had the highest energy for this weekday
                $peakDateQuery = DB::table('hourly_summary')
                    ->whereIn('date', $datesToQuery)
                    ->where('hour', $peakHourValue);
                
                if ($floor && $floor !== 'all') {
                    $peakDateQuery->where('floor', $floor);
                } else {
                    $peakDateQuery->whereNull('floor');
                }
                
                $peakDateRecord = $peakDateQuery
                    ->orderBy('total_energy', 'desc')
                    ->first();
                
                if ($peakDateRecord) {
                    $peakDate = $peakDateRecord->date;
                } else {
                    $peakDate = $datesToQuery[0];
                }
            }
            
            if ($peakDate) {
                // Create datetime string for peak hour
                $peakDateTime = $peakDate . ' ' . str_pad($peakHourValue, 2, '0', STR_PAD_LEFT) . ':00:00';
                $timestamp = strtotime($peakDateTime);
                
                if ($timestamp) {
                    // Format: "Thursday, January 8, 2026 at 5:00 PM"
                    $formattedPeakDateTime = date('l, F j, Y \a\t g:i A', $timestamp);
                    $formattedPeakHour = date('g:i A', $timestamp);
                }
            }
        }

        return response()->json([
            'date' => $date ?? ($datesToQuery[0] ?? null),
            'hourly_data' => $hourlyData->values(), // Reset array keys
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
        // Filter out Floor 0 (doesn't exist) - only include valid floors (1, 2, 3, etc.)
        $floors = [];
        if ($floor && $floor !== 'all') {
            $floorId = (int)$floor;
            // Only add if it's a valid floor (greater than 0)
            if ($floorId > 0) {
                $floors = [$floorId];
            }
        } else {
            $floors = EnergyData::select('floor')
                ->distinct()
                ->whereNotNull('floor')
                ->where('floor', '>', 0) // Exclude Floor 0
                ->orderBy('floor', 'asc') // Order by floor number to ensure consistent results
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
     * Get consumption by equipment type from real database data
     * Accepts filters: date, floor, timeGranularity, weekday
     */
    public function getConsumptionByEquipmentType(Request $request)
    {
        date_default_timezone_set('Asia/Manila');
        
        $date = $request->input('date');
        $floor = $request->input('floor');
        $timeGranularity = $request->input('timeGranularity', 'day');
        $weekday = $request->input('weekday', 'all');

        // Build query with filters
        $query = EnergyData::query();

        // Apply date filter
        if ($timeGranularity === 'week' && $weekday && $weekday !== 'all') {
            $weekdayMap = [
                'sunday' => 0, 'monday' => 1, 'tuesday' => 2, 'wednesday' => 3,
                'thursday' => 4, 'friday' => 5, 'saturday' => 6
            ];
            $dayNumber = $weekdayMap[$weekday] ?? null;
            if ($dayNumber !== null) {
                $query->whereRaw("CAST(strftime('%w', date) AS INTEGER) = ?", [$dayNumber]);
            }
        } elseif ($date) {
            $query->where('date', $date);
        }

        // Apply floor filter
        if ($floor && $floor !== 'all') {
            $query->where('floor', $floor);
        }

        // Get total energy consumption (in kWh)
        $totalEnergy = (float) (clone $query)->sum('energy_wh') / 1000;

        // For now, return total consumption
        // Equipment type breakdown would require a units table with equipment types
        // This is a placeholder - you may need to join with units table if available
        return response()->json([
            'total_consumption_kwh' => round($totalEnergy, 2),
            'consumption_by_type' => [
                // This would need to be calculated from units table if available
                // For now, return total as single category
            ]
        ]);
    }

    /**
     * Get floor metrics from real database data
     * Returns consumption, cost, unit count for each floor
     */
    public function getFloorMetrics(Request $request)
    {
        date_default_timezone_set('Asia/Manila');
        
        $date = $request->input('date');
        $timeGranularity = $request->input('timeGranularity', 'day');
        $weekday = $request->input('weekday', 'all');

        // Get all floors - exclude Floor 0 (doesn't exist)
        $floors = EnergyData::select('floor')
            ->distinct()
            ->whereNotNull('floor')
            ->where('floor', '>', 0) // Exclude Floor 0
            ->orderBy('floor', 'asc')
            ->pluck('floor');

        $floorMetrics = [];

        foreach ($floors as $floorId) {
            $query = EnergyData::where('floor', $floorId);

            // Apply date filter
            if ($timeGranularity === 'week' && $weekday && $weekday !== 'all') {
                $weekdayMap = [
                    'sunday' => 0, 'monday' => 1, 'tuesday' => 2, 'wednesday' => 3,
                    'thursday' => 4, 'friday' => 5, 'saturday' => 6
                ];
                $dayNumber = $weekdayMap[$weekday] ?? null;
                if ($dayNumber !== null) {
                    $query->whereRaw("CAST(strftime('%w', date) AS INTEGER) = ?", [$dayNumber]);
                }
            } elseif ($date) {
                $query->where('date', $date);
            }

            // Calculate metrics from real data
            $totalEnergy = (float) (clone $query)->sum('energy_wh') / 1000; // Convert to kWh
            $totalCost = $totalEnergy * 10; // PHP 10 per kWh
            $totalRecords = (clone $query)->count();
            $avgCurrent = (float) (clone $query)->avg('current_a');

            // Estimate unit count (this is approximate - would need actual units table)
            // For now, use a reasonable estimate based on data points
            $estimatedUnits = max(1, (int)($totalRecords / 86400)); // Rough estimate: records per day / seconds per day

            $floorMetrics[] = [
                'floor_id' => $floorId,
                'floor_name' => "Floor {$floorId}",
                'total_consumption_kwh' => round($totalEnergy, 2),
                'total_cost' => round($totalCost, 2),
                'total_units' => $estimatedUnits,
                'avg_current' => round($avgCurrent, 2),
                'total_records' => $totalRecords
            ];
        }

        return response()->json([
            'floor_metrics' => $floorMetrics
        ]);
    }

    /**
     * Get building metrics from real database data
     */
    public function getBuildingMetrics(Request $request)
    {
        date_default_timezone_set('Asia/Manila');
        
        $date = $request->input('date');
        $timeGranularity = $request->input('timeGranularity', 'day');
        $weekday = $request->input('weekday', 'all');

        // Since we only have floor data, aggregate all floors as one building
        $query = EnergyData::query();

        // Apply date filter
        if ($timeGranularity === 'week' && $weekday && $weekday !== 'all') {
            $weekdayMap = [
                'sunday' => 0, 'monday' => 1, 'tuesday' => 2, 'wednesday' => 3,
                'thursday' => 4, 'friday' => 5, 'saturday' => 6
            ];
            $dayNumber = $weekdayMap[$weekday] ?? null;
            if ($dayNumber !== null) {
                $query->whereRaw("CAST(strftime('%w', date) AS INTEGER) = ?", [$dayNumber]);
            }
        } elseif ($date) {
            $query->where('date', $date);
        }

        $totalEnergy = (float) (clone $query)->sum('energy_wh') / 1000;
        $totalCost = $totalEnergy * 10;
        $totalRecords = (clone $query)->count();
        $estimatedUnits = max(1, (int)($totalRecords / 86400));

        return response()->json([
            'building_metrics' => [[
                'building_id' => 1,
                'building_name' => 'Main Building',
                'total_consumption_kwh' => round($totalEnergy, 2),
                'total_cost' => round($totalCost, 2),
                'total_units' => $estimatedUnits,
                'total_floors' => EnergyData::select('floor')->distinct()->whereNotNull('floor')->count()
            ]]
        ]);
    }

    /**
     * Get branch metrics from real database data
     */
    public function getBranchMetrics(Request $request)
    {
        date_default_timezone_set('Asia/Manila');
        
        $date = $request->input('date');
        $timeGranularity = $request->input('timeGranularity', 'day');
        $weekday = $request->input('weekday', 'all');

        // Since we only have one location, aggregate all as one branch
        $query = EnergyData::query();

        // Apply date filter
        if ($timeGranularity === 'week' && $weekday && $weekday !== 'all') {
            $weekdayMap = [
                'sunday' => 0, 'monday' => 1, 'tuesday' => 2, 'wednesday' => 3,
                'thursday' => 4, 'friday' => 5, 'saturday' => 6
            ];
            $dayNumber = $weekdayMap[$weekday] ?? null;
            if ($dayNumber !== null) {
                $query->whereRaw("CAST(strftime('%w', date) AS INTEGER) = ?", [$dayNumber]);
            }
        } elseif ($date) {
            $query->where('date', $date);
        }

        $totalEnergy = (float) (clone $query)->sum('energy_wh') / 1000;
        $totalCost = $totalEnergy * 10;
        $totalRecords = (clone $query)->count();
        $estimatedUnits = max(1, (int)($totalRecords / 86400));

        return response()->json([
            'branch_metrics' => [[
                'branch_id' => 1,
                'branch_name' => 'Main Branch',
                'total_consumption_kwh' => round($totalEnergy, 2),
                'total_cost' => round($totalCost, 2),
                'total_units' => $estimatedUnits,
                'total_buildings' => 1,
                'total_floors' => EnergyData::select('floor')->distinct()->whereNotNull('floor')->count()
            ]]
        ]);
    }

    /**
     * Get top consuming units from real database data
     * Returns top N units based on actual energy consumption
     */
    public function getTopConsumingUnits(Request $request)
    {
        date_default_timezone_set('Asia/Manila');
        
        $date = $request->input('date');
        $floor = $request->input('floor');
        $timeGranularity = $request->input('timeGranularity', 'day');
        $weekday = $request->input('weekday', 'all');
        $limit = (int) $request->input('limit', 5);

        // Build query
        $query = EnergyData::query();

        // Apply date filter
        if ($timeGranularity === 'week' && $weekday && $weekday !== 'all') {
            $weekdayMap = [
                'sunday' => 0, 'monday' => 1, 'tuesday' => 2, 'wednesday' => 3,
                'thursday' => 4, 'friday' => 5, 'saturday' => 6
            ];
            $dayNumber = $weekdayMap[$weekday] ?? null;
            if ($dayNumber !== null) {
                $query->whereRaw("CAST(strftime('%w', date) AS INTEGER) = ?", [$dayNumber]);
            }
        } elseif ($date) {
            $query->where('date', $date);
        }

        // Apply floor filter
        if ($floor && $floor !== 'all') {
            $query->where('floor', $floor);
        }

        // Group by floor and calculate consumption
        // Since we don't have individual unit IDs in energy_data, we'll group by floor
        // Filter out Floor 0 (doesn't exist) and only include valid floors (1, 2, 3, etc.)
        $topFloors = (clone $query)
            ->selectRaw('
                floor,
                SUM(energy_wh) as total_energy_wh,
                AVG(current_a) as avg_current,
                COUNT(*) as record_count
            ')
            ->whereNotNull('floor')
            ->where('floor', '>', 0) // Exclude Floor 0
            ->groupBy('floor')
            ->orderBy('total_energy_wh', 'desc')
            ->limit($limit)
            ->get();

        $topUnits = $topFloors->map(function($floor, $index) {
            return [
                'id' => $floor->floor,
                'name' => "Floor {$floor->floor} Aggregated",
                'floor_id' => $floor->floor,
                'floor_name' => "Floor {$floor->floor}",
                'consumption' => round($floor->total_energy_wh / 1000, 2), // kWh
                'cost' => round(($floor->total_energy_wh / 1000) * 10, 2), // PHP
                'avg_current' => round($floor->avg_current, 2),
                'record_count' => $floor->record_count
            ];
        });

        return response()->json([
            'top_units' => $topUnits
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
