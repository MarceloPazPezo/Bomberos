import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { useAuth } from '@hooks/auth/useAuth';
import { getBomberos } from '@services/bombero.service';
import { 
  getDisponibilidades
} from '@services/disponibilidad.service';
import dateHelper from '@helpers/dateHelper';
import useSocket from '../hooks/useSocket';
import { useGlobalAvailability } from './GlobalAvailabilityContext';

const DisponibilidadContext = createContext();

/**
 * Contexto principal para la gestión de disponibilidades
 * Maneja el estado global de las pestañas y funciones comunes
 */
export const DisponibilidadProvider = ({ children }) => {
  const { bombero, hasPermiso } = useAuth();
  const { on, off } = useSocket();
  const { updateAvailability, clearAvailability } = useGlobalAvailability();
  
  // Estados principales
  const [activeTab, setActiveTab] = useState('marcar');
  const [disponibilidades, setDisponibilidades] = useState([]); // Todas las disponibilidades (para personal disponible)
  const [miHistorial, setMiHistorial] = useState([]); // Solo las del usuario actual (para historial)
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
    fechaDesde: '',
    fechaHasta: '',
    estado: 'todos'
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

  // Cargar datos
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Cargar disponibilidades según permisos
      let disponibilidadesData = [];
      let miHistorialData = [];
      
      if (hasPermiso('disponibilidad:obtener') || hasPermiso('disponibilidad:admin')) {
        if (hasPermiso('disponibilidad:admin')) {
          // Administradores ven todas las disponibilidades en "marcar"
          const disponibilidadesResponse = await getDisponibilidades();
          disponibilidadesData = Array.isArray(disponibilidadesResponse) ? disponibilidadesResponse : [];
          
          // Pero en el historial solo ven las suyas propias
          const miHistorialResponse = await getDisponibilidades(bombero?.id);
          miHistorialData = Array.isArray(miHistorialResponse) ? miHistorialResponse : [];
        } else {
          // Usuarios normales: todas para personal disponible, solo las suyas para historial
          const todasDisponibilidadesResponse = await getDisponibilidades();
          disponibilidadesData = Array.isArray(todasDisponibilidadesResponse) ? todasDisponibilidadesResponse : [];
          
          // Para el historial, solo las del usuario actual
          const miHistorialResponse = await getDisponibilidades(bombero?.id);
          miHistorialData = Array.isArray(miHistorialResponse) ? miHistorialResponse : [];
        }
      }
      
      setDisponibilidades(disponibilidadesData);
      setMiHistorial(miHistorialData);

      // Solo cargar bomberos si tiene permisos para leer todos los bomberos
      let bomberosData = [];
      if (hasPermiso('bombero:obtener')) {
        const bomberosResponse = await getBomberos();
        bomberosData = Array.isArray(bomberosResponse) ? bomberosResponse : [];
      }
      setBomberos(bomberosData);

      // Buscar mi disponibilidad activa (usar miHistorialData que ya está filtrado por usuario)
      if (bombero?.id && Array.isArray(miHistorialData)) {
        const miDisponibilidadActiva = miHistorialData.find(d => 
          (!d.fechaTermino || new Date(d.fechaTermino) > new Date())
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
  }, [bombero?.id, hasPermiso, calculateStats]);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshTrigger]); // Solo recargar cuando refreshTrigger cambie

  // Efecto inicial para calcular estadísticas cuando se carga la página
  useEffect(() => {
    if (disponibilidades.length > 0) {
      calculateStats(disponibilidades);
    }
  }, []); // Solo en el montaje inicial

  // Efecto para sincronizar con el contexto global
  useEffect(() => {
    if (miDisponibilidad) {
      updateAvailability(miDisponibilidad);
    } else {
      clearAvailability();
    }

    // Recalcular estadísticas cuando cambie mi disponibilidad
    calculateStats(disponibilidades);
  }, [miDisponibilidad, updateAvailability, clearAvailability, disponibilidades, calculateStats]);

  // Efecto para verificar si mi disponibilidad ha expirado
  useEffect(() => {
    if (!miDisponibilidad?.fechaTermino) return;

    const checkExpiration = () => {
      const now = new Date();
      const fechaTermino = new Date(miDisponibilidad.fechaTermino);

      if (fechaTermino <= now) {
        console.log('⏰ Mi disponibilidad expiró, limpiando estado...');
        setMiDisponibilidad(null);
        clearAvailability();

        // Recalcular estadísticas después de limpiar mi disponibilidad
        calculateStats(disponibilidades);
      }
    };

    // Calcular cuánto tiempo falta para que expire
    const fechaTermino = new Date(miDisponibilidad.fechaTermino);
    const now = new Date();
    const timeUntilExpiration = fechaTermino.getTime() - now.getTime();

    // Si ya expiró, limpiar inmediatamente
    if (timeUntilExpiration <= 0) {
      checkExpiration();
      return;
    }

    // Configurar timeout para cuando expire
    const timeout = setTimeout(checkExpiration, timeUntilExpiration + 1000); // +1 segundo de margen

    // También verificar cada minuto por si acaso
    const interval = setInterval(checkExpiration, 60000);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [miDisponibilidad, clearAvailability, disponibilidades, calculateStats]);

  // Efecto para recalcular estadísticas cuando cambien las disponibilidades
  useEffect(() => {
    if (disponibilidades.length > 0) {
      calculateStats(disponibilidades);
    }
  }, [disponibilidades, calculateStats]);

  // Efecto para manejar eventos de socket
  useEffect(() => {
    if (!on || !off) return;

    const handleDisponibilidadUpdate = (eventData) => {
      // Actualizar lista de disponibilidades
      setDisponibilidades(prev => {
        let newDisponibilidades = [...prev];

        if (eventData.type === 'created') {
          // Agregar nueva disponibilidad
          newDisponibilidades.push(eventData.data);
        } else if (eventData.type === 'closed') {
          // Actualizar disponibilidad cerrada
          const index = newDisponibilidades.findIndex(d => d.id === eventData.data.id);
          if (index !== -1) {
            newDisponibilidades[index] = eventData.data;
          }
        }

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
  }, [on, off, bombero?.id, getBomberoInfo]);

  const value = useMemo(() => ({
    // Estado de pestañas
    activeTab,
    availableTabs,
    handleTabChange,
    
    // Datos principales
    disponibilidades,
    miHistorial,
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
    activeTab, availableTabs, disponibilidades, miHistorial, bomberos, loading, error, stats,
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