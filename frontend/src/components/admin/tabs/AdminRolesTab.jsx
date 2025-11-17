import React, { useState, useEffect } from 'react';
import { useAdmin } from '@context/AdminContext';
import { useAdminModals } from '@components/admin/AdminModalsProvider';
import { useRoles } from '@hooks/roles/useRoles';

// Componentes
import RolesView from '@components/roles/RolesView';
import Tooltip from '@components/Tooltip';

// Modales
import CreateRolPopup from '@components/roles/CreateRolPopup';
import UpdateRolPopup from '@components/roles/UpdateRolPopup';

// Iconos
import { MdAdd, MdRefresh, MdSearch, MdClear } from 'react-icons/md';

/**
 * Componente específico para la gestión de roles
 * Contiene toda la lógica relacionada con la administración de roles
 */
const AdminRolesTab = () => {
  const { hasPermiso, refreshTrigger } = useAdmin();
  const { 
    openModal, 
    closeModal, 
    isModalOpen, 
    getModalData 
  } = useAdminModals();

  // Estado local para búsqueda
  const [rolesSearchTerm, setRolesSearchTerm] = useState('');

  // Hooks específicos para roles
  const { 
    roles, 
    fetchRoles, 
    loading: rolesLoading, 
    error: rolesError, 
    handleDeleteRole,
    handleCreateRole,
    handleUpdateRole 
  } = useRoles();

  // Cargar roles al montar el componente
  useEffect(() => {
    if (hasPermiso('rol:obtener')) {
      fetchRoles(true);
    }
  }, [refreshTrigger, hasPermiso]);

  // Filtrar roles basado en el término de búsqueda
  const filteredRoles = roles.filter(role =>
    role.nombre?.toLowerCase().includes(rolesSearchTerm.toLowerCase()) ||
    role.descripcion?.toLowerCase().includes(rolesSearchTerm.toLowerCase()) ||
    (Array.isArray(role.permisos) && role.permisos.some(permiso =>
      permiso.toLowerCase().includes(rolesSearchTerm.toLowerCase())
    ))
  );

  // Handlers para acciones de roles
  const handleEditRole = (role) => {
    openModal('updateRol', role);
  };

  const handleDeleteRoleFromView = async (roleId) => {
    return await handleDeleteRole(roleId);
  };

  const handleViewRoleDetails = (role) => {
    openModal('viewRoleDetails', role);
  };

  const handleRefreshRoles = () => {
    fetchRoles();
  };

  const handleCreateRol = () => {
    openModal('createRol');
  };

  const handleRoleCreated = async (newRole) => {
    const result = await handleCreateRole(newRole);
    if (result.success) {
      closeModal('createRol');
      fetchRoles(); // Refrescar la lista
    }
    return result;
  };

  const handleRoleUpdated = async (updatedRoleData) => {
    // Obtener el ID del rol desde los datos del modal
    const roleData = getModalData('updateRol');
    if (!roleData || !roleData.id) {
      return { success: false, error: 'No se encontró el ID del rol' };
    }
    
    const result = await handleUpdateRole(roleData.id, updatedRoleData);
    if (result.success) {
      closeModal('updateRol');
      fetchRoles(); // Refrescar la lista
    }
    return result;
  };

  // Función para limpiar la búsqueda
  const clearRolesSearch = () => {
    setRolesSearchTerm('');
  };

  return (
    <>
      <div className="bg-white/80 backdrop-blur-lg border border-[#4EB9FA]/20 shadow-xl p-6 rounded-2xl">
        {/* Header de la sección */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Gestión de Roles</h2>
            <p className="text-gray-600 text-sm mt-1">
              Administra los roles y permisos del sistema
            </p>
          </div>
          
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
            <span className="text-sm text-gray-600 whitespace-nowrap">
              Total: {roles.length} roles
              {rolesSearchTerm && ` | Filtrados: ${filteredRoles.length}`}
            </span>

            {/* Botón refrescar */}
            <Tooltip
              id="refresh-roles-btn"
              content="Recargar la lista de roles desde el servidor"
              place="top"
              variant="dark"
            >
              <button
                onClick={handleRefreshRoles}
                className={`px-3 py-2 border rounded-lg transition-colors ${
                  rolesLoading 
                    ? 'text-gray-400 border-gray-300 cursor-not-allowed' 
                    : 'text-[#4EB9FA] hover:text-[#3DA8E9] border-[#4EB9FA] hover:bg-[#4EB9FA]/10'
                }`}
                disabled={rolesLoading}
              >
                <MdRefresh size={20} className={rolesLoading ? 'animate-spin' : ''} />
              </button>
            </Tooltip>

            {/* Botón crear rol */}
            {hasPermiso('rol:admin') && (
              <Tooltip
                id="create-role-btn"
                content="Crear un nuevo rol en el sistema"
                place="top"
                variant="dark"
              >
                <button
                  onClick={handleCreateRol}
                  className="bg-[#2C3E50] hover:bg-[#34495E] text-white font-semibold px-4 py-2 rounded-lg shadow transition-all duration-200 border border-[#2C3E50] hover:-translate-y-0.5 hover:scale-105"
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

        {/* Vista de roles */}
        <RolesView
          roles={filteredRoles}
          loading={rolesLoading}
          error={rolesError}
          onEdit={handleEditRole}
          onDelete={handleDeleteRoleFromView}
          onViewDetails={handleViewRoleDetails}
          onRefresh={handleRefreshRoles}
          searchTerm={rolesSearchTerm}
          onSearchChange={setRolesSearchTerm}
        />
      </div>

      {/* Modales */}
      <CreateRolPopup
        show={isModalOpen('createRol')}
        setShow={(show) => show ? openModal('createRol') : closeModal('createRol')}
        onRoleCreated={handleRoleCreated}
      />

      <UpdateRolPopup
        show={isModalOpen('updateRol')}
        setShow={(show) => show ? openModal('updateRol') : closeModal('updateRol')}
        editingRole={getModalData('updateRol')}
        onRoleUpdated={handleRoleUpdated}
      />
    </>
  );
};

export default AdminRolesTab;