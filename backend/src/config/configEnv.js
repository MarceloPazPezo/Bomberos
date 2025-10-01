"use strict";
import { fileURLToPath } from "url";
import path from "path";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno desde la raíz del proyecto
const envPath = path.resolve(__dirname, `../../../.env`);
dotenv.config({ path: envPath });

const env = process.env.NODE_ENV || "development";

export const HOST = process.env.HOST || process.env.B_HOST || "0.0.0.0";
export const PORT = process.env.PORT || process.env.B_PORT || 3000;
export const DB_HOST = process.env.DB_HOST || "0.0.0.0";
console.log(`[CONFIG] DB_HOST: ${DB_HOST}`);
export const DB_PORT = parseInt(process.env.DB_PORT, 10) || 5432;
console.log(`[CONFIG] DB_PORT: ${DB_PORT}`);
export const DB_USERNAME = process.env.DB_USERNAME;
export const DB_PASSWORD = process.env.PASSWORD || process.env.DB_PASSWORD;
export const DB_NAME = process.env.DATABASE || process.env.DB_NAME;
export const ACCESS_TOKEN_SECRET =
  process.env.ACCESS_TOKEN_SECRET || process.env.B_ACCESS_TOKEN_SECRET;
export const COOKIE_KEY = process.env.COOKIE_KEY || process.env.B_COOKIE_KEY;

// Configuración de MinIO
export const MINIO_ENDPOINT = process.env.MINIO_ENDPOINT || 'localhost';
export const MINIO_PORT = process.env.MINIO_PORT || '9000';
export const MINIO_USE_SSL = process.env.MINIO_USE_SSL || 'false';
export const MINIO_ACCESS_KEY = process.env.MINIO_ACCESS_KEY || 'minioadmin';
export const MINIO_SECRET_KEY = process.env.MINIO_SECRET_KEY || 'minioadmin123';
export const MINIO_BUCKET_NAME = process.env.MINIO_BUCKET_NAME || 'bomberos-uploads';
export const SIGNED_URL_EXPIRY = process.env.SIGNED_URL_EXPIRY || '3600';

export const NODE_ENV = env;

// Validación de seguridad en producción
if (env === "production" && (!ACCESS_TOKEN_SECRET || ACCESS_TOKEN_SECRET.includes("dev"))) {
  throw new Error("Secreto JWT inseguro en producción!");
}
