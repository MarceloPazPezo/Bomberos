import { useState, useMemo, useEffect } from 'react';

/**
 * Hook para manejar las pestañas del panel de administración
 * @param {Function} hasPermiso - Función para verificar permisos
 * @returns {Object} - Estado y funciones para manejar pestañas
 */
export const useAdminTabs = (hasPermiso) => {
  const [activeTab, setActiveTab] = useState('');

  // Determinar pestañas disponibles basadas en permisos
  const availableTabs = useMemo(() => {
    const tabs = [];
    if (hasPermiso('bombero:leer')) tabs.push('bomberos');
    if (hasPermiso('rol:leer')) tabs.push('roles');
    if (hasPermiso('permiso:leer')) tabs.push('permisos');
    if (hasPermiso('configuracion:leer')) tabs.push('configuraciones');
    return tabs;
  }, [hasPermiso]);

  // Establecer la primera pestaña disponible si no hay una activa válida
  useEffect(() => {
    if (availableTabs.length > 0 && (!activeTab || !availableTabs.includes(activeTab))) {
      setActiveTab(availableTabs[0]);
    }
  }, [availableTabs, activeTab]);

  return { 
    availableTabs, 
    activeTab, 
    setActiveTab 
  };
};