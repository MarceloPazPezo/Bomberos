"use strict";
import Joi from "joi";

// 1. Esquema para crear disponibilidad
export const disponibilidadCreateValidation = Joi.object({
  idBombero: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      "number.base": "El idBombero debe ser un número.",
      "number.integer": "El idBombero debe ser un número entero.",
      "number.positive": "El idBombero debe ser un número positivo.",
      "any.required": "El idBombero es obligatorio.",
    }),
  fechaInicio: Joi.date()
    .iso()
    .default(() => new Date())
    .messages({
      "date.base": "La fecha de inicio debe ser una fecha válida.",
      "date.format": "La fecha de inicio debe estar en formato ISO.",
    }),
  fechaTermino: Joi.date()
    .iso()
    .allow(null)
    .min(Joi.ref('fechaInicio'))
    .messages({
      "date.base": "La fecha de término debe ser una fecha válida.",
      "date.format": "La fecha de término debe estar en formato ISO.",
      "date.min": "La fecha de término debe ser posterior a la fecha de inicio.",
    }),
})
.custom((value, helpers) => {
  const { fechaInicio, fechaTermino } = value;
  if (fechaTermino && fechaInicio && new Date(fechaTermino) <= new Date(fechaInicio)) {
    return helpers.error('date.fechaTermino.invalid');
  }
  return value;
}, 'Validación de rango de fechas')
.messages({
  "object.unknown": "No se permiten propiedades adicionales.",
  "date.fechaTermino.invalid": "La fecha de término debe ser posterior a la fecha de inicio.",
});

// 2. Esquema para cerrar disponibilidad
export const disponibilidadCerrarValidation = Joi.object({
  idBombero: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      "number.base": "El idBombero debe ser un número.",
      "number.integer": "El idBombero debe ser un número entero.",
      "number.positive": "El idBombero debe ser un número positivo.",
      "any.required": "El idBombero es obligatorio para cerrar disponibilidad.",
    }),
}).messages({
  "object.unknown": "No se permiten propiedades adicionales.",
});

// 3. Esquemas para consultas (mantener para compatibilidad)
export const disponibilidadQueryValidation = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .messages({
      "number.base": "El ID debe ser un número.",
      "number.integer": "El ID debe ser un número entero.",
      "number.positive": "El ID debe ser un número positivo.",
    }),
  idBombero: Joi.number()
    .integer()
    .positive()
    .messages({
      "number.base": "El idBombero debe ser un número.",
      "number.integer": "El idBombero debe ser un número entero.",
      "number.positive": "El idBombero debe ser un número positivo.",
    }),
}).messages({
  "object.unknown": "No se permiten propiedades adicionales.",
});

// 5. Validaciones específicas para parámetros URL
export const disponibilidadIdParamsValidation = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      "number.base": "El ID debe ser un número.",
      "number.integer": "El ID debe ser un número entero.",
      "number.positive": "El ID debe ser un número positivo.",
      "any.required": "El ID es obligatorio en la URL.",
    }),
}).unknown(false);

export const disponibilidadBomberoParamsValidation = Joi.object({
  idBombero: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      "number.base": "El idBombero debe ser un número.",
      "number.integer": "El idBombero debe ser un número entero.",
      "number.positive": "El idBombero debe ser un número positivo.",
      "any.required": "El idBombero es obligatorio en la URL.",
    }),
}).unknown(false);

// Mantener para compatibilidad (pero se recomienda usar los específicos arriba)
export const disponibilidadBodyValidation = disponibilidadCreateValidation;