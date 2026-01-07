import React from 'react';
import ActiveFilters from './ActiveFilters';

const Header = ({ filters, onFilterChange }) => {
  return (
    <header className="bg-white border-b border-gray-200 px-8 py-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Laguna Power Plant Energy Management</h2>
          <p className="text-gray-600 mt-1">Monitor energy consumption across buildings, floors, and equipment units</p>
        </div>
        
        <div className="mt-4 md:mt-0 flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Active Filters:</span>
            <ActiveFilters filters={filters} onFilterChange={onFilterChange} />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

