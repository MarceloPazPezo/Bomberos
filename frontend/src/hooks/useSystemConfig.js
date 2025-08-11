import { useState, useEffect, useCallback } from 'react';
import { getSystemConfigs, getSystemConfig, updateSystemConfig } from '../services/sistema.service.js';

export const useSystemConfig = (key = null, category = null) => {
  const [config, setConfig] = useState(null);
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchConfigs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (key) {
        const response = await getSystemConfig(key);
        setConfig(response.data);
      } else {
        const response = await getSystemConfigs(category);
        const data = response.data;
        setConfigs(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Error fetching configs:', err);
      setError(err.message || 'Error al cargar configuraciones');
      if (!key) {
        setConfigs([]);
      }
    } finally {
      setLoading(false);
    }
  }, [key, category]);

  const updateConfig = async (configKey, value) => {
    try {
      setError(null);
      const response = await updateSystemConfig(configKey, value);
      
      if (key === configKey) {
        setConfig(response.data);
      } else {
        // Actualizar en la lista de configuraciones
        setConfigs(prev => {
          if (!Array.isArray(prev)) return [];
          return prev.map(c => 
            c.key === configKey ? response.data : c
          );
        });
      }
      
      return response;
    } catch (err) {
      console.error('Error updating config:', err);
      setError(err.message || 'Error al actualizar configuración');
      throw err;
    }
  };

  useEffect(() => {
    fetchConfigs();
  }, [fetchConfigs]);

  return {
    config,
    configs,
    loading,
    error,
    fetchConfigs,
    updateConfig
  };
};

export const useCompanyConfig = () => {
  return useSystemConfig(null, 'company');
};