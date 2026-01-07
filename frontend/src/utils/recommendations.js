import { powerPlantData } from '../data/powerPlantData';
import { calculatePowerPlantStatistics, calculateBuildingMetrics, calculateFloorMetrics } from './filterUtils';

// Generate recommendations based on data analysis
export const generateRecommendations = (units, statistics) => {
  const recommendations = [];

  // Calculate overall average consumption
  const avgConsumption = parseFloat(statistics.avgConsumption || 0);

  // 1. High Consumption Units
  const highConsumptionUnits = units.filter(u => u.consumption > avgConsumption * 1.5);
  if (highConsumptionUnits.length > 0) {
    highConsumptionUnits.slice(0, 3).forEach(unit => {
      const floor = powerPlantData.floors.find(f => f.id === unit.floorId);
      const building = powerPlantData.buildings.find(b => b.id === floor?.buildingId);
      recommendations.push({
        id: `high-consumption-${unit.id}`,
        type: 'energy-efficiency',
        priority: 'high',
        title: `High Consumption Detected`,
        description: `${unit.name} in ${building?.name} (${floor?.name}) is consuming ${unit.consumption.toFixed(1)} kWh, which is ${((unit.consumption / avgConsumption - 1) * 100).toFixed(1)}% above average.`,
        action: `Review equipment efficiency and consider maintenance check.`,
        impact: `Potential savings: ₱${((unit.consumption - avgConsumption) * 10).toFixed(2)} per day`,
        category: 'consumption'
      });
    });
  }

  // 2. Peak Hour Optimization
  const peakHours = statistics.peakHours || {};
  const peakHour = Object.keys(peakHours).reduce((a, b) => 
    peakHours[a] > peakHours[b] ? a : b, 
    Object.keys(peakHours)[0]
  );
  
  if (peakHour) {
    const peakConsumption = peakHours[peakHour];
    const offPeakHours = Object.keys(peakHours).filter(h => parseInt(h) < 8 || parseInt(h) > 18);
    const avgOffPeak = offPeakHours.length > 0 
      ? offPeakHours.reduce((sum, h) => sum + peakHours[h], 0) / offPeakHours.length 
      : 0;
    
    if (peakConsumption > avgOffPeak * 1.3) {
      recommendations.push({
        id: 'peak-hour-optimization',
        type: 'cost-optimization',
        priority: 'medium',
        title: `Peak Hour Optimization Opportunity`,
        description: `Peak consumption occurs at ${peakHour}:00 with ${peakConsumption.toFixed(1)} kWh. Average off-peak consumption is ${avgOffPeak.toFixed(1)} kWh.`,
        action: `Consider shifting non-critical operations to off-peak hours (before 8 AM or after 6 PM).`,
        impact: `Potential cost savings: ₱${((peakConsumption - avgOffPeak) * 2 * 10).toFixed(2)} per day`,
        category: 'scheduling'
      });
    }
  }

  // 3. Building Efficiency Analysis
  const buildingMetrics = powerPlantData.buildings.map(building => 
    calculateBuildingMetrics(building.id, units)
  );
  const avgBuildingConsumption = buildingMetrics.length > 0
    ? buildingMetrics.reduce((sum, b) => sum + parseFloat(b.totalConsumption), 0) / buildingMetrics.length
    : 0;

  buildingMetrics.forEach(building => {
    const buildingConsumption = parseFloat(building.totalConsumption);
    if (buildingConsumption > avgBuildingConsumption * 1.2) {
      recommendations.push({
        id: `building-efficiency-${building.buildingId}`,
        type: 'energy-efficiency',
        priority: 'medium',
        title: `${building.buildingName} Efficiency Review`,
        description: `${building.buildingName} consumes ${buildingConsumption.toFixed(1)} kWh, which is ${((buildingConsumption / avgBuildingConsumption - 1) * 100).toFixed(1)}% above average.`,
        action: `Review building operations, HVAC systems, and equipment efficiency.`,
        impact: `Potential savings: ₱${((buildingConsumption - avgBuildingConsumption) * 10).toFixed(2)} per day`,
        category: 'building'
      });
    }
  });

  // 4. Maintenance Alerts
  const maintenanceUnits = units.filter(u => u.status === 'maintenance');
  if (maintenanceUnits.length > 0) {
    recommendations.push({
      id: 'maintenance-alert',
      type: 'maintenance',
      priority: 'high',
      title: `Maintenance Required`,
      description: `${maintenanceUnits.length} unit(s) currently require maintenance attention.`,
      action: `Schedule maintenance checks for affected units to ensure optimal performance.`,
      impact: `Prevents potential breakdowns and ensures efficiency`,
      category: 'maintenance',
      units: maintenanceUnits.map(u => u.name)
    });
  }

  // 5. Critical Status Alerts
  const criticalUnits = units.filter(u => u.status === 'critical');
  if (criticalUnits.length > 0) {
    criticalUnits.forEach(unit => {
      const floor = powerPlantData.floors.find(f => f.id === unit.floorId);
      const building = powerPlantData.buildings.find(b => b.id === floor?.buildingId);
      recommendations.push({
        id: `critical-${unit.id}`,
        type: 'critical',
        priority: 'urgent',
        title: `Critical Alert: ${unit.name}`,
        description: `${unit.name} in ${building?.name} (${floor?.name}) is in critical status and requires immediate attention.`,
        action: `Immediate inspection and repair required.`,
        impact: `Prevents system failure and ensures safety`,
        category: 'critical'
      });
    });
  }

  // 6. Equipment Type Analysis
  const consumptionByType = statistics.consumptionByType || {};
  const typeAverages = {};
  Object.keys(consumptionByType).forEach(type => {
    const typeUnits = units.filter(u => u.equipmentType === type);
    typeAverages[type] = typeUnits.length > 0
      ? consumptionByType[type] / typeUnits.length
      : 0;
  });

  const overallAvg = avgConsumption;
  Object.keys(typeAverages).forEach(type => {
    if (typeAverages[type] > overallAvg * 1.3) {
      recommendations.push({
        id: `equipment-type-${type}`,
        type: 'energy-efficiency',
        priority: 'low',
        title: `${type} Equipment Efficiency`,
        description: `${type} equipment averages ${typeAverages[type].toFixed(1)} kWh per unit, which is ${((typeAverages[type] / overallAvg - 1) * 100).toFixed(1)}% above overall average.`,
        action: `Review ${type} equipment specifications and consider upgrades or optimization.`,
        impact: `Potential efficiency improvements across ${type} equipment`,
        category: 'equipment'
      });
    }
  });

  // 7. Cost Optimization
  const totalCost = parseFloat(statistics.totalCost || 0);
  const dailyCost = totalCost;
  const monthlyCost = dailyCost * 30;
  
  if (monthlyCost > 500000) {
    recommendations.push({
      id: 'cost-optimization',
      type: 'cost-optimization',
      priority: 'medium',
      title: `Cost Optimization Opportunity`,
      description: `Monthly energy costs are ₱${monthlyCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}.`,
      action: `Implement energy-saving measures, optimize peak hour usage, and review equipment efficiency.`,
      impact: `Potential monthly savings: ₱${(monthlyCost * 0.1).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (10% reduction)`,
      category: 'cost'
    });
  }

  // Sort by priority
  const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
  recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return recommendations;
};

