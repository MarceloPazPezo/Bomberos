"use strict";

/**
 * Middleware para limpiar cadenas vacías del body de las requests
 * Convierte cadenas vacías a null para evitar errores de validación en la base de datos
 */
export function cleanEmptyStrings(req, res, next) {
  if (req.body && typeof req.body === 'object') {
    for (const key in req.body) {
      if (req.body[key] === '') {
        req.body[key] = null;
      }
    }
  }
  next();
}