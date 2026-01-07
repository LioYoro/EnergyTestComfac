<?php

namespace App\Http\Controllers;

use App\Models\EnergyData;
use Illuminate\Http\Request;

class EnergyDataController extends Controller
{
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
