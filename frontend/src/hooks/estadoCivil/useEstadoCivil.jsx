import { useState, useCallback, useRef, useEffect } from 'react';
import { estadoCivilService } from '@services/estadoCivil.service.js';
import { 
  estadoCivilCreatedToast,
  estadoCivilUpdatedToast,
  estadoCivilDeletedToast
} from '@helpers/toastHelper.jsx';
import { 
  showErrorAlert,
  showConflictAlert,
  showSecurityAlert,
  showInfoAlert 
} from '@helpers/fireAlert.js';
import { toStartCase } from '@helpers/textFormatters.js';

/**
 * Hook para gestionar estados civiles
 */
export const useEstadoCivil = () => {
  const [estadosCiviles, setEstadosCiviles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);
  
  // Usar useRef para variables que no necesitan causar re-renders
  const lastFetchTimeRef = useRef(0);
  const loadingRef = useRef(false);

  /**
   * Obtener todos los estados civiles con paginación
   */
  const fetchEstadosCiviles = useCallback(async (params = {}, force = false) => {
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
      const response = await estadoCivilService.getAll(params);
      
      if (response.status === 'Success') {
        const responseData = response.data || {};
        
        // Manejar tanto array directo como estructura paginada
        let estadosCivilesData;
        let paginationData = null;
        
        if (Array.isArray(responseData)) {
          // Array directo
          estadosCivilesData = responseData;
        } else if (responseData.estadosCiviles && Array.isArray(responseData.estadosCiviles)) {
          // Estructura paginada: { estadosCiviles: [...], pagination: {...} }
          estadosCivilesData = responseData.estadosCiviles;
          paginationData = responseData.pagination;
        } else {
          // Asumir que es array directo si no tiene estructura paginada
          estadosCivilesData = responseData;
        }
        
        setEstadosCiviles(Array.isArray(estadosCivilesData) ? estadosCivilesData : []);
        setPagination(paginationData);
      } else if (response.status === 'Error') {
        setError(response.message || 'Error al cargar estados civiles');
      } else {
        // Respuesta inesperada del servidor
        setError('Error al cargar estados civiles');
      }
      lastFetchTimeRef.current = now;
    } catch (error) {
      setError('Error al conectar con el servidor');
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, []);


  /**
   * Crear un nuevo estado civil
   */
  const createEstadoCivil = useCallback(async (data) => {
    try {
      const response = await estadoCivilService.create(data);
      
      if (response.status === 'Success') {
        estadoCivilCreatedToast(toStartCase(data.nombre)); // ✅ Toast para éxito
        // No recargar aquí, dejar que el componente lo maneje
        return { success: true, data: response.data };
      } else {
        showErrorAlert('Error al Crear Estado Civil', response.message || 'Error al crear el estado civil'); // ❌ FireAlert para error
        return { success: false, error: response.message };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error al crear el estado civil';
      showErrorAlert('Error del Sistema', errorMessage); // ❌ FireAlert para error
      return { success: false, error: errorMessage };
    }
  }, [fetchEstadosCiviles]);

  /**
   * Actualizar un estado civil
   */
  const updateEstadoCivil = useCallback(async (id, data) => {
    try {
      const response = await estadoCivilService.update(id, data);
      
      if (response.status === 'Success') {
        estadoCivilUpdatedToast(data.nombre); // ✅ Toast para éxito
        await fetchEstadosCiviles({}, true); // Recargar la lista
        return { success: true, data: response.data };
      } else {
        showErrorAlert('Error al Actualizar Estado Civil', response.message || 'Error al actualizar el estado civil'); // ❌ FireAlert para error
        return { success: false, error: response.message };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error al actualizar el estado civil';
      showErrorAlert('Error del Sistema', errorMessage); // ❌ FireAlert para error
      return { success: false, error: errorMessage };
    }
  }, [fetchEstadosCiviles]);

  /**
   * Eliminar un estado civil
   */
  const deleteEstadoCivil = useCallback(async (id) => {
    try {      
      // Verificar que el estado civil aún existe en la lista local
      const estadoCivilExists = estadosCiviles.find(estado => estado.id === id);
      if (!estadoCivilExists) {
        showErrorAlert('Estado Civil No Encontrado', 'El estado civil no existe o ya fue eliminado de la lista');
        return { success: false, error: 'Estado civil no encontrado en la lista' };
      }
      
      const response = await estadoCivilService.delete(id);
      
      if (response.status === 'Success') {
        estadoCivilDeletedToast(toStartCase(estadoCivilExists.nombre));
        await fetchEstadosCiviles({}, true);
        return { success: true };
      } else {
        // Manejo de errores en respuesta directa
        let errorMessage = response.message || 'Error al eliminar el estado civil';
        
        // Si el mensaje indica que está siendo usado por afectados
        if (response.message && response.message.includes('porque está siendo utilizado por')) {
          const estadoCivilNameMatch = response.message.match(/estado civil "([^"]+)"/);
          const afectadosCountMatch = response.message.match(/(\d+) afectados/);
          
          const estadoCivilName = estadoCivilNameMatch ? estadoCivilNameMatch[1] : 'este estado civil';
          const afectadosCount = afectadosCountMatch ? parseInt(afectadosCountMatch[1]) : 1;
          const afectadosText = afectadosCount === 1 ? 'afectado' : 'afectados';
          
          showConflictAlert(
            'Operación Bloqueada',
            `El estado civil "${estadoCivilName}" está actualmente asignado a ${afectadosCount} ${afectadosText}. Para eliminar este estado civil, primero debes reasignar o quitar el estado civil de todos los afectados que lo tienen asignado.`
          );
        } else {
          showErrorAlert('Error del Sistema', errorMessage);
        }
        return { success: false, error: response.message };
      }
    } catch (error) {
      
      // Mensaje de error más específico según el código de estado
      if (error.response?.status === 404) {
        showInfoAlert('Estado Civil No Encontrado', 'El estado civil no existe o ya fue eliminado. La lista se actualizará automáticamente.');
        await fetchEstadosCiviles({}, true);
        return { success: false, error: 'Estado civil no encontrado' };
      } else if (error.response?.status === 403) {
        showSecurityAlert('Acceso Denegado', 'No tienes los permisos necesarios para eliminar este estado civil. Contacta con tu administrador.');
        return { success: false, error: 'Acceso denegado' };
      } else if (error.response?.status === 409) {
        // Error de conflicto - estado civil asignado a afectados
        const backendMessage = error.response?.data?.message || error.response?.data?.details || '';
        
        // Intentar extraer información del mensaje del backend
        if (backendMessage.includes('porque está siendo utilizado por')) {
          const estadoCivilNameMatch = backendMessage.match(/estado civil "([^"]+)"/);
          const afectadosCountMatch = backendMessage.match(/(\d+) afectados/);
          
          const estadoCivilName = estadoCivilNameMatch ? estadoCivilNameMatch[1] : 'este estado civil';
          const afectadosCount = afectadosCountMatch ? parseInt(afectadosCountMatch[1]) : 1;
          const afectadosText = afectadosCount === 1 ? 'afectado' : 'afectados';
          
          showConflictAlert(
            'Operación Bloqueada',
            `El estado civil "${estadoCivilName}" está actualmente asignado a ${afectadosCount} ${afectadosText}. Para eliminar este estado civil, primero debes reasignar o quitar el estado civil de todos los afectados que lo tienen asignado.`
          );
        } else {
          showConflictAlert('Operación Bloqueada', backendMessage || 'No se puede eliminar este estado civil porque está siendo utilizado por el sistema');
        }
        return { success: false, error: backendMessage };
      } else {
        const errorMessage = error.response?.data?.message || error.response?.data?.details || 'Error al eliminar el estado civil';
        showErrorAlert('Error del Sistema', errorMessage);
        return { success: false, error: errorMessage };
      }
    }
  }, [fetchEstadosCiviles, estadosCiviles]);

  /**
   * Obtener un estado civil por ID
   */
  const getEstadoCivilById = useCallback((id) => {
    return estadosCiviles.find(estado => estado.id === parseInt(id));
  }, [estadosCiviles]);

  /**
   * Cargar estados civiles al montar el componente
   */
  useEffect(() => {
    fetchEstadosCiviles();
  }, [fetchEstadosCiviles]);

  return {
    // Estado
    estadosCiviles,
    loading,
    error,
    pagination,
    
    // Acciones
    fetchEstadosCiviles,
    createEstadoCivil,
    updateEstadoCivil,
    deleteEstadoCivil,
    getEstadoCivilById,
    
    // Utilidades
    clearError: () => setError(null)
  };
};
