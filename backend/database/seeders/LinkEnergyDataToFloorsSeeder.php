<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\EnergyData;
use App\Models\Floor;
use Illuminate\Support\Facades\DB;

class LinkEnergyDataToFloorsSeeder extends Seeder
{
    /**
     * Link energy_data records to floors based on the floor column.
     * 
     * Mapping:
     * - CSV Floor 1 → Floor ID 1 (Ground Floor of Administrative Building)
     * - CSV Floor 2 → Floor ID 4 (Turbine Floor of Production Hall A)
     * - CSV Floor 3 → Floor ID 6 (Turbine Floor of Production Hall B)
     */
    public function run(): void
    {
        $this->command->info("Linking energy_data to floors...");
        
        // Map CSV floor numbers to database floor IDs (simplified: direct mapping)
        $floorMapping = [
            1 => 1, // CSV Floor 1 → Database Floor ID 1
            2 => 2, // CSV Floor 2 → Database Floor ID 2
            3 => 3, // CSV Floor 3 → Database Floor ID 3
        ];
        
        $totalUpdated = 0;
        
        foreach ($floorMapping as $csvFloor => $dbFloorId) {
            // Verify floor exists
            $floor = Floor::find($dbFloorId);
            if (!$floor) {
                $this->command->warn("Floor ID {$dbFloorId} not found, skipping...");
                continue;
            }
            
            // Update energy_data records
            $updated = EnergyData::where('floor', $csvFloor)
                ->whereNull('floor_id')
                ->update(['floor_id' => $dbFloorId]);
            
            $totalUpdated += $updated;
            $this->command->info("Linked {$updated} records from CSV Floor {$csvFloor} to Floor ID {$dbFloorId} ({$floor->name})");
        }
        
        $this->command->info("Total records linked: {$totalUpdated}");
        
        // Show summary
        $unlinked = EnergyData::whereNull('floor_id')->count();
        if ($unlinked > 0) {
            $this->command->warn("{$unlinked} records remain unlinked (may have NULL floor values)");
        }
    }
}

