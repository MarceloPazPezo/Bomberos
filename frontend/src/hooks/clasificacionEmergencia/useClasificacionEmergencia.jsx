import { useState, useCallback, useRef, useEffect } from 'react';
import { fetchClasificacionesEmergencia, createClasificacionEmergencia, updateClasificacionEmergencia, deleteClasificacionEmergencia } from '@services/clasificacionEmergencia.service';
import { 
  clasificacionEmergenciaCreatedToast,
  clasificacionEmergenciaUpdatedToast,
  clasificacionEmergenciaDeletedToast
} from '@helpers/toastHelper.jsx';
import { 
  showErrorAlert,
  showConflictAlert,
  showSecurityAlert,
  showInfoAlert 
} from '@helpers/fireAlert.js';

/**
 * Hook para gestionar clasificaciones de emergencia
 */
export const useClasificacionEmergencia = () => {
  const [clasificacionesEmergencia, setClasificacionesEmergencia] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);
  
  // Usar useRef para variables que no necesitan causar re-renders
  const lastFetchTimeRef = useRef(0);
  const loadingRef = useRef(false);

  /**
   * Obtener todas las clasificaciones de emergencia con paginación
   */
  const fetchClasificacionesEmergenciaHook = useCallback(async (params = {}, force = false) => {
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
      const response = await fetchClasificacionesEmergencia(params);
      
      // Manejar diferentes formatos de respuesta
      let clasificacionesData;
      if (Array.isArray(response)) {
        clasificacionesData = response;
      } else if (response?.status === 'Success') {
        clasificacionesData = response.data || response.clasificacionesEmergencia || [];
      } else if (response?.clasificacionesEmergencia) {
        clasificacionesData = response.clasificacionesEmergencia;
      } else if (response?.data) {
        clasificacionesData = response.data;
      } else {
        clasificacionesData = [];
      }
      
      setClasificacionesEmergencia(Array.isArray(clasificacionesData) ? clasificacionesData : []);
      lastFetchTimeRef.current = now;
    } catch (error) {
      console.error('Error fetching clasificaciones emergencia:', error);
      if (error.response?.status === 403) {
        setClasificacionesEmergencia([]);
        setError('No tienes permisos para ver clasificaciones de emergencia');
      } else {
        setError('Error al conectar con el servidor');
        setClasificacionesEmergencia([]);
      }
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, []);

  /**
   * Crear una nueva clasificación de emergencia
   */
  const createClasificacionEmergenciaHook = useCallback(async (data) => {
    try {
      const response = await createClasificacionEmergencia(data);
      
      if (response) {
        clasificacionEmergenciaCreatedToast(response.nombre || 'Clasificación de emergencia');
        return { success: true, data: response };
      } else {
        showErrorAlert('Error al Crear Clasificación de Emergencia', 'No se pudo crear la clasificación de emergencia');
        return { success: false, error: 'Error al crear la clasificación de emergencia' };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.response?.data?.details || error.message || 'Error al crear la clasificación de emergencia';
      showErrorAlert('Error del Sistema', errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  /**
   * Actualizar una clasificación de emergencia
   */
  const updateClasificacionEmergenciaHook = useCallback(async (id, data) => {
    try {
      const response = await updateClasificacionEmergencia(id, data);
      
      if (response) {
        clasificacionEmergenciaUpdatedToast(response.nombre || 'Clasificación de emergencia');
        await fetchClasificacionesEmergenciaHook({}, true); // Recargar la lista
        return { success: true, data: response };
      } else {
        showErrorAlert('Error al Actualizar Clasificación de Emergencia', 'No se pudo actualizar la clasificación de emergencia');
        return { success: false, error: 'Error al actualizar la clasificación de emergencia' };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.response?.data?.details || error.message || 'Error al actualizar la clasificación de emergencia';
      showErrorAlert('Error del Sistema', errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [fetchClasificacionesEmergenciaHook]);

  /**
   * Eliminar una clasificación de emergencia
   */
  const deleteClasificacionEmergenciaHook = useCallback(async (id) => {
    try {      
      // Verificar que la clasificación aún existe en la lista local
      const clasificacionExists = clasificacionesEmergencia.find(clasificacion => clasificacion.id === id);
      if (!clasificacionExists) {
        showErrorAlert('Clasificación de Emergencia No Encontrada', 'La clasificación de emergencia no existe o ya fue eliminada de la lista');
        return { success: false, error: 'Clasificación de emergencia no encontrada en la lista' };
      }
      
      await deleteClasificacionEmergencia(id);
      clasificacionEmergenciaDeletedToast(clasificacionExists.nombre || 'Clasificación de emergencia');
      await fetchClasificacionesEmergenciaHook({}, true);
      return { success: true };
    } catch (error) {
      // Mensaje de error más específico según el código de estado
      if (error.response?.status === 404) {
        showInfoAlert('Clasificación de Emergencia No Encontrada', 'La clasificación de emergencia no existe o ya fue eliminada. La lista se actualizará automáticamente.');
        await fetchClasificacionesEmergenciaHook({}, true);
        return { success: false, error: 'Clasificación de emergencia no encontrada' };
      } else if (error.response?.status === 403) {
        showSecurityAlert('Acceso Denegado', 'No tienes los permisos necesarios para eliminar esta clasificación de emergencia. Contacta con tu administrador.');
        return { success: false, error: 'Acceso denegado' };
      } else if (error.response?.status === 409) {
        // Error de conflicto - clasificación asociada a subtipos
        const backendMessage = error.response?.data?.details || error.response?.data?.message || '';
        
        showConflictAlert(
          'Operación Bloqueada',
          backendMessage || 'No se puede eliminar esta clasificación de emergencia porque está siendo utilizada por el sistema'
        );
        return { success: false, error: backendMessage };
      } else {
        const errorMessage = error.response?.data?.message || error.response?.data?.details || error.message || 'Error al eliminar la clasificación de emergencia';
        showErrorAlert('Error del Sistema', errorMessage);
        return { success: false, error: errorMessage };
      }
    }
  }, [fetchClasificacionesEmergenciaHook, clasificacionesEmergencia]);

  /**
   * Obtener una clasificación de emergencia por ID
   */
  const getClasificacionEmergenciaById = useCallback((id) => {
    return clasificacionesEmergencia.find(clasificacion => clasificacion.id === parseInt(id));
  }, [clasificacionesEmergencia]);

  /**
   * Cargar clasificaciones de emergencia al montar el componente
   */
  useEffect(() => {
    fetchClasificacionesEmergenciaHook();
  }, [fetchClasificacionesEmergenciaHook]);

  return {
    // Estado
    clasificacionesEmergencia,
    loading,
    error,
    pagination,
    
    // Acciones
    fetchClasificacionesEmergencia: fetchClasificacionesEmergenciaHook,
    createClasificacionEmergencia: createClasificacionEmergenciaHook,
    updateClasificacionEmergencia: updateClasificacionEmergenciaHook,
    deleteClasificacionEmergencia: deleteClasificacionEmergenciaHook,
    getClasificacionEmergenciaById,
    
    // Utilidades
    clearError: () => setError(null)
  };
};

