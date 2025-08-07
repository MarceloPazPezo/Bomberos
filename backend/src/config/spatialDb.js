"use strict";
import { Sequelize } from "sequelize";
import {
  DATABASE,
  DB_USERNAME,
  DB_HOST,
  PASSWORD,
  NODE_ENV,
  DB_PORT,
} from "./configEnv.js";
import logger from "./logger.js";

// Configuración de Sequelize para datos geoespaciales
export const spatialSequelize = new Sequelize(DATABASE, DB_USERNAME, PASSWORD, {
  host: DB_HOST,
  port: DB_PORT,
  dialect: "postgres",
  dialectOptions: {
    // Habilitar extensiones PostGIS
    application_name: "spatial_app",
  },
  logging: false, // Desactivar logging por defecto
  // logging:
  //   NODE_ENV === "development"
  //     ? (msg) => logger.debug(`[SEQUELIZE] ${msg}`)
  //     : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  define: {
    // Configuración por defecto para modelos
    timestamps: true,
    underscored: true,
    freezeTableName: true,
  },
});

// Función para conectar y configurar PostGIS
export async function connectSpatialDB() {
  try {
    await spatialSequelize.authenticate();
    logger.database(
      "Conexión a base de datos espacial establecida correctamente.",
    );

    // Habilitar extensión PostGIS si no está habilitada
    await spatialSequelize.query("CREATE EXTENSION IF NOT EXISTS postgis;");
    logger.database("Extensión PostGIS habilitada.");

    return spatialSequelize;
  } catch (error) {
    logger.errorWithContext(error, {
      function: "connectSpatialDB",
      database: DATABASE,
      host: DB_HOST,
      port: DB_PORT,
    });
    throw error;
  }
}

// Función para sincronizar modelos espaciales
export async function syncSpatialModels() {
  try {
    await spatialSequelize.sync({ alter: true });
    logger.database(
      "Modelos espaciales sincronizados correctamente.",
    );
  } catch (error) {
    logger.errorWithContext(error, {
      function: "syncSpatialModels",
      database: DATABASE,
    });
    throw error;
  }
}

export default spatialSequelize;
