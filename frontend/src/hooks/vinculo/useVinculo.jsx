import { useState, useCallback, useRef, useEffect } from 'react';
import { fetchVinculos, createVinculo, updateVinculo, deleteVinculo } from '@services/vinculo.service';
import { 
  vinculoCreatedToast,
  vinculoUpdatedToast,
  vinculoDeletedToast
} from '@helpers/toastHelper.jsx';
import { 
  showErrorAlert,
  showConflictAlert,
  showSecurityAlert,
  showInfoAlert 
} from '@helpers/fireAlert.js';
import { toStartCase } from '@helpers/textFormatters.js';

/**
 * Hook para gestionar vínculos
 */
export const useVinculo = () => {
  const [vinculos, setVinculos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);
  
  // Usar useRef para variables que no necesitan causar re-renders
  const lastFetchTimeRef = useRef(0);
  const loadingRef = useRef(false);

  /**
   * Obtener todos los vínculos con paginación
   */
  const fetchVinculosHook = useCallback(async (params = {}, force = false) => {
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
      const response = await fetchVinculos(params);
      
      // Manejar diferentes formatos de respuesta
      let vinculosData;
      if (Array.isArray(response)) {
        vinculosData = response;
      } else if (response?.status === 'Success') {
        vinculosData = response.data || response.vinculos || [];
      } else if (response?.vinculos) {
        vinculosData = response.vinculos;
      } else if (response?.data) {
        vinculosData = response.data;
      } else {
        vinculosData = [];
      }
      
      setVinculos(Array.isArray(vinculosData) ? vinculosData : []);
      lastFetchTimeRef.current = now;
    } catch (error) {
      console.error('Error fetching vinculos:', error);
      // Si es un error 403 (sin permisos), establecer array vacío en lugar de error
      if (error.response?.status === 403) {
        setVinculos([]);
        setError('No tienes permisos para ver vínculos');
      } else {
        setError('Error al conectar con el servidor');
        setVinculos([]); // Establecer array vacío también en otros errores
      }
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, []);

  /**
   * Crear un nuevo vínculo
   */
  const createVinculoHook = useCallback(async (data) => {
    try {
      const response = await createVinculo(data);
      
      if (response) {
        vinculoCreatedToast(toStartCase(response.nombre || data.nombre));
        return { success: true, data: response };
      } else {
        showErrorAlert('Error al Crear Vínculo', 'No se pudo crear el vínculo');
        return { success: false, error: 'Error al crear el vínculo' };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.response?.data?.details || error.message || 'Error al crear el vínculo';
      showErrorAlert('Error del Sistema', errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  /**
   * Actualizar un vínculo
   */
  const updateVinculoHook = useCallback(async (id, data) => {
    try {
      const response = await updateVinculo(id, data);
      
      if (response) {
        vinculoUpdatedToast(toStartCase(response.nombre || data.nombre));
        await fetchVinculosHook({}, true); // Recargar la lista
        return { success: true, data: response };
      } else {
        showErrorAlert('Error al Actualizar Vínculo', 'No se pudo actualizar el vínculo');
        return { success: false, error: 'Error al actualizar el vínculo' };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.response?.data?.details || error.message || 'Error al actualizar el vínculo';
      showErrorAlert('Error del Sistema', errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [fetchVinculosHook]);

  /**
   * Eliminar un vínculo
   */
  const deleteVinculoHook = useCallback(async (id) => {
    try {      
      // Verificar que el vínculo aún existe en la lista local
      const vinculoExists = vinculos.find(vinculo => vinculo.id === id);
      if (!vinculoExists) {
        showErrorAlert('Vínculo No Encontrado', 'El vínculo no existe o ya fue eliminado de la lista');
        return { success: false, error: 'Vínculo no encontrado en la lista' };
      }
      
      await deleteVinculo(id);
      vinculoDeletedToast(toStartCase(vinculoExists.nombre));
      await fetchVinculosHook({}, true);
      return { success: true };
    } catch (error) {
      // Mensaje de error más específico según el código de estado
      if (error.response?.status === 404) {
        showInfoAlert('Vínculo No Encontrado', 'El vínculo no existe o ya fue eliminado. La lista se actualizará automáticamente.');
        await fetchVinculosHook({}, true);
        return { success: false, error: 'Vínculo no encontrado' };
      } else if (error.response?.status === 403) {
        showSecurityAlert('Acceso Denegado', 'No tienes los permisos necesarios para eliminar este vínculo. Contacta con tu administrador.');
        return { success: false, error: 'Acceso denegado' };
      } else if (error.response?.status === 409) {
        // Error de conflicto - vínculo asociado a contactos o pasajeros
        const backendMessage = error.response?.data?.details || error.response?.data?.message || '';
        
        showConflictAlert(
          'Operación Bloqueada',
          backendMessage || 'No se puede eliminar este vínculo porque está siendo utilizado por el sistema'
        );
        return { success: false, error: backendMessage };
      } else {
        const errorMessage = error.response?.data?.message || error.response?.data?.details || error.message || 'Error al eliminar el vínculo';
        showErrorAlert('Error del Sistema', errorMessage);
        return { success: false, error: errorMessage };
      }
    }
  }, [fetchVinculosHook, vinculos]);

  /**
   * Obtener un vínculo por ID
   */
  const getVinculoById = useCallback((id) => {
    return vinculos.find(vinculo => vinculo.id === parseInt(id));
  }, [vinculos]);

  /**
   * Cargar vínculos al montar el componente
   */
  useEffect(() => {
    fetchVinculosHook();
  }, [fetchVinculosHook]);

  return {
    // Estado
    vinculos,
    loading,
    error,
    pagination,
    
    // Acciones
    fetchVinculos: fetchVinculosHook,
    createVinculo: createVinculoHook,
    updateVinculo: updateVinculoHook,
    deleteVinculo: deleteVinculoHook,
    getVinculoById,
    
    // Utilidades
    clearError: () => setError(null)
  };
};

