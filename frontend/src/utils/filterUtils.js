import { powerPlantData, getUnitsByFloorId, getUnitsByBranchId } from '../data/powerPlantData';

// Filter units based on filters (simplified - focus on floors)
export const filterUnits = (filters) => {
  let units = [...powerPlantData.units];

  // Floor filter - primary filter
  if (filters.floor && filters.floor !== 'all') {
    const floorId = parseInt(filters.floor);
    units = units.filter(unit => unit.floorId === floorId);
  }

  // Unit type filter
  if (filters.unitType && filters.unitType !== 'all') {
    units = units.filter(unit => unit.equipmentType === filters.unitType);
  }

  // Status filter
  if (filters.status && filters.status !== 'all') {
    units = units.filter(unit => unit.status === filters.status);
  }

  // Consumption range filter
  if (filters.consumptionRange && filters.consumptionRange < 1000) {
    units = units.filter(unit => unit.consumption <= filters.consumptionRange);
  }

  return units;
};

// Scale unit consumption/cost based on time granularity and weekday selection (mock logic)
// Assumptions: base consumption is for the full 8-day period
export const scaleUnitsByTime = (units, filters) => {
  const days = 8;
  const granularity = filters?.timeGranularity || 'day';
  const perDayFactor = 1 / days;
  const perWeekFactor = 7 / days;
  const perHourFactor = perDayFactor / 24;
  const perMinuteFactor = perHourFactor / 60;

  let factor = perDayFactor; // default to per-day view
  switch (granularity) {
    case 'day':
      factor = perDayFactor;
      break;
    case 'week':
      factor = perWeekFactor;
      break;
    case 'hour':
      factor = perHourFactor;
      break;
    case 'minute':
      factor = perMinuteFactor;
      break;
    default:
      factor = perDayFactor;
  }

  // If a specific weekday is chosen, treat it as a single-day slice
  if (filters?.weekday && filters.weekday !== 'all') {
    if (granularity === 'week') {
      // one weekday within the week ~1 day
      factor = perDayFactor;
    }
    // day/hour/minute already represent a single-day slice
  }

  return units.map(u => {
    const baseCost = u.cost || u.consumption * 10;
    return {
      ...u,
      consumption: parseFloat((u.consumption * factor).toFixed(3)),
      cost: parseFloat((baseCost * factor).toFixed(2))
    };
  });
};

// Legacy function for backward compatibility
export const filterLocations = (locations, filters) => {
  return locations.filter(location => {
    if (filters.city && filters.city !== 'all' && location.city !== filters.city) {
      return false;
    }
    if (filters.region !== 'all' && location.region !== filters.region) {
      return false;
    }
    if (filters.type !== 'all' && location.type !== filters.type) {
      return false;
    }
    if (location.consumption > filters.consumptionRange) {
      return false;
    }
    return true;
  });
};

// Calculate power plant statistics
export const calculatePowerPlantStatistics = (units) => {
  const totalUnits = units.length;
  const totalConsumption = units.reduce((sum, unit) => sum + unit.consumption, 0);
  const totalCost = units.reduce((sum, unit) => sum + (unit.cost || unit.consumption * 10), 0);
  
  // Group by equipment type
  const consumptionByType = {};
  units.forEach(unit => {
    if (!consumptionByType[unit.equipmentType]) {
      consumptionByType[unit.equipmentType] = 0;
    }
    consumptionByType[unit.equipmentType] += unit.consumption;
  });

  // Status counts
  const statusCounts = {
    operational: units.filter(u => u.status === 'operational').length,
    maintenance: units.filter(u => u.status === 'maintenance').length,
    critical: units.filter(u => u.status === 'critical').length
  };

  // Average consumption
  const avgConsumption = totalUnits > 0 ? totalConsumption / totalUnits : 0;
  const avgCost = totalUnits > 0 ? totalCost / totalUnits : 0;

  // Min/Max consumption
  const minConsumption = totalUnits > 0 ? Math.min(...units.map(u => u.consumption)) : 0;
  const maxConsumption = totalUnits > 0 ? Math.max(...units.map(u => u.consumption)) : 0;

  // Peak hour analysis
  const peakHours = {};
  units.forEach(unit => {
    const hour = parseInt(unit.peakTime.split(':')[0]);
    const period = unit.peakTime.includes('PM') && hour !== 12 ? hour + 12 : hour === 12 ? 12 : hour;
    if (!peakHours[period]) {
      peakHours[period] = 0;
    }
    peakHours[period] += unit.consumption;
  });

  const peakHour = Object.keys(peakHours).reduce((a, b) => 
    peakHours[a] > peakHours[b] ? a : b, 
    Object.keys(peakHours)[0]
  );

  return {
    totalUnits,
    totalConsumption,
    totalCost,
    avgConsumption,
    avgCost,
    minConsumption,
    maxConsumption,
    consumptionRange: `${minConsumption} - ${maxConsumption} kWh`,
    consumptionByType,
    statusCounts,
    peakHour: peakHour ? `${peakHour}:00` : 'N/A',
    peakHours
  };
};

