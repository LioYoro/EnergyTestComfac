import React, { useState, useMemo } from 'react';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { powerPlantData } from '../data/powerPlantData';
import { calculateBuildingMetrics, calculateBranchMetrics, calculateFloorMetrics, calculatePowerPlantStatistics } from '../utils/filterUtils';
import { useEnergyData } from '../hooks/useEnergyData';
import StatisticsCards from './StatisticsCards';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Dashboard = ({ statistics, units, filters }) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const { summary, hourlyData, availableDates, loading: energyLoading } = useEnergyData(selectedDate);
  
  // Ensure we have units data
  const displayUnits = units && units.length > 0 ? units : [];
  
  // Calculate statistics from units if not provided
  const displayStatistics = statistics && Object.keys(statistics).length > 0 
    ? statistics 
    : calculatePowerPlantStatistics(displayUnits);

  // Map weekday string to JS getDay index
  const weekdayMap = {
    sunday: 0,
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6
  };

  // Set default date to first available date or match selected weekday
  React.useEffect(() => {
    if (availableDates.length === 0) return;

    // If user selected a specific weekday, pick the first date matching it
    if (filters?.weekday && filters.weekday !== 'all') {
      const targetDay = weekdayMap[filters.weekday];
      const match = availableDates.find(d => {
        const day = new Date(d).getDay();
        return day === targetDay;
      });
      if (match) {
        setSelectedDate(match);
        return;
      }
    }

    // Fallback: first available date
    if (!selectedDate) {
      setSelectedDate(availableDates[0]);
    }
  }, [availableDates, selectedDate, filters?.weekday]);

  // Calculate power plant overview data
  const dashboardData = useMemo(() => {
    // Consumption by equipment type
    const consumptionByType = {};
    displayUnits.forEach(unit => {
      if (!consumptionByType[unit.equipmentType]) {
        consumptionByType[unit.equipmentType] = 0;
      }
      consumptionByType[unit.equipmentType] += unit.consumption;
    });

    // Consumption by floor (primary focus)
    const floorMetrics = powerPlantData.floors.map(floor => 
      calculateFloorMetrics(floor.id, displayUnits)
    );

    // Consumption by building (for reference - only one building)
    const buildingMetrics = powerPlantData.buildings.map(building => 
      calculateBuildingMetrics(building.id, displayUnits)
    );

    // Consumption by branch (for reference - only one branch)
    const branchMetrics = powerPlantData.branches.map(branch => 
      calculateBranchMetrics(branch.id, displayUnits)
    );

    // Top 5 consuming units
    const topUnits = [...displayUnits]
      .sort((a, b) => b.consumption - a.consumption)
      .slice(0, 5)
      .map(unit => {
        const floor = powerPlantData.floors.find(f => f.id === unit.floorId);
        const building = powerPlantData.buildings.find(b => b.id === floor?.buildingId);
        return {
          ...unit,
          floorName: floor?.name,
          buildingName: building?.name
        };
      });

    // Daily trend (simulated last 7 days)
    const totalConsumption = parseFloat(displayStatistics.totalConsumption || 0);
    const dailyTrend = Array.from({ length: 7 }, (_, i) => {
      return totalConsumption * (0.85 + Math.random() * 0.3);
    });

    // Peak hours analysis - Use backend data if available
    let peakHours = displayStatistics.peakHours || {};
    let peakHour = displayStatistics.peakHour || 'N/A';
    
    if (hourlyData && hourlyData.hourly_data) {
      // Build peak hours from backend hourly data
      peakHours = {};
      hourlyData.hourly_data.forEach(hour => {
        peakHours[hour.hour] = hour.total_energy;
      });
      if (hourlyData.peak_hour && hourlyData.peak_hour.hour !== null) {
        peakHour = `${hourlyData.peak_hour.hour}:00`;
      }
    }

    return {
      consumptionByType,
      floorMetrics,
      buildingMetrics,
      branchMetrics,
      topUnits,
      dailyTrend,
      peakHours,
      peakHour,
      summary // Include backend summary
    };
  }, [displayUnits, displayStatistics, hourlyData]);

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

  const granularity = filters?.timeGranularity || 'day';

  // Unit display helper: when minute granularity, show Wh for readability
  const toDisplayValue = (v) => {
    const num = parseFloat(v) || 0;
    return granularity === 'minute' ? num * 1000 : num;
  };
  const displayUnitLabel = granularity === 'minute' ? 'Consumption (Wh)' : 'Consumption (kWh)';

  // Equipment type chart data
  const equipmentTypeData = {
    labels: Object.keys(dashboardData.consumptionByType).slice(0, 8),
    datasets: [{
      label: displayUnitLabel,
      data: Object.keys(dashboardData.consumptionByType).slice(0, 8).map(type => toDisplayValue(dashboardData.consumptionByType[type])),
      backgroundColor: [
        '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6',
        '#ef4444', '#06b6d4', '#84cc16', '#f97316'
      ],
      borderColor: [
        '#2563eb', '#059669', '#d97706', '#7c3aed',
        '#dc2626', '#0891b2', '#65a30d', '#ea580c'
      ],
      borderWidth: 2,
      borderRadius: 6
    }]
  };

  // Floor comparison chart (primary focus)
  const floorComparisonData = {
    labels: (dashboardData.floorMetrics || []).map(f => f.floorName),
    datasets: [{
      label: displayUnitLabel,
      data: (dashboardData.floorMetrics || []).map(f => toDisplayValue(f.totalConsumption)),
      backgroundColor: ['#3b82f6', '#10b981', '#f59e0b'],
      borderColor: ['#2563eb', '#059669', '#d97706'],
      borderWidth: 2,
      borderRadius: 6
    }]
  };

  // Building comparison chart (for reference - only one building)
  const buildingComparisonData = {
    labels: (dashboardData.buildingMetrics || []).slice(0, 6).map(b => b.buildingName),
    datasets: [{
      label: displayUnitLabel,
      data: (dashboardData.buildingMetrics || []).slice(0, 6).map(b => toDisplayValue(b.totalConsumption)),
      backgroundColor: '#3b82f6',
      borderColor: '#2563eb',
      borderWidth: 1,
      borderRadius: 4
    }]
  };

  // Branch comparison chart (for reference - only one branch)
  const branchComparisonData = {
    labels: (dashboardData.branchMetrics || []).map(b => b.branchName),
    datasets: [{
      label: displayUnitLabel,
      data: (dashboardData.branchMetrics || []).map(b => toDisplayValue(b.totalConsumption)),
      backgroundColor: ['#10b981'],
      borderColor: ['#059669'],
      borderWidth: 2,
      borderRadius: 6
    }]
  };

  // Cost breakdown by equipment type
  const costBreakdownData = {
    labels: Object.keys(dashboardData.consumptionByType).slice(0, 5),
    datasets: [{
      data: Object.keys(dashboardData.consumptionByType).slice(0, 5).map(type => 
        dashboardData.consumptionByType[type] * 10
      ),
      backgroundColor: ['#8b5cf6', '#ef4444', '#3b82f6', '#10b981', '#f59e0b'],
      borderColor: '#fff',
      borderWidth: 2
    }]
  };

  // Daily trend chart
  const dailyTrendData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      label: 'Daily Consumption (kWh)',
      data: dashboardData.dailyTrend,
      borderColor: '#10b981',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      borderWidth: 2,
      fill: true,
      tension: 0.4
    }]
  };

  // Peak hours chart - Use backend hourly data if available
  const peakHoursData = useMemo(() => {
    if (hourlyData && hourlyData.hourly_data && hourlyData.hourly_data.length > 0) {
      // Use backend hourly data
      return {
        labels: hourlyData.hourly_data.map(h => `${h.hour}:00`),
        datasets: [{
          label: 'Energy Consumption (Wh)',
          data: hourlyData.hourly_data.map(h => h.total_energy),
          backgroundColor: '#f59e0b',
          borderColor: '#d97706',
          borderWidth: 1,
          borderRadius: 4
        }]
      };
    } else {
      // Fallback to mock data
      return {
        labels: Object.keys(dashboardData.peakHours).sort((a, b) => a - b).map(h => `${h}:00`),
        datasets: [{
          label: displayUnitLabel,
          data: Object.keys(dashboardData.peakHours).sort((a, b) => a - b).map(h => toDisplayValue(dashboardData.peakHours[h])),
          backgroundColor: '#f59e0b',
          borderColor: '#d97706',
          borderWidth: 1,
          borderRadius: 4
        }]
      };
    }
  }, [hourlyData, dashboardData.peakHours, displayUnitLabel, toDisplayValue]);

  return (
    <div className="space-y-6">
      {/* Date Selector removed per request */}

      {/* Statistics Cards */}
      <StatisticsCards statistics={displayStatistics} summary={summary} />

      {/* Power Plant Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Branches */}
        <div className="stat-card bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Branches</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{powerPlantData.branches.length}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
              <i className="fas fa-code-branch text-indigo-600 text-xl"></i>
            </div>
          </div>
        </div>

        {/* Total Buildings */}
        <div className="stat-card bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Buildings</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{powerPlantData.buildings.length}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <i className="fas fa-building text-blue-600 text-xl"></i>
            </div>
          </div>
        </div>

        {/* Total Floors */}
        <div className="stat-card bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Floors</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{powerPlantData.floors.length}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
              <i className="fas fa-layer-group text-purple-600 text-xl"></i>
            </div>
          </div>
        </div>

        {/* Peak Hour */}
        <div className="stat-card bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Peak Hour</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{dashboardData.peakHour}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
              <i className="fas fa-clock text-orange-600 text-xl"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 1: Equipment Type & Floor Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Consumption by Equipment Type */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200 px-6 py-4">
            <h3 className="text-lg font-semibold text-gray-900">Consumption by Equipment Type</h3>
            <p className="text-gray-600 text-sm mt-1">Energy usage breakdown by equipment type</p>
          </div>
          <div className="p-6">
            <div className="chart-container" style={{ height: '300px' }}>
              <Bar data={equipmentTypeData} options={chartOptions} />
            </div>
          </div>
        </div>

        {/* Floor Comparison */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200 px-6 py-4">
            <h3 className="text-lg font-semibold text-gray-900">Floor Comparison</h3>
            <p className="text-gray-600 text-sm mt-1">
              Energy consumption by floor ({granularity} view)
            </p>
          </div>
          <div className="p-6">
            <div className="chart-container" style={{ height: '300px' }}>
              <Bar data={floorComparisonData} options={chartOptions} />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 2: Conditional rendering based on granularity */}
      {(granularity === 'day' || granularity === 'week') && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Branch Comparison */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="border-b border-gray-200 px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-900">Branch Comparison</h3>
              <p className="text-gray-600 text-sm mt-1">Energy consumption across branches</p>
            </div>
            <div className="p-6">
              <div className="chart-container" style={{ height: '300px' }}>
                <Bar data={branchComparisonData} options={chartOptions} />
              </div>
            </div>
          </div>

          {/* Daily Trend */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="border-b border-gray-200 px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-900">Weekly Consumption Trend</h3>
              <p className="text-gray-600 text-sm mt-1">Last 7 days consumption pattern</p>
            </div>
            <div className="p-6">
              <div className="chart-container" style={{ height: '300px' }}>
                <Line data={dailyTrendData} options={chartOptions} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Charts Row 3: Cost Breakdown & Peak Hours */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cost Breakdown */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200 px-6 py-4">
            <h3 className="text-lg font-semibold text-gray-900">Cost Breakdown</h3>
            <p className="text-gray-600 text-sm mt-1">Total cost distribution by equipment type</p>
          </div>
          <div className="p-6">
            <div className="chart-container" style={{ height: '300px' }}>
              <Doughnut 
                data={costBreakdownData} 
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

        {/* Peak Hours / Hourly Consumption */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200 px-6 py-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {hourlyData ? 'Hourly Consumption' : 'Peak Hours Analysis'}
            </h3>
            <p className="text-gray-600 text-sm mt-1">
              {hourlyData 
                ? `Energy consumption by hour for ${selectedDate || 'selected date'}`
                : 'Consumption distribution by peak hours'
              }
              {hourlyData?.peak_hour && (
                <span className="ml-2 text-primary-600 font-medium">
                  • Peak: {hourlyData.peak_hour.hour}:00 ({hourlyData.peak_hour.total_energy.toFixed(2)} Wh)
                </span>
              )}
            </p>
          </div>
          <div className="p-6">
            <div className="chart-container" style={{ height: '300px' }}>
              <Bar data={peakHoursData} options={chartOptions} />
            </div>
          </div>
        </div>
      </div>

      {/* Top 5 Consuming Units */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200 px-6 py-4">
          <h3 className="text-lg font-semibold text-gray-900">Top 5 Consuming Units</h3>
          <p className="text-gray-600 text-sm mt-1">Highest energy consuming equipment units</p>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {dashboardData.topUnits.map((unit, index) => (
              <div key={unit.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                    index === 0 ? 'bg-yellow-500' : 
                    index === 1 ? 'bg-gray-400' : 
                    index === 2 ? 'bg-orange-500' : 'bg-gray-300'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{unit.name}</p>
                    <p className="text-sm text-gray-600">{unit.buildingName} • {unit.floorName} • {unit.equipmentType}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{unit.consumption.toFixed(1)} kWh</p>
                  <p className="text-sm text-primary-600">
                    ₱{parseFloat(unit.cost || unit.consumption * 10).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
