# Setup Instructions

## Pull Backend Code from Repository

Since Git is not available in PowerShell, use **Git Bash** to pull the backend code:

### Step 1: Open Git Bash
Navigate to: `C:\xampp\htdocs\OJT\EnergyTestComfac`

### Step 2: Initialize Git (if not already initialized)
```bash
git init
```

### Step 3: Add Remote Repository
```bash
git remote add origin https://github.com/LioYoro/EnergyTestComfac.git
```

### Step 4: Pull Backend Code
```bash
git pull origin main
```

This will download the backend code into the `backend/` folder.

## Frontend Setup

The frontend is already set up in the `frontend/` directory.

### Install Dependencies:
```bash
cd frontend
npm install
```

### Run Frontend:
```bash
npm start
```

## Project Structure After Setup

```
EnergyTestComfac/
├── backend/          # Backend code (from repository)
│   ├── app/
│   ├── config/
│   └── ...
├── frontend/         # React frontend (already set up)
│   ├── src/
│   ├── public/
│   └── package.json
├── README.md
├── INTEGRATION.md
└── SETUP.md
```

## Next Steps

1. Pull backend code using Git Bash (commands above)
2. Review backend API structure
3. Configure API endpoints in frontend
4. Test integration
5. Deploy

## Important Notes

- **DO NOT PUSH** any changes unless explicitly requested
- Frontend is ready for backend integration
- Mock data is currently used - will be replaced with API calls
- All frontend files are in `frontend/` directory



