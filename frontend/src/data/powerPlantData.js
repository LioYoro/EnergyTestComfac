// Laguna Power Plant Energy Management System
// Simplified Structure: One Branch → One Building → Three Floors → Units

export const powerPlantData = {
  branches: [
    { 
      id: 1, 
      name: "Laguna Power Plant", 
      location: "Laguna, Philippines", 
      type: "main",
      description: "Main power generation facility"
    }
  ],

  buildings: [
    { 
      id: 1, 
      branchId: 1, 
      name: "Main Power Plant Building", 
      type: "production", 
      totalFloors: 3, 
      area: 5000 
    }
  ],

  floors: [
    { 
      id: 1, 
      buildingId: 1, 
      floorNumber: 1, 
      name: "Floor 1", 
      area: 1666.67, 
      unitCount: 6 
    },
    { 
      id: 2, 
      buildingId: 1, 
      floorNumber: 2, 
      name: "Floor 2", 
      area: 1666.67, 
      unitCount: 6 
    },
    { 
      id: 3, 
      buildingId: 1, 
      floorNumber: 3, 
      name: "Floor 3", 
      area: 1666.67, 
      unitCount: 6 
    }
  ],

  units: [
    // Floor 1 Units - Total: ~193.3 kWh (distributed across 6 units)
    // Based on actual energy data: avg power 1006.8W
    { id: 1, floorId: 1, name: "HVAC Unit 1", equipmentType: "HVAC", consumption: 45.2, cost: 452.00, status: "operational", peakTime: "2:00 PM" },
    { id: 2, floorId: 1, name: "Lighting Unit 1", equipmentType: "Lighting", consumption: 18.5, cost: 185.00, status: "operational", peakTime: "9:00 AM" },
    { id: 3, floorId: 1, name: "Equipment Unit 1", equipmentType: "Equipment", consumption: 52.8, cost: 528.00, status: "operational", peakTime: "10:00 AM" },
    { id: 4, floorId: 1, name: "Control Systems Unit 1", equipmentType: "Control Systems", consumption: 38.7, cost: 387.00, status: "operational", peakTime: "11:00 AM" },
    { id: 5, floorId: 1, name: "Monitoring Unit 1", equipmentType: "Monitoring", consumption: 22.1, cost: 221.00, status: "operational", peakTime: "12:00 PM" },
    { id: 6, floorId: 1, name: "Auxiliary Unit 1", equipmentType: "Auxiliary", consumption: 16.0, cost: 160.00, status: "operational", peakTime: "1:00 PM" },
    
    // Floor 2 Units - Total: ~94.7 kWh (distributed across 6 units)
    // Based on actual energy data: avg power 493.3W
    { id: 7, floorId: 2, name: "HVAC Unit 2", equipmentType: "HVAC", consumption: 22.1, cost: 221.00, status: "operational", peakTime: "2:00 PM" },
    { id: 8, floorId: 2, name: "Lighting Unit 2", equipmentType: "Lighting", consumption: 9.2, cost: 92.00, status: "operational", peakTime: "9:00 AM" },
    { id: 9, floorId: 2, name: "Equipment Unit 2", equipmentType: "Equipment", consumption: 25.8, cost: 258.00, status: "operational", peakTime: "10:00 AM" },
    { id: 10, floorId: 2, name: "Control Systems Unit 2", equipmentType: "Control Systems", consumption: 18.9, cost: 189.00, status: "operational", peakTime: "11:00 AM" },
    { id: 11, floorId: 2, name: "Monitoring Unit 2", equipmentType: "Monitoring", consumption: 10.8, cost: 108.00, status: "operational", peakTime: "12:00 PM" },
    { id: 12, floorId: 2, name: "Auxiliary Unit 2", equipmentType: "Auxiliary", consumption: 7.9, cost: 79.00, status: "operational", peakTime: "1:00 PM" },
    
    // Floor 3 Units - Total: ~156.6 kWh (distributed across 6 units)
    // Based on actual energy data: avg power 815.4W
    { id: 13, floorId: 3, name: "HVAC Unit 3", equipmentType: "HVAC", consumption: 36.5, cost: 365.00, status: "operational", peakTime: "2:00 PM" },
    { id: 14, floorId: 3, name: "Lighting Unit 3", equipmentType: "Lighting", consumption: 15.2, cost: 152.00, status: "operational", peakTime: "9:00 AM" },
    { id: 15, floorId: 3, name: "Equipment Unit 3", equipmentType: "Equipment", consumption: 42.6, cost: 426.00, status: "operational", peakTime: "10:00 AM" },
    { id: 16, floorId: 3, name: "Control Systems Unit 3", equipmentType: "Control Systems", consumption: 31.2, cost: 312.00, status: "operational", peakTime: "11:00 AM" },
    { id: 17, floorId: 3, name: "Monitoring Unit 3", equipmentType: "Monitoring", consumption: 17.8, cost: 178.00, status: "operational", peakTime: "12:00 PM" },
    { id: 18, floorId: 3, name: "Auxiliary Unit 3", equipmentType: "Auxiliary", consumption: 13.3, cost: 133.00, status: "operational", peakTime: "1:00 PM" }
  ]
};

// Helper functions
export const getUnitsByFloorId = (floorId) => {
  return powerPlantData.units.filter(unit => unit.floorId === floorId);
};

export const getUnitsByBuildingId = (buildingId) => {
  const floorIds = powerPlantData.floors
    .filter(floor => floor.buildingId === buildingId)
    .map(floor => floor.id);
  return powerPlantData.units.filter(unit => floorIds.includes(unit.floorId));
};

export const getUnitsByBranchId = (branchId) => {
  const buildingIds = powerPlantData.buildings
    .filter(building => building.branchId === branchId)
    .map(building => building.id);
  const floorIds = powerPlantData.floors
    .filter(floor => buildingIds.includes(floor.buildingId))
    .map(floor => floor.id);
  return powerPlantData.units.filter(unit => floorIds.includes(unit.floorId));
};

export const getBuildingById = (id) => {
  return powerPlantData.buildings.find(building => building.id === id);
};

export const getFloorById = (id) => {
  return powerPlantData.floors.find(floor => floor.id === id);
};

export const getBranchById = (id) => {
  return powerPlantData.branches.find(branch => branch.id === id);
};

export const getFloorsByBuildingId = (buildingId) => {
  return powerPlantData.floors.filter(floor => floor.buildingId === buildingId);
};

export const getBuildingsByBranchId = (branchId) => {
  return powerPlantData.buildings.filter(building => building.branchId === branchId);
};
