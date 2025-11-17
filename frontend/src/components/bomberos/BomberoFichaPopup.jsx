import React, { useState, useEffect, useMemo } from 'react';
import { 
  MdClose, 
  MdEdit, 
  MdPerson, 
  MdEmail, 
  MdPhone, 
  MdLocationOn,
  MdDateRange,
  MdWork,
  MdTrendingUp,
  MdEmergency,
  MdSchool,
  MdFavorite,
  MdHistory,
  MdCheckCircle,
  MdCancel,
  MdError
} from 'react-icons/md';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useBomberoDetalles } from '@hooks/bomberos/useBomberoDetalles';
import BomberosLoader from '@components/BomberosLoader';
import BomberoAvatar from './BomberoAvatar';
import ModalPortal from '@components/ModalPortal';
import { getHistorialVoluntario } from '@services/historial.service.js';

// PrimeReact
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { MultiSelect } from 'primereact/multiselect';
import { FilterMatchMode } from 'primereact/api';

/**
 * Componente de tabla de historial con filtros por columna
 */
const HistorialTable = ({ data }) => {
  // Función para convertir texto a Start Case (primera letra de cada palabra en mayúscula)
  const toStartCase = (str) => {
    if (!str) return '';
    return str
      .toLowerCase()
      .split(/[\s_-]+/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Función para obtener color del badge según el tipo
  const getTipoColor = (tipo) => {
    const tipoLower = tipo?.toLowerCase() || '';
    if (tipoLower.includes('evento') || tipoLower.includes('event')) {
      return 'bg-blue-100 text-blue-800 border-blue-200';
    }
    if (tipoLower.includes('incidente') || tipoLower.includes('incident')) {
      return 'bg-red-100 text-red-800 border-red-200';
    }
    if (tipoLower.includes('accidente') || tipoLower.includes('accident')) {
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
    if (tipoLower.includes('capacitacion') || tipoLower.includes('training')) {
      return 'bg-green-100 text-green-800 border-green-200';
    }
    if (tipoLower.includes('parte') || tipoLower.includes('report')) {
      return 'bg-purple-100 text-purple-800 border-purple-200';
    }
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  // Formatear fecha para mostrar
  const formatDate = (dateString) => {
    if (!dateString) return 'No especificada';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: es });
    } catch {
      return 'Fecha inválida';
    }
  };

  // Preparar datos para la tabla
  const tableData = useMemo(() => {
    // Generar un timestamp base único para esta ejecución
    const baseTimestamp = Date.now();
    return data.map((item, index) => {
      // Generar un ID único que combine múltiples campos para evitar duplicados
      // Usar index + timestamp base + random único por item para garantizar unicidad
      const random = Math.random().toString(36).substring(2, 9);
      const uniqueId = item.id 
        ? `${item.id}_${index}_${baseTimestamp}_${random}` 
        : item.ref_id 
          ? `${item.ref_id}_${index}_${baseTimestamp}_${random}`
          : `${item.fecha || ''}_${item.tipo || ''}_${item.descripcion || ''}_${item.subtipo || ''}_${index}_${baseTimestamp}_${random}`;
      return {
        ...item,
        id: uniqueId,
        fechaStr: item.fecha || item.createdAt || item.creadoEl || '',
        tipoStr: toStartCase(item.tipo || ''),
        descripcionStr: item.descripcion || '',
        subtipoStr: toStartCase(item.subtipo || '')
      };
    });
  }, [data]);

  // Inicializar filtros
  const [filters, setFilters] = useState({
    tipoStr: { value: null, matchMode: FilterMatchMode.IN },
    subtipoStr: { value: null, matchMode: FilterMatchMode.IN },
    descripcionStr: { value: null, matchMode: FilterMatchMode.CONTAINS }
  });

  // Estado para datos filtrados
  const [filteredData, setFilteredData] = useState(tableData);

  // Actualizar datos filtrados cuando cambia tableData
  useEffect(() => {
    setFilteredData(tableData);
  }, [tableData]);

  // Obtener opciones únicas para filtros basadas en datos filtrados
  const tipoOptions = useMemo(() => {
    let dataToUse = filteredData;
    if (filters.subtipoStr.value && filters.subtipoStr.value.length > 0) {
      dataToUse = tableData.filter(item => 
        filters.subtipoStr.value.includes(item.subtipoStr)
      );
    }
    return [...new Set(dataToUse.map(item => item.tipoStr).filter(Boolean))].sort();
  }, [filteredData, tableData, filters.subtipoStr.value]);

  const subtipoOptions = useMemo(() => {
    let dataToUse = filteredData;
    if (filters.tipoStr.value && filters.tipoStr.value.length > 0) {
      dataToUse = tableData.filter(item => 
        filters.tipoStr.value.includes(item.tipoStr)
      );
    }
    return [...new Set(dataToUse.map(item => item.subtipoStr).filter(Boolean))].sort();
  }, [filteredData, tableData, filters.tipoStr.value]);


  // Templates para el contenido de las columnas - diseño minimalista
  const fechaBodyTemplate = (rowData) => {
    return (
      <span className="text-xs text-gray-700 whitespace-nowrap">{formatDate(rowData.fechaStr)}</span>
    );
  };

  const tipoBodyTemplate = (rowData) => {
    const tipo = rowData.tipoStr || '-';
    return <span className="text-xs text-gray-700">{tipo}</span>;
  };

  const descripcionBodyTemplate = (rowData) => {
    const desc = rowData.descripcionStr || '-';
    const shortDesc = desc.length > 50 ? desc.substring(0, 50) + '...' : desc;
    return (
      <span className="text-xs text-gray-600" title={desc}>
        {shortDesc}
      </span>
    );
  };

  const subtipoBodyTemplate = (rowData) => {
    const subtipo = rowData.subtipoStr || '-';
    return <span className="text-xs text-gray-600">{subtipo}</span>;
  };

  // Templates de filtros
  const tipoFilterTemplate = (options) => {
    return (
      <MultiSelect
        value={options.value}
        options={tipoOptions}
        onChange={(e) => options.filterApplyCallback(e.value)}
        placeholder="Seleccionar"
        className="w-full min-w-40"
        maxSelectedLabels={1}
        filter
        filterPlaceholder="Buscar tipo..."
        emptyFilterMessage="No se encontraron tipos"
        selectAllLabel="Seleccionar todos"
        selectedItemsLabel="{0} seleccionados"
      />
    );
  };

  const subtipoFilterTemplate = (options) => {
    return (
      <MultiSelect
        value={options.value}
        options={subtipoOptions}
        onChange={(e) => options.filterApplyCallback(e.value)}
        placeholder="Seleccionar"
        className="w-full min-w-40"
        maxSelectedLabels={1}
        filter
        filterPlaceholder="Buscar subtipo..."
        emptyFilterMessage="No se encontraron subtipos"
        selectAllLabel="Seleccionar todos"
        selectedItemsLabel="{0} seleccionados"
      />
    );
  };


  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <MdHistory className="w-8 h-8 text-blue-600" />
          </div>
          <div className="max-w-md">
            <h3 className="text-base font-semibold text-gray-900 mb-2">
              Sin historial registrado
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Aún no hay actividades registradas en el historial.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded border border-gray-200 overflow-hidden">
      <style>{`
        .historial-table .p-datatable-thead > tr > th {
          background: #f3f4f6;
          color: #374151;
          font-weight: 500;
          font-size: 0.7rem;
          padding: 0.4rem 0.5rem;
          border-bottom: 1px solid #e5e7eb;
          white-space: nowrap;
        }
        .historial-table .p-datatable-tbody > tr > td {
          padding: 0.4rem 0.5rem;
          border-bottom: 1px solid #f3f4f6;
          font-size: 0.7rem;
        }
        .historial-table .p-datatable-tbody > tr:hover {
          background-color: #f9fafb;
        }
        .historial-table .p-column-filter .p-inputtext,
        .historial-table .p-column-filter .p-multiselect {
          font-size: 0.65rem;
          height: 1.5rem;
          border: 1px solid #d1d5db;
        }
        .historial-table .p-column-filter {
          margin-top: 0.2rem;
        }
        .historial-table .p-multiselect .p-multiselect-label {
          font-size: 0.65rem;
          padding: 0.2rem 0.4rem;
        }
        .historial-table .p-column-filter .p-inputtext {
          padding: 0.2rem 0.4rem;
        }
        .historial-table .p-datatable .p-paginator {
          background: #ffffff;
          border-top: 1px solid #e5e7eb;
          padding: 0.4rem;
          font-size: 0.7rem;
        }
        .historial-table .p-datatable .p-paginator .p-paginator-pages .p-paginator-page {
          min-width: 1.75rem;
          height: 1.75rem;
          font-size: 0.7rem;
        }
        .historial-table .p-datatable .p-paginator .p-paginator-pages .p-paginator-page.p-highlight {
          background: #4EB9FA;
          border-color: #4EB9FA;
        }
      `}</style>
      <DataTable
        className="historial-table"
        value={tableData}
        dataKey="id"
        paginator
        rows={10}
        rowsPerPageOptions={[5, 10, 15, 20]}
        size="small"
        sortMode="single"
        sortField="fechaStr"
        sortOrder={-1}
        emptyMessage="No se encontraron registros"
        scrollable
        scrollHeight="450px"
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
        currentPageReportTemplate=""
        filters={filters}
        onFilter={(e) => {
          setFilters(e.filters);
          setFilteredData(e.filteredValue || tableData);
        }}
          filterDisplay="row"
          globalFilterFields={['descripcionStr']}
        >
        <Column 
          field="fechaStr" 
          header="Fecha" 
          sortable 
          body={fechaBodyTemplate}
          headerClassName="min-w-32"
          bodyClassName="min-w-32"
          frozen
        />
        <Column 
          field="tipoStr" 
          header="Tipo" 
          sortable 
          body={tipoBodyTemplate}
          filter
          filterElement={tipoFilterTemplate}
          showFilterMenu={false}
          headerClassName="min-w-28"
          bodyClassName="min-w-28"
        />
        <Column 
          field="descripcionStr" 
          header="Descripción" 
          sortable 
          body={descripcionBodyTemplate}
          filter
          filterPlaceholder="Buscar..."
          showFilterMenu={false}
          headerClassName="min-w-40"
          bodyClassName="min-w-40"
        />
        <Column 
          field="subtipoStr" 
          header="Subtipo" 
          sortable 
          body={subtipoBodyTemplate}
          filter
          filterElement={subtipoFilterTemplate}
          showFilterMenu={false}
          headerClassName="min-w-28"
          bodyClassName="min-w-28"
        />
      </DataTable>
    </div>
  );
};

