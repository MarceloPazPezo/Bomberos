"use strict";
import Joi from "joi";

/**
 * Esquema de validación para crear una posición
 */
export const posicionCreateSchema = Joi.object({
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
    altitud: Joi.number()
        .min(-500)
        .max(7000)
        .allow(null)
        .messages({
            "number.base": "La altitud debe ser un número",
            "number.min": "La altitud debe ser mayor a -500 metros",
            "number.max": "La altitud debe ser menor a 7000 metros",
        }),
    precision: Joi.number()
        .min(0)
        .max(1000)
        .allow(null)
        .messages({
            "number.base": "La precisión debe ser un número",
            "number.min": "La precisión debe ser un valor positivo",
            "number.max": "La precisión no puede exceder 1000 metros",
        }),
}).messages({
    "object.unknown": "No se permiten propiedades adicionales",
});

/**
 * Esquema de validación para actualizar una posición
 */
export const posicionUpdateSchema = Joi.object({
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
    altitud: Joi.number()
        .min(-500)
        .max(7000)
        .allow(null)
        .messages({
            "number.base": "La altitud debe ser un número",
            "number.min": "La altitud debe ser mayor a -500 metros",
            "number.max": "La altitud debe ser menor a 7000 metros",
        }),
    precision: Joi.number()
        .min(0)
        .max(1000)
        .allow(null)
        .messages({
            "number.base": "La precisión debe ser un número",
            "number.min": "La precisión debe ser un valor positivo",
            "number.max": "La precisión no puede exceder 1000 metros",
        }),
    activo: Joi.boolean()
        .messages({
            "boolean.base": "El estado activo debe ser verdadero o falso",
        }),
})
    .min(1)
    .messages({
        "object.min": "Debe proporcionar al menos un campo para actualizar",
        "object.unknown": "No se permiten propiedades adicionales",
    });

/**
 * Esquema de validación para búsqueda de posiciones cercanas
 */
export const posicionesCercanasQuerySchema = Joi.object({
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
        .default(1000)
        .messages({
            "number.base": "El radio debe ser un número",
            "number.min": "El radio mínimo es 100 metros",
            "number.max": "El radio máximo es 50000 metros (50 km)",
        }),
});

/**
 * Esquema de validación para búsqueda en bounding box
 */
export const boundingBoxQuerySchema = Joi.object({
    minLat: Joi.number()
        .min(-90)
        .max(90)
        .required()
        .messages({
            "number.base": "La latitud mínima debe ser un número",
            "number.min": "La latitud mínima debe estar entre -90 y 90",
            "number.max": "La latitud mínima debe estar entre -90 y 90",
            "any.required": "La latitud mínima es obligatoria",
        }),
    minLng: Joi.number()
        .min(-180)
        .max(180)
        .required()
        .messages({
            "number.base": "La longitud mínima debe ser un número",
            "number.min": "La longitud mínima debe estar entre -180 y 180",
            "number.max": "La longitud mínima debe estar entre -180 y 180",
            "any.required": "La longitud mínima es obligatoria",
        }),
    maxLat: Joi.number()
        .min(-90)
        .max(90)
        .greater(Joi.ref("minLat"))
        .required()
        .messages({
            "number.base": "La latitud máxima debe ser un número",
            "number.min": "La latitud máxima debe estar entre -90 y 90",
            "number.max": "La latitud máxima debe estar entre -90 y 90",
            "number.greater": "La latitud máxima debe ser mayor que la latitud mínima",
            "any.required": "La latitud máxima es obligatoria",
        }),
    maxLng: Joi.number()
        .min(-180)
        .max(180)
        .greater(Joi.ref("minLng"))
        .required()
        .messages({
            "number.base": "La longitud máxima debe ser un número",
            "number.min": "La longitud máxima debe estar entre -180 y 180",
            "number.max": "La longitud máxima debe estar entre -180 y 180",
            "number.greater": "La longitud máxima debe ser mayor que la longitud mínima",
            "any.required": "La longitud máxima es obligatoria",
        }),
});

/**
 * Validación personalizada para coordenadas de Chile
 */
export const validarCoordenadasChile = (lat, lng) => {
    // Chile continental: aproximadamente entre latitudes -17° y -56° y longitudes -66° y -76°
    const enRango = lat >= -56.5 && lat <= -17 && lng >= -76 && lng <= -66;

    if (!enRango) {
        throw new Error(
            "Las coordenadas están fuera del rango de Chile continental"
        );
    }

    return true;
};


