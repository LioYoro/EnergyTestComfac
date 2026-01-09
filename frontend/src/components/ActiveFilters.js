import React from 'react';
import { powerPlantData } from '../data/powerPlantData';

const ActiveFilters = ({ filters, onFilterChange }) => {
  const removeFilter = (filterType) => {
    if (filterType === 'branch') {
      onFilterChange({ ...filters, branch: 'all', building: 'all', floor: 'all' });
    } else if (filterType === 'building') {
      onFilterChange({ ...filters, building: 'all', floor: 'all' });
    } else if (filterType === 'floor') {
      onFilterChange({ ...filters, floor: 'all' });
    } else if (filterType === 'unitType') {
      onFilterChange({ ...filters, unitType: 'all' });
    } else if (filterType === 'status') {
      onFilterChange({ ...filters, status: 'all' });
    } else if (filterType === 'consumption') {
      onFilterChange({ ...filters, consumptionRange: 1000 });
    }
  };

  const getBranchName = (branchId) => {
    const branch = powerPlantData.branches.find(b => b.id === parseInt(branchId));
    return branch?.name || branchId;
  };

  const getBuildingName = (buildingId) => {
    const building = powerPlantData.buildings.find(b => b.id === parseInt(buildingId));
    return building?.name || buildingId;
  };

  const getFloorName = (floorId) => {
    const floor = powerPlantData.floors.find(f => f.id === parseInt(floorId));
    return floor?.name || floorId;
  };

  return (
    <div className="flex flex-wrap gap-2">
      {filters.branch && filters.branch !== 'all' && (
        <div className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm flex items-center">
          Branch: {getBranchName(filters.branch)}
          <button 
            onClick={() => removeFilter('branch')}
            className="ml-2 text-gray-500 hover:text-gray-700"
            aria-label="Remove branch filter"
            title="Remove branch filter"
          >
            <i className="fas fa-times text-xs"></i>
          </button>
        </div>
      )}
      
      {filters.building && filters.building !== 'all' && (
        <div className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm flex items-center">
          Building: {getBuildingName(filters.building)}
          <button 
            onClick={() => removeFilter('building')}
            className="ml-2 text-gray-500 hover:text-gray-700"
            aria-label="Remove building filter"
            title="Remove building filter"
          >
            <i className="fas fa-times text-xs"></i>
          </button>
        </div>
      )}
      
      {filters.floor && filters.floor !== 'all' && (
        <div className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm flex items-center">
          Floor: {getFloorName(filters.floor)}
          <button 
            onClick={() => removeFilter('floor')}
            className="ml-2 text-gray-500 hover:text-gray-700"
            aria-label="Remove floor filter"
            title="Remove floor filter"
          >
            <i className="fas fa-times text-xs"></i>
          </button>
        </div>
      )}
      
      {filters.unitType && filters.unitType !== 'all' && (
        <div className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm flex items-center">
          Type: {filters.unitType}
          <button 
            onClick={() => removeFilter('unitType')}
            className="ml-2 text-gray-500 hover:text-gray-700"
            aria-label="Remove unit type filter"
            title="Remove unit type filter"
          >
            <i className="fas fa-times text-xs"></i>
          </button>
        </div>
      )}
      
      {filters.status && filters.status !== 'all' && (
        <div className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm flex items-center">
          Status: {filters.status}
          <button 
            onClick={() => removeFilter('status')}
            className="ml-2 text-gray-500 hover:text-gray-700"
            aria-label="Remove status filter"
            title="Remove status filter"
          >
            <i className="fas fa-times text-xs"></i>
          </button>
        </div>
      )}
      
      {filters.consumptionRange && filters.consumptionRange < 1000 && (
        <div className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm flex items-center">
          Max: {filters.consumptionRange} kWh
          <button 
            onClick={() => removeFilter('consumption')}
            className="ml-2 text-gray-500 hover:text-gray-700"
            aria-label="Remove consumption range filter"
            title="Remove consumption range filter"
          >
            <i className="fas fa-times text-xs"></i>
          </button>
        </div>
      )}
    </div>
  );
};

export default ActiveFilters;
