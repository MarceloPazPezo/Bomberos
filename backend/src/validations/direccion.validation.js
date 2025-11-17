"use strict";
import Joi from "joi";

const streetPattern = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s'-.,#°]+$/;
const numberPattern = /^[a-zA-Z0-9\s-]+$/;
const postalCodePattern = /^[0-9]{7}$/; // Código postal chileno

// 1. Esquema para Parámetros de Consulta (Query)
export const direccionQueryValidation = Joi.object({
  id: Joi.number().integer().positive().messages({
    "number.base": "El ID debe ser un número.",
    "number.integer": "El ID debe ser un número entero.",
    "number.positive": "El ID debe ser un número positivo.",
  }),
  idComuna: Joi.number().integer().positive().messages({
    "number.base": "El ID de comuna debe ser un número.",
    "number.integer": "El ID de comuna debe ser un número entero.",
    "number.positive": "El ID de comuna debe ser un número positivo.",
  }),
  calle: Joi.string().min(2).max(255).pattern(streetPattern).messages({
    "string.base": "La calle debe ser de tipo string.",
    "string.min": "La calle debe tener como mínimo {#limit} caracteres.",
    "string.max": "La calle debe tener como máximo {#limit} caracteres.",
    "string.pattern.base": "La calle contiene caracteres no permitidos.",
  }),
})
  .or("id", "idComuna", "calle")
  .unknown(false)
  .messages({
    "object.unknown": "No se permiten parámetros de consulta adicionales.",
    "object.missing": "Debes proporcionar al menos un parámetro de búsqueda: id, idComuna o calle.",
  });

// 2. Esquema para el Cuerpo de la Solicitud al Crear una Dirección (Create)
export const direccionCreateValidation = Joi.object({
  calle: Joi.string()
    .min(2)
    .max(255)
    .pattern(streetPattern)
    .required()
    .messages({
      "string.base": "La calle debe ser de tipo string.",
      "string.empty": "La calle no puede estar vacía.",
      "string.min": "La calle debe tener como mínimo {#limit} caracteres.",
      "string.max": "La calle debe tener como máximo {#limit} caracteres.",
      "string.pattern.base": "La calle solo puede contener letras, números, espacios y caracteres especiales permitidos.",
      "any.required": "La calle es obligatoria.",
    }),
  numero: Joi.string()
    .min(1)
    .max(50)
    .pattern(numberPattern)
    .allow(null, "")
    .messages({
      "string.pattern.base": "El número solo puede contener letras, números, espacios y guiones.",
      "any.required": "El número es obligatorio.",
    }),
  depto: Joi.string()
    .max(50)
    .pattern(numberPattern)
    .optional()
    .allow(null, "")
    .messages({
      "string.base": "El departamento debe ser de tipo string.",
      "string.max": "El departamento debe tener como máximo {#limit} caracteres.",
      "string.pattern.base": "El departamento solo puede contener letras, números, espacios y guiones.",
    }),
  referencia: Joi.string()
    .max(255)
    .optional()
    .allow(null, "")
    .messages({
      "string.base": "La referencia debe ser de tipo string.",
      "string.max": "La referencia debe tener como máximo {#limit} caracteres.",
    }),
  codigoPostal: Joi.string()
    .pattern(postalCodePattern)
    .optional()
    .allow(null, "")
    .messages({
      "string.base": "El código postal debe ser de tipo string.",
      "string.pattern.base": "El código postal debe tener 7 dígitos.",
    }),
  creadoPor: Joi.number()
    .integer()
    .positive()
    .optional()
    .allow(null)
    .messages({
      "number.base": "El ID del creador debe ser un número.",
      "number.integer": "El ID del creador debe ser un número entero.",
      "number.positive": "El ID del creador debe ser un número positivo.",
    }),
  actualizadoPor: Joi.number()
    .integer()
    .positive()
    .optional()
    .allow(null)
    .messages({
      "number.base": "El ID del actualizador debe ser un número.",
      "number.integer": "El ID del actualizador debe ser un número entero.",
      "number.positive": "El ID del actualizador debe ser un número positivo.",
    }),
  idComuna: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      "number.base": "El ID de comuna debe ser un número.",
      "number.integer": "El ID de comuna debe ser un número entero.",
      "number.positive": "El ID de comuna debe ser un número positivo.",
      "any.required": "El ID de comuna es obligatorio.",
    }),
})
  .unknown(false)
  .messages({
    "object.unknown": "No se permiten propiedades adicionales en la creación de la dirección.",
  });

// 3. Esquema para el Cuerpo de la Solicitud al Actualizar una Dirección (Update)
export const direccionUpdateValidation = Joi.object({
  calle: Joi.string()
    .min(2)
    .max(255)
    .pattern(streetPattern)
    .optional()
    .messages({
      "string.base": "La calle debe ser de tipo string.",
      "string.empty": "La calle no puede estar vacía.",
      "string.min": "La calle debe tener como mínimo {#limit} caracteres.",
      "string.max": "La calle debe tener como máximo {#limit} caracteres.",
      "string.pattern.base": "La calle solo puede contener letras, números, espacios y caracteres especiales permitidos.",
    }),
  numero: Joi.string()
    .min(1)
    .max(50)
    .pattern(numberPattern)
    .optional()
    .messages({
      "string.base": "El número debe ser de tipo string.",
      "string.empty": "El número no puede estar vacío.",
      "string.min": "El número debe tener como mínimo {#limit} caracteres.",
      "string.max": "El número debe tener como máximo {#limit} caracteres.",
      "string.pattern.base": "El número solo puede contener letras, números, espacios y guiones.",
    }),
  depto: Joi.string()
    .max(50)
    .pattern(numberPattern)
    .optional()
    .allow(null, "")
    .messages({
      "string.base": "El departamento debe ser de tipo string.",
      "string.max": "El departamento debe tener como máximo {#limit} caracteres.",
      "string.pattern.base": "El departamento solo puede contener letras, números, espacios y guiones.",
    }),
  referencia: Joi.string()
    .max(255)
    .optional()
    .allow(null, "")
    .messages({
      "string.base": "La referencia debe ser de tipo string.",
      "string.max": "La referencia debe tener como máximo {#limit} caracteres.",
    }),
  codigoPostal: Joi.string()
    .pattern(postalCodePattern)
    .optional()
    .allow(null, "")
    .messages({
      "string.base": "El código postal debe ser de tipo string.",
      "string.pattern.base": "El código postal debe tener 7 dígitos.",
    }),
  actualizadoPor: Joi.number()
    .integer()
    .positive()
    .optional()
    .allow(null)
    .messages({
      "number.base": "El ID del actualizador debe ser un número.",
      "number.integer": "El ID del actualizador debe ser un número entero.",
      "number.positive": "El ID del actualizador debe ser un número positivo.",
    }),
  idComuna: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      "number.base": "El ID de comuna debe ser un número.",
      "number.integer": "El ID de comuna debe ser un número entero.",
      "number.positive": "El ID de comuna debe ser un número positivo.",
    }),
})
  .min(1)
  .unknown(false)
  .messages({
    "object.min": "Debes proporcionar al menos un campo para actualizar.",
    "object.unknown": "No se permiten propiedades adicionales en la actualización de la dirección.",
  });

export default {
  direccionQueryValidation,
  direccionCreateValidation,
  direccionUpdateValidation,
};
