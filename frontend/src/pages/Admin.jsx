import { useState, useMemo, useEffect } from 'react';
import { useBomberos } from '@hooks/bomberos/useBomberos';
import { useAuth } from '@hooks/auth/useAuth';
import { useRoles } from '@hooks/roles/useRoles';
import usePermisos from '@hooks/permisos/usePermisos';

// Hooks personalizados
import { useAdminTabs } from '@hooks/admin/useAdminTabs';
import { useAdminModals } from '@hooks/admin/useAdminModals';
import { useViewModes } from '@hooks/admin/useViewModes';
import { useBomberosFilter } from '@hooks/admin/useBomberosFilter';

// Componentes
import BomberoDetailModal from '@components/bomberos/BomberoDetailModal.jsx';
import CreateBomberoPopup from '@components/bomberos/CreateBomberoPopup.jsx';
import UpdateBomberoPopup from '@components/bomberos/UpdateBomberoPopup';
import CreateRolPopup from '@components/roles/CreateRolPopup.jsx';
import RolesView from '@components/roles/RolesView.jsx';
import PermisosView from '@components/permiso/PermisosView.jsx';
import BomberosView from '@components/bomberos/BomberosView.jsx';
// import CompaniaConfigManager from '@components/CompanyConfigManager.jsx';
// import DateDisplay from '@components/DateDisplay';
import DateFilter from '../components/DateFilter';
import Tooltip from '@components/Tooltip.jsx';

// Componentes admin
import AdminTabNavigation from '@components/admin/AdminTabNavigation';
import ViewModeToggle from '@components/admin/ViewModeToggle';
import BomberoActionsMenu from '@components/admin/BomberoActionsMenu';

// Helpers
import { formatTelefono } from '@helpers/phoneFormatter';

// Iconos
import { MdPersonAddAlt1, MdPhone, MdSecurity, MdAdd, MdRefresh } from 'react-icons/md';

