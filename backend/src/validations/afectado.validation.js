"use strict";
import Joi from "joi";

export const validationBodycreatePropietario = Joi.object({

    parte_id: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            "any.required": "El ID del parte es obligatorio.",
            "number.base": "El ID del parte debe ser un número.",
            "number.integer": "El ID del parte debe ser un número entero.",
            "number.positive": "El ID del parte debe ser un número positivo.",
        }),
    nombres: Joi.string()
        .max(100)
        .required()
        .messages({
            "any.required": "El nombre es obligatorio.",
            "string.base": "El nombre debe ser una cadena de texto.",
        }),
    apellidos: Joi.string()
        .max(100)
        .required()
        .messages({
            "any.required": "Los apellidos son obligatorios.",
            "string.base": "Los apellidos deben ser una cadena de texto.",
        }),
    run: Joi.string()
        .allow(null, '')
        .max(13)
        .messages({
            "string.base": "El RUN debe ser una cadena de texto.",
            "string.max": "El RUN no puede exceder 13 caracteres.",
        }),
    telefono: Joi.string()
        .pattern(/^\+?[0-9\s-()]{7,20}$/)
        .allow(null, '')
        .messages({
            "string.base": "El teléfono debe ser una cadena de texto.",
            "string.pattern.base": "El teléfono debe ser un número válido de Chile (formato: +569XXXXXXXX o 9XXXXXXXX).",
        }),
    direccion: Joi.string()
        .max(200)
        .allow(null, '')
        .messages({

            "string.base": "La dirección debe ser una cadena de texto.",
            "string.max": "La dirección no puede exceder 200 caracteres.",
        }),
    edad: Joi.number()
        .integer()
        .allow(null, '')
        .min(0)
        .max(120)
        .messages({
            "number.base": "La edad debe ser un número.",
            "number.integer": "La edad debe ser un número entero.",
            "number.min": "La edad no puede ser negativa.",
            "number.max": "La edad no puede exceder 120 años.",
        }),
    estado_civil: Joi.string()
        .max(50)
        .allow(null, '')
        .messages({
            "string.base": "El estado civil debe ser una cadena de texto.",
            "string.max": "El estado civil no puede exceder 50 caracteres.",
        }),
});

export const validationBodyUpdatePropietario = Joi.object({
    id: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            "any.required": "El ID del propietario es obligatorio.",
            "number.base": "El ID del propietario debe ser un número.",
            "number.integer": "El ID del propietario debe ser un número entero.",
            "number.positive": "El ID del propietario debe ser un número positivo.",
        }),

    parte_id: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            "any.required": "El ID del parte es obligatorio.",
            "number.base": "El ID del parte debe ser un número.",
            "number.integer": "El ID del parte debe ser un número entero.",
            "number.positive": "El ID del parte debe ser un número positivo.",
        }),
    nombres: Joi.string()
        .max(100)
        .messages({
           
            "string.base": "El nombre debe ser una cadena de texto.",
        }),
    apellidos: Joi.string()
        .max(100)
        .messages({
            "any.required": "Los apellidos son obligatorios.",
            "string.base": "Los apellidos deben ser una cadena de texto.",
        }),
    run: Joi.string()
        .allow(null, '')
        .max(13)
        .messages({
         
            "string.base": "El RUN debe ser una cadena de texto.",
            "string.max": "El RUN no puede exceder 13 caracteres.",
        }),
    telefono: Joi.string()
        .pattern(/^\+?[0-9\s-()]{7,20}$/)
        .allow(null, '')
        .messages({
            "string.base": "El teléfono debe ser una cadena de texto.",
            "string.pattern.base": "El teléfono debe ser un número válido de Chile (formato: +569XXXXXXXX o 9XXXXXXXX).",
        }),
    direccion: Joi.string()
        .max(200)
        .allow(null, '')
        .messages({
  
            "string.base": "La dirección debe ser una cadena de texto.",
            "string.max": "La dirección no puede exceder 200 caracteres.",
        }),
    edad: Joi.number()
        .integer()
        .allow(null, '')
        .min(0)
        .max(120)
        .messages({
            "number.base": "La edad debe ser un número.",
            "number.integer": "La edad debe ser un número entero.",
            "number.min": "La edad no puede ser negativa.",
            "number.max": "La edad no puede exceder 120 años.",
        }),
    estado_civil: Joi.string()
        .max(50)
        .allow(null, '')
        .messages({

            "string.base": "El estado civil debe ser una cadena de texto.",
            "string.max": "El estado civil no puede exceder 50 caracteres.",
        }),
});