# API Integration Guide

## Current Status

✅ **Frontend Ready**: React frontend is set up and ready for backend integration
⏳ **Backend**: Needs to be pulled from repository

## Integration Checklist

### Phase 1: Backend Setup
- [ ] Pull backend code from repository
- [ ] Install backend dependencies
- [ ] Configure database
- [ ] Set up API routes
- [ ] Test API endpoints

### Phase 2: API Configuration
- [ ] Update `frontend/.env` with correct API URL
- [ ] Set `REACT_APP_USE_MOCK_DATA=false`
- [ ] Configure CORS in backend
- [ ] Test API connectivity

### Phase 3: Data Integration
- [ ] Replace mock data calls with API calls
- [ ] Implement error handling
- [ ] Add loading states
- [ ] Test data flow

### Phase 4: Features Integration
- [ ] Real-time updates (if supported)
- [ ] Search functionality
- [ ] Export functionality
- [ ] Authentication (if required)

## Quick Start

### 1. Pull Backend (Git Bash)
```bash
cd C:/xampp/htdocs/OJT/EnergyTestComfac
git init
git remote add origin https://github.com/LioYoro/EnergyTestComfac.git
git pull origin main
```

### 2. Configure Frontend
Edit `frontend/.env`:
```
REACT_APP_API_URL=http://localhost:8000/api
REACT_APP_USE_MOCK_DATA=false
```

### 3. Start Backend
```bash
cd backend
# Follow backend setup instructions
php artisan serve
```

### 4. Start Frontend
```bash
cd frontend
npm install
npm start
```

## API Service Layer

The API service layer is ready in `frontend/src/utils/api.js` with:
- All required endpoints defined
- Error handling
- Fallback to mock data if API unavailable
- Support for filters and query parameters

## Data Flow

```
Backend API → api.js → usePowerPlantData hook → Components
```

Components use the `usePowerPlantData` hook which:
1. Checks if mock data should be used
2. Attempts API call if enabled
3. Falls back to mock data if API fails
4. Provides loading and error states

## Testing Integration

1. Start backend server
2. Verify API endpoints are accessible
3. Update `.env` to use API
4. Test each module:
   - Dashboard
   - Buildings
   - Floors
   - Branches
   - Recommendations
   - Building Map

## Troubleshooting

### API Not Connecting
- Check backend server is running
- Verify CORS configuration
- Check API URL in `.env`
- Review browser console for errors

### Data Not Loading
- Check API response format matches expected structure
- Verify endpoint URLs
- Check network tab for failed requests
- Enable mock data fallback for testing

### CORS Errors
- Configure CORS in backend to allow frontend origin
- Add `Access-Control-Allow-Origin` headers
- Check preflight requests

## Next Steps After Integration

1. Replace all mock data references
2. Implement real-time updates (WebSocket/Polling)
3. Add authentication/authorization
4. Optimize API calls (caching, pagination)
5. Add error boundaries
6. Implement offline support



