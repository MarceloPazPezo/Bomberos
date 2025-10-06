import React from 'react';
import { MdPerson } from 'react-icons/md';

/**
 * Componente para mostrar un avatar por defecto cuando no hay imagen de perfil
 * @param {Object} props - Propiedades del componente
 * @param {string} props.nombre - Nombre del bombero para las iniciales
 * @param {string} props.size - Tamaño del avatar (sm, md, lg, xl)
 * @param {string} props.className - Clases CSS adicionales
 * @param {boolean} props.isRound - Si el avatar debe ser completamente redondo
 * @returns {JSX.Element} Componente de avatar por defecto
 */
const DefaultAvatar = ({ 
  nombre = '', 
  size = 'md', 
  className = '',
  isRound = false
}) => {
  // Obtener iniciales del nombre
  const getInitials = (name) => {
    if (!name) return 'B';
    
    const words = name.trim().split(' ').filter(word => word.length > 0);
    
    if (words.length === 1) {
      return words[0].charAt(0).toUpperCase();
    }
    
    if (words.length === 2) {
      // Si hay 2 palabras: Nombre Apellido
      return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
    }
    
    // Si hay 3+ palabras: Nombre SegundoNombre PrimerApellido SegundoApellido
    // Tomar primera letra del primer nombre y primera letra del primer apellido
    // Asumimos que el primer apellido está en la posición words.length - 2
    const primerNombre = words[0].charAt(0);
    const primerApellido = words[words.length - 2].charAt(0);
    
    return (primerNombre + primerApellido).toUpperCase();
  };

  // Configurar tamaños
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-base',
    xl: 'w-32 h-32 text-2xl',
    '2xl': 'w-40 h-40 text-3xl',
    '3xl': 'w-48 h-48 text-4xl',
    '4xl': 'w-64 h-64 text-5xl',
    'profile': 'w-full h-full text-6xl' // Tamaño especial para el perfil
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-16 h-16',
    '2xl': 'w-20 h-20',
    '3xl': 'w-24 h-24',
    '4xl': 'w-32 h-32',
    'profile': 'w-48 h-48' // Tamaño especial para el perfil
  };

  const initials = getInitials(nombre);
  const shapeClasses = isRound ? 'rounded-full' : 'rounded-lg';

  return (
    <div className={`
      ${sizeClasses[size]} 
      bg-gradient-to-br from-blue-500 to-blue-600 
      text-white 
      ${shapeClasses}
      flex items-center justify-center 
      font-bold 
      shadow-md 
      border-2 border-white
      ${className}
    `}>
      {initials.length <= 2 ? (
        <span className="select-none">{initials}</span>
      ) : (
        <MdPerson className={iconSizes[size]} />
      )}
    </div>
  );
};

export default DefaultAvatar;
