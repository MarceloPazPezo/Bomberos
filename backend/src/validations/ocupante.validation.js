"use strict";
import Joi from "joi";

export const createOcupanteValidation = Joi.object({
    vehiculo_id: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            "any.required": "El ID del vehículo es obligatorio.",
            "number.base": "El ID del vehículo debe ser un número.",
            "number.integer": "El ID del vehículo debe ser un número entero.",
            "number.positive": "El ID del vehículo debe ser un número positivo.",
        }),
    nombres: Joi.string()
        .max(100)
        .allow(null)
        .messages({
            "string.base": "Los nombres deben ser una cadena de texto.",
            "string.max": "Los nombres no pueden exceder 100 caracteres.",
        }),
    apellidos: Joi.string()
        .max(100)
        .allow(null)
        .messages({
            "string.base": "Los apellidos deben ser una cadena de texto.",
            "string.max": "Los apellidos no pueden exceder 100 caracteres.",
        }),
    edad: Joi.number()
        .integer()
        .min(0)
        .max(130)
        .allow(null, '')
        .messages({
            "number.base": "La edad debe ser un número.",
            "number.integer": "La edad debe ser un número entero.",
            "number.min": "La edad no puede ser negativa.",
            "number.max": "La edad no puede exceder 130 años.",
        }),
    run: Joi.string()
        .max(12)
        .allow(null, '')
        .messages({
            "string.base": "El RUN debe ser una cadena de texto.",
            "string.max": "El RUN no puede exceder 12 caracteres.",
        }),
    ocupantes: Joi.string()
        .allow(null, '')
        .messages({
            "string.base": "Las notas adicionales deben ser una cadena de texto.",
        }),
    vinculo: Joi.string()
        .max(100)
        .allow(null, '')
        .messages({
            "string.base": "El vínculo debe ser una cadena de texto.",
            "string.max": "El vínculo no puede exceder 100 caracteres.",
        }),
    gravedad: Joi.string()
        .max(100)
        .allow(null, '')
        .messages({
            "string.base": "La gravedad debe ser una cadena de texto.",
            "string.max": "La gravedad no puede exceder 100 caracteres.",
        }),
});



export const updateOcupanteValidation = Joi.object({
    id: Joi.number()    
        .integer()
        .positive()
        .required()
        .messages({
            "any.required": "El ID del ocupante es obligatorio.",
            "number.base": "El ID del ocupante debe ser un número.",
            "number.integer": "El ID del ocupante debe ser un número entero.",
            "number.positive": "El ID del ocupante debe ser un número positivo.",
        }),
    vehiculo_id: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            "any.required": "El ID del vehículo es obligatorio.",
            "number.base": "El ID del vehículo debe ser un número.",
            "number.integer": "El ID del vehículo debe ser un número entero.",
            "number.positive": "El ID del vehículo debe ser un número positivo.",
        }),
    nombres: Joi.string()
        .max(100)
        .allow(null)
        .messages({
            "string.base": "Los nombres deben ser una cadena de texto.",
            "string.max": "Los nombres no pueden exceder 100 caracteres.",
        }),
    apellidos: Joi.string()
        .max(100)
        .allow(null)
        .messages({
            "string.base": "Los apellidos deben ser una cadena de texto.",
            "string.max": "Los apellidos no pueden exceder 100 caracteres.",
        }),
    edad: Joi.number()
        .integer()
        .min(0)
        .max(130)
        .allow(null, '')
        .messages({
            "number.base": "La edad debe ser un número.",
            "number.integer": "La edad debe ser un número entero.",
            "number.min": "La edad no puede ser negativa.",
            "number.max": "La edad no puede exceder 130 años.",
        }),
    run: Joi.string()
        .max(12)
        .allow(null, '')
        .messages({
            "string.base": "El RUN debe ser una cadena de texto.",
            "string.max": "El RUN no puede exceder 12 caracteres.",
        }),
    ocupantes: Joi.string()
        .allow(null, '')
        .messages({
            "string.base": "Las notas adicionales deben ser una cadena de texto.",
        }),
    vinculo: Joi.string()
        .max(100)
        .allow(null, '')
        .messages({
            "string.base": "El vínculo debe ser una cadena de texto.",
            "string.max": "El vínculo no puede exceder 100 caracteres.",
        }),
    gravedad: Joi.string()
        .max(100)
        .allow(null, '')
        .messages({
            "string.base": "La gravedad debe ser una cadena de texto.",
            "string.max": "La gravedad no puede exceder 100 caracteres.",
        }),
});
