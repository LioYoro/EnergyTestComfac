<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\EnergyData;
use Illuminate\Support\Facades\DB;

class PopulateDailySummary extends Command
{
    protected $signature = 'energy:populate-daily-summary';
    protected $description = 'Populate daily_summary table with pre-aggregated data for instant summary queries';

    public function handle()
    {
        $this->info('Populating daily_summary table...');
        
        // Clear existing data
        DB::table('daily_summary')->truncate();
        
        // Get all unique dates
        $dates = EnergyData::select('date')
            ->distinct()
            ->orderBy('date', 'asc')
            ->pluck('date');
        
        $floors = EnergyData::select('floor')
            ->distinct()
            ->whereNotNull('floor')
            ->pluck('floor')
            ->toArray();
        
        $floors[] = null; // Include null for all floors
        
        $totalProcessed = 0;
        
        foreach ($dates as $date) {
            foreach ($floors as $floor) {
                $query = EnergyData::where('date', $date);
                if ($floor !== null) {
                    $query->where('floor', $floor);
                }
                
                // Calculate all metrics in one go
                $totalRecords = $query->count();
                $avgCurrent = (float) $query->avg('current_a');
                $totalEnergy = (float) $query->sum('energy_wh');
                
                // Minute count - use COUNT(DISTINCT) for accurate results
                $minuteCount = (int) (clone $query)
                    ->selectRaw('COUNT(DISTINCT minute) as cnt')
                    ->value('cnt');
                $minuteCount = max(1, $minuteCount);
                
                // Hour count - use COUNT(DISTINCT) for accurate results
                $hourCount = (int) (clone $query)
                    ->selectRaw('COUNT(DISTINCT hour) as cnt')
                    ->value('cnt');
                $hourCount = max(1, $hourCount);
                
                // Per-minute average
                $minuteGroups = (clone $query)
                    ->selectRaw('minute, AVG(current_a) as avg_current')
                    ->groupBy('minute')
                    ->get();
                $avgCurrentPerMinute = $minuteGroups->isNotEmpty() 
                    ? (float) $minuteGroups->avg('avg_current') 
                    : $avgCurrent;
                
                // Per-hour average
                $hourGroups = (clone $query)
                    ->selectRaw('hour, AVG(current_a) as avg_current')
                    ->groupBy('hour')
                    ->get();
                $avgCurrentPerHour = $hourGroups->isNotEmpty() 
                    ? (float) $hourGroups->avg('avg_current') 
                    : $avgCurrent;
                
                // Insert into summary table
                DB::table('daily_summary')->insert([
                    'date' => $date,
                    'floor' => $floor,
                    'total_records' => $totalRecords,
                    'avg_current' => $avgCurrent,
                    'total_energy' => $totalEnergy,
                    'minute_count' => $minuteCount,
                    'avg_current_per_minute' => $avgCurrentPerMinute,
                    'hour_count' => $hourCount,
                    'avg_current_per_hour' => $avgCurrentPerHour,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
                
                $totalProcessed++;
            }
            
            if ($totalProcessed % 10 === 0) {
                $this->info("Processed {$totalProcessed} date/floor combinations...");
            }
        }
        
        $this->info("Done! Populated daily_summary with {$totalProcessed} combinations.");
        return 0;
    }
}

