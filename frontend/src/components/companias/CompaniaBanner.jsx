import React, { useState, useEffect } from 'react';
import companiaBannerService from '@services/companiaBanner.service.js';

/**
 * Componente para mostrar el banner de una compañía
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.compania - Datos de la compañía
 * @param {string} props.nombre - Nombre de la compañía (fallback)
 * @param {string} props.src - URL directa del banner (opcional)
 * @param {string} props.size - Tamaño del banner: 'hero', 'card', 'banner'
 * @param {boolean} props.isRound - Si el banner debe ser redondo
 * @param {string} props.className - Clases CSS adicionales
 * @param {string} props.alt - Texto alternativo
 * @param {Function} props.onImageLoad - Callback cuando la imagen se carga
 * @param {Function} props.onImageError - Callback cuando hay error
 */
const CompaniaBanner = ({
  compania,
  nombre,
  src,
  size = 'hero',
  isRound = false,
  className = '',
  alt,
  onImageLoad,
  onImageError,
  onFallback
}) => {
  const [currentSrc, setCurrentSrc] = useState(null);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadImage = async () => {
      // Si hay src directo, usarlo
      if (src) {
        setCurrentSrc(src);
        setImageLoading(true);
        setImageError(false);
        setIsLoaded(false);
        return;
      }

      // Si tenemos una compañía, intentar obtener URL firmada
      if (compania && compania.id) {
        // Solo resetear el estado si es la primera carga o cambió el ID
        if (!isLoaded) {
        setImageLoading(true);
        setImageError(false);
        }
        
        try {
          // Intentar obtener URL firmada directamente usando el ID de la compañía
          const signedUrl = await companiaBannerService.getCompaniaBannerURL(compania.id);
          if (signedUrl) {
            // Solo actualizar si cambió la URL
            if (currentSrc !== signedUrl) {
            setCurrentSrc(signedUrl);
              setIsLoaded(false);
            }
          } else {
            // Si no se puede obtener URL firmada, usar la existente o por defecto
            const fallbackSrc = companiaBannerService.getDefaultBannerURL();
            if (currentSrc !== fallbackSrc) {
            setCurrentSrc(fallbackSrc);
              setIsLoaded(false);
            }
            if (!fallbackSrc) {
              setImageError(true);
              setImageLoading(false);
            }
          }
        } catch (error) {
          console.warn('Error cargando banner de la compañía:', error);
          const fallbackSrc = companiaBannerService.getDefaultBannerURL();
          if (currentSrc !== fallbackSrc) {
          setCurrentSrc(fallbackSrc);
            setIsLoaded(false);
          }
          setImageError(true);
          setImageLoading(false);
        }
      } else if (src) {
        setCurrentSrc(src);
        setImageLoading(true);
        setImageError(false);
        setIsLoaded(false);
      } else {
        const defaultUrl = companiaBannerService.getDefaultBannerURL();
        if (currentSrc !== defaultUrl) {
        setCurrentSrc(defaultUrl);
          setIsLoaded(false);
        }
        setImageLoading(false);
        if (!defaultUrl) {
          setImageError(true);
        }
      }
    };

    loadImage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src, compania?.id]); // Solo dependemos del ID de la compañía, no del objeto completo

  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
    setIsLoaded(true);
    if (onImageLoad) onImageLoad();
  };

  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
    const defaultUrl = companiaBannerService.getDefaultBannerURL();
    setCurrentSrc(defaultUrl);
    if (onImageError) onImageError();
  };

  // Notificar si se está usando fallback
  useEffect(() => {
    if (onFallback) {
      onFallback(imageError || !currentSrc);
    }
  }, [onFallback, imageError, currentSrc]);

  // Determinar las clases de forma según isRound
  const shapeClasses = isRound ? 'rounded-full' : 'rounded-lg';
  const borderClasses = '';

  // Si hay error o no hay imagen, mostrar fallback con gradiente rojo (sin letra)
  if (imageError || !currentSrc) {
    const fallbackClasses = `
      ${shapeClasses}
      ${className}
      bg-gradient-to-r from-red-600 via-orange-600 to-red-700
      ${size === 'hero' ? 'h-64' : size === 'banner' ? 'h-48' : 'h-32'}
    `;
    
    return (
      <div className={fallbackClasses}></div>
    );
  }

  // Clases base para la imagen
  const baseClasses = `
    ${shapeClasses}
    ${borderClasses}
    ${className}
    ${size === 'hero' ? 'h-64' : size === 'banner' ? 'h-48' : 'h-32'}
    object-cover
  `;

  return (
    <div className="relative">
      {imageLoading && (
        <div className={`${baseClasses} bg-gray-200 animate-pulse flex items-center justify-center`}>
          <div className="w-8 h-8 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      
      <img
        src={currentSrc}
        alt={alt || `Banner ${nombre || 'Compañía'}`}
        className={`${baseClasses} ${imageLoading ? 'opacity-0 absolute' : 'opacity-100 relative'} transition-opacity duration-300`}
        onLoad={handleImageLoad}
        onError={handleImageError}
      />
    </div>
  );
};

export default CompaniaBanner;









