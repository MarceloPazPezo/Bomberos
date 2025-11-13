import React, { useState, useEffect, useCallback } from 'react';
import { 
  ShieldCheckIcon,
  MagnifyingGlassIcon,
  UserIcon,
  WrenchScrewdriverIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { MdRefresh, MdSearch, MdClear, MdShield, MdHelpOutline } from 'react-icons/md';
import { useAuth } from '@hooks/auth/useAuth';
import eppService from '@services/epp.service.js';
import { showSuccessAlert, showErrorAlert } from '@helpers/fireAlert.js';
import EditEppModal from '@components/epp/EditEppModal.jsx';
import Tooltip from '@components/Tooltip.jsx';

// PrimeReact para los selects y paginación
import { Dropdown } from 'primereact/dropdown';
import { Paginator } from 'primereact/paginator';
import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

/**
 * Página de inventario de EPP (Equipos de Protección Personal)
 */
const InventarioEpp = () => {
  const { bombero: user } = useAuth();
  
  // Estados principales
  const [epps, setEpps] = useState([]);
  const [tiposEpp, setTiposEpp] = useState([]);
  const [estadosEpp, setEstadosEpp] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados de filtros y búsqueda
  const [filters, setFilters] = useState({
    search: '',
    idTipoEpp: null,
    idEstadoEpp: null
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [first, setFirst] = useState(0); // Para el Paginator de PrimeReact

  // Estados de modales
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEpp, setSelectedEpp] = useState(null);

  /**
   * Carga los datos iniciales
   */
  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [eppsResponse, tiposResponse, estadosResponse] = await Promise.all([
        eppService.getEpp({ page: 1, limit: 10 }),
        eppService.getTiposEpp(),
        eppService.getEstadosEpp()
      ]);

      setEpps(eppsResponse.data.epps);
      setPagination(eppsResponse.data.pagination);
      setTiposEpp(tiposResponse.data);
      setEstadosEpp(estadosResponse.data);

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
        search: newFilters.search || undefined,
        idTipoEpp: newFilters.idTipoEpp || undefined,
        idEstadoEpp: newFilters.idEstadoEpp || undefined
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
      setFirst((newPage - 1) * pagination.limit); // Actualizar first para Paginator

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
      idTipoEpp: null,
      idEstadoEpp: null
    };
    setFilters(emptyFilters);
    setFirst(0);
    applyFilters(emptyFilters, 1);
  };

  /**
   * Maneja el cambio de página en el Paginator
   */
  const onPageChange = (event) => {
    setFirst(event.first);
    const newPage = Math.floor(event.first / event.rows) + 1;
    const newLimit = event.rows;
    
    if (newLimit !== pagination.limit) {
      setPagination(prev => ({ ...prev, limit: newLimit }));
    }
    
    applyFilters(filters, newPage);
  };

  /**
   * Maneja la actualización de un EPP asignado al usuario
   */
  const handleUpdateMyEpp = async (eppData) => {
    try {
      const { perfilCompletoService } = await import('@services/perfilCompleto.service');
      await perfilCompletoService.updateEppAsignado(selectedEpp.id, {
        idEstadoEpp: eppData.idEstadoEpp,
        descripcionDeEstado: eppData.descripcionDeEstado
      });
      showSuccessAlert('Éxito', 'Estado del EPP actualizado exitosamente');
      loadInitialData();
    } catch (error) {
      console.error('Error al actualizar EPP:', error);
      showErrorAlert('Error', error.response?.data?.message || 'No se pudo actualizar el estado del EPP');
      throw error;
    }
  };

  /**
   * Verifica si un EPP está asignado al usuario actual
   */
  const isMyEpp = (epp) => {
    if (!epp.aCargoEpps || epp.aCargoEpps.length === 0) return false;
    const asignacion = epp.aCargoEpps[0];
    return asignacion.fichaBombero?.bombero?.id === user?.id;
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

  // Preparar opciones para los dropdowns de PrimeReact
  const tipoOptions = [
    { label: 'Todos los tipos', value: null },
    ...tiposEpp.map(tipo => ({ label: tipo.nombre, value: tipo.id }))
  ];

  const estadoOptions = [
    { label: 'Todos los estados', value: null },
    ...estadosEpp.map(estado => ({ label: estado.nombre, value: estado.id }))
  ];

  return (
    <div className="space-y-4">
      {/* Header principal con estilo glassmorphism */}
      <div className="bg-white/80 backdrop-blur-lg border border-[#4EB9FA]/20 shadow-xl rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MdShield className="h-8 w-8 text-[#4EB9FA]" />
            <div>
              <h1 className="text-2xl font-bold text-[#2C3E50]">
                Inventario de EPP
              </h1>
              <p className="text-gray-600 text-sm">
                Consulta el inventario y actualiza el estado de tus equipos asignados
              </p>
            </div>
            <Tooltip
              id="inventario-epp-help"
              content="Sistema de gestión de Equipos de Protección Personal. Aquí puedes consultar todo el inventario de EPP del cuerpo de bomberos. Si tienes equipos asignados, puedes actualizar su estado y agregar observaciones sobre su condición."
              place="bottom"
              variant="dark"
            >
              <MdHelpOutline className="h-5 w-5 text-gray-400 hover:text-[#4EB9FA] transition-colors cursor-help" />
            </Tooltip>
          </div>

          {/* Botón de refrescar */}
          <Tooltip
            id="refresh-inventario-btn"
            content="Actualizar inventario"
            place="left"
            variant="dark"
          >
            <button
              onClick={loadInitialData}
              disabled={loading}
              className={`p-2.5 rounded-lg transition-all duration-200 ${
                loading 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-[#4EB9FA] hover:bg-[#3A9BD9] text-white shadow-md hover:shadow-lg'
              }`}
            >
              <MdRefresh 
                size={20} 
                className={loading ? 'animate-spin' : ''} 
              />
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Contenedor principal */}
      <div className="bg-white rounded-2xl shadow-xl p-6">
        {/* Filtros */}
        <div className="mb-6 space-y-4">
          {/* Buscador */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MdSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar EPP por nombre, número de serie o descripción..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4EB9FA] focus:border-[#4EB9FA] text-sm"
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

          {/* Filtros con PrimeReact Dropdown */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Filtro por tipo */}
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de EPP
              </label>
              <Dropdown
                value={filters.idTipoEpp}
                options={tipoOptions}
                onChange={(e) => handleFilterChange('idTipoEpp', e.value)}
                placeholder="Seleccione un tipo"
                className="w-full"
                showClear={filters.idTipoEpp !== null}
                filter
                filterPlaceholder="Buscar tipo..."
                emptyFilterMessage="No se encontraron tipos"
              />
            </div>

            {/* Filtro por estado */}
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estado
              </label>
              <Dropdown
                value={filters.idEstadoEpp}
                options={estadoOptions}
                onChange={(e) => handleFilterChange('idEstadoEpp', e.value)}
                placeholder="Seleccione un estado"
                className="w-full"
                showClear={filters.idEstadoEpp !== null}
                filter
                filterPlaceholder="Buscar estado..."
                emptyFilterMessage="No se encontraron estados"
              />
            </div>

            {/* Botón limpiar filtros */}
            {(filters.search || filters.idTipoEpp || filters.idEstadoEpp) && (
              <div className="flex-1 min-w-[200px] flex items-end">
                <button
                  onClick={clearFilters}
                  className="w-full px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm font-medium"
                >
                  <MdClear className="inline mr-2" />
                  Limpiar filtros
                </button>
              </div>
            )}
          </div>

        </div>

        {/* Lista de EPP */}
        <div className="space-y-3">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {epps.length === 0 && !loading ? (
            <div className="text-center py-12">
              <ShieldCheckIcon className="mx-auto h-16 w-16 text-gray-300" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">No hay equipos</h3>
              <p className="mt-2 text-sm text-gray-500">
                {filters.search || filters.idTipoEpp || filters.idEstadoEpp 
                  ? 'No se encontraron equipos con los filtros aplicados.' 
                  : 'No hay equipos en el inventario.'}
              </p>
            </div>
          ) : (
            <>
              {epps.map((epp) => (
                <div 
                  key={epp.id} 
                  className="bg-gray-50 border border-gray-200 rounded-xl p-4 hover:shadow-md hover:border-[#4EB9FA]/30 transition-all duration-200"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    {/* Columna 1: Información del EPP */}
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="flex-shrink-0">
                        {getEstadoIcon(epp.estadosEpp?.nombre)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="mb-1">
                          <h4 className="text-base font-semibold text-gray-900">
                            {epp.nombre}
                          </h4>
                        </div>
                        
                        <div className="flex items-center flex-wrap gap-2">
                          <span className="text-xs text-gray-600">
                            {epp.tipoEpp?.nombre}
                          </span>
                          <span className="text-gray-300">•</span>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getEstadoColor(epp.estadosEpp?.nombre)}`}>
                            {epp.estadosEpp?.nombre}
                          </span>
                        </div>
                        
                        {epp.descripcionDeEstado && (
                          <p className="text-xs text-gray-600 mt-1 line-clamp-1">
                            {epp.descripcionDeEstado}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Columna 2: Mini-card de asignación */}
                    <div className="flex-shrink-0">
                      {epp.aCargoEpps && epp.aCargoEpps.length > 0 ? (
                        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${
                          isMyEpp(epp) 
                            ? 'bg-blue-50 border-blue-200' 
                            : 'bg-white border-gray-200'
                        } shadow-sm`}>
                          <div className={`p-1.5 rounded-full ${
                            isMyEpp(epp) ? 'bg-blue-100' : 'bg-gray-100'
                          }`}>
                            <UserIcon className={`w-4 h-4 ${
                              isMyEpp(epp) ? 'text-blue-600' : 'text-gray-600'
                            }`} />
                          </div>
                          <div>
                            <div className={`text-xs font-semibold ${
                              isMyEpp(epp) ? 'text-blue-900' : 'text-gray-900'
                            }`}>
                              {epp.aCargoEpps[0].fichaBombero?.bombero?.nombres}{' '}
                              {epp.aCargoEpps[0].fichaBombero?.bombero?.apellidos}
                              {isMyEpp(epp) && (
                                <span className="ml-1 px-1.5 py-0.5 bg-blue-600 text-white text-[10px] rounded-full">
                                  Tú
                                </span>
                              )}
                            </div>
                            {epp.aCargoEpps[0].fechaAsignacion && (
                              <div className="text-[10px] text-gray-500">
                                {new Date(epp.aCargoEpps[0].fechaAsignacion).toLocaleDateString('es-CL', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric'
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 px-3 py-2 bg-white border border-dashed border-gray-300 rounded-lg">
                          <UserIcon className="w-4 h-4 text-gray-400" />
                          <span className="text-xs text-gray-500">Sin asignar</span>
                        </div>
                      )}
                    </div>

                    {/* Columna 3: Acciones */}
                    <div className="flex-shrink-0">
                      {isMyEpp(epp) ? (
                        <button
                          onClick={() => {
                            setSelectedEpp(epp);
                            setShowEditModal(true);
                          }}
                          className="px-3 py-1.5 bg-[#4EB9FA] hover:bg-[#3A9BD9] text-white text-xs font-medium rounded-lg transition-colors shadow-sm whitespace-nowrap"
                        >
                          Actualizar Estado
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400 italic">
                          Solo lectura
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Paginación con PrimeReact */}
        {pagination.total > 0 && (
          <div className="mt-6 border-t border-gray-200 pt-6">
            <Paginator
              first={first}
              rows={pagination.limit}
              totalRecords={pagination.total}
              rowsPerPageOptions={[5, 10, 20, 50]}
              onPageChange={onPageChange}
              template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown CurrentPageReport"
              currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} equipos"
              className="border-0"
            />
          </div>
        )}
      </div>

      {/* Modal para editar EPP */}
      {selectedEpp && isMyEpp(selectedEpp) && (
        <EditEppModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedEpp(null);
          }}
          onSave={handleUpdateMyEpp}
          epp={selectedEpp}
          tiposEpp={tiposEpp}
          estadosEpp={estadosEpp}
          readOnlyFields={['nombre', 'idTipoEpp']}
        />
      )}
    </div>
  );
};

export default InventarioEpp;
