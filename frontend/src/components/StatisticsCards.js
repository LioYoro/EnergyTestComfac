import React from 'react';

const StatisticsCards = ({ statistics, summary }) => {
  // Formatter to keep numbers readable and avoid overflow
  const formatNum = (value, maxDigits = 4) => {
    const num = Number(value) || 0;
    return num.toLocaleString('en-US', {
      maximumFractionDigits: maxDigits,
      minimumFractionDigits: 0
    });
  };

  // Use backend summary data if available, otherwise use mock statistics
  const totalEnergy = summary?.per_day?.total_energy 
    ? summary.per_day.total_energy / 1000 // Convert Wh to kWh
    : (statistics.totalConsumption || 0);
  
  const totalCost = summary?.per_day?.total_energy 
    ? (summary.per_day.total_energy / 1000 * 10) // kWh * 10 PHP
    : parseFloat(statistics.totalCost || 0);
  
  const avgCurrent = summary?.per_day?.avg_current || statistics.avgCurrent || '0.0';
  const totalRecords = summary?.total_records || statistics.totalRecords || 0;
  
  // Calculate averages from backend data
  const avgEnergyPerHour = summary?.per_hour?.avg_energy 
    ? (summary.per_hour.avg_energy / 1000) // Convert Wh to kWh
    : statistics.avgConsumption || 0;
  
  const avgEnergyPerMinute = summary?.per_minute?.avg_energy 
    ? (summary.per_minute.avg_energy / 1000)
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total Records / Units */}
      <div className="stat-card bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">
              {summary ? 'Total Records' : 'Total Units'}
            </p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {summary ? totalRecords.toLocaleString() : (statistics.totalUnits || 0)}
            </p>
          </div>
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
            <i className={`fas ${summary ? 'fa-database' : 'fa-cogs'} text-blue-600 text-xl`}></i>
          </div>
        </div>
        <div className="mt-4">
          {summary ? (
            <div className="text-sm text-gray-600">
              <span>Date: {summary.date || 'N/A'}</span>
            </div>
          ) : (
            <div className="flex text-sm">
              <span className="text-gray-700 mr-4">
                <span className="location-marker bg-green-500"></span>
                Operational: <span>{statistics.statusCounts?.operational || 0}</span>
              </span>
              <span className="text-gray-700">
                <span className="location-marker bg-yellow-500"></span>
                Maintenance: <span>{statistics.statusCounts?.maintenance || 0}</span>
              </span>
            </div>
          )}
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
      
      {/* Average Consumption */}
      <div className="stat-card bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">
              {summary ? 'Avg per Hour' : 'Avg per Unit'}
            </p>
            <p className="text-2xl font-bold text-gray-900 mt-2">
              {summary ? formatNum(avgEnergyPerHour, 4) : formatNum(statistics.avgConsumption || 0, 4)} <span className="text-base">kWh</span>
            </p>
            <p className="text-lg font-semibold text-primary-600 mt-1">
              ₱{summary 
                ? parseFloat(avgEnergyPerHour * 10).toFixed(2)
                : parseFloat(statistics.avgCost || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
              }
            </p>
          </div>
          <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
            <i className="fas fa-chart-bar text-purple-600 text-xl"></i>
          </div>
        </div>
        <div className="mt-4">
          <div className="flex items-center text-sm">
            <span className="text-gray-700">
              {summary ? `Avg per Minute: ${formatNum(avgEnergyPerMinute, 4)} kWh` : `Range: ${statistics.consumptionRange || '0.0 - 0.0 kWh'}`}
            </span>
          </div>
        </div>
      </div>
      
      {/* Status Overview / Energy Breakdown */}
      <div className="stat-card bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            {summary ? (
              <>
                <p className="text-sm font-medium text-gray-500">Energy Breakdown</p>
                <p className="text-xl font-bold text-green-600 mt-2">
                  {summary.per_hour?.count || 0} <span className="text-sm text-gray-600">Hours</span>
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {summary.per_minute?.count || 0} Minutes • {summary.per_second?.count || 0} Seconds
                </p>
              </>
            ) : (
              <>
                <p className="text-sm font-medium text-gray-500">Status Overview</p>
                <p className="text-xl font-bold text-green-600 mt-2">
                  {statistics.statusCounts?.operational || 0} <span className="text-sm text-gray-600">Operational</span>
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {statistics.statusCounts?.critical || 0} Critical • {statistics.statusCounts?.maintenance || 0} Maintenance
                </p>
              </>
            )}
          </div>
          <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
            <i className={`fas ${summary ? 'fa-clock' : 'fa-check-circle'} text-yellow-600 text-xl`}></i>
          </div>
        </div>
        <div className="mt-4">
          {!summary && (
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full" 
                style={{ width: `${statistics.totalUnits > 0 ? ((statistics.statusCounts?.operational || 0) / statistics.totalUnits) * 100 : 0}%` }}
              ></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatisticsCards;
