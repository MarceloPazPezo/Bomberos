import { useState } from 'react';
import { 
  getDisponibilidades, 
  createDisponibilidad, 
  updateDisponibilidad, 
  deleteDisponibilidad, 
  cerrarDisponibilidad,
  getDisponibilidadActiva
} from '@services/disponibilidad.service.js';
import { showErrorAlert } from '@helpers/sweetAlert.js';
import { disponibilidadCreatedToast, disponibilidadUpdatedToast, disponibilidadClosedToast } from '@helpers/toastHelper.jsx';

export const useDisponibilidad = () => {
  const [disponibilidades, setDisponibilidades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastFetchTime, setLastFetchTime] = useState(0);

  // Función para obtener todas las disponibilidades
  const fetchDisponibilidades = async (force = false) => {
    // Evitar múltiples llamadas en un corto período de tiempo
    const now = Date.now();
    if (!force && loading) {
      return;
    }
    if (!force && now - lastFetchTime < 2000) {
      return;
    }

    // Prevenir bucles infinitos
    if (loading) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await getDisponibilidades();

      if (Array.isArray(response)) {
        setDisponibilidades(response);
      } else if (response.status === 'Error') {
        console.error('Error en la respuesta:', response.message);
        setError(response.message || 'Error al cargar disponibilidades');
      } else {
        console.error('Respuesta inesperada:', response);
        setError('Error al cargar disponibilidades');
      }
      setLastFetchTime(now);
    } catch (error) {
      console.error('Error fetching disponibilidades:', error);
      setError('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  // Función para crear una nueva disponibilidad
  const handleCreateDisponibilidad = async (disponibilidadData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await createDisponibilidad(disponibilidadData);

      if (response.status === 'Success') {
        disponibilidadCreatedToast('Disponibilidad creada correctamente');
        await fetchDisponibilidades(true);
        return { success: true, data: response.data };
      } else {
        setError(response.message || 'Error al crear disponibilidad');
        await showErrorAlert('Error', response.message || 'Error al crear disponibilidad');
        return { success: false, error: response.message };
      }
    } catch (error) {
      console.error('Error creating disponibilidad:', error);
      const errorMessage = error.message || 'Error al crear disponibilidad';
      setError(errorMessage);
      await showErrorAlert('Error', errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Función para actualizar una disponibilidad existente
  const handleUpdateDisponibilidad = async (id, disponibilidadData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await updateDisponibilidad(id, disponibilidadData);

      if (response.status === 'Success') {
        disponibilidadUpdatedToast('Disponibilidad actualizada correctamente');
        await fetchDisponibilidades(true);
        return { success: true, data: response.data };
      } else {
        setError(response.message || 'Error al actualizar disponibilidad');
        await showErrorAlert('Error', response.message || 'Error al actualizar disponibilidad');
        return { success: false, error: response.message };
      }
    } catch (error) {
      console.error('Error updating disponibilidad:', error);
      const errorMessage = error.message || 'Error al actualizar disponibilidad';
      setError(errorMessage);
      await showErrorAlert('Error', errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Función para eliminar una disponibilidad
  const handleDeleteDisponibilidad = async (id) => {
    try {
      setLoading(true);
      setError(null);
      const response = await deleteDisponibilidad(id);

      if (response.status === 'Success') {
        fireSuccessToast('Disponibilidad eliminada correctamente');
        await fetchDisponibilidades(true);
        return { success: true };
      } else {
        setError(response.message || 'Error al eliminar disponibilidad');
        await showErrorAlert('Error', response.message || 'Error al eliminar disponibilidad');
        return { success: false, error: response.message };
      }
    } catch (error) {
      console.error('Error deleting disponibilidad:', error);
      const errorMessage = error.message || 'Error al eliminar disponibilidad';
      setError(errorMessage);
      await showErrorAlert('Error', errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Función para cerrar disponibilidad activa de un bombero
  const handleCerrarDisponibilidad = async (idBombero) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await cerrarDisponibilidad({ idBombero });

      if (response.status === 'Success') {
        disponibilidadClosedToast('Disponibilidad cerrada correctamente');
        await fetchDisponibilidades(true);
        return { success: true, data: response.data };
      } else {
        setError(response.message || 'Error al cerrar disponibilidad');
        await showErrorAlert('Error', response.message || 'Error al cerrar disponibilidad');
        return { success: false, error: response.message };
      }
    } catch (error) {
      console.error('Error closing disponibilidad:', error);
      const errorMessage = error.message || 'Error al cerrar disponibilidad';
      setError(errorMessage);
      await showErrorAlert('Error', errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Función para obtener disponibilidad activa de un bombero
  const handleGetDisponibilidadActiva = async (idBombero) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await getDisponibilidadActiva(idBombero);

      if (response.status === 'Success') {
        return { success: true, data: response.data };
      } else {
        setError(response.message || 'Error al obtener disponibilidad activa');
        return { success: false, error: response.message };
      }
    } catch (error) {
      console.error('Error getting disponibilidad activa:', error);
      const errorMessage = error.message || 'Error al obtener disponibilidad activa';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Función para resetear errores
  const clearError = () => {
    setError(null);
  };

  return {
    disponibilidades,
    loading,
    error,
    fetchDisponibilidades,
    handleCreateDisponibilidad,
    handleUpdateDisponibilidad,
    handleDeleteDisponibilidad,
    handleCerrarDisponibilidad,
    handleGetDisponibilidadActiva,
    clearError
  };
};

export default useDisponibilidad;
