"use strict";
import { DataSource } from "typeorm";
import {
  DATABASE,
  DB_USERNAME,
  DB_HOST,
  PASSWORD,
  NODE_ENV,
  DB_PORT,
} from "./configEnv.js";
import logger from "./logger.js";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: `${DB_HOST}`,
  port: `${DB_PORT}`,
  username: `${DB_USERNAME}`,
  password: `${PASSWORD}`,
  database: `${DATABASE}`,
  entities: ["src/entities/**/*.js"],
  synchronize: true,
  logging: false, // desactivada por defecto
  // logging: NODE_ENV === "development" ? ["query", "error"] : ["error"],
  // logger: "advanced-console",
});

export async function connectDB() {
  try {
    await AppDataSource.initialize();
    logger.database("Conexión exitosa a la base de datos!");
  } catch (error) {
    logger.errorWithContext(error, {
      function: "connectDB",
      database: DATABASE,
      host: DB_HOST,
      port: DB_PORT,
    });
    process.exit(1);
  }
}
