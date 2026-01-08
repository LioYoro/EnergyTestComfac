import React, { useMemo } from 'react';

const StatisticsCards = ({ statistics, summary, filters = {}, hourlyData = null }) => {
  // Formatter to keep numbers readable and avoid overflow
  const formatNum = (value, maxDigits = 4) => {
    const num = Number(value) || 0;
    return num.toLocaleString('en-US', {
      maximumFractionDigits: maxDigits,
      minimumFractionDigits: 0
    });
  };

  // Always use statistics data (unit-based), not summary data
  // BUT use summary data for avgCurrent since it comes from backend and respects filters
  // Memoize to prevent data from changing over time
  const stableStats = useMemo(() => {
    // Use backend summary avg_current if available (respects filters), otherwise use statistics
    // Check multiple possible paths for avg_current
    let avgCurrentValue = 0;
    
    // Priority 1: Use summary per_day avg_current (most accurate, respects filters)
    if (summary?.per_day?.avg_current !== undefined && summary?.per_day?.avg_current !== null && summary.per_day.avg_current > 0) {
      avgCurrentValue = summary.per_day.avg_current;
    } 
    // Priority 2: Use summary per_hour avg_current
    else if (summary?.per_hour?.avg_current !== undefined && summary?.per_hour?.avg_current !== null && summary.per_hour.avg_current > 0) {
      avgCurrentValue = summary.per_hour.avg_current;
    } 
    // Priority 3: Use summary per_minute avg_current
    else if (summary?.per_minute?.avg_current !== undefined && summary?.per_minute?.avg_current !== null && summary.per_minute.avg_current > 0) {
      avgCurrentValue = summary.per_minute.avg_current;
    } 
    // Priority 4: Calculate from hourlyData if available
    else if (hourlyData?.hourly_data && Array.isArray(hourlyData.hourly_data) && hourlyData.hourly_data.length > 0) {
      // Calculate average current from hourly data
      const currents = hourlyData.hourly_data
        .map(h => parseFloat(h.avg_current))
        .filter(c => !isNaN(c) && c > 0);
      if (currents.length > 0) {
        avgCurrentValue = currents.reduce((sum, c) => sum + c, 0) / currents.length;
      }
    }
    // Priority 5: Use statistics avgCurrent as last resort
    else if (statistics?.avgCurrent !== undefined && statistics?.avgCurrent !== null && statistics.avgCurrent > 0) {
      avgCurrentValue = statistics.avgCurrent;
    }
    
    // Ensure it's a number
    avgCurrentValue = typeof avgCurrentValue === 'number' ? avgCurrentValue : parseFloat(avgCurrentValue) || 0;
    
    return {
      totalUnits: statistics?.totalUnits || 0,
      totalConsumption: statistics?.totalConsumption || 0,
      totalCost: parseFloat(statistics?.totalCost || 0),
      avgConsumption: statistics?.avgConsumption || 0,
      avgCost: parseFloat(statistics?.avgCost || 0),
      avgCurrent: avgCurrentValue,
      consumptionRange: statistics?.consumptionRange || '0.0 - 0.0 kWh',
      statusCounts: {
        operational: statistics?.statusCounts?.operational || 0,
        maintenance: statistics?.statusCounts?.maintenance || 0,
        critical: statistics?.statusCounts?.critical || 0
      }
    };
  }, [
    statistics?.totalUnits,
    statistics?.totalConsumption,
    statistics?.totalCost,
    statistics?.avgConsumption,
    statistics?.avgCost,
    statistics?.avgCurrent,
    statistics?.consumptionRange,
    statistics?.statusCounts?.operational,
    statistics?.statusCounts?.maintenance,
    statistics?.statusCounts?.critical,
    summary?.per_day?.avg_current, // Include summary avg_current in dependencies
    summary?.per_hour?.avg_current,
    summary?.per_minute?.avg_current,
    hourlyData?.hourly_data // Include hourlyData to recalculate if summary is missing
  ]);

  // Use stable statistics, not summary data
  const totalEnergy = stableStats.totalConsumption;
  const totalCost = stableStats.totalCost;
  const avgCurrent = typeof stableStats.avgCurrent === 'number' 
    ? stableStats.avgCurrent.toFixed(2) 
    : stableStats.avgCurrent;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total Units */}
      <div className="stat-card bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Total Units</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {stableStats.totalUnits}
            </p>
          </div>
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
            <i className="fas fa-cogs text-blue-600 text-xl"></i>
          </div>
        </div>
        <div className="mt-4">
          <div className="flex text-sm">
            <span className="text-gray-700 mr-4">
              <span className="location-marker bg-green-500"></span>
              Operational: <span>{stableStats.statusCounts.operational}</span>
            </span>
            <span className="text-gray-700">
              <span className="location-marker bg-yellow-500"></span>
              Maintenance: <span>{stableStats.statusCounts.maintenance}</span>
            </span>
          </div>
        </div>
      </div>
      
      {/* Total Consumption & Cost */}
      <div className="stat-card bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Total Consumption</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">
              {formatNum(totalEnergy, 4)} <span className="text-base">kWh</span>
            </p>
            <p className="text-lg font-semibold text-primary-600 mt-1">
              ₱{parseFloat(totalCost).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
            <i className="fas fa-bolt text-green-600 text-xl"></i>
          </div>
        </div>
        <div className="mt-4 flex items-center text-sm">
          <span className="text-gray-500">Avg Current: </span>
          <span className="ml-2 text-gray-900 font-medium">{avgCurrent} A</span>
        </div>
      </div>
      
      {/* Average Consumption per Unit */}
      <div className="stat-card bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Avg per Unit</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">
              {formatNum(stableStats.avgConsumption, 4)} <span className="text-base">kWh</span>
            </p>
            <p className="text-lg font-semibold text-primary-600 mt-1">
              ₱{stableStats.avgCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
            <i className="fas fa-chart-bar text-purple-600 text-xl"></i>
          </div>
        </div>
        <div className="mt-4">
          <div className="flex items-center text-sm">
            <span className="text-gray-700">
              Range: {stableStats.consumptionRange}
            </span>
          </div>
        </div>
      </div>
      
      {/* Status Overview */}
      <div className="stat-card bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Status Overview</p>
            <p className="text-xl font-bold text-green-600 mt-2">
              {stableStats.statusCounts.operational} <span className="text-sm text-gray-600">Operational</span>
            </p>
            <p className="text-sm text-gray-600 mt-1">
              {stableStats.statusCounts.critical} Critical • {stableStats.statusCounts.maintenance} Maintenance
            </p>
          </div>
          <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
            <i className="fas fa-check-circle text-yellow-600 text-xl"></i>
          </div>
        </div>
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full" 
              style={{ width: `${stableStats.totalUnits > 0 ? (stableStats.statusCounts.operational / stableStats.totalUnits) * 100 : 0}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatisticsCards;
