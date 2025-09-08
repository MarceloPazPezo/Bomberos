import { useState, useEffect } from 'react';
import { getPermisos } from '@services/permiso.service.js';
import { showErrorAlert } from '@helpers/sweetAlert.js';

const usePermisos = () => {
  const [permisos, setPermisos] = useState([]);
  const [permisosByCategory, setPermisosByCategory] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastFetchTime, setLastFetchTime] = useState(0);

  const fetchPermisos = async (force = false) => {
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
      const response = await getPermisos();
      
      if (response.status === 'Success') {
        const permisos = response.data || [];
        setPermisos(permisos);
        
        // Agrupar permisos por categoría localmente
        const grouped = {};
        permisos.forEach(permiso => {
          const category = permiso.categoria || 'Sin categoría';
          if (!grouped[category]) {
            grouped[category] = [];
          }
          grouped[category].push(permiso);
        });
        setPermisosByCategory(grouped);
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

  const refreshPermisos = (force = false) => {
    fetchPermisos(force);
  };

  const refreshPermisosByCategory = (force = false) => {
    fetchPermisos(force); // Misma función ya que agrupamos localmente
  };

  const refreshPermisosList = (force = false) => {
    fetchPermisos(force);
  };

  // No cargar automáticamente - la carga se controla desde el componente padre

  return {
    permisos,
    permisosByCategory,
    loading,
    error,
    refreshPermisos,
    refreshPermisosByCategory,
    refreshPermisosList,
  };
};

export default usePermisos;