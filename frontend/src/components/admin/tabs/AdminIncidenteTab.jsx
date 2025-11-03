import React, { useEffect, useState, useMemo } from 'react';
import { useAdmin } from '@context/AdminContext';
import { useClaveRadial } from '@hooks/claveRadial/useClaveRadial.jsx';
import { useSubtipoIncidente } from '@hooks/subtipoIncidente/useSubtipoIncidente.jsx';
import { useClasificacionEmergencia } from '@hooks/clasificacionEmergencia/useClasificacionEmergencia.jsx';
import { showConfirmAlert } from '@helpers/fireAlert.js';
import { toStartCase } from '@helpers/textFormatters.js';

// Componentes
import Tooltip from '@components/Tooltip';
import PrimeTableBasic from '@components/PrimeTableBasic.jsx';
import BomberosLoader from '@components/BomberosLoader.jsx';
import CreateClaveRadialPopup from '@components/admin/popups/CreateClaveRadialPopup';
import EditClaveRadialPopup from '@components/admin/popups/EditClaveRadialPopup';
import CreateSubtipoIncidentePopup from '@components/admin/popups/CreateSubtipoIncidentePopup';
import EditSubtipoIncidentePopup from '@components/admin/popups/EditSubtipoIncidentePopup';
import CreateClasificacionEmergenciaPopup from '@components/admin/popups/CreateClasificacionEmergenciaPopup';
import EditClasificacionEmergenciaPopup from '@components/admin/popups/EditClasificacionEmergenciaPopup';

// Iconos
import { 
  MdAdd, 
  MdRefresh, 
  MdRadioButtonChecked,
  MdWarning,
  MdCategory,
  MdClear
} from 'react-icons/md';

/**
 * Componente específico para la gestión de Incidentes: Claves Radiales, Subtipos de Incidente y Clasificaciones de Emergencia
 */
