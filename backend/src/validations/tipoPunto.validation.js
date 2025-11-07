"use strict";
import Joi from "joi";

/**
 * Esquema de validación para crear un tipo de punto
 */
export const tipoPuntoCreateValidation = Joi.object({
    nombre: Joi.string()
        .min(3)
        .max(100)
        .required()
        .messages({
            "string.empty": "El nombre no puede estar vacío",
            "string.min": "El nombre debe tener al menos 3 caracteres",
            "string.max": "El nombre no puede exceder 100 caracteres",
            "any.required": "El nombre es obligatorio",
        }),
    icono: Joi.string()
        .max(50)
        .allow(null, "")
        .messages({
            "string.max": "El icono no puede exceder 50 caracteres",
        }),
    color: Joi.string()
        .pattern(/^#[0-9A-F]{6}$/i)
        .allow(null, "")
        .messages({
            "string.pattern.base": "El color debe estar en formato hexadecimal (ej: #FF0000)",
        }),
    descripcion: Joi.string()
        .max(1000)
        .allow(null, "")
        .messages({
            "string.max": "La descripción no puede exceder 1000 caracteres",
        }),
    activo: Joi.boolean()
        .default(true)
        .messages({
            "boolean.base": "El campo activo debe ser verdadero o falso",
        }),
}).messages({
    "object.unknown": "No se permiten propiedades adicionales",
});

/**
 * Esquema de validación para actualizar un tipo de punto
 */
export const tipoPuntoUpdateValidation = Joi.object({
    nombre: Joi.string()
        .min(3)
        .max(100)
        .messages({
            "string.empty": "El nombre no puede estar vacío",
            "string.min": "El nombre debe tener al menos 3 caracteres",
            "string.max": "El nombre no puede exceder 100 caracteres",
        }),
    icono: Joi.string()
        .max(50)
        .allow(null, "")
        .messages({
            "string.max": "El icono no puede exceder 50 caracteres",
        }),
    color: Joi.string()
        .pattern(/^#[0-9A-F]{6}$/i)
        .allow(null, "")
        .messages({
            "string.pattern.base": "El color debe estar en formato hexadecimal (ej: #FF0000)",
        }),
    descripcion: Joi.string()
        .max(1000)
        .allow(null, "")
        .messages({
            "string.max": "La descripción no puede exceder 1000 caracteres",
        }),
    activo: Joi.boolean()
        .messages({
            "boolean.base": "El campo activo debe ser verdadero o falso",
        }),
})
    .min(1)
    .messages({
        "object.min": "Debe proporcionar al menos un campo para actualizar",
        "object.unknown": "No se permiten propiedades adicionales",
    });

