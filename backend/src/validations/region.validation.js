"use strict";
import Joi from "joi";

const namePattern = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s'-]+$/;

// 1. Esquema para Parámetros de Consulta (Query)
export const regionQueryValidation = Joi.object({
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
})
  .or("id", "nombre")
  .unknown(false)
  .messages({
    "object.unknown": "No se permiten parámetros de consulta adicionales.",
    "object.missing": "Debes proporcionar al menos un parámetro de búsqueda: id o nombre.",
  });

// 2. Esquema para el Cuerpo de la Solicitud al Crear una Región (Create)
export const regionCreateValidation = Joi.object({
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
})
  .unknown(false)
  .messages({
    "object.unknown": "No se permiten propiedades adicionales en la creación de la región.",
  });

// 3. Esquema para el Cuerpo de la Solicitud al Actualizar una Región (Update)
export const regionUpdateValidation = Joi.object({
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
})
  .min(1)
  .unknown(false)
  .messages({
    "object.min": "Debes proporcionar al menos un campo para actualizar.",
    "object.unknown": "No se permiten propiedades adicionales en la actualización de la región.",
  });

export default {
  regionQueryValidation,
  regionCreateValidation,
  regionUpdateValidation,
};
