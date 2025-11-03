import { useState, useCallback, useRef, useEffect } from 'react';
import { fetchEstadosEpp, createEstadoEpp, updateEstadoEpp, deleteEstadoEpp } from '@services/estadoEpp.service';
import { 
  estadoEppCreatedToast,
  estadoEppUpdatedToast,
  estadoEppDeletedToast
} from '@helpers/toastHelper.jsx';
import { 
  showErrorAlert,
  showConflictAlert,
  showSecurityAlert,
  showInfoAlert 
} from '@helpers/fireAlert.js';
import { toStartCase } from '@helpers/textFormatters.js';

/**
 * Hook para gestionar estados de EPP
 */
export const useEstadoEpp = () => {
  const [estadosEpp, setEstadosEpp] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);
  
  // Usar useRef para variables que no necesitan causar re-renders
  const lastFetchTimeRef = useRef(0);
  const loadingRef = useRef(false);

  /**
   * Obtener todos los estados de EPP con paginación
   */
  const fetchEstadosEppHook = useCallback(async (params = {}, force = false) => {
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
      const response = await fetchEstadosEpp(params);
      
      // Manejar diferentes formatos de respuesta
      let estadosEppData;
      if (Array.isArray(response)) {
        estadosEppData = response;
      } else if (response?.status === 'Success') {
        estadosEppData = response.data || response.estadosEpp || [];
      } else if (response?.estadosEpp) {
        estadosEppData = response.estadosEpp;
      } else if (response?.data) {
        estadosEppData = response.data;
      } else {
        estadosEppData = [];
      }
      
      setEstadosEpp(Array.isArray(estadosEppData) ? estadosEppData : []);
      lastFetchTimeRef.current = now;
    } catch (error) {
      console.error('Error fetching estados EPP:', error);
      setError('Error al conectar con el servidor');
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, []);

  /**
   * Crear un nuevo estado de EPP
   */
  const createEstadoEppHook = useCallback(async (data) => {
    try {
      const response = await createEstadoEpp(data);
      
      if (response) {
        estadoEppCreatedToast(toStartCase(response.nombre || data.nombre));
        return { success: true, data: response };
      } else {
        showErrorAlert('Error al Crear Estado de EPP', 'No se pudo crear el estado de EPP');
        return { success: false, error: 'Error al crear el estado de EPP' };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.response?.data?.details || error.message || 'Error al crear el estado de EPP';
      showErrorAlert('Error del Sistema', errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  /**
   * Actualizar un estado de EPP
   */
  const updateEstadoEppHook = useCallback(async (id, data) => {
    try {
      const response = await updateEstadoEpp(id, data);
      
      if (response) {
        estadoEppUpdatedToast(toStartCase(response.nombre || data.nombre));
        await fetchEstadosEppHook({}, true); // Recargar la lista
        return { success: true, data: response };
      } else {
        showErrorAlert('Error al Actualizar Estado de EPP', 'No se pudo actualizar el estado de EPP');
        return { success: false, error: 'Error al actualizar el estado de EPP' };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.response?.data?.details || error.message || 'Error al actualizar el estado de EPP';
      showErrorAlert('Error del Sistema', errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [fetchEstadosEppHook]);

  /**
   * Eliminar un estado de EPP
   */
  const deleteEstadoEppHook = useCallback(async (id) => {
    try {      
      // Verificar que el estado de EPP aún existe en la lista local
      const estadoEppExists = estadosEpp.find(estado => estado.id === id);
      if (!estadoEppExists) {
        showErrorAlert('Estado de EPP No Encontrado', 'El estado de EPP no existe o ya fue eliminado de la lista');
        return { success: false, error: 'Estado de EPP no encontrado en la lista' };
      }
      
      await deleteEstadoEpp(id);
      estadoEppDeletedToast(toStartCase(estadoEppExists.nombre));
      await fetchEstadosEppHook({}, true);
      return { success: true };
    } catch (error) {
      // Mensaje de error más específico según el código de estado
      if (error.response?.status === 404) {
        showInfoAlert('Estado de EPP No Encontrado', 'El estado de EPP no existe o ya fue eliminado. La lista se actualizará automáticamente.');
        await fetchEstadosEppHook({}, true);
        return { success: false, error: 'Estado de EPP no encontrado' };
      } else if (error.response?.status === 403) {
        showSecurityAlert('Acceso Denegado', 'No tienes los permisos necesarios para eliminar este estado de EPP. Contacta con tu administrador.');
        return { success: false, error: 'Acceso denegado' };
      } else if (error.response?.status === 409) {
        // Error de conflicto - estado de EPP asociado a EPPs
        const backendMessage = error.response?.data?.details || error.response?.data?.message || '';
        
        showConflictAlert(
          'Operación Bloqueada',
          backendMessage || 'No se puede eliminar este estado de EPP porque está siendo utilizado por el sistema'
        );
        return { success: false, error: backendMessage };
      } else {
        const errorMessage = error.response?.data?.message || error.response?.data?.details || error.message || 'Error al eliminar el estado de EPP';
        showErrorAlert('Error del Sistema', errorMessage);
        return { success: false, error: errorMessage };
      }
    }
  }, [fetchEstadosEppHook, estadosEpp]);

  /**
   * Obtener un estado de EPP por ID
   */
  const getEstadoEppById = useCallback((id) => {
    return estadosEpp.find(estado => estado.id === parseInt(id));
  }, [estadosEpp]);

  /**
   * Cargar estados de EPP al montar el componente
   */
  useEffect(() => {
    fetchEstadosEppHook();
  }, [fetchEstadosEppHook]);

  return {
    // Estado
    estadosEpp,
    loading,
    error,
    pagination,
    
    // Acciones
    fetchEstadosEpp: fetchEstadosEppHook,
    createEstadoEpp: createEstadoEppHook,
    updateEstadoEpp: updateEstadoEppHook,
    deleteEstadoEpp: deleteEstadoEppHook,
    getEstadoEppById,
    
    // Utilidades
    clearError: () => setError(null)
  };
};

