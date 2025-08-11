// Este archivo manejará la lógica de usuarios activos vía WebSockets
// Mapa: userId -> { userData, sockets: Set<socket.id> }
const activeUsers = new Map();

export function handleSocketConnection(io) {
  io.on("connection", (socket) => {
    console.log("[SOCKET] Nueva conexión:", socket.id);

    // Cuando un usuario se conecta y se identifica

    // userData: { id, nombres, apellidos }
    socket.on("userActive", (userData) => {
      if (!userData || !userData.id) return;
      let entry = activeUsers.get(userData.id);
      if (!entry) {
        entry = { userData, sockets: new Set() };
        activeUsers.set(userData.id, entry);
      }
      entry.sockets.add(socket.id);
      console.log(`[SOCKET] Usuario activo: ${userData.id} (${userData.nombres || ''} ${userData.apellidos || ''}) (socket: ${socket.id})`);
      io.emit("updateActiveUsers", Array.from(activeUsers.values()).map(e => e.userData));
    });

    // Cuando un usuario se desconecta
    socket.on("disconnect", () => {
      // Buscar a qué usuario pertenece este socket
      for (const [userId, entry] of activeUsers.entries()) {
        if (entry.sockets.has(socket.id)) {
          entry.sockets.delete(socket.id);
          if (entry.sockets.size === 0) {
            activeUsers.delete(userId);
            console.log(`[SOCKET] Desconexión: ${socket.id} (usuario: ${userId}) - usuario eliminado de activos`);
          } else {
            console.log(`[SOCKET] Desconexión: ${socket.id} (usuario: ${userId}) - quedan ${entry.sockets.size} sockets activos`);
          }
          break;
        }
      }
      io.emit("updateActiveUsers", Array.from(activeUsers.values()).map(e => e.userData));
    });

    // Eliminar usuario activo explícitamente al hacer logout
    socket.on("userLogout", (userId) => {
      if (!userId) return;
      const entry = activeUsers.get(userId);
      if (entry) {
        // Eliminar solo los sockets asociados a este socket
        entry.sockets.delete(socket.id);
        if (entry.sockets.size === 0) {
          activeUsers.delete(userId);
          console.log(`[SOCKET] Logout explícito de usuario: ${userId} - usuario eliminado de activos`);
        } else {
          console.log(`[SOCKET] Logout explícito de usuario: ${userId} - quedan ${entry.sockets.size} sockets activos`);
        }
      }
      io.emit("updateActiveUsers", Array.from(activeUsers.values()).map(e => e.userData));
    });
  });
}
