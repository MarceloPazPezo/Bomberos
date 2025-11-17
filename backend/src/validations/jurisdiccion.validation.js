"use strict";
import Joi from "joi";

/**
 * Esquema para validar una coordenada individual
 */
const coordenadaSchema = Joi.object({
    lat: Joi.number()
        .min(-90)
        .max(90)
        .required()
        .messages({
            "number.base": "La latitud debe ser un número",
            "number.min": "La latitud debe estar entre -90 y 90",
            "number.max": "La latitud debe estar entre -90 y 90",
            "any.required": "La latitud es obligatoria",
        }),
    lng: Joi.number()
        .min(-180)
        .max(180)
        .required()
        .messages({
            "number.base": "La longitud debe ser un número",
            "number.min": "La longitud debe estar entre -180 y 180",
            "number.max": "La longitud debe estar entre -180 y 180",
            "any.required": "La longitud es obligatoria",
        }),
});

/**
 * Esquema de validación para crear una jurisdicción
 */
export const jurisdiccionCreateValidation = Joi.object({
    nombre: Joi.string()
        .min(3)
        .max(255)
        .required()
        .messages({
            "string.empty": "El nombre no puede estar vacío",
            "string.min": "El nombre debe tener al menos 3 caracteres",
            "string.max": "El nombre no puede exceder 255 caracteres",
            "any.required": "El nombre es obligatorio",
        }),
    descripcion: Joi.string()
        .max(1000)
        .allow(null, "")
        .messages({
            "string.max": "La descripción no puede exceder 1000 caracteres",
        }),
    color: Joi.string()
        .pattern(/^#[0-9A-F]{6}$/i)
        .default("#FF0000")
        .messages({
            "string.pattern.base": "El color debe estar en formato hexadecimal (ej: #FF0000)",
        }),
    coordenadas: Joi.array()
        .items(coordenadaSchema)
        .min(4)
        .required()
        .messages({
            "array.min": "Se requieren al menos 4 coordenadas para crear un polígono",
            "any.required": "Las coordenadas son obligatorias",
        }),
    idCompania: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            "number.base": "El ID de la compañía debe ser un número",
            "number.positive": "El ID de la compañía debe ser positivo",
            "any.required": "La compañía es obligatoria",
        }),
}).messages({
    "object.unknown": "No se permiten propiedades adicionales",
});

/**
 * Esquema de validación para actualizar una jurisdicción
 */
export const jurisdiccionUpdateValidation = Joi.object({
    nombre: Joi.string()
        .min(3)
        .max(255)
        .messages({
            "string.empty": "El nombre no puede estar vacío",
            "string.min": "El nombre debe tener al menos 3 caracteres",
            "string.max": "El nombre no puede exceder 255 caracteres",
        }),
    descripcion: Joi.string()
        .max(1000)
        .allow(null, "")
        .messages({
            "string.max": "La descripción no puede exceder 1000 caracteres",
        }),
    color: Joi.string()
        .pattern(/^#[0-9A-F]{6}$/i)
        .messages({
            "string.pattern.base": "El color debe estar en formato hexadecimal (ej: #FF0000)",
        }),
    coordenadas: Joi.array()
        .items(coordenadaSchema)
        .min(4)
        .messages({
            "array.min": "Se requieren al menos 4 coordenadas para crear un polígono",
        }),
    idCompania: Joi.number()
        .integer()
        .positive()
        .messages({
            "number.base": "El ID de la compañía debe ser un número",
            "number.positive": "El ID de la compañía debe ser positivo",
        }),
})
    .min(1)
    .messages({
        "object.min": "Debe proporcionar al menos un campo para actualizar",
        "object.unknown": "No se permiten propiedades adicionales",
    });

/**
 * Esquema de validación para verificar jurisdicción por punto
 */
export const jurisdiccionPorPuntoQueryValidation = Joi.object({
    lat: Joi.number()
        .min(-90)
        .max(90)
        .required()
        .messages({
            "number.base": "La latitud debe ser un número",
            "number.min": "La latitud debe estar entre -90 y 90",
            "number.max": "La latitud debe estar entre -90 y 90",
            "any.required": "La latitud es obligatoria",
        }),
    lng: Joi.number()
        .min(-180)
        .max(180)
        .required()
        .messages({
            "number.base": "La longitud debe ser un número",
            "number.min": "La longitud debe estar entre -180 y 180",
            "number.max": "La longitud debe estar entre -180 y 180",
            "any.required": "La longitud es obligatoria",
        }),
});

