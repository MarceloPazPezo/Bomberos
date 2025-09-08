import { useState, useEffect } from 'react';
import { useAuth } from '@hooks/auth/useAuth';
import * as companiaService from '@services/compania.service.js';

/**
 * Hook específico para obtener la compañía del bombero autenticado
 * Este hook se usa en el Home para mostrar la información de la compañía
 */
export const useCompaniaBombero = () => {
  const { bombero } = useAuth();
  const [companiaInfo, setCompaniaInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadCompaniaInfo = async () => {
      // Si no hay bombero autenticado, usar la primera compañía disponible
      if (!bombero?.id) {
        try {
          setLoading(true);
          setError(null);

          const response = await companiaService.getPrimeraCompania();
          
          if (response.status === 'Client error') {
            throw new Error(response.message);
          }

          setCompaniaInfo(response.data);
        } catch (err) {
          console.error('Error al cargar compañía por defecto:', err);
          setError(err.response?.data?.message || err.message || 'Error al cargar la información de la compañía');
          setCompaniaInfo(null);
        } finally {
          setLoading(false);
        }
        return;
      }

      // Si hay bombero autenticado, obtener su compañía
      try {
        setLoading(true);
        setError(null);

        const response = await companiaService.getCompaniaBombero(bombero.id);
        
        if (response.status === 'Client error') {
          throw new Error(response.message);
        }

        setCompaniaInfo(response.data);
      } catch (err) {
        console.error('Error al cargar compañía del bombero:', err);
        
        // Si falla obtener la compañía del bombero, intentar con la primera disponible como fallback
        try {
          const fallbackResponse = await companiaService.getPrimeraCompania();
          setCompaniaInfo(fallbackResponse.data);
          setError(null); // No mostrar error si el fallback funciona
        } catch (fallbackErr) {
          setError(err.response?.data?.message || err.message || 'Error al cargar la información de la compañía');
          setCompaniaInfo(null);
        }
      } finally {
        setLoading(false);
      }
    };

    loadCompaniaInfo();
  }, [bombero?.id]);

  return { 
    companiaInfo, 
    loading, 
    error,
    // Método para recargar la información si es necesario
    reload: () => {
      setLoading(true);
      setError(null);
      // El useEffect se volverá a ejecutar automáticamente
    }
  };
};
