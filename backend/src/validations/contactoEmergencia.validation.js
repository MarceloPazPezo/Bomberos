"use strict";
import Joi from "joi";

export const validationCreateContactoEmergenciaBody = Joi.object({
    usuario_id: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            "any.required": "El ID de usuario es obligatorio.",
            "number.base": "El ID de usuario debe ser un número.",
            "number.integer": "El ID de usuario debe ser un número entero.",
            "number.positive": "El ID de usuario debe ser un número positivo.",
        }),
    nombres: Joi.string()
        .min(3)
        .max(100)
        .required()
        .messages({
            "any.required": "El nombre es obligatorio.",
            "string.base": "El nombre debe ser una cadena de texto.",
            "string.min": "El nombre debe tener al menos 3 caracteres.",
            "string.max": "El nombre no puede exceder 100 caracteres.",
        }),
    apellidos: Joi.string()
        .min(3)
        .max(100)
        .required()
        .messages({
            "any.required": "Los apellidos son obligatorios.",
            "string.base": "Los apellidos deben ser una cadena de texto.",
            "string.min": "Los apellidos deben tener al menos 3 caracteres.",
            "string.max": "Los apellidos no pueden exceder 100 caracteres.",
        }),
    vinculo: Joi.string()
        .min(3)
        .max(100)
        .required()
        .messages({
            "any.required": "El vínculo es obligatorio.",
            "string.base": "El vínculo debe ser una cadena de texto.",
            "string.min": "El vínculo debe tener al menos 3 caracteres.",
            "string.max": "El vínculo no puede exceder 100 caracteres.",
        }),
    telefono: Joi.string()
        .pattern(/^\+?[0-9\s-()]{7,20}$/)
        .messages({
            "string.base": "El teléfono debe ser una cadena de texto.",
            "string.pattern.base": "El teléfono debe ser un número válido de Chile (formato: +569XXXXXXXX o 9XXXXXXXX).",
        }),
    email: Joi.string()
        .email()
        .messages({
            "string.base": "El email debe ser una cadena de texto.",
            "string.email": "El email debe ser válido.",
        }),
})
.or("telefono", "email") 
.messages({
    "object.base": "El cuerpo de la solicitud debe ser un objeto.",
    "object.required": "El cuerpo de la solicitud es obligatorio.",
    "object.missing": "Debe proporcionar al menos teléfono o email.",
});


export const validationUpdateContactoEmergenciaBody = Joi.object({
    usuario_id: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            "any.required": "El ID de usuario es obligatorio.",
            "number.base": "El ID de usuario debe ser un número.",
            "number.integer": "El ID de usuario debe ser un número entero.",
            "number.positive": "El ID de usuario debe ser un número positivo.",
        }),
    nombres: Joi.string()
        .min(3)
        .max(100)
        .required()
        .messages({
            "any.required": "El nombre es obligatorio.",
            "string.base": "El nombre debe ser una cadena de texto.",
            "string.min": "El nombre debe tener al menos 3 caracteres.",
            "string.max": "El nombre no puede exceder 100 caracteres.",
        }),
    apellidos: Joi.string()
        .min(3)
        .max(100)
        .required()
        .messages({
            "any.required": "Los apellidos son obligatorios.",
            "string.base": "Los apellidos deben ser una cadena de texto.",
            "string.min": "Los apellidos deben tener al menos 3 caracteres.",
            "string.max": "Los apellidos no pueden exceder 100 caracteres.",
        }),
    vinculo: Joi.string()
        .min(3)
        .max(100)
        .required()
        .messages({
            "any.required": "El vínculo es obligatorio.",
            "string.base": "El vínculo debe ser una cadena de texto.",
            "string.min": "El vínculo debe tener al menos 3 caracteres.",
            "string.max": "El vínculo no puede exceder 100 caracteres.",
        }),
    telefono: Joi.string()
        .trim()
        .empty('') // permite cadena vacía (o espacios) y la trata como ausente
        .pattern(/^\+?[0-9\s-()]{7,20}$/)
        .messages({
            "string.base": "El teléfono debe ser una cadena de texto.",
            "string.pattern.base": "El teléfono debe ser un número válido de Chile (formato: +569XXXXXXXX o 9XXXXXXXX).",
        }),
    email: Joi.string()
        .trim()
        .empty('') // permite cadena vacía (o espacios) y la trata como ausente
        .email()
        .messages({
            "string.base": "El email debe ser una cadena de texto.",
            "string.email": "El email debe ser válido.",
        }),
})
.or("telefono", "email") // al menos uno debe estar no vacío
.messages({
    "object.base": "El cuerpo de la solicitud debe ser un objeto.",
    "object.required": "El cuerpo de la solicitud es obligatorio.",
    "object.missing": "Debe proporcionar al menos teléfono o email.",
});

