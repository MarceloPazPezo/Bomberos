import { useState } from 'react';
import { getBomberos, createBombero, updateBombero, deleteBombero, changeBomberoEstado } from '@services/bombero.service.js';
import { showErrorAlert, showSuccessAlert } from '@helpers/sweetAlert.js';

export const useBomberos = () => {
  const [bomberos, setBomberos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastFetchTime, setLastFetchTime] = useState(0);

  // Función para obtener todos los bomberos
  const fetchBomberos = async (force = false) => {
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
      const response = await getBomberos();

      if (Array.isArray(response)) {
        setBomberos(response);
      } else if (response.status === 'Error') {
        console.error('Error en la respuesta:', response.message);
        setError(response.message || 'Error al cargar bomberos');
      } else {
        console.error('Respuesta inesperada:', response);
        setError('Error al cargar bomberos');
      }
      setLastFetchTime(now);
    } catch (error) {
      console.error('Error fetching bomberos:', error);
      setError('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  // Función para crear un nuevo bombero
  const handleCreateBombero = async (bomberoData) => {
    try {
      const response = await createBombero(bomberoData);

      if (response.status === 'Success') {
        showSuccessAlert('¡Éxito!', 'Bombero creado correctamente');
        await fetchBomberos(true); // Recargar la lista
        return { success: true, data: response.data };
      } else {
        // Verificar si hay errores específicos por campo
        if (response.details && Array.isArray(response.details)) {
          // Convertir los errores del backend al formato esperado por el frontend
          const fieldErrors = {};
          response.details.forEach(detail => {
            const fieldName = detail.path || detail.key;
            if (fieldName) {
              fieldErrors[fieldName] = detail.message;
            }
          });

          // Si hay errores específicos por campo, no mostrar SweetAlert
          if (Object.keys(fieldErrors).length > 0) {
            return { success: false, error: fieldErrors };
          }
        }

        // Verificar si el mensaje es un objeto con errores específicos por campo (duplicados)
        if (response.message && typeof response.message === 'object') {
          // Si hay errores específicos por campo, no mostrar SweetAlert
          return { success: false, error: response.message };
        }

        // Si no hay errores específicos por campo, mostrar SweetAlert
        showErrorAlert('Error', response.message || 'Error al crear el bombero');
        return { success: false, error: response.message };
      }
    } catch (error) {
      console.error('Error creating bombero:', error);
      const errorMessage = error.response?.data?.message || 'Error al crear el bombero';
      showErrorAlert('Error', errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Función para actualizar un bombero
  const handleUpdateBombero = async (bomberoData, run) => {
    try {
      const response = await updateBombero(bomberoData, run);

      if (response.status === 'Success' || response.run) {
        showSuccessAlert('¡Éxito!', 'Bombero actualizado correctamente');
        await fetchBomberos(true); // Recargar la lista
        return { success: true, data: response };
      } else {
        showErrorAlert('Error', response.message || 'Error al actualizar el bombero');
        return { success: false, error: response.message };
      }
    } catch (error) {
      console.error('Error updating bombero:', error);
      const errorMessage = error.response?.data?.message || 'Error al actualizar el bombero';
      showErrorAlert('Error', errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Función para eliminar un bombero
  const handleDeleteBombero = async (run) => {
    try {
      const response = await deleteBombero(run);

      if (response.status === 'Success') {
        showSuccessAlert('¡Éxito!', 'Bombero eliminado correctamente');
        await fetchBomberos(true); // Recargar la lista
        return { success: true };
      } else {
        showErrorAlert('Error', response.message || 'Error al eliminar el bombero');
        return { success: false, error: response.message };
      }
    } catch (error) {
      console.error('Error deleting bombero:', error);
      const errorMessage = error.response?.data?.message || 'Error al eliminar el bombero';
      showErrorAlert('Error', errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Función para cambiar el estado activo de un bombero
  const handleChangeBomberoEstado = async (idBombero, activo) => {
    try {
      const response = await changeBomberoEstado(idBombero, activo);

      if (response.status === 'Success') {
        const statusText = activo ? 'activado' : 'desactivado';
        showSuccessAlert('¡Éxito!', `Bombero ${statusText} correctamente`);
        await fetchBomberos(true); // Recargar la lista
        return { success: true, data: response.data };
      } else {
        showErrorAlert('Error', response.message || 'Error al cambiar el estado del bombero');
        return { success: false, error: response.message };
      }
    } catch (error) {
      console.error('Error changing bombero status:', error);
      const errorMessage = error.response?.data?.message || 'Error al cambiar el estado del bombero';
      showErrorAlert('Error', errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  return {
    bomberos,
    loading,
    error,
    fetchBomberos,
    handleCreateBombero,
    handleUpdateBombero,
    handleDeleteBombero,
    handleChangeBomberoEstado,
    setBomberos
  };
};