"use strict";
import Joi from "joi";

// Patrón para nombres de compañía (permite más caracteres que nombres de persona)
const companiaNamePattern = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s'-.,&()]+$/;
const phonePattern = /^\+?[0-9\s-()]{7,20}$/;

// 1. Esquema para Parámetros de URL (URL Params)
export const companiaIdParamsValidation = Joi.object({
  id: Joi.number().integer().positive().required().messages({
    "number.base": "El ID debe ser un número.",
    "number.integer": "El ID debe ser un número entero.",
    "number.positive": "El ID debe ser un número positivo.",
    "any.required": "El ID es obligatorio.",
  }),
})
  .unknown(false)
  .messages({
    "object.unknown": "No se permiten parámetros adicionales en la URL.",
  });

// 2. Esquema para Parámetros de Consulta (Query)
export const companiaQueryValidation = Joi.object({
  id: Joi.number().integer().positive().messages({
    "number.base": "El ID debe ser un número.",
    "number.integer": "El ID debe ser un número entero.",
    "number.positive": "El ID debe ser un número positivo.",
  }),
  nombre: Joi.string().min(2).max(255).pattern(companiaNamePattern).messages({
    "string.base": "El nombre debe ser de tipo string.",
    "string.min": "El nombre debe tener como mínimo {#limit} caracteres.",
    "string.max": "El nombre debe tener como máximo {#limit} caracteres.",
    "string.pattern.base": "El nombre contiene caracteres no permitidos.",
  }),
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .messages({
      "string.base": "El correo electrónico debe ser de tipo string.",
      "string.email": "El formato del correo electrónico es inválido.",
    }),
  telefono: Joi.string().pattern(phonePattern).messages({
    "string.base": "El teléfono debe ser de tipo string.",
    "string.pattern.base": "El formato del teléfono es inválido.",
  }),
  // Filtros de paginación
  page: Joi.number().integer().min(1).default(1).messages({
    "number.base": "La página debe ser un número.",
    "number.integer": "La página debe ser un número entero.",
    "number.min": "La página debe ser mayor a 0.",
  }),
  limit: Joi.number().integer().min(1).max(100).default(10).messages({
    "number.base": "El límite debe ser un número.",
    "number.integer": "El límite debe ser un número entero.",
    "number.min": "El límite debe ser mayor a 0.",
    "number.max": "El límite no puede ser mayor a 100.",
  }),
})
  .or("id", "nombre", "email", "telefono", "page", "limit")
  .unknown(false)
  .messages({
    "object.unknown": "No se permiten parámetros de consulta adicionales.",
    "object.missing": "Debes proporcionar al menos un parámetro de búsqueda.",
  });

// 3. Esquema para el Cuerpo de la Solicitud al Crear una Compañía (Create)
export const companiaCreateValidation = Joi.object({
  nombre: Joi.string()
    .min(2)
    .max(255)
    .pattern(companiaNamePattern)
    .required()
    .messages({
      "string.base": "El nombre debe ser de tipo string.",
      "string.empty": "El nombre no puede estar vacío.",
      "string.min": "El nombre debe tener como mínimo {#limit} caracteres.",
      "string.max": "El nombre debe tener como máximo {#limit} caracteres.",
      "string.pattern.base": "El nombre solo puede contener letras, números, espacios y caracteres especiales permitidos.",
      "any.required": "El nombre es obligatorio.",
    }),
  fechaFundacion: Joi.date()
    .max('now')
    .optional()
    .allow(null)
    .messages({
      "date.base": "La fecha de fundación debe ser una fecha válida.",
      "date.max": "La fecha de fundación no puede ser futura.",
    }),
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .max(255)
    .optional()
    .allow(null, "")
    .messages({
      "string.base": "El correo electrónico debe ser de tipo string.",
      "string.email": "El formato del correo electrónico es inválido.",
      "string.max": "El correo electrónico debe tener como máximo {#limit} caracteres.",
    }),
  telefono: Joi.string()
    .pattern(phonePattern)
    .max(50)
    .optional()
    .allow(null, "")
    .messages({
      "string.base": "El teléfono debe ser de tipo string.",
      "string.pattern.base": "El formato del teléfono es inválido.",
      "string.max": "El teléfono debe tener como máximo {#limit} caracteres.",
    }),
  idDireccion: Joi.number()
    .integer()
    .positive()
    .optional()
    .allow(null)
    .messages({
      "number.base": "El ID de dirección debe ser un número.",
      "number.integer": "El ID de dirección debe ser un número entero.",
      "number.positive": "El ID de dirección debe ser un número positivo.",
    }),
  logoURL: Joi.string()
    .uri()
    .max(255)
    .optional()
    .allow(null, "")
    .messages({
      "string.base": "La URL del logo debe ser de tipo string.",
      "string.uri": "La URL del logo debe ser una URL válida.",
      "string.max": "La URL del logo debe tener como máximo {#limit} caracteres.",
    }),
  logoKEY: Joi.string()
    .max(255)
    .optional()
    .allow(null, "")
    .messages({
      "string.base": "La clave del logo debe ser de tipo string.",
      "string.max": "La clave del logo debe tener como máximo {#limit} caracteres.",
    }),
})
  .unknown(false)
  .messages({
    "object.unknown": "No se permiten propiedades adicionales en la creación de la compañía.",
  });

