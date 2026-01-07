# Frontend-Backend Integration Guide

## Current Frontend Structure

The React frontend has been set up in the `frontend/` directory with the following structure:

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── components/      # React components
│   ├── data/           # Mock data (to be replaced with API calls)
│   ├── utils/          # Utility functions
│   ├── App.js          # Main app component
│   └── index.js        # Entry point
├── package.json
└── tailwind.config.js
```

## Integration Steps

### 1. Pull Backend Code

In Git Bash:
```bash
cd EnergyTestComfac
git init
git remote add origin https://github.com/LioYoro/EnergyTestComfac.git
git pull origin main
```

### 2. API Integration Points

The frontend expects the following API structure:

#### Buildings Endpoint
- `GET /api/buildings` - Get all buildings
- `GET /api/buildings/:id` - Get building details
- `GET /api/buildings/:id/floors` - Get floors for a building

#### Floors Endpoint
- `GET /api/floors` - Get all floors
- `GET /api/floors/:id` - Get floor details
- `GET /api/floors/:id/units` - Get units for a floor

#### Units/Equipment Endpoint
- `GET /api/units` - Get all units (with filters)
- `GET /api/units/:id` - Get unit details
- `GET /api/units/stats` - Get statistics

#### Branches Endpoint
- `GET /api/branches` - Get all branches
- `GET /api/branches/:id` - Get branch details

### 3. Create API Service

Create `src/utils/api.js`:

```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

export const api = {
  getBuildings: () => fetch(`${API_BASE_URL}/buildings`),
  getFloors: (buildingId) => fetch(`${API_BASE_URL}/buildings/${buildingId}/floors`),
  getUnits: (filters) => fetch(`${API_BASE_URL}/units`, { params: filters }),
  // ... other API calls
};
```

### 4. Replace Mock Data

Update components to use API calls instead of `powerPlantData.js`:

- `src/App.js` - Fetch data on mount
- `src/components/Dashboard.js` - Use API data
- `src/components/BuildingMetrics.js` - Fetch building data
- `src/components/FloorDetails.js` - Fetch floor data

### 5. Environment Variables

Create `frontend/.env`:

```
REACT_APP_API_URL=http://localhost:8000/api
```

## Data Model Alignment

Ensure backend API returns data in this format:

```json
{
  "branches": [
    {
      "id": 1,
      "name": "Main Facility",
      "location": "Calamba, Laguna",
      "type": "main"
    }
  ],
  "buildings": [
    {
      "id": 1,
      "branchId": 1,
      "name": "Administrative Building",
      "type": "administrative",
      "totalFloors": 3,
      "area": 1500
    }
  ],
  "floors": [
    {
      "id": 1,
      "buildingId": 1,
      "floorNumber": 1,
      "name": "Ground Floor",
      "area": 500
    }
  ],
  "units": [
    {
      "id": 1,
      "floorId": 1,
      "name": "Main Office",
      "equipmentType": "HVAC",
      "consumption": 45.2,
      "cost": 452.00,
      "status": "operational",
      "peakTime": "2:00 PM"
    }
  ]
}
```

## Next Steps

1. Pull backend code using Git Bash
2. Review backend API structure
3. Create API service layer in frontend
4. Replace mock data with API calls
5. Test integration
6. Deploy



