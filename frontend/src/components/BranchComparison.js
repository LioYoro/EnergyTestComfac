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
  Legend
} from 'chart.js';
import { powerPlantData } from '../data/powerPlantData';
import { calculateBranchMetrics } from '../utils/filterUtils';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const BranchComparison = ({ units }) => {
  const branchData = useMemo(() => {
    return powerPlantData.branches.map(branch => 
      calculateBranchMetrics(branch.id, units)
    );
  }, [units]);

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

  // Branch comparison chart
  const branchComparisonData = {
    labels: branchData.map(b => b.branchName),
    datasets: [
      {
        label: 'Consumption (kWh)',
        data: branchData.map(b => parseFloat(b.totalConsumption)),
        backgroundColor: ['#10b981', '#3b82f6', '#8b5cf6'],
        borderColor: ['#059669', '#2563eb', '#7c3aed'],
        borderWidth: 2,
        borderRadius: 6
      },
      {
        label: 'Cost (PHP)',
        data: branchData.map(b => parseFloat(b.totalCost)),
        backgroundColor: ['#34d399', '#60a5fa', '#a78bfa'],
        borderColor: ['#10b981', '#3b82f6', '#8b5cf6'],
        borderWidth: 2,
        borderRadius: 6
      }
    ]
  };

  // Building count per branch
  const buildingCountData = {
    labels: branchData.map(b => b.branchName),
    datasets: [{
      label: 'Number of Buildings',
      data: branchData.map(b => b.totalBuildings),
      backgroundColor: '#f59e0b',
      borderColor: '#d97706',
      borderWidth: 1,
      borderRadius: 4
    }]
  };

  // Efficiency comparison (consumption per building)
  const efficiencyData = {
    labels: branchData.map(b => b.branchName),
    datasets: [{
      label: 'Avg Consumption per Building (kWh)',
      data: branchData.map(b => 
        b.totalBuildings > 0 ? parseFloat(b.totalConsumption) / b.totalBuildings : 0
      ),
      borderColor: '#10b981',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      borderWidth: 2,
      fill: true,
      tension: 0.4
    }]
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900">Branch Comparison</h2>
        <p className="text-gray-600 mt-1">Compare performance across all power plant branches</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {branchData.map((branch) => (
          <div key={branch.branchId} className="stat-card bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-gray-500">{branch.branchName}</p>
                <p className="text-xs text-gray-400 mt-1">{branch.branchType}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                <i className="fas fa-code-branch text-indigo-600"></i>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Buildings:</span>
                <span className="font-medium">{branch.totalBuildings}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Units:</span>
                <span className="font-medium">{branch.totalUnits}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Consumption:</span>
                <span className="font-medium">{branch.totalConsumption} kWh</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Cost:</span>
                <span className="font-semibold text-primary-600">
                  ₱{parseFloat(branch.totalCost).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Branch Consumption Comparison */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200 px-6 py-4">
            <h3 className="text-lg font-semibold text-gray-900">Consumption & Cost Comparison</h3>
            <p className="text-gray-600 text-sm mt-1">Energy consumption and cost across branches</p>
          </div>
          <div className="p-6">
            <div className="chart-container" style={{ height: '350px' }}>
              <Bar data={branchComparisonData} options={chartOptions} />
            </div>
          </div>
        </div>

        {/* Building Count */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200 px-6 py-4">
            <h3 className="text-lg font-semibold text-gray-900">Building Distribution</h3>
            <p className="text-gray-600 text-sm mt-1">Number of buildings per branch</p>
          </div>
          <div className="p-6">
            <div className="chart-container" style={{ height: '350px' }}>
              <Bar data={buildingCountData} options={chartOptions} />
            </div>
          </div>
        </div>
      </div>

      {/* Efficiency Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200 px-6 py-4">
          <h3 className="text-lg font-semibold text-gray-900">Efficiency Comparison</h3>
          <p className="text-gray-600 text-sm mt-1">Average consumption per building by branch</p>
        </div>
        <div className="p-6">
          <div className="chart-container" style={{ height: '300px' }}>
            <Line data={efficiencyData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Branch Details */}
      <div className="space-y-4">
        {branchData.map((branch) => (
          <div key={branch.branchId} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{branch.branchName}</h3>
                  <p className="text-gray-600 text-sm mt-1">{branch.branchType} • {branch.totalBuildings} buildings</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">{branch.totalConsumption} kWh</p>
                  <p className="text-lg font-semibold text-primary-600">
                    ₱{parseFloat(branch.totalCost).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {branch.buildings.map((building) => (
                  <div key={building.buildingId} className="p-4 bg-gray-50 rounded-lg">
                    <p className="font-medium text-gray-900">{building.buildingName}</p>
                    <p className="text-sm text-gray-600 mt-1">{building.buildingType}</p>
                    <div className="mt-2 space-y-1 text-sm">
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
                        <span className="font-medium">{building.totalConsumption} kWh</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Cost:</span>
                        <span className="font-semibold text-primary-600">
                          ₱{parseFloat(building.totalCost).toFixed(2)}
                        </span>
                      </div>
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

export default BranchComparison;

