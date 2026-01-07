import React, { useState } from 'react';

const LocationMap = ({ locations, onLocationClick }) => {
  const [selectedLocation, setSelectedLocation] = useState(null);

  const getPointColor = (consumption) => {
    if (consumption < 50) return '#10b981'; // Green for low
    if (consumption < 150) return '#f59e0b'; // Yellow for medium
    return '#ef4444'; // Red for high
  };

  const handlePointClick = (location) => {
    setSelectedLocation(location);
    onLocationClick(location);
  };

  const typeColors = {
    residential: '#8b5cf6',
    commercial: '#ef4444',
    industrial: '#3b82f6'
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Location Energy Map - Laguna, Philippines</h3>
            <p className="text-gray-600 mt-1">Interactive map showing energy consumption across different locations in Laguna</p>
          </div>
          <div className="mt-4 md:mt-0">
            <div className="flex items-center">
              <div className="location-marker bg-energy-residential"></div>
              <span className="text-sm text-gray-700 mr-3">Residential</span>
              <div className="location-marker bg-energy-commercial"></div>
              <span className="text-sm text-gray-700 mr-3">Commercial</span>
              <div className="location-marker bg-energy-industrial"></div>
              <span className="text-sm text-gray-700">Industrial</span>
            </div>
          </div>
        </div>
      </div>
      <div className="p-6">
        <div className="map-container relative">
          <div id="energy-map" className="relative w-full h-full">
            {locations.map((location, index) => {
              const left = 10 + (index * 7.5) % 80;
              const top = 10 + Math.floor(index / 10) * 20;
              const color = getPointColor(location.consumption);
              
              return (
                <div
                  key={location.id}
                  className="map-point"
                  style={{
                    left: `${left}%`,
                    top: `${top}%`,
                    backgroundColor: color,
                    boxShadow: `0 0 0 0 ${color}80`
                  }}
                  title={`${location.name}, ${location.city} - ${location.consumption} kWh (₱${parseFloat(location.cost || location.consumption * 10).toFixed(2)})`}
                  onClick={() => handlePointClick(location)}
                />
              );
            })}
          </div>
          
          {/* Map Legend */}
          <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg">
            <h4 className="font-medium text-gray-900 text-sm mb-2">Consumption Levels</h4>
            <div className="space-y-1">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                <span className="text-xs text-gray-700">Low (&lt; 50 kWh)</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                <span className="text-xs text-gray-700">Medium (50-150 kWh)</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                <span className="text-xs text-gray-700">High (&gt; 150 kWh)</span>
              </div>
            </div>
          </div>
          
          {/* Selected Location Info */}
          {selectedLocation && (
            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg max-w-xs animate-fade-in">
              <h4 className="font-medium text-gray-900 mb-2">{selectedLocation.name}</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">City:</span>
                  <span className="text-sm font-medium text-gray-900">{selectedLocation.city}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Consumption:</span>
                  <span className="text-sm font-medium text-gray-900">{selectedLocation.consumption} kWh</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Cost:</span>
                  <span className="text-sm font-semibold text-primary-600">
                    ₱{parseFloat(selectedLocation.cost || selectedLocation.consumption * 10).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Street:</span>
                  <span className="text-sm font-medium text-gray-900">{selectedLocation.street}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Type:</span>
                  <span 
                    className="text-sm font-medium"
                    style={{ color: typeColors[selectedLocation.type] }}
                  >
                    {selectedLocation.type.charAt(0).toUpperCase() + selectedLocation.type.slice(1)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Region:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {selectedLocation.region.charAt(0).toUpperCase() + selectedLocation.region.slice(1)} Laguna
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedLocation(null)}
                className="mt-3 w-full px-3 py-1.5 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LocationMap;

