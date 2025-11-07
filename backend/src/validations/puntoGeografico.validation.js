"use strict";
import Joi from "joi";

/**
 * Esquema de validación para crear un punto geográfico
 */
export const puntoGeograficoCreateValidation = Joi.object({
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
    idTipoPunto: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            "number.base": "El ID del tipo de punto debe ser un número",
            "number.positive": "El ID del tipo de punto debe ser positivo",
            "any.required": "El tipo de punto es obligatorio",
        }),
    idCompania: Joi.number()
        .integer()
        .positive()
        .allow(null)
        .messages({
            "number.base": "El ID de la compañía debe ser un número",
            "number.positive": "El ID de la compañía debe ser positivo",
        }),
    estado: Joi.string()
        .valid("BUENO", "MALO", "REGULAR", "FUERA_DE_SERVICIO")
        .default("BUENO")
        .messages({
            "any.only": "El estado debe ser: BUENO, MALO, REGULAR o FUERA_DE_SERVICIO",
        }),
}).messages({
    "object.unknown": "No se permiten propiedades adicionales",
});

/**
 * Esquema de validación para actualizar un punto geográfico
 */
export const puntoGeograficoUpdateValidation = Joi.object({
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
    lat: Joi.number()
        .min(-90)
        .max(90)
        .messages({
            "number.base": "La latitud debe ser un número",
            "number.min": "La latitud debe estar entre -90 y 90",
            "number.max": "La latitud debe estar entre -90 y 90",
        }),
    lng: Joi.number()
        .min(-180)
        .max(180)
        .messages({
            "number.base": "La longitud debe ser un número",
            "number.min": "La longitud debe estar entre -180 y 180",
            "number.max": "La longitud debe estar entre -180 y 180",
        }),
    idTipoPunto: Joi.number()
        .integer()
        .positive()
        .messages({
            "number.base": "El ID del tipo de punto debe ser un número",
            "number.positive": "El ID del tipo de punto debe ser positivo",
        }),
    idCompania: Joi.number()
        .integer()
        .positive()
        .allow(null)
        .messages({
            "number.base": "El ID de la compañía debe ser un número",
            "number.positive": "El ID de la compañía debe ser positivo",
        }),
    estado: Joi.string()
        .valid("BUENO", "MALO", "REGULAR", "FUERA_DE_SERVICIO")
        .messages({
            "any.only": "El estado debe ser: BUENO, MALO, REGULAR o FUERA_DE_SERVICIO",
        }),
})
    .min(1)
    .messages({
        "object.min": "Debe proporcionar al menos un campo para actualizar",
        "object.unknown": "No se permiten propiedades adicionales",
    });

/**
 * Esquema de validación para búsqueda de puntos cercanos
 */
export const puntosCercanosQueryValidation = Joi.object({
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
    radio: Joi.number()
        .min(100)
        .max(50000)
        .default(5000)
        .messages({
            "number.base": "El radio debe ser un número",
            "number.min": "El radio mínimo es 100 metros",
            "number.max": "El radio máximo es 50000 metros (50 km)",
        }),
});

