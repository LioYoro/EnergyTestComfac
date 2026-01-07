# Quick Start Guide

## Option 1: Use Startup Scripts (Easiest)

### Start Both Servers:
Double-click `start-all.bat` - This will start both backend and frontend automatically.

### Start Individually:
- **Backend**: Double-click `start-backend.bat`
- **Frontend**: Double-click `start-frontend.bat`

## Option 2: Manual Start

### 1. Start Backend (Terminal 1)
```bash
cd backend
composer install
php artisan key:generate
php artisan migrate --force
php artisan serve
```
Backend will run on: **http://localhost:8000**

### 2. Start Frontend (Terminal 2)
```bash
cd frontend
npm install
npm start
```
Frontend will run on: **http://localhost:3000**

## Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000/api/test

## Troubleshooting

### Backend Issues:
- Make sure PHP 8.2+ is installed
- Make sure Composer is installed
- Check if port 8000 is available

### Frontend Issues:
- Make sure Node.js is installed
- Run `npm install` if dependencies are missing
- Check if port 3000 is available

### Database Issues:
- Backend uses SQLite by default
- Database file: `backend/database/database.sqlite`
- Run `php artisan migrate` to create tables

## Notes

- Backend must be running before frontend can fetch data
- Frontend uses mock data if backend is unavailable
- Check console for any errors



