import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useAdmin } from '@context/AdminContext';
import { useAdminModals } from '@components/admin/AdminModalsProvider';
import { useBomberos } from '@hooks/bomberos/useBomberos';
import { useAuth } from '@hooks/auth/useAuth';
import { showConfirmAlert } from '@helpers/fireAlert.js';

// Componentes
import PrimeTableAdvanced from '@components/PrimeTableAdvanced.jsx';
import BomberoActionsMenu from '@components/admin/BomberoActionsMenu';
import Tooltip from '@components/Tooltip';

// Modales
import BomberoFichaPopup from '@components/bomberos/BomberoFichaPopup';
import CreateBomberoPopup from '@components/bomberos/CreateBomberoPopup';
import UpdateBomberoPopup from '@components/bomberos/UpdateBomberoPopup';

// Iconos
import { MdPersonAddAlt1, MdRefresh, MdDelete, MdBusiness, MdPeople } from 'react-icons/md';

/**
 * Componente específico para la gestión de bomberos
 * Contiene toda la lógica relacionada con la administración de bomberos
 */
const AdminBomberosTab = () => {
  const { hasPermiso, refreshTrigger } = useAdmin();
  const { bombero: currentBombero } = useAuth();
  const { 
    openModal, 
    closeModal, 
    isModalOpen, 
    getModalData 
  } = useAdminModals();

  // Hooks específicos para bomberos
  const {
    bomberos,
    fetchBomberos,
    loading: bomberosLoading,
    error: bomberosError,
    handleCreateBombero,
    handleUpdateBombero,
    handleDeleteBombero,
    handleChangeBomberoEstado
  } = useBomberos();

  const [selectedBomberos, setSelectedBomberos] = useState([]);
  const [filterMode, setFilterMode] = useState('miCompania'); // 'miCompania' | 'todas'
  const [selectedBomberoForDetails, setSelectedBomberoForDetails] = useState(null);
  const [isDetailPopupOpen, setIsDetailPopupOpen] = useState(false);

  // Cargar bomberos al montar el componente o cuando cambia el filtro
  useEffect(() => {
    if (hasPermiso('bombero:obtener') || hasPermiso('bombero:admin')) {
      fetchBomberos(true, filterMode);
    }
  }, [refreshTrigger, hasPermiso, filterMode]);

  // Handlers para acciones de bomberos (declarados antes de columnsWithActions)
  const handleEdit = useCallback((bombero) => {
    openModal('editBombero', bombero);
  }, [openModal]);

  const handleViewDetails = useCallback((bombero) => {
    setSelectedBomberoForDetails(bombero);
    setIsDetailPopupOpen(true);
  }, []);

  const handleCloseDetailPopup = useCallback(() => {
    setIsDetailPopupOpen(false);
    setSelectedBomberoForDetails(null);
  }, []);

  const handleDelete = useCallback(async (bomberos) => {
    // Aplanar la estructura de datos si es necesario
    let bomberosArray = [];
    if (Array.isArray(bomberos)) {
      bomberosArray = bomberos.flat();
    } else {
      bomberosArray = [bomberos];
    }
    
    // Crear mensaje de confirmación
    const bomberosNames = bomberosArray.map(b => {
      const nombres = Array.isArray(b.nombres) ? b.nombres.join(' ') : b.nombres || '';
      const apellidos = Array.isArray(b.apellidos) ? b.apellidos.join(' ') : b.apellidos || '';
      return `${nombres} ${apellidos}`.trim() || 'Sin nombre';
    }).join(', ');
    
    const confirmMessage = bomberosArray.length === 1 
      ? `¿Estás seguro de que quieres eliminar permanentemente al bombero "${bomberosNames}"? Esta acción no se puede deshacer.`
      : `¿Estás seguro de que quieres eliminar permanentemente a ${bomberosArray.length} bomberos? Esta acción no se puede deshacer.`;
    
    // Mostrar confirmación
    const confirmed = await showConfirmAlert(
      'Confirmar Eliminación',
      confirmMessage,
      'Sí, eliminar',
      'Cancelar'
    );
    
    if (confirmed.isConfirmed) {
      // Proceder con la eliminación
      for (const bombero of bomberosArray) {
        const run = bombero.run;
        const id = bombero.id;
        if (run) {
          await handleDeleteBombero(run, id);
        }
      }
      // Limpiar selección después de eliminar
      setSelectedBomberos([]);
    }
  }, [handleDeleteBombero]);

  const handleDeleteSingle = useCallback(async (bombero) => {
    await handleDelete([bombero]);
  }, [handleDelete]);

  // Configuración de columnas para PrimeReact
  const columns = useMemo(() => [
    {
      field: 'bombero',
      header: 'Bombero',
      sortable: true,
      style: { width: '300px' },
      body: (rowData) => {
        const nombres = Array.isArray(rowData.nombres) ? rowData.nombres.join(' ') : rowData.nombres || '';
        const apellidos = Array.isArray(rowData.apellidos) ? rowData.apellidos.join(' ') : rowData.apellidos || '';
        return (
          <div className="flex flex-col py-2">
            <div className="font-semibold text-gray-900">
              {`${nombres} ${apellidos}`}
            </div>
            <div className="text-sm text-gray-600">
              RUN: {rowData.run}
            </div>
            <div className="text-sm text-gray-500">
              {rowData.email}
            </div>
          </div>
        );
      }
    },
    {
      field: 'roles',
      header: 'Roles',
      sortable: false,
      style: { width: '200px' },
      body: (rowData) => {
        const roles = rowData.roles || [];

        if (roles.length === 0) {
          return (
            <span className="text-gray-500 italic">Sin roles</span>
          );
        }

        if (roles.length === 1) {
          return (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
              {roles[0].nombre}
            </span>
          );
        }

        if (roles.length === 2) {
          return (
            <div className="flex flex-wrap gap-1">
              {roles.map((rol, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium"
                >
                  {rol.nombre}
                </span>
              ))}
            </div>
          );
        }

        // Si hay más de 2 roles, mostrar los primeros 2 + indicador
        const visibleRoles = roles.slice(0, 2);
        const remainingCount = roles.length - 2;
        const allRolesText = roles.map(rol => rol.nombre).join(', ');

        return (
          <div className="flex flex-wrap gap-1 items-center">
            {visibleRoles.map((rol, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium"
              >
                {rol.nombre}
              </span>
            ))}
            <Tooltip
              content={`Todos los roles: ${allRolesText}`}
              place="top"
              variant="dark"
            >
              <span
                className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium cursor-help hover:bg-gray-200 transition-colors"
              >
                +{remainingCount}
              </span>
            </Tooltip>
          </div>
        );
      }
    },
    {
      field: 'activo',
      header: 'Estado',
      sortable: true,
      style: { width: '120px' },
      body: (rowData) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          rowData.activo
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'
          }`}>
          {rowData.activo ? 'Habilitado' : 'Deshabilitado'}
        </span>
      )
    },
    {
      field: 'creadoEl',
      header: 'Creado',
      sortable: true,
      style: { width: '140px' },
      body: (rowData) => {
        if (!rowData.creadoEl) return <span className="text-gray-400">-</span>;
          try {
          const date = new Date(rowData.creadoEl);
          const day = date.getDate().toString().padStart(2, '0');
          const month = (date.getMonth() + 1).toString().padStart(2, '0');
          const year = date.getFullYear();
          return (
            <div className="flex flex-col text-xs">
              <span className="text-gray-700">
                {`${day}/${month}/${year}`}
              </span>
              <span className="text-gray-500">
                {date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          );
        } catch {
          return <span className="text-gray-400">-</span>;
        }
      }
    },
    {
      field: 'actualizadoEl',
      header: 'Actualizado',
      sortable: true,
      style: { width: '140px' },
      body: (rowData) => {
        if (!rowData.actualizadoEl) return <span className="text-gray-400">-</span>;
        try {
          const date = new Date(rowData.actualizadoEl);
          const day = date.getDate().toString().padStart(2, '0');
          const month = (date.getMonth() + 1).toString().padStart(2, '0');
          const year = date.getFullYear();
          return (
            <div className="flex flex-col text-xs">
              <span className="text-gray-700">
                {`${day}/${month}/${year}`}
              </span>
              <span className="text-gray-500">
                {date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          );
        } catch {
          return <span className="text-gray-400">-</span>;
        }
      }
    }
  ], []);

  // Agregar columna de acciones
  const columnsWithActions = useMemo(() => {
    const canEdit = hasPermiso('bombero:actualizar') || hasPermiso('bombero:admin');
    
    const baseColumns = [...columns];
    
    if (canEdit) {
      baseColumns.push({
        header: 'Acciones',
        style: { width: '200px' },
        body: (rowData) => (
          <BomberoActionsMenu
            bombero={rowData}
            currentBombero={currentBombero}
            hasPermiso={hasPermiso}
            onEdit={handleEdit}
            onDelete={handleDeleteSingle}
            onStatusChange={handleChangeBomberoEstado}
            onViewDetails={handleViewDetails}
          />
        )
      });
    }
    
    return baseColumns;
  }, [columns, hasPermiso, currentBombero, handleEdit, handleDeleteSingle, handleChangeBomberoEstado, handleViewDetails]);

  const handleBulkDelete = useCallback(async (selectedBomberos) => {
    await handleDelete(selectedBomberos);
  }, [handleDelete]);

  const handleRefresh = useCallback(() => {
    fetchBomberos(true, filterMode);
  }, [fetchBomberos, filterMode]);

  const handleFilterChange = useCallback((newMode) => {
    if (newMode !== filterMode) {
      setFilterMode(newMode);
      setSelectedBomberos([]); // Limpiar selección al cambiar filtro
    }
  }, [filterMode]);

  const handleCreate = useCallback(() => {
    openModal('createBombero');
  }, [openModal]);

  const handleBomberoCreated = useCallback(async (newBombero) => {
    const result = await handleCreateBombero(newBombero);
    if (result.success) {
      closeModal('createBombero');
    }
    return result;
  }, [handleCreateBombero, closeModal]);

  const handleBomberoUpdated = useCallback(async (updatedBombero, run) => {
    const bomberoData = getModalData('editBombero');
    const result = await handleUpdateBombero(updatedBombero, run, bomberoData?.id);
    if (result.success) {
      closeModal('editBombero');
    }
    return result;
  }, [getModalData, handleUpdateBombero, closeModal]);



  // Handler para selección múltiple (PrimeReact pasa un evento con e.value)
  const handleSelectionChange = useCallback((e) => {
    const selected = e?.value || e || [];
    setSelectedBomberos(Array.isArray(selected) ? selected : []);
  }, []);

  return (
    <>
      <div className="bg-white/80 backdrop-blur-lg border border-[#4EB9FA]/20 shadow-md p-6 rounded-2xl">
        {/* Header de la sección */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Gestión de Bomberos</h2>
            <p className="text-gray-600 text-sm mt-1">
              Administra la información de los bomberos del sistema
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Botón refrescar */}
            <Tooltip
              id="refresh-bomberos-btn"
              content="Recargar la lista de bomberos desde el servidor"
              place="top"
              variant="dark"
            >
              <button
                onClick={handleRefresh}
                className={`px-3 py-2 border rounded-lg transition-colors ${
                  bomberosLoading 
                    ? 'text-gray-400 border-gray-300 cursor-not-allowed' 
                    : 'text-[#4EB9FA] hover:text-[#3DA8E9] border-[#4EB9FA] hover:bg-[#4EB9FA]/10'
                }`}
                disabled={bomberosLoading}
              >
                <MdRefresh size={20} className={bomberosLoading ? 'animate-spin' : ''} />
              </button>
            </Tooltip>

            {/* Botón ingresar bombero */}
            {(hasPermiso('bombero:crear') || hasPermiso('bombero:admin')) && (
              <Tooltip
                id="create-bombero-btn"
                content="Ingresar un nuevo bombero en el sistema"
                place="top"
                variant="dark"
              >
                <button
                  onClick={handleCreate}
                  className="bg-[#2C3E50] hover:bg-[#34495E] text-white font-semibold px-4 py-2 rounded-lg shadow transition-all duration-200 border border-[#2C3E50] hover:-translate-y-0.5 hover:scale-105"
                >
                  <span className="flex items-center gap-2">
                    <MdPersonAddAlt1 size={18} />
                    <span className="hidden sm:inline">Ingresar bombero</span>
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
              onClick={() => handleFilterChange('miCompania')}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                filterMode === 'miCompania'
                  ? 'border-[#4EB9FA] text-[#4EB9FA]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              title="Mostrar solo bomberos de mi compañía"
            >
              <MdBusiness size={18} />
              <span>Mi Compañía</span>
            </button>
            <button
              onClick={() => handleFilterChange('todas')}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                filterMode === 'todas'
                  ? 'border-[#4EB9FA] text-[#4EB9FA]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              title="Mostrar todos los bomberos del sistema"
            >
              <MdPeople size={18} />
              <span>Todas las Compañías</span>
            </button>
          </nav>
        </div>

        {/* Vista de bomberos */}
        {/* Tabla con PrimeTableAdvanced */}
        <PrimeTableAdvanced
          data={bomberos}
          columns={columnsWithActions}
          loading={false}
          onEdit={hasPermiso('bombero:actualizar') || hasPermiso('bombero:admin') ? handleEdit : undefined}
          onDelete={hasPermiso('bombero:eliminar') || hasPermiso('bombero:admin') ? handleDeleteSingle : undefined}
          onRefresh={handleRefresh}
          onSelectionChange={handleSelectionChange}
          searchPlaceholder="Buscar por nombre, email o RUN..."
          showSearch={true}
          showFilters={false}
          showExport={false}
          showRefresh={false}
          showAddButton={false}
          pagination={true}
          rowsPerPage={10}
          emptyMessage="No hay bomberos registrados en el sistema"
          title="Bomberos"
          enableSelection={true}
        />
        
        {/* Botón de eliminación masiva si hay selección */}
        {selectedBomberos.length > 0 && (hasPermiso('bombero:eliminar') || hasPermiso('bombero:admin')) && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => handleBulkDelete(selectedBomberos)}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow transition-colors flex items-center gap-2"
            >
              <MdDelete size={18} />
              <span>Eliminar seleccionados ({selectedBomberos.length})</span>
            </button>
          </div>
        )}

        {/* Error */}
        {bomberosError && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">{bomberosError}</p>
          </div>
        )}
      </div>

      {/* Modales */}
      <UpdateBomberoPopup
        show={isModalOpen('editBombero')}
        setShow={(show) => show ? openModal('editBombero') : closeModal('editBombero')}
        data={getModalData('editBombero')}
        onBomberoUpdated={handleBomberoUpdated}
      />

      <CreateBomberoPopup
        show={isModalOpen('createBombero')}
        setShow={(show) => show ? openModal('createBombero') : closeModal('createBombero')}
        onBomberoCreated={handleBomberoCreated}
      />

      {/* Popup de ficha de bombero (igual que en BomberosPage) */}
      <BomberoFichaPopup
        bombero={selectedBomberoForDetails}
        isOpen={isDetailPopupOpen}
        onClose={handleCloseDetailPopup}
      />
    </>
  );
};

export default AdminBomberosTab;