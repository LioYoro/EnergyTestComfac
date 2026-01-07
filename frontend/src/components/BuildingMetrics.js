import React, { useMemo } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { powerPlantData } from '../data/powerPlantData';
import { calculateBuildingMetrics } from '../utils/filterUtils';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const BuildingMetrics = ({ units, filters }) => {
  const buildingData = useMemo(() => {
    let buildingsToShow = powerPlantData.buildings;

    // Filter by branch if selected
    if (filters.branch && filters.branch !== 'all') {
      buildingsToShow = buildingsToShow.filter(b => b.branchId === parseInt(filters.branch));
    }

    // Calculate metrics for each building
    const buildingMetrics = buildingsToShow.map(building => 
      calculateBuildingMetrics(building.id, units)
    );

    // Sort by consumption
    buildingMetrics.sort((a, b) => parseFloat(b.totalConsumption) - parseFloat(a.totalConsumption));

    return buildingMetrics;
  }, [units, filters]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          font: { size: 11 },
          padding: 15
        }
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

  // Building comparison chart
  const buildingChartData = {
    labels: buildingData.map(b => b.buildingName),
    datasets: [{
      label: 'Consumption (kWh)',
      data: buildingData.map(b => parseFloat(b.totalConsumption)),
      backgroundColor: '#3b82f6',
      borderColor: '#2563eb',
      borderWidth: 1,
      borderRadius: 4
    }]
  };

  // Consumption by building type
  const buildingTypeConsumption = {};
  buildingData.forEach(building => {
    if (!buildingTypeConsumption[building.buildingType]) {
      buildingTypeConsumption[building.buildingType] = 0;
    }
    buildingTypeConsumption[building.buildingType] += parseFloat(building.totalConsumption);
  });

  const buildingTypeData = {
    labels: Object.keys(buildingTypeConsumption),
    datasets: [{
      data: Object.values(buildingTypeConsumption),
      backgroundColor: ['#8b5cf6', '#ef4444', '#3b82f6', '#10b981', '#f59e0b'],
      borderColor: '#fff',
      borderWidth: 2
    }]
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900">Building-Level Analytics</h2>
        <p className="text-gray-600 mt-1">Comprehensive metrics and insights for each building</p>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Building Comparison Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200 px-6 py-4">
            <h3 className="text-lg font-semibold text-gray-900">Building Consumption Comparison</h3>
            <p className="text-gray-600 text-sm mt-1">Energy consumption across all buildings</p>
          </div>
          <div className="p-6">
            <div className="chart-container" style={{ height: '400px' }}>
              <Bar data={buildingChartData} options={chartOptions} />
            </div>
          </div>
        </div>

        {/* Building Type Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200 px-6 py-4">
            <h3 className="text-lg font-semibold text-gray-900">Consumption by Building Type</h3>
            <p className="text-gray-600 text-sm mt-1">Distribution across building categories</p>
          </div>
          <div className="p-6">
            <div className="chart-container" style={{ height: '400px' }}>
              <Doughnut 
                data={buildingTypeData} 
                options={{
                  ...chartOptions,
                  plugins: {
                    ...chartOptions.plugins,
                    legend: {
                      ...chartOptions.plugins.legend,
                      position: 'bottom'
                    }
                  }
                }} 
              />
            </div>
          </div>
        </div>
      </div>

      {/* Building Details Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200 px-6 py-4">
          <h3 className="text-lg font-semibold text-gray-900">Building Details</h3>
          <p className="text-gray-600 text-sm mt-1">Detailed metrics for each building</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th className="px-6 py-3">Building</th>
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3">Floors</th>
                <th className="px-6 py-3">Units</th>
                <th className="px-6 py-3">Consumption (kWh)</th>
                <th className="px-6 py-3">Cost (PHP)</th>
                <th className="px-6 py-3">Avg per Unit</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {buildingData.map((building) => (
                <tr key={building.buildingId} className="bg-white border-b hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{building.buildingName}</td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {building.buildingType}
                    </span>
                  </td>
                  <td className="px-6 py-4">{building.totalFloors}</td>
                  <td className="px-6 py-4">{building.totalUnits}</td>
                  <td className="px-6 py-4 font-medium">{building.totalConsumption} kWh</td>
                  <td className="px-6 py-4 font-semibold text-primary-600">
                    ₱{parseFloat(building.totalCost).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4">{building.avgConsumption} kWh</td>
                  <td className="px-6 py-4">
                    <button className="px-3 py-1 bg-primary-100 text-primary-700 rounded text-sm hover:bg-primary-200">
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Floor Breakdown by Building */}
      <div className="space-y-4">
        {buildingData.slice(0, 3).map((building) => (
          <div key={building.buildingId} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="border-b border-gray-200 px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-900">{building.buildingName}</h3>
              <p className="text-gray-600 text-sm mt-1">Floor breakdown and consumption</p>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {building.floors.map((floor) => (
                  <div key={floor.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{floor.name}</p>
                      <p className="text-sm text-gray-600">{floor.units.length} units • {floor.area} sqm</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{floor.consumption.toFixed(1)} kWh</p>
                      <p className="text-sm text-primary-600">
                        ₱{(floor.consumption * 10).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BuildingMetrics;

