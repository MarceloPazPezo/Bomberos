"use strict";
import Joi from "joi";

const tipoEventoNamePattern = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s-_]+$/;

// 1. Esquema para Parámetros de Consulta (Query) para TipoEvento
export const tipoEventoQueryValidation = Joi.object({
  id: Joi.number().integer().positive().messages({
    "number.base": "El ID del tipo de evento debe ser un número.",
    "number.integer": "El ID del tipo de evento debe ser un número entero.",
    "number.positive": "El ID del tipo de evento debe ser un número positivo.",
  }),
  nombre: Joi.string().min(2).max(100).pattern(tipoEventoNamePattern).messages({
    "string.base": "El nombre del tipo de evento debe ser de tipo string.",
    "string.min":
      "El nombre del tipo de evento debe tener como mínimo {#limit} caracteres.",
    "string.max":
      "El nombre del tipo de evento debe tener como máximo {#limit} caracteres.",
    "string.pattern.base":
      "El nombre del tipo de evento contiene caracteres no permitidos.",
  }),
})
  .or("id", "nombre")
  .unknown(false)
  .messages({
    "object.unknown":
      "No se permiten parámetros de consulta adicionales para tipo de evento.",
    "object.missing":
      "Debes proporcionar al menos un parámetro de búsqueda para tipo de evento: id o nombre.",
  });

// 2. Esquema para el Cuerpo de la Solicitud al Crear un TipoEvento (Create)
export const tipoEventoCreateValidation = Joi.object({
  nombre: Joi.string()
    .min(2)
    .max(100)
    .pattern(tipoEventoNamePattern)
    .required()
    .messages({
      "string.base": "El nombre del tipo de evento debe ser de tipo string.",
      "string.empty": "El nombre del tipo de evento no puede estar vacío.",
      "string.min":
        "El nombre del tipo de evento debe tener como mínimo {#limit} caracteres.",
      "string.max":
        "El nombre del tipo de evento debe tener como máximo {#limit} caracteres.",
      "string.pattern.base":
        "El nombre del tipo de evento solo puede contener letras, números, espacios, guiones o guiones bajos.",
      "any.required": "El nombre del tipo de evento es obligatorio.",
    }),
  descripcion: Joi.string()
    .max(500)
    .optional()
    .allow(null, "")
    .messages({
      "string.base": "La descripción del tipo de evento debe ser de tipo string.",
      "string.max":
        "La descripción del tipo de evento debe tener como máximo {#limit} caracteres.",
    }),
})
  .unknown(false)
  .messages({
    "object.unknown":
      "No se permiten propiedades adicionales en la creación del tipo de evento.",
  });

// 3. Esquema para el Cuerpo de la Solicitud al Actualizar un TipoEvento (Update)
export const tipoEventoBodyValidation = Joi.object({
  nombre: Joi.string()
    .min(2)
    .max(100)
    .pattern(tipoEventoNamePattern)
    .optional()
    .messages({
      "string.base": "El nombre del tipo de evento debe ser de tipo string.",
      "string.min":
        "El nombre del tipo de evento debe tener como mínimo {#limit} caracteres.",
      "string.max":
        "El nombre del tipo de evento debe tener como máximo {#limit} caracteres.",
      "string.pattern.base":
        "El nombre del tipo de evento solo puede contener letras, números, espacios, guiones o guiones bajos.",
    }),
  descripcion: Joi.string()
    .max(500)
    .optional()
    .allow(null, "")
    .messages({
      "string.base": "La descripción del tipo de evento debe ser de tipo string.",
      "string.max":
        "La descripción del tipo de evento debe tener como máximo {#limit} caracteres.",
    }),
})
  .or("nombre", "descripcion")
  .unknown(false)
  .messages({
    "object.unknown":
      "No se permiten propiedades adicionales en la actualización del tipo de evento.",
    "object.missing":
      "Debes proporcionar al menos un campo para actualizar (nombre o descripcion).",
  });

