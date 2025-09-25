import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { useAuth } from '@hooks/auth/useAuth';
import { getBomberos } from '@services/bombero.service';
import { 
  getDisponibilidades
} from '@services/disponibilidad.service';
import dateHelper from '@helpers/dateHelper';
import useSocket from '../hooks/useSocket';

const DisponibilidadContext = createContext();

/**
 * Contexto principal para la gestión de disponibilidades
 * Maneja el estado global de las pestañas y funciones comunes
 */
export const DisponibilidadProvider = ({ children }) => {
  const { bombero, hasPermiso } = useAuth();
  const { on, off } = useSocket();
  
  // Estados principales
  const [activeTab, setActiveTab] = useState('marcar');
  const [disponibilidades, setDisponibilidades] = useState([]);
  const [bomberos, setBomberos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Estados específicos del tab marcar
  const [updatingMyStatus, setUpdatingMyStatus] = useState(false);
  const [miDisponibilidad, setMiDisponibilidad] = useState(null);
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaTermino, setFechaTermino] = useState('');
  const [usarFechaTermino, setUsarFechaTermino] = useState(false);
  const [autoAjustado, setAutoAjustado] = useState(false);

  // Estados para filtros del historial
  const [filtros, setFiltros] = useState({
    bombero: '',
    fechaDesde: '',
    fechaHasta: '',
    estado: 'todos',
    busqueda: ''
  });

  // Estados para paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const [registrosPorPagina] = useState(10);

  // Estadísticas
  const [stats, setStats] = useState({
    disponibles: 0,
    inactivos: 0,
    total: 0
  });

  // Configuración de pestañas disponibles
  const tabsConfig = [
    {
      id: 'marcar',
      label: 'Marcar',
      description: 'Marcar tu disponibilidad',
      icon: 'MdAdd',
      permissions: ['disponibilidad:crear']
    },
    {
      id: 'historial',
      label: 'Historial',
      description: 'Ver historial de disponibilidades',
      icon: 'MdHistory',
      permissions: ['disponibilidad:obtener']
    }
  ];

  // Obtener pestañas disponibles según permisos
  const availableTabs = tabsConfig.filter(tab => 
    tab.permissions.some(permission => hasPermiso(permission))
  );
  
  // Debug: Log de pestañas para depuración
  console.log('[DEBUG] Configuración de pestañas:', tabsConfig);
  console.log('[DEBUG] Pestañas disponibles:', availableTabs);
  console.log('[DEBUG] Pestaña activa:', activeTab);

  // Efecto para establecer la pestaña activa correcta basada en permisos
  useEffect(() => {
    if (availableTabs.length > 0) {
      // Si la pestaña actual no está disponible, cambiar a la primera disponible
      if (!availableTabs.some(tab => tab.id === activeTab)) {
        setActiveTab(availableTabs[0].id);
      }
    }
  }, [availableTabs, activeTab]);

  // Inicializar fechas por defecto
  const initializeFechas = useCallback(() => {
    const now = dateHelper.now();
    const fechaInicioStr = dateHelper.toInputFormat(now);
    setFechaInicio(fechaInicioStr);
    setFechaTermino('');
    setUsarFechaTermino(false);
    setAutoAjustado(false);
  }, []);

  // Cargar datos
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Cargar disponibilidades solo si tiene permisos
      let disponibilidadesData = [];
      if (hasPermiso('disponibilidad:obtener') || hasPermiso('disponibilidad:admin')) {
        const disponibilidadesResponse = await getDisponibilidades();
        disponibilidadesData = Array.isArray(disponibilidadesResponse) ? disponibilidadesResponse : [];
      }
      setDisponibilidades(disponibilidadesData);

      // Solo cargar bomberos si tiene permisos para leer todos los bomberos
      let bomberosData = [];
      if (hasPermiso('bombero:obtener')) {
        const bomberosResponse = await getBomberos();
        bomberosData = Array.isArray(bomberosResponse) ? bomberosResponse : [];
      }
      setBomberos(bomberosData);

      // Buscar mi disponibilidad activa
      if (bombero?.id && Array.isArray(disponibilidadesData)) {
        const miDisponibilidadActiva = disponibilidadesData.find(d => 
          d.idBombero === bombero.id && (!d.fechaTermino || new Date(d.fechaTermino) > new Date())
        );
        setMiDisponibilidad(miDisponibilidadActiva || null);
      }

      calculateStats(disponibilidadesData);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  }, [bombero?.id, hasPermiso]);

  // Calcular estadísticas
  const calculateStats = useCallback((data) => {
    const dataArray = Array.isArray(data) ? data : [];

    // Filtrar disponibilidades activas (sin fechaTermino o fechaTermino futura)
    const filteredData = dataArray
      .filter((disponibilidad) => {
        if (!disponibilidad.fechaTermino) {
          return true;
        }

        try {
          return new Date(disponibilidad.fechaTermino) > new Date();
        } catch {
          return false;
        }
      })
      .reduce((unique, disponibilidad) => {
        // Eliminar duplicados por idBombero, manteniendo el más reciente
        const existingIndex = unique.findIndex(d => d.idBombero === disponibilidad.idBombero);
        if (existingIndex === -1) {
          unique.push(disponibilidad);
        } else {
          // Si el actual es más reciente, reemplazar
          const existing = unique[existingIndex];
          const currentDate = new Date(disponibilidad.fechaInicio);
          const existingDate = new Date(existing.fechaInicio);
          
          if (currentDate > existingDate) {
            unique[existingIndex] = disponibilidad;
          }
        }
        return unique;
      }, []);

    const stats = {
      disponibles: filteredData.length,
      inactivos: dataArray.filter(d => d.fechaTermino && new Date(d.fechaTermino) <= new Date()).length,
      total: dataArray.length
    };
    setStats(stats);
  }, []);

  // Función para cambiar pestaña activa
  const handleTabChange = useCallback((tabId) => {
    if (availableTabs.some(tab => tab.id === tabId)) {
      setActiveTab(tabId);
    }
  }, [availableTabs]);

  // Función para refrescar datos
  const triggerRefresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
    loadData();
  }, [loadData]);

  // Función para obtener información del bombero
  const getBomberoInfo = useCallback((idBombero, disponibilidad = null) => {
    // Si la disponibilidad incluye datos del bombero, usarlos directamente
    if (disponibilidad?.bombero) {
      const { nombres, apellidos } = disponibilidad.bombero;
      return `${nombres} ${apellidos}`;
    }

    // Fallback: buscar en la lista de bomberos
    const bomberoInfo = bomberos.find(b => b.id === idBombero);
    if (bomberoInfo) {
      return `${bomberoInfo.nombres} ${bomberoInfo.apellidos}`;
    }

    return 'Bombero desconocido';
  }, [bomberos]);

  // Efecto para cargar datos iniciales
  useEffect(() => {
    initializeFechas();
    loadData();
  }, [initializeFechas, loadData, refreshTrigger]);

  // Efecto para manejar eventos de socket
  useEffect(() => {
    if (!on || !off) return;

    const handleDisponibilidadUpdate = (eventData) => {
      console.log('[SOCKET] Evento de disponibilidad recibido:', eventData);
      
      // Actualizar lista de disponibilidades
      setDisponibilidades(prev => {
        let newDisponibilidades = [...prev];
        
        if (eventData.type === 'created') {
          // Agregar nueva disponibilidad
          newDisponibilidades.push(eventData.data);
          
          // Mostrar notificación si no es del usuario actual
          if (eventData.data.idBombero !== bombero?.id) {
            const nombreBombero = getBomberoInfo(eventData.data.idBombero, eventData.data);
            console.log(`[SOCKET] ${nombreBombero} se marcó como disponible`);
          }
        } else if (eventData.type === 'closed') {
          // Actualizar disponibilidad cerrada
          const index = newDisponibilidades.findIndex(d => d.id === eventData.data.id);
          if (index !== -1) {
            newDisponibilidades[index] = eventData.data;
          }
          
          // Mostrar notificación si no es del usuario actual
          if (eventData.data.idBombero !== bombero?.id) {
            const nombreBombero = getBomberoInfo(eventData.data.idBombero, eventData.data);
            console.log(`[SOCKET] ${nombreBombero} cerró su disponibilidad`);
          }
        }
        
        // Recalcular estadísticas
        calculateStats(newDisponibilidades);
        
        // Actualizar mi disponibilidad si corresponde
        if (eventData.data.idBombero === bombero?.id) {
          if (eventData.type === 'created') {
            setMiDisponibilidad(eventData.data);
          } else if (eventData.type === 'closed') {
            setMiDisponibilidad(null);
          }
        }
        
        return newDisponibilidades;
      });
    };

    // Escuchar eventos de socket
    on('disponibilidadUpdate', handleDisponibilidadUpdate);

    // Cleanup
    return () => {
      off('disponibilidadUpdate', handleDisponibilidadUpdate);
    };
  }, [on, off, bombero?.id, calculateStats, getBomberoInfo]);

  const value = useMemo(() => ({
    // Estado de pestañas
    activeTab,
    availableTabs,
    handleTabChange,
    
    // Datos principales
    disponibilidades,
    bomberos,
    loading,
    error,
    stats,
    
    // Estados del tab marcar
    updatingMyStatus,
    setUpdatingMyStatus,
    miDisponibilidad,
    setMiDisponibilidad,
    fechaInicio,
    setFechaInicio,
    fechaTermino,
    setFechaTermino,
    usarFechaTermino,
    setUsarFechaTermino,
    autoAjustado,
    setAutoAjustado,
    
    // Estados del historial
    filtros,
    setFiltros,
    paginaActual,
    setPaginaActual,
    registrosPorPagina,
    
    // Funciones
    triggerRefresh,
    initializeFechas,
    loadData,
    calculateStats,
    getBomberoInfo,
    
    // Contextos externos
    bombero,
    hasPermiso,
    
    // Configuración
    tabsConfig
  }), [
    activeTab, availableTabs, disponibilidades, bomberos, loading, error, stats,
    updatingMyStatus, miDisponibilidad, fechaInicio, fechaTermino, usarFechaTermino, autoAjustado,
    filtros, paginaActual, registrosPorPagina,
    handleTabChange, triggerRefresh, initializeFechas, loadData, calculateStats, getBomberoInfo,
    bombero, hasPermiso, tabsConfig
  ]);

  return (
    <DisponibilidadContext.Provider value={value}>
      {children}
    </DisponibilidadContext.Provider>
  );
};

/**
 * Hook para usar el contexto de disponibilidad
 */
export const useDisponibilidad = () => {
  const context = useContext(DisponibilidadContext);
  
  if (!context) {
    throw new Error('useDisponibilidad debe ser usado dentro de un DisponibilidadProvider');
  }
  
  return context;
};

export default DisponibilidadContext;