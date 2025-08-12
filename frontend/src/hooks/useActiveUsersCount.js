import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "@hooks/auth/useAuth";

// Obtener datos del usuario autenticado desde sessionStorage
const getUserData = () => {
  try {
    const user = JSON.parse(sessionStorage.getItem("usuario"));
    if (!user) return null;
    return {
      id: user.id,
      nombres: user.nombres || user.name || "",
      apellidos: user.apellidos || "",
    };
  } catch {
    return null;
  }
};

export const useActiveUsersCount = () => {
  const [activeUsersCount, setActiveUsersCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const socketRef = useRef(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const userData = getUserData();
    if (!isAuthenticated || !userData || !userData.id) {
      // Si no está autenticado o no hay usuario, cerrar cualquier socket
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setActiveUsersCount(0);
      setIsConnected(false);
      setConnectionError(null);
      return;
    }

    // Crear socket solo si el usuario está autenticado y existe
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
      socket.emit("userActive", userData);
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
      socket.emit("userActive", userData);
    });

    // Escuchar actualizaciones de usuarios activos y obtener solo el conteo
    socket.on("updateActiveUsers", (users) => {
      setActiveUsersCount(Array.isArray(users) ? users.length : 0);
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
      setActiveUsersCount(0);
      setIsConnected(false);
      setConnectionError(null);
    };
  }, [isAuthenticated]);

  return { activeUsersCount, isConnected, connectionError };
};