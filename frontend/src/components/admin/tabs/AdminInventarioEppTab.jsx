import React, { useEffect, useState, useMemo } from 'react';
import { useAdmin } from '@context/AdminContext';
import { useEpp } from '@hooks/epp/useEpp.jsx';
import { getAllBomberosWithFicha } from '@services/bombero.service.js';
import { showConfirmAlert } from '@helpers/fireAlert.js';
import { toStartCase } from '@helpers/textFormatters.js';

// Componentes
import Tooltip from '@components/Tooltip';
import PrimeTableBasic from '@components/PrimeTableBasic.jsx';
import BomberosLoader from '@components/BomberosLoader.jsx';
import CreateEppPopup from '@components/admin/popups/CreateEppPopup';
import EditEppPopup from '@components/admin/popups/EditEppPopup';
import AsignarEppPopup from '@components/admin/popups/AsignarEppPopup';
import { Button } from 'primereact/button';

// Iconos
import { 
  MdAdd, 
  MdRefresh, 
  MdShield,
  MdClear,
  MdPerson,
  MdWarehouse,
  MdPersonAdd,
  MdPersonRemove,
  MdEdit,
  MdDelete
} from 'react-icons/md';

/**
 * Componente para gestión del inventario de EPP
 */
const AdminInventarioEppTab = () => {
  const { hasPermiso, refreshTrigger } = useAdmin();

  // Hook personalizado para EPP
  const {
    epps,
    tiposEpp,
    estadosEpp,
    loading,
    error,
    fetchEpps,
    deleteEpp,
    assignEpp,
    unassignEpp
  } = useEpp();

  // Estado local
  const [showCreateEpp, setShowCreateEpp] = useState(false);
  const [showEditEpp, setShowEditEpp] = useState(false);
  const [showAsignarEpp, setShowAsignarEpp] = useState(false);
  const [selectedEpp, setSelectedEpp] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Filtros
  const [selectedTipoFilter, setSelectedTipoFilter] = useState('');
  const [selectedEstadoFilter, setSelectedEstadoFilter] = useState('');
  const [selectedAsignacionFilter, setSelectedAsignacionFilter] = useState(''); // '', 'asignados', 'disponibles'
  const [selectedBomberoFilter, setSelectedBomberoFilter] = useState('');
  const [bomberos, setBomberos] = useState([]);
  const [loadingBomberos, setLoadingBomberos] = useState(false);

  // Cargar bomberos para el filtro
  useEffect(() => {
    const loadBomberos = async () => {
      try {
        setLoadingBomberos(true);
        const response = await getAllBomberosWithFicha();
        const bomberosData = response?.data || response || [];
        setBomberos(Array.isArray(bomberosData) ? bomberosData : []);
      } catch (error) {
        console.error('[ADMIN_INVENTARIO_EPP] Error cargando bomberos:', error);
        setBomberos([]);
      } finally {
        setLoadingBomberos(false);
      }
    };
    loadBomberos();
  }, []);

  // Cargar EPP al montar o cuando cambia refreshTrigger
  useEffect(() => {
    if (hasPermiso('epp:obtener') || hasPermiso('epp:admin')) {
      const params = { page: 1, limit: 200 };
      
      if (selectedTipoFilter) params.idTipoEpp = selectedTipoFilter;
      if (selectedEstadoFilter) params.idEstadoEpp = selectedEstadoFilter;
      if (selectedBomberoFilter) params.idBombero = selectedBomberoFilter;
      
      fetchEpps(params, true);
    }
  }, [refreshTrigger, hasPermiso, fetchEpps, selectedTipoFilter, selectedEstadoFilter, selectedBomberoFilter]);

  // Filtrar datos según filtro de asignación
  const filteredEpps = useMemo(() => {
    if (!selectedAsignacionFilter) return epps;
    
    if (selectedAsignacionFilter === 'asignados') {
      return epps.filter(epp => epp.aCargoEpps && epp.aCargoEpps.length > 0);
    } else if (selectedAsignacionFilter === 'disponibles') {
      return epps.filter(epp => !epp.aCargoEpps || epp.aCargoEpps.length === 0);
    }
    
    return epps;
  }, [epps, selectedAsignacionFilter]);

  // Handlers
  const handleCreate = () => {
    setShowCreateEpp(true);
  };

  const handleEdit = (epp) => {
    setSelectedEpp(epp);
    setShowEditEpp(true);
  };

  const handleDelete = async (epp) => {
    const result = await showConfirmAlert(
      '¿Eliminar EPP?',
      `¿Estás seguro de que quieres eliminar el EPP "${toStartCase(epp.nombre)}"? Esta acción no se puede deshacer.`,
      'Sí, eliminar',
      'Cancelar'
    );

    if (result.isConfirmed) {
      await deleteEpp(epp.id);
    }
  };

  const handleAssign = (epp) => {
    setSelectedEpp(epp);
    setShowAsignarEpp(true);
  };

  const handleUnassign = async (epp) => {
    const bomberoNombre = epp.aCargoEpps?.[0]?.fichaBombero?.bombero 
      ? `${epp.aCargoEpps[0].fichaBombero.bombero.nombres || ''} ${epp.aCargoEpps[0].fichaBombero.bombero.apellidos || ''}`.trim()
      : 'el bombero';
    
    const result = await showConfirmAlert(
      '¿Desasignar EPP?',
      `¿Estás seguro de que quieres desasignar el EPP "${toStartCase(epp.nombre)}" de ${bomberoNombre}?`,
      'Sí, desasignar',
      'Cancelar'
    );

    if (result.isConfirmed) {
      await unassignEpp(epp.id);
    }
  };

  const handleRefresh = async () => {
    const params = { page: 1, limit: 200 };
    if (selectedTipoFilter) params.idTipoEpp = selectedTipoFilter;
    if (selectedEstadoFilter) params.idEstadoEpp = selectedEstadoFilter;
    if (selectedBomberoFilter) params.idBombero = selectedBomberoFilter;
    await fetchEpps(params, true);
  };

  const handleEppCreated = async () => {
    await fetchEpps({ page: 1, limit: 200 }, true);
    setIsCreating(false);
  };

  const handleEppUpdated = async () => {
    await fetchEpps({ page: 1, limit: 200 }, true);
    setIsUpdating(false);
  };

  const handleEppAssigned = async () => {
    await fetchEpps({ page: 1, limit: 200 }, true);
  };

  // Función para obtener nombre del bombero
  const getBomberoNombre = (epp) => {
    if (!epp.aCargoEpps || epp.aCargoEpps.length === 0) return null;
    
    const asignacion = epp.aCargoEpps[0];
    if (asignacion.fichaBombero?.bombero) {
      const bombero = asignacion.fichaBombero.bombero;
      const nombres = Array.isArray(bombero.nombres) ? bombero.nombres.join(' ') : bombero.nombres || '';
      const apellidos = Array.isArray(bombero.apellidos) ? bombero.apellidos.join(' ') : bombero.apellidos || '';
      return `${nombres} ${apellidos}`.trim() || 'Sin nombre';
    }
    return null;
  };

  // Permisos - declarar antes de usarlos en useMemo
  const canCreate = hasPermiso('epp:admin');
  const canEdit = hasPermiso('epp:admin');

  // Configuración de columnas con acciones personalizadas
  const columnsWithActions = useMemo(() => {
    const baseColumns = [
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
      field: 'tipoEpp',
      header: 'Tipo',
      sortable: false,
      style: { width: '150px' },
      body: (rowData) => (
        rowData.tipoEpp ? (
          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
            {toStartCase(rowData.tipoEpp.nombre)}
          </span>
        ) : (
          <span className="text-gray-400">N/A</span>
        )
      )
    },
    {
      field: 'estadosEpp',
      header: 'Estado',
      sortable: false,
      style: { width: '150px' },
      body: (rowData) => (
        rowData.estadosEpp ? (
          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
            {toStartCase(rowData.estadosEpp.nombre)}
          </span>
        ) : (
          <span className="text-gray-400">N/A</span>
        )
      )
    },
    {
      field: 'asignado',
      header: 'Asignado a',
      sortable: false,
      style: { width: '200px' },
      body: (rowData) => {
        const bomberoNombre = getBomberoNombre(rowData);
        if (bomberoNombre) {
          return (
            <div className="flex items-center gap-2">
              <MdPerson className="text-indigo-600" size={16} />
              <span className="text-sm text-gray-700">{bomberoNombre}</span>
            </div>
          );
        }
        return (
          <div className="flex items-center gap-2">
            <MdWarehouse className="text-gray-400" size={16} />
            <span className="text-sm text-gray-500 italic">En bodega</span>
          </div>
        );
      }
    },
    {
      field: 'descripcionDeEstado',
      header: 'Descripción',
      sortable: false,
      style: { width: '250px' },
      body: (rowData) => (
        <span className="text-gray-600 text-sm">{rowData.descripcionDeEstado || '—'}</span>
      )
    },
    ];
    
    // Agregar columna de acciones personalizadas
    if (canEdit) {
      baseColumns.push({
        header: 'Acciones',
        style: { width: '250px' },
        body: (rowData) => {
          const isAssigned = rowData.aCargoEpps && rowData.aCargoEpps.length > 0;
          return (
            <div className="flex gap-2 justify-center">
              {!isAssigned ? (
                <Button
                  icon={<MdPersonAdd size={18} />}
                  className="p-button-rounded p-button-text p-button-info"
                  onClick={() => handleAssign(rowData)}
                  tooltip="Asignar EPP a bombero"
                  tooltipOptions={{ position: 'top' }}
                />
              ) : (
                <Button
                  icon={<MdPersonRemove size={18} />}
                  className="p-button-rounded p-button-text p-button-warning"
                  onClick={() => handleUnassign(rowData)}
                  tooltip="Desasignar EPP"
                  tooltipOptions={{ position: 'top' }}
                />
              )}
              <Button
                icon={<MdEdit size={18} />}
                className="p-button-rounded p-button-text p-button-plain"
                onClick={() => handleEdit(rowData)}
                tooltip="Editar EPP"
                tooltipOptions={{ position: 'top' }}
              />
              <Button
                icon={<MdDelete size={18} />}
                className="p-button-rounded p-button-text p-button-danger"
                onClick={() => handleDelete(rowData)}
                tooltip="Eliminar EPP"
                tooltipOptions={{ position: 'top' }}
              />
            </div>
          );
        }
      });
    } else {
      baseColumns.push({
        type: 'actions',
        header: 'Acciones',
        style: { width: '150px' }
      });
    }
    
    return baseColumns;
  }, [canEdit, handleAssign, handleUnassign, handleEdit, handleDelete]);

  if (loading && filteredEpps.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <BomberosLoader size="md" message="Cargando inventario de EPP..." />
      </div>
    );
  }

  return (
    <>
      <div className="bg-white/80 backdrop-blur-lg border border-[#4EB9FA]/20 shadow-xl p-6 rounded-2xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Inventario de EPP</h2>
            <p className="text-gray-600 text-sm mt-1">
              Administra el inventario de Equipos de Protección Personal de la compañía
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Filtros */}
            {/* Filtro por tipo */}
            {tiposEpp.length > 0 && (
              <div className="relative">
                <select
                  value={selectedTipoFilter}
                  onChange={(e) => setSelectedTipoFilter(e.target.value)}
                  className="block w-full pl-8 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm bg-white appearance-none cursor-pointer min-w-[150px]"
                >
                  <option value="">Todos los tipos</option>
                  {tiposEpp.map((tipo) => (
                    <option key={tipo.id} value={tipo.id.toString()}>
                      {toStartCase(tipo.nombre)}
                    </option>
                  ))}
                </select>
                {selectedTipoFilter && (
                  <button
                    onClick={() => setSelectedTipoFilter('')}
                    className="absolute inset-y-0 right-0 pr-2 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    <MdClear size={16} />
                  </button>
                )}
              </div>
            )}

            {/* Filtro por estado */}
            {estadosEpp.length > 0 && (
              <div className="relative">
                <select
                  value={selectedEstadoFilter}
                  onChange={(e) => setSelectedEstadoFilter(e.target.value)}
                  className="block w-full pl-8 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm bg-white appearance-none cursor-pointer min-w-[150px]"
                >
                  <option value="">Todos los estados</option>
                  {estadosEpp.map((estado) => (
                    <option key={estado.id} value={estado.id.toString()}>
                      {toStartCase(estado.nombre)}
                    </option>
                  ))}
                </select>
                {selectedEstadoFilter && (
                  <button
                    onClick={() => setSelectedEstadoFilter('')}
                    className="absolute inset-y-0 right-0 pr-2 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    <MdClear size={16} />
                  </button>
                )}
              </div>
            )}

            {/* Filtro por asignación */}
            <div className="relative">
              <select
                value={selectedAsignacionFilter}
                onChange={(e) => setSelectedAsignacionFilter(e.target.value)}
                className="block w-full pl-8 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm bg-white appearance-none cursor-pointer min-w-[150px]"
              >
                <option value="">Todos</option>
                <option value="asignados">Asignados</option>
                <option value="disponibles">En bodega</option>
              </select>
              {selectedAsignacionFilter && (
                <button
                  onClick={() => setSelectedAsignacionFilter('')}
                  className="absolute inset-y-0 right-0 pr-2 flex items-center text-gray-400 hover:text-gray-600"
                >
                  <MdClear size={16} />
                </button>
              )}
            </div>

            {/* Estadísticas */}
            <span className="text-sm text-gray-600">
              Total: {filteredEpps.length} EPP
            </span>

            {/* Botón refresh */}
            <Tooltip
              id="refresh-btn"
              content="Actualizar lista de EPP"
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
                content="Agregar nuevo EPP al inventario"
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
                      {isCreating ? 'Creando...' : 'Crear EPP'}
                    </span>
                  </span>
                </button>
              </Tooltip>
            )}
          </div>
        </div>

        {/* Tabla */}
        <PrimeTableBasic
          data={filteredEpps}
          columns={columnsWithActions}
          loading={loading}
          onEdit={canEdit ? handleEdit : undefined}
          onDelete={canEdit ? handleDelete : undefined}
          searchPlaceholder="Buscar EPP por nombre..."
          showSearch={true}
          showAddButton={false}
          emptyMessage="No hay EPP registrados en el inventario"
          rowsPerPage={10}
        />

        {/* Error */}
        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}
      </div>

      {/* Popups */}
      <CreateEppPopup
        show={showCreateEpp}
        setShow={(show) => {
          setShowCreateEpp(show);
          if (!show) {
            setIsCreating(false);
          }
        }}
        onEppCreated={handleEppCreated}
        onCreatingChange={setIsCreating}
      />

      <EditEppPopup
        show={showEditEpp}
        setShow={(show) => {
          setShowEditEpp(show);
          if (!show) {
            setSelectedEpp(null);
            setIsUpdating(false);
          }
        }}
        data={selectedEpp}
        onEppUpdated={handleEppUpdated}
        onUpdatingChange={setIsUpdating}
      />

      <AsignarEppPopup
        show={showAsignarEpp}
        setShow={(show) => {
          setShowAsignarEpp(show);
          if (!show) {
            setSelectedEpp(null);
          }
        }}
        epp={selectedEpp}
        onEppAssigned={handleEppAssigned}
      />
    </>
  );
};

export default AdminInventarioEppTab;

