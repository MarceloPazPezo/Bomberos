import React, { useEffect, useState, useMemo } from 'react';
import { useAdmin } from '@context/AdminContext';
import { useTipoEpp } from '@hooks/tipoEpp/useTipoEpp.jsx';
import { useEstadoEpp } from '@hooks/estadoEpp/useEstadoEpp.jsx';
import { showConfirmAlert } from '@helpers/fireAlert.js';
import { toStartCase } from '@helpers/textFormatters.js';
import EppService from '@services/epp.service';

// Componentes
import Tooltip from '@components/Tooltip';
import ModalPortal from '@components/ModalPortal';
import PrimeTableBasic from '@components/PrimeTableBasic.jsx';
import BomberosLoader from '@components/BomberosLoader.jsx';
import CreateTipoEppPopup from '@components/admin/popups/CreateTipoEppPopup';
import CreateEstadoEppPopup from '@components/admin/popups/CreateEstadoEppPopup';
import EditTipoEppPopup from '@components/admin/popups/EditTipoEppPopup';
import EditEstadoEppPopup from '@components/admin/popups/EditEstadoEppPopup';

// Iconos
import { 
  MdAdd, 
  MdRefresh, 
  MdCategory, 
  MdCheckCircle,
  MdClose,
  MdSearch,
  MdClear,
  MdShield
} from 'react-icons/md';

/**
 * Componente específico para la gestión de Tipos y Estados de EPP
 * Contiene toda la lógica relacionada con la administración de tipos y estados de EPP
 */
