import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { useAuth } from '@hooks/auth/useAuth';

const AdminContext = createContext();

/**
 * Contexto principal para la administración
 * Maneja el estado global de las pestañas y funciones comunes
 */
export const AdminProvider = ({ children }) => {
  const { hasPermiso, bomberoPermisos } = useAuth();
  const [activeTab, setActiveTab] = useState('bomberos');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Configuración de pestañas disponibles
  const tabsConfig = [
    {
      id: 'bomberos',
      label: 'Bomberos',
      description: 'Gestión de bomberos y voluntarios',
      icon: 'MdPeople',
      permissions: ['bombero:obtener', 'bombero:admin']
    },
    {
      id: 'roles',
      label: 'Roles',
      description: 'Gestión de roles del sistema',
      icon: 'MdSecurity',
      permissions: ['rol:obtener', 'rol:admin']
    },
    {
      id: 'permisos',
      label: 'Permisos',
      description: 'Gestión de permisos del sistema',
      icon: 'MdVpnKey',
      permissions: ['permiso:obtener', 'permiso:admin']
    },
    {
      id: 'companias',
      label: 'Compañías',
      description: 'Gestión de compañías',
      icon: 'MdBusiness',
      permissions: ['compania:obtener', 'compania:admin']
    },
    {
      id: 'direcciones',
      label: 'Direcciones',
      description: 'Gestión de direcciones',
      icon: 'MdLocationOn',
      permissions: ['region:obtener', 'region:admin', 'comuna:obtener', 'comuna:admin']
    },
    {
      id: 'estadoCivil',
      label: 'Estados Civiles',
      description: 'Gestión de estados civiles',
      icon: 'MdPerson',
      permissions: ['estadoCivil:obtener', 'estadoCivil:admin']
    },
    {
      id: 'servicios',
      label: 'Servicios',
      description: 'Gestión de servicios externos',
      icon: 'MdLocalHospital',
      permissions: ['servicio:obtener', 'servicio:admin']
    },
    {
      id: 'carros',
      label: 'Carros',
      description: 'Gestión de carros',
      icon: 'MdDirectionsCar',
      permissions: ['carro:obtener', 'carro:admin']
    }
  ];

  // Obtener pestañas disponibles según permisos usando hasPermiso (memoizado)
  const availableTabs = useMemo(() => {
    // Solo evaluar permisos si hay permisos disponibles
    if (!bomberoPermisos || bomberoPermisos.length === 0) {
      console.log('[DEBUG] No hay permisos disponibles');
      return [];
    }

    const filtered = tabsConfig.filter(tab => {
      const hasPermission = tab.permissions.some(permission => bomberoPermisos.includes(permission));
      console.log(`[DEBUG] Tab ${tab.id}:`, {
        permissions: tab.permissions,
        hasPermission,
        hasPermisoResults: tab.permissions.map(p => ({ permission: p, has: bomberoPermisos.includes(p) }))
      });
      return hasPermission;
    });
    
    console.log('[DEBUG] Available tabs:', filtered.map(t => t.id));
    return filtered;
  }, [bomberoPermisos]); // Solo recalcular cuando los permisos cambien

  // Función para cambiar pestaña activa
  const handleTabChange = useCallback((tabId) => {
    if (availableTabs.some(tab => tab.id === tabId)) {
      setActiveTab(tabId);
    }
  }, [availableTabs]);

  // Función para refrescar datos
  const triggerRefresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  // Función para verificar permisos específicos de una pestaña
  const hasTabPermission = useCallback((tabId, action) => {
    const permission = `${tabId.slice(0, -1)}:${action}`; // bomberos -> bombero:crear
    return hasPermiso(permission);
  }, [hasPermiso]);

  // Función para obtener configuración de una pestaña
  const getTabConfig = useCallback((tabId) => {
    return tabsConfig.find(tab => tab.id === tabId);
  }, []);

  const value = {
    // Estado
    activeTab,
    availableTabs,
    refreshTrigger,
    
    // Funciones
    handleTabChange,
    triggerRefresh,
    hasTabPermission,
    getTabConfig,
    hasPermiso,
    
    // Configuración
    tabsConfig
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};

/**
 * Hook para usar el contexto de administración
 */
export const useAdmin = () => {
  const context = useContext(AdminContext);
  
  if (!context) {
    throw new Error('useAdmin debe ser usado dentro de un AdminProvider');
  }
  
  return context;
};

export default AdminContext;