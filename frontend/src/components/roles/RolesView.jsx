import React, { useState, useEffect } from 'react';
import { 
  MdSecurity, 
  MdEdit, 
  MdDelete, 
  MdExpandMore,
  MdExpandLess,
  MdCheck,
  MdClose,
  MdAdd
} from 'react-icons/md';
import { useRoles } from '@hooks/roles/useRoles';
import usePermisos from '@hooks/permisos/usePermisos';
import { useAuth } from '@hooks/auth/useAuth';
import RolFormModal from '@components/roles/RolFormModal';
import { showConfirmAlert } from '@helpers/sweetAlert.js';

const RolesView = ({ viewMode = 'cards', refreshTrigger }) => {
  const { roles, loading, error, fetchRoles, handleDeleteRole } = useRoles();
  const { permisos, permisosByCategory, refreshPermisos } = usePermisos();
  const { hasPermiso } = useAuth();
  const [expandedRoles, setExpandedRoles] = useState(new Set());
  const [showModal, setShowModal] = useState(false);
  const [editingRole, setEditingRole] = useState(null);

  // Cargar solo roles cuando se monta el componente
  useEffect(() => {
    if ((!roles || roles.length === 0) && !loading) {
      fetchRoles(true);
    }
    // Los permisos se cargarán bajo demanda cuando se necesiten para mostrar detalles
  }, []);

  // Refrescar roles cuando cambie refreshTrigger
  useEffect(() => {
    if (refreshTrigger) {
      fetchRoles(true);
    }
  }, [refreshTrigger]);



  // Función para alternar la expansión de un rol
  const toggleRoleExpansion = (roleId) => {
    const newExpanded = new Set(expandedRoles);
    if (newExpanded.has(roleId)) {
      newExpanded.delete(roleId);
    } else {
      newExpanded.add(roleId);
      // Cargar permisos cuando se expande un rol para mostrar detalles
      ensurePermisosLoaded();
    }
    setExpandedRoles(newExpanded);
  };

  // Función para abrir el modal de edición
  const handleEditRole = (role) => {
    setEditingRole(role);
    setShowModal(true);
  };

  // Función para confirmar eliminación
  const handleDeleteConfirm = async (role) => {
    const result = await showConfirmAlert(
      '¿Eliminar rol?',
      `¿Estás seguro de que deseas eliminar el rol "${role.nombre}"? Esta acción no se puede deshacer.`,
      'Eliminar',
      'Cancelar'
    );

    if (result.isConfirmed) {
      await handleDeleteRole(role.id);
    }
  };

  // Función para obtener el color del badge según el rol
  const getRoleColor = (roleName) => {
    const roleKey = roleName?.toLowerCase() || '';
    if (roleKey.includes('administrador') || roleKey.includes('admin')) {
      return 'bg-red-100 text-red-800 border-red-200';
    } else if (roleKey.includes('supervisor') || roleKey.includes('moderador')) {
      return 'bg-orange-100 text-orange-800 border-orange-200';
    } else if (roleKey.includes('usuario') || roleKey.includes('user')) {
      return 'bg-blue-100 text-blue-800 border-blue-200';
    }
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  // Función para cargar permisos si no están disponibles
  const ensurePermisosLoaded = () => {
    if (permisos.length === 0 && Object.keys(permisosByCategory).length === 0) {
      refreshPermisos(true);
    }
  };

  // Función para agrupar permisos por categoría
  const groupPermisosByCategory = (rolePermisos) => {
    const grouped = {};
    
    rolePermisos.forEach(permisoName => {
      // Buscar el permiso en todas las categorías
      let foundPermiso = null;
      let foundCategory = null;
      
      // Buscar en permisosByCategory primero
      for (const [category, categoryPermisos] of Object.entries(permisosByCategory)) {
        const permiso = categoryPermisos.find(p => p.nombre === permisoName);
        if (permiso) {
          foundPermiso = permiso;
          foundCategory = category;
          break;
        }
      }
      
      // Si no se encuentra en permisosByCategory, buscar en permisos
      if (!foundPermiso) {
        foundPermiso = permisos.find(p => p.nombre === permisoName);
        foundCategory = foundPermiso?.categoria || 'Sin categoría';
      }
      
      if (foundPermiso && foundCategory) {
        if (!grouped[foundCategory]) {
          grouped[foundCategory] = [];
        }
        grouped[foundCategory].push(foundPermiso);
      } else {
        // Solo como último recurso, crear un permiso temporal con categoría normalizada
        const tempPermiso = {
          id: `temp-${permisoName}`,
          nombre: permisoName,
          descripcion: `Descripción de ${permisoName}`,
          categoria: 'Sin categoría'
        };
        const category = 'Sin categoría';
        if (!grouped[category]) {
          grouped[category] = [];
        }
        grouped[category].push(tempPermiso);
      }
    });

    return grouped;
  };

  // Función para renderizar la vista de cards
  const renderCardsView = () => {
    // Cargar permisos si hay roles con permisos para mostrar categorías
    if (roles.some(role => role.permisos && role.permisos.length > 0)) {
      ensurePermisosLoaded();
    }
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {roles.map((role) => {
          const groupedPermisos = groupPermisosByCategory(role.permisos || []);
          const totalCategories = Object.keys(groupedPermisos).length;
          
          return (
            <div key={role.id} className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              {/* Header de la card */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#4EB9FA]/10 rounded-lg">
                      <MdSecurity className="text-[#4EB9FA]" size={24} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 text-lg">{role.nombre}</h3>
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full border ${getRoleColor(role.nombre)}`}>
                        {role.permisos?.length || 0} permisos
                      </span>
                    </div>
                  </div>
                  
                  {/* Acciones */}
                  <div className="flex items-center gap-1">
                    {hasPermiso('rol:actualizar') && (
                      <button
                        onClick={() => handleEditRole(role)}
                        className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                        title="Editar rol"
                      >
                        <MdEdit size={18} />
                      </button>
                    )}
                    {hasPermiso('rol:eliminar') && (
                      <button
                        onClick={() => handleDeleteConfirm(role)}
                        className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-colors"
                        title="Eliminar rol"
                      >
                        <MdDelete size={18} />
                      </button>
                    )}
                  </div>
                </div>
                
                <p className="text-gray-600 text-sm line-clamp-2">{role.descripcion}</p>
              </div>

              {/* Contenido de la card */}
              <div className="p-6">
                {totalCategories === 0 ? (
                  <div className="text-center py-6 text-gray-500">
                    <MdSecurity size={32} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Sin permisos asignados</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Categorías de permisos:</span>
                      <span className="font-medium text-[#4EB9FA]">{totalCategories}</span>
                    </div>
                    
                    <div className="space-y-2">
                      {Object.entries(groupedPermisos).slice(0, 3).map(([category, categoryPermisos]) => (
                        <div key={category} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-[#4EB9FA] rounded-full"></span>
                            <span className="text-sm font-medium text-gray-700 truncate">{category}</span>
                          </div>
                          <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-full">
                            {categoryPermisos.length}
                          </span>
                        </div>
                      ))}
                      
                      {totalCategories > 3 && (
                        <div className="text-center">
                          <span className="text-xs text-gray-500">
                            +{totalCategories - 3} categorías más
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Función para renderizar la vista de lista
  const renderListView = () => {
    return (
      <div className="space-y-4">
        {roles.map((role) => {
          const isExpanded = expandedRoles.has(role.id);
          const groupedPermisos = groupPermisosByCategory(role.permisos || []);
          
          return (
            <div key={role.id} className="bg-white rounded-lg border border-gray-200 shadow-sm">
              {/* Header del rol */}
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <button
                      onClick={() => toggleRoleExpansion(role.id)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {isExpanded ? <MdExpandLess size={24} /> : <MdExpandMore size={24} />}
                    </button>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <MdSecurity className="text-[#4EB9FA]" size={20} />
                        <h3 className="font-semibold text-gray-800">{role.nombre}</h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getRoleColor(role.nombre)}`}>
                          {role.permisos?.length || 0} permisos
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm">{role.descripcion}</p>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex items-center gap-2">
                    {hasPermiso('rol:actualizar') && (
                      <button
                        onClick={() => handleEditRole(role)}
                        className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                        title="Editar rol"
                      >
                        <MdEdit size={18} />
                      </button>
                    )}
                    {hasPermiso('rol:eliminar') && (
                      <button
                        onClick={() => handleDeleteConfirm(role)}
                        className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-colors"
                        title="Eliminar rol"
                      >
                        <MdDelete size={18} />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Permisos expandidos */}
              {isExpanded && (
                <div className="p-4">
                  {Object.keys(groupedPermisos).length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <MdSecurity size={32} className="mx-auto mb-2 opacity-50" />
                      <p>Este rol no tiene permisos asignados</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {Object.entries(groupedPermisos).map(([category, categoryPermisos]) => (
                        <div key={category} className="border border-gray-100 rounded-lg p-3">
                          <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                            <span className="w-2 h-2 bg-[#4EB9FA] rounded-full"></span>
                            {category}
                            <span className="text-xs text-gray-500">({categoryPermisos.length})</span>
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                            {categoryPermisos.map((permiso) => (
                              <div
                                key={permiso.id}
                                className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-lg"
                              >
                                <MdCheck className="text-green-600 flex-shrink-0" size={16} />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-800 truncate">
                                    {permiso.nombre}
                                  </p>
                                  <p className="text-xs text-gray-600 truncate">
                                    {permiso.descripcion}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4EB9FA]"></div>
        <span className="ml-2 text-gray-600">Cargando roles...</span>
      </div>
    );
  }

  // Mostrar estado de error
  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">
          <MdClose size={48} className="mx-auto" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Error al cargar roles</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={() => {
            fetchRoles(true);
          }}
          className="bg-[#4EB9FA] hover:bg-[#3DA8E9] text-white px-4 py-2 rounded-lg transition-colors"
          disabled={loading}
        >
          {loading ? 'Cargando...' : 'Reintentar'}
        </button>
      </div>
    );
  }
  
  // Mostrar estado de carga inicial
  if (loading && roles.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-[#4EB9FA] mb-4">
          <MdRefresh size={48} className="mx-auto animate-spin" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Cargando roles</h3>
        <p className="text-gray-600">Por favor espere...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Contenido de roles */}
      {roles.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <MdSecurity size={64} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No hay roles</h3>
          <p className="text-gray-500 mb-4">
            No se encontraron roles en el sistema.
          </p>
        </div>
      ) : (
        viewMode === 'list' ? renderListView() : renderCardsView()
      )}



      {/* Modal para editar rol */}
      <RoleFormModal
        show={showModal}
        setShow={setShowModal}
        editingRole={editingRole}
        onSuccess={fetchRoles}
      />
    </div>
  );
};

export default RolesView;