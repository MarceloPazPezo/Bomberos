import React, { useState, useEffect, useCallback } from 'react';
import { 
  ShieldCheckIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  UserIcon,
  WrenchScrewdriverIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { MdAdd, MdRefresh, MdSearch, MdClear } from 'react-icons/md';
import { useAuth } from '@hooks/auth/useAuth';
import eppService from '@services/epp.service.js';
import { showSuccessAlert, showErrorAlert, showConfirmAlert } from '@helpers/fireAlert.js';
import Tooltip from '@components/Tooltip.jsx';

/**
 * Página de inventario de EPP (Equipos de Protección Personal)
 */
const InventarioEpp = () => {
  const { bombero: user } = useAuth();
  
  // Estados principales
  const [epps, setEpps] = useState([]);
  const [tiposEpp, setTiposEpp] = useState([]);
  const [estadosEpp, setEstadosEpp] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados de filtros y búsqueda
  const [filters, setFilters] = useState({
    search: '',
    idTipoEpp: '',
    idEstadoEpp: '',
    idBombero: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  // Estados de modales
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedEpp, setSelectedEpp] = useState(null);

  /**
   * Carga los datos iniciales
   */
  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [eppsResponse, tiposResponse, estadosResponse, statsResponse] = await Promise.all([
        eppService.getEpp({ page: 1, limit: 10 }),
        eppService.getTiposEpp(),
        eppService.getEstadosEpp(),
        eppService.getInventarioStats()
      ]);

      setEpps(eppsResponse.data.epps);
      setPagination(eppsResponse.data.pagination);
      setTiposEpp(tiposResponse.data);
      setEstadosEpp(estadosResponse.data);
      setStats(statsResponse.data);

    } catch (error) {
      console.error('Error cargando datos iniciales:', error);
      setError('Error al cargar los datos del inventario');
      showErrorAlert('Error', 'No se pudieron cargar los datos del inventario');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Aplica filtros y busca EPP
   */
  const applyFilters = useCallback(async (newFilters = filters, newPage = 1) => {
    try {
      setLoading(true);
      
      const params = {
        page: newPage,
        limit: pagination.limit,
        ...newFilters
      };

      // Remover filtros vacíos
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === null || params[key] === undefined) {
          delete params[key];
        }
      });

      const response = await eppService.getEpp(params);
      
      setEpps(response.data.epps);
      setPagination(response.data.pagination);
      setFilters(newFilters);

    } catch (error) {
      console.error('Error aplicando filtros:', error);
      showErrorAlert('Error', 'No se pudieron aplicar los filtros');
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.limit]);

  /**
   * Maneja cambios en los filtros
   */
  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    applyFilters(newFilters, 1);
  };

  /**
   * Limpia todos los filtros
   */
  const clearFilters = () => {
    const emptyFilters = {
      search: '',
      idTipoEpp: '',
      idEstadoEpp: '',
      idBombero: ''
    };
    setFilters(emptyFilters);
    applyFilters(emptyFilters, 1);
  };

  /**
   * Obtiene el icono del estado del EPP
   */
  const getEstadoIcon = (estadoNombre) => {
    switch (estadoNombre) {
      case 'Disponible':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'En Uso':
        return <UserIcon className="w-5 h-5 text-blue-500" />;
      case 'Mantenimiento':
        return <WrenchScrewdriverIcon className="w-5 h-5 text-yellow-500" />;
      case 'Dañado':
      case 'Fuera de Servicio':
        return <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />;
      default:
        return <ClockIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  /**
   * Obtiene el color del estado
   */
  const getEstadoColor = (estadoNombre) => {
    switch (estadoNombre) {
      case 'Disponible':
        return 'bg-green-100 text-green-800';
      case 'En Uso':
        return 'bg-blue-100 text-blue-800';
      case 'Mantenimiento':
        return 'bg-yellow-100 text-yellow-800';
      case 'Dañado':
      case 'Fuera de Servicio':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  /**
   * Carga los datos al montar el componente
   */
  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  if (loading && epps.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con estilo de admin tabs */}
      <div className="bg-white/80 backdrop-blur-lg border border-[#4EB9FA]/20 shadow-xl p-6 rounded-2xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Inventario de EPP</h2>
            <p className="text-gray-600 text-sm mt-1">
              Gestión de Equipos de Protección Personal
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Estadísticas */}
            <span className="text-sm text-gray-600">
              Total: {stats.totalEpps || 0} equipos
            </span>

            {/* Botón refrescar */}
            <Tooltip
              id="refresh-epp-btn"
              content="Actualizar lista de EPP"
              place="top"
              variant="dark"
            >
              <button
                onClick={loadInitialData}
                disabled={loading}
                className={`p-2 rounded-lg shadow transition-all duration-200 border ${
                  loading 
                    ? 'bg-gray-400 text-gray-200 border-gray-400 cursor-not-allowed' 
                    : 'bg-[#4EB9FA] hover:bg-[#3A9BD9] text-white border-[#4EB9FA] hover:-translate-y-0.5 hover:scale-105'
                }`}
              >
                <MdRefresh 
                  size={18} 
                  className={loading ? 'animate-spin' : ''} 
                />
              </button>
            </Tooltip>

            {/* Botón crear EPP */}
            <Tooltip
              id="create-epp-btn"
              content="Crear un nuevo EPP en el sistema"
              place="top"
              variant="dark"
            >
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-[#2C3E50] hover:bg-[#34495E] text-white font-semibold px-4 py-2 rounded-lg shadow transition-all duration-200 border border-[#2C3E50] hover:-translate-y-0.5 hover:scale-105"
              >
                <span className="flex items-center gap-2">
                  <MdAdd size={18} />
                  <span className="hidden sm:inline">Crear EPP</span>
                </span>
              </button>
            </Tooltip>
          </div>
        </div>

        {/* Tarjetas de estadísticas con estilo de admin */}
        {stats && Object.keys(stats).length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-r from-[#4EB9FA] to-[#3DA8E9] text-white p-4 rounded-lg shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Total EPP</p>
                  <p className="text-2xl font-bold">{stats.totalEpps || 0}</p>
                </div>
                <ShieldCheckIcon className="w-8 h-8 opacity-80" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-lg shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Disponibles</p>
                  <p className="text-2xl font-bold">{stats.eppsDisponibles || 0}</p>
                </div>
                <CheckCircleIcon className="w-8 h-8 opacity-80" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">En Uso</p>
                  <p className="text-2xl font-bold">{stats.eppsAsignados || 0}</p>
                </div>
                <UserIcon className="w-8 h-8 opacity-80" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-lg shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Disponibilidad</p>
                  <p className="text-2xl font-bold">{stats.porcentajeDisponibilidad || 0}%</p>
                  <p className="text-xs opacity-80">{stats.totalTipos || 0} tipos</p>
                </div>
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold">%</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filtros con estilo de admin */}
        <div className="flex items-center gap-2 mb-6">
          {/* Buscador */}
          <div className="relative max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MdSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar EPP por nombre o descripción..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
            {filters.search && (
              <button
                onClick={() => handleFilterChange('search', '')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                <MdClear className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Filtro por tipo */}
          <select
            value={filters.idTipoEpp}
            onChange={(e) => handleFilterChange('idTipoEpp', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option value="">Todos los tipos</option>
            {tiposEpp.map(tipo => (
              <option key={tipo.id} value={tipo.id}>
                {tipo.nombre}
              </option>
            ))}
          </select>

          {/* Filtro por estado */}
          <select
            value={filters.idEstadoEpp}
            onChange={(e) => handleFilterChange('idEstadoEpp', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option value="">Todos los estados</option>
            {estadosEpp.map(estado => (
              <option key={estado.id} value={estado.id}>
                {estado.nombre}
              </option>
            ))}
          </select>

          {/* Límite por página */}
          <select
            value={pagination.limit}
            onChange={(e) => {
              setPagination(prev => ({ ...prev, limit: parseInt(e.target.value) }));
              applyFilters(filters, 1);
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option value={5}>5 por página</option>
            <option value={10}>10 por página</option>
            <option value={20}>20 por página</option>
            <option value={50}>50 por página</option>
          </select>

          {/* Estadísticas de filtros */}
          <span className="text-sm text-gray-600 whitespace-nowrap ml-auto">
            Mostrando: {epps.length} de {pagination.total} equipos
            {filters.search && ` | Filtrados: ${epps.length}`}
          </span>
        </div>

        {/* Lista de EPP con estilo de admin */}
        <div className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {epps.length === 0 && !loading ? (
            <div className="text-center py-12">
              <ShieldCheckIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No hay equipos</h3>
              <p className="mt-1 text-sm text-gray-500">
                {filters.search || filters.idTipoEpp || filters.idEstadoEpp 
                  ? 'No se encontraron equipos con los filtros aplicados.' 
                  : 'Comienza creando un nuevo EPP.'}
              </p>
              {!filters.search && !filters.idTipoEpp && !filters.idEstadoEpp && (
                <div className="mt-6">
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-[#2C3E50] hover:bg-[#34495E] text-white font-semibold px-4 py-2 rounded-lg shadow transition-all duration-200 border border-[#2C3E50] hover:-translate-y-0.5 hover:scale-105"
                  >
                    <span className="flex items-center gap-2">
                      <MdAdd size={18} />
                      Crear primer EPP
                    </span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="grid gap-4">
              {epps.map((epp) => (
                <div key={epp.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        {getEstadoIcon(epp.estadosEpp?.nombre)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="text-lg font-medium text-gray-900 truncate">
                          {epp.nombre}
                        </h4>
                        
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-sm text-gray-500">
                            {epp.tipoEpp?.nombre}
                          </span>
                          
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(epp.estadosEpp?.nombre)}`}>
                            {epp.estadosEpp?.nombre}
                          </span>
                          
                          {epp.aCargoEpps && epp.aCargoEpps.length > 0 && (
                            <span className="text-sm text-blue-600">
                              Asignado a: {epp.aCargoEpps[0].fichaBombero?.bombero?.nombres} {epp.aCargoEpps[0].fichaBombero?.bombero?.apellidos}
                            </span>
                          )}
                        </div>
                        
                        {epp.descripcionDeEstado && (
                          <p className="text-sm text-gray-600 mt-1">
                            {epp.descripcionDeEstado}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setSelectedEpp(epp);
                          setShowEditModal(true);
                        }}
                        className="text-[#4EB9FA] hover:text-[#3DA8E9] text-sm font-medium px-3 py-1 rounded border border-[#4EB9FA] hover:bg-[#4EB9FA]/10 transition-colors"
                      >
                        Editar
                      </button>
                      
                      {epp.aCargoEpps && epp.aCargoEpps.length > 0 ? (
                        <button
                          onClick={() => {
                            setSelectedEpp(epp);
                            setShowAssignModal(true);
                          }}
                          className="text-yellow-600 hover:text-yellow-800 text-sm font-medium px-3 py-1 rounded border border-yellow-600 hover:bg-yellow-50 transition-colors"
                        >
                          Desasignar
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedEpp(epp);
                            setShowAssignModal(true);
                          }}
                          className="text-green-600 hover:text-green-800 text-sm font-medium px-3 py-1 rounded border border-green-600 hover:bg-green-50 transition-colors"
                        >
                          Asignar
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Paginación con estilo de admin */}
        {pagination.totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Mostrando {((pagination.page - 1) * pagination.limit) + 1} a {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total} resultados
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => applyFilters(filters, pagination.page - 1)}
                disabled={pagination.page === 1}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                Anterior
              </button>
              
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                const pageNum = pagination.page <= 3 ? i + 1 : pagination.page - 2 + i;
                if (pageNum > pagination.totalPages) return null;
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => applyFilters(filters, pageNum)}
                    className={`px-3 py-1 border rounded-lg text-sm transition-colors ${
                      pageNum === pagination.page
                        ? 'bg-[#4EB9FA] text-white border-[#4EB9FA]'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              <button
                onClick={() => applyFilters(filters, pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modales con estilo de admin */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white/95 backdrop-blur-lg border border-[#4EB9FA]/20 shadow-xl rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Crear Nuevo EPP</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XCircleIcon className="w-6 h-6" />
              </button>
            </div>
            <p className="text-gray-600 mb-6">Funcionalidad en desarrollo...</p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 bg-[#4EB9FA] hover:bg-[#3DA8E9] text-white py-2 rounded-lg transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventarioEpp;
