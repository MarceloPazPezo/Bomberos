import React, { useState, useEffect } from 'react';
import { MdPerson } from 'react-icons/md';
import DefaultAvatar from './DefaultAvatar';
import bomberoImageService from '@services/bomberoImage.service.js';

/**
 * Componente de avatar para bomberos con fallback automático y URLs firmadas
 * @param {Object} props - Propiedades del componente
 * @param {string} props.src - URL de la imagen de perfil (puede ser URL firmada)
 * @param {string} props.alt - Texto alternativo para la imagen
 * @param {string} props.nombre - Nombre del bombero para las iniciales
 * @param {string} props.size - Tamaño del avatar (sm, md, lg, xl)
 * @param {string} props.className - Clases CSS adicionales
 * @param {boolean} props.showBorder - Si mostrar borde
 * @param {string} props.borderColor - Color del borde
 * @param {boolean} props.isRound - Si el avatar debe ser completamente redondo
 * @param {Object} props.bombero - Objeto bombero completo (opcional, para URLs firmadas)
 * @param {Function} props.onImageLoad - Callback cuando la imagen se carga
 * @param {Function} props.onImageError - Callback cuando la imagen falla
 * @returns {JSX.Element} Componente de avatar de bombero
 */
const BomberoAvatar = ({ 
  src, 
  alt = '', 
  nombre = '', 
  size = 'md', 
  className = '',
  showBorder = true, 
  borderColor = 'border-white', 
  isRound = false,
  bombero = null,
  onImageLoad = null,
  onImageError = null
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);

  // Configurar tamaños
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-32 h-32',
    '2xl': 'w-40 h-40',
    '3xl': 'w-48 h-48',
    '4xl': 'w-64 h-64',
    'profile': 'w-full h-full' // Tamaño especial para el perfil
  };

  // Efecto para manejar cambios en src o bombero
  useEffect(() => {
    const loadImage = async () => {
      if (!bombero && !src) {
        const defaultUrl = bomberoImageService.getDefaultAvatarURL();
        setCurrentSrc(defaultUrl);
        setImageLoading(false);
        if (!defaultUrl) {
          setImageError(true); // Activar error para mostrar DefaultAvatar
        }
        return;
      }

      // Si tenemos un bombero, intentar obtener URL firmada
      if (bombero && bombero.id) {
        setImageLoading(true);
        setImageError(false);
        
        try {
          // Intentar obtener URL firmada directamente usando el ID del bombero
          const signedUrl = await bomberoImageService.getBomberoProfileImageURL(bombero.id);
          if (signedUrl) {
            setCurrentSrc(signedUrl);
          } else {
            // Si no se puede obtener URL firmada, usar la existente o por defecto
            const fallbackSrc = src || bomberoImageService.getDefaultAvatarURL();
            setCurrentSrc(fallbackSrc);
            if (!fallbackSrc) {
              setImageError(true); // Activar error para mostrar DefaultAvatar
            }
          }
        } catch (error) {
          console.warn('Error cargando imagen del bombero:', error);
          const fallbackSrc = src || bomberoImageService.getDefaultAvatarURL();
          setCurrentSrc(fallbackSrc);
          setImageError(true);
        } finally {
          setImageLoading(false);
        }
      } else if (src) {
        setCurrentSrc(src);
        setImageLoading(true);
      } else {
        const defaultUrl = bomberoImageService.getDefaultAvatarURL();
        setCurrentSrc(defaultUrl);
        setImageLoading(false);
        if (!defaultUrl) {
          setImageError(true); // Activar error para mostrar DefaultAvatar
        }
      }
    };

    loadImage();
  }, [src, bombero]);

  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
    if (onImageLoad) onImageLoad();
  };

  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
    const defaultUrl = bomberoImageService.getDefaultAvatarURL();
    setCurrentSrc(defaultUrl);
    if (onImageError) onImageError();
  };

  // Determinar las clases de forma según isRound
  const shapeClasses = isRound ? 'rounded-full' : 'rounded-lg';
  const borderClasses = showBorder ? `border-2 ${borderColor}` : '';

  // Si hay error, mostrar avatar por defecto
  if (imageError) {
    return (
      <DefaultAvatar 
        nombre={nombre}
        size={size}
        className={`${borderClasses} ${shapeClasses} ${className}`}
        isRound={isRound}
      />
    );
  }

  return (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      {/* Loading state */}
      {imageLoading && (
        <div className={`absolute inset-0 ${sizeClasses[size]} bg-gray-200 animate-pulse ${shapeClasses} flex items-center justify-center`}>
          <MdPerson className="w-6 h-6 text-gray-400" />
        </div>
      )}
      
      {/* Imagen */}
      <img
        src={currentSrc}
        alt={alt}
        className={`
          ${sizeClasses[size]} 
          object-cover 
          ${shapeClasses}
          ${borderClasses}
          shadow-md
          ${imageLoading ? 'opacity-0' : 'opacity-100'}
          transition-opacity duration-200
        `}
        onLoad={handleImageLoad}
        onError={handleImageError}
      />
    </div>
  );
};

export default BomberoAvatar;
