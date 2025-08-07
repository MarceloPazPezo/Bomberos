import { useState, useMemo, useEffect } from 'react';
import { useUsers } from '@hooks/users/useUsers';
import { useAuth } from '@hooks/auth/useAuth';
import UpdateUserPopup from '../components/UpdateUserPopup';
import CreateUserPopup from '@components/CreateUserPopup.jsx';
import Table from '@components/Table.jsx';
import Tooltip from '@components/Tooltip.jsx';
import { MdEdit, MdDelete, MdPersonAddAlt1, MdAdminPanelSettings, MdPerson, MdPhone, MdSecurity, MdApi, MdLink, MdLinkOff, MdAdd, MdViewList, MdViewModule, MdRefresh } from 'react-icons/md';
import PermissionsView from '@components/PermissionsView.jsx';
import RolesView from '@components/RolesView.jsx';
import CreateRolePopup from '@components/CreateRolePopup.jsx';
import DateDisplay from '@components/DateDisplay';
import DateFilter from '../components/DateFilter';
import { useRoles } from '@hooks/roles/useRoles';
import usePermissions from '@hooks/permissions/usePermissions';

// Función para formatear teléfonos
const formatTelefono = (telefono) => {
  if (!telefono) return null;
  
  const cleanPhone = telefono.toString().replace(/\D/g, '');
  
  if (cleanPhone.length === 9) {
    if (cleanPhone.startsWith('9')) {
      return `+56 9 ${cleanPhone.slice(1, 5)} ${cleanPhone.slice(5)}`;
    }
    return `+56 ${cleanPhone.slice(0, 1)} ${cleanPhone.slice(1, 5)} ${cleanPhone.slice(5)}`;
  } else if (cleanPhone.length === 8) {
    return `${cleanPhone.slice(0, 4)} ${cleanPhone.slice(4)}`;
  } else if (cleanPhone.length === 11 && cleanPhone.startsWith('56')) {
    const localNumber = cleanPhone.slice(2);
    if (localNumber.startsWith('9')) {
      return `+56 9 ${localNumber.slice(1, 5)} ${localNumber.slice(5)}`;
    }
    return `+56 ${localNumber.slice(0, 1)} ${localNumber.slice(1, 5)} ${localNumber.slice(5)}`;
  }
  
  return telefono;
};

