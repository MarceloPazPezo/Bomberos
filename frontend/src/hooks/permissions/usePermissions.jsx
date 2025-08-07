import { useState, useEffect } from 'react';
import { getPermissions, getPermissionsByCategory } from '@services/permission.service.js';
import { showErrorAlert } from '@helpers/sweetAlert.js';

const usePermissions = () => {
  const [permissions, setPermissions] = useState([]);
  const [permissionsByCategory, setPermissionsByCategory] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastFetchTime, setLastFetchTime] = useState(0);

  const fetchPermissions = async (force = false) => {
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
      const response = await getPermissions();
      
      if (response.status === 'Success') {
        setPermissions(response.data?.permissions || []);
      } else {
        setError(response.message || 'Error al cargar permisos');
      }
      setLastFetchTime(now);
    } catch (error) {
      setError('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const fetchPermissionsByCategory = async (force = false) => {
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
      const response = await getPermissionsByCategory();
      
      if (response.status === 'Success') {
        setPermissionsByCategory(response.data || {});
      } else {
        setError(response.message || 'Error al cargar permisos por categoría');
      }
      setLastFetchTime(now);
    } catch (error) {
      setError('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const refreshPermissions = (force = false) => {
    fetchPermissions(force);
    fetchPermissionsByCategory(force);
  };

  // Cargar permisos automáticamente al montar el componente
  useEffect(() => {
    refreshPermissions();
  }, []);

  return {
    permissions,
    permissionsByCategory,
    loading,
    error,
    refreshPermissions,
  };
};

export default usePermissions;