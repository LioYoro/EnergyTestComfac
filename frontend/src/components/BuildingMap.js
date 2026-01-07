import React, { useState } from 'react';
import { powerPlantData } from '../data/powerPlantData';
import { calculateBuildingMetrics } from '../utils/filterUtils';

const BuildingMap = ({ units, onBuildingClick }) => {
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState(null);

  const getBuildingColor = (consumption) => {
    if (consumption < 200) return '#10b981'; // Green for low
    if (consumption < 500) return '#f59e0b'; // Yellow for medium
    return '#ef4444'; // Red for high
  };

  const handleBuildingClick = (building) => {
    setSelectedBuilding(building);
    onBuildingClick(building);
  };

  // Calculate metrics for all buildings
  const buildingMetrics = powerPlantData.buildings.map(building => {
    const metrics = calculateBuildingMetrics(building.id, units);
    return {
      ...building,
      ...metrics
    };
  });

  // Group buildings by branch
  const buildingsByBranch = powerPlantData.branches.map(branch => ({
    ...branch,
    buildings: buildingMetrics.filter(b => b.branchId === branch.id)
  }));

  // Static map coordinates for buildings (simulating a site plan layout)
  const getBuildingPosition = (buildingId, branchId) => {
    // Main Facility buildings layout
    if (branchId === 1) {
      const positions = {
        1: { x: 15, y: 20 }, // Administrative Building
        2: { x: 45, y: 35 }, // Production Hall A
        3: { x: 70, y: 35 }, // Production Hall B
        4: { x: 85, y: 20 }, // Maintenance Building
        5: { x: 30, y: 50 }, // Control Center
        6: { x: 60, y: 10 }  // Warehouse
      };
      return positions[buildingId] || { x: 50, y: 30 };
    }
    // Substation Alpha layout
    else if (branchId === 2) {
      const positions = {
        7: { x: 20, y: 30 }, // Control Room
        8: { x: 50, y: 30 }  // Equipment Hall
      };
      return positions[buildingId] || { x: 35, y: 30 };
    }
    // Substation Beta layout
    else if (branchId === 3) {
      const positions = {
        9: { x: 20, y: 30 }, // Control Room
        10: { x: 50, y: 30 } // Equipment Hall
      };
      return positions[buildingId] || { x: 35, y: 30 };
    }
    return { x: 50, y: 30 };
  };

  return (
    <div className="space-y-6">
      {/* Branch Selector */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-700">View Branch:</span>
          <div className="flex space-x-2">
            <button
              onClick={() => setSelectedBranch(null)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedBranch === null
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Branches
            </button>
            {powerPlantData.branches.map(branch => (
              <button
                key={branch.id}
                onClick={() => setSelectedBranch(branch.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedBranch === branch.id
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {branch.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Static Map Visualization */}
      {buildingsByBranch
        .filter(branch => selectedBranch === null || branch.id === selectedBranch)
        .map((branch) => {
          const branchBuildings = branch.buildings;
          
          return (
            <div key={branch.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="border-b border-gray-200 px-6 py-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{branch.name} - Site Map</h3>
                    <p className="text-gray-600 mt-1">{branch.location} • {branch.type}</p>
                  </div>
                  <div className="mt-4 md:mt-0">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                        <span className="text-xs text-gray-700">Low (&lt; 200 kWh)</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                        <span className="text-xs text-gray-700">Medium (200-500 kWh)</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                        <span className="text-xs text-gray-700">High (&gt; 500 kWh)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                {/* Static Site Map */}
                <div className="relative bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 rounded-lg border-2 border-gray-300 overflow-hidden" style={{ minHeight: '500px', position: 'relative' }}>
                  {/* Grid Background */}
                  <div className="absolute inset-0 opacity-20" style={{
                    backgroundImage: `
                      linear-gradient(to right, #cbd5e1 1px, transparent 1px),
                      linear-gradient(to bottom, #cbd5e1 1px, transparent 1px)
                    `,
                    backgroundSize: '50px 50px'
                  }}></div>
                  
                  {/* Roads/Paths */}
                  <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }}>
                    {branchBuildings.map((building, index) => {
                      const pos = getBuildingPosition(building.id, branch.id);
                      const nextBuilding = branchBuildings[index + 1];
                      if (nextBuilding) {
                        const nextPos = getBuildingPosition(nextBuilding.id, branch.id);
                        return (
                          <line
                            key={`path-${building.id}`}
                            x1={`${pos.x}%`}
                            y1={`${pos.y}%`}
                            x2={`${nextPos.x}%`}
                            y2={`${nextPos.y}%`}
                            stroke="#94a3b8"
                            strokeWidth="2"
                            strokeDasharray="5,5"
                            opacity="0.4"
                          />
                        );
                      }
                      return null;
                    })}
                  </svg>

                  {/* Buildings on Map */}
                  {branchBuildings.map((building) => {
                    const consumption = parseFloat(building.totalConsumption || 0);
                    const color = getBuildingColor(consumption);
                    const position = getBuildingPosition(building.id, branch.id);
                    const isSelected = selectedBuilding?.id === building.id;
                    
                    return (
                      <div
                        key={building.id}
                        className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 hover:scale-110"
                        style={{
                          left: `${position.x}%`,
                          top: `${position.y}%`,
                          zIndex: isSelected ? 10 : 2
                        }}
                        onClick={() => handleBuildingClick(building)}
                      >
                        {/* Building Shape */}
                        <div
                          className={`relative ${isSelected ? 'ring-4 ring-primary-500 ring-offset-2' : ''}`}
                          style={{
                            width: building.type === 'production' ? '80px' : 
                                   building.type === 'control' ? '70px' : 
                                   building.type === 'administrative' ? '75px' : '65px',
                            height: building.type === 'production' ? '80px' : 
                                    building.type === 'control' ? '70px' : 
                                    building.type === 'administrative' ? '75px' : '65px',
                            backgroundColor: color,
                            borderRadius: building.type === 'production' ? '8px' : '12px',
                            boxShadow: isSelected 
                              ? `0 0 0 4px ${color}40, 0 10px 25px -5px rgba(0, 0, 0, 0.3)`
                              : `0 4px 6px -1px rgba(0, 0, 0, 0.2), 0 0 0 0 ${color}80`,
                            border: `3px solid ${color}`,
                            transition: 'all 0.3s ease'
                          }}
                        >
                          {/* Building Icon */}
                          <div className="absolute inset-0 flex items-center justify-center text-white">
                            <i className={`fas ${
                              building.type === 'production' ? 'fa-industry' :
                              building.type === 'control' ? 'fa-server' :
                              building.type === 'administrative' ? 'fa-building' :
                              building.type === 'maintenance' ? 'fa-tools' :
                              'fa-warehouse'
                            } text-2xl`}></i>
                          </div>
                          
                          {/* Building Label */}
                          <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                            <div className="bg-white px-2 py-1 rounded shadow-md border border-gray-200">
                              <p className="text-xs font-semibold text-gray-900 text-center max-w-[100px] truncate">
                                {building.name.split(' ')[0]}
                              </p>
                              <p className="text-xs text-gray-600 text-center">
                                {consumption.toFixed(0)} kWh
                              </p>
                            </div>
                          </div>

                          {/* Consumption Indicator */}
                          <div className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-md border border-gray-200">
                            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: color }}></div>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Legend/Scale */}
                  <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-gray-200">
                    <p className="text-xs font-semibold text-gray-900 mb-2">Scale</p>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 h-1 bg-gray-400"></div>
                      <span className="text-xs text-gray-600">100m</span>
                    </div>
                  </div>

                  {/* North Arrow */}
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-lg border border-gray-200">
                    <div className="flex flex-col items-center">
                      <i className="fas fa-arrow-up text-gray-700 text-lg"></i>
                      <span className="text-xs text-gray-600 mt-1">N</span>
                    </div>
                  </div>
                </div>

                {/* Building List Below Map */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {branchBuildings.map((building) => {
                    const consumption = parseFloat(building.totalConsumption || 0);
                    const color = getBuildingColor(consumption);
                    const isSelected = selectedBuilding?.id === building.id;
                    
                    return (
                      <div
                        key={building.id}
                        className={`p-4 bg-white border-2 rounded-lg transition-all cursor-pointer ${
                          isSelected 
                            ? 'border-primary-500 shadow-lg' 
                            : 'border-gray-200 hover:shadow-md'
                        }`}
                        onClick={() => handleBuildingClick(building)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <div
                              className="w-3 h-3 rounded"
                              style={{ backgroundColor: color }}
                            ></div>
                            <h5 className="font-medium text-gray-900">{building.name}</h5>
                          </div>
                          <i className={`fas ${
                            building.type === 'production' ? 'fa-industry text-blue-600' :
                            building.type === 'control' ? 'fa-server text-purple-600' :
                            building.type === 'administrative' ? 'fa-building text-indigo-600' :
                            building.type === 'maintenance' ? 'fa-tools text-orange-600' :
                            'fa-warehouse text-gray-600'
                          }`}></i>
                        </div>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Type:</span>
                            <span className="font-medium capitalize">{building.type}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Floors:</span>
                            <span className="font-medium">{building.totalFloors}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Units:</span>
                            <span className="font-medium">{building.totalUnits}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Consumption:</span>
                            <span className="font-semibold">{consumption.toFixed(1)} kWh</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Cost:</span>
                            <span className="font-semibold text-primary-600">
                              ₱{parseFloat(building.totalCost || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}

      {/* Selected Building Info Panel */}
      {selectedBuilding && (
        <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-xl border border-gray-200 p-6 max-w-md z-50 animate-fade-in">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h4 className="font-semibold text-gray-900 text-lg">{selectedBuilding.name}</h4>
              <p className="text-sm text-gray-600 mt-1 capitalize">{selectedBuilding.type}</p>
            </div>
            <button
              onClick={() => setSelectedBuilding(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
          <div className="space-y-2 text-sm mb-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Branch:</span>
              <span className="font-medium">
                {powerPlantData.branches.find(b => b.id === selectedBuilding.branchId)?.name}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Floors:</span>
              <span className="font-medium">{selectedBuilding.totalFloors}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Units:</span>
              <span className="font-medium">{selectedBuilding.totalUnits}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Consumption:</span>
              <span className="font-medium">{selectedBuilding.totalConsumption} kWh</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Cost:</span>
              <span className="font-semibold text-primary-600">
                ₱{parseFloat(selectedBuilding.totalCost || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Avg per Unit:</span>
              <span className="font-medium">{selectedBuilding.avgConsumption} kWh</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Area:</span>
              <span className="font-medium">{selectedBuilding.area} sqm</span>
            </div>
          </div>
          <div className="pt-4 border-t border-gray-200">
            <button className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium">
              View Building Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BuildingMap;
