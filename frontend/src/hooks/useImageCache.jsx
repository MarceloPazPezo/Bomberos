import { useState, useCallback, useEffect } from 'react';

/**
 * Hook para manejar caché de URLs de imágenes
 * Evita solicitar URLs firmadas repetidamente para la misma imagen
 * Usa sessionStorage para persistir el caché entre recargas de página
 */
export const useImageCache = () => {
  const [imageCache, setImageCache] = useState(new Map());

  // Cargar caché desde sessionStorage al inicializar y limpiar expirados
  useEffect(() => {
    try {
      const savedCache = sessionStorage.getItem('imageCache');
      if (savedCache) {
        const parsedCache = JSON.parse(savedCache);
        const now = Date.now();
        const cacheDuration = 30 * 60 * 1000; // 30 minutos
        const validCache = {};
        let expiredCount = 0;
        
        // Filtrar URLs expiradas
        Object.entries(parsedCache).forEach(([key, value]) => {
          if (now - value.timestamp < cacheDuration) {
            validCache[key] = value;
          } else {
            expiredCount++;
          }
        });
        
        // Guardar caché limpio si se eliminaron URLs expiradas
        if (expiredCount > 0) {
          sessionStorage.setItem('imageCache', JSON.stringify(validCache));
        }
        
        // Cargar caché válido
        const mapCache = new Map();
        Object.entries(validCache).forEach(([key, value]) => {
          mapCache.set(key, value);
        });
        setImageCache(mapCache);
      }
    } catch (error) {
      console.warn('Error cargando caché desde sessionStorage:', error);
    }
  }, []);

  // Guardar caché en sessionStorage cuando cambie (solo si no está vacío)
  useEffect(() => {
    if (imageCache.size > 0) {
      try {
        const cacheObject = Object.fromEntries(imageCache);
        sessionStorage.setItem('imageCache', JSON.stringify(cacheObject));
      } catch (error) {
        console.warn('Error guardando caché en sessionStorage:', error);
      }
    }
  }, [imageCache]);

  /**
   * Obtiene una URL de imagen del caché o la solicita si no existe
   * @param {string} imageKey - KEY de la imagen en MinIO
   * @param {string} existingURL - URL existente (puede ser null)
   * @param {Function} fetchFunction - Función para obtener nueva URL
   * @returns {Promise<string|null>} URL de la imagen
   */
  const getCachedImageURL = useCallback(async (imageKey, existingURL, fetchFunction) => {
    // Si no hay KEY, no hay imagen
    if (!imageKey || imageKey.trim() === '') {
      return null;
    }

    // Si ya hay una URL válida, usarla
    if (existingURL && existingURL.trim() !== '') {
      return existingURL;
    }

    // Verificar si está en caché (usar sessionStorage directamente)
    const cacheKey = `image_${imageKey}`;
    
    try {
      const savedCache = sessionStorage.getItem('imageCache');
      let cached = null;
      
      if (savedCache) {
        const parsedCache = JSON.parse(savedCache);
        cached = parsedCache[cacheKey];
      }
      
      if (cached) {
        const now = Date.now();
        const cacheTime = cached.timestamp;
        const cacheDuration = 30 * 60 * 1000; // 30 minutos
        const isValid = now - cacheTime < cacheDuration;
        
        // Si el caché es válido, usar la URL guardada
        if (isValid) {
          return cached.url;
        }
      }
    } catch (error) {
      console.warn('Error leyendo caché desde sessionStorage:', error);
    }

    // Si no está en caché o expiró, obtener nueva URL
    try {
      const newURL = await fetchFunction(imageKey);
      
      if (newURL) {
        // Guardar en sessionStorage directamente
        try {
          const savedCache = sessionStorage.getItem('imageCache');
          const cacheObject = savedCache ? JSON.parse(savedCache) : {};
          cacheObject[cacheKey] = {
            url: newURL,
            timestamp: Date.now()
          };
          sessionStorage.setItem('imageCache', JSON.stringify(cacheObject));
        } catch (error) {
          console.warn('Error guardando caché en sessionStorage:', error);
        }
        
        // También actualizar el estado de React
        setImageCache(prev => new Map(prev).set(cacheKey, {
          url: newURL,
          timestamp: Date.now()
        }));
        
        return newURL;
      }
    } catch (error) {
      console.error('Error obteniendo URL de imagen:', error);
    }

    return null;
  }, []);

  /**
   * Limpia el caché de imágenes
   */
  const clearImageCache = useCallback(() => {
    setImageCache(new Map());
    try {
      sessionStorage.removeItem('imageCache');
    } catch (error) {
      console.warn('Error limpiando caché de sessionStorage:', error);
    }
  }, []);

  /**
   * Limpia URLs expiradas del caché
   */
  const cleanExpiredCache = useCallback(() => {
    const now = Date.now();
    const cacheDuration = 30 * 60 * 1000; // 30 minutos
    
    setImageCache(prev => {
      const newCache = new Map();
      prev.forEach((value, key) => {
        if (now - value.timestamp < cacheDuration) {
          newCache.set(key, value);
        }
      });
      return newCache;
    });
  }, []);

  return {
    getCachedImageURL,
    clearImageCache,
    cleanExpiredCache,
    cacheSize: imageCache.size
  };
};