// Calculate building-level metrics
export const calculateBuildingMetrics = (buildingId, units) => {
  const buildingUnits = units.filter(u => {
    const floor = powerPlantData.floors.find(f => f.id === u.floorId);
    return floor && floor.buildingId === buildingId;
  });

  const totalConsumption = buildingUnits.reduce((sum, u) => sum + u.consumption, 0);
  const totalCost = buildingUnits.reduce((sum, u) => sum + (u.cost || u.consumption * 10), 0);
  const building = powerPlantData.buildings.find(b => b.id === buildingId);
  const floors = powerPlantData.floors.filter(f => f.buildingId === buildingId);

  return {
    buildingId,
    buildingName: building?.name || 'Unknown',
    buildingType: building?.type || 'unknown',
    totalFloors: floors.length,
    totalUnits: buildingUnits.length,
    totalConsumption,
    totalCost,
    avgConsumption: buildingUnits.length > 0 ? (totalConsumption / buildingUnits.length) : 0,
    floors: floors.map(floor => ({
      ...floor,
      units: buildingUnits.filter(u => u.floorId === floor.id),
      consumption: buildingUnits.filter(u => u.floorId === floor.id).reduce((sum, u) => sum + u.consumption, 0)
    }))
  };
};

// Calculate floor-level metrics
export const calculateFloorMetrics = (floorId, units) => {
  const floorUnits = units.filter(u => u.floorId === floorId);
  const floor = powerPlantData.floors.find(f => f.id === floorId);
  const building = powerPlantData.buildings.find(b => b.id === floor?.buildingId);

  const totalConsumption = floorUnits.reduce((sum, u) => sum + u.consumption, 0);
  const totalCost = floorUnits.reduce((sum, u) => sum + (u.cost || u.consumption * 10), 0);

  return {
    floorId,
    floorName: floor?.name || 'Unknown',
    floorNumber: floor?.floorNumber || 0,
    buildingName: building?.name || 'Unknown',
    buildingId: building?.id || 0,
    totalUnits: floorUnits.length,
    totalConsumption,
    totalCost,
    avgConsumption: floorUnits.length > 0 ? (totalConsumption / floorUnits.length) : 0,
    units: floorUnits
  };
};

// Calculate branch-level metrics
export const calculateBranchMetrics = (branchId, units) => {
  const branchUnits = getUnitsByBranchId(branchId);
  const branch = powerPlantData.branches.find(b => b.id === branchId);
  const buildings = powerPlantData.buildings.filter(b => b.branchId === branchId);

  const totalConsumption = branchUnits.reduce((sum, u) => sum + u.consumption, 0);
  const totalCost = branchUnits.reduce((sum, u) => sum + (u.cost || u.consumption * 10), 0);

  return {
    branchId,
    branchName: branch?.name || 'Unknown',
    branchType: branch?.type || 'unknown',
    totalBuildings: buildings.length,
    totalUnits: branchUnits.length,
    totalConsumption: totalConsumption.toFixed(1),
    totalCost: totalCost.toFixed(2),
    avgConsumption: branchUnits.length > 0 ? (totalConsumption / branchUnits.length).toFixed(1) : '0.0',
    buildings: buildings.map(building => calculateBuildingMetrics(building.id, branchUnits))
  };
};

// Legacy function for backward compatibility
export const calculateStatistics = (locations) => {
  const residentialCount = locations.filter(l => l.type === 'residential').length;
  const commercialCount = locations.filter(l => l.type === 'commercial').length;
  const industrialCount = locations.filter(l => l.type === 'industrial').length;
  
  const totalConsumption = locations.reduce((sum, location) => sum + location.consumption, 0);
  const totalCost = locations.reduce((sum, location) => sum + (location.cost || location.consumption * 10), 0);
  
  const change = (Math.random() * 15 - 5).toFixed(1);
  
  const streetConsumption = {};
  locations.forEach(location => {
    if (!streetConsumption[location.street]) {
      streetConsumption[location.street] = 0;
    }
    streetConsumption[location.street] += location.consumption;
  });
  
  let topStreet = 'No data';
  let topConsumption = 0;
  
  Object.entries(streetConsumption).forEach(([street, consumption]) => {
    if (consumption > topConsumption) {
      topStreet = street;
      topConsumption = consumption;
    }
  });
  
  const avgConsumption = locations.length > 0 ? totalConsumption / locations.length : 0;
  const avgCost = locations.length > 0 ? totalCost / locations.length : 0;
  
  const minConsumption = locations.length > 0 ? Math.min(...locations.map(l => l.consumption)) : 0;
  const maxConsumption = locations.length > 0 ? Math.max(...locations.map(l => l.consumption)) : 0;
  
  return {
    totalLocations: locations.length,
    residentialCount,
    commercialCount,
    industrialCount,
    totalConsumption: totalConsumption.toFixed(1),
    totalCost: totalCost.toFixed(2),
    consumptionChange: change,
    topStreet,
    topStreetConsumption: topConsumption.toFixed(1),
    avgConsumption: avgConsumption.toFixed(1),
    avgCost: avgCost.toFixed(2),
    consumptionRange: `${minConsumption.toFixed(1)} - ${maxConsumption.toFixed(1)} kWh`,
    topStreetProgress: locations.length > 0 ? (topConsumption / maxConsumption) * 100 : 0
  };
};
