import { useState, useCallback, useRef, useEffect } from 'react';
import { fetchClavesRadiales, createClaveRadial, updateClaveRadial, deleteClaveRadial } from '@services/claveRadial.service';
import { 
  claveRadialCreatedToast,
  claveRadialUpdatedToast,
  claveRadialDeletedToast
} from '@helpers/toastHelper.jsx';
import { 
  showErrorAlert,
  showConflictAlert,
  showSecurityAlert,
  showInfoAlert 
} from '@helpers/fireAlert.js';
import { toStartCase } from '@helpers/textFormatters.js';

/**
 * Hook para gestionar claves radiales
 */
export const useClaveRadial = () => {
  const [clavesRadiales, setClavesRadiales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);
  
  // Usar useRef para variables que no necesitan causar re-renders
  const lastFetchTimeRef = useRef(0);
  const loadingRef = useRef(false);

  /**
   * Obtener todas las claves radiales con paginación
   */
  const fetchClavesRadialesHook = useCallback(async (params = {}, force = false) => {
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
      const response = await fetchClavesRadiales(params);
      
      // Manejar diferentes formatos de respuesta
      let clavesRadialesData;
      if (Array.isArray(response)) {
        clavesRadialesData = response;
      } else if (response?.status === 'Success') {
        clavesRadialesData = response.data || response.clavesRadiales || [];
      } else if (response?.clavesRadiales) {
        clavesRadialesData = response.clavesRadiales;
      } else if (response?.data) {
        clavesRadialesData = response.data;
      } else {
        clavesRadialesData = [];
      }
      
      setClavesRadiales(Array.isArray(clavesRadialesData) ? clavesRadialesData : []);
      lastFetchTimeRef.current = now;
    } catch (error) {
      console.error('Error fetching claves radiales:', error);
      setError('Error al conectar con el servidor');
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, []);

  /**
   * Crear una nueva clave radial
   */
  const createClaveRadialHook = useCallback(async (data) => {
    try {
      const response = await createClaveRadial(data);
      
      if (response) {
        claveRadialCreatedToast(toStartCase(response.nombre || data.nombre));
        return { success: true, data: response };
      } else {
        showErrorAlert('Error al Crear Clave Radial', 'No se pudo crear la clave radial');
        return { success: false, error: 'Error al crear la clave radial' };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.response?.data?.details || error.message || 'Error al crear la clave radial';
      showErrorAlert('Error del Sistema', errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  /**
   * Actualizar una clave radial
   */
  const updateClaveRadialHook = useCallback(async (id, data) => {
    try {
      const response = await updateClaveRadial(id, data);
      
      if (response) {
        claveRadialUpdatedToast(toStartCase(response.nombre || data.nombre));
        await fetchClavesRadialesHook({}, true); // Recargar la lista
        return { success: true, data: response };
      } else {
        showErrorAlert('Error al Actualizar Clave Radial', 'No se pudo actualizar la clave radial');
        return { success: false, error: 'Error al actualizar la clave radial' };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.response?.data?.details || error.message || 'Error al actualizar la clave radial';
      showErrorAlert('Error del Sistema', errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [fetchClavesRadialesHook]);

  /**
   * Eliminar una clave radial
   */
  const deleteClaveRadialHook = useCallback(async (id) => {
    try {      
      // Verificar que la clave radial aún existe en la lista local
      const claveRadialExists = clavesRadiales.find(clave => clave.id === id);
      if (!claveRadialExists) {
        showErrorAlert('Clave Radial No Encontrada', 'La clave radial no existe o ya fue eliminada de la lista');
        return { success: false, error: 'Clave radial no encontrada en la lista' };
      }
      
      await deleteClaveRadial(id);
      claveRadialDeletedToast(toStartCase(claveRadialExists.nombre));
      await fetchClavesRadialesHook({}, true);
      return { success: true };
    } catch (error) {
      // Mensaje de error más específico según el código de estado
      if (error.response?.status === 404) {
        showInfoAlert('Clave Radial No Encontrada', 'La clave radial no existe o ya fue eliminada. La lista se actualizará automáticamente.');
        await fetchClavesRadialesHook({}, true);
        return { success: false, error: 'Clave radial no encontrada' };
      } else if (error.response?.status === 403) {
        showSecurityAlert('Acceso Denegado', 'No tienes los permisos necesarios para eliminar esta clave radial. Contacta con tu administrador.');
        return { success: false, error: 'Acceso denegado' };
      } else if (error.response?.status === 409) {
        // Error de conflicto - clave radial asociada a subtipos
        const backendMessage = error.response?.data?.details || error.response?.data?.message || '';
        
        showConflictAlert(
          'Operación Bloqueada',
          backendMessage || 'No se puede eliminar esta clave radial porque está siendo utilizada por el sistema'
        );
        return { success: false, error: backendMessage };
      } else {
        const errorMessage = error.response?.data?.message || error.response?.data?.details || error.message || 'Error al eliminar la clave radial';
        showErrorAlert('Error del Sistema', errorMessage);
        return { success: false, error: errorMessage };
      }
    }
  }, [fetchClavesRadialesHook, clavesRadiales]);

  /**
   * Obtener una clave radial por ID
   */
  const getClaveRadialById = useCallback((id) => {
    return clavesRadiales.find(clave => clave.id === parseInt(id));
  }, [clavesRadiales]);

  /**
   * Cargar claves radiales al montar el componente
   */
  useEffect(() => {
    fetchClavesRadialesHook();
  }, [fetchClavesRadialesHook]);

  return {
    // Estado
    clavesRadiales,
    loading,
    error,
    pagination,
    
    // Acciones
    fetchClavesRadiales: fetchClavesRadialesHook,
    createClaveRadial: createClaveRadialHook,
    updateClaveRadial: updateClaveRadialHook,
    deleteClaveRadial: deleteClaveRadialHook,
    getClaveRadialById,
    
    // Utilidades
    clearError: () => setError(null)
  };
};

