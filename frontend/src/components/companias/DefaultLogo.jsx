import React from 'react';
import { MdBusiness } from 'react-icons/md';

/**
 * Componente de logo por defecto para compañías
 * @param {Object} props - Propiedades del componente
 * @param {string} props.nombre - Nombre de la compañía para generar iniciales
 * @param {string} props.size - Tamaño del logo (sm, md, lg, xl)
 * @param {string} props.className - Clases CSS adicionales
 * @param {boolean} props.isRound - Si el logo debe ser completamente redondo
 * @returns {JSX.Element} Componente de logo por defecto
 */
const DefaultLogo = ({ 
  nombre = '', 
  size = 'md', 
  className = '',
  isRound = false 
}) => {
  // Configurar tamaños
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-base',
    xl: 'w-32 h-32 text-2xl',
    '2xl': 'w-40 h-40 text-3xl',
    '3xl': 'w-48 h-48 text-4xl',
    '4xl': 'w-64 h-64 text-6xl',
    'card': 'w-full h-full text-lg',
    'banner': 'w-full h-full text-6xl'
  };

  // Determinar las clases de forma según isRound
  const shapeClasses = isRound ? 'rounded-full' : 'rounded-lg';

  // Función para obtener las iniciales del nombre
  const getInitials = (name) => {
    if (!name || typeof name !== 'string') return 'C';
    
    const words = name.trim().split(' ').filter(word => word.length > 0);
    
    if (words.length === 0) return 'C';
    
    if (words.length === 1) {
      return words[0].charAt(0).toUpperCase();
    }
    
    // Tomar las primeras letras de las primeras dos palabras
    return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
  };

  // Función para generar color basado en el nombre
  const getBackgroundColor = (name) => {
    if (!name || typeof name !== 'string') return 'bg-blue-500';
    
    const colors = [
      'bg-blue-500',
      'bg-green-500', 
      'bg-purple-500',
      'bg-red-500',
      'bg-yellow-500',
      'bg-indigo-500',
      'bg-pink-500',
      'bg-teal-500',
      'bg-orange-500',
      'bg-cyan-500'
    ];
    
    // Generar índice basado en el hash del nombre
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = ((hash << 5) - hash + name.charCodeAt(i)) & 0xffffffff;
    }
    
    return colors[Math.abs(hash) % colors.length];
  };

  const initials = getInitials(nombre);
  const backgroundColor = getBackgroundColor(nombre);

  // Para el tamaño 'banner', sin bordes redondeados ni sombras
  if (size === 'banner') {
    return (
      <div 
        className={`
          w-full h-full
          ${backgroundColor}
          flex items-center justify-center
          text-white font-bold
          ${className}
        `}
        title={nombre || 'Compañía'}
      >
        {initials}
      </div>
    );
  }

  // Para el tamaño 'card', mantener bordes redondeados y sombras
  if (size === 'card') {
    return (
      <div 
        className={`
          w-full h-full
          ${shapeClasses}
          ${backgroundColor}
          flex items-center justify-center
          text-white font-bold
          shadow-md
          ${className}
        `}
        title={nombre || 'Compañía'}
      >
        {initials}
      </div>
    );
  }

  return (
    <div 
      className={`
        ${sizeClasses[size]}
        ${shapeClasses}
        ${backgroundColor}
        flex items-center justify-center
        text-white font-bold
        shadow-md
        ${className}
      `}
      title={nombre || 'Compañía'}
    >
      {initials}
    </div>
  );
};

export default DefaultLogo;
