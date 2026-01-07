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

// Hook for fetching energy data from backend API
export const useEnergyData = (date = null) => {
  const [summary, setSummary] = useState(null);
  const [hourlyData, setHourlyData] = useState(null);
  const [availableDates, setAvailableDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch available dates
  useEffect(() => {
    const fetchDates = async () => {
      try {
        const response = await api.getAvailableDates();
        setAvailableDates(response.dates || getMockDates());
      } catch (err) {
        console.error('Error fetching dates:', err);
        setAvailableDates(getMockDates());
      }
    };
    fetchDates();
  }, []);

  // Fetch summary data
  useEffect(() => {
    const fetchSummary = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await api.getEnergySummary(date);
        setSummary(data);
      } catch (err) {
        console.error('Error fetching summary:', err);
        setError(err.message);
        setSummary(null);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, [date]);

  // Fetch hourly data
  useEffect(() => {
    const fetchHourly = async () => {
      if (!date) return;
      try {
        const data = await api.getHourlyData(date);
        setHourlyData(data);
      } catch (err) {
        console.error('Error fetching hourly data:', err);
        setHourlyData(null);
      }
    };
    fetchHourly();
  }, [date]);

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



