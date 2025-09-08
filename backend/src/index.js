"use strict";
// Desarrollo con hot reload activado
import cors from "cors";
import cookieParser from "cookie-parser";
import session from "express-session";
import passport from "passport";
import express, { json, urlencoded } from "express";

import indexRoutes from "./routes/index.routes.js";
import logger from "./config/logger.js";
import {
  morganMiddleware,
  requestLogger,
  errorLogger,
} from "./middlewares/logger.middleware.js";

import { COOKIE_KEY, HOST, PORT } from "./config/configEnv.js";
import { connectDB } from "./config/configDb.js";
import { passportJwtSetup } from "./auth/passport.auth.js";

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

import http from "http";
import { Server as SocketIOServer } from "socket.io";
import { handleSocketConnection } from "./sockets/activeUsers.socket.js";
import { addAbortListener } from "events";
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
    handleSocketConnection(io);
    server.listen(PORT, () => {
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

    await setupServer();
    await crearCompañia();
    await crearRegiones();
    await crearComunas();

    await crearPermisos();
    await crearRoles();
    
    await crearBomberos();

    logger.info("[CONFIG] Configuración inicial completada");
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

