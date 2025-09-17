import { useState, useCallback, useRef } from 'react';
import { getBomberos, createBombero, updateBombero, deleteBombero, changeBomberoEstado } from '@services/bombero.service.js';
import { showErrorAlert, showSuccessAlert } from '@helpers/sweetAlert.js';

export const useBomberos = () => {
  const [bomberos, setBomberos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Usar useRef para variables que no necesitan causar re-renders
  const lastFetchTimeRef = useRef(0);
  const loadingRef = useRef(false);

  // Función para obtener todos los bomberos
  const fetchBomberos = useCallback(async (force = false) => {
    // Evitar múltiples llamadas en un corto período de tiempo
    const now = Date.now();
    if (!force && loadingRef.current) {
      return;
    }
    if (!force && now - lastFetchTimeRef.current < 2000) {
      return;
    }

    // Prevenir bucles infinitos
    if (loadingRef.current) {
      return;
    }

    try {
      setLoading(true);
      loadingRef.current = true;
      setError(null);
      const response = await getBomberos();

      // Manejar tanto array directo como respuesta con status
      if (Array.isArray(response)) {
        // Array directo
        setBomberos(response);
      } else if (response.status === 'Success') {
        // Respuesta con status
        const responseData = response.data || [];
        
        // Manejar tanto array directo como estructura paginada
        let bomberos2;
        if (Array.isArray(responseData)) {
          // Array directo
          bomberos2 = responseData;
        } else if (responseData.bomberos && Array.isArray(responseData.bomberos)) {
          // Estructura paginada: { bomberos: [...], pagination: {...} }
          bomberos2 = responseData.bomberos;
        } else {
          // Asumir que es array directo si no tiene estructura paginada
          bomberos2 = responseData;
        }
        
        setBomberos(Array.isArray(bomberos2) ? bomberos2 : []);
      } else if (response.status === 'Error') {
        console.error('Error en la respuesta:', response.message);
        setError(response.message || 'Error al cargar bomberos');
      } else {
        console.error('Respuesta inesperada:', response);
        setError('Error al cargar bomberos');
      }
      lastFetchTimeRef.current = now;
    } catch (error) {
      console.error('Error fetching bomberos:', error);
      setError('Error al conectar con el servidor');
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, []); // Sin dependencias para evitar bucles infinitos

  // Función para crear un nuevo bombero
  const handleCreateBombero = useCallback(async (bomberoData) => {
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
  }, []); // Sin dependencias para evitar bucles

  // Función para actualizar un bombero
  const handleUpdateBombero = useCallback(async (bomberoData, run) => {
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
  }, []); // Sin dependencias para evitar bucles

  // Función para eliminar un bombero
  const handleDeleteBombero = useCallback(async (run) => {
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
  }, []); // Sin dependencias para evitar bucles

  // Función para cambiar el estado activo de un bombero
  const handleChangeBomberoEstado = useCallback(async (idBombero, activo) => {
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
  }, []); // Sin dependencias para evitar bucles

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