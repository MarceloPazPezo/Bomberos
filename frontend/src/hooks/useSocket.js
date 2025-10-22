import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './auth/useAuth';

const SOCKET_URL = 'http://localhost:3000'; // Ajusta según tu configuración

const useSocket = () => {
  const socketRef = useRef(null);
  const { bombero } = useAuth();

  useEffect(() => {
    // Solo conectar si hay un bombero autenticado
    if (!bombero?.id) {
      return;
    }

    // Crear conexión del socket
    socketRef.current = io(SOCKET_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      // Identificar al bombero en el servidor
      const bomberoData = {
        id: bombero.id,
        nombres: bombero.nombres,
        apellidos: bombero.apellidos,
        companiaId: bombero.companiaId,
        rolId: bombero.rolId
      };
      
      // Debug log removido para producción
      socket.emit('bomberoActive', bomberoData);
    });

    socket.on('disconnect', () => {
      // Socket desconectado
    });

    socket.on('connect_error', (error) => {
      console.error('Error de conexión socket:', error);
    });

    // Cleanup function
    return () => {
      if (socket) {
        // Notificar logout explícito
        socket.emit('bomberoLogout', bombero.id);
        socket.disconnect();
      }
    };
  }, [bombero?.id]);

  // Función para emitir eventos
  const emit = (event, data) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit(event, data);
    }
  };

  // Función para escuchar eventos
  const on = (event, callback) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback);
    }
  };

  // Función para dejar de escuchar eventos
  const off = (event, callback) => {
    if (socketRef.current) {
      socketRef.current.off(event, callback);
    }
  };

  return {
    socket: socketRef.current,
    emit,
    on,
    off,
    isConnected: socketRef.current?.connected || false,
  };
};

export default useSocket;