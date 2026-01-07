<?php

namespace App\Http\Controllers;

use App\Models\EnergyData;
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
     * Get summary statistics for a selected date.
     * If no date is provided, uses the earliest available date.
     */
    public function getSummary(Request $request)
    {
        $date = $request->query('date');
        if (!$date) {
            $date = EnergyData::min('date');
        }

        if (!$date) {
            return response()->json([
                'date' => null,
                'per_second' => ['avg_current' => 0, 'avg_energy' => 0, 'count' => 0],
                'per_minute' => ['avg_current' => 0, 'avg_energy' => 0, 'count' => 0],
                'per_hour' => ['avg_current' => 0, 'avg_energy' => 0, 'count' => 0],
                'per_day' => ['avg_current' => 0, 'total_energy' => 0],
                'total_records' => 0,
            ]);
        }

        // Base facts for the selected day
        $totalRecords = EnergyData::where('date', $date)->count();
        $avgCurrentDay = (float) EnergyData::where('date', $date)->avg('current_a');
        $totalEnergyDay = (float) EnergyData::where('date', $date)->sum('energy_wh');

        // Per-minute groups for the selected day
        $minuteGroups = EnergyData::selectRaw('minute, AVG(current_a) as avg_current, SUM(energy_wh) as total_energy')
            ->where('date', $date)
            ->groupBy('minute')
            ->orderBy('minute', 'asc')
            ->get();
        $minuteCount = max(1, $minuteGroups->count());
        $avgCurrentPerMinute = (float) ($minuteGroups->avg('avg_current') ?? $avgCurrentDay);

        // Per-hour groups for the selected day
        $hourGroups = EnergyData::selectRaw('hour, AVG(current_a) as avg_current, SUM(energy_wh) as total_energy')
            ->where('date', $date)
            ->groupBy('hour')
            ->orderBy('hour', 'asc')
            ->get();
        $hourCount = max(1, $hourGroups->count());
        $avgCurrentPerHour = (float) ($hourGroups->avg('avg_current') ?? $avgCurrentDay);

        // Derived averages for energy per period (not totals duplicated)
        $avgEnergyPerSecond = $totalRecords > 0 ? $totalEnergyDay / $totalRecords : 0.0; // Wh per sample/second
        $avgEnergyPerMinute = $totalEnergyDay / $minuteCount; // Wh per minute
        $avgEnergyPerHour = $totalEnergyDay / $hourCount;     // Wh per hour observed

        return response()->json([
            'date' => $date,
            'per_second' => [
                'avg_current' => round($avgCurrentDay, 2),
                'avg_energy' => round($avgEnergyPerSecond, 5), // Wh/s (per-sample)
                'count' => $totalRecords,
            ],
            'per_minute' => [
                'avg_current' => round($avgCurrentPerMinute, 2),
                'avg_energy' => round($avgEnergyPerMinute, 2), // Wh/min
                'count' => $minuteCount,
            ],
            'per_hour' => [
                'avg_current' => round($avgCurrentPerHour, 2),
                'avg_energy' => round($avgEnergyPerHour, 2), // Wh/h
                'count' => $hourCount,
            ],
            'per_day' => [
                'avg_current' => round($avgCurrentDay, 2),
                'total_energy' => round($totalEnergyDay, 2), // Wh for the selected day only
            ],
            'total_records' => $totalRecords,
        ]);
    }

    /**
     * Get hourly data for a specific day
     */
    public function getHourlyData(Request $request)
    {
        $date = $request->input('date', EnergyData::min('date'));

        $hourlyData = EnergyData::selectRaw('
                hour,
                AVG(current_a) as avg_current,
                SUM(energy_wh) as total_energy,
                MAX(current_a) as max_current,
                MAX(energy_wh) as max_energy
            ')
            ->where('date', $date)
            ->groupBy('hour')
            ->orderBy('hour', 'asc')
            ->get();

        // Find peak hour
        $peakHour = $hourlyData->sortByDesc('total_energy')->first();

        return response()->json([
            'date' => $date,
            'hourly_data' => $hourlyData,
            'peak_hour' => [
                'hour' => $peakHour->hour ?? null,
                'avg_current' => round($peakHour->avg_current ?? 0, 2),
                'total_energy' => round($peakHour->total_energy ?? 0, 2),
            ],
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