/**
 * Componente popup para mostrar la ficha completa del bombero
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.bombero - Datos del bombero
 * @param {boolean} props.isOpen - Si el popup está abierto
 * @param {Function} props.onClose - Función para cerrar el popup
 * @param {Function} props.onEdit - Función para editar (opcional)
 * @returns {JSX.Element} Componente popup de ficha de bombero
 */
const BomberoFichaPopup = ({ bombero, isOpen, onClose, onEdit }) => {
  const [activeTab, setActiveTab] = useState('personal');
  
  // Estado para historial
  const [historialData, setHistorialData] = useState([]);
  const [loadingHistorial, setLoadingHistorial] = useState(false);
  const [errorHistorial, setErrorHistorial] = useState(null);
  
  // Hook para obtener detalles del bombero
  const {
    bomberoData,
    informacionPersonal,
    contactosEmergencia,
    capacitaciones,
    historialActividades,
    eppAcargo,
    estadisticas,
    loading,
    error
  } = useBomberoDetalles(bombero?.id || null);

  // Cargar historial cuando se cambia a la pestaña de historial
  useEffect(() => {
    if (activeTab === 'history' && bombero?.id && historialData.length === 0 && !loadingHistorial) {
      loadHistorial();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, bombero?.id]);

  const loadHistorial = async () => {
    if (!bombero?.id) return;
    
    setLoadingHistorial(true);
    setErrorHistorial(null);
    
    try {
      const response = await getHistorialVoluntario(bombero.id);
      console.log('Historial obtenido:', response);
      setHistorialData(response.data || response || []);
    } catch (error) {
      console.error('Error al cargar historial:', error);
      setErrorHistorial(error.message || 'Error al cargar el historial');
    } finally {
      setLoadingHistorial(false);
    }
  };

  // Función para formatear fechas
  const formatDate = (dateString) => {
    if (!dateString) return 'No especificada';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: es });
    } catch {
      return 'Fecha inválida';
    }
  };

  // Calcular edad
  const calculateAge = (birthDate) => {
    if (!birthDate) return null;
    try {
      const today = new Date();
      const birth = new Date(birthDate);
      let age = today.getFullYear() - birth.getFullYear();
      const monthDiff = today.getMonth() - birth.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
      }
      return age;
    } catch {
      return null;
    }
  };

  // Obtener nombre completo (usar datos de la API si están disponibles)
  const getNombreCompleto = () => {
    const data = bomberoData || bombero;
    
    if (data.nombreCompleto) return data.nombreCompleto;
    if (data.nombres && data.apellidos) {
      const nombres = Array.isArray(data.nombres) ? data.nombres.join(' ') : data.nombres;
      const apellidos = Array.isArray(data.apellidos) ? data.apellidos.join(' ') : data.apellidos;
      return `${nombres} ${apellidos}`.trim();
    }
    return data.ficha?.nombre || data.email?.split('@')[0] || `Bombero ${data.id}`;
  };

  // Obtener estado de servicio
  const getEstadoServicio = () => {
    const data = bomberoData || bombero;
    return data.activo ? 'En Servicio' : 'Fuera de Servicio';
  };

  // Obtener color del estado
  const getEstadoColor = () => {
    const data = bomberoData || bombero;
    return data.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  // Obtener último rol
  const getUltimoRol = () => {
    const data = bomberoData || bombero;
    if (data.roles && data.roles.length > 0) {
      return data.roles[0].nombre;
    }
    return 'Sin rol asignado';
  };

  if (!isOpen || !bombero) return null;

  return (
    <ModalPortal>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-[#4EB9FA] to-[#3A9BD9] rounded-t-2xl">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white rounded-lg">
                <MdPerson className="w-6 h-6 text-[#3A9BD9]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  Ficha de Bombero
                </h2>
                <p className="text-blue-100 text-sm">
                  Información completa del bombero
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {onEdit && (
                <button
                  onClick={() => onEdit(bombero)}
                  className="flex items-center space-x-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
                >
                  <MdEdit className="w-4 h-4" />
                  <span>Editar</span>
                </button>
              )}
              <button
                onClick={onClose}
                className="p-3 text-white hover:bg-red-500 hover:bg-opacity-80 rounded-lg transition-colors"
              >
                <MdClose className="w-6 h-6 text-red-300 hover:text-white" />
              </button>
            </div>
          </div>

          {/* Contenido scrolleable */}
          <div className="flex-1 overflow-y-auto overscroll-contain scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            {/* Tarjeta principal del bombero */}
            <div className="p-4 sm:p-6 bg-gray-50">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
              <div className="flex items-start space-x-6">
                {/* Avatar */}
                <div className="shrink-0">
                  <BomberoAvatar
                    src={bombero.ficha?.fotoPerfilURL}
                    alt={`Foto de ${getNombreCompleto()}`}
                    nombre={getNombreCompleto()}
                    size="2xl"
                    showBorder={true}
                    borderColor="border-gray-200"
                    isRound={true}
                    bombero={bombero}
                  />
                </div>

                {/* Información principal */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {getNombreCompleto()}
                  </h3>
                  
                  {/* Información de contacto */}
                  <div className="space-y-1 mb-4">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <MdEmail className="w-4 h-4" />
                      <span>{bombero.email}</span>
                    </div>
                    {bombero.ficha?.telefono && (
                      <div className="flex items-center space-x-2 text-gray-600">
                        <MdPhone className="w-4 h-4" />
                        <span>{bombero.ficha.telefono}</span>
                      </div>
                    )}
                  </div>

                  {/* Estados y fechas */}
                  <div className="flex flex-wrap gap-4">
                    <div className="flex flex-col">
                      <div className="flex space-x-2 mb-2">
                        <span className={`px-3 py-1 text-sm font-medium rounded-full ${getEstadoColor()}`}>
                          {getEstadoServicio()}
                        </span>
                        <span className="px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full">
                          {getUltimoRol()}
                        </span>
                      </div>
                      <div className="space-y-1 text-sm text-gray-600">
                        {bombero.ficha?.fechaIngreso && (
                          <div className="flex items-center space-x-2">
                            <MdDateRange className="w-4 h-4" />
                            <span>Ingreso: {formatDate(bombero.ficha.fechaIngreso)}</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-2">
                          <MdTrendingUp className="w-4 h-4" />
                          <span>Última actividad: Hoy</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </div>

            {/* Navegación de pestañas */}
            <div className="border-b border-gray-200 bg-white">
              <nav className="flex space-x-8 px-4 sm:px-6">
              {[
                { id: 'personal', label: 'Información Personal', icon: MdPerson },
                { id: 'emergency', label: 'Contactos de Emergencia', icon: MdEmergency },
                { id: 'training', label: 'Capacitación', icon: MdSchool },
                { id: 'history', label: 'Historial', icon: MdHistory }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
              </nav>
            </div>

            {/* Contenido de las pestañas */}
            <div className="p-4 sm:p-6 bg-gray-50">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
            {activeTab === 'personal' && (
              <div className="space-y-6">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <BomberosLoader size="md" message="Cargando información del bombero..." />
                  </div>
                ) : error ? (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <MdError className="w-5 h-5 text-red-600" />
                      <span className="text-red-800 font-medium">Error</span>
                    </div>
                    <p className="text-red-700 mt-1">{error}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Datos Personales */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Datos Personales</h4>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                          <p className="text-gray-900">{getNombreCompleto()}</p>
                        </div>
                        {(bomberoData?.run || bombero.run) && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">RUN</label>
                            <p className="text-gray-900 font-mono">{bomberoData?.run || bombero.run}</p>
                          </div>
                        )}
                        {(informacionPersonal?.fechaNacimiento || bombero.ficha?.fechaNacimiento) && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Nacimiento</label>
                            <p className="text-gray-900">
                              {formatDate(informacionPersonal?.fechaNacimiento || bombero.ficha?.fechaNacimiento)} 
                              {calculateAge(informacionPersonal?.fechaNacimiento || bombero.ficha?.fechaNacimiento) && ` (${calculateAge(informacionPersonal?.fechaNacimiento || bombero.ficha?.fechaNacimiento)} años)`}
                            </p>
                          </div>
                        )}
                        {(informacionPersonal?.direccion || bombero.ficha?.direccion) && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                            <div className="flex items-center space-x-2">
                              <MdLocationOn className="w-4 h-4 text-gray-400" />
                              <div className="flex-1">
                                <p className="text-gray-900">
                                  {(informacionPersonal?.direccion || bombero.ficha?.direccion)?.calle} {(informacionPersonal?.direccion || bombero.ficha?.direccion)?.numero}
                                  {(informacionPersonal?.direccion?.depto || bombero.ficha?.direccion?.depto) && `, ${(informacionPersonal?.direccion?.depto || bombero.ficha?.direccion?.depto)}`}
                                  {(informacionPersonal?.direccion?.comuna || bombero.ficha?.direccion?.comuna) && `, ${(informacionPersonal?.direccion?.comuna || bombero.ficha?.direccion?.comuna)?.nombre}`}
                                </p>
                                {(informacionPersonal?.direccion?.referencia || bombero.ficha?.direccion?.referencia) && (
                                  <p className="text-sm text-gray-600 mt-1">
                                    📍 {(informacionPersonal?.direccion?.referencia || bombero.ficha?.direccion?.referencia)}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Información de Contacto */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Información de Contacto</h4>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                          <div className="flex items-center space-x-2">
                            <MdEmail className="w-4 h-4 text-gray-400" />
                            <p className="text-gray-900">{bomberoData?.email || bombero.email}</p>
                          </div>
                        </div>
                        {(informacionPersonal?.telefono || bombero.ficha?.telefono) && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                            <div className="flex items-center space-x-2">
                              <MdPhone className="w-4 h-4 text-gray-400" />
                              <p className="text-gray-900">{informacionPersonal?.telefono || bombero.ficha?.telefono}</p>
                            </div>
                          </div>
                        )}
                        {(informacionPersonal?.fechaIngreso || bombero.ficha?.fechaIngreso) && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Ingreso</label>
                            <div className="flex items-center space-x-2">
                              <MdDateRange className="w-4 h-4 text-gray-400" />
                              <p className="text-gray-900">{formatDate(informacionPersonal?.fechaIngreso || bombero.ficha?.fechaIngreso)}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Información Médica */}
                    <div className="col-span-2">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Información Médica</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Información médica disponible */}
                        {(informacionPersonal?.donante || bombero.ficha?.donante) && (
                          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                            <div className="flex items-center space-x-2">
                              <MdFavorite className="w-5 h-5 text-red-600" />
                              <span className="font-medium text-red-800">Donante de órganos</span>
                            </div>
                          </div>
                        )}
                        
                        {(informacionPersonal?.tipoSangre || bombero.ficha?.tipoSangre) && (
                          <div className="bg-pink-50 p-4 rounded-lg border border-pink-200">
                            <div className="flex items-center space-x-2">
                              <MdFavorite className="w-5 h-5 text-pink-600" />
                              <span className="font-medium text-pink-800">
                                Tipo: {(informacionPersonal?.tipoSangre?.nombre) || (bombero.ficha?.tipoSangre?.nombre)}
                              </span>
                            </div>
                          </div>
                        )}

                        {(informacionPersonal?.licenciaClaseF || bombero.ficha?.licenciaClaseF) && (
                          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                            <div className="flex items-center space-x-2">
                              <MdWork className="w-5 h-5 text-green-600" />
                              <span className="font-medium text-green-800">Licencia Clase F</span>
                            </div>
                          </div>
                        )}

                        {/* Mensaje si no hay información médica */}
                        {!(informacionPersonal?.donante || bombero.ficha?.donante) && 
                         !(informacionPersonal?.tipoSangre || bombero.ficha?.tipoSangre) && 
                         !(informacionPersonal?.licenciaClaseF || bombero.ficha?.licenciaClaseF) && (
                          <div className="col-span-2 text-center py-6">
                            <MdFavorite className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                            <p className="text-gray-600 text-sm">No hay información médica registrada</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'emergency' && (
              <div className="space-y-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Contactos de Emergencia</h4>
                
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <BomberosLoader size="md" message="Cargando contactos de emergencia..." />
                  </div>
                ) : error ? (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <MdError className="w-5 h-5 text-red-600" />
                      <span className="text-red-800 font-medium">Error</span>
                    </div>
                    <p className="text-red-700 mt-1">{error}</p>
                  </div>
                ) : contactosEmergencia.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {contactosEmergencia.map((contacto) => (
                      <div key={contacto.id} className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <div className="flex items-center space-x-3">
                          <MdEmergency className="w-8 h-8 text-blue-600" />
                          <div className="flex-1">
                            <h5 className="font-semibold text-gray-900">{contacto.nombreCompleto}</h5>
                            <p className="text-sm text-gray-600">{contacto.vinculo?.nombre || 'Sin vínculo especificado'}</p>
                            <div className="flex items-center space-x-2 mt-2">
                              <MdPhone className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-700">{contacto.telefono}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MdEmergency className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No hay contactos de emergencia registrados</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'training' && (
              <div className="space-y-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Capacitaciones</h4>
                
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <BomberosLoader size="md" message="Cargando capacitaciones..." />
                  </div>
                ) : error ? (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <MdError className="w-5 h-5 text-red-600" />
                      <span className="text-red-800 font-medium">Error</span>
                    </div>
                    <p className="text-red-700 mt-1">{error}</p>
                  </div>
                ) : capacitaciones.length > 0 ? (
                  <div className="space-y-4">
                    {capacitaciones.map((capacitacion) => (
                      <div key={capacitacion.id} className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <div className="flex items-start space-x-3">
                          <MdSchool className="w-6 h-6 text-green-600 mt-1" />
                          <div className="flex-1">
                            <h5 className="font-semibold text-gray-900">
                              {capacitacion.tipoCapacitacion?.nombre || 'Capacitación'}
                            </h5>
                            {capacitacion.descripcion && (
                              <p className="text-sm text-gray-600 mt-1">{capacitacion.descripcion}</p>
                            )}
                            <div className="flex items-center space-x-2 mt-2">
                              <MdDateRange className="w-4 h-4 text-gray-400" />
                              <span className="text-xs text-gray-500">
                                Registrada: {formatDate(capacitacion.creadoEl)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MdSchool className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No hay capacitaciones registradas</p>
                  </div>
                )}
              </div>
            )}


            {activeTab === 'history' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-semibold text-gray-900">Historial de Actividades</h4>
                </div>
                
                {loadingHistorial ? (
                  <div className="flex items-center justify-center py-12">
                    <BomberosLoader size="md" message="Cargando historial..." />
                  </div>
                ) : errorHistorial ? (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <MdError className="w-5 h-5 text-red-600" />
                      <span className="text-red-800 font-medium">Error</span>
                    </div>
                    <p className="text-red-700 mt-1">{errorHistorial}</p>
                    <button
                      onClick={loadHistorial}
                      className="mt-3 px-4 py-2.5 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg text-sm font-medium shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                    >
                      Reintentar
                    </button>
                  </div>
                ) : (
                  <HistorialTable data={historialData} />
                )}
              </div>
              )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 bg-gradient-to-r from-[#4EB9FA] to-[#3A9BD9] rounded-b-2xl p-4">
          </div>
        </div>
      </div>
    </ModalPortal>
  );
};

export default BomberoFichaPopup;
