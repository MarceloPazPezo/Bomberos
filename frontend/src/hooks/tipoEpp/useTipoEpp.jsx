import { useState, useCallback, useRef, useEffect } from 'react';
import { fetchTiposEpp, createTipoEpp, updateTipoEpp, deleteTipoEpp } from '@services/tipoEpp.service';
import { 
  tipoEppCreatedToast,
  tipoEppUpdatedToast,
  tipoEppDeletedToast
} from '@helpers/toastHelper.jsx';
import { 
  showErrorAlert,
  showConflictAlert,
  showSecurityAlert,
  showInfoAlert 
} from '@helpers/fireAlert.js';
import { toStartCase } from '@helpers/textFormatters.js';

/**
 * Hook para gestionar tipos de EPP
 */
export const useTipoEpp = () => {
  const [tiposEpp, setTiposEpp] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);
  
  // Usar useRef para variables que no necesitan causar re-renders
  const lastFetchTimeRef = useRef(0);
  const loadingRef = useRef(false);

  /**
   * Obtener todos los tipos de EPP con paginación
   */
  const fetchTiposEppHook = useCallback(async (params = {}, force = false) => {
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
      const response = await fetchTiposEpp(params);
      
      // Manejar diferentes formatos de respuesta
      let tiposEppData;
      if (Array.isArray(response)) {
        tiposEppData = response;
      } else if (response?.status === 'Success') {
        tiposEppData = response.data || response.tiposEpp || [];
      } else if (response?.tiposEpp) {
        tiposEppData = response.tiposEpp;
      } else if (response?.data) {
        tiposEppData = response.data;
      } else {
        tiposEppData = [];
      }
      
      setTiposEpp(Array.isArray(tiposEppData) ? tiposEppData : []);
      lastFetchTimeRef.current = now;
    } catch (error) {
      console.error('Error fetching tipos EPP:', error);
      setError('Error al conectar con el servidor');
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, []);

  /**
   * Crear un nuevo tipo de EPP
   */
  const createTipoEppHook = useCallback(async (data) => {
    try {
      const response = await createTipoEpp(data);
      
      if (response) {
        tipoEppCreatedToast(toStartCase(response.nombre || data.nombre));
        return { success: true, data: response };
      } else {
        showErrorAlert('Error al Crear Tipo de EPP', 'No se pudo crear el tipo de EPP');
        return { success: false, error: 'Error al crear el tipo de EPP' };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.response?.data?.details || error.message || 'Error al crear el tipo de EPP';
      showErrorAlert('Error del Sistema', errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  /**
   * Actualizar un tipo de EPP
   */
  const updateTipoEppHook = useCallback(async (id, data) => {
    try {
      const response = await updateTipoEpp(id, data);
      
      if (response) {
        tipoEppUpdatedToast(toStartCase(response.nombre || data.nombre));
        await fetchTiposEppHook({}, true); // Recargar la lista
        return { success: true, data: response };
      } else {
        showErrorAlert('Error al Actualizar Tipo de EPP', 'No se pudo actualizar el tipo de EPP');
        return { success: false, error: 'Error al actualizar el tipo de EPP' };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.response?.data?.details || error.message || 'Error al actualizar el tipo de EPP';
      showErrorAlert('Error del Sistema', errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [fetchTiposEppHook]);

  /**
   * Eliminar un tipo de EPP
   */
  const deleteTipoEppHook = useCallback(async (id) => {
    try {      
      // Verificar que el tipo de EPP aún existe en la lista local
      const tipoEppExists = tiposEpp.find(tipo => tipo.id === id);
      if (!tipoEppExists) {
        showErrorAlert('Tipo de EPP No Encontrado', 'El tipo de EPP no existe o ya fue eliminado de la lista');
        return { success: false, error: 'Tipo de EPP no encontrado en la lista' };
      }
      
      await deleteTipoEpp(id);
      tipoEppDeletedToast(toStartCase(tipoEppExists.nombre));
      await fetchTiposEppHook({}, true);
      return { success: true };
    } catch (error) {
      // Mensaje de error más específico según el código de estado
      if (error.response?.status === 404) {
        showInfoAlert('Tipo de EPP No Encontrado', 'El tipo de EPP no existe o ya fue eliminado. La lista se actualizará automáticamente.');
        await fetchTiposEppHook({}, true);
        return { success: false, error: 'Tipo de EPP no encontrado' };
      } else if (error.response?.status === 403) {
        showSecurityAlert('Acceso Denegado', 'No tienes los permisos necesarios para eliminar este tipo de EPP. Contacta con tu administrador.');
        return { success: false, error: 'Acceso denegado' };
      } else if (error.response?.status === 409) {
        // Error de conflicto - tipo de EPP asociado a EPPs
        const backendMessage = error.response?.data?.details || error.response?.data?.message || '';
        
        showConflictAlert(
          'Operación Bloqueada',
          backendMessage || 'No se puede eliminar este tipo de EPP porque está siendo utilizado por el sistema'
        );
        return { success: false, error: backendMessage };
      } else {
        const errorMessage = error.response?.data?.message || error.response?.data?.details || error.message || 'Error al eliminar el tipo de EPP';
        showErrorAlert('Error del Sistema', errorMessage);
        return { success: false, error: errorMessage };
      }
    }
  }, [fetchTiposEppHook, tiposEpp]);

  /**
   * Obtener un tipo de EPP por ID
   */
  const getTipoEppById = useCallback((id) => {
    return tiposEpp.find(tipo => tipo.id === parseInt(id));
  }, [tiposEpp]);

  /**
   * Cargar tipos de EPP al montar el componente
   */
  useEffect(() => {
    fetchTiposEppHook();
  }, [fetchTiposEppHook]);

  return {
    // Estado
    tiposEpp,
    loading,
    error,
    pagination,
    
    // Acciones
    fetchTiposEpp: fetchTiposEppHook,
    createTipoEpp: createTipoEppHook,
    updateTipoEpp: updateTipoEppHook,
    deleteTipoEpp: deleteTipoEppHook,
    getTipoEppById,
    
    // Utilidades
    clearError: () => setError(null)
  };
};

