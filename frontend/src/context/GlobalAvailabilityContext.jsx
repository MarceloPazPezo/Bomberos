import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from '@hooks/auth/useAuth';
import { getMiDisponibilidadActiva } from '@services/disponibilidad.service';

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
      // Usar el endpoint específico para obtener disponibilidad activa del usuario autenticado
      const activeAvailability = await getMiDisponibilidadActiva();
      setCurrentAvailability(activeAvailability || null);
    } catch (error) {
      // Si es 404, significa que no hay disponibilidad activa (esperado)
      if (error.response?.status !== 404) {
        console.error('[GlobalAvailabilityContext] Error checking availability:', error);
      }
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
