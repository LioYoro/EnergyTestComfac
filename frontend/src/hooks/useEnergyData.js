import { useState, useEffect } from 'react';
import api from '../utils/api';

// Generate mock dates (last 8 days) as fallback when backend dates are unavailable
const getMockDates = () => {
  const dates = [];
  const today = new Date();
  for (let i = 0; i < 8; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    dates.push(d.toISOString().split('T')[0]);
  }
  return dates.sort(); // ascending
};

// Simple cache for hourly data to make it feel instant
const hourlyDataCache = new Map();
// Cache for summary data
const summaryCache = new Map();

// Hook for fetching energy data from backend API
export const useEnergyData = (filters = {}) => {
  const [summary, setSummary] = useState(null);
  const [hourlyData, setHourlyData] = useState(null);
  const [availableDates, setAvailableDates] = useState([]);
  const [loading, setLoading] = useState(false); // Start as false to allow immediate rendering
  const [error, setError] = useState(null);

  // Fetch ALL data in parallel - dates, hourly, and summary simultaneously
  useEffect(() => {
    const fetchAllData = async () => {
      setError(null);
      
      // Determine the date to use - prioritize filters.date, otherwise use first available date
      let dateToUse = filters.date;
      
      // If no date specified, fetch dates first to get the first available date
      if (!dateToUse) {
        try {
          const datesResponse = await api.getAvailableDates();
          const dates = datesResponse?.dates || getMockDates();
          setAvailableDates(dates);
          if (dates.length > 0) {
            dateToUse = dates[0]; // Use first available date (earliest)
          }
        } catch (err) {
          console.error('Error fetching dates:', err);
          const mockDates = getMockDates();
          setAvailableDates(mockDates);
          if (mockDates.length > 0) {
            dateToUse = mockDates[0];
          }
        }
      }
      
      // Build filters with the determined date
      const filtersWithDate = { ...filters, date: dateToUse };
      
      // Create cache key - use the actual date, not 'no-date'
      const cacheKey = `${dateToUse || 'no-date'}_${filtersWithDate.floor || 'all'}_${filtersWithDate.timeGranularity || 'day'}_${filtersWithDate.weekday || 'all'}`;
      
      // Check cache first for instant display
      const cachedHourlyData = hourlyDataCache.get(cacheKey);
      const cachedSummary = summaryCache.get(cacheKey);
      
      // If we have cached data, use it immediately
      if (cachedHourlyData) {
        setHourlyData(cachedHourlyData);
        setLoading(false);
      } else {
        setLoading(true);
      }
      
      if (cachedSummary) {
        setSummary(cachedSummary);
      }
      
      // Fetch dates (if not already fetched), hourly data, and summary ALL IN PARALLEL
      const promises = [];
      
      // Fetch dates if not already fetched
      if (!filters.date) {
        promises.push(
          api.getAvailableDates()
            .then(response => {
              const dates = response?.dates || getMockDates();
              setAvailableDates(dates);
              return dates;
            })
            .catch(err => {
              console.error('Error fetching dates:', err);
              const mockDates = getMockDates();
              setAvailableDates(mockDates);
              return mockDates;
            })
        );
      } else {
        // If date is specified, still fetch available dates for the dropdown
        promises.push(
          api.getAvailableDates()
            .then(response => {
              const dates = response?.dates || getMockDates();
              setAvailableDates(dates);
              return dates;
            })
            .catch(err => {
              console.error('Error fetching dates:', err);
              return [];
            })
        );
      }
      
      // Fetch hourly data in parallel (if we have a date)
      if (dateToUse || filters.timeGranularity === 'week') {
        if (!cachedHourlyData) {
          promises.push(
            api.getHourlyData(filtersWithDate)
              .then(hourlyResult => {
          if (hourlyResult) {
            hourlyDataCache.set(cacheKey, hourlyResult);
            if (hourlyDataCache.size > 50) {
              const firstKey = hourlyDataCache.keys().next().value;
              hourlyDataCache.delete(firstKey);
            }
            setHourlyData(hourlyResult);
                  setLoading(false);
          }
                return hourlyResult;
              })
              .catch(err => {
          console.error('Error fetching hourly data:', err);
          if (!cachedHourlyData) {
            setHourlyData(null);
          }
                setLoading(false);
                return null;
              })
          );
        }
      }
      
      // Fetch summary in parallel (if needed)
      if (!cachedSummary) {
        promises.push(
      api.getEnergySummary(filtersWithDate)
        .then(data => {
              if (data) {
                summaryCache.set(cacheKey, data);
                if (summaryCache.size > 50) {
                  const firstKey = summaryCache.keys().next().value;
                  summaryCache.delete(firstKey);
                }
          setSummary(data);
              }
              return data;
        })
        .catch(err => {
          console.error('Error fetching summary:', err);
          setError(err?.message || 'Failed to fetch summary');
          setSummary(null);
              return null;
            })
        );
      }
      
      // Wait for all parallel requests to complete
      await Promise.all(promises);
    };
    
    fetchAllData();
  }, [filters.floor, filters.timeGranularity, filters.weekday, filters.date]);

  return {
    summary,
    hourlyData,
    availableDates,
    loading,
    error
  };
};

