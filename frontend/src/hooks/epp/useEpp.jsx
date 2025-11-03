import { useState, useEffect, useCallback, useRef } from 'react';
import eppService from '@services/epp.service.js';
import { showErrorAlert, showConflictAlert } from '@helpers/fireAlert.js';
import { 
  eppCreatedToast, 
  eppUpdatedToast, 
  eppDeletedToast,
  eppAssignedToast,
  eppUnassignedToast
} from '@helpers/toastHelper.jsx';

/**
 * Hook personalizado para gestión de EPP (Equipos de Protección Personal)
 */
export const useEpp = () => {
  const [epps, setEpps] = useState([]);
  const [tiposEpp, setTiposEpp] = useState([]);
  const [estadosEpp, setEstadosEpp] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const lastFetchTimeRef = useRef(0);
  const loadingRef = useRef(false);

  /**
   * Obtiene todos los EPP con filtros
   */
  const fetchEpps = useCallback(async (params = {}, force = false) => {
    const now = Date.now();
    
    if (!force && loadingRef.current) return;
    if (!force && now - lastFetchTimeRef.current < 2000) return;

    try {
      setLoading(true);
      loadingRef.current = true;
      setError(null);
      
      const response = await eppService.getEpp(params);
      
      // Manejar diferentes formatos de respuesta
      let eppsData;
      if (response?.data?.epps) {
        // Formato con paginación: { data: { epps: [...], pagination: {...} } }
        eppsData = response.data.epps;
      } else if (Array.isArray(response?.data)) {
        // Formato array directo
        eppsData = response.data;
      } else if (Array.isArray(response)) {
        // Respuesta es un array directamente
        eppsData = response;
      } else {
        eppsData = [];
      }
      
      setEpps(Array.isArray(eppsData) ? eppsData : []);
      lastFetchTimeRef.current = now;
    } catch (error) {
      console.error('[USE_EPP] Error obteniendo EPP:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Error al obtener EPP';
      setError(errorMessage);
      setEpps([]);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, []);

  /**
   * Obtiene tipos de EPP
   */
  const fetchTiposEpp = useCallback(async (force = false) => {
    try {
      const response = await eppService.getTiposEpp();
      // Manejar diferentes formatos de respuesta
      let tiposData;
      if (response?.data) {
        tiposData = Array.isArray(response.data) ? response.data : (response.data?.tipos || []);
      } else if (Array.isArray(response)) {
        tiposData = response;
      } else {
        tiposData = [];
      }
      setTiposEpp(Array.isArray(tiposData) ? tiposData : []);
    } catch (error) {
      console.error('[USE_EPP] Error obteniendo tipos de EPP:', error);
      setTiposEpp([]);
    }
  }, []);

  /**
   * Obtiene estados de EPP
   */
  const fetchEstadosEpp = useCallback(async (force = false) => {
    try {
      const response = await eppService.getEstadosEpp();
      // Manejar diferentes formatos de respuesta
      let estadosData;
      if (response?.data) {
        estadosData = Array.isArray(response.data) ? response.data : (response.data?.estados || []);
      } else if (Array.isArray(response)) {
        estadosData = response;
      } else {
        estadosData = [];
      }
      setEstadosEpp(Array.isArray(estadosData) ? estadosData : []);
    } catch (error) {
      console.error('[USE_EPP] Error obteniendo estados de EPP:', error);
      setEstadosEpp([]);
    }
  }, []);

  /**
   * Crea un nuevo EPP
   */
  const createEpp = useCallback(async (eppData) => {
    try {
      setLoading(true);
      const response = await eppService.createEpp(eppData);
      const newEpp = response?.data || response;
      
      if (newEpp) {
        eppCreatedToast(newEpp.nombre || 'EPP');
        setEpps(prev => [newEpp, ...prev]);
        return newEpp;
      }
    } catch (error) {
      console.error('[USE_EPP] Error creando EPP:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.details || error.message || 'Error al crear EPP';
      
      if (error.response?.status === 409) {
        showConflictAlert('Error al crear EPP', errorMessage);
      } else {
        showErrorAlert('Error al crear EPP', errorMessage);
      }
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Actualiza un EPP existente
   */
  const updateEpp = useCallback(async (id, eppData) => {
    try {
      setLoading(true);
      const response = await eppService.updateEpp(id, eppData);
      const updatedEpp = response?.data || response;
      
      if (updatedEpp) {
        eppUpdatedToast(updatedEpp.nombre || 'EPP');
        setEpps(prev => prev.map(epp => epp.id === id ? updatedEpp : epp));
        return updatedEpp;
      }
    } catch (error) {
      console.error('[USE_EPP] Error actualizando EPP:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.details || error.message || 'Error al actualizar EPP';
      
      if (error.response?.status === 404) {
        showErrorAlert('EPP no encontrado', errorMessage);
      } else {
        showErrorAlert('Error al actualizar EPP', errorMessage);
      }
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Elimina un EPP
   */
  const deleteEpp = useCallback(async (id) => {
    try {
      setLoading(true);
      await eppService.deleteEpp(id);
      
      const deletedEpp = epps.find(epp => epp.id === id);
      eppDeletedToast(deletedEpp?.nombre || 'EPP');
      setEpps(prev => prev.filter(epp => epp.id !== id));
    } catch (error) {
      console.error('[USE_EPP] Error eliminando EPP:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.details || error.message || 'Error al eliminar EPP';
      
      if (error.response?.status === 404) {
        showErrorAlert('EPP no encontrado', errorMessage);
      } else if (error.response?.status === 400 || error.response?.status === 409) {
        showConflictAlert('No se puede eliminar', errorMessage);
      } else {
        showErrorAlert('Error al eliminar EPP', errorMessage);
      }
      throw error;
    } finally {
      setLoading(false);
    }
  }, [epps]);

  /**
   * Asigna un EPP a un bombero
   */
  const assignEpp = useCallback(async (eppId, fichaBomberoId) => {
    try {
      setLoading(true);
      const response = await eppService.assignEppToBombero(eppId, fichaBomberoId);
      
      eppAssignedToast();
      // Recargar EPP para obtener datos actualizados
      await fetchEpps({}, true);
      return response?.data || response;
    } catch (error) {
      console.error('[USE_EPP] Error asignando EPP:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.details || error.message || 'Error al asignar EPP';
      
      showErrorAlert('Error al asignar EPP', errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [fetchEpps]);

  /**
   * Desasigna un EPP de un bombero
   */
  const unassignEpp = useCallback(async (eppId) => {
    try {
      setLoading(true);
      await eppService.unassignEppFromBombero(eppId);
      
      eppUnassignedToast();
      // Recargar EPP para obtener datos actualizados
      await fetchEpps({}, true);
    } catch (error) {
      console.error('[USE_EPP] Error desasignando EPP:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.details || error.message || 'Error al desasignar EPP';
      
      showErrorAlert('Error al desasignar EPP', errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [fetchEpps]);

  // Cargar tipos y estados al montar
  useEffect(() => {
    fetchTiposEpp();
    fetchEstadosEpp();
  }, [fetchTiposEpp, fetchEstadosEpp]);

  return {
    epps,
    tiposEpp,
    estadosEpp,
    loading,
    error,
    fetchEpps,
    fetchTiposEpp,
    fetchEstadosEpp,
    createEpp,
    updateEpp,
    deleteEpp,
    assignEpp,
    unassignEpp
  };
};

