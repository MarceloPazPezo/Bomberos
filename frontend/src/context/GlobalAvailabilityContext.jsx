import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from '@hooks/auth/useAuth';
import { getDisponibilidades } from '@services/disponibilidad.service';

const GlobalAvailabilityContext = createContext();

/**
 * Contexto global para la disponibilidad del usuario actual
 * Disponible en toda la aplicación (navbar, páginas, etc.)
 */
export const GlobalAvailabilityProvider = ({ children }) => {
  const { bombero } = useAuth();
  const [currentAvailability, setCurrentAvailability] = useState(null);
  const [loading, setLoading] = useState(false);

  // Verificar disponibilidad actual
  const checkCurrentAvailability = useCallback(async () => {
    if (!bombero?.id) {
      setCurrentAvailability(null);
      return;
    }

    try {
      setLoading(true);
      const disponibilidades = await getDisponibilidades(bombero.id);
      const activeAvailability = disponibilidades.find(d => 
        (!d.fechaTermino || new Date(d.fechaTermino) > new Date())
      );
      setCurrentAvailability(activeAvailability || null);
    } catch (error) {
      console.error('Error checking availability:', error);
      setCurrentAvailability(null);
    } finally {
      setLoading(false);
    }
  }, [bombero?.id]);

  // Verificar disponibilidad al cambiar de usuario
  useEffect(() => {
    checkCurrentAvailability();
  }, [checkCurrentAvailability]);

  // Función para actualizar disponibilidad (usada por otros componentes)
  const updateAvailability = useCallback((availability) => {
    setCurrentAvailability(availability);
  }, []);

  // Función para limpiar disponibilidad
  const clearAvailability = useCallback(() => {
    setCurrentAvailability(null);
  }, []);

  const value = {
    currentAvailability,
    loading,
    updateAvailability,
    clearAvailability,
    refreshAvailability: checkCurrentAvailability
  };

  return (
    <GlobalAvailabilityContext.Provider value={value}>
      {children}
    </GlobalAvailabilityContext.Provider>
  );
};

/**
 * Hook para usar el contexto global de disponibilidad
 */
export const useGlobalAvailability = () => {
  const context = useContext(GlobalAvailabilityContext);
  
  if (!context) {
    throw new Error('useGlobalAvailability debe ser usado dentro de un GlobalAvailabilityProvider');
  }
  
  return context;
};

export default GlobalAvailabilityContext;
