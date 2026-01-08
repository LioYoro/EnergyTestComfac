<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\EnergyData;
use Illuminate\Support\Facades\DB;

class PopulateHourlySummary extends Command
{
    protected $signature = 'energy:populate-hourly-summary';
    protected $description = 'Populate hourly_summary table with pre-aggregated data for fast queries';

    public function handle()
    {
        $this->info('Populating hourly_summary table...');
        
        // Clear existing data
        DB::table('hourly_summary')->truncate();
        
        // Process in chunks to avoid memory issues
        $chunkSize = 10000;
        $totalProcessed = 0;
        
        // Get all unique date/floor combinations
        $dates = EnergyData::select('date')
            ->distinct()
            ->orderBy('date', 'asc')
            ->pluck('date');
        
        $floors = EnergyData::select('floor')
            ->distinct()
            ->whereNotNull('floor')
            ->pluck('floor')
            ->toArray();
        
        $floors[] = null; // Include null floor for all floors
        
        foreach ($dates as $date) {
            // First, process individual floors
            foreach ($floors as $floor) {
                if ($floor === null) continue; // Skip null, we'll do aggregated separately
                
                $query = EnergyData::where('date', $date)->where('floor', $floor);
                
                // Aggregate by hour
                $hourlyData = $query
                    ->selectRaw('
                        hour,
                        AVG(current_a) as avg_current,
                        SUM(energy_wh) as total_energy,
                        MAX(current_a) as max_current,
                        MAX(energy_wh) as max_energy,
                        COUNT(*) as record_count
                    ')
                    ->groupBy('hour')
                    ->get();
                
                // Insert into summary table
                foreach ($hourlyData as $hour) {
                    DB::table('hourly_summary')->insert([
                        'date' => $date,
                        'floor' => $floor,
                        'hour' => $hour->hour,
                        'avg_current' => $hour->avg_current,
                        'total_energy' => $hour->total_energy,
                        'max_current' => $hour->max_current,
                        'max_energy' => $hour->max_energy,
                        'record_count' => $hour->record_count,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
                
                $totalProcessed++;
            }
            
            // Then create aggregated "all floors" data (floor = null)
            $allFloorsData = EnergyData::where('date', $date)
                ->selectRaw('
                    hour,
                    AVG(current_a) as avg_current,
                    SUM(energy_wh) as total_energy,
                    MAX(current_a) as max_current,
                    MAX(energy_wh) as max_energy,
                    COUNT(*) as record_count
                ')
                ->groupBy('hour')
                ->get();
            
            foreach ($allFloorsData as $hour) {
                DB::table('hourly_summary')->insert([
                    'date' => $date,
                    'floor' => null, // null = all floors aggregated
                    'hour' => $hour->hour,
                    'avg_current' => $hour->avg_current,
                    'total_energy' => $hour->total_energy,
                    'max_current' => $hour->max_current,
                    'max_energy' => $hour->max_energy,
                    'record_count' => $hour->record_count,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
            
            if ($totalProcessed % 10 === 0) {
                $this->info("Processed {$totalProcessed} date/floor combinations...");
            }
        }
        
        $this->info("Done! Populated hourly_summary with {$totalProcessed} combinations.");
        return 0;
    }
}

