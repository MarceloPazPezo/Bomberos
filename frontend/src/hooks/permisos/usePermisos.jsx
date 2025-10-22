import { useState, useCallback, useRef } from 'react';
import { getPermisos } from '@services/permiso.service.js';
import { showErrorAlert } from '@helpers/sweetAlert.js';

const usePermisos = () => {
  const [permisos, setPermisos] = useState([]);
  const [permisosByCategory, setPermisosByCategory] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [initialized, setInitialized] = useState(false);
  
  // Usar useRef para variables que no necesitan causar re-renders
  const lastFetchTimeRef = useRef(0);
  const loadingRef = useRef(false);

  const fetchPermisos = useCallback(async (force = false) => {
    // Evitar múltiples llamadas en un corto período de tiempo
    const now = Date.now();
    if (!force && loadingRef.current) {
      return;
    }
    if (!force && now - lastFetchTimeRef.current < 2000) {
      return;
    }

    try {
      setLoading(true);
      loadingRef.current = true;
      setError(null);
      const response = await getPermisos();
      
      
      if (response.status === 'Success') {
        const responseData = response.data || [];
        
        
        // Manejar tanto array directo como estructura paginada
        let permisos2;
        if (Array.isArray(responseData)) {
          // Array directo
          permisos2 = responseData;
        } else if (responseData.permisos && Array.isArray(responseData.permisos)) {
          // Estructura paginada: { permisos: [...], pagination: {...} }
          permisos2 = responseData.permisos;
        } else {
          setPermisos([]);
          setPermisosByCategory({});
          setError('Formato de datos incorrecto');
          setInitialized(true);
          return;
        }
        
        // Validar que permisos2 sea un array
        if (Array.isArray(permisos2)) {
          setPermisos(permisos2);
          
          // Agrupar permisos por categoría localmente
          const grouped = {};
          permisos2.forEach(permiso => {
            const category = permiso.categoria || 'Sin categoría';
            if (!grouped[category]) {
              grouped[category] = [];
            }
            grouped[category].push(permiso);
          });
          
          setPermisosByCategory(grouped);
          setInitialized(true);
        } else {
          setPermisos([]);
          setPermisosByCategory({});
          setError('Formato de datos incorrecto');
          setInitialized(true);
        }
      } else if (response.status === 'Error') {
        setError(response.message || 'Error al cargar permisos');
        setInitialized(true);
      } else {
        setError('Error al cargar permisos');
        setInitialized(true);
      }
      lastFetchTimeRef.current = now;
    } catch (error) {
      setError('Error al conectar con el servidor');
      setInitialized(true);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, []); // Sin dependencias para evitar bucles infinitos

  const refreshPermisos = useCallback((force = false) => {
    fetchPermisos(force);
  }, []); // Sin dependencias para evitar bucles

  const refreshPermisosByCategory = useCallback((force = false) => {
    fetchPermisos(force); // Misma función ya que agrupamos localmente
  }, []); // Sin dependencias para evitar bucles

  const refreshPermisosList = useCallback((force = false) => {
    fetchPermisos(force);
  }, []); // Sin dependencias para evitar bucles

  // No cargar automáticamente - la carga se controla desde el componente padre

  return {
    permisos,
    permisosByCategory,
    loading,
    error,
    initialized,
    refreshPermisos,
    refreshPermisosByCategory,
    refreshPermisosList,
  };
};

export default usePermisos;