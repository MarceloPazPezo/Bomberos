import React, { createContext, useContext, useReducer, useEffect, useCallback, useMemo } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '@hooks/auth/useAuth';
import notificationService from '../services/notification.service.js';
import { SOCKET_URL } from '../config/api.config';

/**
 * Contexto de notificaciones para el frontend
 * Maneja el estado global de notificaciones y la conexión WebSocket
 */

// Estados del contexto
const initialState = {
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
  socket: null,
  isConnected: false,
  lastNotification: null
};

// Tipos de acciones
const ACTION_TYPES = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_NOTIFICATIONS: 'SET_NOTIFICATIONS',
  ADD_NOTIFICATION: 'ADD_NOTIFICATION',
  UPDATE_NOTIFICATION: 'UPDATE_NOTIFICATION',
  REMOVE_NOTIFICATION: 'REMOVE_NOTIFICATION',
  SET_UNREAD_COUNT: 'SET_UNREAD_COUNT',
  INCREMENT_UNREAD_COUNT: 'INCREMENT_UNREAD_COUNT',
  DECREMENT_UNREAD_COUNT: 'DECREMENT_UNREAD_COUNT',
  RESET_UNREAD_COUNT: 'RESET_UNREAD_COUNT',
  SET_SOCKET: 'SET_SOCKET',
  SET_CONNECTED: 'SET_CONNECTED',
  SET_LAST_NOTIFICATION: 'SET_LAST_NOTIFICATION'
};

// Reducer para manejar el estado
function notificationReducer(state, action) {
  switch (action.type) {
    case ACTION_TYPES.SET_LOADING:
      return { ...state, isLoading: action.payload };

    case ACTION_TYPES.SET_ERROR:
      return { ...state, error: action.payload, isLoading: false };

    case ACTION_TYPES.SET_NOTIFICATIONS:
      // Debug logs removidos para producción
      return { 
        ...state, 
        notifications: action.payload.notifications || [],
        unreadCount: action.payload.unreadCount || 0,
        isLoading: false,
        error: null
      };

    case ACTION_TYPES.ADD_NOTIFICATION:
      const newNotifications = [action.payload, ...(state.notifications || [])];
      return {
        ...state,
        notifications: newNotifications.slice(0, 100), // Mantener máximo 100 notificaciones
        unreadCount: state.unreadCount + 1,
        lastNotification: action.payload
      };

    case ACTION_TYPES.UPDATE_NOTIFICATION:
      const updatedNotifications = (state.notifications || []).map(notification =>
        notification.id === action.payload.id ? { ...notification, ...action.payload } : notification
      );
      return { ...state, notifications: updatedNotifications };

    case ACTION_TYPES.REMOVE_NOTIFICATION:
      const filteredNotifications = (state.notifications || []).filter(
        notification => notification.id !== action.payload
      );
      return { ...state, notifications: filteredNotifications };

    case ACTION_TYPES.SET_UNREAD_COUNT:
      return { ...state, unreadCount: action.payload };

    case ACTION_TYPES.INCREMENT_UNREAD_COUNT:
      return { ...state, unreadCount: state.unreadCount + 1 };

    case ACTION_TYPES.DECREMENT_UNREAD_COUNT:
      return { ...state, unreadCount: Math.max(0, state.unreadCount - 1) };

    case ACTION_TYPES.RESET_UNREAD_COUNT:
      return { ...state, unreadCount: 0 };

    case ACTION_TYPES.SET_SOCKET:
      return { ...state, socket: action.payload };

    case ACTION_TYPES.SET_CONNECTED:
      return { ...state, isConnected: action.payload };

    case ACTION_TYPES.SET_LAST_NOTIFICATION:
      return { ...state, lastNotification: action.payload };

    default:
      return state;
  }
}

// Crear el contexto
const NotificationContext = createContext();

// Hook personalizado para usar el contexto
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications debe ser usado dentro de NotificationProvider');
  }
  return context;
};

