// API Service Layer for Backend Integration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// Helper function for API calls
const apiCall = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers
      },
      ...options
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    // Handle Laravel API response format
    return data.data || data;
  } catch (error) {
    console.error('API Call Error:', error);
    throw error;
  }
};

// API Service Object - Backend Integration
export const api = {
  // Energy Data Endpoints (Actual Backend API - Priority)
  getEnergySummary: (date) => {
    const url = date ? `/energy/dashboard/summary?date=${date}` : '/energy/dashboard/summary';
    return apiCall(url);
  },
  getHourlyData: (date) => {
    const url = date ? `/energy/dashboard/hourly?date=${date}` : '/energy/dashboard/hourly';
    return apiCall(url);
  },
  getMinuteData: (date, hour) => {
    const params = new URLSearchParams();
    if (date) params.append('date', date);
    if (hour !== undefined && hour !== null) params.append('hour', hour);
    const url = params.toString() ? `/energy/dashboard/minute?${params}` : '/energy/dashboard/minute';
    return apiCall(url);
  },
  getAvailableDates: () => apiCall('/energy/dashboard/dates'),
  getEnergySummaryLegacy: () => apiCall('/energy/summary'),
  testAPI: () => apiCall('/test'),

  // Power Plant Structure Endpoints (To be implemented in backend)
  // For now, these will fall back to mock data
  getBranches: async () => {
    try {
      return await apiCall('/branches');
    } catch {
      return null; // Fallback to mock
    }
  },
  getBranch: async (id) => {
    try {
      return await apiCall(`/branches/${id}`);
    } catch {
      return null;
    }
  },
  getBranchBuildings: async (id) => {
    try {
      return await apiCall(`/branches/${id}/buildings`);
    } catch {
      return null;
    }
  },

  // Buildings
  getBuildings: async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      return await apiCall(`/buildings${queryParams ? `?${queryParams}` : ''}`);
    } catch {
      return null;
    }
  },
  getBuilding: async (id) => {
    try {
      return await apiCall(`/buildings/${id}`);
    } catch {
      return null;
    }
  },
  getBuildingFloors: async (id) => {
    try {
      return await apiCall(`/buildings/${id}/floors`);
    } catch {
      return null;
    }
  },
  getBuildingUnits: async (id) => {
    try {
      return await apiCall(`/buildings/${id}/units`);
    } catch {
      return null;
    }
  },
  getBuildingMetrics: async (id) => {
    try {
      return await apiCall(`/buildings/${id}/metrics`);
    } catch {
      return null;
    }
  },

  // Floors
  getFloors: async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      return await apiCall(`/floors${queryParams ? `?${queryParams}` : ''}`);
    } catch {
      return null;
    }
  },
  getFloor: async (id) => {
    try {
      return await apiCall(`/floors/${id}`);
    } catch {
      return null;
    }
  },
  getFloorUnits: async (id) => {
    try {
      return await apiCall(`/floors/${id}/units`);
    } catch {
      return null;
    }
  },
  getFloorMetrics: async (id) => {
    try {
      return await apiCall(`/floors/${id}/metrics`);
    } catch {
      return null;
    }
  },

  // Units/Equipment
  getUnits: async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      return await apiCall(`/units${queryParams ? `?${queryParams}` : ''}`);
    } catch {
      return null;
    }
  },
  getUnit: async (id) => {
    try {
      return await apiCall(`/units/${id}`);
    } catch {
      return null;
    }
  },
  updateUnit: async (id, data) => {
    try {
      return await apiCall(`/units/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
    } catch {
      return null;
    }
  },

  // Statistics
  getStatistics: async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      return await apiCall(`/statistics${queryParams ? `?${queryParams}` : ''}`);
    } catch {
      return null;
    }
  },
  getPowerPlantStatistics: async () => {
    try {
      return await apiCall('/statistics/power-plant');
    } catch {
      return null;
    }
  },
  getBuildingStatistics: async (buildingId) => {
    try {
      return await apiCall(`/statistics/building/${buildingId}`);
    } catch {
      return null;
    }
  },
  getBranchStatistics: async (branchId) => {
    try {
      return await apiCall(`/statistics/branch/${branchId}`);
    } catch {
      return null;
    }
  },

  // Recommendations
  getRecommendations: async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      return await apiCall(`/recommendations${queryParams ? `?${queryParams}` : ''}`);
    } catch {
      return null;
    }
  },

  // Time Series Data (using actual backend endpoints)
  getTimeSeriesData: async (type, filters = {}) => {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      return await apiCall(`/time-series/${type}${queryParams ? `?${queryParams}` : ''}`);
    } catch {
      return null;
    }
  },
  getPerSecondData: async (filters) => {
    // Use actual backend endpoint
    try {
      const summary = await api.getEnergySummary(filters.date);
      return summary?.per_second || null;
    } catch {
      return null;
    }
  },
  getPerMinuteData: async (filters) => {
    try {
      const summary = await api.getEnergySummary(filters.date);
      return summary?.per_minute || null;
    } catch {
      return null;
    }
  },
  getPerHourData: async (filters) => {
    try {
      const hourlyData = await api.getHourlyData(filters.date);
      return hourlyData?.hourly_data || null;
    } catch {
      return null;
    }
  },

  // Search
  searchUnits: async (query) => {
    try {
      return await apiCall(`/search/units?q=${encodeURIComponent(query)}`);
    } catch {
      return null;
    }
  },
  searchBuildings: async (query) => {
    try {
      return await apiCall(`/search/buildings?q=${encodeURIComponent(query)}`);
    } catch {
      return null;
    }
  },

  // Reports
  exportData: async (format, filters = {}) => {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      return await apiCall(`/export/${format}${queryParams ? `?${queryParams}` : ''}`);
    } catch {
      return null;
    }
  }
};

// Fallback to mock data if API is not available
export const useMockData = () => {
  return process.env.REACT_APP_USE_MOCK_DATA === 'true' || !process.env.REACT_APP_API_URL;
};

export default api;

