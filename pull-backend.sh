#!/bin/bash

# Script to pull backend code from repository
# Run this in Git Bash: bash pull-backend.sh

echo "Setting up EnergyTestComfac repository..."

# Navigate to script directory
cd "$(dirname "$0")"

# Initialize git if not already initialized
if [ ! -d ".git" ]; then
    echo "Initializing git repository..."
    git init
fi

# Add remote if it doesn't exist
if ! git remote | grep -q "^origin$"; then
    echo "Adding remote repository..."
    git remote add origin https://github.com/LioYoro/EnergyTestComfac.git
else
    echo "Remote 'origin' already exists"
fi

# Fetch and pull backend code
echo "Pulling backend code..."
git fetch origin
git pull origin main

echo "Backend code pulled successfully!"
echo ""
echo "Next steps:"
echo "1. Review backend/README.md for setup instructions"
echo "2. Install backend dependencies"
echo "3. Configure backend environment"
echo "4. Update frontend/.env with API URL"
echo "5. Start backend server"
echo "6. Start frontend: cd frontend && npm start"



