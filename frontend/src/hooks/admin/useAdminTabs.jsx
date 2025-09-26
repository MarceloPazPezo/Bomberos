import { useState, useMemo, useEffect, useCallback } from 'react';

/**
 * Hook para manejar las pestañas del panel de administración
 * @param {Function} hasPermiso - Función para verificar permisos
 * @returns {Object} - Estado y funciones para manejar pestañas
 */
export const useAdminTabs = (hasPermiso) => {
  const [activeTab, setActiveTab] = useState('');

  // Determinar pestañas disponibles basadas en permisos (memoizado para evitar recálculos)
  const availableTabs = useMemo(() => {
    const tabs = [];
    if (hasPermiso('bombero:leer')) tabs.push('bomberos');
    if (hasPermiso('rol:leer')) tabs.push('roles');
    if (hasPermiso('permiso:leer')) tabs.push('permisos');
    if (hasPermiso('compania:leer')) tabs.push('companias');
    if (hasPermiso('direccion:leer') || hasPermiso('region:leer') || hasPermiso('comuna:leer')) tabs.push('direcciones');
    if (hasPermiso('configuracion:leer')) tabs.push('configuraciones');
    return tabs;
  }, [hasPermiso]);

  // Función estable para establecer pestaña activa
  const setActiveTabStable = useCallback((tab) => {
    setActiveTab(tab);
  }, []);

  // Establecer la primera pestaña disponible solo una vez al inicio
  useEffect(() => {
    if (availableTabs.length > 0 && !activeTab) {
      setActiveTab(availableTabs[0]);
    }
  }, [availableTabs]); // Removido activeTab de las dependencias para evitar bucles

  return { 
    availableTabs,
    activeTab,
    setActiveTab: setActiveTabStable
  };
};