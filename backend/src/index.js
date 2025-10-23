"use strict";
// Desarrollo con hot reload activado
import cors from "cors";
import cookieParser from "cookie-parser";
import session from "express-session";
import passport from "passport";
import express, { json, urlencoded } from "express";

import indexRoutes from "./routes/index.routes.js";
import logger from "./config/configLogger.js";
import {
  morganMiddleware,
  requestLogger,
  errorLogger,
} from "./middlewares/logger.middleware.js";

import { COOKIE_KEY, HOST, PORT } from "./config/configEnv.js";
import { connectDB } from "./config/configDb.js";
import { passportJwtSetup } from "./auth/passport.auth.js";
import { initializeMinIO } from "./config/configMinIO.js";
import { initializeRedis } from "./config/configRedis.js";
import { initializeNotificationSystem } from "./config/configNotification.js";

import {
  crearCompañia
} from "./config/data/initialCompania.js";
import {
  crearBomberos
} from "./config/data/initialBombero.js";
import {
  crearRoles,
  crearPermisos
} from "./config/data/initialRolPermisos.js";
import {
  crearRegiones,
  crearComunas,
} from "./config/data/initialRegionComuna.js";
import {
  crearEstadosCiviles
} from "./config/data/initialEstadoCivil.js";
import {
  crearServiciosExternos
} from "./config/data/initialServicio.js";
import {
  crearCarrosPredeterminados
} from "./config/data/initialCarro.js";

import {
  crearSubTipoIncidente,
  crearClasificacionEmergencia,
  crearTipoDano,
  crearfaseIncidente,
  crearServicios,
  crearTiposSangre,
  crearEstadosReporte
} from "./config/data/initialExtra.js";
import {
  inicializarEpp
} from "./config/data/initialEpp.js";
import {
  default as crearTipoEvento
} from "./config/data/initialTipoEvento.js";

import http from "http";
import { Server as SocketIOServer } from "socket.io";
import { handleSocketConnection } from "./sockets/activeUsers.socket.js";

// Variable global para acceder a la instancia de socket.io desde otros módulos
let ioInstance = null;

export const getIO = () => ioInstance;


async function setupServer() {
  try {
    const app = express();

    app.disable("x-powered-by");

    app.use(
      cors({
        credentials: true,
        origin: true,
      }),
    );

    app.use(
      urlencoded({
        extended: true,
        limit: "1mb",
      }),
    );

    app.use(
      json({
        limit: "1mb",
      }),
    );

    app.use(cookieParser());

    // Winston logging middlewares
    app.use(morganMiddleware);
    app.use(requestLogger);

    app.use(
      session({
        secret: COOKIE_KEY,
        resave: false,
        saveUninitialized: false,
        cookie: {
          secure: false,
          httpOnly: true,
          sameSite: "strict",
        },
      }),
    );

    app.use(passport.initialize());
    app.use(passport.session());

    passportJwtSetup();

    app.use("/api", indexRoutes);

    // Error logging middleware (debe ir después de las rutas)
    app.use(errorLogger);

    // --- INICIO Socket.IO ---
    const server = http.createServer(app);
    const io = new SocketIOServer(server, {
      cors: {
        origin: true,
        credentials: true,
      },
    });
    
    // Asignar la instancia global
    ioInstance = io;
    
    handleSocketConnection(io);
    server.listen(PORT, () => {
      // Banner del servidor
      console.log('\n' + '='.repeat(70));
      console.log('                    SERVIDOR BOMBEROS');
      console.log('                    INICIADO EXITOSAMENTE');
      console.log('='.repeat(70));
      console.log(`URL Principal:     http://${HOST}:${PORT}/api`);
      console.log(`Entorno:           ${process.env.NODE_ENV || 'development'}`);
      console.log(`Iniciado:          ${new Date().toLocaleString('es-CL')}`);
      console.log('='.repeat(70));
      console.log('Estado del Sistema:');
      console.log('• Base de datos:   Conectada y operativa');
      console.log('• Redis:           Configurado para caché y notificaciones');
      console.log('• MinIO:           Configurado para almacenamiento');
      console.log('• WebSocket:       Habilitado para notificaciones en tiempo real');
      console.log('• API REST:        Disponible en /api');
      console.log('='.repeat(70));
      console.log('Sistema completamente operativo y listo para recibir peticiones');
      console.log('='.repeat(70) + '\n');
      
      logger.info(`[SERVER] Servidor corriendo en http://${HOST}:${PORT}/api`);
    });
    // --- FIN Socket.IO ---
  } catch (error) {
    logger.errorWithContext(error, { function: "setupServer" });
  }
}

async function setupAPI() {
  try {
    logger.info("[CONFIG] Iniciando configuración de la API...");

    // Conectar TypeORM (usuarios, roles, permisos)
    await connectDB();
    logger.database("TypeORM conectado exitosamente");

    // Inicializar Redis
    await initializeRedis();
    logger.info("[REDIS] Inicialización completada");

    // Inicializar MinIO
    await initializeMinIO();
    logger.info("[MINIO] Inicialización completada");

    // Inicializar sistema completo de notificaciones (base + WebSocket)
    await initializeNotificationSystem();

    // Configurar datos iniciales
    await crearCompañia();
    await crearRegiones();
    await crearComunas();

    await crearPermisos();
    await crearRoles();
    await crearEstadosCiviles();
    await crearServiciosExternos();
    await crearCarrosPredeterminados();
    
    await crearBomberos();

    await crearClasificacionEmergencia();
    await crearSubTipoIncidente();
    await crearTipoDano();
    await crearfaseIncidente();
    await crearServicios();
    await crearTipoEvento();
    await crearTiposSangre();
    await crearEstadosReporte();
    await inicializarEpp();

    logger.info("[CONFIG] Configuración inicial completada");
    
    // Configurar servidor después de toda la inicialización
    await setupServer();
  } catch (error) {
    logger.errorWithContext(error, { function: "setupAPI" });
    process.exit(1);
  }
}

setupAPI()
  .then(() => {
    logger.info("[SUCCESS] API configurada correctamente");
  })
  .catch((error) => {
    logger.errorWithContext(error, { function: "setupAPI" });
    process.exit(1);
  });