const AdminTipoEppTab = () => {
  const { hasPermiso, refreshTrigger } = useAdmin();

  // Hooks personalizados
  const {
    tiposEpp,
    loading: tiposEppLoading,
    error: tiposEppError,
    fetchTiposEpp,
    deleteTipoEpp
  } = useTipoEpp();

  const {
    estadosEpp,
    loading: estadosEppLoading,
    error: estadosEppError,
    fetchEstadosEpp,
    deleteEstadoEpp
  } = useEstadoEpp();

  // Estado local
  const [activeSubTab, setActiveSubTab] = useState('tipos');
  const [showCreateTipoEpp, setShowCreateTipoEpp] = useState(false);
  const [showCreateEstadoEpp, setShowCreateEstadoEpp] = useState(false);
  const [showEditTipoEpp, setShowEditTipoEpp] = useState(false);
  const [showEditEstadoEpp, setShowEditEstadoEpp] = useState(false);
  const [selectedTipoEpp, setSelectedTipoEpp] = useState(null);
  const [selectedEstadoEpp, setSelectedEstadoEpp] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Estados para modal de detalle
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailData, setDetailData] = useState(null);
  const [detailEpps, setDetailEpps] = useState([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailSearchTerm, setDetailSearchTerm] = useState('');

  const loading = activeSubTab === 'tipos' ? tiposEppLoading : estadosEppLoading;
  const currentData = activeSubTab === 'tipos' ? tiposEpp : estadosEpp;

  // Cargar datos cuando cambia refreshTrigger o el subtab
  useEffect(() => {
    if (hasPermiso('tipo_epp:obtener') || hasPermiso('tipo_epp:admin')) {
      fetchTiposEpp({ page: 1, limit: 200 }, true);
    }
    if (hasPermiso('estado_epp:obtener') || hasPermiso('estado_epp:admin')) {
      fetchEstadosEpp({ page: 1, limit: 200 }, true);
    }
  }, [refreshTrigger, hasPermiso, fetchTiposEpp, fetchEstadosEpp]);

  // Handlers
  const handleCreate = () => {
    if (activeSubTab === 'tipos') {
      setShowCreateTipoEpp(true);
      return;
    }
    if (activeSubTab === 'estados') {
      setShowCreateEstadoEpp(true);
      return;
    }
  };

  const handleTipoEppCreated = async () => {
    await fetchTiposEpp({ page: 1, limit: 200 }, true);
    setIsCreating(false);
  };

  const handleEstadoEppCreated = async () => {
    await fetchEstadosEpp({ page: 1, limit: 200 }, true);
    setIsCreating(false);
  };

  const handleEdit = (item) => {
    if (activeSubTab === 'tipos') {
      setSelectedTipoEpp(item);
      setShowEditTipoEpp(true);
    } else {
      setSelectedEstadoEpp(item);
      setShowEditEstadoEpp(true);
    }
  };

  const handleDelete = async (item) => {
    if (activeSubTab === 'tipos') {
      await handleDeleteTipoEpp(item);
    } else {
      await handleDeleteEstadoEpp(item);
    }
  };

  const handleTipoEppUpdated = async () => {
    await fetchTiposEpp({ page: 1, limit: 200 }, true);
    setIsUpdating(false);
  };

  const handleEstadoEppUpdated = async () => {
    await fetchEstadosEpp({ page: 1, limit: 200 }, true);
    setIsUpdating(false);
  };

  const handleDeleteTipoEpp = async (tipoEpp) => {
    const result = await showConfirmAlert(
      '¿Eliminar Tipo de EPP?',
      `¿Estás seguro de que quieres eliminar el tipo de EPP "${toStartCase(tipoEpp.nombre)}"? Esta acción no se puede deshacer.`,
      'Sí, eliminar',
      'Cancelar'
    );

    if (result.isConfirmed) {
      await deleteTipoEpp(tipoEpp.id);
    }
  };

  const handleDeleteEstadoEpp = async (estadoEpp) => {
    const result = await showConfirmAlert(
      '¿Eliminar Estado de EPP?',
      `¿Estás seguro de que quieres eliminar el estado de EPP "${toStartCase(estadoEpp.nombre)}"? Esta acción no se puede deshacer.`,
      'Sí, eliminar',
      'Cancelar'
    );

    if (result.isConfirmed) {
      await deleteEstadoEpp(estadoEpp.id);
    }
  };

  const handleRefresh = async () => {
    if (activeSubTab === 'tipos') {
      await fetchTiposEpp({ page: 1, limit: 200 }, true);
    } else {
      await fetchEstadosEpp({ page: 1, limit: 200 }, true);
    }
  };

  const handleSubTabChange = (subTab) => {
    setActiveSubTab(subTab);
  };

  // Handler para mostrar detalle (solo estadísticas)
  const handleShowDetail = async (item) => {
    setDetailData(item);
    setShowDetailModal(true);
    setDetailLoading(true);
    setDetailSearchTerm('');
    
    try {
      const filters = activeSubTab === 'tipos' 
        ? { idTipoEpp: item.id, limit: 1, page: 1 }
        : { idEstadoEpp: item.id, limit: 1, page: 1 };
      
      const response = await EppService.searchEpp(filters);
      
      // Solo necesitamos el total de la paginación para mostrar el contador
      let total = 0;
      if (response?.status === 'Success' && response?.data) {
        total = response.data.pagination?.total || 0;
      } else if (response?.pagination?.total) {
        total = response.pagination.total;
      } else if (response?.data?.pagination?.total) {
        total = response.data.pagination.total;
      }
      
      // Guardamos el total en detailEpps.length para mantener compatibilidad con el render
      setDetailEpps(Array(total).fill(null).map((_, i) => ({ id: i, placeholder: true })));
    } catch (error) {
      console.error('Error al cargar estadísticas de EPP:', error);
      setDetailEpps([]);
    } finally {
      setDetailLoading(false);
    }
  };

  // Configuración de columnas para Tipos de EPP
  const tiposColumns = useMemo(() => [
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

  // Configuración de columnas para Estados de EPP
  const estadosColumns = useMemo(() => [
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

  // Obtener datos y columnas según la subpestaña activa
  const currentColumns = activeSubTab === 'tipos' ? tiposColumns : estadosColumns;
  const canCreate = activeSubTab === 'tipos' 
    ? hasPermiso('tipo_epp:admin') 
    : hasPermiso('estado_epp:admin');
  const canEdit = activeSubTab === 'tipos' 
    ? hasPermiso('tipo_epp:admin') 
    : hasPermiso('estado_epp:admin');


  if (loading && currentData.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <BomberosLoader size="md" message={`Cargando ${activeSubTab === 'tipos' ? 'tipos' : 'estados'} de EPP...`} />
      </div>
    );
  }

  return (
    <>
      <div className="bg-white/80 backdrop-blur-lg border border-[#4EB9FA]/20 shadow-md p-6 rounded-2xl">
        {/* Header de la sección */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Gestión de EPP</h2>
            <p className="text-gray-600 text-sm mt-1">
              Administra los tipos y estados de Equipos de Protección Personal
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Estadísticas */}
            <span className="text-sm text-gray-600">
              Total: {currentData.length} {activeSubTab === 'tipos' ? 'tipos' : 'estados'}
            </span>

            {/* Botón refresh */}
            <Tooltip
              id="refresh-epp-btn"
              content={`Actualizar lista de ${activeSubTab === 'tipos' ? 'tipos' : 'estados'}`}
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
                id="create-epp-btn"
                content={`Crear ${activeSubTab === 'tipos' ? 'un nuevo tipo de EPP' : 'un nuevo estado de EPP'} en el sistema`}
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
                      {isCreating ? 'Creando...' : `Crear ${activeSubTab === 'tipos' ? 'tipo' : 'estado'}`}
                    </span>
                  </span>
                </button>
              </Tooltip>
            )}
          </div>
        </div>

        {/* Tabs de filtro con estilo border-bottom */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => handleSubTabChange('tipos')}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeSubTab === 'tipos'
                  ? 'border-[#4EB9FA] text-[#4EB9FA]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <MdCategory size={18} />
              <span>Tipos de EPP</span>
            </button>
            <button
              onClick={() => handleSubTabChange('estados')}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeSubTab === 'estados'
                  ? 'border-[#4EB9FA] text-[#4EB9FA]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <MdCheckCircle size={18} />
              <span>Estados de EPP</span>
            </button>
          </nav>
        </div>

        {/* Tabla con PrimeTableBasic */}
        <PrimeTableBasic
          data={currentData}
          columns={currentColumns}
          loading={loading}
          onViewDetail={handleShowDetail}
          onEdit={canEdit ? handleEdit : undefined}
          onDelete={canEdit ? handleDelete : undefined}
          searchPlaceholder={`Buscar ${activeSubTab === 'tipos' ? 'tipos' : 'estados'}...`}
          showSearch={true}
          showAddButton={false}
          emptyMessage={`No hay ${activeSubTab === 'tipos' ? 'tipos' : 'estados'} de EPP registrados`}
          rowsPerPage={10}
        />

        {/* Error */}
        {(tiposEppError || estadosEppError) && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">{tiposEppError || estadosEppError}</p>
          </div>
        )}
      </div>

      {/* Modal Crear Tipo EPP */}
      <CreateTipoEppPopup
        show={showCreateTipoEpp}
        setShow={(show) => {
          setShowCreateTipoEpp(show);
          if (!show) setIsCreating(false);
        }}
        onTipoEppCreated={handleTipoEppCreated}
        onCreatingChange={setIsCreating}
      />

      {/* Modal Crear Estado EPP */}
      <CreateEstadoEppPopup
        show={showCreateEstadoEpp}
        setShow={(show) => {
          setShowCreateEstadoEpp(show);
          if (!show) setIsCreating(false);
        }}
        onEstadoEppCreated={handleEstadoEppCreated}
        onCreatingChange={setIsCreating}
      />

      {/* Modal Editar Tipo EPP */}
      <EditTipoEppPopup
        show={showEditTipoEpp}
        setShow={(show) => {
          setShowEditTipoEpp(show);
          if (!show) {
            setSelectedTipoEpp(null);
            setIsUpdating(false);
          }
        }}
        data={selectedTipoEpp}
        onTipoEppUpdated={handleTipoEppUpdated}
        onUpdatingChange={setIsUpdating}
      />

      {/* Modal Editar Estado EPP */}
      <EditEstadoEppPopup
        show={showEditEstadoEpp}
        setShow={(show) => {
          setShowEditEstadoEpp(show);
          if (!show) {
            setSelectedEstadoEpp(null);
            setIsUpdating(false);
          }
        }}
        data={selectedEstadoEpp}
        onEstadoEppUpdated={handleEstadoEppUpdated}
        onUpdatingChange={setIsUpdating}
      />

      {/* Modal de Detalle */}
      {showDetailModal && detailData && (
        <ModalPortal>
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-[#4EB9FA] to-[#3A9BD9] rounded-t-2xl">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white rounded-lg">
                  <MdShield className="w-6 h-6 text-[#3A9BD9]" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">
                    {toStartCase(detailData.nombre)}
                  </h2>
                  <p className="text-blue-100 text-sm">
                    {detailLoading ? 'Cargando...' : `${detailEpps.length} EPP(s) ${activeSubTab === 'tipos' ? 'de este tipo' : 'con este estado'}`}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setDetailData(null);
                  setDetailEpps([]);
                  setDetailSearchTerm('');
                }}
                className="p-3 text-white hover:bg-red-500 hover:bg-opacity-80 rounded-lg transition-colors"
              >
                <MdClose className="w-6 h-6 text-red-300 hover:text-white" />
              </button>
            </div>

            {/* Contenido */}
            <div className="flex-1 overflow-y-auto px-6 py-4 max-h-[65vh] bg-gray-50/50">
              {detailLoading ? (
                <div className="flex justify-center items-center py-12">
                  <BomberosLoader size="md" message="Cargando estadísticas..." />
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-r from-[#4EB9FA] to-[#3A9BD9] mb-6">
                    <span className="text-4xl font-bold text-white">{detailEpps.length}</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {detailEpps.length === 0 ? 'Sin EPPs asociados' : `${detailEpps.length} EPP${detailEpps.length !== 1 ? 's' : ''} ${activeSubTab === 'tipos' ? 'de este tipo' : 'con este estado'}`}
                  </h3>
                  <p className="text-gray-500 text-sm">
                    {detailEpps.length === 0 
                      ? `Este ${activeSubTab === 'tipos' ? 'tipo' : 'estado'} de EPP no tiene equipos asignados actualmente.`
                      : `Total de equipos ${activeSubTab === 'tipos' ? 'que pertenecen a este tipo' : 'que tienen este estado'} en el inventario.`
                    }
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end px-6 py-4 bg-white border-t border-gray-200 rounded-b-2xl">
              <button
                type="button"
                onClick={() => {
                  setShowDetailModal(false);
                  setDetailData(null);
                  setDetailEpps([]);
                  setDetailSearchTerm('');
                }}
                className="flex items-center space-x-2 px-4 py-2.5 text-red-700 bg-white border border-red-300 rounded-lg hover:bg-red-50 hover:border-red-400 transition-all duration-200 font-medium"
              >
                <MdClose className="w-4 h-4 text-red-500" />
                <span>Cerrar</span>
              </button>
            </div>
          </div>
        </div>
        </ModalPortal>
      )}
    </>
  );
};

export default AdminTipoEppTab;
