"use strict";
import morgan from "morgan";
import logger from "../config/logger.js";
import { NODE_ENV } from "../config/configEnv.js";

// Configuración de Morgan con Winston
const morganFormat =
  NODE_ENV === "development"
    ? ":method :url :status :res[content-length] - :response-time ms"
    : ":remote-addr :method :url :status :res[content-length] - :response-time ms";

// Middleware de Morgan con Winston
export const morganMiddleware = morgan(morganFormat, {
  stream: logger.stream,
});

// Middleware personalizado para logging detallado
export const requestLogger = (req, res, next) => {
  const start = Date.now();

  // Log de request entrante
  logger.http(`Incoming ${req.method} ${req.url}`, {
    method: req.method,
    url: req.url,
    userAgent: req.get("User-Agent"),
    ip: req.ip,
    timestamp: new Date().toISOString(),
  });

  // Interceptar la respuesta
  const originalSend = res.send;
  res.send = function (data) {
    const duration = Date.now() - start;

    // Log de response
    logger.http(`Response ${req.method} ${req.url} ${res.statusCode}`, {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      contentLength: res.get("Content-Length"),
      timestamp: new Date().toISOString(),
    });

    // Log de errores 4xx y 5xx
    if (res.statusCode >= 400) {
      logger.warn(`HTTP Error ${res.statusCode} on ${req.method} ${req.url}`, {
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        userAgent: req.get("User-Agent"),
        ip: req.ip,
      });
    }

    return originalSend.call(this, data);
  };

  next();
};

// Middleware para logging de errores
export const errorLogger = (err, req, res, next) => {
  logger.errorWithContext(err, {
    method: req.method,
    url: req.url,
    userAgent: req.get("User-Agent"),
    ip: req.ip,
    body: req.body,
    params: req.params,
    query: req.query,
  });

  next(err);
};
