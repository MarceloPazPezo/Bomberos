import { useState, useCallback, useRef, useEffect } from 'react';
import { fetchSubtiposIncidentes, createSubtipoIncidente, updateSubtipoIncidente, deleteSubtipoIncidente } from '@services/subtipoIncidente.service';
import { 
  subtipoIncidenteCreatedToast,
  subtipoIncidenteUpdatedToast,
  subtipoIncidenteDeletedToast
} from '@helpers/toastHelper.jsx';
import { 
  showErrorAlert,
  showConflictAlert,
  showSecurityAlert,
  showInfoAlert 
} from '@helpers/fireAlert.js';

/**
 * Hook para gestionar subtipos de incidente
 */
export const useSubtipoIncidente = () => {
  const [subtiposIncidentes, setSubtiposIncidentes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);
  
  // Usar useRef para variables que no necesitan causar re-renders
  const lastFetchTimeRef = useRef(0);
  const loadingRef = useRef(false);

  /**
   * Obtener todos los subtipos de incidente con paginación
   */
  const fetchSubtiposIncidentesHook = useCallback(async (params = {}, force = false) => {
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
      const response = await fetchSubtiposIncidentes(params);
      
      // Manejar diferentes formatos de respuesta
      let subtiposData;
      if (Array.isArray(response)) {
        subtiposData = response;
      } else if (response?.status === 'Success') {
        subtiposData = response.data || response.subtiposIncidentes || [];
      } else if (response?.subtiposIncidentes) {
        subtiposData = response.subtiposIncidentes;
      } else if (response?.data) {
        subtiposData = response.data;
      } else {
        subtiposData = [];
      }
      
      setSubtiposIncidentes(Array.isArray(subtiposData) ? subtiposData : []);
      lastFetchTimeRef.current = now;
    } catch (error) {
      console.error('Error fetching subtipos incidentes:', error);
      if (error.response?.status === 403) {
        setSubtiposIncidentes([]);
        setError('No tienes permisos para ver subtipos de incidente');
      } else {
        setError('Error al conectar con el servidor');
        setSubtiposIncidentes([]);
      }
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, []);

  /**
   * Crear un nuevo subtipo de incidente
   */
  const createSubtipoIncidenteHook = useCallback(async (data) => {
    try {
      const response = await createSubtipoIncidente(data);
      
      if (response) {
        subtipoIncidenteCreatedToast(response.claveRadial || 'Subtipo de incidente');
        return { success: true, data: response };
      } else {
        showErrorAlert('Error al Crear Subtipo de Incidente', 'No se pudo crear el subtipo de incidente');
        return { success: false, error: 'Error al crear el subtipo de incidente' };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.response?.data?.details || error.message || 'Error al crear el subtipo de incidente';
      showErrorAlert('Error del Sistema', errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  /**
   * Actualizar un subtipo de incidente
   */
  const updateSubtipoIncidenteHook = useCallback(async (id, data) => {
    try {
      const response = await updateSubtipoIncidente(id, data);
      
      if (response) {
        subtipoIncidenteUpdatedToast(response.claveRadial || 'Subtipo de incidente');
        await fetchSubtiposIncidentesHook({}, true); // Recargar la lista
        return { success: true, data: response };
      } else {
        showErrorAlert('Error al Actualizar Subtipo de Incidente', 'No se pudo actualizar el subtipo de incidente');
        return { success: false, error: 'Error al actualizar el subtipo de incidente' };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.response?.data?.details || error.message || 'Error al actualizar el subtipo de incidente';
      showErrorAlert('Error del Sistema', errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [fetchSubtiposIncidentesHook]);

  /**
   * Eliminar un subtipo de incidente
   */
  const deleteSubtipoIncidenteHook = useCallback(async (id) => {
    try {      
      // Verificar que el subtipo aún existe en la lista local
      const subtipoExists = subtiposIncidentes.find(subtipo => subtipo.id === id);
      if (!subtipoExists) {
        showErrorAlert('Subtipo de Incidente No Encontrado', 'El subtipo de incidente no existe o ya fue eliminado de la lista');
        return { success: false, error: 'Subtipo de incidente no encontrado en la lista' };
      }
      
      await deleteSubtipoIncidente(id);
      subtipoIncidenteDeletedToast(subtipoExists.claveRadial || 'Subtipo de incidente');
      await fetchSubtiposIncidentesHook({}, true);
      return { success: true };
    } catch (error) {
      // Mensaje de error más específico según el código de estado
      if (error.response?.status === 404) {
        showInfoAlert('Subtipo de Incidente No Encontrado', 'El subtipo de incidente no existe o ya fue eliminado. La lista se actualizará automáticamente.');
        await fetchSubtiposIncidentesHook({}, true);
        return { success: false, error: 'Subtipo de incidente no encontrado' };
      } else if (error.response?.status === 403) {
        showSecurityAlert('Acceso Denegado', 'No tienes los permisos necesarios para eliminar este subtipo de incidente. Contacta con tu administrador.');
        return { success: false, error: 'Acceso denegado' };
      } else if (error.response?.status === 409) {
        // Error de conflicto - subtipo asociado a incidentes
        const backendMessage = error.response?.data?.details || error.response?.data?.message || '';
        
        showConflictAlert(
          'Operación Bloqueada',
          backendMessage || 'No se puede eliminar este subtipo de incidente porque está siendo utilizado por el sistema'
        );
        return { success: false, error: backendMessage };
      } else {
        const errorMessage = error.response?.data?.message || error.response?.data?.details || error.message || 'Error al eliminar el subtipo de incidente';
        showErrorAlert('Error del Sistema', errorMessage);
        return { success: false, error: errorMessage };
      }
    }
  }, [fetchSubtiposIncidentesHook, subtiposIncidentes]);

  /**
   * Obtener un subtipo de incidente por ID
   */
  const getSubtipoIncidenteById = useCallback((id) => {
    return subtiposIncidentes.find(subtipo => subtipo.id === parseInt(id));
  }, [subtiposIncidentes]);

  /**
   * Cargar subtipos de incidente al montar el componente
   */
  useEffect(() => {
    fetchSubtiposIncidentesHook();
  }, [fetchSubtiposIncidentesHook]);

  return {
    // Estado
    subtiposIncidentes,
    loading,
    error,
    pagination,
    
    // Acciones
    fetchSubtiposIncidentes: fetchSubtiposIncidentesHook,
    createSubtipoIncidente: createSubtipoIncidenteHook,
    updateSubtipoIncidente: updateSubtipoIncidenteHook,
    deleteSubtipoIncidente: deleteSubtipoIncidenteHook,
    getSubtipoIncidenteById,
    
    // Utilidades
    clearError: () => setError(null)
  };
};

