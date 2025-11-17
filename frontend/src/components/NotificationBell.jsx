import React, { useState, useEffect, useCallback } from 'react';
import { BellIcon } from '@heroicons/react/24/outline';
import { BellIcon as BellSolidIcon } from '@heroicons/react/24/solid';
import { useNotifications } from '../context/NotificationContext.jsx';
import NotificationCenter from './NotificationCenter.jsx';

/**
 * Componente del botón de notificaciones (campana)
 * Muestra el contador de notificaciones no leídas y abre el centro de notificaciones
 */

const NotificationBell = React.memo(() => {
  const { unreadCount, isConnected, lastNotification } = useNotifications();
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);
  const [showPulse, setShowPulse] = useState(false);

  // Mostrar animación de pulso cuando llega una nueva notificación
  useEffect(() => {
    if (lastNotification) {
      setShowPulse(true);
      const timer = setTimeout(() => {
        setShowPulse(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [lastNotification]);

  const handleBellClick = useCallback(() => {
    setIsNotificationCenterOpen(true);
  }, []);

  const handleCloseNotificationCenter = useCallback(() => {
    setIsNotificationCenterOpen(false);
  }, []);

  return (
    <>
      <div className="relative">
        <button
          onClick={handleBellClick}
          className={`relative p-2 text-gray-600 hover:text-gray-900 transition-colors rounded-full hover:bg-gray-100 ${
            showPulse ? 'animate-pulse' : ''
          }`}
          title={isConnected ? 'Notificaciones' : 'Conectando...'}
        >
          {/* Icono de campana */}
          <BellIcon className={`w-6 h-6 ${isConnected ? '' : 'opacity-50'}`} />

          {/* Contador de notificaciones no leídas */}
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}

          {/* Indicador de conexión */}
          {!isConnected && (
            <span className="absolute -bottom-1 -right-1 bg-yellow-400 text-yellow-900 text-xs rounded-full h-3 w-3 flex items-center justify-center">
              <div className="w-1 h-1 bg-yellow-900 rounded-full"></div>
            </span>
          )}

          {/* Animación de pulso para nuevas notificaciones */}
          {showPulse && (
            <span className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-75"></span>
          )}
        </button>

        {/* Tooltip */}
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
          {isConnected 
            ? `${unreadCount} notificaciones no leídas` 
            : 'Conectando a notificaciones...'
          }
        </div>
      </div>

      {/* Centro de notificaciones */}
      <NotificationCenter
        isOpen={isNotificationCenterOpen}
        onClose={handleCloseNotificationCenter}
      />
    </>
  );
});

export default NotificationBell;