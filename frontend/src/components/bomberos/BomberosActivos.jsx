
import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "@hooks/auth/useAuth";
import { MdPerson } from "react-icons/md";

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


const UsuariosActivos = () => {
  const [activeUsers, setActiveUsers] = useState([]);
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
      setActiveUsers([]);
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

    // Emitir userActive al conectar o reconectar
    const emitActive = () => {
      socket.emit("userActive", userData);
    };
    socket.on("connect", emitActive);
    socket.on("reconnect", emitActive);

    // Escuchar actualizaciones de usuarios activos
    socket.on("updateActiveUsers", (users) => {
      setActiveUsers(users);
    });

    // Limpiar listeners y desconectar al desmontar o si cambia isAuthenticated/userData
    return () => {
      socket.off("updateActiveUsers");
      socket.off("connect", emitActive);
      socket.off("reconnect", emitActive);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [isAuthenticated]);

  return (
    <div className="usuarios-activos">
      <h2 className="text-xl font-bold mb-4">Usuarios activos en el sistema</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {activeUsers.map((user) => (
          <div
            key={user.id}
            className="flex items-center gap-4 bg-white rounded-lg shadow p-4 border border-slate-200"
          >
            <div className="flex-shrink-0 bg-blue-100 rounded-full p-2">
              <MdPerson className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <div className="font-semibold text-slate-800 text-lg">
                {Array.isArray(user.nombres) ? user.nombres.join(" ") : user.nombres} {Array.isArray(user.apellidos) ? user.apellidos.join(" ") : user.apellidos}
              </div>
              {/* Puedes agregar más info aquí si lo deseas */}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UsuariosActivos;
