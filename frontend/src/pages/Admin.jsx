import { useMemo, useEffect, useState } from 'react';
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
import UpdateRolPopup from '@components/roles/UpdateRolPopup.jsx';
import RolesView from '@components/roles/RolesView.jsx';
import PermisosView from '@components/permiso/PermisosView.jsx';
import BomberosView from '@components/bomberos/BomberosView.jsx';
import DateFilter from '../components/DateFilter';
import Tooltip from '@components/Tooltip.jsx';

// Componentes admin
import AdminTabNavigation from '@components/admin/AdminTabNavigation';
import ViewModeToggle from '@components/admin/ViewModeToggle';
import BomberoActionsMenu from '@components/admin/BomberoActionsMenu';

// Helpers
// import { formatTelefono } from '@helpers/phoneFormatter';

// Iconos
import { MdPersonAddAlt1, MdSecurity, MdAdd, MdRefresh, MdHelpOutline, MdBusiness, MdLocationOn, MdSearch, MdClear } from 'react-icons/md';

const Admin = () => {
  const { bombero: currentBombero, hasPermiso } = useAuth();

  // Hooks personalizados - SIEMPRE se llaman en el mismo orden
  const { availableTabs, activeTab, setActiveTab } = useAdminTabs(hasPermiso);
  const { modals, modalData, openModal, closeModal } = useAdminModals();
  const { bomberosViewMode, setBomberosViewMode, rolesViewMode, setRolesViewMode } = useViewModes();

  // Hooks de datos - SIEMPRE inicializados para mantener orden consistente
  const {
    bomberos,
    fetchBomberos,
    // setBomberos, 
    loading: bomberosLoading,
    handleCreateBombero,
    handleUpdateBombero,
    handleDeleteBombero,
    handleChangeBomberoStatus
  } = useBomberos();

  const { roles, fetchRoles, loading: rolesLoading, error: rolesError, handleDeleteRole } = useRoles();
  // const { permisos, permisosByCategory, refreshPermisosByCategory, loading: permisosLoading } = usePermisos();

  const { filteredBomberos, handleDateFilterChange } = useBomberosFilter(bomberos);

  // Estado para búsqueda de roles
  const [rolesSearchTerm, setRolesSearchTerm] = useState('');

  // Función para filtrar roles basado en el término de búsqueda
  const filteredRoles = roles.filter(role =>
    role.nombre?.toLowerCase().includes(rolesSearchTerm.toLowerCase()) ||
    role.descripcion?.toLowerCase().includes(rolesSearchTerm.toLowerCase()) ||
    (Array.isArray(role.permisos) && role.permisos.some(permiso =>
      permiso.toLowerCase().includes(rolesSearchTerm.toLowerCase())
    ))
  );

  // Función para limpiar la búsqueda de roles
  const clearRolesSearch = () => {
    setRolesSearchTerm('');
  };

  // Función para manejar la actualización de bomberos
  // const handleUpdate = (bombero) => {
  //   openModal('editBombero', bombero);
  // };

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
    fetchRoles();
  };

  // Funciones para manejar acciones de roles en RolesView
  const handleEditRole = (role) => {
    openModal('updateRol', role);
  };

  const handleDeleteRoleFromView = async (roleId) => {
    // Usar la función del hook useRoles y retornar el resultado
    return await handleDeleteRole(roleId);
  };

  const handleViewRoleDetails = (role) => {
    openModal('viewRoleDetails', role);
  };

  const handleRefreshRolesList = () => {
    fetchRoles();
    closeModal('createRol'); // Cerrar el modal después de crear un rol
  };

  // Cargar datos según la pestaña activa, solo cuando sea necesario
  useEffect(() => {
    console.log(`Admin: Cambió pestaña activa a: ${activeTab}`);

    if (activeTab === 'bomberos' && (!bomberos || bomberos.length === 0) && !bomberosLoading) {
      console.log('Admin: Cargando bomberos...');
      fetchBomberos(true);
    } else if (activeTab === 'roles' && (!roles || roles.length === 0) && !rolesLoading) {
      console.log('Admin: Cargando roles...');
      fetchRoles(true);
    } else if (activeTab === 'permisos') {
      console.log('Admin: Pestaña permisos - se cargan en el componente');
      // Los permisos se cargan bajo demanda en el componente PermisosView
    }
    // Para las otras pestañas (companias, direcciones) no cargamos datos aún
  }, [activeTab]); // Solo activeTab como dependencia

  // Configuración de la tabla bomberos con memoization
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
      {/* Header compacto con título y pestañas en línea */}
      <div className="bg-white/80 backdrop-blur-lg border border-[#4EB9FA]/20 shadow-xl rounded-2xl mb-4 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-[#2C3E50]">Administración</h1>
            <Tooltip
              id="admin-help"
              content="Gestiona bomberos, roles y permisos del sistema. Aquí puedes crear, editar y administrar toda la información del personal y configuraciones de seguridad."
              place="bottom"
              variant="dark"
            >
              <MdHelpOutline className="h-5 w-5 text-gray-400 hover:text-[#4EB9FA] transition-colors cursor-help" />
            </Tooltip>
          </div>

          {/* Navegación por pestañas en línea */}
          <div className="flex-shrink-0">
            <AdminTabNavigation
              availableTabs={availableTabs}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              hasPermiso={hasPermiso}
            />
          </div>
        </div>
      </div>

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

                  <Tooltip
                    id="refresh-bomberos-btn"
                    content="Recargar la lista de bomberos desde el servidor"
                    place="top"
                    variant="dark"
                  >
                    <button
                      onClick={handleRefresh}
                      className={`px-3 py-2 border rounded-lg transition-colors ${bomberosLoading ? 'text-gray-400 border-gray-300 cursor-not-allowed' : 'text-[#4EB9FA] hover:text-[#3DA8E9] border-[#4EB9FA] hover:bg-[#4EB9FA]/10'}`}
                      title="Actualizar"
                      disabled={bomberosLoading}
                    >
                      <MdRefresh size={20} className={bomberosLoading ? 'animate-spin' : ''} />
                    </button>
                  </Tooltip>

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
                  {/* Buscador */}
                  <div className="relative max-w-md">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MdSearch className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Buscar roles por nombre, descripción o permisos..."
                      value={rolesSearchTerm}
                      onChange={(e) => setRolesSearchTerm(e.target.value)}
                      className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                    {rolesSearchTerm && (
                      <button
                        onClick={clearRolesSearch}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                      >
                        <MdClear className="h-5 w-5" />
                      </button>
                    )}
                  </div>

                  {/* Estadísticas */}
                  <span className="text-sm text-gray-600">
                    Total: {roles.length} roles
                    {rolesSearchTerm && ` | Filtrados: ${filteredRoles.length}`}
                  </span>

                  <Tooltip
                    id="refresh-roles-btn"
                    content="Recargar la lista de roles desde el servidor"
                    place="top"
                    variant="dark"
                  >
                    <button
                      onClick={handleRefreshRoles}
                      className={`px-3 py-2 border rounded-lg transition-colors ${rolesLoading ? 'text-gray-400 border-gray-300 cursor-not-allowed' : 'text-[#4EB9FA] hover:text-[#3DA8E9] border-[#4EB9FA] hover:bg-[#4EB9FA]/10'}`}
                      disabled={rolesLoading}
                    >
                      <MdRefresh size={20} className={rolesLoading ? 'animate-spin' : ''} />
                    </button>
                  </Tooltip>

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

              <RolesView
                roles={filteredRoles}
                loading={rolesLoading}
                error={rolesError}
                onEdit={handleEditRole}
                onDelete={handleDeleteRoleFromView}
                onViewDetails={handleViewRoleDetails}
                onRefresh={handleRefreshRolesList}
                searchTerm={rolesSearchTerm}
                onSearchChange={setRolesSearchTerm}
              />
            </div>
          )}

          {activeTab === 'permisos' && (
            <PermisosView />
          )}

          {activeTab === 'companias' && (
            <div className="bg-white/80 backdrop-blur-lg border border-[#4EB9FA]/20 shadow-xl p-3 sm:p-4 lg:p-6 rounded-2xl mb-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Gestión de Compañías</h2>
                <div className="flex items-center gap-2">
                  {hasPermiso('compania:crear') && (
                    <Tooltip
                      id="create-compania-btn"
                      content="Crear una nueva compañía en el sistema"
                      place="top"
                      variant="dark"
                    >
                      <button
                        className="bg-[#2C3E50] hover:bg-[#34495E] text-white font-semibold px-4 py-2 rounded-lg shadow transition-all duration-200 border border-[#2C3E50] hover:-translate-y-0.5 hover:scale-105"
                        onClick={() => {/* TODO: Implementar crear compañía */ }}
                      >
                        <span className="flex items-center gap-2">
                          <MdAdd size={18} />
                          <span className="hidden sm:inline">Crear compañía</span>
                        </span>
                      </button>
                    </Tooltip>
                  )}
                </div>
              </div>
              <div className="text-center py-12">
                <MdBusiness size={64} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">Gestión de Compañías</h3>
                <p className="text-gray-500">
                  Aquí se administrarán las compañías de bomberos del sistema.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'direcciones' && (
            <div className="bg-white/80 backdrop-blur-lg border border-[#4EB9FA]/20 shadow-xl p-3 sm:p-4 lg:p-6 rounded-2xl mb-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Gestión de Direcciones</h2>
                <div className="flex items-center gap-2">
                  {(hasPermiso('region:crear') || hasPermiso('comuna:crear')) && (
                    <Tooltip
                      id="create-direccion-btn"
                      content="Administrar regiones y comunas del sistema"
                      place="top"
                      variant="dark"
                    >
                      <button
                        className="bg-[#2C3E50] hover:bg-[#34495E] text-white font-semibold px-4 py-2 rounded-lg shadow transition-all duration-200 border border-[#2C3E50] hover:-translate-y-0.5 hover:scale-105"
                        onClick={() => {/* TODO: Implementar administrar direcciones */ }}
                      >
                        <span className="flex items-center gap-2">
                          <MdLocationOn size={18} />
                          <span className="hidden sm:inline">Administrar</span>
                        </span>
                      </button>
                    </Tooltip>
                  )}
                </div>
              </div>
              <div className="text-center py-12">
                <MdLocationOn size={64} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">Gestión de Direcciones</h3>
                <p className="text-gray-500">
                  Aquí se administrarán las regiones, comunas y direcciones del sistema.
                </p>
              </div>
            </div>
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
          onRoleCreated={handleRefreshRolesList}
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
