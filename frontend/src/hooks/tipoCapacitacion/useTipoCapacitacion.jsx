import { useState, useCallback, useRef, useEffect } from 'react';
import { fetchTiposCapacitacion, createTipoCapacitacion, updateTipoCapacitacion, deleteTipoCapacitacion } from '@services/tipoCapacitacion.service';
import { 
  showErrorAlert,
  showConflictAlert,
  showSecurityAlert,
  showInfoAlert 
} from '@helpers/fireAlert.js';
import { toStartCase } from '@helpers/textFormatters.js';
import { toast } from 'react-toastify';

/**
 * Hook para gestionar tipos de capacitación
 */
export const useTipoCapacitacion = () => {
  const [tiposCapacitacion, setTiposCapacitacion] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);
  
  // Usar useRef para variables que no necesitan causar re-renders
  const lastFetchTimeRef = useRef(0);
  const loadingRef = useRef(false);

  /**
   * Obtener todos los tipos de capacitación con paginación
   */
  const fetchTiposCapacitacionHook = useCallback(async (params = {}, force = false) => {
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
      const response = await fetchTiposCapacitacion(params);
      
      // Manejar diferentes formatos de respuesta
      let tiposData;
      if (Array.isArray(response)) {
        tiposData = response;
      } else if (response?.status === 'Success') {
        tiposData = response.data || response.tiposCapacitacion || [];
      } else if (response?.tiposCapacitacion) {
        tiposData = response.tiposCapacitacion;
      } else if (response?.data) {
        tiposData = response.data;
      } else {
        tiposData = [];
      }
      
      setTiposCapacitacion(Array.isArray(tiposData) ? tiposData : []);
      lastFetchTimeRef.current = now;
    } catch (error) {
      console.error('Error fetching tipos de capacitación:', error);
      // Si es un error 403 (sin permisos), establecer array vacío en lugar de error
      if (error.response?.status === 403) {
        setTiposCapacitacion([]);
        setError('No tienes permisos para ver tipos de capacitación');
      } else {
        setError('Error al conectar con el servidor');
        setTiposCapacitacion([]); // Establecer array vacío también en otros errores
      }
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, []);

  /**
   * Crear un nuevo tipo de capacitación
   */
  const createTipoCapacitacionHook = useCallback(async (data) => {
    try {
      const response = await createTipoCapacitacion(data);
      
      if (response) {
        toast.success(`Tipo de capacitación "${toStartCase(response.nombre || data.nombre)}" creado exitosamente`);
        return { success: true, data: response };
      } else {
        showErrorAlert('Error al Crear Tipo de Capacitación', 'No se pudo crear el tipo de capacitación');
        return { success: false, error: 'Error al crear el tipo de capacitación' };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.response?.data?.details || error.message || 'Error al crear el tipo de capacitación';
      showErrorAlert('Error del Sistema', errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  /**
   * Actualizar un tipo de capacitación
   */
  const updateTipoCapacitacionHook = useCallback(async (id, data) => {
    try {
      const response = await updateTipoCapacitacion(id, data);
      
      if (response) {
        toast.success(`Tipo de capacitación "${toStartCase(response.nombre || data.nombre)}" actualizado exitosamente`);
        await fetchTiposCapacitacionHook({}, true); // Recargar la lista
        return { success: true, data: response };
      } else {
        showErrorAlert('Error al Actualizar Tipo de Capacitación', 'No se pudo actualizar el tipo de capacitación');
        return { success: false, error: 'Error al actualizar el tipo de capacitación' };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.response?.data?.details || error.message || 'Error al actualizar el tipo de capacitación';
      showErrorAlert('Error del Sistema', errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [fetchTiposCapacitacionHook]);

  /**
   * Eliminar un tipo de capacitación
   */
  const deleteTipoCapacitacionHook = useCallback(async (id) => {
    try {      
      // Verificar que el tipo aún existe en la lista local
      const tipoExists = tiposCapacitacion.find(tipo => tipo.id === id);
      if (!tipoExists) {
        showErrorAlert('Tipo de Capacitación No Encontrado', 'El tipo de capacitación no existe o ya fue eliminado de la lista');
        return { success: false, error: 'Tipo de capacitación no encontrado en la lista' };
      }
      
      await deleteTipoCapacitacion(id);
      toast.success(`Tipo de capacitación "${toStartCase(tipoExists.nombre)}" eliminado exitosamente`);
      await fetchTiposCapacitacionHook({}, true);
      return { success: true };
    } catch (error) {
      // Mensaje de error más específico según el código de estado
      if (error.response?.status === 404) {
        showInfoAlert('Tipo de Capacitación No Encontrado', 'El tipo de capacitación no existe o ya fue eliminado. La lista se actualizará automáticamente.');
        await fetchTiposCapacitacionHook({}, true);
        return { success: false, error: 'Tipo de capacitación no encontrado' };
      } else if (error.response?.status === 403) {
        showSecurityAlert('Acceso Denegado', 'No tienes los permisos necesarios para eliminar este tipo de capacitación. Contacta con tu administrador.');
        return { success: false, error: 'Acceso denegado' };
      } else if (error.response?.status === 409) {
        // Error de conflicto - tipo asociado a capacitaciones
        const backendMessage = error.response?.data?.details || error.response?.data?.message || '';
        
        showConflictAlert(
          'Operación Bloqueada',
          backendMessage || 'No se puede eliminar este tipo de capacitación porque está siendo utilizado por el sistema'
        );
        return { success: false, error: backendMessage };
      } else {
        const errorMessage = error.response?.data?.message || error.response?.data?.details || error.message || 'Error al eliminar el tipo de capacitación';
        showErrorAlert('Error del Sistema', errorMessage);
        return { success: false, error: errorMessage };
      }
    }
  }, [fetchTiposCapacitacionHook, tiposCapacitacion]);

  /**
   * Obtener un tipo de capacitación por ID
   */
  const getTipoCapacitacionById = useCallback((id) => {
    return tiposCapacitacion.find(tipo => tipo.id === parseInt(id));
  }, [tiposCapacitacion]);

  /**
   * Cargar tipos de capacitación al montar el componente
   */
  useEffect(() => {
    fetchTiposCapacitacionHook();
  }, [fetchTiposCapacitacionHook]);

  return {
    // Estado
    tiposCapacitacion,
    loading,
    error,
    pagination,
    
    // Acciones
    fetchTiposCapacitacion: fetchTiposCapacitacionHook,
    createTipoCapacitacion: createTipoCapacitacionHook,
    updateTipoCapacitacion: updateTipoCapacitacionHook,
    deleteTipoCapacitacion: deleteTipoCapacitacionHook,
    getTipoCapacitacionById,
    
    // Utilidades
    clearError: () => setError(null)
  };
};

