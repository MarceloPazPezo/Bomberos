import React from 'react';
import { MdPerson } from 'react-icons/md';

/**
 * Componente Avatar reutilizable
 * Maneja automáticamente la imagen de perfil o muestra un avatar por defecto
 */
const Avatar = ({ 
  src, 
  alt = "Avatar", 
  size = "md", 
  className = "", 
  fallbackIcon = true,
  ...props 
}) => {
  // Tamaños predefinidos
  const sizeClasses = {
    xs: "w-6 h-6",
    sm: "w-8 h-8", 
    md: "w-12 h-12",
    lg: "w-16 h-16",
    xl: "w-20 h-20",
    "2xl": "w-24 h-24",
    "3xl": "w-32 h-32"
  };

  // Avatar por defecto desde la carpeta public
  const defaultAvatar = "/images/default-avatar.png";

  // Función para manejar errores de carga de imagen
  const handleImageError = (e) => {
    if (e.target.src !== defaultAvatar) {
      e.target.src = defaultAvatar;
    } else {
      // Si incluso el avatar por defecto falla, ocultar la imagen
      e.target.style.display = 'none';
    }
  };

  // Si no hay src o es null/undefined, usar avatar por defecto
  const imageSrc = src && src.trim() !== '' ? src : defaultAvatar;

  return (
    <div className={`relative ${sizeClasses[size]} ${className}`} {...props}>
      {imageSrc ? (
        <img
          src={imageSrc}
          alt={alt}
          className="w-full h-full object-cover aspect-square border border-gray-200"
          onError={handleImageError}
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full bg-gray-200 aspect-square border border-gray-300 flex items-center justify-center">
          {fallbackIcon && (
            <MdPerson className="w-1/2 h-1/2 text-gray-500" />
          )}
        </div>
      )}
    </div>
  );
};

export default Avatar;
