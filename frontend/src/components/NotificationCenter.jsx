import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  BellIcon,
  XMarkIcon,
  CheckIcon,
  TrashIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  UserIcon,
  ChatBubbleLeftIcon,
  UsersIcon,
  FireIcon,
  CalendarIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { useNotifications } from '../context/NotificationContext.jsx';

/**
 * Componente del centro de notificaciones
 * Muestra una lista de notificaciones con opciones para marcarlas como leídas o eliminarlas
 */

const NotificationCenter = React.memo(({ isOpen, onClose }) => {
  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    loadNotifications,
    clearError
  } = useNotifications();

  // Debug log removido para producción

  const [selectedNotifications, setSelectedNotifications] = useState(new Set());

  // Cargar más notificaciones cuando se abre el centro
  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen, loadNotifications]);

  // Limpiar selección cuando se cierra
  useEffect(() => {
    if (!isOpen) {
      setSelectedNotifications(new Set());
    }
  }, [isOpen]);

  const handleMarkAsRead = useCallback(async (notificationId) => {
    try {
      await markAsRead(notificationId);
    } catch (error) {
      console.error('Error marcando notificación como leída:', error);
    }
  }, [markAsRead]);

  const handleMarkAllAsRead = useCallback(async () => {
    try {
      await markAllAsRead();
      setSelectedNotifications(new Set());
    } catch (error) {
      console.error('Error marcando todas como leídas:', error);
    }
  }, [markAllAsRead]);

  const handleDeleteNotification = useCallback(async (notificationId) => {
    try {
      await deleteNotification(notificationId);
      setSelectedNotifications(prev => {
        const newSet = new Set(prev);
        newSet.delete(notificationId);
        return newSet;
      });
    } catch (error) {
      console.error('Error eliminando notificación:', error);
    }
  }, [deleteNotification]);

  const handleSelectNotification = useCallback((notificationId) => {
    setSelectedNotifications(prev => {
      const newSet = new Set(prev);
      if (newSet.has(notificationId)) {
        newSet.delete(notificationId);
      } else {
        newSet.add(notificationId);
      }
      return newSet;
    });
  }, []);

  const handleSelectAll = () => {
    if (selectedNotifications.size === (notifications?.length || 0)) {
      setSelectedNotifications(new Set());
    } else {
      setSelectedNotifications(new Set((notifications || []).map(n => n.id)));
    }
  };

  const handleDeleteSelected = async () => {
    const promises = Array.from(selectedNotifications).map(notificationId =>
      deleteNotification(notificationId)
    );
    
    try {
      await Promise.all(promises);
      setSelectedNotifications(new Set());
    } catch (error) {
      console.error('Error eliminando notificaciones seleccionadas:', error);
    }
  };

  const [currentTime, setCurrentTime] = useState(new Date());

  // Actualizar el tiempo actual cada minuto para que se actualice "hace X minutos"
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Actualizar cada minuto

    return () => clearInterval(interval);
  }, []);

  const formatDate = useCallback((dateString) => {
    const date = new Date(dateString);
    const now = currentTime;
    const diffInSeconds = Math.floor((now - date) / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInSeconds / 3600);
    const diffInDays = Math.floor(diffInSeconds / 86400);

    if (diffInSeconds < 60) {
      return 'Hace un momento';
    } else if (diffInMinutes < 60) {
      return `Hace ${diffInMinutes} min`;
    } else if (diffInHours < 24) {
      return `Hace ${diffInHours} h`;
    } else if (diffInDays === 1) {
      return 'Ayer';
    } else if (diffInDays < 7) {
      return `Hace ${diffInDays} días`;
    } else {
      return date.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    }
  }, [currentTime]);

  const getNotificationIcon = useCallback((type) => {
    const icons = {
      SISTEMA: <BellIcon className="w-5 h-5" />,
      EMERGENCIA: <ExclamationTriangleIcon className="w-5 h-5" />,
      PERSONAL: <UserIcon className="w-5 h-5" />,
      RECORDATORIO: <ClockIcon className="w-5 h-5" />,
      MENSAJE_DIRECTO: <ChatBubbleLeftIcon className="w-5 h-5" />,
      GRUPAL: <UsersIcon className="w-5 h-5" />,
      INCIDENTE: <FireIcon className="w-5 h-5" />,
      EVENTO: <CalendarIcon className="w-5 h-5" />
    };
    return icons[type] || <BellIcon className="w-5 h-5" />;
  }, []);

  const getNotificationColor = useCallback((type) => {
    const colors = {
      SISTEMA: 'bg-blue-500 text-white',
      EMERGENCIA: 'bg-red-500 text-white',
      PERSONAL: 'bg-green-500 text-white',
      RECORDATORIO: 'bg-amber-500 text-white',
      MENSAJE_DIRECTO: 'bg-purple-500 text-white',
      GRUPAL: 'bg-indigo-500 text-white',
      INCIDENTE: 'bg-orange-500 text-white',
      EVENTO: 'bg-pink-500 text-white'
    };
    return colors[type] || 'bg-gray-500 text-white';
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300" onClick={onClose}></div>
      
      {/* Sidebar */}
      <div className="absolute right-0 top-0 h-full w-1/3 min-w-[400px] rounded-t-lg bg-white shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out animate-slide-in-right">
        {/* Header con gradiente */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                <BellIcon className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Notificaciones</h2>
                <p className="text-blue-100 text-sm">
                  {unreadCount > 0 ? `${unreadCount} sin leer` : 'Todo leído'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-blue-200 transition-colors p-1 rounded-lg hover:bg-white hover:bg-opacity-20"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-4 mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            <div className="flex justify-between items-center">
              <span className="text-sm">{error}</span>
              <button onClick={clearError} className="text-red-500 hover:text-red-700">
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Actions */}
        {notifications && notifications.length > 0 && (
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleSelectAll}
                  className="text-sm text-blue-600 hover:text-blue-800 transition-colors font-medium px-2 py-1 rounded-md hover:bg-blue-50"
                >
                  {selectedNotifications.size === (notifications?.length || 0) ? 'Deseleccionar todo' : 'Seleccionar todo'}
                </button>
                {selectedNotifications.size > 0 && (
                  <button
                    onClick={handleDeleteSelected}
                    className="text-sm text-red-600 hover:text-red-800 transition-colors font-medium px-2 py-1 rounded-md hover:bg-red-50"
                  >
                    Eliminar ({selectedNotifications.size})
                  </button>
                )}
              </div>
              <button
                onClick={handleMarkAllAsRead}
                className="text-sm text-green-600 hover:text-green-800 transition-colors font-medium px-2 py-1 rounded-md hover:bg-green-50"
              >
                Marcar todas como leídas
              </button>
            </div>
          </div>
        )}

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : (notifications?.length || 0) === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-gray-400">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <BellIcon className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Sin notificaciones</h3>
              <p className="text-sm text-gray-500 text-center">
                Cuando recibas notificaciones, aparecerán aquí
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-gray-50 transition-all duration-200 border-l-4 ${
                    selectedNotifications.has(notification.id) 
                      ? 'bg-blue-50 border-l-blue-500' 
                      : !notification.readAt 
                        ? 'bg-blue-50 border-l-blue-400' 
                        : 'border-l-transparent'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    {/* Checkbox */}
                    <div className="flex-shrink-0 mt-1">
                      <input
                        type="checkbox"
                        checked={selectedNotifications.has(notification.id)}
                        onChange={() => handleSelectNotification(notification.id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </div>

                    {/* Notification Icon */}
                    <div className="flex-shrink-0">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getNotificationColor(notification.type)}`}>
                        {getNotificationIcon(notification.type)}
                      </div>
                    </div>

                    {/* Notification Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold text-gray-900 truncate">
                            {notification.title}
                          </h3>
                          <p className="mt-1 text-sm text-gray-600 line-clamp-3">
                            {notification.message}
                          </p>
                        </div>
                        
                        {/* Type Badge */}
                        <div className="flex-shrink-0 ml-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getNotificationColor(notification.type)}`}>
                            {notification.type.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                      
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="text-xs text-gray-500 flex items-center">
                            <ClockIcon className="w-3 h-3 mr-1" />
                            {formatDate(notification.createdAt)}
                          </span>
                          <span className="text-xs text-gray-400 mt-1">
                            {new Date(notification.createdAt).toLocaleString('es-ES', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {!notification.readAt && (
                            <button
                              onClick={() => handleMarkAsRead(notification.id)}
                              className="text-xs text-green-600 hover:text-green-800 transition-colors font-medium px-2 py-1 rounded hover:bg-green-50 flex items-center"
                            >
                              <CheckIcon className="w-3 h-3 mr-1" />
                              Leída
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteNotification(notification.id)}
                            className="text-xs text-red-600 hover:text-red-800 transition-colors font-medium px-2 py-1 rounded hover:bg-red-50"
                          >
                            <TrashIcon className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 rounded-b-lg">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center space-x-4">
              <span className="flex items-center">
                <DocumentTextIcon className="w-4 h-4 mr-1" />
                {notifications?.length || 0} total
              </span>
              {unreadCount > 0 && (
                <span className="flex items-center text-blue-600">
                  <BellIcon className="w-4 h-4 mr-1" />
                  {unreadCount} sin leer
                </span>
              )}
            </div>
            <div className="text-xs text-gray-400">
              Sistema de Notificaciones
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default NotificationCenter;
