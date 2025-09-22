// Este archivo manejará la lógica de bomberos activos vía WebSockets
// Mapa: bomberoId -> { bomberoData, sockets: Set<socket.id> }
const activeBomberos = new Map();

// Función para emitir actualizaciones de disponibilidad a todos los clientes conectados
export function emitDisponibilidadUpdate(io, eventType, data) {
  if (io) {
    io.emit('disponibilidadUpdate', {
      type: eventType, // 'created', 'closed', 'updated'
      data: data,
      timestamp: new Date().toISOString()
    });
    console.log(`[SOCKET] Emitido evento de disponibilidad: ${eventType}`, data);
  }
}

export function handleSocketConnection(io) {
  io.on("connection", (socket) => {
    console.log("[SOCKET] Nueva conexión:", socket.id);

    // Cuando un bombero se conecta y se identifica

    // bomberoData: { id, nombres, apellidos }
    socket.on("bomberoActive", (bomberoData) => {
      if (!bomberoData || !bomberoData.id) return;
      let entry = activeBomberos.get(bomberoData.id);
      if (!entry) {
        entry = { bomberoData, sockets: new Set() };
        activeBomberos.set(bomberoData.id, entry);
      }
      entry.sockets.add(socket.id);
      console.log(`[SOCKET] Bombero activo: ${bomberoData.id} (${bomberoData.nombres || ''} ${bomberoData.apellidos || ''}) (socket: ${socket.id})`);
      io.emit("updateActiveBomberos", Array.from(activeBomberos.values()).map(e => e.bomberoData));
    });

    // Cuando un bombero se desconecta
    socket.on("disconnect", () => {
      // Buscar a qué bombero pertenece este socket
      for (const [bomberoId, entry] of activeBomberos.entries()) {
        if (entry.sockets.has(socket.id)) {
          entry.sockets.delete(socket.id);
          if (entry.sockets.size === 0) {
            activeBomberos.delete(bomberoId);
            console.log(`[SOCKET] Desconexión: ${socket.id} (bombero: ${bomberoId}) - bombero eliminado de activos`);
          } else {
            console.log(`[SOCKET] Desconexión: ${socket.id} (bombero: ${bomberoId}) - quedan ${entry.sockets.size} sockets activos`);
          }
          break;
        }
      }
      io.emit("updateActiveBomberos", Array.from(activeBomberos.values()).map(e => e.bomberoData));
    });

    // Eliminar bombero activo explícitamente al hacer logout
    socket.on("bomberoLogout", (bomberoId) => {
      if (!bomberoId) return;
      const entry = activeBomberos.get(bomberoId);
      if (entry) {
        // Eliminar solo los sockets asociados a este socket
        entry.sockets.delete(socket.id);
        if (entry.sockets.size === 0) {
          activeBomberos.delete(bomberoId);
          console.log(`[SOCKET] Logout explícito de bombero: ${bomberoId} - bombero eliminado de activos`);
        } else {
          console.log(`[SOCKET] Logout explícito de bombero: ${bomberoId} - quedan ${entry.sockets.size} sockets activos`);
        }
      }
      io.emit("updateActiveBomberos", Array.from(activeBomberos.values()).map(e => e.bomberoData));
    });
  });
}