// Provider del contexto
export const NotificationProvider = ({ children }) => {
  const { bombero: user } = useAuth();
  const [state, dispatch] = useReducer(notificationReducer, initialState);

  // Inicializar conexión WebSocket
  const initializeSocket = useCallback(() => {
    if (!user?.id || state.socket) return;

    const socket = io(SOCKET_URL, {
      transports: ['websocket'],
      autoConnect: true
    });

    dispatch({ type: ACTION_TYPES.SET_SOCKET, payload: socket });

    // Eventos del socket
    socket.on('connect', () => {
      // Debug log removido para producción
      dispatch({ type: ACTION_TYPES.SET_CONNECTED, payload: true });

      // Enviar datos del usuario activo para suscribirse a notificaciones
      const userData = {
        id: user.id,
        nombres: user.nombres,
        apellidos: user.apellidos,
        companiaId: user.companiaId,
        rolId: user.rolId
      };
      
      // Debug log removido para producción
      socket.emit('bomberoActive', userData);
    });

    socket.on('disconnect', () => {
      // Debug log removido para producción
      dispatch({ type: ACTION_TYPES.SET_CONNECTED, payload: false });
    });

    socket.on('notification', (notification) => {
      // Debug log removido para producción
      dispatch({ type: ACTION_TYPES.ADD_NOTIFICATION, payload: notification });

      // Mostrar notificación del navegador si está permitido
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/images/default-avatar.png',
          tag: notification.id
        });
      }
    });

    socket.on('system_notification', (notification) => {
      // Debug log removido para producción
      dispatch({ type: ACTION_TYPES.ADD_NOTIFICATION, payload: notification });

      // Mostrar notificación del navegador
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/images/default-avatar.png',
          tag: notification.id
        });
      }
    });

    socket.on('error', (error) => {
      console.error('[NOTIFICATION] Error en WebSocket:', error);
      dispatch({ type: ACTION_TYPES.SET_ERROR, payload: error.message });
    });

    return socket;
  }, [user?.id, state.socket]);

  // Cargar notificaciones iniciales
  const loadNotifications = useCallback(async (limit = 50, offset = 0) => {
    if (!user?.id) return;

    try {
      dispatch({ type: ACTION_TYPES.SET_LOADING, payload: true });
      const response = await notificationService.getUserNotifications(limit, offset);
      
      // Debug logs removidos para producción
      
      // Extraer datos de la respuesta del API
      const notifications = response.data?.notifications || response.notifications || [];
      const unreadCount = response.data?.unreadCount || response.unreadCount || 0;
      
      dispatch({
        type: ACTION_TYPES.SET_NOTIFICATIONS,
        payload: {
          notifications,
          unreadCount
        }
      });
    } catch (error) {
      console.error('[NOTIFICATION] Error cargando notificaciones:', error);
      dispatch({ type: ACTION_TYPES.SET_ERROR, payload: error.message });
    }
  }, [user?.id]);

  // Cargar contador de no leídas
  const loadUnreadCount = useCallback(async () => {
    if (!user?.id) return;

    try {
      const response = await notificationService.getUnreadCount();
      const unreadCount = response.data?.unreadCount || response.unreadCount || 0;
      dispatch({ type: ACTION_TYPES.SET_UNREAD_COUNT, payload: unreadCount });
    } catch (error) {
      console.error('[NOTIFICATION] Error cargando contador de no leídas:', error);
    }
  }, [user?.id]);

  // Marcar notificación como leída
  const markAsRead = useCallback(async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      dispatch({
        type: ACTION_TYPES.UPDATE_NOTIFICATION,
        payload: { id: notificationId, readAt: new Date().toISOString() }
      });
      dispatch({ type: ACTION_TYPES.DECREMENT_UNREAD_COUNT });
    } catch (error) {
      console.error('[NOTIFICATION] Error marcando notificación como leída:', error);
      dispatch({ type: ACTION_TYPES.SET_ERROR, payload: error.message });
    }
  }, []);

  // Marcar todas como leídas
  const markAllAsRead = useCallback(async () => {
    try {
      await notificationService.markAllAsRead();
      const updatedNotifications = (state.notifications || []).map(notification => ({
        ...notification,
        readAt: new Date().toISOString()
      }));
      dispatch({ type: ACTION_TYPES.SET_NOTIFICATIONS, payload: { notifications: updatedNotifications, unreadCount: 0 } });
    } catch (error) {
      console.error('[NOTIFICATION] Error marcando todas las notificaciones como leídas:', error);
      dispatch({ type: ACTION_TYPES.SET_ERROR, payload: error.message });
    }
  }, [state.notifications]);

  // Eliminar notificación
  const deleteNotification = useCallback(async (notificationId) => {
    try {
      await notificationService.deleteNotification(notificationId);
      dispatch({ type: ACTION_TYPES.REMOVE_NOTIFICATION, payload: notificationId });
      
      // Decrementar contador si la notificación no estaba leída
      const notification = (state.notifications || []).find(n => n.id === notificationId);
      if (notification && !notification.readAt) {
        dispatch({ type: ACTION_TYPES.DECREMENT_UNREAD_COUNT });
      }
    } catch (error) {
      console.error('[NOTIFICATION] Error eliminando notificación:', error);
      dispatch({ type: ACTION_TYPES.SET_ERROR, payload: error.message });
    }
  }, [state.notifications]);

  // Solicitar permisos de notificación del navegador
  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return Notification.permission === 'granted';
  }, []);

  // Enviar notificación individual
  const sendIndividualNotification = useCallback(async (bomberoId, type, title, message, data, ttl) => {
    try {
      dispatch({ type: ACTION_TYPES.SET_LOADING, payload: true });
      const response = await notificationService.sendIndividualNotification(bomberoId, type, title, message, data, ttl);
      dispatch({ type: ACTION_TYPES.SET_LOADING, payload: false });
      return response;
    } catch (error) {
      console.error('[NOTIFICATION] Error enviando notificación individual:', error);
      dispatch({ type: ACTION_TYPES.SET_ERROR, payload: error.message });
      throw error;
    }
  }, []);

  // Enviar notificación del sistema
  const sendSystemNotification = useCallback(async (bomberoIds, type, title, message, data, ttl) => {
    try {
      dispatch({ type: ACTION_TYPES.SET_LOADING, payload: true });
      const response = await notificationService.sendSystemNotification(bomberoIds, type, title, message, data, ttl);
      dispatch({ type: ACTION_TYPES.SET_LOADING, payload: false });
      return response;
    } catch (error) {
      console.error('[NOTIFICATION] Error enviando notificación del sistema:', error);
      dispatch({ type: ACTION_TYPES.SET_ERROR, payload: error.message });
      throw error;
    }
  }, []);

  // Enviar notificación a compañía
  const sendCompaniaNotification = useCallback(async (companiaId, bomberoIds, type, title, message, data, ttl) => {
    try {
      dispatch({ type: ACTION_TYPES.SET_LOADING, payload: true });
      const response = await notificationService.sendCompaniaNotification(companiaId, bomberoIds, type, title, message, data, ttl);
      dispatch({ type: ACTION_TYPES.SET_LOADING, payload: false });
      return response;
    } catch (error) {
      console.error('[NOTIFICATION] Error enviando notificación de compañía:', error);
      dispatch({ type: ACTION_TYPES.SET_ERROR, payload: error.message });
      throw error;
    }
  }, []);

  // Enviar notificación por rol
  const sendRolNotification = useCallback(async (rolId, bomberoIds, type, title, message, data, ttl) => {
    try {
      dispatch({ type: ACTION_TYPES.SET_LOADING, payload: true });
      const response = await notificationService.sendRolNotification(rolId, bomberoIds, type, title, message, data, ttl);
      dispatch({ type: ACTION_TYPES.SET_LOADING, payload: false });
      return response;
    } catch (error) {
      console.error('[NOTIFICATION] Error enviando notificación por rol:', error);
      dispatch({ type: ACTION_TYPES.SET_ERROR, payload: error.message });
      throw error;
    }
  }, []);

  // Enviar notificación (función genérica)
  const sendNotification = useCallback(async (notificationData) => {
    try {
      dispatch({ type: ACTION_TYPES.SET_LOADING, payload: true });
      const response = await notificationService.sendNotification(notificationData);
      dispatch({ type: ACTION_TYPES.SET_LOADING, payload: false });
      return response;
    } catch (error) {
      console.error('[NOTIFICATION] Error enviando notificación:', error);
      dispatch({ type: ACTION_TYPES.SET_ERROR, payload: error.message });
      throw error;
    }
  }, []);

  // Obtener tipos de notificaciones disponibles
  const getNotificationTypes = useCallback(async () => {
    try {
      return await notificationService.getNotificationTypes();
    } catch (error) {
      console.error('[NOTIFICATION] Error obteniendo tipos de notificaciones:', error);
      return {};
    }
  }, []);

  // Efectos
  useEffect(() => {
    if (user) {
      // Inicializar socket
      const socket = initializeSocket();

      // Cargar notificaciones y contador
      loadNotifications();
      loadUnreadCount();

      // Solicitar permisos de notificación
      requestNotificationPermission();

      // Cleanup al desmontar o cambiar usuario
      return () => {
        if (socket) {
          socket.emit('bomberoLogout', user.id);
          socket.disconnect();
        }
        dispatch({ type: ACTION_TYPES.SET_SOCKET, payload: null });
        dispatch({ type: ACTION_TYPES.SET_CONNECTED, payload: false });
      };
    }
  }, [user?.id]); // Solo depende del ID del usuario, no de las funciones

  // Limpiar error después de 5 segundos
  useEffect(() => {
    if (state.error) {
      const timer = setTimeout(() => {
        dispatch({ type: ACTION_TYPES.SET_ERROR, payload: null });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [state.error]);

  // Valores del contexto - memorizado para evitar re-renderizados
  const value = useMemo(() => ({
    // Estado
    notifications: state.notifications,
    unreadCount: state.unreadCount,
    isLoading: state.isLoading,
    error: state.error,
    isConnected: state.isConnected,
    lastNotification: state.lastNotification,
    
    // Acciones
    loadNotifications,
    loadUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    sendNotification,
    sendIndividualNotification,
    sendSystemNotification,
    sendCompaniaNotification,
    sendRolNotification,
    getNotificationTypes,
    requestNotificationPermission,
    
    // Utilidades
    clearError: () => dispatch({ type: ACTION_TYPES.SET_ERROR, payload: null })
  }), [
    state.notifications,
    state.unreadCount,
    state.isLoading,
    state.error,
    state.isConnected,
    state.lastNotification,
    loadNotifications,
    loadUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    sendNotification,
    sendIndividualNotification,
    sendSystemNotification,
    sendCompaniaNotification,
    sendRolNotification,
    getNotificationTypes,
    requestNotificationPermission
  ]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;
