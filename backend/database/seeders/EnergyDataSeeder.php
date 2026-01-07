<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\EnergyData;

class EnergyDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
{
    for ($i = 0; $i < 500; $i++) {
        EnergyData::create([
            'date' => now()->subDays(rand(0,30))->toDateString(),
            'hour' => rand(0,23),
            'minute' => rand(0,59),
            'second' => rand(0,59),
            'timestamp' => now()->subMinutes(rand(0,1440)),
            'voltage_v' => rand(210,240),
            'current_a' => rand(1,10),
            'power_w' => rand(100,2400),
            'energy_wh' => rand(1,2400),
        ]);
    }
}
}
