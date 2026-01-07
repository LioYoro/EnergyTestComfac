// Comprehensive data for Laguna, Philippines locations
// Energy consumption in kWh, cost in PHP (Philippine Peso)
// Average rate: ~₱8-12 per kWh

export const locationData = {
  cities: [
    { "id": 1, "name": "Calamba", "region": "south" },
    { "id": 2, "name": "Santa Rosa", "region": "north" },
    { "id": 3, "name": "San Pedro", "region": "north" },
    { "id": 4, "name": "Biñan", "region": "north" },
    { "id": 5, "name": "Cabuyao", "region": "north" },
    { "id": 6, "name": "Los Baños", "region": "south" },
    { "id": 7, "name": "Bay", "region": "south" },
    { "id": 8, "name": "Calauan", "region": "south" },
    { "id": 9, "name": "Alaminos", "region": "south" },
    { "id": 10, "name": "San Pablo", "region": "south" }
  ],
  streets: [
    { "id": 1, "name": "Rizal Avenue", "city": "Calamba", "totalConsumption": 245.3, "locationCount": 8 },
    { "id": 2, "name": "National Highway", "city": "Santa Rosa", "totalConsumption": 187.6, "locationCount": 6 },
    { "id": 3, "name": "Paciano Rizal Street", "city": "San Pedro", "totalConsumption": 156.2, "locationCount": 5 },
    { "id": 4, "name": "Governor's Drive", "city": "Biñan", "totalConsumption": 132.8, "locationCount": 4 },
    { "id": 5, "name": "Manila South Road", "city": "Cabuyao", "totalConsumption": 198.4, "locationCount": 7 },
    { "id": 6, "name": "Grove Avenue", "city": "Los Baños", "totalConsumption": 112.5, "locationCount": 3 },
    { "id": 7, "name": "J.P. Rizal Street", "city": "Bay", "totalConsumption": 176.9, "locationCount": 5 },
    { "id": 8, "name": "Maharlika Highway", "city": "Calauan", "totalConsumption": 143.7, "locationCount": 4 }
  ],
  locations: [
    { "id": 1, "name": "SM City Calamba", "street": "Rizal Avenue", "city": "Calamba", "type": "commercial", "region": "south", "consumption": 85.2, "cost": 852.00, "peakTime": "2:00 PM", "status": "high" },
    { "id": 2, "name": "Laguna Technopark", "street": "Rizal Avenue", "city": "Calamba", "type": "industrial", "region": "south", "consumption": 72.4, "cost": 724.00, "peakTime": "10:00 AM", "status": "medium" },
    { "id": 3, "name": "Vista Residences", "street": "National Highway", "city": "Santa Rosa", "type": "residential", "region": "north", "consumption": 45.6, "cost": 456.00, "peakTime": "7:00 PM", "status": "medium" },
    { "id": 4, "name": "Robinsons Place San Pedro", "street": "Paciano Rizal Street", "city": "San Pedro", "type": "commercial", "region": "north", "consumption": 68.3, "cost": 683.00, "peakTime": "3:00 PM", "status": "high" },
    { "id": 5, "name": "Nestlé Factory", "street": "Governor's Drive", "city": "Biñan", "type": "industrial", "region": "north", "consumption": 92.1, "cost": 921.00, "peakTime": "11:00 AM", "status": "high" },
    { "id": 6, "name": "Ayala Malls Solenad", "street": "Manila South Road", "city": "Cabuyao", "type": "commercial", "region": "north", "consumption": 76.8, "cost": 768.00, "peakTime": "4:00 PM", "status": "medium" },
    { "id": 7, "name": "UP Los Baños Campus", "street": "Grove Avenue", "city": "Los Baños", "type": "residential", "region": "south", "consumption": 38.4, "cost": 384.00, "peakTime": "8:00 PM", "status": "low" },
    { "id": 8, "name": "Nuvali Business District", "street": "National Highway", "city": "Santa Rosa", "type": "commercial", "region": "north", "consumption": 64.7, "cost": 647.00, "peakTime": "1:00 PM", "status": "medium" },
    { "id": 9, "name": "San Miguel Brewery", "street": "J.P. Rizal Street", "city": "Bay", "type": "industrial", "region": "south", "consumption": 88.3, "cost": 883.00, "peakTime": "9:00 AM", "status": "high" },
    { "id": 10, "name": "Calamba Heights Subdivision", "street": "Rizal Avenue", "city": "Calamba", "type": "residential", "region": "south", "consumption": 42.1, "cost": 421.00, "peakTime": "6:00 PM", "status": "low" },
    { "id": 11, "name": "Paseo de Sta. Rosa", "street": "National Highway", "city": "Santa Rosa", "type": "commercial", "region": "north", "consumption": 58.9, "cost": 589.00, "peakTime": "5:00 PM", "status": "medium" },
    { "id": 12, "name": "Coca-Cola Bottling Plant", "street": "Paciano Rizal Street", "city": "San Pedro", "type": "industrial", "region": "north", "consumption": 79.6, "cost": 796.00, "peakTime": "12:00 PM", "status": "high" },
    { "id": 13, "name": "Brentville Subdivision", "street": "Governor's Drive", "city": "Biñan", "type": "residential", "region": "north", "consumption": 36.2, "cost": 362.00, "peakTime": "7:30 PM", "status": "low" },
    { "id": 14, "name": "Cabuyao City Hall", "street": "Manila South Road", "city": "Cabuyao", "type": "commercial", "region": "north", "consumption": 71.5, "cost": 715.00, "peakTime": "2:30 PM", "status": "medium" },
    { "id": 15, "name": "IRRI Research Center", "street": "Grove Avenue", "city": "Los Baños", "type": "industrial", "region": "south", "consumption": 63.8, "cost": 638.00, "peakTime": "10:30 AM", "status": "medium" },
    { "id": 16, "name": "Palm Ridge Residences", "street": "National Highway", "city": "Santa Rosa", "type": "residential", "region": "north", "consumption": 47.3, "cost": 473.00, "peakTime": "8:30 PM", "status": "medium" },
    { "id": 17, "name": "San Pedro City Market", "street": "Paciano Rizal Street", "city": "San Pedro", "type": "commercial", "region": "north", "consumption": 55.4, "cost": 554.00, "peakTime": "4:30 PM", "status": "medium" },
    { "id": 18, "name": "Calamba Medical Center", "street": "Rizal Avenue", "city": "Calamba", "type": "industrial", "region": "south", "consumption": 81.7, "cost": 817.00, "peakTime": "11:30 AM", "status": "high" },
    { "id": 19, "name": "Villa Escudero", "street": "Maharlika Highway", "city": "Calauan", "type": "residential", "region": "south", "consumption": 39.8, "cost": 398.00, "peakTime": "7:00 PM", "status": "low" },
    { "id": 20, "name": "Biñan City Plaza", "street": "Governor's Drive", "city": "Biñan", "type": "commercial", "region": "north", "consumption": 62.3, "cost": 623.00, "peakTime": "3:30 PM", "status": "medium" },
    { "id": 21, "name": "Laguna Lake Development", "street": "J.P. Rizal Street", "city": "Bay", "type": "industrial", "region": "south", "consumption": 86.5, "cost": 865.00, "peakTime": "9:30 AM", "status": "high" },
    { "id": 22, "name": "Cabuyao Public Market", "street": "Manila South Road", "city": "Cabuyao", "type": "commercial", "region": "north", "consumption": 59.2, "cost": 592.00, "peakTime": "5:30 PM", "status": "medium" },
    { "id": 23, "name": "UP Los Baños Dormitories", "street": "Grove Avenue", "city": "Los Baños", "type": "residential", "region": "south", "consumption": 34.7, "cost": 347.00, "peakTime": "8:00 PM", "status": "low" },
    { "id": 24, "name": "Santa Rosa Industrial Complex", "street": "National Highway", "city": "Santa Rosa", "type": "industrial", "region": "north", "consumption": 74.9, "cost": 749.00, "peakTime": "12:30 PM", "status": "medium" }
  ],
  timeData: {
    perSecond: Array.from({ length: 60 }, (_, i) => Math.random() * 5 + 1),
    perMinute: Array.from({ length: 60 }, (_, i) => Math.random() * 5 + 1.5),
    perHour: {
      residential: Array.from({ length: 24 }, (_, i) => Math.random() * 40 + 10),
      commercial: Array.from({ length: 24 }, (_, i) => Math.random() * 60 + 20),
      industrial: Array.from({ length: 24 }, (_, i) => Math.random() * 80 + 30)
    }
  }
};

// Helper function to calculate cost from consumption (kWh * rate)
export const calculateCost = (consumption, rate = 10) => {
  return consumption * rate;
};
