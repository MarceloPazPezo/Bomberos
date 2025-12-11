import { useState, useEffect } from 'react';
import { 
  getMiCompania, 
  getBomberosMiCompania, 
  getEstadisticasMiCompania,
  getBomberosByCompania,
  getEstadisticasBomberosCompania,
  getBomberosOtrasCompanias,
  getBomberos
} from '@services/bombero.service.js';

/**
 * Hook para manejar la lógica de bomberos por compañía
 * @param {number|null} idCompania - ID de compañía específica (opcional, si no se proporciona usa la compañía del usuario)
 * @returns {Object} Estado y funciones para manejar bomberos por compañía
 */
export const useBomberoCompania = (idCompania = null) => {
  const [compania, setCompania] = useState(null);
  const [bomberos, setBomberos] = useState([]);
  const [estadisticas, setEstadisticas] = useState(null);
  const [bomberosOtrasCompanias, setBomberosOtrasCompanias] = useState([]);
  const [allBomberos, setAllBomberos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingOtrasCompanias, setLoadingOtrasCompanias] = useState(false);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Cargar datos iniciales
  useEffect(() => {
    loadData();
  }, [idCompania]);

  /**
   * Carga todos los datos necesarios
   */
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Cargar compañía
      await loadCompania();
      
      // Cargar bomberos y estadísticas en paralelo
      await Promise.all([
        loadBomberos(),
        loadEstadisticas()
      ]);

    } catch (error) {
      console.error('Error al cargar datos:', error);
      setError('Error al cargar los datos de la compañía');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Carga la información de la compañía
   */
  const loadCompania = async () => {
    try {
      let response;
      
      if (idCompania) {
        // Para compañías específicas, necesitamos obtener la info de otra manera
        // Por ahora, usamos la respuesta de bomberos que incluye la compañía
        response = await getBomberosByCompania(idCompania);
        // El backend devuelve { status: "Success", message: "...", data: ... }
        if (response.status === 'Success' && response.data?.compania) {
          setCompania(response.data.compania);
        }
      } else {
        response = await getMiCompania();
        if (response.status === 'Success') {
          setCompania(response.data);
        }
      }
    } catch (error) {
      console.error('Error al cargar compañía:', error);
    }
  };

  /**
   * Carga los bomberos de la compañía
   */
  const loadBomberos = async () => {
    try {
      let response;
      
      if (idCompania) {
        response = await getBomberosByCompania(idCompania);
        // El backend devuelve { status: "Success", message: "...", data: ... }
        if (response.status === 'Success') {
          setBomberos(response.data);
        }
      } else {
        response = await getBomberosMiCompania();
        if (response.status === 'Success') {
          setBomberos(response.data.bomberos);
          if (!idCompania) {
            setCompania(response.data.compania);
          }
        }
      }
    } catch (error) {
      console.error('Error al cargar bomberos:', error);
      setError('Error al cargar los bomberos');
    }
  };

  /**
   * Carga las estadísticas de la compañía
   */
  const loadEstadisticas = async () => {
    try {
      let response;
      
      if (idCompania) {
        response = await getEstadisticasBomberosCompania(idCompania);
        // El backend devuelve { status: "Success", message: "...", data: ... }
        if (response.status === 'Success') {
          setEstadisticas(response.data);
        }
      } else {
        response = await getEstadisticasMiCompania();
        if (response.status === 'Success') {
          setEstadisticas(response.data.estadisticas);
        }
      }
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    }
  };

  /**
   * Refresca todos los datos
   */
  const refreshData = async () => {
    try {
      setRefreshing(true);
      await loadData();
    } catch (error) {
      console.error('Error al refrescar datos:', error);
      setError('Error al refrescar los datos');
    } finally {
      setRefreshing(false);
    }
  };

  /**
   * Filtra bomberos por criterios
   */
  const filterBomberos = (filtros = {}) => {
    let bomberosFiltrados = [...bomberos];

    // Filtrar por texto de búsqueda
    if (filtros.busqueda) {
      const busqueda = filtros.busqueda.toLowerCase();
      bomberosFiltrados = bomberosFiltrados.filter(bombero => 
        bombero.nombreCompleto.toLowerCase().includes(busqueda) ||
        bombero.email.toLowerCase().includes(busqueda) ||
        (bombero.ficha?.nombre && bombero.ficha.nombre.toLowerCase().includes(busqueda))
      );
    }

    // Filtrar por estado activo
    if (filtros.soloActivos !== undefined) {
      bomberosFiltrados = bomberosFiltrados.filter(bombero => 
        bombero.activo === filtros.soloActivos
      );
    }

    // Filtrar por tener ficha
    if (filtros.soloConFicha !== undefined) {
      bomberosFiltrados = bomberosFiltrados.filter(bombero => 
        bombero.tieneFicha === filtros.soloConFicha
      );
    }

    // Filtrar por licencia
    if (filtros.soloConLicencia !== undefined) {
      bomberosFiltrados = bomberosFiltrados.filter(bombero => 
        bombero.ficha?.licenciaClaseF === filtros.soloConLicencia
      );
    }

    // Filtrar por rol
    if (filtros.rol) {
      bomberosFiltrados = bomberosFiltrados.filter(bombero => 
        bombero.roles.some(rol => rol.nombre === filtros.rol)
      );
    }

    return bomberosFiltrados;
  };

  /**
   * Obtiene roles únicos de todos los bomberos
   */
  const getRolesUnicos = () => {
    const roles = new Set();
    bomberos.forEach(bombero => {
      bombero.roles.forEach(rol => roles.add(rol.nombre));
    });
    return Array.from(roles).sort();
  };

  /**
   * Carga bomberos de otras compañías
   */
  const loadBomberosOtrasCompanias = async () => {
    try {
      setLoadingOtrasCompanias(true);
      const response = await getBomberosOtrasCompanias();
      
      if (response.status === 'Success') {
        setBomberosOtrasCompanias(response.data.bomberos || []);
      } else {
        setError(response.message || 'Error al cargar bomberos de otras compañías');
      }
    } catch (error) {
      console.error('Error al cargar bomberos de otras compañías:', error);
      setError('Error al cargar bomberos de otras compañías');
    } finally {
      setLoadingOtrasCompanias(false);
    }
  };

  /**
   * Carga TODOS los bomberos del sistema (sin filtro de compañía)
   */
  const loadAllBomberos = async () => {
    try {
      setLoadingOtrasCompanias(true); // Reusamos este loading para la pestaña alternativa
      const response = await getBomberos();
      
      // getBomberos ya devuelve los datos formateados array
      if (Array.isArray(response)) {
        setAllBomberos(response);
      } else {
        setError(response.message || 'Error al cargar todos los bomberos');
      }
    } catch (error) {
      console.error('Error al cargar todos los bomberos:', error);
      setError('Error al cargar todos los bomberos');
    } finally {
      setLoadingOtrasCompanias(false);
    }
  };

  return {
    // Estado
    compania,
    bomberos,
    estadisticas,
    bomberosOtrasCompanias,
    allBomberos,
    loading,
    loadingOtrasCompanias,
    error,
    refreshing,
    
    // Funciones
    refreshData,
    filterBomberos,
    getRolesUnicos,
    loadBomberosOtrasCompanias,
    loadAllBomberos,
    
    // Helpers
    totalBomberos: bomberos.length,
    bomberosActivos: bomberos.filter(b => b.activo).length,
    bomberosConFicha: bomberos.filter(b => b.tieneFicha).length,
    bomberosConLicencia: bomberos.filter(b => b.ficha?.licenciaClaseF).length,
    totalBomberosOtrasCompanias: bomberosOtrasCompanias.length,
    totalAllBomberos: allBomberos.length
  };
};
