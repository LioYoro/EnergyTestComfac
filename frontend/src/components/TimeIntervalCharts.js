import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { locationData } from '../data/locationData';
import DateRangePicker from './DateRangePicker';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const TimeIntervalCharts = ({ locations, showOnly, dateContext = null, hourContext = null }) => {
  const [perSecondData, setPerSecondData] = useState(locationData.timeData.perSecond);
  const [perMinuteData, setPerMinuteData] = useState(locationData.timeData.perMinute);
  const [perHourData, setPerHourData] = useState(locationData.timeData.perHour);

  useEffect(() => {
    // Update per hour chart based on filtered locations
    const typeCount = {
      residential: locations.filter(l => l.type === 'residential').length,
      commercial: locations.filter(l => l.type === 'commercial').length,
      industrial: locations.filter(l => l.type === 'industrial').length
    };

    const scaleResidential = typeCount.residential / 8;
    const scaleCommercial = typeCount.commercial / 8;
    const scaleIndustrial = typeCount.industrial / 8;

    setPerHourData({
      residential: locationData.timeData.perHour.residential.map(val => val * scaleResidential),
      commercial: locationData.timeData.perHour.commercial.map(val => val * scaleCommercial),
      industrial: locationData.timeData.perHour.industrial.map(val => val * scaleIndustrial)
    });
  }, [locations]);

  // Simulate real-time updates for per-second chart
  useEffect(() => {
    const interval = setInterval(() => {
      setPerSecondData(prev => {
        const newData = [...prev];
        newData.shift();
        newData.push(Math.random() * 5 + 1);
        return newData;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          font: { size: 12 },
          padding: 20
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        titleFont: { size: 12 },
        bodyFont: { size: 12 },
        padding: 10,
        callbacks: {
          title: function(context) {
            if (dateContext) {
              return dateContext;
            }
            return context[0].label || '';
          },
          label: function(context) {
            const label = context.dataset.label || '';
            const value = context.parsed.y || 0;
            let dateTimeInfo = '';
            if (dateContext) {
              dateTimeInfo = ` • ${dateContext}`;
              if (hourContext && context.dataIndex !== undefined) {
                dateTimeInfo += ` at ${hourContext}:00`;
              }
            }
            return `${label}: ${value.toFixed(2)} kW${dateTimeInfo}`;
          }
        }
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
    },
    elements: {
      point: {
        radius: 0,
        hoverRadius: 6
      }
    }
  };

  const perSecondChartData = {
    labels: Array.from({ length: 60 }, (_, i) => {
      const baseLabel = `${i}s`;
      return dateContext ? `${baseLabel} (${dateContext})` : baseLabel;
    }),
    datasets: [{
      label: 'Energy Consumption (kW)',
      data: perSecondData,
      borderColor: '#10b981',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      borderWidth: 2,
      fill: true,
      tension: 0.4
    }]
  };

  const perMinuteChartData = {
    labels: Array.from({ length: 60 }, (_, i) => {
      const baseLabel = `${i}m`;
      return dateContext && hourContext ? `${baseLabel} (${dateContext} ${hourContext}:00)` : baseLabel;
    }),
    datasets: [{
      label: 'Energy Consumption (kW)',
      data: perMinuteData,
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      borderWidth: 2,
      fill: true,
      tension: 0.4
    }]
  };

  const perHourChartData = {
    labels: Array.from({ length: 24 }, (_, i) => {
      const baseLabel = `${i}:00`;
      return dateContext ? `${baseLabel} (${dateContext})` : baseLabel;
    }),
    datasets: [
      {
        label: 'Residential',
        data: perHourData.residential,
        borderColor: '#8b5cf6',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4
      },
      {
        label: 'Commercial',
        data: perHourData.commercial,
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4
      },
      {
        label: 'Industrial',
        data: perHourData.industrial,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4
      }
    ]
  };

  // Render only the selected chart if showOnly prop is provided
  if (showOnly === 'per-second') {
    return (
      <section id="per-second" className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Per Second Energy Consumption</h3>
              <p className="text-gray-600 mt-1">
                Real-time energy usage measured every second for selected locations
                {dateContext && <span className="ml-2 text-primary-600">• {dateContext}</span>}
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-energy-consumption mr-2"></div>
                  <span className="text-sm text-gray-700">Consumption</span>
                </div>
                <DateRangePicker defaultText="Today" />
              </div>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="chart-container">
            <Line data={perSecondChartData} options={chartOptions} />
          </div>
        </div>
      </section>
    );
  }

  if (showOnly === 'per-minute') {
    return (
      <section id="per-minute" className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Per Minute Energy Consumption</h3>
              <p className="text-gray-600 mt-1">
                Minute-by-minute energy usage trends across locations
                {dateContext && hourContext && (
                  <span className="ml-2 text-primary-600">• {dateContext} at {hourContext}:00</span>
                )}
                {dateContext && !hourContext && (
                  <span className="ml-2 text-primary-600">• {dateContext}</span>
                )}
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-energy-consumption mr-2"></div>
                  <span className="text-sm text-gray-700">Consumption</span>
                </div>
                <DateRangePicker defaultText="Last 7 Days" />
              </div>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="chart-container">
            <Line data={perMinuteChartData} options={chartOptions} />
          </div>
        </div>
      </section>
    );
  }

  if (showOnly === 'per-hour') {
    return (
      <section id="per-hour" className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Per Hour Energy Consumption</h3>
              <p className="text-gray-600 mt-1">
                Hourly energy consumption patterns by location type
                {dateContext && <span className="ml-2 text-primary-600">• Date Range: {dateContext}</span>}
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-energy-residential mr-2"></div>
                  <span className="text-sm text-gray-700 mr-3">Residential</span>
                  <div className="w-3 h-3 rounded-full bg-energy-commercial mr-2"></div>
                  <span className="text-sm text-gray-700 mr-3">Commercial</span>
                  <div className="w-3 h-3 rounded-full bg-energy-industrial mr-2"></div>
                  <span className="text-sm text-gray-700">Industrial</span>
                </div>
                <DateRangePicker defaultText="Last 30 Days" />
              </div>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="chart-container">
            <Line data={perHourChartData} options={chartOptions} />
          </div>
        </div>
      </section>
    );
  }

  // If no showOnly prop, render all charts (for backward compatibility)
  return (
    <>
      {/* Per Second Chart */}
      <section id="per-second" className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Per Second Energy Consumption</h3>
              <p className="text-gray-600 mt-1">
                Real-time energy usage measured every second for selected locations
                {dateContext && <span className="ml-2 text-primary-600">• {dateContext}</span>}
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-energy-consumption mr-2"></div>
                  <span className="text-sm text-gray-700">Consumption</span>
                </div>
                <DateRangePicker defaultText="Today" />
              </div>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="chart-container">
            <Line data={perSecondChartData} options={chartOptions} />
          </div>
        </div>
      </section>

      {/* Per Minute Chart */}
      <section id="per-minute" className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Per Minute Energy Consumption</h3>
              <p className="text-gray-600 mt-1">
                Minute-by-minute energy usage trends across locations
                {dateContext && hourContext && (
                  <span className="ml-2 text-primary-600">• {dateContext} at {hourContext}:00</span>
                )}
                {dateContext && !hourContext && (
                  <span className="ml-2 text-primary-600">• {dateContext}</span>
                )}
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-energy-consumption mr-2"></div>
                  <span className="text-sm text-gray-700">Consumption</span>
                </div>
                <DateRangePicker defaultText="Last 7 Days" />
              </div>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="chart-container">
            <Line data={perMinuteChartData} options={chartOptions} />
          </div>
        </div>
      </section>

      {/* Per Hour Chart */}
      <section id="per-hour" className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Per Hour Energy Consumption</h3>
              <p className="text-gray-600 mt-1">
                Hourly energy consumption patterns by location type
                {dateContext && <span className="ml-2 text-primary-600">• Date Range: {dateContext}</span>}
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-energy-residential mr-2"></div>
                  <span className="text-sm text-gray-700 mr-3">Residential</span>
                  <div className="w-3 h-3 rounded-full bg-energy-commercial mr-2"></div>
                  <span className="text-sm text-gray-700 mr-3">Commercial</span>
                  <div className="w-3 h-3 rounded-full bg-energy-industrial mr-2"></div>
                  <span className="text-sm text-gray-700">Industrial</span>
                </div>
                <DateRangePicker defaultText="Last 30 Days" />
              </div>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="chart-container">
            <Line data={perHourChartData} options={chartOptions} />
          </div>
        </div>
      </section>
    </>
  );
};

export default TimeIntervalCharts;

