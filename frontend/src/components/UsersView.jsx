import React, { useState, useEffect } from 'react';
import { 
  MdPerson, 
  MdEdit, 
  MdDelete, 
  MdVisibility,
  MdToggleOn,
  MdToggleOff,
  MdEmail,
  MdPhone,
  MdLocationOn,
  MdCalendarToday,
  MdClose,
  MdRefresh,
  MdAccessTime,
  MdBusiness
} from 'react-icons/md';
import { useAuth } from '@hooks/auth/useAuth';
import { showConfirmAlert } from '@helpers/sweetAlert.js';
import Table from '@components/Table.jsx';
import Tooltip from '@components/Tooltip.jsx';

const UsersView = ({ 
  viewMode = 'list',
  users = [],
  loading = false,
  error = null,
  columns = [],
  badgeMap = {},
  onEdit,
  onDelete,
  onViewDetails,
  onChangeStatus,
  onRefresh,
  filteredUsers = [],
  renderActions,
  customActions
}) => {
  const { hasPermission } = useAuth();
  
  // Estado para detectar vista móvil
  const [isMobile, setIsMobile] = useState(false);
  
  // Hook para detectar tamaño de pantalla
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint de Tailwind
    };
    
    // Verificar al montar
    checkMobile();
    
    // Agregar listener para cambios de tamaño
    window.addEventListener('resize', checkMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Función para obtener el color del badge según el estado
  const getStatusColor = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'activo':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'inactivo':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'suspendido':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Función para obtener el color del rol
  const getRoleColor = (roles) => {
    if (!roles || roles.length === 0) return 'bg-gray-100 text-gray-800';
    
    const roleNames = roles.map(role => (role.nombre || role.name || role).toLowerCase());
    
    if (roleNames.some(name => name.includes('administrador') || name.includes('admin'))) {
      return 'bg-red-100 text-red-800';
    } else if (roleNames.some(name => name.includes('supervisor') || name.includes('moderador'))) {
      return 'bg-orange-100 text-orange-800';
    } else if (roleNames.some(name => name.includes('usuario') || name.includes('user'))) {
      return 'bg-blue-100 text-blue-800';
    }
    return 'bg-green-100 text-green-800';
  };

  // Función para confirmar eliminación
  const handleDeleteConfirm = async (user) => {
    const result = await showConfirmAlert(
      '¿Eliminar usuario?',
      `¿Estás seguro de que deseas eliminar al usuario "${getFullName(user)}"? Esta acción no se puede deshacer.`,
      'Eliminar',
      'Cancelar'
    );

    if (result.isConfirmed && onDelete) {
      onDelete([user]);
    }
  };

  // Función para cambiar estado del usuario
  const handleStatusChange = async (user) => {
    const newStatus = user.estado === 'Activo' ? 'Inactivo' : 'Activo';
    const result = await showConfirmAlert(
      `¿${newStatus === 'Activo' ? 'Activar' : 'Desactivar'} usuario?`,
      `¿Estás seguro de que deseas ${newStatus === 'Activo' ? 'activar' : 'desactivar'} al usuario "${getFullName(user)}"?`,
      newStatus === 'Activo' ? 'Activar' : 'Desactivar',
      'Cancelar'
    );

    if (result.isConfirmed && onChangeStatus) {
      onChangeStatus(user.id, newStatus);
    }
  };

  // Función para formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return 'No disponible';
    try {
      return new Date(dateString).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Fecha inválida';
    }
  };

  // Función para obtener el nombre completo del usuario
  const getFullName = (user) => {
    if (user?.nombres && user?.apellidos) {
      // Manejar tanto arrays como strings
      const nombres = Array.isArray(user.nombres) ? user.nombres.join(' ') : user.nombres;
      const apellidos = Array.isArray(user.apellidos) ? user.apellidos.join(' ') : user.apellidos;
      return `${nombres} ${apellidos}`;
    }
    if (user?.nombre) {
      return user.nombre;
    }
    if (user?.name && user.name !== 'undefined undefined') {
      return user.name;
    }
    if (user?.email) {
      return user.email;
    }
    return 'Usuario sin nombre';
  };

  // Función para calcular la edad
  const calculateAge = (fechaNacimiento) => {
    if (!fechaNacimiento) return null;
    
    const today = new Date();
    let birthDate;
    
    // Manejar diferentes formatos de fecha
    if (typeof fechaNacimiento === 'string') {
      // Si la fecha está en formato DD-MM-YYYY, convertirla a YYYY-MM-DD
      if (fechaNacimiento.includes('-') && fechaNacimiento.length === 10) {
        const parts = fechaNacimiento.split('-');
        if (parts.length === 3) {
          // Verificar si está en formato DD-MM-YYYY
          if (parts[0].length === 2 && parts[1].length === 2 && parts[2].length === 4) {
            // Convertir DD-MM-YYYY a YYYY-MM-DD
            const formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
            birthDate = new Date(formattedDate);
          } else {
            // Asumir que ya está en formato correcto
            birthDate = new Date(fechaNacimiento);
          }
        } else {
          birthDate = new Date(fechaNacimiento);
        }
      } else {
        birthDate = new Date(fechaNacimiento);
      }
    } else {
      birthDate = new Date(fechaNacimiento);
    }
    
    // Verificar si la fecha es válida
    if (isNaN(birthDate.getTime())) {
      return null;
    }
    
    // Verificar que la fecha de nacimiento no sea futura
    if (birthDate > today) {
      return null;
    }
    
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    // Verificar que la edad sea razonable (entre 0 y 150 años)
    if (age < 0 || age > 150) {
      return null;
    }
    
    return age;
  };

  // Función para renderizar la vista de cards
  const renderCardsView = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredUsers.map((user) => {
          const age = calculateAge(user.fechaNacimiento);
          
          return (
            <div key={user.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden">
              {/* Header con avatar y acciones */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 relative">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <MdPerson className="text-blue-600" size={24} />
                    </div>
                    
                    {/* Info básica */}
                     <div>
                       <h3 className="font-semibold text-gray-800 text-base leading-tight">
                         {getFullName(user)}
                       </h3>
                       <div className="flex items-center gap-2 text-sm text-gray-600">
                         {user.run && (
                           <span>RUN: {user.run}</span>
                         )}
                         {user.run && age !== null && (
                           <span className="text-gray-400">•</span>
                         )}
                         {age !== null && (
                           <span>{age} años</span>
                         )}
                         {!user.run && age === null && user.email && (
                           <span className="truncate">{user.email}</span>
                         )}
                         {!user.run && age === null && !user.email && (
                           <span className="text-gray-500">Sin información adicional</span>
                         )}
                       </div>
                     </div>
                  </div>
                  
                  {/* Badges de estado y rol */}
                  <div className="flex flex-col gap-1 items-end">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(user.estado)}`}>
                      {user.estado === 'Activo' ? 'En Servicio' : user.estado}
                    </span>
                    {user.roles && user.roles.length > 0 && (
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(user.roles)}`}>
                        {user.roles[0].nombre || user.roles[0].name || user.roles[0]}
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Indicador de estado visual */}
                <div className="absolute top-2 left-2">
                  {user.estado === 'Activo' ? (
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  ) : (
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  )}
                </div>
              </div>

              {/* Contenido principal */}
              <div className="p-4 space-y-3">
                {/* Email */}
                {user.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <MdEmail className="text-gray-400 flex-shrink-0" size={16} />
                    <span className="text-gray-700 truncate">{user.email}</span>
                  </div>
                )}
                
                {/* Teléfono */}
                {user.telefono && (
                  <div className="flex items-center gap-2 text-sm">
                    <MdPhone className="text-gray-400 flex-shrink-0" size={16} />
                    <span className="text-gray-700">{user.telefono}</span>
                  </div>
                )}
                
                {/* Dirección */}
                {user.direccion && (
                  <div className="flex items-center gap-2 text-sm">
                    <MdLocationOn className="text-gray-400 flex-shrink-0" size={16} />
                    <span className="text-gray-700 truncate">{user.direccion}</span>
                  </div>
                )}
                
                {/* Fecha de ingreso */}
                {user.fechaCreacion && (
                  <div className="flex items-center gap-2 text-sm">
                    <MdCalendarToday className="text-gray-400 flex-shrink-0" size={16} />
                    <span className="text-gray-700">Ingreso: {formatDate(user.fechaCreacion)}</span>
                  </div>
                )}
                
                {/* Última actividad */}
                {user.fechaActualizacion && (
                  <div className="flex items-center gap-2 text-sm">
                    <MdAccessTime className="text-gray-400 flex-shrink-0" size={16} />
                    <span className="text-gray-700">
                      Última actividad: {formatDate(user.fechaActualizacion)}
                    </span>
                  </div>
                )}
              </div>

              {/* Footer con acciones */}
              <div className="border-t border-gray-100 p-3">
                {isMobile ? (
                  /* Vista móvil - Botones con texto en columnas */
                  <div className="space-y-2">
                    <div className="grid grid-cols-3 gap-2">
                      {hasPermission('usuario:leer_especifico') && (
                        <button
                          onClick={() => onViewDetails && onViewDetails(user)}
                          className="flex items-center justify-center gap-1 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                        >
                          <MdVisibility size={16} />
                          <span>Ver</span>
                        </button>
                      )}
                      {hasPermission('usuario:actualizar_especifico') && (
                        <button
                          onClick={() => onEdit && onEdit(user)}
                          className="flex items-center justify-center gap-1 px-3 py-2 text-sm font-medium text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                        >
                          <MdEdit size={16} />
                          <span>Editar</span>
                        </button>
                      )}
                      {hasPermission('usuario:eliminar') && (
                        <button
                          onClick={() => handleDeleteConfirm(user)}
                          className="flex items-center justify-center gap-1 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                        >
                          <MdDelete size={16} />
                          <span>Eliminar</span>
                        </button>
                      )}
                    </div>
                    
                    {/* Botón de cambio de estado en móvil */}
                    {hasPermission('usuario:cambiar_estado') && (
                      <button
                        onClick={() => handleStatusChange(user)}
                        className={`w-full px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                          user.estado === 'Inactivo'
                            ? 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
                            : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                        }`}
                      >
                        {user.estado === 'Inactivo' ? 'Activar usuario' : 'Desactivar usuario'}
                      </button>
                    )}
                  </div>
                ) : (
                  /* Vista desktop - Botones con iconos */
                  <div className="flex items-center justify-between gap-2">
                    {/* Botones de acción */}
                    <div className="flex items-center gap-1">
                      {hasPermission('usuario:leer_especifico') && (
                        <Tooltip content="Ver Ficha" place="top">
                          <button
                            onClick={() => onViewDetails && onViewDetails(user)}
                            className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <MdVisibility size={16} />
                          </button>
                        </Tooltip>
                      )}
                      {hasPermission('usuario:actualizar_especifico') && (
                        <Tooltip content="Editar" place="top">
                          <button
                            onClick={() => onEdit && onEdit(user)}
                            className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors"
                          >
                            <MdEdit size={16} />
                          </button>
                        </Tooltip>
                      )}
                      {hasPermission('usuario:eliminar') && (
                        <Tooltip content="Eliminar" place="top">
                          <button
                            onClick={() => handleDeleteConfirm(user)}
                            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <MdDelete size={16} />
                          </button>
                        </Tooltip>
                      )}
                    </div>
                    
                    {/* Botón de cambio de estado */}
                    {hasPermission('usuario:cambiar_estado') && (
                      <button
                        onClick={() => handleStatusChange(user)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                          user.estado === 'Inactivo'
                            ? 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
                            : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                        }`}
                      >
                        {user.estado === 'Inactivo' ? 'Activar usuario' : 'Desactivar usuario'}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Estados de carga y error
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4EB9FA]"></div>
        <span className="ml-2 text-gray-600">Cargando usuarios...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">
          <MdClose size={48} className="mx-auto" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Error al cargar usuarios</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={onRefresh}
          className="bg-[#4EB9FA] hover:bg-[#3DA8E9] text-white px-4 py-2 rounded-lg transition-colors"
          disabled={loading}
        >
          {loading ? 'Cargando...' : 'Reintentar'}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Contenido de usuarios */}
      {filteredUsers.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <MdPerson size={64} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No hay usuarios</h3>
          <p className="text-gray-500 mb-4">
            No se encontraron usuarios en el sistema.
          </p>
        </div>
      ) : (
        viewMode === 'cards' ? renderCardsView() : (
          <Table
            data={filteredUsers}
            columns={columns}
            badgeMap={badgeMap}
            title="Lista de Usuarios"
            enableSelection={true}
            enableExport={true}
            enableRefresh={true}
            onRefresh={onRefresh}
            onBulkDelete={onDelete}
            renderActions={renderActions}
            emptyMessage="No hay usuarios registrados en el sistema"
            searchPlaceholder="Buscar por nombre, email o RUT..."
            pageSize={5}
            customActions={customActions}
          />
        )
      )}
    </div>
  );
};

export default UsersView;