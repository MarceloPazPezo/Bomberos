import { useState, useCallback, useRef } from 'react';
import { getTiposEvento, createTipoEvento, updateTipoEvento, deleteTipoEvento } from '@services/tipoEvento.service.js';
import { 
  showErrorAlert,
  showConflictAlert,
  showSecurityAlert,
  showInfoAlert 
} from '@helpers/fireAlert.js';
import { 
  tipoEventoCreatedToast,
  tipoEventoUpdatedToast,
  tipoEventoDeletedToast 
} from '@helpers/toastHelper.jsx';

export const useTiposEvento = () => {
  const [tiposEvento, setTiposEvento] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Usar useRef para variables que no necesitan causar re-renders
  const lastFetchTimeRef = useRef(0);
  const loadingRef = useRef(false);

  // Función para obtener todos los tipos de evento
  const fetchTiposEvento = useCallback(async (force = false) => {
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
      const response = await getTiposEvento();
      
      if (response.status === 'Success') {
        const responseData = response.data || [];
        
        // Manejar tanto array directo como estructura paginada
        let tiposEventoData;
        if (Array.isArray(responseData)) {
          tiposEventoData = responseData;
        } else if (responseData.tiposEvento && Array.isArray(responseData.tiposEvento)) {
          tiposEventoData = responseData.tiposEvento;
        } else {
          tiposEventoData = responseData;
        }
        
        setTiposEvento(Array.isArray(tiposEventoData) ? tiposEventoData : []);
      } else if (response.status === 'Error') {
        setError(response.message || 'Error al cargar tipos de evento');
      } else {
        setError('Error al cargar tipos de evento');
      }
      lastFetchTimeRef.current = now;
    } catch (error) {
      setError('Error al conectar con el servidor');
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, []);

  // Función para crear un nuevo tipo de evento
  const handleCreateTipoEvento = useCallback(async (tipoEventoData) => {
    try {
      const response = await createTipoEvento(tipoEventoData);
      
      if (response.status === 'Success') {
        tipoEventoCreatedToast();
        await fetchTiposEvento(true);
        return { success: true, data: response.data };
      } else {
        showErrorAlert('Error al Crear Tipo de Evento', response.message || 'Error al crear el tipo de evento');
        return { success: false, error: response.message };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error al crear el tipo de evento';
      showErrorAlert('Error del Sistema', errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [fetchTiposEvento]);

  // Función para actualizar un tipo de evento
  const handleUpdateTipoEvento = useCallback(async (id, tipoEventoData) => {
    try {
      const response = await updateTipoEvento(id, tipoEventoData);
      
      if (response.status === 'Success') {
        tipoEventoUpdatedToast();
        await fetchTiposEvento(true);
        return { success: true, data: response.data };
      } else {
        showErrorAlert('Error al Actualizar Tipo de Evento', response.message || 'Error al actualizar el tipo de evento');
        return { success: false, error: response.message };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error al actualizar el tipo de evento';
      showErrorAlert('Error del Sistema', errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [fetchTiposEvento]);

  // Función para eliminar un tipo de evento
  const handleDeleteTipoEvento = useCallback(async (id) => {
    try {      
      // Verificar que el tipo de evento aún existe en la lista local
      const tipoEventoExists = tiposEvento.find(tipoEvento => tipoEvento.id === id);
      if (!tipoEventoExists) {
        showErrorAlert('Tipo de Evento No Encontrado', 'El tipo de evento no existe o ya fue eliminado de la lista');
        return { success: false, error: 'Tipo de evento no encontrado en la lista' };
      }
      
      const response = await deleteTipoEvento(id);
      
      if (response.status === 'Success') {
        // Forzar actualización inmediata del estado local
        setTiposEvento(prev => prev.filter(tipoEvento => tipoEvento.id !== id));
        
        // También refrescar desde el servidor para asegurar consistencia
        await fetchTiposEvento(true);
        return { success: true };
      } else {
        let errorMessage = response.message || 'Error al eliminar el tipo de evento';
        
        // Si el mensaje indica que está asociado a eventos
        if (response.message && response.message.includes('porque está asociado a')) {
          const tipoEventoNameMatch = response.message.match(/tipo de evento "([^"]+)"/);
          const eventosCountMatch = response.message.match(/(\d+) evento/);
          
          const tipoEventoName = tipoEventoNameMatch ? tipoEventoNameMatch[1] : 'este tipo de evento';
          const eventosCount = eventosCountMatch ? parseInt(eventosCountMatch[1]) : 1;
          const eventoText = eventosCount === 1 ? 'evento' : 'eventos';
          
          showConflictAlert(
            'Operación Bloqueada',
            `El tipo de evento "${tipoEventoName}" está actualmente asociado a ${eventosCount} ${eventoText}. Para eliminar este tipo de evento, primero debes eliminar o reasignar todos los eventos que lo usan.`
          );
        } else {
          showErrorAlert('Error del Sistema', errorMessage);
        }
        return { success: false, error: response.message };
      }
    } catch (error) {
      if (error.response?.status === 404) {
        showInfoAlert('Tipo de Evento No Encontrado', 'El tipo de evento no existe o ya fue eliminado. La lista se actualizará automáticamente.');
        await fetchTiposEvento(true);
        return { success: false, error: 'Tipo de evento no encontrado' };
      } else if (error.response?.status === 403) {
        showSecurityAlert('Acceso Denegado', 'No tienes los permisos necesarios para eliminar este tipo de evento. Contacta con tu administrador.');
        return { success: false, error: 'Acceso denegado' };
      } else if (error.response?.status === 409) {
        // Error de conflicto - tipo de evento asociado a eventos
        const backendMessage = error.response?.data?.message || error.response?.data?.details || '';
        
        if (backendMessage.includes('porque está asociado a')) {
          const tipoEventoNameMatch = backendMessage.match(/tipo de evento "([^"]+)"/);
          const eventosCountMatch = backendMessage.match(/(\d+) evento/);
          
          const tipoEventoName = tipoEventoNameMatch ? tipoEventoNameMatch[1] : 'este tipo de evento';
          const eventosCount = eventosCountMatch ? parseInt(eventosCountMatch[1]) : 1;
          const eventoText = eventosCount === 1 ? 'evento' : 'eventos';
          
          showConflictAlert(
            'Operación Bloqueada',
            `El tipo de evento "${tipoEventoName}" está actualmente asociado a ${eventosCount} ${eventoText}. Para eliminar este tipo de evento, primero debes eliminar o reasignar todos los eventos que lo usan.`
          );
        } else {
          showConflictAlert('Operación Bloqueada', backendMessage || 'No se puede eliminar este tipo de evento porque está siendo utilizado por el sistema');
        }
        return { success: false, error: backendMessage };
      } else {
        const errorMessage = error.response?.data?.message || error.response?.data?.details || 'Error al eliminar el tipo de evento';
        showErrorAlert('Error del Sistema', errorMessage);
        return { success: false, error: errorMessage };
      }
    }
  }, [fetchTiposEvento, tiposEvento]);

  return {
    tiposEvento,
    loading,
    error,
    fetchTiposEvento,
    handleCreateTipoEvento,
    handleUpdateTipoEvento,
    handleDeleteTipoEvento,
    setTiposEvento
  };
};

