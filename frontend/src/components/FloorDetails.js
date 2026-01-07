import React, { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { powerPlantData } from '../data/powerPlantData';
import { calculateFloorMetrics } from '../utils/filterUtils';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const FloorDetails = ({ units, filters }) => {
  const floorData = useMemo(() => {
    let floorsToShow = powerPlantData.floors;

    // Filter by floor if selected (primary floor filter from sidebar)
    if (filters.floor && filters.floor !== 'all') {
      const floorId = parseInt(filters.floor);
      floorsToShow = floorsToShow.filter(f => f.id === floorId);
    }

    // Calculate metrics for each floor
    const floorMetrics = floorsToShow.map(floor => 
      calculateFloorMetrics(floor.id, units)
    );

    // Sort by consumption
    floorMetrics.sort((a, b) => parseFloat(b.totalConsumption) - parseFloat(a.totalConsumption));

    return floorMetrics;
  }, [units, filters]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        titleFont: { size: 12 },
        bodyFont: { size: 11 },
        padding: 10
      }
    },
    scales: {
      x: {
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          font: { size: 10 },
          color: '#6b7280'
        }
      },
      y: {
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          font: { size: 10 },
          color: '#6b7280'
        },
        beginAtZero: true
      }
    }
  };

  // Floor comparison chart
  const floorChartData = {
    labels: floorData.slice(0, 10).map(f => `${f.buildingName} - ${f.floorName}`),
    datasets: [{
      label: 'Consumption (kWh)',
      data: floorData.slice(0, 10).map(f => parseFloat(f.totalConsumption)),
      backgroundColor: '#10b981',
      borderColor: '#059669',
      borderWidth: 1,
      borderRadius: 4
    }]
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900">Floor-Level Analytics</h2>
        <p className="text-gray-600 mt-1">
          Total energy consumption per floor (kWh) for the full 8-day historical period, plus average per day.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="stat-card bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Floors</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{floorData.length}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
              <i className="fas fa-layer-group text-purple-600 text-xl"></i>
            </div>
          </div>
        </div>

        <div className="stat-card bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Units</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {floorData.reduce((sum, f) => sum + f.totalUnits, 0)}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <i className="fas fa-cogs text-blue-600 text-xl"></i>
            </div>
          </div>
        </div>

        <div className="stat-card bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Avg per Floor</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {floorData.length > 0 
                  ? (floorData.reduce((sum, f) => sum + parseFloat(f.totalConsumption), 0) / floorData.length).toFixed(1)
                  : '0.0'} <span className="text-base">kWh</span>
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <i className="fas fa-chart-bar text-green-600 text-xl"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Floor Comparison Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200 px-6 py-4">
          <h3 className="text-lg font-semibold text-gray-900">Top Floors by Consumption</h3>
          <p className="text-gray-600 text-sm mt-1">Top 10 floors ranked by energy consumption</p>
        </div>
        <div className="p-6">
          <div className="chart-container" style={{ height: '400px' }}>
            <Bar data={floorChartData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Floor Details Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200 px-6 py-4">
          <h3 className="text-lg font-semibold text-gray-900">Floor Details</h3>
          <p className="text-gray-600 text-sm mt-1">Comprehensive metrics for each floor</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th className="px-6 py-3">Floor</th>
                <th className="px-6 py-3">Building</th>
                <th className="px-6 py-3">Floor Number</th>
                <th className="px-6 py-3">Units</th>
                <th className="px-6 py-3">Total (8 Days) kWh</th>
                <th className="px-6 py-3">Avg per Day (kWh/day)</th>
                <th className="px-6 py-3">Cost (PHP)</th>
                <th className="px-6 py-3">Avg per Unit (kWh)</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {floorData.map((floor) => (
                <tr key={floor.floorId} className="bg-white border-b hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{floor.floorName}</td>
                  <td className="px-6 py-4">{floor.buildingName}</td>
                  <td className="px-6 py-4">{floor.floorNumber}</td>
                  <td className="px-6 py-4">{floor.totalUnits}</td>
                  <td className="px-6 py-4 font-medium">{floor.totalConsumption} kWh</td>
                  <td className="px-6 py-4">
                    {(parseFloat(floor.totalConsumption) / 8).toFixed(2)} kWh/day
                  </td>
                  <td className="px-6 py-4 font-semibold text-primary-600">
                    ₱{parseFloat(floor.totalCost).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4">{floor.avgConsumption} kWh</td>
                  <td className="px-6 py-4">
                    <button className="px-3 py-1 bg-primary-100 text-primary-700 rounded text-sm hover:bg-primary-200">
                      View Units
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Unit Details by Floor */}
      <div className="space-y-4">
        {floorData.slice(0, 5).map((floor) => (
          <div key={floor.floorId} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="border-b border-gray-200 px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {floor.buildingName} - {floor.floorName}
              </h3>
              <p className="text-gray-600 text-sm mt-1">Unit details and consumption</p>
            </div>
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                      <th className="px-4 py-2">Unit Name</th>
                      <th className="px-4 py-2">Equipment Type</th>
                      <th className="px-4 py-2">Consumption (kWh)</th>
                      <th className="px-4 py-2">Cost (PHP)</th>
                      <th className="px-4 py-2">Status</th>
                      <th className="px-4 py-2">Peak Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {floor.units.map((unit) => (
                      <tr key={unit.id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-2 font-medium">{unit.name}</td>
                        <td className="px-4 py-2">
                          <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
                            {unit.equipmentType}
                          </span>
                        </td>
                        <td className="px-4 py-2">{unit.consumption.toFixed(1)} kWh</td>
                        <td className="px-4 py-2 text-primary-600">
                          ₱{parseFloat(unit.cost || unit.consumption * 10).toFixed(2)}
                        </td>
                        <td className="px-4 py-2">
                          <span className={`px-2 py-1 rounded text-xs ${
                            unit.status === 'operational' ? 'bg-green-100 text-green-800' :
                            unit.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {unit.status}
                          </span>
                        </td>
                        <td className="px-4 py-2">{unit.peakTime}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FloorDetails;

