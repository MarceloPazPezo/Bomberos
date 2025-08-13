"use strict";
import Joi from "joi";

export const disponibilidadBodyValidation = Joi.object({
  usuario_id: Joi.number()
    .integer()
    .positive()
    .messages({
      "number.base": "El usuario_id debe ser un número.",
      "number.integer": "El usuario_id debe ser un número entero.",
      "number.positive": "El usuario_id debe ser un número positivo.",
    }),
  estado: Joi.string()
    .valid('disponible', 'no_disponible', 'en_servicio', 'cerrar_estado')
    .messages({
      "string.base": "El estado debe ser una cadena de texto.",
      "any.only": "El estado debe ser uno de: disponible, no_disponible, en_servicio, cerrar_estado.",
    }),
  fecha_inicio: Joi.date()
    .iso()
    .messages({
      "date.base": "La fecha de inicio debe ser una fecha válida.",
      "date.format": "La fecha de inicio debe estar en formato ISO.",
    }),
  fecha_termino: Joi.date()
    .iso()
    .allow(null)
    .messages({
      "date.base": "La fecha de término debe ser una fecha válida.",
      "date.format": "La fecha de término debe estar en formato ISO.",
    }),
  rol_servicio: Joi.string()
    .valid('Maquinista', 'Tripulante')
    .allow(null, '')
    .messages({
      "string.base": "El rol de servicio debe ser una cadena de texto.",
      "any.only": "El rol de servicio debe ser uno de: Maquinista, Tripulante.",
    }),
}).messages({
  "object.unknown": "No se permiten propiedades adicionales.",
});

export const disponibilidadQueryValidation = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .messages({
      "number.base": "El ID debe ser un número.",
      "number.integer": "El ID debe ser un número entero.",
      "number.positive": "El ID debe ser un número positivo.",
    }),
  usuario_id: Joi.number()
    .integer()
    .positive()
    .messages({
      "number.base": "El usuario_id debe ser un número.",
      "number.integer": "El usuario_id debe ser un número entero.",
      "number.positive": "El usuario_id debe ser un número positivo.",
    }),
  estado: Joi.string()
    .valid('disponible', 'no_disponible', 'en_servicio')
    .messages({
      "string.base": "El estado debe ser una cadena de texto.",
      "any.only": "El estado debe ser uno de: disponible, no_disponible, en_servicio.",
    }),
  rol_servicio: Joi.string()
    .valid('Maquinista', 'Tripulante')
    .allow(null, '')
    .messages({
      "string.base": "El rol de servicio debe ser una cadena de texto.",
      "any.only": "El rol de servicio debe ser uno de: Maquinista, Tripulante.",
    }),
}).messages({
  "object.unknown": "No se permiten propiedades adicionales.",
});