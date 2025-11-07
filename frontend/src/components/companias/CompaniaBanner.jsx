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
  onImageError
}) => {
  const [currentSrc, setCurrentSrc] = useState(null);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const loadImage = async () => {
      // Si hay src directo, usarlo
      if (src) {
        setCurrentSrc(src);
        setImageLoading(true);
        return;
      }

      // Si tenemos una compañía, intentar obtener URL firmada
      if (compania && compania.id) {
        setImageLoading(true);
        setImageError(false);
        
        try {
          // Intentar obtener URL firmada directamente usando el ID de la compañía
          const signedUrl = await companiaBannerService.getCompaniaBannerURL(compania.id);
          if (signedUrl) {
            setCurrentSrc(signedUrl);
          } else {
            // Si no se puede obtener URL firmada, usar la existente o por defecto
            const fallbackSrc = src || companiaBannerService.getDefaultBannerURL();
            setCurrentSrc(fallbackSrc);
            if (!fallbackSrc) {
              setImageError(true); // Activar error para mostrar fallback
            }
          }
        } catch (error) {
          console.warn('Error cargando banner de la compañía:', error);
          const fallbackSrc = src || companiaBannerService.getDefaultBannerURL();
          setCurrentSrc(fallbackSrc);
          setImageError(true);
        } finally {
          setImageLoading(false);
        }
      } else if (src) {
        setCurrentSrc(src);
        setImageLoading(true);
      } else {
        const defaultUrl = companiaBannerService.getDefaultBannerURL();
        setCurrentSrc(defaultUrl);
        setImageLoading(false);
        if (!defaultUrl) {
          setImageError(true); // Activar error para mostrar fallback
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
    const defaultUrl = companiaBannerService.getDefaultBannerURL();
    setCurrentSrc(defaultUrl);
    if (onImageError) onImageError();
  };

  // Determinar las clases de forma según isRound
  const shapeClasses = isRound ? 'rounded-full' : 'rounded-lg';
  const borderClasses = '';

  // Si hay error o no hay imagen, mostrar fallback con gradiente
  if (imageError || !currentSrc) {
    const fallbackClasses = `
      ${shapeClasses}
      ${className}
      bg-gradient-to-br from-[#4EB9FA] to-[#3A9BD9]
      flex items-center justify-center
      text-white font-bold text-lg
      ${size === 'hero' ? 'h-64' : size === 'banner' ? 'h-48' : 'h-32'}
    `;
    
    return (
      <div className={fallbackClasses}>
        {nombre ? nombre.charAt(0).toUpperCase() : 'C'}
      </div>
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
        className={`${baseClasses} ${imageLoading ? 'hidden' : 'block'}`}
        onLoad={handleImageLoad}
        onError={handleImageError}
      />
    </div>
  );
};

export default CompaniaBanner;









