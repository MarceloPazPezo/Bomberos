import { useState, useEffect } from 'react';
import * as companiaService from '@services/compania.service.js';

/**
 * Hook específico para obtener la configuración de la compañía en el Home
 * Este hook reemplaza el anterior useCompaniaConfig basado en SystemConfig
 */
export const useCompaniaConfig = () => {
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadCompaniaConfig = async () => {
      try {
        setLoading(true);
        setError(null);

        // Obtener la primera compañía disponible
        const response = await companiaService.getPrimeraCompania();
        
        if (response.status === 'Client error') {
          throw new Error(response.message);
        }

        const compania = response.data;
        
        // Convertir los datos de la compañía al formato de configs esperado por el Home
        const companiaConfigs = [];

        // ID de compañía para usos operativos en otras pantallas
        if (compania.id) {
          companiaConfigs.push({ key: 'company_id', value: compania.id });
        }

        if (compania.nombre) {
          companiaConfigs.push({ key: 'company_name', value: compania.nombre });
        }

        // Extraer información de la dirección si está disponible
        if (compania.direccion) {
          // Como direccion se relaciona con Comuna, por ahora construimos la dirección básica
          const addressParts = [];
          if (compania.direccion.calle) addressParts.push(compania.direccion.calle);
          if (compania.direccion.numero) addressParts.push(compania.direccion.numero);
          if (compania.direccion.depto) addressParts.push(`Depto ${compania.direccion.depto}`);
          if (addressParts.length > 0) {
            companiaConfigs.push({ key: 'company_address', value: addressParts.join(', ') });
          }
          
          // Si tienes la relación con Comuna configurada y cargada, podrías obtener ciudad/región
          // Por ahora, agregamos valores genéricos o vacíos
          companiaConfigs.push({ key: 'company_city', value: 'Ciudad' });
          companiaConfigs.push({ key: 'company_region', value: 'Región' });
        } else {
          // Si no hay dirección, usar valores por defecto
          companiaConfigs.push({ key: 'company_city', value: 'Chile' });
          companiaConfigs.push({ key: 'company_region', value: '' });
        }

        if (compania.email) {
          companiaConfigs.push({ key: 'company_email', value: compania.email });
        }

        if (compania.telefono) {
          companiaConfigs.push({ key: 'company_phone', value: compania.telefono });
        }

        // Extraer año de fundación si está disponible
        if (compania.fechaFundacion) {
          const year = new Date(compania.fechaFundacion).getFullYear();
          companiaConfigs.push({ key: 'company_founded_year', value: year.toString() });
        }

        setConfigs(companiaConfigs);
      } catch (err) {
        console.error('Error al cargar configuración de la compañía:', err);
        setError(err.response?.data?.message || err.message || 'Error al cargar la información de la compañía');
        
        // Configuración por defecto en caso de error
        setConfigs([
          { key: 'company_name', value: 'Bomberos de Chile' },
          { key: 'company_city', value: 'Chile' },
          { key: 'company_region', value: '' }
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadCompaniaConfig();
  }, []);

  /**
   * Función helper para obtener un valor de configuración por clave
   * @param {string} key - Clave de configuración
   * @param {string} defaultValue - Valor por defecto si no se encuentra la clave
   * @returns {string} Valor de la configuración
   */
  const getConfigValue = (key, defaultValue = '') => {
    const config = configs.find(config => config.key === key);
    return config?.value || defaultValue;
  };

  return {
    configs,
    loading,
    error,
    getConfigValue,
    // Método para recargar la configuración si es necesario
    reload: () => {
      setLoading(true);
      setError(null);
      // El useEffect se volverá a ejecutar automáticamente
    }
  };
};
