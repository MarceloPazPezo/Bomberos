import React, { useState, useEffect } from 'react';
import BomberosLoader from '@components/BomberosLoader';
import { 
  MdSecurity, 
  MdEdit, 
  MdDelete, 
  MdVisibility,
  MdToggleOn,
  MdToggleOff,
  MdClose,
  MdRefresh,
  MdAccessTime,
  MdExpandMore,
  MdExpandLess,
  MdCheck,
  MdAdd,
  MdPeople,
  MdSearch,
  MdClear,
  MdPersonAdd,
  MdUpdate
} from 'react-icons/md';
import { useAuth } from '@hooks/auth/useAuth';
import { showConfirmAlert } from '@helpers/fireAlert.js';
import Tooltip from '@components/Tooltip.jsx';

const RolesView = ({ 
  roles = [],
  loading = false,
  error = null,
  onEdit,
  onDelete,
  onViewDetails,
  onRefresh,
  renderActions,
  searchTerm = '',
  onSearchChange
}) => {
  // Verificación de seguridad para el contexto de autenticación
  let hasPermiso;
  try {
    const auth = useAuth();
    hasPermiso = auth?.hasPermiso || (() => false);
  } catch (error) {
    // Fallback durante hot reload o si el contexto no está disponible
    console.warn('AuthContext no disponible, usando permisos por defecto');
    hasPermiso = () => false;
  }
  
  const [expandedRoles, setExpandedRoles] = useState(new Set());

  // Función para filtrar roles basado en el término de búsqueda
  const filteredRoles = roles.filter(role =>
    role.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (Array.isArray(role.permisos) && role.permisos.some(permiso => 
      permiso.toLowerCase().includes(searchTerm.toLowerCase())
    ))
  );

  // Función para alternar la expansión de un rol
  const toggleRoleExpansion = (roleId) => {
    const newExpanded = new Set(expandedRoles);
    if (newExpanded.has(roleId)) {
      newExpanded.delete(roleId);
    } else {
      newExpanded.add(roleId);
    }
    setExpandedRoles(newExpanded);
  };

  // Función para manejar la eliminación de un rol
  const handleDelete = async (role) => {
    const result = await showConfirmAlert(
      'Confirmar eliminación',
      `¿Estás seguro de que quieres eliminar el rol "${role.nombre}"?`,
      'Eliminar',
      'Cancelar'
    );

    if (result.isConfirmed && onDelete) {
      const deleteResult = await onDelete(role.id);
      
      // Si la eliminación falló porque el rol no existe, actualizar la vista
      if (deleteResult && !deleteResult.success && deleteResult.error?.includes('no existe')) {
        // Opcional: podrías mostrar un mensaje adicional aquí
        console.log('Rol eliminado o no encontrado, la lista se actualizará automáticamente');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <BomberosLoader size="md" message="Cargando roles..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">
          <MdSecurity size={48} className="mx-auto mb-2" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Error al cargar roles</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <MdRefresh className="inline mr-2" />
              Reintentar
            </button>
          )}
        </div>
      </div>
    );
  }

  if (!roles || roles.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
        <MdSecurity size={48} className="mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-semibold text-gray-800 mb-2">No hay roles disponibles</h3>
        <p className="text-gray-600">No se encontraron roles en el sistema.</p>
      </div>
    );
  }

  // Vista principal con datos
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredRoles.map((role) => (
        <div key={role.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <div className="p-6">
            {/* Header del card */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 h-10 w-10">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <MdSecurity className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900">{role.nombre}</h3>
                  <p className="text-sm text-gray-500">{role.descripcion}</p>
                </div>
              </div>
            </div>

            {/* Información del rol */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center text-sm text-gray-600">
                <MdPeople className="h-4 w-4 mr-2 text-gray-400" />
                {Array.isArray(role.permisos) ? role.permisos.length : 0} permisos asignados
              </div>
              
              {/* Información de creación */}
              {role.creadoEl && (
                <div className="flex items-center text-sm text-gray-600">
                  <MdAccessTime className="h-4 w-4 mr-2 text-gray-400" />
                  Creado: {new Date(role.creadoEl).toLocaleDateString()}
                  <span className="ml-2 text-gray-500">
                    por {role.creador ? `${role.creador.nombres} ${role.creador.apellidos}` : 'Sistema'}
                  </span>
                </div>
              )}

              {/* Información de actualización */}
              {role.actualizadoEl && (
                <div className="flex items-center text-sm text-gray-600">
                  <MdUpdate className="h-4 w-4 mr-2 text-gray-400" />
                  Actualizado: {new Date(role.actualizadoEl).toLocaleDateString()}
                  <span className="ml-2 text-gray-500">
                    por {role.actualizador ? `${role.actualizador.nombres} ${role.actualizador.apellidos}` : 'Sistema'}
                  </span>
                </div>
              )}
            </div>

            {/* Permisos expandibles */}
            {Array.isArray(role.permisos) && role.permisos.length > 0 && (
              <div className="mb-4">
                <button
                  onClick={() => toggleRoleExpansion(role.id)}
                  className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                >
                  {expandedRoles.has(role.id) ? (
                    <>
                      <MdExpandLess className="h-4 w-4 mr-1" />
                      Ocultar permisos
                    </>
                  ) : (
                    <>
                      <MdExpandMore className="h-4 w-4 mr-1" />
                      Ver permisos
                    </>
                  )}
                </button>
                {expandedRoles.has(role.id) && (
                  <div className="mt-2 max-h-32 overflow-y-auto">
                    <div className="flex flex-wrap gap-1">
                      {role.permisos.map((permiso, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800"
                        >
                          {permiso}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Acciones */}
            <div className="flex items-center justify-end space-x-2 pt-4 border-t border-gray-200">
              {hasPermiso('rol:actualizar') && (
                <Tooltip id={`edit-${role.id}`} content="Editar">
                  <button
                    onClick={() => onEdit && onEdit(role)}
                    className="text-yellow-600 hover:text-yellow-800 p-2 rounded-md hover:bg-yellow-50"
                  >
                    <MdEdit className="h-4 w-4" />
                  </button>
                </Tooltip>
              )}
              {hasPermiso('rol:eliminar') && (
                <Tooltip id={`delete-${role.id}`} content="Eliminar">
                  <button
                    onClick={() => handleDelete(role)}
                    className="text-red-600 hover:text-red-800 p-2 rounded-md hover:bg-red-50"
                  >
                    <MdDelete className="h-4 w-4" />
                  </button>
                </Tooltip>
              )}
              {renderActions && renderActions(role)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RolesView;