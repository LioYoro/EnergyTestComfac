import { useState, useEffect } from 'react';
import { powerPlantData } from '../data/powerPlantData';
import { filterUnits, calculatePowerPlantStatistics, scaleUnitsByTime } from '../utils/filterUtils';
import api, { useMockData } from '../utils/api';

// Custom hook for power plant data management
export const usePowerPlantData = (filters) => {
  const [units, setUnits] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const useMock = useMockData();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        if (useMock) {
          // Use mock data with time scaling
          const filtered = filterUnits(filters);
          const scaled = scaleUnitsByTime(filtered, filters);
          setUnits(scaled);
          const stats = calculatePowerPlantStatistics(scaled);
          setStatistics(stats);
        } else {
          // Fetch from API
          try {
            const data = await api.getUnits(filters);
            const apiUnits = data.units || data;
            // If backend does not apply time granularity, scale locally for now
            const scaled = scaleUnitsByTime(apiUnits, filters);
            setUnits(scaled);
            
            // Fetch statistics (if backend provides), otherwise compute locally
            try {
              const stats = await api.getStatistics(filters);
              setStatistics(stats);
            } catch {
              const stats = calculatePowerPlantStatistics(scaled);
              setStatistics(stats);
            }
          } catch (apiError) {
            console.warn('API call failed, falling back to mock data:', apiError);
            // Fallback to mock data with scaling
            const filtered = filterUnits(filters);
            const scaled = scaleUnitsByTime(filtered, filters);
            setUnits(scaled);
            const stats = calculatePowerPlantStatistics(scaled);
            setStatistics(stats);
          }
        }
      } catch (err) {
        setError(err.message);
        console.error('Data fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filters, useMock]);

  return { units, statistics, loading, error };
};

// Hook for fetching branches
export const useBranches = () => {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const useMock = useMockData();

  useEffect(() => {
    const fetchBranches = async () => {
      setLoading(true);
      try {
        if (useMock) {
          setBranches(powerPlantData.branches);
        } else {
          try {
            const data = await api.getBranches();
            setBranches(data.branches || data);
          } catch (error) {
            console.warn('API call failed, using mock data');
            setBranches(powerPlantData.branches);
          }
        }
      } catch (err) {
        console.error('Error fetching branches:', err);
        setBranches(powerPlantData.branches);
      } finally {
        setLoading(false);
      }
    };

    fetchBranches();
  }, [useMock]);

  return { branches, loading };
};

// Hook for fetching buildings
export const useBuildings = (branchId = null) => {
  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading] = useState(true);
  const useMock = useMockData();

  useEffect(() => {
    const fetchBuildings = async () => {
      setLoading(true);
      try {
        if (useMock) {
          let buildingsData = powerPlantData.buildings;
          if (branchId && branchId !== 'all') {
            buildingsData = buildingsData.filter(b => b.branchId === parseInt(branchId));
          }
          setBuildings(buildingsData);
        } else {
          try {
            const data = branchId && branchId !== 'all'
              ? await api.getBranchBuildings(branchId)
              : await api.getBuildings();
            setBuildings(data.buildings || data);
          } catch (error) {
            console.warn('API call failed, using mock data');
            let buildingsData = powerPlantData.buildings;
            if (branchId && branchId !== 'all') {
              buildingsData = buildingsData.filter(b => b.branchId === parseInt(branchId));
            }
            setBuildings(buildingsData);
          }
        }
      } catch (err) {
        console.error('Error fetching buildings:', err);
        setBuildings(powerPlantData.buildings);
      } finally {
        setLoading(false);
      }
    };

    fetchBuildings();
  }, [branchId, useMock]);

  return { buildings, loading };
};

// Hook for fetching floors
export const useFloors = (buildingId = null) => {
  const [floors, setFloors] = useState([]);
  const [loading, setLoading] = useState(true);
  const useMock = useMockData();

  useEffect(() => {
    const fetchFloors = async () => {
      setLoading(true);
      try {
        if (useMock) {
          let floorsData = powerPlantData.floors;
          if (buildingId && buildingId !== 'all') {
            floorsData = floorsData.filter(f => f.buildingId === parseInt(buildingId));
          }
          setFloors(floorsData);
        } else {
          try {
            const data = buildingId && buildingId !== 'all'
              ? await api.getBuildingFloors(buildingId)
              : await api.getFloors();
            setFloors(data.floors || data);
          } catch (error) {
            console.warn('API call failed, using mock data');
            let floorsData = powerPlantData.floors;
            if (buildingId && buildingId !== 'all') {
              floorsData = floorsData.filter(f => f.buildingId === parseInt(buildingId));
            }
            setFloors(floorsData);
          }
        }
      } catch (err) {
        console.error('Error fetching floors:', err);
        setFloors(powerPlantData.floors);
      } finally {
        setLoading(false);
      }
    };

    fetchFloors();
  }, [buildingId, useMock]);

  return { floors, loading };
};



