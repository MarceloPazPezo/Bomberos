"use strict";
import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import { NODE_ENV } from "./configEnv.js";

// Configuración de colores para la consola
const colors = {
  error: "red",
  warn: "yellow",
  info: "cyan",
  http: "magenta",
  debug: "white",
};

winston.addColors(colors);

// Formato personalizado para logs
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
);

// Formato para archivos (sin colores)
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
);

// Configuración de transports
const transports = [
  // Console transport
  new winston.transports.Console({
    format: logFormat,
    level: NODE_ENV === "development" ? "debug" : "info",
  }),
];

// Solo agregar archivos de log en producción y desarrollo
if (NODE_ENV !== "test") {
  // Transport para logs generales con rotación diaria
  transports.push(
    new DailyRotateFile({
      filename: "logs/application-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: "14d",
      format: fileFormat,
      level: "info",
    }),
  );

  // Transport para errores con rotación diaria
  transports.push(
    new DailyRotateFile({
      filename: "logs/error-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: "30d",
      format: fileFormat,
      level: "error",
    }),
  );

  // Transport para logs de debug (solo en desarrollo)
  if (NODE_ENV === "development") {
    transports.push(
      new DailyRotateFile({
        filename: "logs/debug-%DATE%.log",
        datePattern: "YYYY-MM-DD",
        zippedArchive: true,
        maxSize: "20m",
        maxFiles: "7d",
        format: fileFormat,
        level: "debug",
      }),
    );
  }
}

// Crear el logger
const logger = winston.createLogger({
  level: NODE_ENV === "development" ? "debug" : "info",
  format: fileFormat,
  transports,
  exitOnError: false,
});

// Función para logging de requests HTTP
logger.http = (message, meta = {}) => {
  logger.log("http", message, meta);
};

// Función para logging de base de datos
logger.database = (message, meta = {}) => {
  logger.info(`[DATABASE] ${message}`, meta);
};

// Función para logging de autenticación
logger.auth = (message, meta = {}) => {
  logger.info(`[AUTH] ${message}`, meta);
};

// Función para logging de errores con contexto
logger.errorWithContext = (error, context = {}) => {
  logger.error(`${error.message}`, {
    stack: error.stack,
    context,
    timestamp: new Date().toISOString(),
  });
};

// Stream para Morgan (middleware de Express)
logger.stream = {
  write: (message) => {
    logger.http(message.trim());
  },
};

export default logger;