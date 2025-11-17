"use strict";
import Joi from "joi";

const namePattern = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s'-]+$/;

// Query: soporta búsqueda por nombre y paginación
export const regionQueryValidation = Joi.object({
  search: Joi.string().trim().allow(""),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(200).default(50),
});

// Create
export const regionCreateValidation = Joi.object({
  nombre: Joi.string().min(2).max(100).pattern(namePattern).required().messages({
    "string.base": "El nombre debe ser de tipo string.",
    "string.empty": "El nombre no puede estar vacío.",
      "string.min": "El nombre debe tener como mínimo {#limit} caracteres.",
      "string.max": "El nombre debe tener como máximo {#limit} caracteres.",
      "string.pattern.base": "El nombre solo puede contener letras, espacios, apóstrofes o guiones.",
      "any.required": "El nombre es obligatorio.",
    }),
}).unknown(false);

// Update
export const regionUpdateValidation = Joi.object({
  nombre: Joi.string().min(2).max(100).pattern(namePattern).optional().messages({
      "string.base": "El nombre debe ser de tipo string.",
      "string.empty": "El nombre no puede estar vacío.",
      "string.min": "El nombre debe tener como mínimo {#limit} caracteres.",
      "string.max": "El nombre debe tener como máximo {#limit} caracteres.",
      "string.pattern.base": "El nombre solo puede contener letras, espacios, apóstrofes o guiones.",
    }),
}).min(1).unknown(false);

export default { regionQueryValidation, regionCreateValidation, regionUpdateValidation };
