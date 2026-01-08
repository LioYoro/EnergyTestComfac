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
      
      // Use today's date as immediate fallback - don't wait for anything
      const today = new Date();
      const fallbackDate = today.toISOString().split('T')[0];
      let dateToUse = filters.date || fallbackDate;
      
      // Build filters with date
      const filtersWithDate = { ...filters, date: dateToUse };
      
      // Create cache key
      const cacheKey = `${filtersWithDate.date || 'no-date'}_${filtersWithDate.floor || 'all'}_${filtersWithDate.timeGranularity || 'day'}_${filtersWithDate.weekday || 'all'}`;
      
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
      
      // Fetch dates, hourly data, and summary ALL IN PARALLEL for maximum speed
      const promises = [];
      
      // Always fetch dates (lightweight, can run in parallel)
      promises.push(
        api.getAvailableDates()
          .then(response => {
            const dates = response?.dates || getMockDates();
            setAvailableDates(dates);
            // Update date if we got better dates and no date was specified
            if (!filters.date && dates.length > 0) {
              dateToUse = dates[0];
            }
            return dates;
          })
          .catch(err => {
            console.error('Error fetching dates:', err);
            const mockDates = getMockDates();
            setAvailableDates(mockDates);
            return mockDates;
          })
      );
      
      // Fetch hourly data in parallel (if needed)
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