const Admin = () => {
  const { bombero: currentBombero, hasPermiso } = useAuth();
  const { 
    bomberos, 
    fetchBomberos, 
    setBomberos, 
    loading: bomberosLoading,
    handleCreateBombero,
    handleUpdateBombero,
    handleDeleteBombero,
    handleChangeBomberoStatus
  } = useBomberos();
  
  const { roles, fetchRoles, loading: rolesLoading } = useRoles();
  const { permisos, permisosByCategory, refreshPermisosByCategory, loading: permisosLoading } = usePermisos();
  
  // Hooks personalizados
  const { availableTabs, activeTab, setActiveTab } = useAdminTabs(hasPermiso);
  const { modals, modalData, openModal, closeModal } = useAdminModals();
  const { bomberosViewMode, setBomberosViewMode, rolesViewMode, setRolesViewMode } = useViewModes();
  const { filteredBomberos, handleDateFilterChange } = useBomberosFilter(bomberos);
  
  // Estado para trigger de refrescar roles
  const [refreshRolesTrigger, setRefreshRolesTrigger] = useState(0);

  // Función para manejar la actualización de bomberos
  const handleUpdate = (bombero) => {
    openModal('editBombero', bombero);
  };

  // Función para manejar la eliminación de bomberos (individual)
  const handleDelete = async (bomberos) => {
    // Si es un array de bomberos, procesar cada uno
    if (Array.isArray(bomberos)) {
      for (const bombero of bomberos) {
        const run = bombero.run;
        if (run) {
          const result = await handleDeleteBombero(run);
          if (result.success) {
            closeModal('editBombero');
          }
        }
      }
    } else {
      // Si es un RUT directo (compatibilidad hacia atrás)
      const result = await handleDeleteBombero(bomberos);
      if (result.success) {
        closeModal('editBombero');
      }
    }
  };

  // Función para manejar la creación de roles
  const handleCreateRol = () => {
    openModal('createRol');
  };

  // Función para manejar la actualización de roles
  const handleRefreshRoles = () => {
    setRefreshRolesTrigger(prev => prev + 1);
  };
  
  // Cargar datos según la pestaña activa, solo cuando sea necesario
  useEffect(() => {
    if (activeTab === 'bomberos') {
      fetchBomberos();
    } else if (activeTab === 'roles') {
      fetchRoles();
    } else if (activeTab === 'permisos') {
      refreshPermisosByCategory();
    }
  }, [activeTab, fetchBomberos, fetchRoles, refreshPermisosByCategory]);

  // Configuración de la tabla bomberos con memoization
  const columns = useMemo(() => [
    { name: 'Nº', selector: row => row.numero_placa, sortable: true, width: '80px' },
    { name: 'RUN', selector: row => row.run, sortable: true, width: '120px' },
    { name: 'Nombre', selector: row => `${row.nombres} ${row.apellidos}`, sortable: true, minWidth: '200px' },
    { name: 'Email', selector: row => row.email, sortable: true, minWidth: '200px' },
    { 
      name: 'Teléfono', 
      selector: row => formatTelefono(row.telefono),
      sortable: true,
      width: '130px'
    },
    { name: 'Rol', selector: row => row.nombreRol, sortable: true, width: '150px' },
    {
      name: 'Estado',
      selector: row => row.activo,
      sortable: true,
      width: '100px',
      cell: row => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          row.activo 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {row.activo ? 'Activo' : 'Inactivo'}
        </span>
      )
    },
    {
      name: 'Acciones',
      width: '150px',
      cell: row => renderActions({ row })
    }
  ], []);

  // Badge mapping para la tabla
  const badgeMap = useMemo(() => ({
    activo: {
      true: { text: 'Activo', variant: 'success' },
      false: { text: 'Inactivo', variant: 'danger' }
    }
  }), []);

  // Funciones de manejo simplificadas
  const handleEdit = (bombero) => {
    openModal('editBombero', bombero);
  };

  const handleDeleteSingle = async (bombero) => {
    await handleDelete([bombero]);
  };

  const handleBulkDelete = async (selectedBomberos) => {
    await handleDelete(selectedBomberos);
  };

  const handleViewDetails = (bombero) => {
    openModal('bomberoDetail', bombero);
  };

  const handleRefresh = () => {
    fetchBomberos();
  };

  // Función de renderActions usando el componente BomberoActionsMenu
  const renderActions = ({ row }) => {
    return (
      <BomberoActionsMenu
        bombero={row}
        currentBombero={currentBombero}
        hasPermiso={hasPermiso}
        onEdit={handleEdit}
        onDelete={handleDeleteSingle}
        onStatusChange={handleChangeBomberoStatus}
        onViewDetails={handleViewDetails}
      />
    );
  };

  return (
    <div className="p-3 sm:p-4 lg:p-6">
      {/* Header con título */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#2C3E50] mb-2">Administración</h1>
        <p className="text-gray-600 text-sm">
          Administra bomberos, roles y permisos del sistema
        </p>
      </div>

      {/* Navegación por pestañas */}
      <AdminTabNavigation
        availableTabs={availableTabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        hasPermiso={hasPermiso}
      />

      {/* Contenido según la pestaña activa */}
      {availableTabs.length === 0 ? (
        <div className="bg-white/80 backdrop-blur-lg border border-[#4EB9FA]/20 shadow-xl p-8 rounded-2xl mb-4 text-center">
          <div className="flex flex-col items-center justify-center py-12">
            <MdSecurity size={64} className="text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Acceso Restringido</h3>
            <p className="text-gray-500 max-w-md">
              No tienes permisos para acceder a ninguna sección de administración. 
              Contacta con tu administrador para obtener los permisos necesarios.
            </p>
          </div>
        </div>
      ) : (
        <>
          {activeTab === 'bomberos' && (
            <div className="bg-white/80 backdrop-blur-lg border border-[#4EB9FA]/20 shadow-xl p-3 sm:p-4 lg:p-6 rounded-2xl mb-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Gestión de Bomberos</h2>
                <div className="flex items-center gap-2">
                  {/* Toggle de vista */}
                  <ViewModeToggle
                    viewMode={bomberosViewMode}
                    onViewModeChange={setBomberosViewMode}
                  />
                  
                  <button
                    onClick={handleRefresh}
                    className={`px-3 py-2 border rounded-lg transition-colors ${bomberosLoading ? 'text-gray-400 border-gray-300 cursor-not-allowed' : 'text-[#4EB9FA] hover:text-[#3DA8E9] border-[#4EB9FA] hover:bg-[#4EB9FA]/10'}`}
                    title="Actualizar"
                    disabled={bomberosLoading}
                  >
                    <MdRefresh size={20} className={bomberosLoading ? 'animate-spin' : ''} />
                  </button>
                  
                  {hasPermiso('bombero:crear') && (
                    <Tooltip
                      id="create-bombero-btn"
                      content="Crear un nuevo bombero en el sistema"
                      place="top"
                      variant="dark"
                    >
                      <button
                        className="bg-[#2C3E50] hover:bg-[#34495E] text-white font-semibold px-4 py-2 rounded-lg shadow transition-all duration-200 border border-[#2C3E50] hover:-translate-y-0.5 hover:scale-105"
                        onClick={() => openModal('createBombero')}
                      >
                        <span className="flex items-center gap-2">
                          <MdPersonAddAlt1 size={18} />
                          <span className="hidden sm:inline">Crear bombero</span>
                        </span>
                      </button>
                    </Tooltip>
                  )}
                </div>
              </div>
              <BomberosView
                viewMode={bomberosViewMode}
                bomberos={bomberos}
                loading={bomberosLoading}
                error={null}
                columns={columns}
                badgeMap={badgeMap}
                onEdit={handleEdit}
                onDelete={handleBulkDelete}
                onViewDetails={handleViewDetails}
                onChangeStatus={handleChangeBomberoStatus}
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
          )}

          {activeTab === 'roles' && (
            <div className="bg-white/80 backdrop-blur-lg border border-[#4EB9FA]/20 shadow-xl p-3 sm:p-4 lg:p-6 rounded-2xl mb-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Gestión de Roles</h2>
                <div className="flex items-center gap-2">
                  {/* Toggle de vista */}
                  <ViewModeToggle
                    viewMode={rolesViewMode}
                    onViewModeChange={setRolesViewMode}
                  />
                  
                  <button
                    onClick={handleRefreshRoles}
                    className={`px-3 py-2 border rounded-lg transition-colors ${rolesLoading ? 'text-gray-400 border-gray-300 cursor-not-allowed' : 'text-[#4EB9FA] hover:text-[#3DA8E9] border-[#4EB9FA] hover:bg-[#4EB9FA]/10'}`}
                    title="Actualizar"
                    disabled={rolesLoading}
                  >
                    <MdRefresh size={20} className={rolesLoading ? 'animate-spin' : ''} />
                  </button>
                  
                  {hasPermiso('rol:crear') && (
                    <Tooltip
                      id="create-role-btn"
                      content="Crear un nuevo rol en el sistema"
                      place="top"
                      variant="dark"
                    >
                      <button
                        className="bg-[#2C3E50] hover:bg-[#34495E] text-white font-semibold px-4 py-2 rounded-lg shadow transition-all duration-200 border border-[#2C3E50] hover:-translate-y-0.5 hover:scale-105"
                        onClick={handleCreateRol}
                      >
                        <span className="flex items-center gap-2">
                          <MdAdd size={18} />
                          <span className="hidden sm:inline">Crear rol</span>
                        </span>
                      </button>
                    </Tooltip>
                  )}
                </div>
              </div>
              <RolesView viewMode={rolesViewMode} refreshTrigger={refreshRolesTrigger} />
            </div>
          )}

          {activeTab === 'permisos' && (
            <PermisosView />
          )}
        </>
      )}

      {/* Modales */}
      <UpdateBomberoPopup 
        show={modals.editBombero} 
        setShow={(show) => show ? openModal('editBombero') : closeModal('editBombero')} 
        data={modalData.bombero} 
        onBomberoUpdated={handleUpdateBombero} 
      />
      
      {modals.createBombero && (
        <CreateBomberoPopup 
          show={modals.createBombero} 
          setShow={(show) => show ? openModal('createBombero') : closeModal('createBombero')} 
          onBomberoCreated={handleCreateBombero} 
        />
      )}
      
      {modals.createRol && (
        <CreateRolPopup 
          show={modals.createRol} 
          setShow={(show) => show ? openModal('createRol') : closeModal('createRol')} 
          onRoleCreated={() => setRefreshRolesTrigger(prev => prev + 1)} 
        />
      )}
      
      {modals.bomberoDetail && modalData.bomberoDetail && (
        <BomberoDetailModal 
          show={modals.bomberoDetail} 
          setShow={(show) => show ? openModal('bomberoDetail') : closeModal('bomberoDetail')} 
          bomberoData={modalData.bomberoDetail} 
        />
      )}
    </div>
  );
}

export default Admin;
