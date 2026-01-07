import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import FloorDetails from './components/FloorDetails';
import Notification from './components/Notification';
import { usePowerPlantData } from './hooks/usePowerPlantData';

function App() {
  const [filters, setFilters] = useState({
    // Hierarchy
    floor: 'all',
    unitType: 'all',
    status: 'all',
    consumptionRange: 1000,
    // Time-related filters
    timeGranularity: 'day', // day | week | hour | minute
    weekday: 'all'          // all | monday | ... | sunday
  });
  
  const [activeModule, setActiveModule] = useState('dashboard');
  const [notification, setNotification] = useState(null);

  // Use custom hook for data fetching (supports both API and mock data)
  const { units: filteredUnits, statistics, loading, error } = usePowerPlantData(filters);

  // Scroll to top when module changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeModule]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading power plant data...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-xl shadow-sm border border-red-200">
          <i className="fas fa-exclamation-triangle text-red-500 text-4xl mb-4"></i>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Data</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <div className="flex min-h-screen">
        <Sidebar 
          filters={filters} 
          activeModule={activeModule}
          onFilterChange={handleFilterChange}
          onModuleChange={setActiveModule}
          onApplyFilters={() => showNotification(`Applied filters: ${filteredUnits.length} units shown`)}
        />
        
        <main className="flex-1 overflow-y-auto">
          <Header filters={filters} onFilterChange={handleFilterChange} />
          
          {/* Render only the active module */}
          {activeModule === 'dashboard' && (
            <div id="dashboard" className="px-8 py-6">
              <Dashboard statistics={statistics} units={filteredUnits} filters={filters} />
            </div>
          )}
          
          {activeModule === 'floors' && (
            <div id="floors" className="px-8 py-6">
              <FloorDetails units={filteredUnits} filters={filters} />
            </div>
          )}
        </main>
      </div>
      
      {notification && <Notification message={notification} />}
    </div>
  );
}

export default App;