const Admin = () => {
  const { user: currentUser, hasPermission } = useAuth();
  const { 
    users, 
    fetchUsers, 
    setUsers, 
    loading: usersLoading,
    handleCreateUser,
    handleUpdateUser,
    handleDeleteUser,
    handleChangeUserStatus
  } = useUsers();
  const [activeTab, setActiveTab] = useState('');
  const { roles, fetchRoles, loading: rolesLoading } = useRoles();
  const { permissions, permissionsByCategory, refreshPermissions, loading: permissionsLoading } = usePermissions();
  // Evitar cargas automáticas en los hooks
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  // Determinar pestañas disponibles basadas en permisos
  const availableTabs = useMemo(() => {
    const tabs = [];
    if (hasPermission('user:read_all')) tabs.push('usuarios');
    if (hasPermission('role:read')) tabs.push('roles');
    if (hasPermission('permission:read')) tabs.push('permisos');
    return tabs;
  }, [hasPermission]);

  // Establecer la primera pestaña disponible si no hay una activa válida
  useEffect(() => {
    if (availableTabs.length > 0 && (!activeTab || !availableTabs.includes(activeTab))) {
      setActiveTab(availableTabs[0]);
    }
  }, [availableTabs, activeTab]);

  // Estados para los modales
  const [showCreate, setShowCreate] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [dataUser, setDataUser] = useState(null);
  const [showCreateRole, setShowCreateRole] = useState(false);
  
  // Estados para la vista de roles
  const [viewMode, setViewMode] = useState('cards'); // 'list' o 'cards'
  
  // Estado para el filtro de fechas
  const [dateFilter, setDateFilter] = useState(null);

  // Función para filtrar usuarios por fechas
  const filteredUsers = useMemo(() => {
    if (!users || !dateFilter) {
      return users || [];
    }

    const { type, startDate, endDate } = dateFilter;
    
    return users.filter(user => {
      const createdAt = user.createdAt ? new Date(user.createdAt) : null;
      const updatedAt = user.updatedAt ? new Date(user.updatedAt) : null;
      
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate + 'T23:59:59') : null; // Incluir todo el día final
      
      let dateToCheck = null;
      
      switch (type) {
        case 'creation':
          dateToCheck = createdAt;
          break;
        case 'update':
          dateToCheck = updatedAt;
          break;
        case 'both':
          // Para 'both', verificar si cualquiera de las fechas está en el rango
          const creationInRange = createdAt && 
            (!start || createdAt >= start) && 
            (!end || createdAt <= end);
          const updateInRange = updatedAt && 
            (!start || updatedAt >= start) && 
            (!end || updatedAt <= end);
          return creationInRange || updateInRange;
        default:
          return true;
      }
      
      if (!dateToCheck) return false;
      
      const inRange = (!start || dateToCheck >= start) && (!end || dateToCheck <= end);
      return inRange;
    });
  }, [users, dateFilter]);

  // Función para manejar cambios en el filtro de fechas
  const handleDateFilterChange = (filterData) => {
    setDateFilter(filterData);
  };

  // Función para manejar la actualización de usuarios
  const handleUpdate = (user) => {
    setDataUser(user);
    setIsPopupOpen(true);
  };

  // Función para manejar la eliminación de usuarios (individual)
  const handleDelete = async (users) => {
    // Si es un array de usuarios, procesar cada uno
    if (Array.isArray(users)) {
      for (const user of users) {
        const rut = user.rut;
        if (rut) {
          const result = await handleDeleteUser(rut);
          if (result.success) {
            setDataUser(null);
          }
        }
      }
    } else {
      // Si es un RUT directo (compatibilidad hacia atrás)
      const result = await handleDeleteUser(users);
      if (result.success) {
        setDataUser(null);
      }
    }
  };

  // Función para manejar la creación de roles
  const handleCreateRole = () => {
    setShowCreateRole(true);
  };

  // Función para manejar la actualización de roles
  const handleRefreshRoles = () => {
    if (!rolesLoading) {
      fetchRoles(true);
    }
  };
  
  // Cargar datos según la pestaña activa, solo cuando sea necesario
  useEffect(() => {
    // Función para verificar si necesitamos cargar datos
    const loadDataIfNeeded = () => {
      if (activeTab === 'usuarios' && (!users || users.length === 0) && !usersLoading) {
        fetchUsers(true); // Forzar carga solo si es necesario
      } else if (activeTab === 'roles' && (!roles || roles.length === 0) && !rolesLoading) {
        fetchRoles(true); // Forzar carga solo si no hay datos y no está ya cargando
      } else if (activeTab === 'permisos' && permissions.length === 0 && !permissionsLoading) {
        refreshPermissions(true); // Forzar carga solo si es necesario
      }
    };

    // Usar un temporizador para evitar múltiples cargas en rápida sucesión
    let timer;
    
    if (!initialLoadDone) {
      // Primera carga, solo cargar datos de la pestaña activa
      loadDataIfNeeded();
      setInitialLoadDone(true);
    } else if (activeTab) {
      // Solo cargar datos si cambia la pestaña y no tenemos datos
      clearTimeout(timer);
      timer = setTimeout(() => {
        loadDataIfNeeded();
      }, 300); // Pequeño retraso para evitar múltiples cargas
    }
    
    return () => {
      clearTimeout(timer);
    };
  }, [activeTab, initialLoadDone]);
  
  // Evitar incluir las funciones fetch en las dependencias del useEffect
  // para prevenir ciclos de renderizado

  // Función para extraer roles únicos de los usuarios usando useMemo para estabilidad
  const uniqueRoles = useMemo(() => {
    if (!users || users.length === 0) {
      return [];
    }
    
    const allRoles = users.flatMap(user => 
      user.roles?.map(role => 
        typeof role === 'object' ? role.nombre || role.name : role
      ) || []
    );
    
    const uniqueRoleNames = [...new Set(allRoles)].filter(Boolean);
    return uniqueRoleNames.map(role => ({ value: role, label: role }));
  }, [users]);

  // Configuración de badges para el componente Table
  const badgeMap = {
    activo: {
      true: {
        bg: 'bg-green-100',
        text: 'text-green-800',
        border: 'border-green-200',
        label: 'Activo',
        dot: 'bg-green-500'
      },
      false: {
        bg: 'bg-red-100',
        text: 'text-red-800',
        border: 'border-red-200',
        label: 'Inactivo',
        dot: 'bg-red-500'
      },
      default: {
        bg: 'bg-gray-100',
        text: 'text-gray-800',
        border: 'border-gray-200',
        label: 'Desconocido',
        dot: 'bg-gray-500'
      }
    }
  };

  // Definición de columnas para el componente Table
  const columns = useMemo(() => {
    
    return [
    {
      accessorKey: 'rut',
      header: 'RUT',
      size: 130,
      cell: info => {
        const value = info.getValue();
        return (
          <div className="font-mono text-sm font-medium text-gray-900">
            {value || '-'}
          </div>
        );
      }
    },
    {
      id: 'informacion_personal',
      header: 'Información Personal',
      size: 300,
      cell: ({ row }) => {
        const user = row.original;
        const nombres = Array.isArray(user.nombres) ? user.nombres.join(' ') : user.nombres || '';
        const apellidos = Array.isArray(user.apellidos) ? user.apellidos.join(' ') : user.apellidos || '';
        const nombreCompleto = `${nombres} ${apellidos}`.trim();
        const telefono = user.telefono ? formatTelefono(user.telefono) : null;
        
        return (
          <div className="space-y-1">
            <div className="font-semibold text-gray-900 text-sm">
              {nombreCompleto || 'Sin nombre'}
            </div>
            <div className="text-sm text-blue-600 hover:text-blue-800">
              {user.email || 'Sin email'}
            </div>
            {telefono && (
              <div className="text-xs text-gray-600 font-mono flex items-center gap-1">
                <MdPhone className="w-3 h-3" />
                {telefono}
              </div>
            )}
          </div>
        );
      },
      // Para filtros, usaremos el nombre completo y email
      accessorFn: (row) => {
        const nombres = Array.isArray(row.nombres) ? row.nombres.join(' ') : row.nombres || '';
        const apellidos = Array.isArray(row.apellidos) ? row.apellidos.join(' ') : row.apellidos || '';
        const nombreCompleto = `${nombres} ${apellidos}`.trim();
        return `${nombreCompleto} ${row.email || ''}`.toLowerCase();
      }
    },
    {
      accessorKey: 'roles',
      header: 'Roles',
      size: 180,
      filterType: 'text',
      filterFn: (row, columnId, filterValue) => {
        if (!filterValue) return true;
        const roles = row.getValue(columnId);
        if (!roles || !Array.isArray(roles)) return false;
        
        // Convertir el valor de búsqueda a minúsculas para búsqueda insensible a mayúsculas
        const searchValue = filterValue.toLowerCase();
        
        return roles.some(role => {
          // Los roles pueden ser strings directamente o objetos con propiedades nombre/name
          const roleName = typeof role === 'object' ? (role.nombre || role.name) : role;
          return roleName && roleName.toLowerCase().includes(searchValue);
        });
      },
      cell: info => {
        const roles = info.getValue();
        if (!roles || !Array.isArray(roles) || roles.length === 0) {
          return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
              Sin roles
            </span>
          );
        }
        
        return (
          <div className="flex flex-wrap gap-1">
            {roles.slice(0, 2).map((role, index) => {
              const getRoleStyle = (roleName) => {
                const roleKey = typeof roleName === 'string' ? roleName.toLowerCase() : '';
                if (roleKey.includes('administrador') || roleKey.includes('admin')) {
                  return 'bg-purple-100 text-purple-800 border-purple-200';
                } else if (roleKey.includes('usuario') || roleKey.includes('user')) {
                  return 'bg-blue-100 text-blue-800 border-blue-200';
                } else if (roleKey.includes('directiva') || roleKey.includes('directivo')) {
                  return 'bg-green-100 text-green-800 border-green-200';
                } else if (roleKey.includes('voluntario')) {
                  return 'bg-yellow-100 text-yellow-800 border-yellow-200';
                } else {
                  return 'bg-gray-100 text-gray-800 border-gray-200';
                }
              };

              const roleDisplay = typeof role === 'object' ? role.nombre || role.name || 'Rol' : role;
              
              return (
                <span 
                  key={index} 
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleStyle(roleDisplay)}`}
                >
                  {roleDisplay}
                </span>
              );
            })}
            {roles.length > 2 && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                +{roles.length - 2}
              </span>
            )}
          </div>
        );
      }
    },
    {
      id: 'dates',
      header: 'Fechas',
      size: 140,
      enableColumnFilter: false,
      enableSorting: false,
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="w-full h-full">
            <DateDisplay 
              createdAt={user.createdAt} 
              updatedAt={user.updatedAt}
              compact={true}
            />
          </div>
        );
      }
    },
    {
      accessorKey: 'activo',
      header: 'Estado',
      size: 100,
      filterType: 'select',
      filterOptions: [
        { value: true, label: 'Activo' },
        { value: false, label: 'Inactivo' }
      ],
      cell: info => {
        const isActive = info.getValue();
        return (
          <div className="flex items-center">
            <div className={`w-2 h-2 rounded-full mr-2 ${isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className={`text-sm font-medium ${isActive ? 'text-green-700' : 'text-red-700'}`}>
              {isActive ? 'Activo' : 'Inactivo'}
            </span>
          </div>
        );
      }
    }
    ];
  }, [uniqueRoles]);

  // Funciones para el componente Table
  const handleEdit = (user) => {
    setDataUser(user);
    setIsPopupOpen(true);
  };

  const handleDeleteSingle = (user) => {
    handleDelete([user]);
  };

  const handleBulkDelete = (selectedUsers) => {
    handleDelete(selectedUsers);
  };

  const handleRefresh = () => {
    fetchUsers();
  };

  const renderActions = ({ row }) => {
    const isCurrentUser = currentUser && (currentUser.rut === row.rut || currentUser.id === row.id);
    const canEdit = hasPermission('user:update_specific');
    const canDelete = hasPermission('user:delete');
    const canChangeStatus = hasPermission('user:change_status');
    
    // Si no tiene permisos para ninguna acción, no mostrar nada
    if (!canEdit && !canDelete && !canChangeStatus) {
      return null;
    }

    const handleStatusChange = async (userId, newStatus) => {
      await handleChangeUserStatus(userId, newStatus);
    };
    
    return (
      <div className="flex gap-2">
        {canEdit && (
          <Tooltip
            id={`edit-${row.id}`}
            content={
              isCurrentUser 
                ? "No puedes editarte a ti mismo" 
                : "Editar información del usuario"
            }
            place="top"
            variant={isCurrentUser ? "light" : "dark"}
          >
            <button 
              className={`transition-all duration-200 p-2 rounded-lg hover:scale-105 ${
                isCurrentUser 
                  ? "text-gray-400 cursor-not-allowed bg-gray-50" 
                  : "text-blue-600 hover:text-blue-900 hover:bg-blue-50"
              }`}
              onClick={() => !isCurrentUser && handleEdit(row)}
              disabled={isCurrentUser}
            >
              <MdEdit size={18} />
            </button>
          </Tooltip>
        )}
        {canChangeStatus && (
          <Tooltip
            id={`status-${row.id}`}
            content={
              isCurrentUser 
                ? "No puedes cambiar tu propio estado" 
                : row.activo 
                  ? "Desactivar usuario - El usuario no podrá acceder al sistema" 
                  : "Activar usuario - El usuario podrá acceder al sistema"
            }
            place="top"
            variant={isCurrentUser ? "light" : "dark"}
          >
            <button 
              className={`transition-all duration-200 p-2 rounded-lg hover:scale-105 ${
                isCurrentUser 
                  ? "text-gray-400 cursor-not-allowed bg-gray-50" 
                  : row.activo 
                    ? "text-orange-600 hover:text-orange-900 hover:bg-orange-50" 
                    : "text-green-600 hover:text-green-900 hover:bg-green-50"
              }`}
              onClick={() => !isCurrentUser && handleStatusChange(row.id, !row.activo)}
              disabled={isCurrentUser}
            >
              {row.activo ? <MdLinkOff size={18} /> : <MdLink size={18} />}
            </button>
          </Tooltip>
        )}
        {canDelete && (
          <Tooltip
            id={`delete-${row.id}`}
            content={
              isCurrentUser 
                ? "No puedes eliminarte a ti mismo" 
                : "Eliminar usuario permanentemente - Esta acción no se puede deshacer"
            }
            place="top"
            variant={isCurrentUser ? "light" : "dark"}
          >
            <button 
              className={`transition-all duration-200 p-2 rounded-lg hover:scale-105 ${
                isCurrentUser 
                  ? "text-gray-400 cursor-not-allowed bg-gray-50" 
                  : "text-red-600 hover:text-red-900 hover:bg-red-50"
              }`}
              onClick={() => !isCurrentUser && handleDeleteSingle(row)}
              disabled={isCurrentUser}
            >
              <MdDelete size={18} />
            </button>
          </Tooltip>
        )}
      </div>
    );
  };

  return (
    <div className="p-3 sm:p-4 lg:p-6">
      {/* Header con título y estadísticas */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-6 gap-6">
        <div className="flex-shrink-0">
          <h1 className="text-3xl font-bold text-[#2C3E50] mb-2">Administración</h1>
          <p className="text-gray-600 text-sm">
            Administra usuarios, roles y permisos del sistema
          </p>
        </div>
        
        {/* Panel de estadísticas */}
        <div className={`flex-1 grid grid-cols-1 gap-4 ${activeTab === 'usuarios' ? 'sm:grid-cols-2' : 'sm:grid-cols-3'} lg:max-w-2xl`}>
        {activeTab === 'usuarios' && (
          <>
            <div className="bg-white/80 backdrop-blur-lg border border-[#4EB9FA]/20 shadow-lg p-4 rounded-xl flex items-center">
              <div className="p-3 rounded-full bg-blue-100 mr-4">
                <MdPerson size={24} className="text-blue-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Usuarios Activos</h3>
                <p className="text-2xl font-bold text-[#2C3E50]">
                  {users?.filter(user => user.activo).length || 0}
                </p>
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-lg border border-[#4EB9FA]/20 shadow-lg p-4 rounded-xl flex items-center">
              <div className="p-3 rounded-full bg-purple-100 mr-4">
                <MdPhone size={24} className="text-purple-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Total Usuarios</h3>
                <p className="text-2xl font-bold text-[#2C3E50]">
                  {users?.length || 0}
                </p>
              </div>
            </div>
          </>
        )}

        {activeTab === 'roles' && (
          <>
            <div className="bg-white/80 backdrop-blur-lg border border-[#4EB9FA]/20 shadow-lg p-4 rounded-xl flex items-center">
              <div className="p-3 rounded-full bg-blue-100 mr-4">
                <MdSecurity size={24} className="text-blue-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Total Roles</h3>
                <p className="text-2xl font-bold text-[#2C3E50]">
                  {roles?.length || 0}
                </p>
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-lg border border-[#4EB9FA]/20 shadow-lg p-4 rounded-xl flex items-center">
              <div className="p-3 rounded-full bg-green-100 mr-4">
                <MdPerson size={24} className="text-green-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Usuarios con Roles</h3>
                <p className="text-2xl font-bold text-[#2C3E50]">
                  {users?.filter(user => user.roles && user.roles.length > 0).length || 0}
                </p>
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-lg border border-[#4EB9FA]/20 shadow-lg p-4 rounded-xl flex items-center">
              <div className="p-3 rounded-full bg-purple-100 mr-4">
                <MdAdminPanelSettings size={24} className="text-purple-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Permisos Asignados</h3>
                <p className="text-2xl font-bold text-[#2C3E50]">
                  {permissions?.length || 0}
                </p>
              </div>
            </div>
          </>
        )}

        {activeTab === 'permisos' && (
          <>
            <div className="bg-white/80 backdrop-blur-lg border border-[#4EB9FA]/20 shadow-lg p-4 rounded-xl flex items-center">
              <div className="p-3 rounded-full bg-blue-100 mr-4">
                <MdAdminPanelSettings size={24} className="text-blue-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Total Permisos</h3>
                <p className="text-2xl font-bold text-[#2C3E50]">
                  {permissions?.length || 0}
                </p>
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-lg border border-[#4EB9FA]/20 shadow-lg p-4 rounded-xl flex items-center">
              <div className="p-3 rounded-full bg-green-100 mr-4">
                <MdSecurity size={24} className="text-green-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Categorías</h3>
                <p className="text-2xl font-bold text-[#2C3E50]">
                  {Object.keys(permissionsByCategory || {}).length || 0}
                </p>
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-lg border border-[#4EB9FA]/20 shadow-lg p-4 rounded-xl flex items-center">
              <div className="p-3 rounded-full bg-purple-100 mr-4">
                <MdApi size={24} className="text-purple-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Rutas Protegidas</h3>
                <p className="text-2xl font-bold text-[#2C3E50]">
                  {permissions?.filter(p => p?.ruta).length || 0}
                </p>
              </div>
            </div>
          </>
        )}
        </div>
      </div>



      {/* Pestañas para alternar entre Usuarios y Roles */}
      {availableTabs.length > 0 && (
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {hasPermission('user:read_all') && (
                <button
                  onClick={() => setActiveTab('usuarios')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                    activeTab === 'usuarios'
                      ? 'border-[#4EB9FA] text-[#2C3E50]'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <MdPerson size={18} />
                    Usuarios
                  </span>
                </button>
              )}
              {hasPermission('role:read') && (
                <button
                  onClick={() => setActiveTab('roles')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                    activeTab === 'roles'
                      ? 'border-[#4EB9FA] text-[#2C3E50]'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <MdSecurity size={18} />
                    Roles
                  </span>
                </button>
              )}
              {hasPermission('permission:read') && (
                <button
                  onClick={() => setActiveTab('permisos')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                    activeTab === 'permisos'
                      ? 'border-[#4EB9FA] text-[#2C3E50]'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <MdAdminPanelSettings size={18} />
                    Permisos
                  </span>
                </button>
              )}
            </nav>
          </div>
        </div>
      )}

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
          {activeTab === 'usuarios' && (
            <div className="bg-white/80 backdrop-blur-lg border border-[#4EB9FA]/20 shadow-xl p-3 sm:p-4 lg:p-6 rounded-2xl mb-4">
              <Table
                data={filteredUsers || []}
                columns={columns}
                badgeMap={badgeMap}
                title="Lista de Usuarios"
                enableSelection={true}
                enableExport={true}
                enableRefresh={true}
                onRefresh={handleRefresh}
                onBulkDelete={handleBulkDelete}
                renderActions={renderActions}
                emptyMessage="No hay usuarios registrados en el sistema"
                searchPlaceholder="Buscar por nombre, email o RUT..."
                pageSize={5}
                customActions={
                  <div className="flex gap-2">
                    <DateFilter onFilterChange={handleDateFilterChange} />
                    {hasPermission('user:create') && (
                      <Tooltip
                        id="create-user-btn"
                        content="Crear un nuevo usuario en el sistema"
                        place="top"
                        variant="dark"
                      >
                        <button
                          className="bg-[#2C3E50] hover:bg-[#34495E] text-white font-semibold px-4 py-2 rounded-lg shadow transition-all duration-200 border border-[#2C3E50] hover:-translate-y-0.5 hover:scale-105"
                          onClick={() => setShowCreate(true)}
                        >
                          <span className="flex items-center gap-2">
                            <MdPersonAddAlt1 size={18} />
                            <span className="hidden sm:inline">Crear usuario</span>
                          </span>
                        </button>
                      </Tooltip>
                    )}
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
                  <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setViewMode('list')}
                      className={`px-3 py-2 transition-colors ${
                        viewMode === 'list' 
                          ? 'bg-[#4EB9FA] text-white' 
                          : 'text-gray-600 hover:text-[#4EB9FA] hover:bg-gray-50'
                      }`}
                      title="Vista de lista"
                    >
                      <MdViewList size={20} />
                    </button>
                    <button
                      onClick={() => setViewMode('cards')}
                      className={`px-3 py-2 transition-colors ${
                        viewMode === 'cards' 
                          ? 'bg-[#4EB9FA] text-white' 
                          : 'text-gray-600 hover:text-[#4EB9FA] hover:bg-gray-50'
                      }`}
                      title="Vista de cards"
                    >
                      <MdViewModule size={20} />
                    </button>
                  </div>
                  
                  <button
                    onClick={handleRefreshRoles}
                    className={`px-3 py-2 border rounded-lg transition-colors ${rolesLoading ? 'text-gray-400 border-gray-300 cursor-not-allowed' : 'text-[#4EB9FA] hover:text-[#3DA8E9] border-[#4EB9FA] hover:bg-[#4EB9FA]/10'}`}
                    title="Actualizar"
                    disabled={rolesLoading}
                  >
                    <MdRefresh size={20} className={rolesLoading ? 'animate-spin' : ''} />
                  </button>
                  
                  {hasPermission('role:create') && (
                    <Tooltip
                      id="create-role-btn"
                      content="Crear un nuevo rol en el sistema"
                      place="top"
                      variant="dark"
                    >
                      <button
                        className="bg-[#2C3E50] hover:bg-[#34495E] text-white font-semibold px-4 py-2 rounded-lg shadow transition-all duration-200 border border-[#2C3E50] hover:-translate-y-0.5 hover:scale-105"
                        onClick={handleCreateRole}
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
              <RolesView viewMode={viewMode} />
            </div>
          )}

          {activeTab === 'permisos' && (
            <PermissionsView />
          )}
        </>
      )}

      <UpdateUserPopup show={isPopupOpen} setShow={setIsPopupOpen} data={dataUser} onUserUpdated={handleUpdateUser} />
      {showCreate && (
        <CreateUserPopup show={showCreate} setShow={setShowCreate} onUserCreated={handleCreateUser} />
      )}
      {showCreateRole && (
        <CreateRolePopup show={showCreateRole} setShow={setShowCreateRole} onRoleCreated={() => fetchRoles(true)} />
      )}
    </div>
  );
};

export default Admin;