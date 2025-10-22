import React, { useEffect, useMemo } from 'react';
import { useAdmin } from '@context/AdminContext';
import { useAdminModals } from '@components/admin/AdminModalsProvider';
import { useBomberos } from '@hooks/bomberos/useBomberos';
import { useBomberosFilter } from '@hooks/admin/useBomberosFilter';
import { useViewModes } from '@hooks/admin/useViewModes';
import { useAuth } from '@hooks/auth/useAuth';
import { showConfirmAlert } from '@helpers/fireAlert.js';

// Componentes
import BomberosView from '@components/bomberos/BomberosView';
import ViewModeToggle from '@components/admin/ViewModeToggle';
import BomberoActionsMenu from '@components/admin/BomberoActionsMenu';
import DateFilter from '@components/DateFilter';
import Tooltip from '@components/Tooltip';

// Modales
import BomberoDetailModal from '@components/bomberos/BomberoDetailModal';
import CreateBomberoPopup from '@components/bomberos/CreateBomberoPopup';
import UpdateBomberoPopup from '@components/bomberos/UpdateBomberoPopup';

// Iconos
import { MdPersonAddAlt1, MdRefresh } from 'react-icons/md';

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

  const { filteredBomberos, handleDateFilterChange } = useBomberosFilter(bomberos);
  const { bomberosViewMode, setBomberosViewMode } = useViewModes();

  // Cargar bomberos al montar el componente
  useEffect(() => {
    if (hasPermiso('bombero:obtener') || hasPermiso('bombero:admin')) {
      fetchBomberos(true);
    }
  }, [refreshTrigger, hasPermiso]);

  // Configuración de columnas para la tabla
  const columns = useMemo(() => [
    {
      id: 'bombero',
      header: 'Bombero',
      enableSorting: true,
      minSize: 300,
      cell: ({ row }) => {
        const bombero = row.original;
        return (
          <div className="flex flex-col py-2">
            <div className="font-semibold text-gray-900">
              {`${bombero.nombres} ${bombero.apellidos}`}
            </div>
            <div className="text-sm text-gray-600">
              RUN: {bombero.run}
            </div>
            <div className="text-sm text-gray-500">
              {bombero.email}
            </div>
          </div>
        );
      }
    },
    {
      id: 'rol',
      header: 'Roles',
      enableSorting: true,
      size: 200,
      cell: ({ row }) => {
        const bombero = row.original;
        const roles = bombero.roles || [];

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
      id: 'estado',
      header: 'Estado',
      accessorKey: 'activo',
      enableSorting: true,
      size: 120,
      cell: ({ getValue }) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getValue()
          ? 'bg-green-100 text-green-800'
          : 'bg-red-100 text-red-800'
          }`}>
          {getValue() ? 'Activo' : 'Inactivo'}
        </span>
      )
    }
  ], []);

  // Badge mapping para la tabla
  const badgeMap = useMemo(() => ({
    activo: {
      true: { text: 'Activo', variant: 'success' },
      false: { text: 'Inactivo', variant: 'danger' }
    }
  }), []);

  // Handlers para acciones de bomberos
  const handleEdit = (bombero) => {
    openModal('editBombero', bombero);
  };

  const handleViewDetails = (bombero) => {
    openModal('bomberoDetail', bombero);
  };

  const handleDelete = async (bomberos) => {
    console.log('DEBUG - handleDelete - bomberos recibidos:', bomberos);
    
    // Aplanar la estructura de datos si es necesario
    let bomberosArray = [];
    if (Array.isArray(bomberos)) {
      // Si bomberos es un array, verificar si contiene arrays o objetos
      bomberosArray = bomberos.flat(); // Aplanar arrays anidados
    } else {
      bomberosArray = [bomberos];
    }
    
    console.log('DEBUG - handleDelete - bomberosArray aplanado:', bomberosArray);
    
    // Crear mensaje de confirmación
    const bomberosNames = bomberosArray.map(b => 
      Array.isArray(b.nombres) ? b.nombres.join(' ') : b.nombres
    ).join(', ');
    
    const confirmMessage = bomberosArray.length === 1 
      ? `¿Estás seguro de que quieres eliminar permanentemente al bombero "${bomberosNames}"? Esta acción no se puede deshacer.`
      : `¿Estás seguro de que quieres eliminar permanentemente a ${bomberosArray.length} bomberos? Esta acción no se puede deshacer.`;
    
    console.log('DEBUG - handleDelete - confirmMessage:', confirmMessage);
    
    // Mostrar confirmación
    const confirmed = await showConfirmAlert(
      'Confirmar Eliminación',
      confirmMessage,
      'Sí, eliminar',
      'Cancelar'
    );
    
    console.log('DEBUG - handleDelete - confirmed:', confirmed);
    
    if (confirmed.isConfirmed) {
      console.log('DEBUG - handleDelete - procediendo con eliminación');
      // Proceder con la eliminación
      for (const bombero of bomberosArray) {
        console.log('DEBUG - handleDelete - bombero individual:', bombero);
        const run = bombero.run;
        const id = bombero.id;
        console.log('DEBUG - handleDelete - eliminando bombero:', { run, id });
        if (run) {
          await handleDeleteBombero(run, id);
        }
      }
    } else {
      console.log('DEBUG - handleDelete - eliminación cancelada por el usuario');
    }
  };

  const handleDeleteSingle = async (bombero) => {
    await handleDelete([bombero]);
  };

  const handleBulkDelete = async (selectedBomberos) => {
    await handleDelete(selectedBomberos);
  };

  const handleRefresh = () => {
    fetchBomberos();
  };

  const handleCreate = () => {
    openModal('createBombero');
  };

  const handleBomberoCreated = async (newBombero) => {
    const result = await handleCreateBombero(newBombero);
    if (result.success) {
      closeModal('createBombero');
    }
    return result;
  };

  const handleBomberoUpdated = async (updatedBombero, run) => {
    const bomberoData = getModalData('editBombero');
    const result = await handleUpdateBombero(updatedBombero, run, bomberoData?.id);
    if (result.success) {
      closeModal('editBombero');
    }
    return result;
  };

  // Función de renderActions
  const renderActions = ({ row }) => {
    return (
      <BomberoActionsMenu
        bombero={row}
        currentBombero={currentBombero}
        hasPermiso={hasPermiso}
        onEdit={handleEdit}
        onDelete={handleDeleteSingle}
        onStatusChange={handleChangeBomberoEstado}
        onViewDetails={handleViewDetails}
      />
    );
  };

  return (
    <>
      <div className="bg-white/80 backdrop-blur-lg border border-[#4EB9FA]/20 shadow-xl p-6 rounded-2xl">
        {/* Header de la sección */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Gestión de Bomberos</h2>
            <p className="text-gray-600 text-sm mt-1">
              Administra la información de los bomberos del sistema
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Toggle de vista */}
            <ViewModeToggle
              viewMode={bomberosViewMode}
              onViewModeChange={setBomberosViewMode}
            />

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

        {/* Vista de bomberos */}
        <BomberosView
          viewMode={bomberosViewMode}
          bomberos={bomberos}
          loading={bomberosLoading}
          error={bomberosError}
          columns={columns}
          badgeMap={badgeMap}
          onEdit={handleEdit}
          onDelete={handleBulkDelete}
          onViewDetails={handleViewDetails}
          onChangeStatus={handleChangeBomberoEstado}
          onRefresh={handleRefresh}
          filteredBomberos={filteredBomberos}
          renderActions={renderActions}
          customActions={
            <div className="flex gap-2">
              <DateFilter onFilterChange={handleDateFilterChange} />
            </div>
          }
        />
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

      <BomberoDetailModal
        show={isModalOpen('bomberoDetail')}
        setShow={(show) => show ? openModal('bomberoDetail') : closeModal('bomberoDetail')}
        bomberoData={getModalData('bomberoDetail')}
      />
    </>
  );
};

export default AdminBomberosTab;