import React, { useEffect, useState, useMemo } from 'react';
import { useAdmin } from '@context/AdminContext';
import { useEstadoCivil } from '@hooks/estadoCivil/useEstadoCivil.jsx';
import { useServicio } from '@hooks/servicio/useServicio.jsx';
import { useTiposEvento } from '@hooks/tiposEvento/useTiposEvento.jsx';
import { useVinculo } from '@hooks/vinculo/useVinculo.jsx';
import { showConfirmAlert } from '@helpers/fireAlert.js';
import { toStartCase } from '@helpers/textFormatters.js';

// Componentes
import Tooltip from '@components/Tooltip';
import PrimeTableBasic from '@components/PrimeTableBasic.jsx';
import BomberosLoader from '@components/BomberosLoader.jsx';
import CreateEstadoCivilPopup from '@components/admin/popups/CreateEstadoCivilPopup';
import CreateServicioPopup from '@components/admin/popups/CreateServicioPopup';
import CreateTipoEventoPopup from '@components/tiposEvento/CreateTipoEventoPopup';
import UpdateTipoEventoPopup from '@components/tiposEvento/UpdateTipoEventoPopup';
import CreateVinculoPopup from '@components/admin/popups/CreateVinculoPopup';
import EditVinculoPopup from '@components/admin/popups/EditVinculoPopup';

// Iconos
import { 
  MdAdd, 
  MdRefresh, 
  MdPeople,
  MdLocalHospital,
  MdEvent,
  MdLink
} from 'react-icons/md';

/**
 * Componente para la gestión de múltiples entidades administrativas
 * Contiene subtabs para: Estados Civiles, Servicios, Tipos de Evento y Vínculos
 */