const AdminIncidenteTab = () => {
  const { hasPermiso, refreshTrigger } = useAdmin();

  // Hooks personalizados
  const {
    clavesRadiales,
    loading: clavesRadialesLoading,
    error: clavesRadialesError,
    fetchClavesRadiales,
    deleteClaveRadial
  } = useClaveRadial();

  const {
    subtiposIncidentes,
    loading: subtiposIncidentesLoading,
    error: subtiposIncidentesError,
    fetchSubtiposIncidentes,
    deleteSubtipoIncidente
  } = useSubtipoIncidente();

  const {
    clasificacionesEmergencia,
    loading: clasificacionesEmergenciaLoading,
    error: clasificacionesEmergenciaError,
    fetchClasificacionesEmergencia,
    deleteClasificacionEmergencia
  } = useClasificacionEmergencia();

  // Estado local
  const [activeSubTab, setActiveSubTab] = useState('claves');
  const [showCreateClaveRadial, setShowCreateClaveRadial] = useState(false);
  const [showCreateSubtipoIncidente, setShowCreateSubtipoIncidente] = useState(false);
  const [showCreateClasificacionEmergencia, setShowCreateClasificacionEmergencia] = useState(false);
  const [showEditClaveRadial, setShowEditClaveRadial] = useState(false);
  const [showEditSubtipoIncidente, setShowEditSubtipoIncidente] = useState(false);
  const [showEditClasificacionEmergencia, setShowEditClasificacionEmergencia] = useState(false);
  const [selectedClaveRadial, setSelectedClaveRadial] = useState(null);
  const [selectedSubtipoIncidente, setSelectedSubtipoIncidente] = useState(null);
  const [selectedClasificacionEmergencia, setSelectedClasificacionEmergencia] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedClasificacionFilter, setSelectedClasificacionFilter] = useState('');

  const loading = activeSubTab === 'claves' 
    ? clavesRadialesLoading 
    : activeSubTab === 'subtipos'
    ? subtiposIncidentesLoading
    : clasificacionesEmergenciaLoading;
  
  const currentData = activeSubTab === 'claves' 
    ? clavesRadiales 
    : activeSubTab === 'subtipos'
    ? subtiposIncidentes
    : clasificacionesEmergencia;

  // Cargar datos cuando cambia refreshTrigger o el subtab
  useEffect(() => {
    if (hasPermiso('clave_radial:obtener') || hasPermiso('clave_radial:admin')) {
      fetchClavesRadiales({ page: 1, limit: 200 }, true);
    }
    if (hasPermiso('subtipo_incidente:obtener') || hasPermiso('subtipo_incidente:admin')) {
      const params = { page: 1, limit: 200 };
      if (selectedClasificacionFilter) {
        params.clasificacion = selectedClasificacionFilter;
      }
      fetchSubtiposIncidentes(params, true);
    }
    if (hasPermiso('clasificacion_emergencia:obtener') || hasPermiso('clasificacion_emergencia:admin')) {
      fetchClasificacionesEmergencia({ page: 1, limit: 200 }, true);
    }
  }, [refreshTrigger, hasPermiso, fetchClavesRadiales, fetchSubtiposIncidentes, fetchClasificacionesEmergencia, selectedClasificacionFilter]);

  // Handlers
  const handleCreate = () => {
    if (activeSubTab === 'claves') {
      setShowCreateClaveRadial(true);
      return;
    }
    if (activeSubTab === 'subtipos') {
      setShowCreateSubtipoIncidente(true);
      return;
    }
    if (activeSubTab === 'clasificaciones') {
      setShowCreateClasificacionEmergencia(true);
      return;
    }
  };

  const handleClaveRadialCreated = async () => {
    await fetchClavesRadiales({ page: 1, limit: 200 }, true);
    setIsCreating(false);
  };

  const handleSubtipoIncidenteCreated = async () => {
    await fetchSubtiposIncidentes({ page: 1, limit: 200 }, true);
    setIsCreating(false);
  };

  const handleClasificacionEmergenciaCreated = async () => {
    await fetchClasificacionesEmergencia({ page: 1, limit: 200 }, true);
    setIsCreating(false);
  };

  const handleEdit = (item) => {
    if (activeSubTab === 'claves') {
      setSelectedClaveRadial(item);
      setShowEditClaveRadial(true);
    } else if (activeSubTab === 'subtipos') {
      setSelectedSubtipoIncidente(item);
      setShowEditSubtipoIncidente(true);
    } else if (activeSubTab === 'clasificaciones') {
      setSelectedClasificacionEmergencia(item);
      setShowEditClasificacionEmergencia(true);
    }
  };

  const handleDelete = async (item) => {
    if (activeSubTab === 'claves') {
      await handleDeleteClaveRadial(item);
    } else if (activeSubTab === 'subtipos') {
      await handleDeleteSubtipoIncidente(item);
    } else if (activeSubTab === 'clasificaciones') {
      await handleDeleteClasificacionEmergencia(item);
    }
  };

  const handleClaveRadialUpdated = async () => {
    await fetchClavesRadiales({ page: 1, limit: 200 }, true);
    setIsUpdating(false);
  };

  const handleSubtipoIncidenteUpdated = async () => {
    await fetchSubtiposIncidentes({ page: 1, limit: 200 }, true);
    setIsUpdating(false);
  };

  const handleClasificacionEmergenciaUpdated = async () => {
    await fetchClasificacionesEmergencia({ page: 1, limit: 200 }, true);
    setIsUpdating(false);
  };

  const handleDeleteClaveRadial = async (claveRadial) => {
    const result = await showConfirmAlert(
      '¿Eliminar Clave Radial?',
      `¿Estás seguro de que quieres eliminar la clave radial "${toStartCase(claveRadial.nombre)}"? Esta acción no se puede deshacer.`,
      'Sí, eliminar',
      'Cancelar'
    );

    if (result.isConfirmed) {
      await deleteClaveRadial(claveRadial.id);
    }
  };

  const handleDeleteSubtipoIncidente = async (subtipoIncidente) => {
    const result = await showConfirmAlert(
      '¿Eliminar Subtipo de Incidente?',
      `¿Estás seguro de que quieres eliminar el subtipo de incidente "${subtipoIncidente.claveRadial}"? Esta acción no se puede deshacer.`,
      'Sí, eliminar',
      'Cancelar'
    );

    if (result.isConfirmed) {
      await deleteSubtipoIncidente(subtipoIncidente.id);
    }
  };

  const handleDeleteClasificacionEmergencia = async (clasificacionEmergencia) => {
    const result = await showConfirmAlert(
      '¿Eliminar Clasificación de Emergencia?',
      `¿Estás seguro de que quieres eliminar la clasificación de emergencia "${toStartCase(clasificacionEmergencia.nombre)}"? Esta acción no se puede deshacer.`,
      'Sí, eliminar',
      'Cancelar'
    );

    if (result.isConfirmed) {
      await deleteClasificacionEmergencia(clasificacionEmergencia.id);
    }
  };

  const handleRefresh = async () => {
    if (activeSubTab === 'claves') {
      await fetchClavesRadiales({ page: 1, limit: 200 }, true);
    } else if (activeSubTab === 'subtipos') {
      const params = { page: 1, limit: 200 };
      if (selectedClasificacionFilter) {
        params.clasificacion = selectedClasificacionFilter;
      }
      await fetchSubtiposIncidentes(params, true);
    } else if (activeSubTab === 'clasificaciones') {
      await fetchClasificacionesEmergencia({ page: 1, limit: 200 }, true);
    }
  };

  const handleSubTabChange = (subTab) => {
    setActiveSubTab(subTab);
    setSelectedClasificacionFilter(''); // Limpiar filtro al cambiar de subtab
  };

  const handleClasificacionFilterChange = async (clasificacionId) => {
    setSelectedClasificacionFilter(clasificacionId);
    // Recargar subtipos con el nuevo filtro
    if (hasPermiso('subtipo_incidente:obtener') || hasPermiso('subtipo_incidente:admin')) {
      const params = { page: 1, limit: 200 };
      if (clasificacionId) {
        params.clasificacion = clasificacionId;
      }
      await fetchSubtiposIncidentes(params, true);
    }
  };

  const clearClasificacionFilter = () => {
    setSelectedClasificacionFilter('');
    // Recargar subtipos sin filtro
    if (hasPermiso('subtipo_incidente:obtener') || hasPermiso('subtipo_incidente:admin')) {
      fetchSubtiposIncidentes({ page: 1, limit: 200 }, true);
    }
  };

  // Configuración de columnas para Claves Radiales
  const clavesColumns = useMemo(() => [
    {
      field: 'id',
      header: 'ID',
      sortable: true,
      style: { width: '80px' }
    },
    {
      field: 'nombre',
      header: 'Nombre',
      sortable: true,
      style: { width: '200px' },
      body: (rowData) => (
        <span className="font-medium text-gray-900">{toStartCase(rowData.nombre)}</span>
      )
    },
    {
      type: 'actions',
      header: 'Acciones',
      style: { width: '150px' }
    }
  ], []);

  // Configuración de columnas para Subtipos de Incidente
  const subtiposColumns = useMemo(() => [
    {
      field: 'id',
      header: 'ID',
      sortable: true,
      style: { width: '80px' }
    },
    {
      field: 'claveRadial',
      header: 'Clave Radial',
      sortable: true,
      style: { width: '150px' },
      body: (rowData) => (
        <span className="font-medium text-gray-900">{rowData.claveRadial}</span>
      )
    },
    {
      field: 'descripcion',
      header: 'Descripción',
      sortable: true,
      style: { width: '300px' },
      body: (rowData) => (
        <span className="text-gray-700">{rowData.descripcion}</span>
      )
    },
    {
      field: 'clasificacionEmergencia',
      header: 'Clasificación',
      sortable: false,
      style: { width: '200px' },
      body: (rowData) => (
        rowData.clasificacionEmergencia ? (
          <span className="text-gray-700">{toStartCase(rowData.clasificacionEmergencia.nombre)}</span>
        ) : (
          <span className="text-gray-400">N/A</span>
        )
      )
    },
    {
      type: 'actions',
      header: 'Acciones',
      style: { width: '150px' }
    }
  ], []);

  // Configuración de columnas para Clasificaciones de Emergencia
  const clasificacionesColumns = useMemo(() => [
    {
      field: 'id',
      header: 'ID',
      sortable: true,
      style: { width: '80px' }
    },
    {
      field: 'nombre',
      header: 'Nombre',
      sortable: true,
      style: { width: '300px' },
      body: (rowData) => (
        <span className="font-medium text-gray-900">{toStartCase(rowData.nombre)}</span>
      )
    },
    {
      type: 'actions',
      header: 'Acciones',
      style: { width: '150px' }
    }
  ], []);

  // Obtener datos y columnas según la subpestaña activa
  const currentColumns = activeSubTab === 'claves' 
    ? clavesColumns 
    : activeSubTab === 'subtipos'
    ? subtiposColumns
    : clasificacionesColumns;
  
  const canCreate = activeSubTab === 'claves' 
    ? hasPermiso('clave_radial:admin') 
    : activeSubTab === 'subtipos'
    ? hasPermiso('subtipo_incidente:admin')
    : hasPermiso('clasificacion_emergencia:admin');
  
  const canEdit = activeSubTab === 'claves' 
    ? hasPermiso('clave_radial:admin') 
    : activeSubTab === 'subtipos'
    ? hasPermiso('subtipo_incidente:admin')
    : hasPermiso('clasificacion_emergencia:admin');

  const getLoadingMessage = () => {
    if (activeSubTab === 'claves') return 'claves radiales';
    if (activeSubTab === 'subtipos') return 'subtipos de incidente';
    return 'clasificaciones de emergencia';
  };

  const getDataLabel = () => {
    if (activeSubTab === 'claves') return 'claves radiales';
    if (activeSubTab === 'subtipos') return 'subtipos de incidente';
    return 'clasificaciones de emergencia';
  };

  const getCreateButtonLabel = () => {
    if (activeSubTab === 'claves') return 'una nueva clave radial';
    if (activeSubTab === 'subtipos') return 'un nuevo subtipo de incidente';
    return 'una nueva clasificación de emergencia';
  };

  if (loading && currentData.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <BomberosLoader size="md" message={`Cargando ${getLoadingMessage()}...`} />
      </div>
    );
  }

  return (
    <>
      <div className="bg-white/80 backdrop-blur-lg border border-[#4EB9FA]/20 shadow-xl p-6 rounded-2xl">
        {/* Header de la sección */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Gestión de Incidentes</h2>
            <p className="text-gray-600 text-sm mt-1">
              Administra las claves radiales, subtipos de incidente y clasificaciones de emergencia utilizados en el sistema
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Filtro por clasificación (solo para subtipos) */}
            {activeSubTab === 'subtipos' && clasificacionesEmergencia.length > 0 && (
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MdCategory className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  value={selectedClasificacionFilter}
                  onChange={(e) => handleClasificacionFilterChange(e.target.value)}
                  className="block w-full pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm bg-white appearance-none cursor-pointer min-w-[200px]"
                >
                  <option value="">Todas las clasificaciones</option>
                  {clasificacionesEmergencia.map((clasificacion) => (
                    <option key={clasificacion.id} value={clasificacion.id.toString()}>
                      {toStartCase(clasificacion.nombre)}
                    </option>
                  ))}
                </select>
                {selectedClasificacionFilter && (
                  <button
                    onClick={clearClasificacionFilter}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    title="Limpiar filtro"
                  >
                    <MdClear className="h-5 w-5" />
                  </button>
                )}
              </div>
            )}

            {/* Estadísticas */}
            <span className="text-sm text-gray-600">
              Total: {currentData.length} {getDataLabel()}
            </span>

            {/* Botón refresh */}
            <Tooltip
              id="refresh-btn"
              content={`Actualizar lista de ${getDataLabel()}`}
              place="top"
              variant="dark"
            >
              <button
                onClick={handleRefresh}
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

            {/* Botón crear */}
            {canCreate && (
              <Tooltip
                id="create-btn"
                content={`Crear ${getCreateButtonLabel()} en el sistema`}
                place="top"
                variant="dark"
              >
                <button
                  onClick={handleCreate}
                  disabled={isCreating || loading}
                  className={`font-semibold px-4 py-2 rounded-lg shadow transition-all duration-200 border ${
                    isCreating 
                      ? 'bg-gray-400 text-gray-200 border-gray-400 cursor-not-allowed' 
                      : 'bg-[#2C3E50] hover:bg-[#34495E] text-white border-[#2C3E50] hover:-translate-y-0.5 hover:scale-105'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {isCreating ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <MdAdd size={18} />
                    )}
                    <span className="hidden sm:inline">
                      {isCreating ? 'Creando...' : `Crear ${activeSubTab === 'claves' ? 'clave radial' : activeSubTab === 'subtipos' ? 'subtipo' : 'clasificación'}`}
                    </span>
                  </span>
                </button>
              </Tooltip>
            )}
          </div>
        </div>

        {/* Subtabs para claves radiales, subtipos y clasificaciones */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => handleSubTabChange('claves')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              activeSubTab === 'claves'
                ? 'bg-[#4EB9FA] text-white shadow-lg'
                : 'text-gray-600 hover:text-[#4EB9FA] hover:bg-[#4EB9FA]/10'
            }`}
          >
            <MdRadioButtonChecked size={18} />
            <span>Claves Radiales</span>
          </button>
          <button
            onClick={() => handleSubTabChange('subtipos')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              activeSubTab === 'subtipos'
                ? 'bg-[#4EB9FA] text-white shadow-lg'
                : 'text-gray-600 hover:text-[#4EB9FA] hover:bg-[#4EB9FA]/10'
            }`}
          >
            <MdWarning size={18} />
            <span>Subtipos de Incidente</span>
          </button>
          <button
            onClick={() => handleSubTabChange('clasificaciones')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              activeSubTab === 'clasificaciones'
                ? 'bg-[#4EB9FA] text-white shadow-lg'
                : 'text-gray-600 hover:text-[#4EB9FA] hover:bg-[#4EB9FA]/10'
            }`}
          >
            <MdCategory size={18} />
            <span>Clasificaciones de Emergencia</span>
          </button>
        </div>

        {/* Tabla con PrimeTableBasic */}
        <PrimeTableBasic
          data={currentData}
          columns={currentColumns}
          loading={loading}
          onEdit={canEdit ? handleEdit : undefined}
          onDelete={canEdit ? handleDelete : undefined}
          searchPlaceholder={`Buscar ${getDataLabel()}...`}
          showSearch={true}
          showAddButton={false}
          emptyMessage={`No hay ${getDataLabel()} registrados`}
          rowsPerPage={10}
        />

        {/* Error */}
        {(clavesRadialesError || subtiposIncidentesError || clasificacionesEmergenciaError) && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">{clavesRadialesError || subtiposIncidentesError || clasificacionesEmergenciaError}</p>
          </div>
        )}
      </div>

      {/* Popups para Claves Radiales */}
      <CreateClaveRadialPopup
        show={showCreateClaveRadial}
        setShow={(show) => {
          setShowCreateClaveRadial(show);
          if (!show) setIsCreating(false);
        }}
        onClaveRadialCreated={handleClaveRadialCreated}
        onCreatingChange={setIsCreating}
      />

      <EditClaveRadialPopup
        show={showEditClaveRadial}
        setShow={(show) => {
          setShowEditClaveRadial(show);
          if (!show) {
            setSelectedClaveRadial(null);
            setIsUpdating(false);
          }
        }}
        data={selectedClaveRadial}
        onClaveRadialUpdated={handleClaveRadialUpdated}
        onUpdatingChange={setIsUpdating}
      />

      {/* Popups para Subtipos de Incidente */}
      <CreateSubtipoIncidentePopup
        show={showCreateSubtipoIncidente}
        setShow={(show) => {
          setShowCreateSubtipoIncidente(show);
          if (!show) setIsCreating(false);
        }}
        onSubtipoIncidenteCreated={handleSubtipoIncidenteCreated}
        onCreatingChange={setIsCreating}
      />

      <EditSubtipoIncidentePopup
        show={showEditSubtipoIncidente}
        setShow={(show) => {
          setShowEditSubtipoIncidente(show);
          if (!show) {
            setSelectedSubtipoIncidente(null);
            setIsUpdating(false);
          }
        }}
        data={selectedSubtipoIncidente}
        onSubtipoIncidenteUpdated={handleSubtipoIncidenteUpdated}
        onUpdatingChange={setIsUpdating}
      />

      {/* Popups para Clasificaciones de Emergencia */}
      <CreateClasificacionEmergenciaPopup
        show={showCreateClasificacionEmergencia}
        setShow={(show) => {
          setShowCreateClasificacionEmergencia(show);
          if (!show) setIsCreating(false);
        }}
        onClasificacionEmergenciaCreated={handleClasificacionEmergenciaCreated}
        onCreatingChange={setIsCreating}
      />

      <EditClasificacionEmergenciaPopup
        show={showEditClasificacionEmergencia}
        setShow={(show) => {
          setShowEditClasificacionEmergencia(show);
          if (!show) {
            setSelectedClasificacionEmergencia(null);
            setIsUpdating(false);
          }
        }}
        data={selectedClasificacionEmergencia}
        onClasificacionEmergenciaUpdated={handleClasificacionEmergenciaUpdated}
        onUpdatingChange={setIsUpdating}
      />
    </>
  );
};

export default AdminIncidenteTab;
