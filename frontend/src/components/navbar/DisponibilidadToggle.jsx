import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@hooks/auth/useAuth';
import { useGlobalAvailability } from '@context/GlobalAvailabilityContext';
import { 
  createDisponibilidad, 
  cerrarDisponibilidad
} from '@services/disponibilidad.service';
import { 
  MdAccessTime
} from 'react-icons/md';
import { 
  disponibilidadCreatedToast, 
  disponibilidadClosedToast 
} from '@helpers/toastHelper.jsx';
import { toast } from 'react-toastify';
import dateHelper from '@helpers/dateHelper';


/**
 * Componente toggle para marcar/desmarcar disponibilidad desde el navbar
 * Acceso rápido que usa la hora actual
 */
const DisponibilidadToggle = () => {
  const { bombero, hasPermiso } = useAuth();
  const { currentAvailability, updateAvailability, clearAvailability } = useGlobalAvailability();
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Verificar si el usuario tiene permisos
  if (!hasPermiso('disponibilidad:crear') && !hasPermiso('disponibilidad:actualizar')) {
    return null;
  }

  const isAvailable = !!currentAvailability;

  // Actualizar el tiempo de forma eficiente solo cuando es visible
  useEffect(() => {
    if (isAvailable && currentAvailability) {
      // Actualizar inmediatamente
      setCurrentTime(new Date());
      
      // Configurar intervalo para actualizar cada minuto
      const interval = setInterval(() => {
        setCurrentTime(new Date());
      }, 60000); // 60 segundos

      return () => clearInterval(interval);
    }
  }, [isAvailable, currentAvailability]);

  // Función para marcar disponibilidad
  const handleMarkAvailable = async () => {
    if (!bombero?.id) return;

    setIsLoading(true);
    try {
      const now = dateHelper.now();
      const disponibilidadData = {
        idBombero: bombero.id,
        fechaInicio: dateHelper.toInputFormat(now)
      };

      const newDisponibilidad = await createDisponibilidad(disponibilidadData);
      updateAvailability(newDisponibilidad);
      
      disponibilidadCreatedToast('Te has marcado como disponible desde ahora');
    } catch (error) {
      console.error('Error al marcar disponibilidad:', error);
      toast.error('No se pudo marcar la disponibilidad. Inténtalo nuevamente.', {
        position: "bottom-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Función para cerrar disponibilidad
  const handleCloseAvailability = async () => {
    if (!bombero?.id || !currentAvailability) return;

    setIsLoading(true);
    try {
      const disponibilidadData = {
        idBombero: bombero.id
      };

      await cerrarDisponibilidad(disponibilidadData);
      clearAvailability();
      
      disponibilidadClosedToast('Has cerrado tu disponibilidad');
    } catch (error) {
      console.error('Error al cerrar disponibilidad:', error);
      toast.error('No se pudo cerrar la disponibilidad. Inténtalo nuevamente.', {
        position: "bottom-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Función principal del toggle
  const handleToggle = () => {
    if (isLoading) return;
    
    if (isAvailable) {
      handleCloseAvailability();
    } else {
      handleMarkAvailable();
    }
  };

  // Formatear tiempo transcurrido de forma eficiente
  const formatElapsedTime = useCallback((fechaInicio) => {
    if (!fechaInicio) return '0m';
    
    try {
      const inicio = dateHelper.toSantiago(fechaInicio);
      const now = dateHelper.toSantiago(currentTime);
      const diff = now.diff(inicio, ['hours', 'minutes']);
      
      // Optimización: evitar cálculos innecesarios y valores negativos
      const hours = Math.max(0, Math.floor(diff.hours));
      const minutes = Math.max(0, Math.floor(diff.minutes));
      
      if (hours >= 1) {
        return `${hours}h ${minutes}m`;
      } else {
        return `${minutes}m`;
      }
    } catch (error) {
      console.warn('Error al calcular tiempo transcurrido:', error);
      return '0m';
    }
  }, [currentTime]);

  // Memoizar el tiempo transcurrido para evitar recálculos innecesarios
  const elapsedTime = useMemo(() => {
    if (!isAvailable || !currentAvailability?.fechaInicio) return '0m';
    return formatElapsedTime(currentAvailability.fechaInicio);
  }, [isAvailable, currentAvailability?.fechaInicio, formatElapsedTime]);

  return (
    <div className="flex items-center space-x-3">
      {/* Toggle Switch */}
      <div className="flex items-center space-x-2">
        {/* Label */}
        <span className="text-sm font-medium text-gray-700 hidden md:block">
          Disponible
        </span>
        
        {/* Switch Container */}
        <button
          onClick={handleToggle}
          disabled={isLoading}
          className={`
            relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2
            ${isLoading 
              ? 'cursor-not-allowed opacity-50' 
              : 'cursor-pointer'
            }
            ${isAvailable
              ? 'bg-green-500 focus:ring-green-500'
              : 'bg-gray-300 focus:ring-gray-500'
            }
          `}
          title={isAvailable ? 'Marcar como no disponible' : 'Marcar como disponible'}
        >
          {/* Switch Thumb */}
          <span
            className={`
              inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform duration-200 ease-in-out
              ${isAvailable ? 'translate-x-6' : 'translate-x-1'}
              ${isLoading ? 'animate-pulse' : ''}
            `}
          >
            {isLoading && (
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" />
              </div>
            )}
          </span>
        </button>
      </div>

      {/* Status Indicator */}
      {isAvailable && currentAvailability && (
        <div className="hidden md:flex items-center space-x-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
          <MdAccessTime className="w-3 h-3" />
          <span className="font-medium">
            {elapsedTime}
          </span>
        </div>
      )}
    </div>
  );
};

export default DisponibilidadToggle;
