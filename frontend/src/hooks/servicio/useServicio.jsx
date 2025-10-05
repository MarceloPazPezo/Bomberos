import { useState, useCallback, useRef, useEffect } from 'react';
import { servicioService } from '@services/servicio.service.js';
import { 
  servicioCreatedToast,
  servicioUpdatedToast,
  servicioDeletedToast
} from '@helpers/toastHelper.jsx';
import { 
  showErrorAlert,
  showConflictAlert,
  showSecurityAlert,
  showInfoAlert 
} from '@helpers/fireAlert.js';
import { toStartCase } from '@helpers/textFormatters.js';

/**
 * Hook para gestionar servicios
 */
export const useServicio = () => {
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);
  
  // Usar useRef para variables que no necesitan causar re-renders
  const lastFetchTimeRef = useRef(0);
  const loadingRef = useRef(false);

  /**
   * Obtener todos los servicios con paginación
   */
  const fetchServicios = useCallback(async (params = {}, force = false) => {
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
      const response = await servicioService.getAll(params);
      
      if (response.status === 'Success') {
        const responseData = response.data || {};
        
        // Ahora siempre recibimos un array directo
        setServicios(Array.isArray(responseData) ? responseData : []);
      } else if (response.status === 'Error') {
        setError(response.message || 'Error al cargar servicios');
      } else {
        // Respuesta inesperada del servidor
        setError('Error al cargar servicios');
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
   * Crear un nuevo servicio
   */
  const createServicio = useCallback(async (data) => {
    try {
      const response = await servicioService.create(data);
      
      if (response.status === 'Success') {
        servicioCreatedToast(toStartCase(data.nombre)); // ✅ Toast para éxito
        // No recargar aquí, dejar que el componente lo maneje
        return { success: true, data: response.data };
      } else {
        showErrorAlert('Error al Crear Servicio', response.message || 'Error al crear el servicio'); // ❌ FireAlert para error
        return { success: false, error: response.message };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error al crear el servicio';
      showErrorAlert('Error del Sistema', errorMessage); // ❌ FireAlert para error
      return { success: false, error: errorMessage };
    }
  }, [fetchServicios]);

  /**
   * Actualizar un servicio
   */
  const updateServicio = useCallback(async (id, data) => {
    try {
      const response = await servicioService.update(id, data);
      
      if (response.status === 'Success') {
        servicioUpdatedToast(data.nombre); // ✅ Toast para éxito
        await fetchServicios({}, true); // Recargar la lista
        return { success: true, data: response.data };
      } else {
        showErrorAlert('Error al Actualizar Servicio', response.message || 'Error al actualizar el servicio'); // ❌ FireAlert para error
        return { success: false, error: response.message };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error al actualizar el servicio';
      showErrorAlert('Error del Sistema', errorMessage); // ❌ FireAlert para error
      return { success: false, error: errorMessage };
    }
  }, [fetchServicios]);

  /**
   * Eliminar un servicio
   */
  const deleteServicio = useCallback(async (id) => {
    try {      
      // Verificar que el servicio aún existe en la lista local
      const servicioExists = servicios.find(servicio => servicio.id === id);
      if (!servicioExists) {
        showErrorAlert('Servicio No Encontrado', 'El servicio no existe o ya fue eliminado de la lista');
        return { success: false, error: 'Servicio no encontrado en la lista' };
      }
      
      const response = await servicioService.delete(id);
      
      if (response.status === 'Success') {
        servicioDeletedToast(toStartCase(servicioExists.nombre));
        await fetchServicios({}, true);
        return { success: true };
      } else {
        // Manejo de errores en respuesta directa
        let errorMessage = response.message || 'Error al eliminar el servicio';
        
        // Si el mensaje indica que está siendo usado por incidentes
        if (response.message && response.message.includes('porque está siendo utilizado por')) {
          const servicioNameMatch = response.message.match(/servicio "([^"]+)"/);
          const incidentesCountMatch = response.message.match(/(\d+) incidentes/);
          
          const servicioName = servicioNameMatch ? servicioNameMatch[1] : 'este servicio';
          const incidentesCount = incidentesCountMatch ? parseInt(incidentesCountMatch[1]) : 1;
          const incidentesText = incidentesCount === 1 ? 'incidente' : 'incidentes';
          
          showConflictAlert(
            'Operación Bloqueada',
            `El servicio "${servicioName}" está actualmente asignado a ${incidentesCount} ${incidentesText}. Para eliminar este servicio, primero debes reasignar o quitar el servicio de todos los incidentes que lo tienen asignado.`
          );
        } else {
          showErrorAlert('Error del Sistema', errorMessage);
        }
        return { success: false, error: response.message };
      }
    } catch (error) {
      
      // Mensaje de error más específico según el código de estado
      if (error.response?.status === 404) {
        showInfoAlert('Servicio No Encontrado', 'El servicio no existe o ya fue eliminado. La lista se actualizará automáticamente.');
        await fetchServicios({}, true);
        return { success: false, error: 'Servicio no encontrado' };
      } else if (error.response?.status === 403) {
        showSecurityAlert('Acceso Denegado', 'No tienes los permisos necesarios para eliminar este servicio. Contacta con tu administrador.');
        return { success: false, error: 'Acceso denegado' };
      } else if (error.response?.status === 409) {
        // Error de conflicto - servicio asignado a incidentes
        const backendMessage = error.response?.data?.message || error.response?.data?.details || '';
        
        // Intentar extraer información del mensaje del backend
        if (backendMessage.includes('porque está siendo utilizado por')) {
          const servicioNameMatch = backendMessage.match(/servicio "([^"]+)"/);
          const incidentesCountMatch = backendMessage.match(/(\d+) incidentes/);
          
          const servicioName = servicioNameMatch ? servicioNameMatch[1] : 'este servicio';
          const incidentesCount = incidentesCountMatch ? parseInt(incidentesCountMatch[1]) : 1;
          const incidentesText = incidentesCount === 1 ? 'incidente' : 'incidentes';
          
          showConflictAlert(
            'Operación Bloqueada',
            `El servicio "${servicioName}" está actualmente asignado a ${incidentesCount} ${incidentesText}. Para eliminar este servicio, primero debes reasignar o quitar el servicio de todos los incidentes que lo tienen asignado.`
          );
        } else {
          showConflictAlert('Operación Bloqueada', backendMessage || 'No se puede eliminar este servicio porque está siendo utilizado por el sistema');
        }
        return { success: false, error: backendMessage };
      } else {
        const errorMessage = error.response?.data?.message || error.response?.data?.details || 'Error al eliminar el servicio';
        showErrorAlert('Error del Sistema', errorMessage);
        return { success: false, error: errorMessage };
      }
    }
  }, [fetchServicios, servicios]);

  /**
   * Obtener un servicio por ID
   */
  const getServicioById = useCallback((id) => {
    return servicios.find(servicio => servicio.id === parseInt(id));
  }, [servicios]);

  /**
   * Cargar servicios al montar el componente
   */
  useEffect(() => {
    fetchServicios();
  }, [fetchServicios]);

  return {
    // Estado
    servicios,
    loading,
    error,
    pagination,
    
    // Acciones
    fetchServicios,
    createServicio,
    updateServicio,
    deleteServicio,
    getServicioById,
    
    // Utilidades
    clearError: () => setError(null)
  };
};
