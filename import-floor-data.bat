@echo off
echo ========================================
echo Floor Data Import Script
echo ========================================
echo.

cd backend

echo Step 1: Installing Composer dependencies (if needed)...
call composer install --no-interaction --quiet
if errorlevel 1 (
    echo Warning: Composer install had issues, but continuing...
)

echo.
echo Step 2: Running migration to add floor column...
php artisan migrate --force
if errorlevel 1 (
    echo Error: Migration failed!
    pause
    exit /b 1
)

echo.
echo Step 3: Importing Floor CSV data...
echo This may take several minutes for large files...
php artisan db:seed --class=FloorDataSeeder
if errorlevel 1 (
    echo Error: Import failed!
    pause
    exit /b 1
)

echo.
echo ========================================
echo Import completed successfully!
echo ========================================
pause

