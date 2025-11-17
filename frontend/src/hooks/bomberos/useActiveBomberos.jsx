import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "@hooks/auth/useAuth";
import { SOCKET_URL } from "../../config/api.config";

// Obtener datos del bombero autenticado desde sessionStorage
const getBomberoData = () => {
  try {
    const bombero = JSON.parse(sessionStorage.getItem("usuario"));
    if (!bombero) return null;
    return {
      id: bombero.id,
      nombres: bombero.nombres || "",
      apellidos: bombero.apellidos || "",
      companiaId: bombero.companiaId || null,
      rolId: bombero.rolId || null,
    };
  } catch {
    return null;
  }
};

export const useActiveBomberos = () => {
  const [activeBomberos, setActiveBomberos] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const socketRef = useRef(null);
  const { isAuthenticated, bombero } = useAuth();

  useEffect(() => {
    const bomberoData = getBomberoData();
    if (!isAuthenticated || !bomberoData || !bomberoData.id) {
      // Si no está autenticado o no hay bombero, cerrar cualquier socket
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setActiveBomberos(0);
      setIsConnected(false);
      setConnectionError(null);
      return;
    }

    // Crear socket solo si el bombero está autenticado y existe
    const socket = io(SOCKET_URL, {
      withCredentials: true,
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
    socketRef.current = socket;

    // Manejar conexión
    socket.on("connect", () => {
      setIsConnected(true);
      setConnectionError(null);
      // Emitir con el evento correcto que el backend espera
      socket.emit("bomberoActive", bomberoData);
    });

    // Manejar desconexión
    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    // Manejar errores de conexión
    socket.on("connect_error", (error) => {
      setIsConnected(false);
      setConnectionError(error.message);
    });

    // Manejar reconexión
    socket.on("reconnect", () => {
      setIsConnected(true);
      setConnectionError(null);
      socket.emit("bomberoActive", bomberoData);
    });

    // Escuchar actualizaciones de bomberos activos con el evento correcto del backend
    socket.on("updateActiveBomberos", (bomberos) => {
      try {
        if (!Array.isArray(bomberos)) {
          setActiveBomberos(0);
          return;
        }
        
        // Filtrar solo los bomberos de la misma compañía
        const companiaId = bombero?.companiaId || getBomberoData()?.companiaId;
        if (companiaId) {
          const bomberosCompania = bomberos.filter(b => b && b.companiaId === companiaId);
          setActiveBomberos(bomberosCompania.length);
        } else {
          // Si no hay companiaId, contar todos (fallback)
          setActiveBomberos(bomberos.length);
        }
      } catch (error) {
        console.error('[useActiveBomberos] Error procesando updateActiveBomberos:', error);
        setActiveBomberos(0);
      }
    });

    // Limpiar listeners y desconectar al desmontar
    return () => {
      if (socketRef.current) {
        socketRef.current.off("updateActiveBomberos");
        socketRef.current.off("connect");
        socketRef.current.off("disconnect");
        socketRef.current.off("connect_error");
        socketRef.current.off("reconnect");
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setActiveBomberos(0);
      setIsConnected(false);
      setConnectionError(null);
    };
  }, [isAuthenticated, bombero?.companiaId]);

  return { activeBomberos, isConnected, connectionError };
};