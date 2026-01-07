# EnergyTestComfac - Energy Management System

## Project Structure

```
EnergyTestComfac/
├── backend/          # Backend API (Laravel/PHP)
├── frontend/         # React.js Frontend Application
└── README.md         # This file
```

## Frontend Setup

The frontend is a React.js application for Laguna Power Plant Energy Management System.

### Features:
- Power Plant Building/Floor/Unit hierarchy
- Branch comparison and analytics
- Real-time energy consumption monitoring
- Intelligent recommendations engine
- Interactive building map visualization
- PHP currency support

### Installation:

```bash
cd frontend
npm install
npm start
```

The application will run on `http://localhost:3000`

## Backend Setup

To pull the backend code from the repository:

```bash
# In Git Bash, navigate to this directory
cd EnergyTestComfac

# Initialize git if not already initialized
git init

# Add remote repository
git remote add origin https://github.com/LioYoro/EnergyTestComfac.git

# Pull backend code
git pull origin main
```

## Integration Notes

- Frontend is ready for backend API integration
- API endpoints should be configured in `src/utils/api.js` (to be created)
- Backend should provide endpoints for:
  - Building/Floor/Unit data
  - Energy consumption metrics
  - Real-time updates
  - Filtering and search

## Development

### Frontend Development:
```bash
cd frontend
npm start
```

### Backend Development:
```bash
cd backend
# Follow Laravel setup instructions
```

## Notes

- Frontend is currently using mock data from `src/data/powerPlantData.js`
- Replace mock data with API calls once backend is integrated
- No changes will be pushed to repository unless explicitly requested



