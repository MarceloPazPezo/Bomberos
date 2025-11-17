// Este archivo manejará la lógica de bomberos activos vía WebSockets
// Mapa: bomberoId -> { bomberoData, sockets: Set<socket.id> }
const activeBomberos = new Map();

// Importaciones dinámicas de notificaciones para evitar dependencias circulares

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

    // bomberoData: { id, nombres, apellidos, companiaId?, rolId? }
    socket.on("bomberoActive", async (bomberoData) => {
      if (!bomberoData || !bomberoData.id) return;
      
      let entry = activeBomberos.get(bomberoData.id);
      if (!entry) {
        entry = { bomberoData, sockets: new Set() };
        activeBomberos.set(bomberoData.id, entry);
      }
      entry.sockets.add(socket.id);
      
      console.log(`[SOCKET] Bombero activo: ${bomberoData.id} (${bomberoData.nombres || ''} ${bomberoData.apellidos || ''}) (socket: ${socket.id})`);
      
             // Suscribir a notificaciones si es la primera conexión del usuario
             if (entry.sockets.size === 1) {
               try {
                 const { subscribeUserToNotifications } = await import('./notifications.socket.js');
                 await subscribeUserToNotifications(bomberoData.id, socket.id, {
                   companiaId: bomberoData.companiaId,
                   rolId: bomberoData.rolId
                 });
                 console.log(`[SOCKET] Usuario ${bomberoData.id} suscrito a notificaciones`);
               } catch (error) {
                 console.error('[SOCKET] Error suscribiendo a notificaciones:', error);
               }
             }
      
      io.emit("updateActiveBomberos", Array.from(activeBomberos.values()).map(e => e.bomberoData));
    });

    // Cuando un bombero se desconecta
    socket.on("disconnect", async () => {
      // Buscar a qué bombero pertenece este socket
      for (const [bomberoId, entry] of activeBomberos.entries()) {
        if (entry.sockets.has(socket.id)) {
          entry.sockets.delete(socket.id);
          
                 // Desuscribir de notificaciones
                 try {
                   const { unsubscribeUserFromNotifications } = await import('./notifications.socket.js');
                   await unsubscribeUserFromNotifications(bomberoId, socket.id);
                   console.log(`[SOCKET] Usuario ${bomberoId} desuscrito de notificaciones`);
                 } catch (error) {
                   console.error('[SOCKET] Error desuscribiendo de notificaciones:', error);
                 }
          
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
    socket.on("bomberoLogout", async (bomberoId) => {
      if (!bomberoId) return;
      const entry = activeBomberos.get(bomberoId);
      if (entry) {
        // Eliminar solo los sockets asociados a este socket
        entry.sockets.delete(socket.id);
        
                 // TODO: Rehabilitar desuscripciones WebSocket cuando se resuelva el problema de Redis Pub/Sub
                 // Desuscribir de notificaciones
                 // try {
                 //   const { unsubscribeUserFromNotifications } = await import('./notifications.socket.js');
                 //   await unsubscribeUserFromNotifications(bomberoId, socket.id);
                 // } catch (error) {
                 //   console.error('[SOCKET] Error desuscribiendo de notificaciones:', error);
                 // }
        
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
