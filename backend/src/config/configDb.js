"use strict";
import { DataSource } from "typeorm";
import {
  DB_NAME,
  DB_HOST,
  DB_PORT,
  DB_USERNAME,
  DB_PASSWORD,
  NODE_ENV,
} from "./configEnv.js";
import logger from "./configLogger.js";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: `${DB_HOST}`,
  port: `${DB_PORT}`,
  username: `${DB_USERNAME}`,
  password: `${DB_PASSWORD}`,
  database: `${DB_NAME}`,
  entities: ["src/entities/**/*.js"],
  synchronize: true,
  logging: true, // desactivada por defecto   logging: ["error", "warn", "query", "schema"],
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
      database: DB_NAME,
      host: DB_HOST,
      port: DB_PORT,
    });
    process.exit(1);
  }
}
