import { useState, useEffect } from 'react';
import * as companiaService from '@services/compania.service.js';

/**
 * Hook para gestión general de compañías
 */
export const useCompania = () => {
  const [companias, setCompanias] = useState([]);
  const [compania, setCompania] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);

  // Obtener todas las compañías
  const fetchCompanias = async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await companiaService.getCompanias(params);
      
      if (response.status === 'Client error') {
        throw new Error(response.message);
      }
      
      setCompanias(response.data?.companias || []);
      setPagination(response.data?.pagination || null);
    } catch (err) {
      console.error('Error al obtener compañías:', err);
      setError(err.response?.data?.message || err.message || 'Error al obtener las compañías');
      setCompanias([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  };

  // Obtener compañía por ID
  const fetchCompaniaById = async (id) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await companiaService.getCompaniaById(id);
      
      if (response.status === 'Client error') {
        throw new Error(response.message);
      }
      
      setCompania(response.data);
    } catch (err) {
      console.error('Error al obtener compañía:', err);
      setError(err.response?.data?.message || err.message || 'Error al obtener la compañía');
      setCompania(null);
    } finally {
      setLoading(false);
    }
  };

  // Obtener compañía del bombero
  const fetchCompaniaBombero = async (idBombero) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await companiaService.getCompaniaBombero(idBombero);
      
      if (response.status === 'Client error') {
        throw new Error(response.message);
      }
      
      setCompania(response.data);
      return { data: response.data, error: null };
    } catch (err) {
      console.error('Error al obtener compañía del bombero:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Error al obtener la información de la compañía';
      setError(errorMessage);
      setCompania(null);
      return { data: null, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Crear nueva compañía
  const createCompania = async (companiaData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await companiaService.createCompania(companiaData);
      
      if (response.status === 'Client error') {
        throw new Error(response.message);
      }
      
      return { success: true, data: response.data };
    } catch (err) {
      console.error('Error al crear compañía:', err);
      const errorMessage = err.response?.data?.details || err.response?.data?.message || err.message || 'Error al crear la compañía';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Actualizar compañía
  const updateCompania = async (id, companiaData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await companiaService.updateCompania(id, companiaData);
      
      if (response.status === 'Client error') {
        throw new Error(response.message);
      }
      
      // Actualizar la compañía en el estado local si está cargada
      if (compania && compania.id === id) {
        setCompania(response.data);
      }
      
      return { success: true, data: response.data };
    } catch (err) {
      console.error('Error al actualizar compañía:', err);
      const errorMessage = err.response?.data?.details || err.response?.data?.message || err.message || 'Error al actualizar la compañía';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Eliminar compañía
  const deleteCompania = async (id) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await companiaService.deleteCompania(id);
      
      if (response.status === 'Client error') {
        throw new Error(response.message);
      }
      
      // Remover la compañía del estado local
      setCompanias(prev => prev.filter(c => c.id !== id));
      
      return { success: true, data: response.data };
    } catch (err) {
      console.error('Error al eliminar compañía:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Error al eliminar la compañía';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return {
    // Estados
    companias,
    compania,
    loading,
    error,
    pagination,
    
    // Métodos
    fetchCompanias,
    fetchCompaniaById,
    fetchCompaniaBombero,
    createCompania,
    updateCompania,
    deleteCompania,
    
    // Utilidades
    setError: (err) => setError(err),
    clearError: () => setError(null),
    setCompania: (comp) => setCompania(comp),
  };
};
