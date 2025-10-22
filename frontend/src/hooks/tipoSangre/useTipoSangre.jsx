import { useState, useCallback, useRef } from 'react';
import { tipoSangreService } from '@services/tipoSangre.service.js';
import { showErrorAlert } from '@helpers/fireAlert.js';

export const useTipoSangre = () => {
  const [tiposSangre, setTiposSangre] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Usar useRef para variables que no necesitan causar re-renders
  const lastFetchTimeRef = useRef(0);
  const loadingRef = useRef(false);

  // Función para obtener todos los tipos de sangre
  const fetchTiposSangre = useCallback(async (force = false) => {
    // Evitar múltiples llamadas en un corto período de tiempo
    const now = Date.now();
    if (!force && loadingRef.current) {
      return;
    }
    if (!force && now - lastFetchTimeRef.current < 2000) {
      return;
    }

    // Prevenir bucles infinitos
    if (loadingRef.current) {
      return;
    }

    try {
      setLoading(true);
      loadingRef.current = true;
      setError(null);
      const response = await tipoSangreService.getTiposSangre();

      // Manejar tanto array directo como respuesta con status
      if (Array.isArray(response)) {
        // Array directo
        setTiposSangre(response);
      } else if (response.status === 'Success') {
        // Respuesta con status
        const responseData = response.data || [];
        setTiposSangre(Array.isArray(responseData) ? responseData : []);
      } else if (response.status === 'Error') {
        console.error('Error en la respuesta:', response.message);
        setError(response.message || 'Error al cargar tipos de sangre');
      } else {
        console.error('Respuesta inesperada:', response);
        setError('Error al cargar tipos de sangre');
      }
      lastFetchTimeRef.current = now;
    } catch (error) {
      console.error('Error fetching tipos de sangre:', error);
      setError('Error al conectar con el servidor');
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, []); // Sin dependencias para evitar bucles infinitos

  // Función para obtener un tipo de sangre por ID
  const getTipoSangreById = useCallback(async (id) => {
    try {
      const response = await tipoSangreService.getTipoSangreById(id);
      
      if (response.status === 'Success') {
        return response.data;
      } else if (response.status === 'Error') {
        showErrorAlert('Error', response.message || 'Error al obtener tipo de sangre');
        return null;
      } else {
        // Si es array directo
        return Array.isArray(response) ? response[0] : response;
      }
    } catch (error) {
      console.error('Error al obtener tipo de sangre:', error);
      showErrorAlert('Error', 'Error al conectar con el servidor');
      return null;
    }
  }, []);

  return {
    tiposSangre,
    loading,
    error,
    fetchTiposSangre,
    getTipoSangreById
  };
};
