import React, { useState, useEffect } from 'react';
import { MdBusiness } from 'react-icons/md';
import DefaultLogo from './DefaultLogo';
import companiaImageService from '@services/companiaImage.service.js';

/**
 * Componente de logo para compañías con fallback automático y URLs firmadas
 * @param {Object} props - Propiedades del componente
 * @param {string} props.src - URL del logo (puede ser URL firmada)
 * @param {string} props.alt - Texto alternativo para la imagen
 * @param {string} props.nombre - Nombre de la compañía para las iniciales
 * @param {string} props.size - Tamaño del logo (sm, md, lg, xl)
 * @param {string} props.className - Clases CSS adicionales
 * @param {boolean} props.showBorder - Si mostrar borde
 * @param {string} props.borderColor - Color del borde
 * @param {boolean} props.isRound - Si el logo debe ser completamente redondo
 * @param {Object} props.compania - Objeto compañía completo (opcional, para URLs firmadas)
 * @param {Function} props.onImageLoad - Callback cuando la imagen se carga
 * @param {Function} props.onImageError - Callback cuando la imagen falla
 * @returns {JSX.Element} Componente de logo de compañía
 */
const CompaniaLogo = ({ 
  src, 
  alt = '', 
  nombre = '', 
  size = 'md', 
  className = '',
  showBorder = true, 
  borderColor = 'border-white', 
  isRound = false,
  compania = null,
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
    'card': 'w-full h-full', // Tamaño especial para las tarjetas
    'banner': 'w-full h-full' // Tamaño especial para banner
  };

  // Efecto para manejar cambios en src o compania
  useEffect(() => {
    const loadImage = async () => {
      if (!compania && !src) {
        const defaultUrl = companiaImageService.getDefaultLogoURL();
        setCurrentSrc(defaultUrl);
        setImageLoading(false);
        if (!defaultUrl) {
          setImageError(true); // Activar error para mostrar DefaultLogo
        }
        return;
      }

      // Si tenemos una compañía, intentar obtener URL firmada
      if (compania && compania.id) {
        setImageLoading(true);
        setImageError(false);
        
        try {
          // Intentar obtener URL firmada directamente usando el ID de la compañía
          const signedUrl = await companiaImageService.getCompaniaLogoURL(compania.id);
          if (signedUrl) {
            setCurrentSrc(signedUrl);
          } else {
            // Si no se puede obtener URL firmada, usar la existente o por defecto
            const fallbackSrc = src || companiaImageService.getDefaultLogoURL();
            setCurrentSrc(fallbackSrc);
            if (!fallbackSrc) {
              setImageError(true); // Activar error para mostrar DefaultLogo
            }
          }
        } catch (error) {
          console.warn('Error cargando logo de la compañía:', error);
          const fallbackSrc = src || companiaImageService.getDefaultLogoURL();
          setCurrentSrc(fallbackSrc);
          setImageError(true);
        } finally {
          setImageLoading(false);
        }
      } else if (src) {
        setCurrentSrc(src);
        setImageLoading(true);
      } else {
        const defaultUrl = companiaImageService.getDefaultLogoURL();
        setCurrentSrc(defaultUrl);
        setImageLoading(false);
        if (!defaultUrl) {
          setImageError(true); // Activar error para mostrar DefaultLogo
        }
      }
    };

    loadImage();
  }, [src, compania]);

  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
    if (onImageLoad) onImageLoad();
  };

  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
    const defaultUrl = companiaImageService.getDefaultLogoURL();
    setCurrentSrc(defaultUrl);
    if (onImageError) onImageError();
  };

  // Determinar las clases de forma según isRound
  const shapeClasses = isRound ? 'rounded-full' : 'rounded-lg';
  const borderClasses = showBorder ? `border-2 ${borderColor}` : '';

  // Si hay error, mostrar logo por defecto
  if (imageError) {
    return (
      <DefaultLogo 
        nombre={nombre}
        size={size}
        className={`${borderClasses} ${shapeClasses} ${className}`}
        isRound={isRound}
      />
    );
  }

  // Para el tamaño 'banner', sin bordes ni sombras
  if (size === 'banner') {
    return (
      <div className={`relative w-full h-full ${className}`}>
        {/* Loading state */}
        {imageLoading && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
            <MdBusiness className="w-6 h-6 text-gray-400" />
          </div>
        )}
        
        {/* Imagen */}
        <img
          src={currentSrc}
          alt={alt}
          className={`
            w-full h-full
            object-cover 
            ${imageLoading ? 'opacity-0' : 'opacity-100'}
            transition-opacity duration-200
          `}
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
      </div>
    );
  }

  // Para el tamaño 'card', mantener bordes y sombras
  if (size === 'card') {
    return (
      <div className={`relative w-full h-full ${className}`}>
        {/* Loading state */}
        {imageLoading && (
          <div className={`absolute inset-0 bg-gray-200 animate-pulse ${shapeClasses} flex items-center justify-center`}>
            <MdBusiness className="w-6 h-6 text-gray-400" />
          </div>
        )}
        
        {/* Imagen */}
        <img
          src={currentSrc}
          alt={alt}
          className={`
            w-full h-full
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
  }

  return (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      {/* Loading state */}
      {imageLoading && (
        <div className={`absolute inset-0 ${sizeClasses[size]} bg-gray-200 animate-pulse ${shapeClasses} flex items-center justify-center`}>
          <MdBusiness className="w-6 h-6 text-gray-400" />
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

export default CompaniaLogo;
