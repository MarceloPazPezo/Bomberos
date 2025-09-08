import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "@hooks/auth/useAuth";

// Obtener datos del bombero autenticado desde sessionStorage
const getBomberoData = () => {
  try {
    const bombero = JSON.parse(sessionStorage.getItem("usuario"));
    if (!bombero) return null;
    return {
      id: bombero.id,
      nombres: bombero.nombres || "",
      apellidos: bombero.apellidos || "",
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
  const { isAuthenticated } = useAuth();

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
    const socket = io("http://localhost:3000", {
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
      socket.emit("userActive", bomberoData);
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
      socket.emit("userActive", bomberoData);
    });

    // Escuchar actualizaciones de bomberos activos y obtener solo el conteo
    socket.on("updateActiveUsers", (bomberos) => {
      setActiveBomberos(Array.isArray(bomberos) ? bomberos.length : 0);
    });

    // Limpiar listeners y desconectar al desmontar
    return () => {
      if (socketRef.current) {
        socketRef.current.off("updateActiveUsers");
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
  }, [isAuthenticated]);

  return { activeBomberos, isConnected, connectionError };
};