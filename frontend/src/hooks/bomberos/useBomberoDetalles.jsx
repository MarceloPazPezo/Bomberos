import { useState, useEffect } from 'react';
import { getBomberoDetalles } from '@services/bombero.service.js';
import { useImageCache } from '../useImageCache.jsx';
import { imageUrlService } from '@services/imageUrl.service.js';

/**
 * Hook personalizado para manejar los detalles de un bombero
 * Simplificado: una sola consulta que devuelve toda la información
 * @param {number|null} idBombero - ID del bombero (null si no hay selección)
 * @returns {Object} Estado y funciones para manejar los detalles
 */
export const useBomberoDetalles = (idBombero = null) => {
  // Estado principal con todos los datos
  const [bomberoData, setBomberoData] = useState(null);
  
  // Estados de carga y error
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Hook para caché de imágenes
  const { getCachedImageURL } = useImageCache();

  /**
   * Limpia todos los estados
   */
  const clearData = () => {
    setBomberoData(null);
    setError(null);
  };

  /**
   * Carga todos los datos del bombero en una sola consulta
   */
  const loadBomberoData = async () => {
    if (!idBombero) return;

    setLoading(true);
    setError(null);

    try {
      const response = await getBomberoDetalles(idBombero);
      
      if (response.status === 'Success') {
        const data = response.data;
        
        // Optimizar URL de imagen de perfil con caché
        if (data?.informacionPersonal?.fotoPerfilKEY) {
          try {
            const cachedURL = await getCachedImageURL(
              data.informacionPersonal.fotoPerfilKEY,
              data.informacionPersonal.fotoPerfilURL,
              imageUrlService.getProfileImageURL
            );
            
            if (cachedURL) {
              data.informacionPersonal.fotoPerfilURL = cachedURL;
            }
          } catch (imageError) {
            console.warn('Error obteniendo URL de imagen desde caché:', imageError);
          }
        }
        
        setBomberoData(data);
      } else {
        setError(response.message || 'Error al cargar datos del bombero');
      }
    } catch (error) {
      console.error('Error al cargar datos del bombero:', error);
      setError(error.response?.data?.message || 'Error al cargar datos del bombero');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Recarga los datos del bombero
   */
  const reloadData = async () => {
    await loadBomberoData();
  };

  // Efecto para cargar datos cuando cambia el ID del bombero
  useEffect(() => {
    if (idBombero) {
      loadBomberoData();
    } else {
      clearData();
    }
  }, [idBombero]);

  return {
    // Datos principales
    bomberoData,
    
    // Datos específicos extraídos del objeto principal
    informacionPersonal: bomberoData?.informacionPersonal || null,
    contactosEmergencia: bomberoData?.contactosEmergencia || [],
    capacitaciones: bomberoData?.capacitaciones || [],
    historialActividades: bomberoData?.historialActividades || [],
    eppAcargo: bomberoData?.eppAcargo || [],
    estadisticas: bomberoData?.estadisticas || null,

    // Estados de carga y error
    loading,
    error,
    hasError: !!error,

    // Funciones
    loadBomberoData,
    reloadData,
    clearData
  };
};

export default useBomberoDetalles;
