"use strict";
import Joi from "joi";

const namePattern = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s'-]+$/;

// 1. Esquema para Parámetros de Consulta (Query)
export const comunaQueryValidation = Joi.object({
  id: Joi.number().integer().positive().messages({
    "number.base": "El ID debe ser un número.",
    "number.integer": "El ID debe ser un número entero.",
    "number.positive": "El ID debe ser un número positivo.",
  }),
  nombre: Joi.string().min(2).max(100).pattern(namePattern).messages({
    "string.base": "El nombre debe ser de tipo string.",
    "string.min": "El nombre debe tener como mínimo {#limit} caracteres.",
    "string.max": "El nombre debe tener como máximo {#limit} caracteres.",
    "string.pattern.base": "El nombre solo puede contener letras, espacios, apóstrofes o guiones.",
  }),
  idRegion: Joi.number().integer().positive().messages({
    "number.base": "El ID de región debe ser un número.",
    "number.integer": "El ID de región debe ser un número entero.",
    "number.positive": "El ID de región debe ser un número positivo.",
  }),
})
  .or("id", "nombre", "idRegion")
  .unknown(false)
  .messages({
    "object.unknown": "No se permiten parámetros de consulta adicionales.",
    "object.missing": "Debes proporcionar al menos un parámetro de búsqueda: id, nombre o idRegion.",
  });

// 2. Esquema para el Cuerpo de la Solicitud al Crear una Comuna (Create)
export const comunaCreateValidation = Joi.object({
  nombre: Joi.string()
    .min(2)
    .max(100)
    .pattern(namePattern)
    .required()
    .messages({
      "string.base": "El nombre debe ser de tipo string.",
      "string.empty": "El nombre no puede estar vacío.",
      "string.min": "El nombre debe tener como mínimo {#limit} caracteres.",
      "string.max": "El nombre debe tener como máximo {#limit} caracteres.",
      "string.pattern.base": "El nombre solo puede contener letras, espacios, apóstrofes o guiones.",
      "any.required": "El nombre es obligatorio.",
    }),
  idRegion: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      "number.base": "El ID de región debe ser un número.",
      "number.integer": "El ID de región debe ser un número entero.",
      "number.positive": "El ID de región debe ser un número positivo.",
      "any.required": "El ID de región es obligatorio.",
    }),
})
  .unknown(false)
  .messages({
    "object.unknown": "No se permiten propiedades adicionales en la creación de la comuna.",
  });

// 3. Esquema para el Cuerpo de la Solicitud al Actualizar una Comuna (Update)
export const comunaUpdateValidation = Joi.object({
  nombre: Joi.string()
    .min(2)
    .max(100)
    .pattern(namePattern)
    .optional()
    .messages({
      "string.base": "El nombre debe ser de tipo string.",
      "string.empty": "El nombre no puede estar vacío.",
      "string.min": "El nombre debe tener como mínimo {#limit} caracteres.",
      "string.max": "El nombre debe tener como máximo {#limit} caracteres.",
      "string.pattern.base": "El nombre solo puede contener letras, espacios, apóstrofes o guiones.",
    }),
  idRegion: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      "number.base": "El ID de región debe ser un número.",
      "number.integer": "El ID de región debe ser un número entero.",
      "number.positive": "El ID de región debe ser un número positivo.",
    }),
})
  .min(1)
  .unknown(false)
  .messages({
    "object.min": "Debes proporcionar al menos un campo para actualizar.",
    "object.unknown": "No se permiten propiedades adicionales en la actualización de la comuna.",
  });

export default {
  comunaQueryValidation,
  comunaCreateValidation,
  comunaUpdateValidation,
};
