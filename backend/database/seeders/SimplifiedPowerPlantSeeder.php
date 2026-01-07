<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Branch;
use App\Models\Building;
use App\Models\Floor;
use App\Models\Unit;
use Illuminate\Support\Facades\DB;

class SimplifiedPowerPlantSeeder extends Seeder
{
    /**
     * Create simplified structure: One Branch → One Building → Three Floors
     * Matching the CSV data structure (Floor1, Floor2, Floor3)
     */
    public function run(): void
    {
        DB::transaction(function () {
            // Clear existing data
            $this->command->info("Clearing existing power plant structure data...");
            Unit::truncate();
            Floor::truncate();
            Building::truncate();
            Branch::truncate();

            // Create One Branch
            $this->command->info("Creating branch...");
            $branch = Branch::create([
                'id' => 1,
                'name' => 'Laguna Power Plant',
                'location' => 'Laguna, Philippines',
                'type' => 'main',
                'description' => 'Main power generation facility'
            ]);

            // Create One Building
            $this->command->info("Creating building...");
            $building = Building::create([
                'id' => 1,
                'branch_id' => 1,
                'name' => 'Main Power Plant Building',
                'type' => 'production',
                'total_floors' => 3,
                'area' => 5000
            ]);

            // Create Three Floors (matching CSV Floor1, Floor2, Floor3)
            $this->command->info("Creating floors...");
            $floors = [
                [
                    'id' => 1,
                    'building_id' => 1,
                    'floor_number' => 1,
                    'name' => 'Floor 1',
                    'area' => 1666.67,
                    'unit_count' => 0 // Will be updated after units are created
                ],
                [
                    'id' => 2,
                    'building_id' => 1,
                    'floor_number' => 2,
                    'name' => 'Floor 2',
                    'area' => 1666.67,
                    'unit_count' => 0
                ],
                [
                    'id' => 3,
                    'building_id' => 1,
                    'floor_number' => 3,
                    'name' => 'Floor 3',
                    'area' => 1666.67,
                    'unit_count' => 0
                ],
            ];

            foreach ($floors as $floorData) {
                Floor::create($floorData);
            }

            // Create Units for each floor based on energy consumption patterns
            // We'll create representative units based on the actual energy data
            $this->command->info("Creating units based on energy data patterns...");
            
            // Get energy statistics per floor to create realistic units
            $floorStats = DB::table('energy_data')
                ->select('floor', 
                    DB::raw('AVG(power_w) as avg_power'),
                    DB::raw('AVG(current_a) as avg_current'),
                    DB::raw('AVG(voltage_v) as avg_voltage'),
                    DB::raw('SUM(energy_wh) as total_energy')
                )
                ->whereIn('floor', [1, 2, 3])
                ->groupBy('floor')
                ->get();

            $unitId = 1;
            foreach ($floors as $floor) {
                $floorStat = $floorStats->firstWhere('floor', $floor['floor_number']);
                
                if ($floorStat) {
                    // Create 5-8 representative units per floor based on energy patterns
                    $unitCount = 6; // Average units per floor
                    $avgPowerPerUnit = $floorStat->avg_power / $unitCount;
                    $avgEnergyPerUnit = ($floorStat->total_energy / 691200) / $unitCount; // Per second average
                    
                    $unitTypes = ['HVAC', 'Lighting', 'Equipment', 'Control Systems', 'Monitoring', 'Auxiliary'];
                    
                    for ($i = 1; $i <= $unitCount; $i++) {
                        $unitType = $unitTypes[($i - 1) % count($unitTypes)];
                        $consumption = ($avgEnergyPerUnit * 3600) / 1000; // Convert to kWh (approximate)
                        $cost = $consumption * 10; // PHP per kWh (approximate)
                        
                        Unit::create([
                            'id' => $unitId++,
                            'floor_id' => $floor['id'],
                            'name' => "{$unitType} Unit {$i}",
                            'equipment_type' => $unitType,
                            'consumption' => round($consumption, 2),
                            'cost' => round($cost, 2),
                            'status' => 'operational',
                            'peak_time' => $this->getPeakTime($i)
                        ]);
                    }
                    
                    // Update floor unit count
                    Floor::where('id', $floor['id'])->update(['unit_count' => $unitCount]);
                }
            }

            $this->command->info("Simplified power plant structure created successfully!");
            $this->command->info("Branch: " . Branch::count());
            $this->command->info("Building: " . Building::count());
            $this->command->info("Floors: " . Floor::count());
            $this->command->info("Units: " . Unit::count());
        });
    }

    private function getPeakTime($index): string
    {
        $times = ['8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM'];
        return $times[($index - 1) % count($times)];
    }
}

