import React, { useMemo } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { powerPlantData } from '../data/powerPlantData';
import { calculateFloorMetrics } from '../utils/filterUtils';
import { useFloorAnalytics } from '../hooks/useEnergyData';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const FloorDetails = ({ units, filters }) => {
  // Fetch floor analytics from backend
  const { floorAnalytics } = useFloorAnalytics(filters);

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

      {/* Floor-Level Peak Hour Analysis */}
      {floorAnalytics && floorAnalytics.floor_analytics && floorAnalytics.floor_analytics.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200 px-6 py-4">
            <h3 className="text-lg font-semibold text-gray-900">Floor-Level Peak Hour Analysis</h3>
            <p className="text-gray-600 text-sm mt-1">Peak consumption hours for each floor</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {floorAnalytics.floor_analytics.map((floor) => (
                <div key={floor.floor} className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">Floor {floor.floor}</h4>
                    {floor.peak_hour && (
                      <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                        Peak: {floor.peak_hour.hour}:00
                      </span>
                    )}
                  </div>
                  {floor.peak_hour ? (
                    <div className="space-y-1 text-sm">
                      <p className="text-gray-700">
                        <span className="font-medium">Peak Hour:</span> {floor.peak_hour.hour}:00
                      </p>
                      <p className="text-gray-700">
                        <span className="font-medium">Peak Energy:</span> {floor.peak_hour.total_energy.toFixed(2)} Wh
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No peak hour data available</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Daily Consumption Trends */}
      {floorAnalytics && floorAnalytics.floor_analytics && floorAnalytics.floor_analytics.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200 px-6 py-4">
            <h3 className="text-lg font-semibold text-gray-900">Daily Consumption Trends</h3>
            <p className="text-gray-600 text-sm mt-1">Consumption patterns over time for each floor</p>
          </div>
          <div className="p-6">
            {floorAnalytics.floor_analytics.map((floor) => {
              if (!floor.daily_trend || floor.daily_trend.length === 0) return null;
              
              const trendData = {
                labels: floor.daily_trend.map(d => new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
                datasets: [{
                  label: `Floor ${floor.floor} Consumption (kWh)`,
                  data: floor.daily_trend.map(d => d.total_energy / 1000),
                  borderColor: '#3b82f6',
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  borderWidth: 2,
                  fill: true,
                  tension: 0.4
                }]
              };

              return (
                <div key={floor.floor} className="mb-6">
                  <h4 className="text-md font-semibold text-gray-900 mb-3">Floor {floor.floor}</h4>
                  <div className="chart-container" style={{ height: '200px' }}>
                    <Line data={trendData} options={chartOptions} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Comparative Efficiency Metrics */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200 px-6 py-4">
          <h3 className="text-lg font-semibold text-gray-900">Comparative Efficiency Metrics</h3>
          <p className="text-gray-600 text-sm mt-1">Energy efficiency comparison across floors</p>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {floorData
              .map(floor => ({
                ...floor,
                efficiency: floor.totalUnits > 0 ? parseFloat(floor.totalConsumption) / floor.totalUnits : 0
              }))
              .sort((a, b) => a.efficiency - b.efficiency)
              .map((floor, index) => {
                const maxEfficiency = Math.max(...floorData.map(f => f.totalUnits > 0 ? parseFloat(f.totalConsumption) / f.totalUnits : 0));
                const efficiencyPercent = maxEfficiency > 0 ? (floor.efficiency / maxEfficiency) * 100 : 0;
                const isEfficient = index < Math.ceil(floorData.length / 2);
                
                return (
                  <div key={floor.floorId} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-semibold text-gray-900">{floor.floorName}</p>
                        <p className="text-sm text-gray-600">{floor.totalUnits} units</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900">
                          {floor.efficiency.toFixed(2)} kWh/unit
                        </p>
                        <span className={`text-xs px-2 py-1 rounded ${
                          isEfficient ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {isEfficient ? 'Efficient' : 'Needs Optimization'}
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className={`h-3 rounded-full transition-all ${
                          isEfficient ? 'bg-green-500' : 'bg-yellow-500'
                        }`}
                        style={{ width: `${100 - efficiencyPercent}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {/* Cost Breakdown Per Floor */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200 px-6 py-4">
          <h3 className="text-lg font-semibold text-gray-900">Cost Breakdown Per Floor</h3>
          <p className="text-gray-600 text-sm mt-1">Total cost and cost per unit for each floor</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {floorData
              .sort((a, b) => parseFloat(b.totalCost) - parseFloat(a.totalCost))
              .map((floor) => {
                const costPerUnit = floor.totalUnits > 0 ? parseFloat(floor.totalCost) / floor.totalUnits : 0;
                const maxCost = Math.max(...floorData.map(f => parseFloat(f.totalCost)));
                const costPercent = maxCost > 0 ? (parseFloat(floor.totalCost) / maxCost) * 100 : 0;
                
                return (
                  <div key={floor.floorId} className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-900">{floor.floorName}</h4>
                      <div className="text-right">
                        <p className="text-lg font-bold text-primary-600">
                          ₱{parseFloat(floor.totalCost).toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-600">
                          {floor.totalConsumption} kWh
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>Cost per Unit</span>
                          <span className="font-semibold">₱{costPerUnit.toFixed(2)}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                            style={{ width: `${costPercent}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">{floor.totalUnits} units</span>
                        <span className="text-gray-600">
                          {floor.totalUnits > 0 ? (parseFloat(floor.totalConsumption) / floor.totalUnits).toFixed(2) : '0.00'} kWh/unit
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FloorDetails;

