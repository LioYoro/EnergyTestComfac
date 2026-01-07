import React from 'react';

const LocationComparison = ({ locations, onViewLocation }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-green-100 text-green-800';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'residential':
        return 'bg-purple-100 text-purple-800';
      case 'commercial':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="border-b border-gray-200 px-6 py-4">
        <h3 className="text-lg font-semibold text-gray-900">Location Comparison</h3>
      </div>
      <div className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th className="px-6 py-3">Location</th>
                <th className="px-6 py-3">City</th>
                <th className="px-6 py-3">Street</th>
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3">Consumption (kWh)</th>
                <th className="px-6 py-3">Cost (PHP)</th>
                <th className="px-6 py-3">Peak Time</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {locations.map((location) => (
                <tr key={location.id} className="bg-white border-b hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{location.name}</td>
                  <td className="px-6 py-4 font-medium">{location.city}</td>
                  <td className="px-6 py-4">{location.street}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(location.type)}`}>
                      {location.type.charAt(0).toUpperCase() + location.type.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium">{location.consumption.toFixed(1)} kWh</td>
                  <td className="px-6 py-4 font-semibold text-primary-600">
                    ₱{parseFloat(location.cost || location.consumption * 10).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4">{location.peakTime}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(location.status)}`}>
                      {location.status.charAt(0).toUpperCase() + location.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => onViewLocation(location)}
                      className="px-3 py-1 bg-primary-100 text-primary-700 rounded text-sm hover:bg-primary-200"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default LocationComparison;

