import React, { useState, useEffect } from 'react';
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

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const StreetAnalytics = ({ locations }) => {
  const [sortBy, setSortBy] = useState('consumption');
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });

  useEffect(() => {
    // Calculate street consumption
    const streetConsumption = {};
    locations.forEach(location => {
      if (!streetConsumption[location.street]) {
        streetConsumption[location.street] = 0;
      }
      streetConsumption[location.street] += location.consumption;
    });

    // Get unique streets
    let streets = Object.keys(streetConsumption).map(street => ({
      name: street,
      consumption: streetConsumption[street]
    }));

    // Sort streets
    if (sortBy === 'consumption') {
      streets.sort((a, b) => b.consumption - a.consumption);
    } else if (sortBy === 'name') {
      streets.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'locations') {
      const locationCounts = {};
      locations.forEach(loc => {
        locationCounts[loc.street] = (locationCounts[loc.street] || 0) + 1;
      });
      streets.sort((a, b) => (locationCounts[b.name] || 0) - (locationCounts[a.name] || 0));
    }

    setChartData({
      labels: streets.map(s => s.name),
      datasets: [{
        label: 'Energy Consumption (kWh)',
        data: streets.map(s => s.consumption),
        backgroundColor: [
          '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6',
          '#ef4444', '#06b6d4', '#84cc16', '#f97316'
        ],
        borderColor: [
          '#2563eb', '#059669', '#d97706', '#7c3aed',
          '#dc2626', '#0891b2', '#65a30d', '#ea580c'
        ],
        borderWidth: 1,
        borderRadius: 4
      }]
    });
  }, [locations, sortBy]);

  const options = {
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
        bodyFont: { size: 12 },
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
          font: { size: 11 },
          color: '#6b7280'
        }
      },
      y: {
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          font: { size: 11 },
          color: '#6b7280'
        },
        beginAtZero: true
      }
    },
    interaction: {
      intersect: false,
      mode: 'nearest'
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Street-Level Energy Consumption</h3>
            <p className="text-gray-600 mt-1">Compare energy usage across different streets</p>
          </div>
          <div className="mt-4 md:mt-0">
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
            >
              <option value="consumption">Sort by Consumption</option>
              <option value="name">Sort by Street Name</option>
              <option value="locations">Sort by # of Locations</option>
            </select>
          </div>
        </div>
      </div>
      <div className="p-6">
        <div className="chart-container">
          <Bar data={chartData} options={options} />
        </div>
      </div>
    </div>
  );
};

export default StreetAnalytics;

