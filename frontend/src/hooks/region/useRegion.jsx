import { useState, useEffect, useCallback } from 'react';
import { regionService } from '@services/region.service.js';

export const useRegion = () => {
  const [regiones, setRegiones] = useState([]);
  const [comunas, setComunas] = useState([]);
  const [loadingRegiones, setLoadingRegiones] = useState(false);
  const [loadingComunas, setLoadingComunas] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Carga todas las regiones
   */
  const fetchRegiones = useCallback(async () => {
    setLoadingRegiones(true);
    setError(null);
    try {
      const response = await regionService.getAllRegiones();
      if (response.status === 'Success') {
        setRegiones(response.data);
      } else {
        setError(response.message || 'Error al cargar regiones');
      }
    } catch (error) {
      console.error('Error al cargar regiones:', error);
      setError('Error al cargar regiones');
    } finally {
      setLoadingRegiones(false);
    }
  }, []);

  /**
   * Carga comunas por región
   */
  const fetchComunasByRegion = useCallback(async (idRegion) => {
    if (!idRegion) {
      setComunas([]);
      return;
    }

    setLoadingComunas(true);
    setError(null);
    try {
      const response = await regionService.getComunasByRegion(idRegion);
      
      if (response.status === 'Success') {
        setComunas(response.data);
      } else {
        setError(response.message || 'Error al cargar comunas');
        setComunas([]);
      }
    } catch (error) {
      console.error('Error al cargar comunas:', error);
      setError('Error al cargar comunas');
      setComunas([]);
    } finally {
      setLoadingComunas(false);
    }
  }, []);

  /**
   * Carga todas las comunas
   */
  const fetchAllComunas = useCallback(async () => {
    setLoadingComunas(true);
    setError(null);
    try {
      const response = await regionService.getAllComunas();
      if (response.status === 'Success') {
        setComunas(response.data);
      } else {
        setError(response.message || 'Error al cargar comunas');
      }
    } catch (error) {
      console.error('Error al cargar comunas:', error);
      setError('Error al cargar comunas');
    } finally {
      setLoadingComunas(false);
    }
  }, []);

  // Cargar regiones al montar el componente
  useEffect(() => {
    fetchRegiones();
  }, [fetchRegiones]);

  return {
    regiones,
    comunas,
    loading: loadingRegiones || loadingComunas, // Loading general para compatibilidad
    loadingRegiones,
    loadingComunas,
    error,
    fetchRegiones,
    fetchComunasByRegion,
    fetchAllComunas,
    clearError: () => setError(null)
  };
};