// Hook for fetching minute data
export const useMinuteData = (date, hour) => {
  const [minuteData, setMinuteData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!date || hour === null || hour === undefined) {
      setMinuteData(null);
      return;
    }

    const fetchMinuteData = async () => {
      setLoading(true);
      try {
        const data = await api.getMinuteData(date, hour);
        setMinuteData(data);
      } catch (err) {
        console.error('Error fetching minute data:', err);
        setMinuteData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchMinuteData();
  }, [date, hour]);

  return { minuteData, loading };
};

// Cache for weekly peak hours
const weeklyPeakHoursCache = new Map();

// Hook for fetching weekly peak hours
export const useWeeklyPeakHours = (filters = {}) => {
  const [weeklyPeakHours, setWeeklyPeakHours] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Create cache key
    const cacheKey = `${filters.floor || 'all'}`;
    
    // Check cache first for instant display - synchronous check
    const cachedData = weeklyPeakHoursCache.get(cacheKey);
    if (cachedData) {
      setWeeklyPeakHours(cachedData);
      setLoading(false);
      return; // Use cached data immediately, no async needed
    }
    
    // Fetch immediately if not cached
      setLoading(true);
    api.getWeeklyPeakHours(filters)
      .then(data => {
        if (data) {
          weeklyPeakHoursCache.set(cacheKey, data);
          if (weeklyPeakHoursCache.size > 20) {
            const firstKey = weeklyPeakHoursCache.keys().next().value;
            weeklyPeakHoursCache.delete(firstKey);
          }
        setWeeklyPeakHours(data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching weekly peak hours:', err);
        setWeeklyPeakHours(null);
        setLoading(false);
      });
  }, [filters.floor]);

  return { weeklyPeakHours, loading };
};

// Cache for floor analytics
const floorAnalyticsCache = new Map();

