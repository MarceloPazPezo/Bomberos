import { useState, useCallback, useRef } from 'react';
import { carroService } from '@services/carro.service.js';

/**
 * Hook personalizado para gestionar el estado y operaciones de carros
 */
export const useCarro = () => {
  const [carros, setCarros] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Referencias para controlar llamadas concurrentes
  const loadingRef = useRef(false);
  const lastFetchTimeRef = useRef(0);

  /**
   * Obtener todos los carros
   */
  const fetchCarros = useCallback(async (params = {}, force = false) => {
    const now = Date.now();
    
    // Evitar múltiples llamadas si ya está cargando (solo si no es forzado)
    if (!force && loadingRef.current) {
      return;
    }
    
    // Evitar recargas muy frecuentes (solo si no es forzado)
    if (!force && now - lastFetchTimeRef.current < 2000) {
      return;
    }

    try {
      setLoading(true);
      loadingRef.current = true;
      setError(null);
      const response = await carroService.getAll(params);
      
      if (response.status === 'Success') {
        const responseData = response.data || {};
        
        // Ahora siempre recibimos un array directo
        setCarros(Array.isArray(responseData) ? responseData : []);
      } else if (response.status === 'Error') {
        setError(response.message || 'Error al cargar carros');
      } else {
        // Respuesta inesperada del servidor
        setError('Error al cargar carros');
      }
      lastFetchTimeRef.current = now;
    } catch (error) {
      console.error('Error en fetchCarros:', error);
      setError('Error al conectar con el servidor');
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, []);

  /**
   * Crear un nuevo carro
   */
  const createCarro = useCallback(async (data) => {
    try {
      setLoading(true);
      setError(null);
      const response = await carroService.create(data);
      
      if (response.status === 'Success') {
        // Recargar la lista de carros después de crear uno nuevo
        await fetchCarros({}, true);
        return { success: true, data: response.data };
      } else {
        return { success: false, message: response.message || 'Error al crear carro' };
      }
    } catch (error) {
      console.error('Error en createCarro:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Error al crear carro' 
      };
    } finally {
      setLoading(false);
    }
  }, [fetchCarros]);

  /**
   * Actualizar un carro existente
   */
  const updateCarro = useCallback(async (id, data) => {
    try {
      setLoading(true);
      setError(null);
      const response = await carroService.update(id, data);
      
      if (response.status === 'Success') {
        // Recargar la lista de carros después de actualizar
        await fetchCarros({}, true);
        return { success: true, data: response.data };
      } else {
        return { success: false, message: response.message || 'Error al actualizar carro' };
      }
    } catch (error) {
      console.error('Error en updateCarro:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Error al actualizar carro' 
      };
    } finally {
      setLoading(false);
    }
  }, [fetchCarros]);

  /**
   * Eliminar un carro
   */
  const deleteCarro = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      const response = await carroService.delete(id);
      
      if (response.status === 'Success') {
        // Recargar la lista de carros después de eliminar
        await fetchCarros({}, true);
        return { success: true, data: response.data };
      } else {
        return { success: false, message: response.message || 'Error al eliminar carro' };
      }
    } catch (error) {
      console.error('Error en deleteCarro:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Error al eliminar carro' 
      };
    } finally {
      setLoading(false);
    }
  }, [fetchCarros]);

  /**
   * Limpiar errores
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // Estado
    carros,
    loading,
    error,
    
    // Acciones
    fetchCarros,
    createCarro,
    updateCarro,
    deleteCarro,
    clearError
  };
};
