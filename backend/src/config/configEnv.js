"use strict";
import { fileURLToPath } from "url";
import path from "path";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const env = process.env.NODE_ENV || "development";

// En Docker, las variables vienen del docker-compose
// En desarrollo local, intentamos cargar desde archivo .env
if (env !== "production") {
  console.log(`[CONFIG] Cargando variables de entorno desde: .env.${env}`);
  const envFilePath = path.resolve(__dirname, `../../.env.${env}`);
  dotenv.config({ path: envFilePath });

  // Fallback al .env general si no existe el específico
  const generalEnvPath = path.resolve(__dirname, "../../.env");
  dotenv.config({ path: generalEnvPath });
} else {
  console.log(
    `[CONFIG] Modo producción: usando variables de entorno del contenedor`,
  );
}

export const HOST = process.env.HOST || process.env.B_HOST || "0.0.0.0";
export const PORT = process.env.PORT || process.env.B_PORT || 3000;
export const DB_HOST = process.env.DB_HOST || "localhost";
export const DB_PORT = process.env.DB_PORT || 5432;
export const DB_USERNAME = process.env.DB_USERNAME;
export const PASSWORD = process.env.PASSWORD || process.env.DB_PASSWORD;
export const DATABASE = process.env.DATABASE || process.env.DB_NAME;
export const ACCESS_TOKEN_SECRET =
  process.env.ACCESS_TOKEN_SECRET || process.env.B_ACCESS_TOKEN_SECRET;
export const COOKIE_KEY = process.env.COOKIE_KEY || process.env.B_COOKIE_KEY;

export const NODE_ENV = env;

if (env === "production") {
  if (!ACCESS_TOKEN_SECRET || ACCESS_TOKEN_SECRET.includes("dev")) {
    throw new Error("Secreto JWT inseguro en producción!");
  }
}
