<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\EnergyData;
use Carbon\Carbon;

class FloorDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // CSV files are in the parent directory (EnergyTestComfac root)
        // base_path() returns the backend directory, so we go up one level
        $csvFiles = [
            dirname(base_path()) . DIRECTORY_SEPARATOR . 'Floor1_8days_data.csv',
            dirname(base_path()) . DIRECTORY_SEPARATOR . 'Floor2_8days_data.csv',
            dirname(base_path()) . DIRECTORY_SEPARATOR . 'Floor3_8days_data.csv',
        ];

        $totalImported = 0;

        foreach ($csvFiles as $csvPath) {
            if (!file_exists($csvPath)) {
                $this->command->warn("CSV file not found: {$csvPath}");
                continue;
            }

            $this->command->info("Importing data from: " . basename($csvPath));
            
            $handle = fopen($csvPath, 'r');
            if ($handle === false) {
                $this->command->error("Could not open CSV file: {$csvPath}");
                continue;
            }

            // Read header row
            $header = fgetcsv($handle);
            if ($header === false) {
                $this->command->error("CSV file is empty or invalid: {$csvPath}");
                fclose($handle);
                continue;
            }

            // Normalize header (lowercase, remove spaces, remove BOM)
            $header = array_map(function($col) {
                // Remove BOM (Byte Order Mark) if present
                $col = preg_replace('/^\xEF\xBB\xBF/', '', $col);
                return strtolower(trim($col));
            }, $header);

            // Find column indices
            $columnIndices = [];
            $columnMap = [
                'floor' => ['floor'],
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
            $requiredFields = ['floor', 'date', 'hour', 'minute', 'second', 'voltage_v', 'current_a', 'power_w', 'energy_wh'];
            $missingFields = array_diff($requiredFields, array_keys($columnIndices));
            
            if (!empty($missingFields)) {
                $this->command->error("Missing required columns in " . basename($csvPath) . ": " . implode(', ', $missingFields));
                $this->command->info("Found columns: " . implode(', ', $header));
                fclose($handle);
                continue;
            }

            $rowCount = 0;
            $batch = [];
            $batchSize = 1000; // Increased batch size for better performance

            // Read data rows
            while (($row = fgetcsv($handle)) !== false) {
                if (count($row) < count($header)) {
                    continue; // Skip incomplete rows
                }

                try {
                    // Extract values based on column indices
                    $floor = isset($columnIndices['floor']) ? (int) $row[$columnIndices['floor']] : null;
                    $date = $this->parseDate($row[$columnIndices['date']]);
                    $hour = (int) $row[$columnIndices['hour']];
                    $minute = (int) $row[$columnIndices['minute']];
                    $second = (int) $row[$columnIndices['second']];
                    
                    // Parse timestamp if available, otherwise create from date/hour/minute/second
                    $timestamp = isset($columnIndices['timestamp']) 
                        ? $this->parseTimestamp($row[$columnIndices['timestamp']])
                        : Carbon::parse($date)->setTime($hour, $minute, $second);

                    $batch[] = [
                        'floor' => $floor,
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
                        if ($rowCount % 10000 == 0) {
                            $this->command->info("  Imported {$rowCount} rows from " . basename($csvPath) . "...");
                        }
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
            $this->command->info("Successfully imported {$rowCount} rows from " . basename($csvPath) . "!");
            $totalImported += $rowCount;
        }

        $this->command->info("Total rows imported: {$totalImported}");
    }

    /**
     * Parse date from various formats
     */
    private function parseDate($value): string
    {
        try {
            // Handle formats like "1/1/2026 0:00" or "1/1/2026"
            $value = trim($value);
            // Remove time portion if present
            if (strpos($value, ' ') !== false) {
                $value = explode(' ', $value)[0];
            }
            return Carbon::parse($value)->toDateString();
        } catch (\Exception $e) {
            $this->command->warn("Failed to parse date: {$value}, using current date");
            return Carbon::now()->toDateString();
        }
    }

    /**
     * Parse timestamp from various formats
     */
    private function parseTimestamp($value): Carbon
    {
        try {
            // Handle formats like "1/1/2026 0:00"
            return Carbon::parse($value);
        } catch (\Exception $e) {
            $this->command->warn("Failed to parse timestamp: {$value}, using current time");
            return Carbon::now();
        }
    }
}

