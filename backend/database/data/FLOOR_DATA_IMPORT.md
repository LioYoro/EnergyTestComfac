# Floor Data Import Guide

This guide explains how to import the historical floor data (Floor1, Floor2, Floor3) into the database.

## Prerequisites

1. The CSV files should be placed in the `EnergyTestComfac` root directory:
   - `Floor1_8days_data.csv`
   - `Floor2_8days_data.csv`
   - `Floor3_8days_data.csv`

2. Run the migration to add the `floor` column:
   ```bash
   php artisan migrate
   ```

## CSV File Format

The CSV files should have the following columns:
- `Floor` - Floor number (1, 2, or 3)
- `date` - Date in format "M/D/YYYY" or "M/D/YYYY H:MM"
- `hour` - Hour (0-23)
- `minute` - Minute (0-59)
- `second` - Second (0-59)
- `timestamp` - Full timestamp (optional)
- `voltage_v` - Voltage in volts
- `current_a` - Current in amperes
- `power_w` - Power in watts
- `energy_wh` - Energy in watt-hours

## Import Process

### Option 1: Import Only Floor Data (Recommended)

To import only the floor CSV files without clearing existing data:

```bash
php artisan db:seed --class=FloorDataSeeder
```

### Option 2: Clear and Import All Data

To clear existing energy data and import floor data:

1. First, modify `FloorDataSeeder.php` to add `EnergyData::truncate();` at the beginning of the `run()` method
2. Then run:
   ```bash
   php artisan db:seed --class=FloorDataSeeder
   ```

### Option 3: Fresh Migration with Floor Data

To reset the database and import floor data:

```bash
php artisan migrate:fresh
php artisan db:seed --class=FloorDataSeeder
```

## Import Progress

The seeder will:
- Process each CSV file sequentially
- Show progress every 10,000 rows
- Display total rows imported per file
- Show final total count

## Troubleshooting

### CSV File Not Found
- Ensure CSV files are in the `EnergyTestComfac` root directory (same level as `backend` folder)
- Check file names match exactly: `Floor1_8days_data.csv`, `Floor2_8days_data.csv`, `Floor3_8days_data.csv`

### Missing Columns Error
- Verify CSV files have all required columns
- Column names are case-insensitive
- Check for extra columns (they will be ignored)

### Date Parsing Errors
- The seeder handles dates in format "M/D/YYYY" or "M/D/YYYY H:MM"
- Invalid dates will default to current date (with warning)

### Performance
- Large files are imported in batches of 1,000 rows
- For very large files, the import may take several minutes
- Progress is shown every 10,000 rows

## Expected Results

After successful import:
- All three floor CSV files will be imported
- Each record will have a `floor` value (1, 2, or 3)
- Total records should be approximately 2,073,600 rows (691,200 per floor × 3 floors)

