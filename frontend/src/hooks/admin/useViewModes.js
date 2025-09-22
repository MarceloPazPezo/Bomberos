import { useState } from 'react';

/**
 * Hook personalizado para manejar múltiples modos de vista
 * Útil para componentes que necesitan alternar entre diferentes vistas
 */
export const useViewModes = () => {
  const [bomberosViewMode, setBomberosViewMode] = useState('table');
  const [rolesViewMode, setRolesViewMode] = useState('grid');
  const [permisosViewMode, setPermisosViewMode] = useState('categories');
  const [companiasViewMode, setCompaniasViewMode] = useState('grid');
  const [direccionesViewMode, setDireccionesViewMode] = useState('list');

  // Función genérica para cambiar modo de vista
  const setViewMode = (section, mode) => {
    switch (section) {
      case 'bomberos':
        setBomberosViewMode(mode);
        break;
      case 'roles':
        setRolesViewMode(mode);
        break;
      case 'permisos':
        setPermisosViewMode(mode);
        break;
      case 'companias':
        setCompaniasViewMode(mode);
        break;
      case 'direcciones':
        setDireccionesViewMode(mode);
        break;
      default:
        console.warn(`Modo de vista no reconocido para la sección: ${section}`);
    }
  };

  // Función para obtener el modo de vista actual
  const getViewMode = (section) => {
    switch (section) {
      case 'bomberos':
        return bomberosViewMode;
      case 'roles':
        return rolesViewMode;
      case 'permisos':
        return permisosViewMode;
      case 'companias':
        return companiasViewMode;
      case 'direcciones':
        return direccionesViewMode;
      default:
        return 'table';
    }
  };

  // Función para resetear todos los modos de vista
  const resetViewModes = () => {
    setBomberosViewMode('table');
    setRolesViewMode('grid');
    setPermisosViewMode('categories');
    setCompaniasViewMode('grid');
    setDireccionesViewMode('list');
  };

  return {
    // Estados individuales (compatibilidad hacia atrás)
    bomberosViewMode,
    setBomberosViewMode,
    rolesViewMode,
    setRolesViewMode,
    permisosViewMode,
    setPermisosViewMode,
    companiasViewMode,
    setCompaniasViewMode,
    direccionesViewMode,
    setDireccionesViewMode,
    
    // Funciones genéricas
    setViewMode,
    getViewMode,
    resetViewModes
  };
};