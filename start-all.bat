@echo off
echo ========================================
echo Starting Energy Management System
echo ========================================
echo.
echo This will start both backend and frontend servers.
echo Backend: http://localhost:8000
echo Frontend: http://localhost:3000
echo.
echo Press Ctrl+C to stop servers
echo.
start "Backend Server" cmd /k "start-backend.bat"
timeout /t 5 /nobreak >nul
start "Frontend Server" cmd /k "start-frontend.bat"
echo.
echo Both servers are starting...
echo Check the opened windows for status.



