"use strict";
import Joi from "joi";

export const validationBodycreateOtroInmuebleAfectado = Joi.object({
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

    direccion: Joi.string()
        .max(255)
        .required()
        .messages({
            "string.base": "La dirección debe ser una cadena de texto.",
            "string.max": "La dirección no puede exceder 255 caracteres.",
            "any.required": "La dirección es obligatoria.",
        }),
    nombres: Joi.string()
        .max(100)
        .allow(null, '')
        .messages({
            "string.base": "Los nombres deben ser una cadena de texto.",
            "string.max": "Los nombres no pueden exceder 100 caracteres.",
        }),
    apellidos: Joi.string()
        .max(100)
        .allow(null, '')
        .messages({
            "string.base": "Los apellidos deben ser una cadena de texto.",
            "string.max": "Los apellidos no pueden exceder 100 caracteres.",
        }),
    run: Joi.string()
        .max(13)
        .allow(null, '')
        .messages({
            "string.base": "El RUN debe ser una cadena de texto.",
            "string.max": "El RUN no puede exceder 13 caracteres.",
        }),
    edad: Joi.number()
        .integer()
        .positive()
        .allow(null, '')
        .messages({
            "number.base": "La edad debe ser un número.",
            "number.integer": "La edad debe ser un número entero.",
            "number.positive": "La edad debe ser un número positivo.",
        }),
    estado_civil: Joi.string()
        .max(50)
        .allow(null, '')
        .messages({
            "string.base": "El estado civil debe ser una cadena de texto.",
            "string.max": "El estado civil no puede exceder 50 caracteres.",
        }),
    });
    

export const validationBodyUpdateOtroInmuebleAfectado = Joi.object({
    id: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            "any.required": "El ID es obligatorio.",
            "number.base": "El ID debe ser un número.",
            "number.integer": "El ID debe ser un número entero.",
            "number.positive": "El ID debe ser un número positivo.",
        }),
    parte_id: Joi.number()
        .integer()
        .positive()
        .messages({
            "number.base": "El ID del parte debe ser un número.",
            "number.integer": "El ID del parte debe ser un número entero.",
            "number.positive": "El ID del parte debe ser un número positivo.",
        }),
    propietario_id: Joi.number()
        .integer()
        .positive()
        .allow(null, '')
        .messages({
            "number.base": "El ID del propietario debe ser un número.",
            "number.integer": "El ID del propietario debe ser un número entero.",
            "number.positive": "El ID del propietario debe ser un número positivo.",
        }),
    direccion: Joi.string()
        .max(255)
        .messages({
            "string.base": "La dirección debe ser una cadena de texto.",
            "string.max": "La dirección no puede exceder 255 caracteres.",
        }),
});