const AdminExtraTabs = () => {
  const { hasPermiso, refreshTrigger } = useAdmin();

  // Hooks personalizados
  const {
    estadosCiviles,
    loading: estadosCivilesLoading,
    error: estadosCivilesError,
    fetchEstadosCiviles,
    deleteEstadoCivil
  } = useEstadoCivil();

  const {
    servicios,
    loading: serviciosLoading,
    error: serviciosError,
    fetchServicios,
    deleteServicio
  } = useServicio();

  const {
    tiposEvento,
    loading: tiposEventoLoading,
    error: tiposEventoError,
    fetchTiposEvento,
    handleCreateTipoEvento,
    handleUpdateTipoEvento,
    handleDeleteTipoEvento
  } = useTiposEvento();

  const {
    vinculos,
    loading: vinculosLoading,
    error: vinculosError,
    fetchVinculos,
    deleteVinculo
  } = useVinculo();

  // Estado local
  const [activeSubTab, setActiveSubTab] = useState('estadosCiviles');
  const [showCreateEstadoCivil, setShowCreateEstadoCivil] = useState(false);
  const [showCreateServicio, setShowCreateServicio] = useState(false);
  const [showCreateTipoEvento, setShowCreateTipoEvento] = useState(false);
  const [showUpdateTipoEvento, setShowUpdateTipoEvento] = useState(false);
  const [showCreateVinculo, setShowCreateVinculo] = useState(false);
  const [showEditVinculo, setShowEditVinculo] = useState(false);
  const [selectedTipoEvento, setSelectedTipoEvento] = useState(null);
  const [selectedVinculo, setSelectedVinculo] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Determinar loading y datos según subtab activo
  const loading = useMemo(() => {
    switch (activeSubTab) {
      case 'estadosCiviles': return estadosCivilesLoading;
      case 'servicios': return serviciosLoading;
      case 'tiposEvento': return tiposEventoLoading;
      case 'vinculos': return vinculosLoading;
      default: return false;
    }
  }, [activeSubTab, estadosCivilesLoading, serviciosLoading, tiposEventoLoading, vinculosLoading]);

  const currentData = useMemo(() => {
    switch (activeSubTab) {
      case 'estadosCiviles': return estadosCiviles;
      case 'servicios': return servicios;
      case 'tiposEvento': return tiposEvento;
      case 'vinculos': return vinculos;
      default: return [];
    }
  }, [activeSubTab, estadosCiviles, servicios, tiposEvento, vinculos]);

  // Cargar datos cuando cambia refreshTrigger o el subtab
  useEffect(() => {
    if (hasPermiso('estadoCivil:obtener') || hasPermiso('estadoCivil:admin')) {
      fetchEstadosCiviles({}, true);
    }
    if (hasPermiso('servicio:obtener') || hasPermiso('servicio:admin')) {
      fetchServicios({}, true);
    }
    if (hasPermiso('tipoEvento:obtener') || hasPermiso('tipoEvento:admin')) {
      fetchTiposEvento(true);
    }
    if (hasPermiso('vinculo:obtener') || hasPermiso('vinculo:admin')) {
      fetchVinculos({ page: 1, limit: 200 }, true);
    }
  }, [refreshTrigger, hasPermiso, fetchEstadosCiviles, fetchServicios, fetchTiposEvento, fetchVinculos]);

  // Handlers
  const handleCreate = () => {
    switch (activeSubTab) {
      case 'estadosCiviles':
        setShowCreateEstadoCivil(true);
        break;
      case 'servicios':
        setShowCreateServicio(true);
        break;
      case 'tiposEvento':
        setShowCreateTipoEvento(true);
        break;
      case 'vinculos':
        setShowCreateVinculo(true);
        break;
    }
  };

  const handleEdit = (item) => {
    if (activeSubTab === 'tiposEvento') {
      setSelectedTipoEvento(item);
      setShowUpdateTipoEvento(true);
    } else if (activeSubTab === 'vinculos') {
      setSelectedVinculo(item);
      setShowEditVinculo(true);
    }
  };

  const handleDelete = async (item) => {
    switch (activeSubTab) {
      case 'estadosCiviles':
        await handleDeleteEstadoCivil(item);
        break;
      case 'servicios':
        await handleDeleteServicio(item);
        break;
      case 'tiposEvento':
        await handleDeleteTipoEventoFunc(item);
        break;
      case 'vinculos':
        await handleDeleteVinculo(item);
        break;
    }
  };

  const handleDeleteEstadoCivil = async (estado) => {
    const result = await showConfirmAlert(
      '¿Eliminar Estado Civil?',
      `¿Estás seguro de que quieres eliminar el estado civil "${toStartCase(estado.nombre)}"? Esta acción no se puede deshacer.`,
      'Sí, eliminar',
      'Cancelar'
    );

    if (result.isConfirmed) {
      await deleteEstadoCivil(estado.id);
    }
  };

  const handleDeleteServicio = async (servicio) => {
    const result = await showConfirmAlert(
      '¿Eliminar Servicio?',
      `¿Estás seguro de que quieres eliminar el servicio "${toStartCase(servicio.nombre)}"? Esta acción no se puede deshacer.`,
      'Sí, eliminar',
      'Cancelar'
    );

    if (result.isConfirmed) {
      await deleteServicio(servicio.id);
    }
  };

  const handleDeleteTipoEventoFunc = async (tipoEvento) => {
    const result = await showConfirmAlert(
      '¿Eliminar Tipo de Evento?',
      `¿Estás seguro de que quieres eliminar el tipo de evento "${toStartCase(tipoEvento.nombre)}"? Esta acción no se puede deshacer.`,
      'Sí, eliminar',
      'Cancelar'
    );

    if (result.isConfirmed) {
      await handleDeleteTipoEvento(tipoEvento.id);
    }
  };

  const handleDeleteVinculo = async (vinculo) => {
    const result = await showConfirmAlert(
      '¿Eliminar Vínculo?',
      `¿Estás seguro de que quieres eliminar el vínculo "${toStartCase(vinculo.nombre)}"? Esta acción no se puede deshacer.`,
      'Sí, eliminar',
      'Cancelar'
    );

    if (result.isConfirmed) {
      await deleteVinculo(vinculo.id);
    }
  };

  const handleRefresh = async () => {
    switch (activeSubTab) {
      case 'estadosCiviles':
        await fetchEstadosCiviles({}, true);
        break;
      case 'servicios':
        await fetchServicios({}, true);
        break;
      case 'tiposEvento':
        await fetchTiposEvento(true);
        break;
      case 'vinculos':
        await fetchVinculos({ page: 1, limit: 200 }, true);
        break;
    }
  };

  const handleSubTabChange = (subTab) => {
    setActiveSubTab(subTab);
  };

  // Configuración de columnas para Estados Civiles
  const estadosCivilesColumns = useMemo(() => [
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

  // Configuración de columnas para Servicios
  const serviciosColumns = useMemo(() => [
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

  // Configuración de columnas para Tipos de Evento
  const tiposEventoColumns = useMemo(() => [
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
      body: (rowData) => (
        <span className="font-medium text-gray-900">{toStartCase(rowData.nombre)}</span>
      )
    },
    {
      field: 'descripcion',
      header: 'Descripción',
      sortable: true,
      body: (rowData) => (
        <span className="text-gray-600 text-sm">{rowData.descripcion || 'Sin descripción'}</span>
      )
    },
    {
      type: 'actions',
      header: 'Acciones',
      style: { width: '150px' }
    }
  ], []);

  // Configuración de columnas para Vínculos
  const vinculosColumns = useMemo(() => [
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

  // Obtener columnas según subtab activo
  const currentColumns = useMemo(() => {
    switch (activeSubTab) {
      case 'estadosCiviles': return estadosCivilesColumns;
      case 'servicios': return serviciosColumns;
      case 'tiposEvento': return tiposEventoColumns;
      case 'vinculos': return vinculosColumns;
      default: return estadosCivilesColumns;
    }
  }, [activeSubTab, estadosCivilesColumns, serviciosColumns, tiposEventoColumns, vinculosColumns]);

  // Permisos según subtab activo
  const canCreate = useMemo(() => {
    switch (activeSubTab) {
      case 'estadosCiviles': return hasPermiso('estadoCivil:admin');
      case 'servicios': return hasPermiso('servicio:admin');
      case 'tiposEvento': return hasPermiso('tipoEvento:admin');
      case 'vinculos': return hasPermiso('vinculo:admin');
      default: return false;
    }
  }, [activeSubTab, hasPermiso]);

  const canEdit = useMemo(() => {
    switch (activeSubTab) {
      case 'estadosCiviles': return false; // No tiene edición
      case 'servicios': return false; // No tiene edición
      case 'tiposEvento': return hasPermiso('tipoEvento:admin');
      case 'vinculos': return hasPermiso('vinculo:admin');
      default: return false;
    }
  }, [activeSubTab, hasPermiso]);

  // Labels para subtabs
  const subTabLabels = {
    estadosCiviles: 'Estados Civiles',
    servicios: 'Servicios',
    tiposEvento: 'Tipos de Evento',
    vinculos: 'Vínculos'
  };

  // Icons para subtabs
  const subTabIcons = {
    estadosCiviles: MdPeople,
    servicios: MdLocalHospital,
    tiposEvento: MdEvent,
    vinculos: MdLink
  };

  if (loading && currentData.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <BomberosLoader size="md" message={`Cargando ${subTabLabels[activeSubTab]}...`} />
      </div>
    );
  }

  return (
    <>
      <div className="bg-white/80 backdrop-blur-lg border border-[#4EB9FA]/20 shadow-xl p-6 rounded-2xl">
        {/* Header de la sección */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Gestión Adicional</h2>
            <p className="text-gray-600 text-sm mt-1">
              Administra estados civiles, servicios, tipos de evento y vínculos
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Estadísticas */}
            <span className="text-sm text-gray-600">
              Total: {currentData.length} {subTabLabels[activeSubTab].toLowerCase()}
            </span>

            {/* Botón refresh */}
            <Tooltip
              id="refresh-extra-btn"
              content={`Actualizar lista de ${subTabLabels[activeSubTab].toLowerCase()}`}
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
                id="create-extra-btn"
                content={`Crear ${activeSubTab === 'estadosCiviles' ? 'un nuevo estado civil' : activeSubTab === 'servicios' ? 'un nuevo servicio' : activeSubTab === 'tiposEvento' ? 'un nuevo tipo de evento' : 'un nuevo vínculo'} en el sistema`}
                place="top"
                variant="dark"
              >
                <button
                  onClick={handleCreate}
                  disabled={isCreating}
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
                      {isCreating ? 'Creando...' : `Crear ${activeSubTab === 'estadosCiviles' ? 'estado civil' : activeSubTab === 'servicios' ? 'servicio' : activeSubTab === 'tiposEvento' ? 'tipo evento' : 'vínculo'}`}
                    </span>
                  </span>
                </button>
              </Tooltip>
            )}
          </div>
        </div>

        {/* Subtabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {Object.entries(subTabLabels).map(([key, label]) => {
            const Icon = subTabIcons[key];
            return (
              <button
                key={key}
                onClick={() => handleSubTabChange(key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  activeSubTab === key
                    ? 'bg-[#4EB9FA] text-white shadow-lg'
                    : 'text-gray-600 hover:text-[#4EB9FA] hover:bg-[#4EB9FA]/10'
                }`}
              >
                <Icon size={18} />
                <span>{label}</span>
              </button>
            );
          })}
        </div>

        {/* Tabla con PrimeTableBasic */}
        <PrimeTableBasic
          data={currentData}
          columns={currentColumns}
          loading={loading}
          onEdit={canEdit ? handleEdit : undefined}
          onDelete={canCreate ? handleDelete : undefined}
          searchPlaceholder={`Buscar ${subTabLabels[activeSubTab].toLowerCase()}...`}
          showSearch={true}
          showAddButton={false}
          emptyMessage={`No hay ${subTabLabels[activeSubTab].toLowerCase()} registrados`}
          rowsPerPage={10}
        />

        {/* Error */}
        {(estadosCivilesError || serviciosError || tiposEventoError || vinculosError) && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">
              {estadosCivilesError || serviciosError || tiposEventoError || vinculosError}
            </p>
          </div>
        )}
      </div>

      {/* Modal Crear Estado Civil */}
      <CreateEstadoCivilPopup
        show={showCreateEstadoCivil}
        setShow={(show) => {
          setShowCreateEstadoCivil(show);
          if (!show) setIsCreating(false);
        }}
        onEstadoCivilCreated={() => {
          fetchEstadosCiviles({}, true);
          setIsCreating(false);
        }}
        onCreatingChange={setIsCreating}
      />

      {/* Modal Crear Servicio */}
      <CreateServicioPopup
        show={showCreateServicio}
        setShow={(show) => {
          setShowCreateServicio(show);
          if (!show) setIsCreating(false);
        }}
        onServicioCreated={() => {
          fetchServicios({}, true);
          setIsCreating(false);
        }}
        onCreatingChange={setIsCreating}
      />

      {/* Modal Crear Tipo Evento */}
      <CreateTipoEventoPopup
        show={showCreateTipoEvento}
        setShow={(show) => {
          setShowCreateTipoEvento(show);
          if (!show) setIsCreating(false);
        }}
        onTipoEventoCreated={async (data) => {
          setIsCreating(true);
          try {
            const result = await handleCreateTipoEvento(data);
            if (result.success) {
              fetchTiposEvento(true);
            }
            setIsCreating(false);
            return result;
          } catch (error) {
            setIsCreating(false);
            return { success: false, error: error.message };
          }
        }}
      />

      {/* Modal Actualizar Tipo Evento */}
      <UpdateTipoEventoPopup
        show={showUpdateTipoEvento}
        setShow={(show) => {
          setShowUpdateTipoEvento(show);
          if (!show) {
            setSelectedTipoEvento(null);
            setIsUpdating(false);
          }
        }}
        onTipoEventoUpdated={async (data) => {
          setIsUpdating(true);
          try {
            const result = await handleUpdateTipoEvento(selectedTipoEvento.id, data);
            if (result.success) {
              fetchTiposEvento(true);
            }
            setIsUpdating(false);
            return result;
          } catch (error) {
            setIsUpdating(false);
            return { success: false, error: error.message };
          }
        }}
        editingTipoEvento={selectedTipoEvento}
      />

      {/* Modal Crear Vínculo */}
      <CreateVinculoPopup
        show={showCreateVinculo}
        setShow={(show) => {
          setShowCreateVinculo(show);
          if (!show) setIsCreating(false);
        }}
        onVinculoCreated={() => {
          fetchVinculos({ page: 1, limit: 200 }, true);
          setIsCreating(false);
        }}
        onCreatingChange={setIsCreating}
      />

      {/* Modal Editar Vínculo */}
      <EditVinculoPopup
        show={showEditVinculo}
        setShow={(show) => {
          setShowEditVinculo(show);
          if (!show) {
            setSelectedVinculo(null);
            setIsUpdating(false);
          }
        }}
        data={selectedVinculo}
        onVinculoUpdated={() => {
          fetchVinculos({ page: 1, limit: 200 }, true);
          setIsUpdating(false);
        }}
        onUpdatingChange={setIsUpdating}
      />
    </>
  );
};

export default AdminExtraTabs;

