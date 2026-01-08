import React, { useMemo, useCallback } from 'react';
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
import { useEnergyData, useWeeklyPeakHours, useFloorAnalytics } from '../hooks/useEnergyData';
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
  // Calculate initial date helper
  const getInitialDate = (dates, timeGranularity, weekday) => {
    if (!dates || dates.length === 0) return null;
    
    // If time granularity is week and weekday is selected, find matching date
    if (timeGranularity === 'week' && weekday && weekday !== 'all') {
      const weekdayMap = {
        sunday: 0,
        monday: 1,
        tuesday: 2,
        wednesday: 3,
        thursday: 4,
        friday: 5,
        saturday: 6
      };
      const targetDay = weekdayMap[weekday];
      const match = dates.find(d => {
        const day = new Date(d).getDay();
        return day === targetDay;
      });
      if (match) return match;
    }
    
    // Use first available date
    return dates[0];
  };

  // Prepare filters object for API calls - use today's date as immediate fallback
  // Memoize fallback date to prevent recalculation on every render
  const fallbackDate = React.useMemo(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }, []);

  // Memoize apiFilters to prevent unnecessary re-renders and hook re-executions
  // Only include filter properties that matter to avoid unnecessary re-renders
  const apiFilters = React.useMemo(() => ({
    floor: filters.floor,
    timeGranularity: filters.timeGranularity,
    weekday: filters.weekday,
    date: filters.date || fallbackDate // Use fallback date immediately, don't wait
  }), [filters.floor, filters.timeGranularity, filters.weekday, filters.date, fallbackDate]);

  // All hooks fetch data in parallel - no sequential waiting
  const { summary, hourlyData, availableDates, loading: energyLoading } = useEnergyData(apiFilters);
  const { weeklyPeakHours, loading: weeklyPeakHoursLoading } = useWeeklyPeakHours(apiFilters);
  const { floorAnalytics, loading: floorAnalyticsLoading } = useFloorAnalytics(apiFilters);
  
  // Note: Date selection is now handled internally by useEnergyData hook
  // No need for separate date management effect
  
  // Ensure we have units data
  const displayUnits = units && units.length > 0 ? units : [];
  
  // Calculate statistics from units if not provided
  const displayStatistics = statistics && Object.keys(statistics).length > 0 
    ? statistics 
    : calculatePowerPlantStatistics(displayUnits);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Get current date context - prioritize apiFilters.date since that's what we're using for API calls
  const currentDate = apiFilters.date || summary?.date || availableDates[0] || null;
  const dateContext = currentDate ? formatDate(currentDate) : 'No date selected';
  
  // Debug logging (remove in production)
  React.useEffect(() => {
    if (apiFilters.date) {
      console.log('API Filters Date:', apiFilters.date);
    }
    if (hourlyData) {
      console.log('Hourly Data:', hourlyData);
      console.log('Peak Hour:', hourlyData.peak_hour);
    }
  }, [apiFilters.date, hourlyData]);

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

    // Daily trend per floor - use floorAnalytics if available, otherwise calculate from floorMetrics
    const dailyTrendPerFloor = {};
    
    if (floorAnalytics && floorAnalytics.floor_analytics) {
      // Use backend floor analytics daily trend data
      floorAnalytics.floor_analytics.forEach(floor => {
        if (floor.daily_trend && Array.isArray(floor.daily_trend) && floor.daily_trend.length > 0) {
          // Get last 7 days of data (or all if less than 7)
          const trendData = floor.daily_trend.slice(-7);
          
          // Map dates to their actual day of week (0=Sunday, 1=Monday, etc.)
          // Chart labels are: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
          // So we need: Monday=0, Tuesday=1, Wednesday=2, Thursday=3, Friday=4, Saturday=5, Sunday=6
          const dayOfWeekMap = [6, 0, 1, 2, 3, 4, 5]; // Sunday=6, Monday=0, etc.
          const weeklyData = [null, null, null, null, null, null, null]; // Initialize array for Mon-Sun
          
          trendData.forEach(day => {
            const date = new Date(day.date + 'T00:00:00'); // Parse date
            const dayOfWeek = date.getDay(); // 0=Sunday, 1=Monday, etc.
            const chartIndex = dayOfWeekMap[dayOfWeek]; // Map to chart position (Mon=0, Tue=1, etc.)
            
            if (chartIndex !== undefined && chartIndex !== null) {
              weeklyData[chartIndex] = parseFloat((day.total_energy / 1000).toFixed(2)); // Convert Wh to kWh
            }
          });
          
          // If any day is missing, use the average of available days or 0
          const availableValues = weeklyData.filter(v => v !== null);
          const avgValue = availableValues.length > 0 
            ? availableValues.reduce((a, b) => a + b, 0) / availableValues.length 
            : 0;
          
          // Fill missing days with average or 0
          const finalData = weeklyData.map(v => v !== null ? v : avgValue);
          
          dailyTrendPerFloor[`Floor ${floor.floor}`] = finalData;
        }
      });
    }
    
    // Fallback: if no floor analytics, use floor metrics with deterministic daily variation
    // Use a consistent pattern based on floor ID to avoid random changes on refresh
    if (Object.keys(dailyTrendPerFloor).length === 0 && floorMetrics) {
      floorMetrics.forEach(floor => {
        const baseConsumption = parseFloat(floor.totalConsumption) || 0;
        const dailyAvg = baseConsumption / 8; // Average per day (8 days of data)
        // Use deterministic variation pattern based on floor ID and day index
        // This creates a consistent pattern that doesn't change on refresh
        const variationPattern = [
          1.0, 1.05, 0.95, 1.1, 0.98, 0.92, 1.0  // Monday through Sunday pattern
        ];
        dailyTrendPerFloor[floor.floorName] = variationPattern.map((variation, i) => {
          // Add slight floor-specific offset based on floor ID for uniqueness
          const floorOffset = (floor.floorId || 1) * 0.02;
          return parseFloat((dailyAvg * (variation + floorOffset)).toFixed(2));
        });
      });
    }
    
    // Default daily trend (for backward compatibility) - use deterministic pattern
    const totalConsumption = parseFloat(displayStatistics.totalConsumption || 0);
    const dailyAvg = totalConsumption / 7; // Average per day
    const defaultPattern = [1.0, 1.05, 0.95, 1.1, 0.98, 0.92, 1.0]; // Consistent weekly pattern
    const dailyTrend = defaultPattern.map(variation => dailyAvg * variation);

    // Peak hours analysis - ALWAYS use backend data if available, never fall back to static
    let peakHours = {};
    let peakHour = 'N/A';
    let peakHourFormatted = null;
    
    if (hourlyData && hourlyData.hourly_data && hourlyData.hourly_data.length > 0) {
      // Build peak hours from backend hourly data
      hourlyData.hourly_data.forEach(hour => {
        peakHours[hour.hour] = hour.total_energy;
      });
      
      // Use peak hour from backend
      if (hourlyData.peak_hour && hourlyData.peak_hour.hour !== null) {
        // Prioritize formatted datetime from backend
        if (hourlyData.peak_hour.formatted_datetime) {
          peakHourFormatted = hourlyData.peak_hour.formatted_datetime;
          // Extract just the time part for display
          const timeMatch = hourlyData.peak_hour.formatted_datetime.match(/\d{1,2}:\d{2}\s*(AM|PM)/i);
          peakHour = timeMatch ? timeMatch[0] : hourlyData.peak_hour.formatted_time || `${String(hourlyData.peak_hour.hour).padStart(2, '0')}:00`;
        } else if (hourlyData.peak_hour.formatted_time) {
          peakHourFormatted = null; // No full datetime, just time
          peakHour = hourlyData.peak_hour.formatted_time;
        } else {
          // Fallback to 24-hour format if no formatted time
          peakHour = `${String(hourlyData.peak_hour.hour).padStart(2, '0')}:00`;
        }
      }
    } else if (summary && summary.date) {
      // If no hourly data but we have summary, show loading or N/A
      peakHour = 'Loading...';
    }

    return {
      consumptionByType,
      floorMetrics,
      buildingMetrics,
      branchMetrics,
      topUnits,
      dailyTrend,
      dailyTrendPerFloor, // Add floor-specific daily trends
      peakHours,
      peakHour,
      peakHourFormatted,
      summary // Include backend summary
    };
  }, [displayUnits, displayStatistics, hourlyData, weeklyPeakHours, floorAnalytics, summary]);

  // Enhanced chart options with date context in tooltips
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
        padding: 10,
        callbacks: {
          title: function(context) {
            return dateContext;
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
  const toDisplayValue = useCallback((v) => {
    const num = parseFloat(v) || 0;
    return granularity === 'minute' ? num * 1000 : num;
  }, [granularity]);
  const displayUnitLabel = granularity === 'minute' ? 'Consumption (Wh)' : 'Consumption (kWh)';

  // Equipment type chart data - use useMemo to avoid initialization issues
  const equipmentTypeData = useMemo(() => {
    if (!dashboardData || !dashboardData.consumptionByType) {
      return { labels: [], datasets: [] };
    }
    return {
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
  }, [dashboardData, displayUnitLabel, toDisplayValue]);

  // Floor comparison chart (primary focus)
  const floorComparisonData = useMemo(() => {
    if (!dashboardData || !dashboardData.floorMetrics) {
      return { labels: [], datasets: [] };
    }
    return {
      labels: dashboardData.floorMetrics.map(f => f.floorName),
      datasets: [{
        label: displayUnitLabel,
        data: dashboardData.floorMetrics.map(f => toDisplayValue(f.totalConsumption)),
        backgroundColor: ['#3b82f6', '#10b981', '#f59e0b'],
        borderColor: ['#2563eb', '#059669', '#d97706'],
        borderWidth: 2,
        borderRadius: 6
      }]
    };
  }, [dashboardData, displayUnitLabel, toDisplayValue]);

  // Branch comparison chart (for reference - only one branch)
  const branchComparisonData = useMemo(() => {
    if (!dashboardData || !dashboardData.branchMetrics) {
      return { labels: [], datasets: [] };
    }
    return {
      labels: dashboardData.branchMetrics.map(b => b.branchName),
      datasets: [{
        label: displayUnitLabel,
        data: dashboardData.branchMetrics.map(b => toDisplayValue(b.totalConsumption)),
        backgroundColor: ['#10b981'],
        borderColor: ['#059669'],
        borderWidth: 2,
        borderRadius: 6
      }]
    };
  }, [dashboardData, displayUnitLabel, toDisplayValue]);

  // Cost breakdown by equipment type
  const costBreakdownData = useMemo(() => {
    if (!dashboardData || !dashboardData.consumptionByType) {
      return { labels: [], datasets: [] };
    }
    return {
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
  }, [dashboardData]);

  // Peak hours chart - Use backend hourly data if available
  const peakHoursData = useMemo(() => {
    // Debug logging
    if (hourlyData) {
      console.log('Peak Hours Chart - hourlyData:', hourlyData);
      console.log('Peak Hours Chart - hourly_data:', hourlyData.hourly_data);
      console.log('Peak Hours Chart - hourly_data length:', hourlyData.hourly_data?.length);
    }
    
    if (hourlyData && hourlyData.hourly_data && Array.isArray(hourlyData.hourly_data) && hourlyData.hourly_data.length > 0) {
      // Use backend hourly data - convert to array format for Chart.js
      const sortedHours = [...hourlyData.hourly_data].sort((a, b) => a.hour - b.hour);
      return {
        labels: sortedHours.map(h => `${String(h.hour).padStart(2, '0')}:00`),
        datasets: [{
          label: 'Energy Consumption (Wh)',
          data: sortedHours.map(h => parseFloat(h.total_energy) || 0),
          backgroundColor: '#f59e0b',
          borderColor: '#d97706',
          borderWidth: 1,
          borderRadius: 4
        }]
      };
    } else if (dashboardData && dashboardData.peakHours && Object.keys(dashboardData.peakHours).length > 0) {
      // Fallback to dashboardData.peakHours if available
      const peakHoursKeys = Object.keys(dashboardData.peakHours).sort((a, b) => parseInt(a) - parseInt(b));
      return {
        labels: peakHoursKeys.map(h => `${String(h).padStart(2, '0')}:00`),
        datasets: [{
          label: displayUnitLabel,
          data: peakHoursKeys.map(h => toDisplayValue(dashboardData.peakHours[h])),
          backgroundColor: '#f59e0b',
          borderColor: '#d97706',
          borderWidth: 1,
          borderRadius: 4
        }]
      };
    } else {
      // Return empty chart structure if no data available
      console.warn('Peak Hours Chart - No data available');
      return {
        labels: [],
        datasets: [{
          label: 'Energy Consumption',
          data: [],
          backgroundColor: '#f59e0b',
          borderColor: '#d97706',
          borderWidth: 1,
          borderRadius: 4
        }]
      };
    }
  }, [hourlyData, dashboardData, displayUnitLabel, toDisplayValue]);

  // Daily trend chart - show Floor 1, Floor 2, Floor 3 with enhanced legend and styling
  const dailyTrendData = useMemo(() => {
    if (!dashboardData) {
      return {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: []
      };
    }
    
    const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const datasets = [];
    
    // Enhanced floor colors with better contrast and visual appeal
    const floorColors = [
      { 
        border: '#2563eb', 
        fill: 'rgba(37, 99, 235, 0.15)',
        pointBackground: '#2563eb',
        pointBorder: '#ffffff'
      }, // Floor 1 - Blue
      { 
        border: '#10b981', 
        fill: 'rgba(16, 185, 129, 0.15)',
        pointBackground: '#10b981',
        pointBorder: '#ffffff'
      }, // Floor 2 - Green
      { 
        border: '#f59e0b', 
        fill: 'rgba(245, 158, 11, 0.15)',
        pointBackground: '#f59e0b',
        pointBorder: '#ffffff'
      }  // Floor 3 - Orange
    ];
    
    // Get floor data from dashboardData
    const floorData = dashboardData.dailyTrendPerFloor || {};
    
    // Create dataset for each floor (Floor 1, Floor 2, Floor 3)
    ['Floor 1', 'Floor 2', 'Floor 3'].forEach((floorName, index) => {
      const floorDataArray = floorData[floorName];
      if (floorDataArray && floorDataArray.length > 0) {
        datasets.push({
          label: floorName,
          data: floorDataArray.map(v => parseFloat(v)),
          borderColor: floorColors[index].border,
          backgroundColor: floorColors[index].fill,
          borderWidth: 3, // Thicker lines for better visibility
          fill: true, // Fill area under line for better visual impact
          tension: 0.4, // Smooth curves
          pointRadius: 5, // Larger points
          pointHoverRadius: 8, // Even larger on hover
          pointBackgroundColor: floorColors[index].pointBackground,
          pointBorderColor: floorColors[index].pointBorder,
          pointBorderWidth: 2,
          pointStyle: 'circle',
          spanGaps: false
        });
      } else {
        // Fallback: use default trend if no floor-specific data
        if (index === 0 && dashboardData.dailyTrend && dashboardData.dailyTrend.length > 0) {
          datasets.push({
            label: floorName,
            data: dashboardData.dailyTrend.map(v => parseFloat(v) / 3), // Divide by 3 for one floor
            borderColor: floorColors[index].border,
            backgroundColor: floorColors[index].fill,
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointRadius: 5,
            pointHoverRadius: 8,
            pointBackgroundColor: floorColors[index].pointBackground,
            pointBorderColor: floorColors[index].pointBorder,
            pointBorderWidth: 2
          });
        }
      }
    });
    
    // If no floor data at all, use default
    if (datasets.length === 0 && dashboardData.dailyTrend && dashboardData.dailyTrend.length > 0) {
      datasets.push({
        label: 'Daily Consumption (kWh)',
        data: dashboardData.dailyTrend.map(v => parseFloat(v)),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.15)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointRadius: 5,
        pointHoverRadius: 8
      });
    }
    
    return {
      labels,
      datasets
    };
  }, [dashboardData]);
  
  // Enhanced chart options specifically for the weekly trend chart
  const weeklyTrendChartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          font: { 
            size: 12,
            weight: 'bold'
          },
          padding: 15,
          usePointStyle: true,
          pointStyle: 'circle',
          boxWidth: 12,
          boxHeight: 12
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: { size: 13, weight: 'bold' },
        bodyFont: { size: 12 },
        padding: 12,
        displayColors: true,
        callbacks: {
          title: function(context) {
            return `Week of ${dateContext}`;
          },
          label: function(context) {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            return `${label}: ${value.toFixed(2)} kWh`;
          },
          labelColor: function(context) {
            return {
              borderColor: context.dataset.borderColor,
              backgroundColor: context.dataset.borderColor,
            };
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.05)',
          drawBorder: false
        },
        ticks: {
          font: { size: 11, weight: '500' },
          color: '#6b7280',
          padding: 10
        },
        title: {
          display: true,
          text: 'Day of Week',
          font: { size: 12, weight: 'bold' },
          color: '#374151',
          padding: { top: 10 }
        }
      },
      y: {
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.05)',
          drawBorder: false
        },
        ticks: {
          font: { size: 11, weight: '500' },
          color: '#6b7280',
          padding: 10,
          callback: function(value) {
            return value.toFixed(1) + ' kWh';
          }
        },
        title: {
          display: true,
          text: 'Consumption (kWh)',
          font: { size: 12, weight: 'bold' },
          color: '#374151',
          padding: { bottom: 10 }
        },
        beginAtZero: true
      }
    }
  }), [dateContext]);

  return (
    <div className="space-y-6">
      {/* Date Selector removed per request */}

      {/* Statistics Cards */}
      <StatisticsCards statistics={displayStatistics} summary={summary} filters={filters} />

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

        {/* Peak Hour - only show for Per Day granularity */}
        {granularity === 'day' && (
          <div className="stat-card bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Peak Hour</p>
                {hourlyData?.peak_hour?.formatted_datetime ? (
                  <>
                    <p className="text-lg font-bold text-gray-900 mt-2">{hourlyData.peak_hour.formatted_datetime}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {hourlyData.peak_hour.formatted_time || `${String(hourlyData.peak_hour.hour).padStart(2, '0')}:00`}
                    </p>
                  </>
                ) : hourlyData?.peak_hour && hourlyData.peak_hour.hour !== null && hourlyData.peak_hour.hour !== undefined ? (
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {String(hourlyData.peak_hour.hour).padStart(2, '0')}:00
                  </p>
                ) : hourlyData && hourlyData.peak_hour && hourlyData.peak_hour.hour === null ? (
                  <p className="text-lg font-bold text-gray-500 mt-2">No peak hour data</p>
                ) : hourlyData ? (
                  <p className="text-lg font-bold text-gray-500 mt-2">No peak hour data</p>
                ) : (
                  <p className="text-lg font-bold text-gray-500 mt-2">Loading...</p>
                )}
              </div>
              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                <i className="fas fa-clock text-orange-600 text-xl"></i>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Charts Row 1: Equipment Type & Floor Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Consumption by Equipment Type */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200 px-6 py-4">
            <h3 className="text-lg font-semibold text-gray-900">Consumption by Equipment Type</h3>
            <p className="text-gray-600 text-sm mt-1">Energy usage breakdown by equipment type • {dateContext}</p>
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
              Energy consumption by floor ({granularity} view) • {dateContext}
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
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <i className="fas fa-chart-line text-blue-600 mr-2"></i>
                Weekly Consumption Trend
              </h3>
              <p className="text-gray-600 text-sm mt-1">Last 7 days consumption pattern by floor</p>
            </div>
            <div className="p-6">
              <div className="chart-container" style={{ height: '350px' }}>
                <Line data={dailyTrendData} options={weeklyTrendChartOptions} />
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
                ? `Energy consumption by hour for ${dateContext}`
                : `Consumption distribution by peak hours • ${dateContext}`
              }
              {hourlyData?.peak_hour && hourlyData.peak_hour.formatted_datetime && (
                <span className="ml-2 text-primary-600 font-medium block mt-1">
                  Peak: {hourlyData.peak_hour.formatted_datetime} ({hourlyData.peak_hour.total_energy?.toFixed(2) || '0.00'} Wh)
                </span>
              )}
              {hourlyData?.peak_hour && !hourlyData.peak_hour.formatted_datetime && hourlyData.peak_hour.hour !== null && hourlyData.peak_hour.hour !== undefined && (
                <span className="ml-2 text-primary-600 font-medium">
                  • Peak: {String(hourlyData.peak_hour.hour).padStart(2, '0')}:00 ({hourlyData.peak_hour.total_energy?.toFixed(2) || '0.00'} Wh)
                </span>
              )}
            </p>
          </div>
          <div className="p-6">
            {peakHoursData.labels.length === 0 ? (
              <div className="flex items-center justify-center h-[300px] text-gray-500">
                <div className="text-center">
                  <i className="fas fa-chart-bar text-4xl mb-2 opacity-50"></i>
                  <p className="text-sm">
                    {energyLoading ? 'Loading hourly data...' : 'No hourly data available for the selected filters'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="chart-container" style={{ height: '300px' }}>
                <Bar data={peakHoursData} options={chartOptions} />
              </div>
            )}
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

      {/* Insights Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200 px-6 py-4">
          <h3 className="text-lg font-semibold text-gray-900">Insights & Analytics</h3>
          <p className="text-gray-600 text-sm mt-1">Key insights and recommendations based on current data</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Top 3 Most Energy-Efficient Floors */}
            <div>
              <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
                <i className="fas fa-leaf text-green-600 mr-2"></i>
                Most Energy-Efficient Floors
              </h4>
              <div className="space-y-2">
                {dashboardData.floorMetrics
                  .sort((a, b) => {
                    const avgA = parseFloat(a.totalConsumption) / (a.totalUnits || 1);
                    const avgB = parseFloat(b.totalConsumption) / (b.totalUnits || 1);
                    return avgA - avgB;
                  })
                  .slice(0, 3)
                  .map((floor, index) => (
                    <div key={floor.floorId} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white font-bold text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{floor.floorName}</p>
                          <p className="text-xs text-gray-600">
                            {(parseFloat(floor.totalConsumption) / (floor.totalUnits || 1)).toFixed(2)} kWh/unit
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-green-600">
                          {floor.totalConsumption.toFixed(1)} kWh
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Floors with Highest Cost-Saving Potential */}
            <div>
              <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
                <i className="fas fa-piggy-bank text-yellow-600 mr-2"></i>
                Highest Cost-Saving Potential
              </h4>
              <div className="space-y-2">
                {dashboardData.floorMetrics
                  .sort((a, b) => parseFloat(b.totalCost) - parseFloat(a.totalCost))
                  .slice(0, 3)
                  .map((floor, index) => (
                    <div key={floor.floorId} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center text-white font-bold text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{floor.floorName}</p>
                          <p className="text-xs text-gray-600">{floor.totalUnits} units</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-yellow-600">
                          ₱{parseFloat(floor.totalCost).toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-600">
                          {floor.totalConsumption.toFixed(1)} kWh
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Weekly Peak Hours Pattern */}
            <div>
              <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
                <i className="fas fa-chart-line text-blue-600 mr-2"></i>
                Weekly Peak Hours Pattern
              </h4>
              {weeklyPeakHoursLoading && (!weeklyPeakHours || !weeklyPeakHours.weekly_peak_hours || weeklyPeakHours.weekly_peak_hours.length === 0) ? (
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg animate-pulse">
                      <div>
                        <div className="h-4 w-20 bg-gray-300 rounded mb-1"></div>
                        <div className="h-3 w-32 bg-gray-200 rounded"></div>
                      </div>
                      <div className="h-4 w-16 bg-gray-300 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : weeklyPeakHours && weeklyPeakHours.weekly_peak_hours && weeklyPeakHours.weekly_peak_hours.length > 0 ? (
                <div className="space-y-2">
                  {weeklyPeakHours.weekly_peak_hours
                    .sort((a, b) => b.total_energy - a.total_energy)
                    .slice(0, 5)
                    .map((peak) => (
                      <div key={peak.weekday} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 capitalize">{peak.weekday}</p>
                          <p className="text-xs text-gray-600">Peak: {peak.formatted_time || `${peak.peak_hour}:00`}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-blue-600">
                            {peak.total_energy.toFixed(2)} Wh
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-sm text-gray-500 p-3">No weekly peak hours data available</div>
              )}
            </div>

            {/* Peak Consumption Alerts */}
            <div>
              <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
                <i className="fas fa-exclamation-triangle text-red-600 mr-2"></i>
                Peak Consumption Alerts
              </h4>
              {floorAnalyticsLoading && (!floorAnalytics || !floorAnalytics.floor_analytics || floorAnalytics.floor_analytics.length === 0) ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-red-50 rounded-lg animate-pulse">
                      <div>
                        <div className="h-4 w-16 bg-gray-300 rounded mb-1"></div>
                        <div className="h-3 w-40 bg-gray-200 rounded"></div>
                      </div>
                      <div className="h-4 w-20 bg-gray-300 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : floorAnalytics && floorAnalytics.floor_analytics && floorAnalytics.floor_analytics.length > 0 ? (
                <div className="space-y-2">
                  {floorAnalytics.floor_analytics
                    .filter(floor => floor.peak_hour && floor.peak_hour.total_energy > 0)
                    .sort((a, b) => (b.peak_hour?.total_energy || 0) - (a.peak_hour?.total_energy || 0))
                    .slice(0, 3)
                    .map((floor) => (
                      <div key={floor.floor} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">Floor {floor.floor}</p>
                          <p className="text-xs text-gray-600">
                            Peak: {floor.peak_hour.hour}:00 ({floor.peak_hour.total_energy.toFixed(2)} Wh)
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-red-600">
                            {floor.total_energy_kwh.toFixed(2)} kWh
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-sm text-gray-500 p-3">No peak consumption alerts available</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
