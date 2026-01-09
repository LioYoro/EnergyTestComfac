import React, { useState, useEffect } from 'react';
import { powerPlantData } from '../data/powerPlantData';

const Sidebar = ({ filters, activeModule, onFilterChange, onModuleChange, onApplyFilters }) => {
  const [consumptionValue, setConsumptionValue] = useState(filters.consumptionRange || 1000);

  // Sync consumptionValue with filters
  useEffect(() => {
    if (filters.consumptionRange !== undefined) {
      setConsumptionValue(filters.consumptionRange);
    }
  }, [filters.consumptionRange]);

  // If granularity is not week, force weekday to "all" to avoid stale filter
  useEffect(() => {
    if (filters.timeGranularity !== 'week' && filters.weekday !== 'all') {
      onFilterChange({ ...filters, weekday: 'all' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.timeGranularity]);

  const handleFloorChange = (e) => {
    onFilterChange({ ...filters, floor: e.target.value });
  };

  const handleUnitTypeChange = (type) => {
    onFilterChange({ ...filters, unitType: type });
  };

  const handleStatusChange = (status) => {
    onFilterChange({ ...filters, status });
  };

  const handleConsumptionRangeChange = (e) => {
    const value = parseInt(e.target.value);
    setConsumptionValue(value);
    onFilterChange({ ...filters, consumptionRange: value });
  };

  const handleModuleClick = (moduleId) => {
    onModuleChange(moduleId);
  };

  // Get unique equipment types
  const equipmentTypes = [...new Set(powerPlantData.units.map(u => u.equipmentType))];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 shadow-sm flex flex-col">
      {/* Logo Section */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-primary-600 flex items-center justify-center">
            <i className="fas fa-industry text-white text-lg"></i>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Laguna<span className="text-primary-600">Power</span></h1>
            <p className="text-xs text-gray-500">Energy Management</p>
          </div>
        </div>
      </div>
      
      {/* Filter Section */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
          <i className="fas fa-filter mr-2 text-primary-600"></i>
          Filters
        </h3>
        
        {/* Floor Filter - Primary Filter */}
        <div className="mb-4">
          <label htmlFor="floor-filter" className="block text-xs font-medium text-gray-500 mb-2">
            <i className="fas fa-layer-group mr-1"></i>
            Floor
          </label>
          <select 
            id="floor-filter"
            value={filters.floor || 'all'}
            onChange={handleFloorChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm bg-white"
            aria-label="Select floor filter"
          >
            <option value="all">All Floors</option>
            {powerPlantData.floors.map(floor => (
              <option key={floor.id} value={floor.id}>{floor.name}</option>
            ))}
          </select>
        </div>

        {/* Time Granularity */}
        <div className="mb-4">
          <label htmlFor="time-granularity-filter" className="block text-xs font-medium text-gray-500 mb-2">
            <i className="fas fa-clock mr-1"></i>
            Time Granularity
          </label>
          <select
            id="time-granularity-filter"
            value={filters.timeGranularity || 'day'}
            onChange={(e) => onFilterChange({ ...filters, timeGranularity: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm bg-white"
            aria-label="Select time granularity"
          >
            <option value="day">Per Day</option>
            <option value="week">Per Week</option>
          </select>
        </div>

        {/* Day of Week Filter (only for Per Week) */}
        {filters.timeGranularity === 'week' && (
          <div className="mb-4">
            <label htmlFor="weekday-filter" className="block text-xs font-medium text-gray-500 mb-2">
              <i className="fas fa-calendar-day mr-1"></i>
              Day of Week
            </label>
            <select
              id="weekday-filter"
              value={filters.weekday || 'all'}
              onChange={(e) => onFilterChange({ ...filters, weekday: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm bg-white"
              aria-label="Select day of week"
            >
              <option value="all">All Days</option>
              <option value="monday">Monday</option>
              <option value="tuesday">Tuesday</option>
              <option value="wednesday">Wednesday</option>
              <option value="thursday">Thursday</option>
              <option value="friday">Friday</option>
              <option value="saturday">Saturday</option>
              <option value="sunday">Sunday</option>
            </select>
          </div>
        )}
        
        {/* Unit Type Filter */}
        <div className="mb-4">
          <label htmlFor="equipment-type-filter" className="block text-xs font-medium text-gray-500 mb-2">Equipment Type</label>
          <select 
            id="equipment-type-filter"
            value={filters.unitType || 'all'}
            onChange={(e) => handleUnitTypeChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
            aria-label="Select equipment type"
          >
            <option value="all">All Types</option>
            {equipmentTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
        
        {/* Status Filter */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-gray-500 mb-2">Status</label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleStatusChange('all')}
              className={`filter-chip px-3 py-1.5 text-xs rounded-full ${
                filters.status === 'all' 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              aria-label="Filter by all statuses"
            >
              All
            </button>
            <button
              onClick={() => handleStatusChange('operational')}
              className={`filter-chip px-3 py-1.5 text-xs rounded-full ${
                filters.status === 'operational' 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              aria-label="Filter by operational status"
            >
              Operational
            </button>
            <button
              onClick={() => handleStatusChange('maintenance')}
              className={`filter-chip px-3 py-1.5 text-xs rounded-full ${
                filters.status === 'maintenance' 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              aria-label="Filter by maintenance status"
            >
              Maintenance
            </button>
            <button
              onClick={() => handleStatusChange('critical')}
              className={`filter-chip px-3 py-1.5 text-xs rounded-full ${
                filters.status === 'critical' 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              aria-label="Filter by critical status"
            >
              Critical
            </button>
          </div>
        </div>
        
        {/* Consumption Range */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-gray-500 mb-2">Consumption Range (kWh)</label>
          <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
            <span>Low</span>
            <span>{consumptionValue === 1000 ? 'All' : `≤ ${consumptionValue} kWh`}</span>
            <span>High</span>
          </div>
          <input 
            type="range" 
            min="0" 
            max="1000" 
            value={consumptionValue}
            onChange={handleConsumptionRangeChange}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            aria-label="Consumption range filter"
            aria-valuemin="0"
            aria-valuemax="1000"
            aria-valuenow={consumptionValue}
            aria-valuetext={consumptionValue === 1000 ? 'All' : `≤ ${consumptionValue} kWh`}
          />
        </div>
        
        {/* Apply Filters Button */}
        <button 
          onClick={onApplyFilters}
          className="w-full px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium text-sm"
        >
          <i className="fas fa-sync-alt mr-2"></i>
          Apply Filters
        </button>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="mb-8">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Analytics</h3>
          <ul className="space-y-1">
            <li>
              <button
                onClick={() => handleModuleClick('dashboard')}
                className={`sidebar-link w-full flex items-center space-x-3 px-3 py-2 rounded-lg ${
                  activeModule === 'dashboard'
                    ? 'bg-primary-50 text-primary-700 border border-primary-100'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <i className={`fas fa-chart-line w-5 ${activeModule === 'dashboard' ? 'text-primary-600' : 'text-gray-500'}`}></i>
                <span className={activeModule === 'dashboard' ? 'font-medium' : ''}>Dashboard</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => handleModuleClick('floors')}
                className={`sidebar-link w-full flex items-center space-x-3 px-3 py-2 rounded-lg ${
                  activeModule === 'floors'
                    ? 'bg-primary-50 text-primary-700 border border-primary-100'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <i className={`fas fa-layer-group w-5 ${activeModule === 'floors' ? 'text-primary-600' : 'text-gray-500'}`}></i>
                <span className={activeModule === 'floors' ? 'font-medium' : ''}>Floor Details</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => handleModuleClick('building-map')}
                className={`sidebar-link w-full flex items-center space-x-3 px-3 py-2 rounded-lg ${
                  activeModule === 'building-map'
                    ? 'bg-primary-50 text-primary-700 border border-primary-100'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <i className={`fas fa-map-marked-alt w-5 ${activeModule === 'building-map' ? 'text-primary-600' : 'text-gray-500'}`}></i>
                <span className={activeModule === 'building-map' ? 'font-medium' : ''}>Building Map</span>
              </button>
            </li>
          </ul>
        </div>
      </nav>
      
      {/* User Profile */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <img src="https://picsum.photos/40?random=100" alt="User profile" className="w-10 h-10 rounded-full" />
          <div className="flex-1">
            <p className="font-medium text-gray-900">Juan Dela Cruz</p>
            <p className="text-sm text-gray-500">Energy Analyst</p>
          </div>
          <button 
            className="p-2 rounded-lg hover:bg-gray-100"
            aria-label="User menu"
            title="User menu"
          >
            <i className="fas fa-chevron-down text-gray-500"></i>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