// Hook for fetching floor analytics
export const useFloorAnalytics = (filters = {}) => {
  const [floorAnalytics, setFloorAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Create cache key
    const cacheKey = `${filters.floor || 'all'}_${filters.timeGranularity || 'day'}_${filters.weekday || 'all'}`;
    
    // Check cache first for instant display - synchronous check
    const cachedData = floorAnalyticsCache.get(cacheKey);
    if (cachedData) {
      setFloorAnalytics(cachedData);
      setLoading(false);
      return; // Use cached data immediately, no async needed
    }
    
    // Fetch immediately if not cached
      setLoading(true);
    api.getFloorAnalytics(filters)
      .then(data => {
        if (data) {
          floorAnalyticsCache.set(cacheKey, data);
          if (floorAnalyticsCache.size > 30) {
            const firstKey = floorAnalyticsCache.keys().next().value;
            floorAnalyticsCache.delete(firstKey);
          }
        setFloorAnalytics(data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching floor analytics:', err);
        setFloorAnalytics(null);
        setLoading(false);
      });
  }, [filters.floor, filters.timeGranularity, filters.weekday]);

  return { floorAnalytics, loading };
};

// Cache for floor metrics to prevent data from disappearing
const floorMetricsCache = new Map();

// Hook for fetching floor metrics from real data
export const useFloorMetrics = (filters = {}) => {
  const [floorMetrics, setFloorMetrics] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Create cache key
    const cacheKey = `${filters.date || 'no-date'}_${filters.floor || 'all'}_${filters.timeGranularity || 'day'}_${filters.weekday || 'all'}`;
    
    // Check cache first - keep data persistent
    const cachedData = floorMetricsCache.get(cacheKey);
    if (cachedData) {
      setFloorMetrics(cachedData);
      setLoading(false);
      return; // Use cached data immediately, no async needed
    }
    
    // Fetch immediately if not cached
    const fetchFloorMetrics = async () => {
      setLoading(true);
      try {
        const data = await api.getFloorMetrics(filters);
        if (data) {
          // Cache the data to prevent it from disappearing
          floorMetricsCache.set(cacheKey, data);
          if (floorMetricsCache.size > 50) {
            const firstKey = floorMetricsCache.keys().next().value;
            floorMetricsCache.delete(firstKey);
          }
          setFloorMetrics(data);
        }
      } catch (err) {
        console.error('Error fetching floor metrics:', err);
        // Don't set to null - keep previous data if available
        // Only set to null if we never had data
        if (!floorMetrics) {
          setFloorMetrics(null);
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchFloorMetrics();
  }, [filters.date, filters.floor, filters.timeGranularity, filters.weekday]);

  return { floorMetrics, loading };
};

// Cache for building metrics
const buildingMetricsCache = new Map();

// Hook for fetching building metrics from real data
export const useBuildingMetrics = (filters = {}) => {
  const [buildingMetrics, setBuildingMetrics] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Create cache key
    const cacheKey = `${filters.date || 'no-date'}_${filters.floor || 'all'}_${filters.timeGranularity || 'day'}_${filters.weekday || 'all'}`;
    
    // Check cache first - keep data persistent
    const cachedData = buildingMetricsCache.get(cacheKey);
    if (cachedData) {
      setBuildingMetrics(cachedData);
      setLoading(false);
      return;
    }
    
    const fetchBuildingMetrics = async () => {
      setLoading(true);
      try {
        const data = await api.getBuildingMetrics(filters);
        if (data) {
          buildingMetricsCache.set(cacheKey, data);
          if (buildingMetricsCache.size > 50) {
            const firstKey = buildingMetricsCache.keys().next().value;
            buildingMetricsCache.delete(firstKey);
          }
          setBuildingMetrics(data);
        }
      } catch (err) {
        console.error('Error fetching building metrics:', err);
        // Don't clear existing data on error
        if (!buildingMetrics) {
          setBuildingMetrics(null);
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchBuildingMetrics();
  }, [filters.date, filters.floor, filters.timeGranularity, filters.weekday]);

  return { buildingMetrics, loading };
};

// Cache for branch metrics
const branchMetricsCache = new Map();

// Hook for fetching branch metrics from real data
export const useBranchMetrics = (filters = {}) => {
  const [branchMetrics, setBranchMetrics] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Create cache key
    const cacheKey = `${filters.date || 'no-date'}_${filters.floor || 'all'}_${filters.timeGranularity || 'day'}_${filters.weekday || 'all'}`;
    
    // Check cache first - keep data persistent
    const cachedData = branchMetricsCache.get(cacheKey);
    if (cachedData) {
      setBranchMetrics(cachedData);
      setLoading(false);
      return;
    }
    
    const fetchBranchMetrics = async () => {
      setLoading(true);
      try {
        const data = await api.getBranchMetrics(filters);
        if (data) {
          branchMetricsCache.set(cacheKey, data);
          if (branchMetricsCache.size > 50) {
            const firstKey = branchMetricsCache.keys().next().value;
            branchMetricsCache.delete(firstKey);
          }
          setBranchMetrics(data);
        }
      } catch (err) {
        console.error('Error fetching branch metrics:', err);
        // Don't clear existing data on error
        if (!branchMetrics) {
          setBranchMetrics(null);
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchBranchMetrics();
  }, [filters.date, filters.floor, filters.timeGranularity, filters.weekday]);

  return { branchMetrics, loading };
};

// Hook for fetching top consuming units from real data
export const useTopConsumingUnits = (filters = {}) => {
  const [topUnits, setTopUnits] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTopUnits = async () => {
      setLoading(true);
      try {
        const data = await api.getTopConsumingUnits(filters);
        setTopUnits(data);
      } catch (err) {
        console.error('Error fetching top consuming units:', err);
        setTopUnits(null);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTopUnits();
  }, [filters.date, filters.floor, filters.timeGranularity, filters.weekday]);

  return { topUnits, loading };
};

// Hook for fetching consumption by equipment type from real data
export const useConsumptionByEquipmentType = (filters = {}) => {
  const [consumptionByType, setConsumptionByType] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchConsumptionByType = async () => {
      setLoading(true);
      try {
        const data = await api.getConsumptionByEquipmentType(filters);
        setConsumptionByType(data);
      } catch (err) {
        console.error('Error fetching consumption by equipment type:', err);
        setConsumptionByType(null);
      } finally {
        setLoading(false);
      }
    };
    
    fetchConsumptionByType();
  }, [filters.date, filters.floor, filters.timeGranularity, filters.weekday]);

  return { consumptionByType, loading };
};