// 4. Esquema para el Cuerpo de la Solicitud al Actualizar una Compañía (Update)
export const companiaUpdateValidation = Joi.object({
  nombre: Joi.string()
    .min(2)
    .max(255)
    .pattern(companiaNamePattern)
    .optional()
    .messages({
      "string.base": "El nombre debe ser de tipo string.",
      "string.empty": "El nombre no puede estar vacío.",
      "string.min": "El nombre debe tener como mínimo {#limit} caracteres.",
      "string.max": "El nombre debe tener como máximo {#limit} caracteres.",
      "string.pattern.base": "El nombre solo puede contener letras, números, espacios y caracteres especiales permitidos.",
    }),
  fechaFundacion: Joi.date()
    .max('now')
    .optional()
    .allow(null)
    .messages({
      "date.base": "La fecha de fundación debe ser una fecha válida.",
      "date.max": "La fecha de fundación no puede ser futura.",
    }),
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .max(255)
    .optional()
    .allow(null, "")
    .messages({
      "string.base": "El correo electrónico debe ser de tipo string.",
      "string.email": "El formato del correo electrónico es inválido.",
      "string.max": "El correo electrónico debe tener como máximo {#limit} caracteres.",
    }),
  telefono: Joi.string()
    .pattern(phonePattern)
    .max(50)
    .optional()
    .allow(null, "")
    .messages({
      "string.base": "El teléfono debe ser de tipo string.",
      "string.pattern.base": "El formato del teléfono es inválido.",
      "string.max": "El teléfono debe tener como máximo {#limit} caracteres.",
    }),
  idDireccion: Joi.number()
    .integer()
    .positive()
    .optional()
    .allow(null)
    .messages({
      "number.base": "El ID de dirección debe ser un número.",
      "number.integer": "El ID de dirección debe ser un número entero.",
      "number.positive": "El ID de dirección debe ser un número positivo.",
    }),
  logoURL: Joi.string()
    .uri()
    .max(255)
    .optional()
    .allow(null, "")
    .messages({
      "string.base": "La URL del logo debe ser de tipo string.",
      "string.uri": "La URL del logo debe ser una URL válida.",
      "string.max": "La URL del logo debe tener como máximo {#limit} caracteres.",
    }),
  logoKEY: Joi.string()
    .max(255)
    .optional()
    .allow(null, "")
    .messages({
      "string.base": "La clave del logo debe ser de tipo string.",
      "string.max": "La clave del logo debe tener como máximo {#limit} caracteres.",
    }),
})
  .min(1)
  .unknown(false)
  .messages({
    "object.min": "Debes proporcionar al menos un campo para actualizar.",
    "object.unknown": "No se permiten propiedades adicionales en la actualización de la compañía.",
  });

export default {
  companiaIdParamsValidation,
  companiaQueryValidation,
  companiaCreateValidation,
  companiaUpdateValidation,
};
