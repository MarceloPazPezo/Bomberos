import { useState, useEffect } from 'react';
import { getMyProfile, updateMyProfile, changePassword } from '@services/perfil.service';
import { useAuth } from '@hooks/auth/useAuth';

export const useProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [updating, setUpdating] = useState(false);
  const { user, updateUser } = useAuth();

  // Cargar perfil inicial
  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      setFieldErrors({});
      const response = await getMyProfile();
      if (response.status === 'Success') {
        setProfile(response.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar el perfil');
    } finally {
      setLoading(false);
    }
  };

  // Limpiar error de un campo específico
  const clearFieldError = (fieldName) => {
    if (fieldErrors[fieldName]) {
      setFieldErrors(prev => ({ ...prev, [fieldName]: null }));
    }
  };

  // Actualizar perfil
  const updateProfile = async (profileData) => {
    try {
      setUpdating(true);
      setError(null);
      setFieldErrors({});
      const response = await updateMyProfile(profileData);
      if (response.status === 'Success') {
        setProfile(response.data);
        // Actualizar también el contexto de autenticación conservando roles y permisos
        if (updateUser && user) {
          // Combinar los datos actualizados con los roles y permisos existentes
          const updatedUserData = {
            ...response.data,
            // Conservar roles y permisos del usuario actual si no vienen en la respuesta
            roles: response.data.roles || user.roles || [],
            permissions: response.data.permissions || user.permissions || []
          };
          updateUser(updatedUserData);
        }
        return { success: true, data: response.data };
      }
    } catch (err) {
      // Manejar errores de validación por campo
      if (err.response?.data?.details && typeof err.response.data.details === 'object') {
        setFieldErrors(err.response.data.details);
        return { success: false, fieldErrors: err.response.data.details };
      } else {
        const errorMessage = err.response?.data?.message || 'Error al actualizar el perfil';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    } finally {
      setUpdating(false);
    }
  };

  // Cambiar contraseña
  const updatePassword = async (passwordData) => {
    try {
      setUpdating(true);
      setError(null);
      setFieldErrors({});
      const response = await changePassword(passwordData);
      if (response.status === 'Success') {
        return { success: true, message: 'Contraseña actualizada correctamente' };
      }
    } catch (err) {
      // Manejar errores de validación por campo para contraseñas
      if (err.response?.data?.details && typeof err.response.data.details === 'object') {
        setFieldErrors(err.response.data.details);
        return { success: false, fieldErrors: err.response.data.details };
      } else {
        const errorMessage = err.response?.data?.message || 'Error al cambiar la contraseña';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    } finally {
      setUpdating(false);
    }
  };

  // Cargar perfil al montar el componente
  useEffect(() => {
    fetchProfile();
  }, []);

  return {
    profile,
    loading,
    error,
    fieldErrors,
    updating,
    fetchProfile,
    updateProfile,
    updatePassword,
    setError,
    setFieldErrors,
    clearFieldError
  };
};