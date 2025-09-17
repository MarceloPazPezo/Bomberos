import { useState, useCallback, useRef } from 'react';
import { getRoles, createRole, updateRole, deleteRole } from '@services/rol.service.js';
import { 
  roleCreatedToast,
  roleDeletedToast,
  roleUpdatedToast
} from '@helpers/toastHelper.js';
import { 
  showErrorAlert,
  showConflictAlert,
  showSecurityAlert,
  showInfoAlert 
} from '@helpers/fireAlert.js';

export const useRoles = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Usar useRef para variables que no necesitan causar re-renders
  const lastFetchTimeRef = useRef(0);
  const loadingRef = useRef(false);

  // Función para obtener todos los roles
  const fetchRoles = useCallback(async (force = false) => {
    const now = Date.now();
    
    // Evitar múltiples llamadas si ya está cargando (solo si no es forzado)
    if (!force && loadingRef.current) {
      console.log('Ya se están cargando roles, evitando duplicación');
      return;
    }
    
    // Evitar recargas muy frecuentes (solo si no es forzado)
    if (!force && now - lastFetchTimeRef.current < 2000) {
      console.log('Evitando recarga muy frecuente de roles');
      return;
    }

    try {
      setLoading(true);
      loadingRef.current = true;
      setError(null);
      console.log('Cargando roles...');
      const response = await getRoles();
      
      if (response.status === 'Success') {
        const responseData = response.data || [];
        
        // Manejar tanto array directo como estructura paginada
        let roles2;
        if (Array.isArray(responseData)) {
          // Array directo
          roles2 = responseData;
        } else if (responseData.roles && Array.isArray(responseData.roles)) {
          // Estructura paginada: { roles: [...], pagination: {...} }
          roles2 = responseData.roles;
        } else {
          // Asumir que es array directo si no tiene estructura paginada
          roles2 = responseData;
        }
        
        setRoles(Array.isArray(roles2) ? roles2 : []);
      } else if (response.status === 'Error') {
        console.error('Error en la respuesta:', response.message);
        setError(response.message || 'Error al cargar roles');
      } else {
        // Respuesta inesperada del servidor
        console.error('Respuesta inesperada:', response);
        setError('Error al cargar roles');
      }
      lastFetchTimeRef.current = now;
    } catch (error) {
      console.error('Error fetching roles:', error);
      setError('Error al conectar con el servidor');
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, []); // Sin dependencias para evitar bucles infinitos

  // Función para crear un nuevo rol
  const handleCreateRole = useCallback(async (roleData) => {
    try {
      const response = await createRole(roleData);
      
      if (response.status === 'Success') {
        roleCreatedToast(); // ✅ Toast para éxito
        await fetchRoles(true); // Recargar la lista
        return { success: true, data: response.data };
      } else {
        showErrorAlert('Error al Crear Rol', response.message || 'Error al crear el rol'); // ❌ FireAlert para error
        return { success: false, error: response.message };
      }
    } catch (error) {
      console.error('Error creating role:', error);
      const errorMessage = error.response?.data?.message || 'Error al crear el rol';
      showErrorAlert('Error del Sistema', errorMessage); // ❌ FireAlert para error
      return { success: false, error: errorMessage };
    }
  }, [fetchRoles]);

  // Función para actualizar un rol
  const handleUpdateRole = useCallback(async (id, roleData) => {
    try {
      const response = await updateRole(id, roleData);
      
      if (response.status === 'Success') {
        roleUpdatedToast(); // ✅ Toast para éxito
        await fetchRoles(true); // Recargar la lista
        return { success: true, data: response.data };
      } else {
        showErrorAlert('Error al Actualizar Rol', response.message || 'Error al actualizar el rol'); // ❌ FireAlert para error
        return { success: false, error: response.message };
      }
    } catch (error) {
      console.error('Error updating role:', error);
      const errorMessage = error.response?.data?.message || 'Error al actualizar el rol';
      showErrorAlert('Error del Sistema', errorMessage); // ❌ FireAlert para error
      return { success: false, error: errorMessage };
    }
  }, [fetchRoles]);

  // Función para eliminar un rol
  const handleDeleteRole = useCallback(async (id) => {
    try {      
      // Verificar que el rol aún existe en la lista local
      const roleExists = roles.find(role => role.id === id);
      if (!roleExists) {
        showErrorAlert('Rol No Encontrado', 'El rol no existe o ya fue eliminado de la lista');
        return { success: false, error: 'Rol no encontrado en la lista' };
      }
      
      const response = await deleteRole(id);
      
      if (response.status === 'Success') {
        roleDeletedToast();
        await fetchRoles(true);
        return { success: true };
      } else {
        // Manejo de errores en respuesta directa
        let errorMessage = response.message || 'Error al eliminar el rol';
        
        // Si el mensaje indica que está asignado a bomberos
        if (response.message && response.message.includes('porque está asignado a')) {
          const roleNameMatch = response.message.match(/rol "([^"]+)"/);
          const bomberoCountMatch = response.message.match(/(\d+) bombero/);
          
          const roleName = roleNameMatch ? roleNameMatch[1] : 'este rol';
          const bomberoCount = bomberoCountMatch ? parseInt(bomberoCountMatch[1]) : 1;
          const bomberoText = bomberoCount === 1 ? 'bombero' : 'bomberos';
          
          showConflictAlert(
            'Operación Bloqueada',
            `El rol "${roleName}" está actualmente asignado a ${bomberoCount} ${bomberoText}. Para eliminar este rol, primero debes reasignar o quitar el rol de todos los bomberos que lo tienen asignado.`
          );
        } else {
          showErrorAlert('Error del Sistema', errorMessage);
        }
        return { success: false, error: response.message };
      }
    } catch (error) {
      console.error('Error deleting role:', error);
      
      // Mensaje de error más específico según el código de estado
      if (error.response?.status === 404) {
        showInfoAlert('Rol No Encontrado', 'El rol no existe o ya fue eliminado. La lista se actualizará automáticamente.');
        await fetchRoles(true);
        return { success: false, error: 'Rol no encontrado' };
      } else if (error.response?.status === 403) {
        showSecurityAlert('Acceso Denegado', 'No tienes los permisos necesarios para eliminar este rol. Contacta con tu administrador.');
        return { success: false, error: 'Acceso denegado' };
      } else if (error.response?.status === 409) {
        // Error de conflicto - rol asignado a bomberos
        const backendMessage = error.response?.data?.message || error.response?.data?.details || '';
        
        // Intentar extraer información del mensaje del backend
        if (backendMessage.includes('porque está asignado a')) {
          const roleNameMatch = backendMessage.match(/rol "([^"]+)"/);
          const bomberoCountMatch = backendMessage.match(/(\d+) bombero/);
          
          const roleName = roleNameMatch ? roleNameMatch[1] : 'este rol';
          const bomberoCount = bomberoCountMatch ? parseInt(bomberoCountMatch[1]) : 1;
          const bomberoText = bomberoCount === 1 ? 'bombero' : 'bomberos';
          
          showConflictAlert(
            'Operación Bloqueada',
            `El rol "${roleName}" está actualmente asignado a ${bomberoCount} ${bomberoText}. Para eliminar este rol, primero debes reasignar o quitar el rol de todos los bomberos que lo tienen asignado.`
          );
        } else {
          showConflictAlert('Operación Bloqueada', backendMessage || 'No se puede eliminar este rol porque está siendo utilizado por el sistema');
        }
        return { success: false, error: backendMessage };
      } else {
        const errorMessage = error.response?.data?.message || error.response?.data?.details || 'Error al eliminar el rol';
        showErrorAlert('Error del Sistema', errorMessage);
        return { success: false, error: errorMessage };
      }
    }
  }, [fetchRoles, roles]);

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