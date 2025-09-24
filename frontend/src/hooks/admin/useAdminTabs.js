import { useState, useCallback } from 'react';

/**
 * Hook personalizado para manejar la navegación entre pestañas de administración
 * @param {Function} hasPermiso - Función para verificar permisos
 * @returns {Object} - Estado y funciones para manejar pestañas
 */
export const useAdminTabs = (hasPermiso) => {
  // Configuración de pestañas disponibles y sus permisos requeridos
  const tabsConfig = [
    {
      id: 'bomberos',
      label: 'Bomberos',
      icon: 'MdPeople',
      permissions: ['bombero:obtener'],
      description: 'Gestionar información de bomberos',
      color: '#3B82F6'
    },
    {
      id: 'roles',
      label: 'Roles',
      icon: 'MdSecurity',
      permissions: ['rol:obtener'],
      description: 'Administrar roles y permisos',
      color: '#8B5CF6'
    },
    {
      id: 'permisos',
      label: 'Permisos',
      icon: 'MdVpnKey',
      permissions: ['permiso:obtener'],
      description: 'Gestionar permisos del sistema',
      color: '#F59E0B'
    },
    {
      id: 'companias',
      label: 'Compañías',
      icon: 'MdBusiness',
      permissions: ['compania:obtener'],
      description: 'Administrar compañías de bomberos',
      color: '#10B981'
    },
    {
      id: 'direcciones',
      label: 'Direcciones',
      icon: 'MdLocationOn',
      permissions: ['region:obtener', 'comuna:obtener'],
      description: 'Gestionar regiones y comunas',
      color: '#EF4444'
    }
  ];

  // Obtener pestañas disponibles según permisos
  const availableTabs = tabsConfig.filter(tab => 
    tab.permissions.some(permission => hasPermiso(permission))
  );

  // Estado para la pestaña activa
  const [activeTab, setActiveTab] = useState(() => {
    // Establecer la primera pestaña disponible como activa por defecto
    return availableTabs.length > 0 ? availableTabs[0].id : null;
  });

  // Función para cambiar pestaña activa con validación
  const handleTabChange = useCallback((tabId) => {
    const isTabAvailable = availableTabs.some(tab => tab.id === tabId);
    if (isTabAvailable) {
      setActiveTab(tabId);
      
      // Opcional: Guardar en localStorage para persistencia
      try {
        localStorage.setItem('admin_active_tab', tabId);
      } catch (error) {
        console.warn('No se pudo guardar la pestaña activa en localStorage:', error);
      }
    } else {
      console.warn(`Intento de cambiar a pestaña no disponible: ${tabId}`);
    }
  }, [availableTabs]);

  // Función para obtener la configuración de una pestaña específica
  const getTabConfig = useCallback((tabId) => {
    return tabsConfig.find(tab => tab.id === tabId);
  }, []);

  // Función para verificar si una pestaña está disponible
  const isTabAvailable = useCallback((tabId) => {
    return availableTabs.some(tab => tab.id === tabId);
  }, [availableTabs]);

  // Función para obtener la pestaña anterior/siguiente
  const getAdjacentTab = useCallback((direction = 'next') => {
    const currentIndex = availableTabs.findIndex(tab => tab.id === activeTab);
    if (currentIndex === -1) return null;

    let newIndex;
    if (direction === 'next') {
      newIndex = (currentIndex + 1) % availableTabs.length;
    } else {
      newIndex = currentIndex === 0 ? availableTabs.length - 1 : currentIndex - 1;
    }

    return availableTabs[newIndex];
  }, [availableTabs, activeTab]);

  // Función para navegar a la pestaña siguiente/anterior
  const navigateTab = useCallback((direction = 'next') => {
    const adjacentTab = getAdjacentTab(direction);
    if (adjacentTab) {
      handleTabChange(adjacentTab.id);
    }
  }, [getAdjacentTab, handleTabChange]);

  // Restaurar pestaña activa desde localStorage si existe
  const restoreActiveTab = useCallback(() => {
    try {
      const savedTab = localStorage.getItem('admin_active_tab');
      if (savedTab && isTabAvailable(savedTab)) {
        setActiveTab(savedTab);
      }
    } catch (error) {
      console.warn('No se pudo restaurar la pestaña activa desde localStorage:', error);
    }
  }, [isTabAvailable]);

  return {
    // Estado
    activeTab,
    availableTabs,
    tabsConfig,

    // Funciones principales
    setActiveTab: handleTabChange,
    handleTabChange,

    // Funciones de utilidad
    getTabConfig,
    isTabAvailable,
    getAdjacentTab,
    navigateTab,
    restoreActiveTab,

    // Información útil
    hasAvailableTabs: availableTabs.length > 0,
    totalAvailableTabs: availableTabs.length
  };
};