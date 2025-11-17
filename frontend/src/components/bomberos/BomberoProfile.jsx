import React, { useState, useEffect } from 'react';
import { useAuth } from '@hooks/auth/useAuth';
import { useNavigate } from 'react-router-dom';
import { 
  MdPerson, 
  MdLogout,
  MdKeyboardArrowDown 
} from 'react-icons/md';
import BomberoAvatar from './BomberoAvatar';
import { getBomberoDetalles } from '@services/bombero.service.js';
import { useImageCache } from '@hooks/useImageCache.jsx';
import { imageUrlService } from '@services/imageUrl.service.js';

const BomberoProfile = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [bomberoDetalles, setBomberoDetalles] = useState(null);
  const [loadingDetalles, setLoadingDetalles] = useState(false);
  const [profileImageUrl, setProfileImageUrl] = useState(null);
  const { bombero, logout: authLogout, hasPermiso } = useAuth();
  const navigate = useNavigate();
  const { getCachedImageURL } = useImageCache();

  // Cargar detalles del bombero para obtener la información de la ficha
  useEffect(() => {
    const loadBomberoDetalles = async () => {
      if (!bombero?.id) return;
      
      try {
        setLoadingDetalles(true);
        const response = await getBomberoDetalles(bombero.id);
        if (response.success) {
          setBomberoDetalles(response.data);
        }
      } catch (error) {
        console.error('Error al cargar detalles del bombero:', error);
      } finally {
        setLoadingDetalles(false);
      }
    };

    loadBomberoDetalles();
  }, [bombero?.id]);

  // Cargar URL firmada de la imagen de perfil usando el mismo sistema que el perfil
  useEffect(() => {
    const loadProfileImage = async () => {
      if (!bombero?.id) return;
      
      try {
        // Obtener detalles del bombero primero para tener el fotoPerfilKEY
        const response = await getBomberoDetalles(bombero.id);
        if (response.success && response.data?.informacionPersonal?.fotoPerfilKEY) {
          const imageKey = response.data.informacionPersonal.fotoPerfilKEY;
          const existingURL = response.data.informacionPersonal.fotoPerfilURL;
          
          // Usar el mismo sistema de caché que el perfil
          const cachedURL = await getCachedImageURL(
            imageKey,
            existingURL,
            imageUrlService.getProfileImageURL
          );
          
          if (cachedURL) {
            setProfileImageUrl(cachedURL);
          }
        }
      } catch (error) {
        console.error('Error al cargar imagen de perfil:', error);
      }
    };

    loadProfileImage();
  }, [bombero?.id, getCachedImageURL]);

  const handleLogout = async () => {
    try {
      await authLogout();
      navigate('/auth');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };



  // Función para obtener el nombre completo del usuario
  const getFullName = () => {
    // Prioridad: nombres + apellidos > email > 'Usuario'
    if (bombero?.nombres && bombero?.apellidos) {
      // Manejar tanto arrays como strings
      const nombres = Array.isArray(bombero.nombres) ? bombero.nombres.join(' ') : bombero.nombres;
      const apellidos = Array.isArray(bombero.apellidos) ? bombero.apellidos.join(' ') : bombero.apellidos;
      return `${nombres} ${apellidos}`;
    }
    if (bombero?.email) {
      return bombero.email;
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
      'Administrador': 'bg-red-100 text-red-800',
      'Supervisor': 'bg-purple-100 text-purple-800', 
      'Bombero': 'bg-blue-100 text-blue-800'
    };
    return colors[roleName] || 'bg-gray-100 text-gray-800';
  };

  // Si no hay bombero, no renderizar nada (sin early return para no violar reglas de hooks)
  if (!bombero) {
    return null;
  }

  return (
    <div className="relative">
      {/* Botón del perfil de usuario */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
      >
        {/* Avatar */}
        <BomberoAvatar
          src={profileImageUrl || bomberoDetalles?.ficha?.fotoPerfilURL}
          alt={`Foto de ${getFullName()}`}
          nombre={getFullName()}
          size="sm"
          showBorder={true}
          borderColor="border-white"
          isRound={true}
          bombero={bomberoDetalles || bombero}
        />
        
        {/* Información del usuario (oculta en móvil) */}
        <div className="hidden md:block text-left">
          <p className="text-sm font-medium text-gray-900">
            {getFullName()}
          </p>
          <p className="text-xs text-gray-500">
            {bombero.roles?.map(role => role.nombre || role.name || role).join(', ') || 'Sin rol'}
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
          <div className="absolute mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
            {/* Opciones del menú */}
            <div className="py-1">
              {hasPermiso('bombero:obtener_perfil') && (
                <button
                  onClick={() => {
                    setIsOpen(false);
                    navigate('/perfil');
                  }}
                  className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                >
                  <MdPerson className="h-4 w-4 mr-3 text-gray-400" />
                  Ver perfil
                </button>
              )}
              
              <button
                onClick={handleLogout}
                className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
              >
                <MdLogout className="h-4 w-4 mr-3 text-red-500" />
                Cerrar sesión
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default BomberoProfile;