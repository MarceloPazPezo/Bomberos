import React, { useState } from 'react';
import { useAuth } from '@hooks/auth/useAuth';
import { useNavigate } from 'react-router-dom';
import { 
  MdPerson, 
  MdSettings, 
  MdLogout,
  MdKeyboardArrowDown 
} from 'react-icons/md';

const UserProfile = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout: authLogout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await authLogout();
      navigate('/auth');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const handleProfileSettings = () => {
    setIsOpen(false);
    navigate('/perfil');
  };

  // Función para obtener el nombre completo del usuario
  const getFullName = () => {
    // Prioridad: nombres + apellidos > name > email > 'Usuario'
    if (user?.nombres && user?.apellidos) {
      // Manejar tanto arrays como strings
      const nombres = Array.isArray(user.nombres) ? user.nombres.join(' ') : user.nombres;
      const apellidos = Array.isArray(user.apellidos) ? user.apellidos.join(' ') : user.apellidos;
      return `${nombres} ${apellidos}`;
    }
    if (user?.name && user.name !== 'undefined undefined') {
      return user.name;
    }
    if (user?.email) {
      return user.email;
    }
    return 'Usuario';
  };

  // Función para obtener las iniciales del usuario
  const getUserInitials = () => {
    const fullName = getFullName();
    if (!fullName || fullName === 'Usuario') return 'U';
    return fullName
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Función para obtener el color del badge del rol
  const getRoleColor = (roleName) => {
    const colors = {
      'administrador': 'bg-red-100 text-red-800',
      'directiva': 'bg-purple-100 text-purple-800',
      'voluntario': 'bg-blue-100 text-blue-800',
      'usuario': 'bg-gray-100 text-gray-800'
    };
    return colors[roleName?.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  if (!user) return null;

  return (
    <div className="relative">
      {/* Botón del perfil de usuario */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
      >
        {/* Avatar */}
        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
          <span className="text-white font-semibold text-sm">
            {getUserInitials()}
          </span>
        </div>
        
        {/* Información del usuario (oculta en móvil) */}
        <div className="hidden md:block text-left">
          <p className="text-sm font-medium text-gray-900">
            {getFullName()}
          </p>
          <p className="text-xs text-gray-500">
            {user.roles?.map(role => role.nombre || role.name || role).join(', ') || 'Sin rol'}
          </p>
        </div>
        
        {/* Icono de flecha */}
        <MdKeyboardArrowDown className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${
          isOpen ? 'rotate-180' : ''
        }`} />
      </button>

      {/* Dropdown del perfil */}
      {isOpen && (
        <>
          {/* Overlay para cerrar al hacer click fuera */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Panel del perfil */}
          <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
            {/* Header con información del usuario */}
            <div className="px-4 py-3 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-lg">
                    {getUserInitials()}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">
                    {getFullName()}
                  </p>
                  <p className="text-sm text-gray-600">
                    {user.email}
                  </p>
                  {/* Roles */}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {user.roles && user.roles.length > 0 ? (
                      user.roles.map((role, index) => (
                        <span
                          key={index}
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            index === 0 ? 'bg-blue-100 text-blue-800' :
                            index === 1 ? 'bg-green-100 text-green-800' :
                            'bg-purple-100 text-purple-800'
                          }`}
                        >
                          {role.nombre || role.name || role}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-gray-400">Sin roles asignados</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Opciones del menú */}
            <div className="py-2">
              <button
                onClick={handleProfileSettings}
                className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
              >
                <MdSettings className="h-5 w-5 mr-3 text-gray-400" />
                Configurar perfil
              </button>
              
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate('/perfil');
                }}
                className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
              >
                <MdPerson className="h-5 w-5 mr-3 text-gray-400" />
                Ver perfil
              </button>
            </div>

            {/* Separador */}
            <div className="border-t border-gray-200" />

            {/* Cerrar sesión */}
            <div className="py-2">
              <button
                onClick={handleLogout}
                className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
              >
                <MdLogout className="h-5 w-5 mr-3 text-red-500" />
                Cerrar sesión
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default UserProfile;