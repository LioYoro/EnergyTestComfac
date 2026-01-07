@echo off
echo Starting Laravel Backend Server...
cd backend
if not exist vendor (
    echo Installing dependencies...
    composer install --no-interaction
)
if not exist .env (
    echo Creating .env file...
    copy .env.example .env
    php artisan key:generate
)
echo Running migrations...
php artisan migrate --force
echo Starting server on http://localhost:8000
php artisan serve



