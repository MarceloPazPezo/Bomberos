import { useState, useEffect } from 'react';
import { getRoles, createRole, updateRole, deleteRole } from '@services/rol.service.js';
import { showErrorAlert, showSuccessAlert } from '@helpers/sweetAlert.js';

export const useRoles = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Función para obtener todos los roles
  const [lastFetchTime, setLastFetchTime] = useState(0);

  const fetchRoles = async (force = false) => {
    const now = Date.now();
    
    // Evitar múltiples llamadas si ya está cargando (solo si no es forzado)
    if (!force && loading) {
      return;
    }
    
    // Evitar recargas muy frecuentes (solo si no es forzado)
    if (!force && now - lastFetchTime < 2000) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await getRoles();
      
      if (response.status === 'Success') {
        setRoles(response.data || []);
      } else {
        console.error('Error en la respuesta:', response.message);
        setError(response.message || 'Error al cargar roles');
      }
      setLastFetchTime(now);
    } catch (error) {
      console.error('Error fetching roles:', error);
      setError('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  // Función para crear un nuevo rol
  const handleCreateRole = async (roleData) => {
    try {
      const response = await createRole(roleData);
      
      if (response.status === 'Success') {
        showSuccessAlert('¡Éxito!', 'Rol creado correctamente');
        await fetchRoles(); // Recargar la lista
        return { success: true, data: response.data };
      } else {
        showErrorAlert('Error', response.message || 'Error al crear el rol');
        return { success: false, error: response.message };
      }
    } catch (error) {
      console.error('Error creating role:', error);
      const errorMessage = error.response?.data?.message || 'Error al crear el rol';
      showErrorAlert('Error', errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Función para actualizar un rol
  const handleUpdateRole = async (id, roleData) => {
    try {
      const response = await updateRole(id, roleData);
      
      if (response.status === 'Success') {
        showSuccessAlert('¡Éxito!', 'Rol actualizado correctamente');
        await fetchRoles(); // Recargar la lista
        return { success: true, data: response.data };
      } else {
        showErrorAlert('Error', response.message || 'Error al actualizar el rol');
        return { success: false, error: response.message };
      }
    } catch (error) {
      console.error('Error updating role:', error);
      const errorMessage = error.response?.data?.message || 'Error al actualizar el rol';
      showErrorAlert('Error', errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Función para eliminar un rol
  const handleDeleteRole = async (id) => {
    try {
      const response = await deleteRole(id);
      
      if (response.status === 'Success') {
        showSuccessAlert('¡Éxito!', 'Rol eliminado correctamente');
        await fetchRoles(); // Recargar la lista
        return { success: true };
      } else {
        showErrorAlert('Error', response.message || 'Error al eliminar el rol');
        return { success: false, error: response.message };
      }
    } catch (error) {
      console.error('Error deleting role:', error);
      const errorMessage = error.response?.data?.message || 'Error al eliminar el rol';
      showErrorAlert('Error', errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // No cargar automáticamente - la carga se controla desde el componente padre

  return {
    roles,
    loading,
    error,
    fetchRoles,
    handleCreateRole,
    handleUpdateRole,
    handleDeleteRole,
    setRoles
  };
};