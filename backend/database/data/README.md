# CSV Data Directory

Place your CSV file here:

**File name:** `smart_meter_per_second_2days.csv`

## Expected CSV Format

The CSV should have columns matching the energy_data table structure. The seeder will automatically detect columns with these names (case-insensitive):

- **date** - Date in any format (YYYY-MM-DD, DD/MM/YYYY, etc.)
- **hour** - Hour (0-23)
- **minute** - Minute (0-59)
- **second** - Second (0-59)
- **timestamp** - Full timestamp (optional, will be created from date/hour/minute/second if not provided)
- **voltage_v** or **voltage** - Voltage in volts
- **current_a** or **current** - Current in amperes
- **power_w** or **power** - Power in watts
- **energy_wh** or **energy** - Energy in watt-hours

## Usage

After placing your CSV file here, run:

```bash
php artisan db:seed --class=EnergyDataSeeder
```

Or to refresh the entire database:

```bash
php artisan migrate:fresh --seed
```
