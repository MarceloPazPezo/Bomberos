import { useState, useEffect } from 'react';

/**
 * Hook para manejar los modos de vista (list/cards) del panel de administración
 * @returns {Object} - Estados y funciones para manejar modos de vista
 */
export const useViewModes = () => {
  // Detectar tamaño de pantalla para vista por defecto de bomberos
  const getDefaultBomberosView = () => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 960 ? 'cards' : 'list';
    }
    return 'list';
  };

  const [bomberosViewMode, setBomberosViewMode] = useState(getDefaultBomberosView());
  const [rolesViewMode, setRolesViewMode] = useState('cards');

  // Manejar cambios de tamaño de ventana para vista responsiva
  useEffect(() => {
    const handleResize = () => {
      const newViewMode = window.innerWidth < 960 ? 'cards' : 'list';
      setBomberosViewMode(newViewMode);
    };

    // Agregar listener para cambios de tamaño
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return {
    bomberosViewMode,
    setBomberosViewMode,
    rolesViewMode,
    setRolesViewMode
  };
};