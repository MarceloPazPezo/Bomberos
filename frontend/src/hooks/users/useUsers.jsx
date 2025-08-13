import { useState } from 'react';
import { getUsers, createUser, updateUser, deleteUser, changeUserStatus } from '@services/usuario.service.js';
import { showErrorAlert, showSuccessAlert } from '@helpers/sweetAlert.js';

export const useUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastFetchTime, setLastFetchTime] = useState(0);

  // Función para obtener todos los usuarios
  const fetchUsers = async (force = false) => {
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
      const response = await getUsers();
      
      if (Array.isArray(response)) {
        setUsers(response);
      } else if (response.status === 'Error') {
        console.error('Error en la respuesta:', response.message);
        setError(response.message || 'Error al cargar usuarios');
      } else {
        console.error('Respuesta inesperada:', response);
        setError('Error al cargar usuarios');
      }
      setLastFetchTime(now);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  // Función para crear un nuevo usuario
  const handleCreateUser = async (userData) => {
    try {
      const response = await createUser(userData);
      
      if (response.status === 'Success') {
        showSuccessAlert('¡Éxito!', 'Usuario creado correctamente');
        await fetchUsers(true); // Recargar la lista
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
        showErrorAlert('Error', response.message || 'Error al crear el usuario');
        return { success: false, error: response.message };
      }
    } catch (error) {
      console.error('Error creating user:', error);
      const errorMessage = error.response?.data?.message || 'Error al crear el usuario';
      showErrorAlert('Error', errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Función para actualizar un usuario
  const handleUpdateUser = async (userData, run) => {
    try {
      const response = await updateUser(userData, run);
      
      if (response.status === 'Success' || response.run) {
        showSuccessAlert('¡Éxito!', 'Usuario actualizado correctamente');
        await fetchUsers(true); // Recargar la lista
        return { success: true, data: response };
      } else {
        showErrorAlert('Error', response.message || 'Error al actualizar el usuario');
        return { success: false, error: response.message };
      }
    } catch (error) {
      console.error('Error updating user:', error);
      const errorMessage = error.response?.data?.message || 'Error al actualizar el usuario';
      showErrorAlert('Error', errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Función para eliminar un usuario
  const handleDeleteUser = async (run) => {
    try {
      const response = await deleteUser(run);
      
      if (response.status === 'Success') {
        showSuccessAlert('¡Éxito!', 'Usuario eliminado correctamente');
        await fetchUsers(true); // Recargar la lista
        return { success: true };
      } else {
        showErrorAlert('Error', response.message || 'Error al eliminar el usuario');
        return { success: false, error: response.message };
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      const errorMessage = error.response?.data?.message || 'Error al eliminar el usuario';
      showErrorAlert('Error', errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Función para cambiar el estado activo de un usuario
  const handleChangeUserStatus = async (userId, activo) => {
    try {
      const response = await changeUserStatus(userId, activo);
      
      if (response.status === 'Success') {
        const statusText = activo ? 'activado' : 'desactivado';
        showSuccessAlert('¡Éxito!', `Usuario ${statusText} correctamente`);
        await fetchUsers(true); // Recargar la lista
        return { success: true, data: response.data };
      } else {
        showErrorAlert('Error', response.message || 'Error al cambiar el estado del usuario');
        return { success: false, error: response.message };
      }
    } catch (error) {
      console.error('Error changing user status:', error);
      const errorMessage = error.response?.data?.message || 'Error al cambiar el estado del usuario';
      showErrorAlert('Error', errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  return {
    users,
    loading,
    error,
    fetchUsers,
    handleCreateUser,
    handleUpdateUser,
    handleDeleteUser,
    handleChangeUserStatus,
    setUsers
  };
};