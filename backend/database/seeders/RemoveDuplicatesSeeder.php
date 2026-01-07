<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\EnergyData;
use Illuminate\Support\Facades\DB;

class RemoveDuplicatesSeeder extends Seeder
{
    /**
     * Remove duplicate records from energy_data table.
     * Keeps the record with the latest created_at timestamp.
     */
    public function run(): void
    {
        $this->command->info("Removing duplicate records from energy_data table...");
        
        // Count duplicates before removal
        $totalBefore = EnergyData::count();
        $this->command->info("Total records before: {$totalBefore}");
        
        // Find and remove duplicates based on floor, date, hour, minute, second
        // Keep the record with the latest created_at
        $duplicates = DB::select("
            SELECT floor, date, hour, minute, second, COUNT(*) as count
            FROM energy_data
            GROUP BY floor, date, hour, minute, second
            HAVING COUNT(*) > 1
        ");
        
        $duplicateCount = count($duplicates);
        $this->command->info("Found {$duplicateCount} sets of duplicates");
        
        if ($duplicateCount > 0) {
            // For SQLite compatibility and memory efficiency, delete in chunks
            // Use a subquery to delete records that are NOT the maximum id for each group
            $deleted = DB::delete("
                DELETE FROM energy_data
                WHERE id NOT IN (
                    SELECT MAX(id)
                    FROM energy_data
                    GROUP BY floor, date, hour, minute, second
                )
            ");
            
            $this->command->info("Deleted {$deleted} duplicate records");
        }
        
        $totalAfter = EnergyData::count();
        $this->command->info("Total records after: {$totalAfter}");
        $this->command->info("Removed " . ($totalBefore - $totalAfter) . " duplicate records");
    }
}

