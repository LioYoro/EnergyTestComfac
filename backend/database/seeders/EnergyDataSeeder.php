<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\EnergyData;
use Carbon\Carbon;

class EnergyDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $csvPath = database_path('data/smart_meter_per_second_2_days.csv');
        
        if (!file_exists($csvPath)) {
            $this->command->error("CSV file not found at: {$csvPath}");
            $this->command->info("Please place your CSV file at: backend/database/data/smart_meter_per_second_2_days.csv");
            return;
        }

        // Clear existing data before importing
        $this->command->info("Clearing existing energy data...");
        EnergyData::truncate();
        
        $this->command->info("Importing data from CSV...");
        
        $handle = fopen($csvPath, 'r');
        if ($handle === false) {
            $this->command->error("Could not open CSV file.");
            return;
        }

        // Read header row
        $header = fgetcsv($handle);
        if ($header === false) {
            $this->command->error("CSV file is empty or invalid.");
            fclose($handle);
            return;
        }

        // Normalize header (lowercase, remove spaces)
        $header = array_map(function($col) {
            return strtolower(trim($col));
        }, $header);

        // Map common CSV column names to database fields
        $columnMap = [
            'date' => ['date'],
            'hour' => ['hour', 'hours', 'hr', 'hrs'],
            'minute' => ['minute', 'minutes', 'min', 'mins'],
            'second' => ['second', 'seconds', 'sec', 'secs'],
            'timestamp' => ['timestamp', 'time', 'datetime', 'date_time'],
            'voltage_v' => ['voltage_v', 'voltage', 'v', 'voltage (v)'],
            'current_a' => ['current_a', 'current', 'a', 'current (a)', 'amps', 'ampere'],
            'power_w' => ['power_w', 'power', 'w', 'power (w)', 'watts'],
            'energy_wh' => ['energy_wh', 'energy', 'wh', 'energy (wh)', 'watt-hours'],
        ];

        // Find column indices
        $columnIndices = [];
        foreach ($columnMap as $dbField => $possibleNames) {
            foreach ($possibleNames as $name) {
                $index = array_search($name, $header);
                if ($index !== false) {
                    $columnIndices[$dbField] = $index;
                    break;
                }
            }
        }

        // Check if we have required fields
        $requiredFields = ['date', 'hour', 'minute', 'second', 'voltage_v', 'current_a', 'power_w', 'energy_wh'];
        $missingFields = array_diff($requiredFields, array_keys($columnIndices));
        
        if (!empty($missingFields)) {
            $this->command->error("Missing required columns: " . implode(', ', $missingFields));
            $this->command->info("Found columns: " . implode(', ', $header));
            fclose($handle);
            return;
        }

        $rowCount = 0;
        $batch = [];
        $batchSize = 500;

        // Read data rows
        while (($row = fgetcsv($handle)) !== false) {
            if (count($row) < count($header)) {
                continue; // Skip incomplete rows
            }

            try {
                // Extract values based on column indices
                $date = $this->parseDate($row[$columnIndices['date']]);
                $hour = (int) $row[$columnIndices['hour']];
                $minute = (int) $row[$columnIndices['minute']];
                $second = (int) $row[$columnIndices['second']];
                
                // Parse timestamp if available, otherwise create from date/hour/minute/second
                $timestamp = isset($columnIndices['timestamp']) 
                    ? $this->parseTimestamp($row[$columnIndices['timestamp']])
                    : Carbon::parse($date)->setTime($hour, $minute, $second);

                $batch[] = [
                    'date' => $date,
                    'hour' => $hour,
                    'minute' => $minute,
                    'second' => $second,
                    'timestamp' => $timestamp,
                    'voltage_v' => (float) $row[$columnIndices['voltage_v']],
                    'current_a' => (float) $row[$columnIndices['current_a']],
                    'power_w' => (float) $row[$columnIndices['power_w']],
                    'energy_wh' => (float) $row[$columnIndices['energy_wh']],
                    'created_at' => now(),
                    'updated_at' => now(),
                ];

                $rowCount++;

                // Insert in batches for better performance
                if (count($batch) >= $batchSize) {
                    EnergyData::insert($batch);
                    $batch = [];
                    $this->command->info("Imported {$rowCount} rows...");
                }
            } catch (\Exception $e) {
                $this->command->warn("Skipping row due to error: " . $e->getMessage());
                continue;
            }
        }

        // Insert remaining rows
        if (!empty($batch)) {
            EnergyData::insert($batch);
        }

        fclose($handle);
        $this->command->info("Successfully imported {$rowCount} rows from CSV!");
    }

    /**
     * Parse date from various formats
     */
    private function parseDate($value): string
    {
        try {
            return Carbon::parse($value)->toDateString();
        } catch (\Exception $e) {
            return Carbon::now()->toDateString();
        }
    }

    /**
     * Parse timestamp from various formats
     */
    private function parseTimestamp($value): Carbon
    {
        try {
            return Carbon::parse($value);
        } catch (\Exception $e) {
            return Carbon::now();
        }
    }
}
