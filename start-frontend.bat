@echo off
echo Starting React Frontend...
cd frontend
if not exist node_modules (
    echo Installing dependencies...
    call npm.cmd install
)
echo Starting development server on http://localhost:3000
call npm.cmd start



