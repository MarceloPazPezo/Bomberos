import { useState, useCallback } from 'react';
import { direccionService } from '@services/direccion.service.js';

export const useDireccion = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Crea una nueva dirección
   */
  const createDireccion = useCallback(async (direccionData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await direccionService.createDireccion(direccionData);
      if (response.status === 'Success') {
        return [response.data, null];
      } else {
        return [null, response.message || 'Error al crear dirección'];
      }
    } catch (error) {
      console.error('Error al crear dirección:', error);
      const errorMessage = error.response?.data?.message || 'Error al crear dirección';
      return [null, errorMessage];
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Obtiene una dirección por ID
   */
  const getDireccionById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await direccionService.getDireccionById(id);
      if (response.status === 'Success') {
        return [response.data, null];
      } else {
        return [null, response.message || 'Error al obtener dirección'];
      }
    } catch (error) {
      console.error('Error al obtener dirección:', error);
      const errorMessage = error.response?.data?.message || 'Error al obtener dirección';
      return [null, errorMessage];
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Actualiza una dirección
   */
  const updateDireccion = useCallback(async (id, direccionData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await direccionService.updateDireccion(id, direccionData);
      if (response.status === 'Success') {
        return [response.data, null];
      } else {
        return [null, response.message || 'Error al actualizar dirección'];
      }
    } catch (error) {
      console.error('Error al actualizar dirección:', error);
      const errorMessage = error.response?.data?.message || 'Error al actualizar dirección';
      return [null, errorMessage];
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Elimina una dirección
   */
  const deleteDireccion = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await direccionService.deleteDireccion(id);
      if (response.status === 'Success') {
        return [true, null];
      } else {
        return [null, response.message || 'Error al eliminar dirección'];
      }
    } catch (error) {
      console.error('Error al eliminar dirección:', error);
      const errorMessage = error.response?.data?.message || 'Error al eliminar dirección';
      return [null, errorMessage];
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Busca direcciones por criterios
   */
  const searchDirecciones = useCallback(async (criterios) => {
    setLoading(true);
    setError(null);
    try {
      const response = await direccionService.searchDirecciones(criterios);
      if (response.status === 'Success') {
        return [response.data, null];
      } else {
        return [null, response.message || 'Error al buscar direcciones'];
      }
    } catch (error) {
      console.error('Error al buscar direcciones:', error);
      const errorMessage = error.response?.data?.message || 'Error al buscar direcciones';
      return [null, errorMessage];
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    createDireccion,
    getDireccionById,
    updateDireccion,
    deleteDireccion,
    searchDirecciones,
    clearError: () => setError(null)
  };
};
