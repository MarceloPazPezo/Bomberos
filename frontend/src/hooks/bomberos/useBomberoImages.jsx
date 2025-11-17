import { useState, useEffect, useCallback } from 'react';
import bomberoImageService from '@services/bomberoImage.service.js';
import { useImageCache } from '@hooks/useImageCache.jsx';

/**
 * Hook para manejar imágenes de bomberos con caché y URLs firmadas
 * @param {Array} bomberos - Array de bomberos
 * @returns {Object} Objeto con funciones y estado para manejar imágenes
 */
export const useBomberoImages = (bomberos = []) => {
  const [imageUrls, setImageUrls] = useState(new Map());
  const [loadingImages, setLoadingImages] = useState(new Set());
  const { getCachedImageURL } = useImageCache();

  /**
   * Obtiene la URL de imagen para un bombero específico
   * @param {Object} bombero - Objeto bombero
   * @returns {Promise<string|null>} URL de la imagen o null
   */
  const getBomberoImageURL = useCallback(async (bombero) => {
    if (!bombero || !bombero.id) {
      return bomberoImageService.getDefaultAvatarURL();
    }

    // Si ya tenemos la URL en el estado, usarla
    if (imageUrls.has(bombero.id)) {
      return imageUrls.get(bombero.id);
    }

    // Si está cargando, esperar
    if (loadingImages.has(bombero.id)) {
      return bomberoImageService.getDefaultAvatarURL();
    }

    // Verificar si tiene fotoPerfilKEY
    const imageKey = bombero.ficha?.fotoPerfilKEY || bombero.fotoPerfilKEY;
    
    if (!imageKey) {
      // No tiene imagen, usar por defecto
      const defaultURL = bomberoImageService.getDefaultAvatarURL();
      setImageUrls(prev => new Map(prev).set(bombero.id, defaultURL));
      return defaultURL;
    }

    // Marcar como cargando
    setLoadingImages(prev => new Set(prev).add(bombero.id));

    try {
      // Intentar obtener URL desde caché o servicio
      const cachedURL = await getCachedImageURL(
        imageKey,
        bombero.ficha?.fotoPerfilURL || bombero.fotoPerfilURL,
        () => bomberoImageService.getBomberoProfileImageURL(bombero.id)
      );

      const finalURL = cachedURL || bomberoImageService.getDefaultAvatarURL();
      
      // Actualizar estado
      setImageUrls(prev => new Map(prev).set(bombero.id, finalURL));
      
      return finalURL;
    } catch (error) {
      console.warn(`Error obteniendo imagen para bombero ${bombero.id}:`, error);
      const defaultURL = bomberoImageService.getDefaultAvatarURL();
      setImageUrls(prev => new Map(prev).set(bombero.id, defaultURL));
      return defaultURL;
    } finally {
      // Quitar de cargando
      setLoadingImages(prev => {
        const newSet = new Set(prev);
        newSet.delete(bombero.id);
        return newSet;
      });
    }
  }, [imageUrls, loadingImages, getCachedImageURL]);

  /**
   * Precarga imágenes para múltiples bomberos
   * @param {Array} bomberosToLoad - Array de bomberos para precargar
   */
  const preloadBomberoImages = useCallback(async (bomberosToLoad = bomberos) => {
    if (!bomberosToLoad || bomberosToLoad.length === 0) return;

    // Filtrar bomberos que ya tienen imagen cargada o están cargando
    const bomberosToProcess = bomberosToLoad.filter(bombero => 
      bombero && 
      bombero.id && 
      !imageUrls.has(bombero.id) && 
      !loadingImages.has(bombero.id)
    );

    if (bomberosToProcess.length === 0) return;

    // Procesar en lotes para evitar sobrecargar
    const batchSize = 3;
    const batches = [];
    
    for (let i = 0; i < bomberosToProcess.length; i += batchSize) {
      batches.push(bomberosToProcess.slice(i, i + batchSize));
    }

    for (const batch of batches) {
      const promises = batch.map(bombero => getBomberoImageURL(bombero));
      await Promise.allSettled(promises);
    }
  }, [bomberos, imageUrls, loadingImages, getBomberoImageURL]);

  /**
   * Obtiene la URL de imagen para un bombero (síncrono si está disponible)
   * @param {Object} bombero - Objeto bombero
   * @returns {string} URL de la imagen
   */
  const getBomberoImageURLSync = useCallback((bombero) => {
    if (!bombero || !bombero.id) {
      return bomberoImageService.getDefaultAvatarURL();
    }

    // Si ya tenemos la URL, devolverla
    if (imageUrls.has(bombero.id)) {
      return imageUrls.get(bombero.id);
    }

    // Si no, iniciar carga asíncrona y devolver por defecto
    getBomberoImageURL(bombero);
    return bomberoImageService.getDefaultAvatarURL();
  }, [imageUrls, getBomberoImageURL]);

  /**
   * Limpia las URLs de imágenes cargadas
   */
  const clearImageUrls = useCallback(() => {
    setImageUrls(new Map());
    setLoadingImages(new Set());
  }, []);

  // Precargar imágenes cuando cambien los bomberos
  useEffect(() => {
    if (bomberos && bomberos.length > 0) {
      preloadBomberoImages();
    }
  }, [bomberos, preloadBomberoImages]);

  return {
    getBomberoImageURL,
    getBomberoImageURLSync,
    preloadBomberoImages,
    clearImageUrls,
    imageUrls,
    loadingImages: Array.from(loadingImages),
    isLoading: loadingImages.size > 0
  };
};
