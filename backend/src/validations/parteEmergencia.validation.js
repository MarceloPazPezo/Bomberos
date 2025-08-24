"use strict";
import Joi from "joi";

export const validationBodycreateParteEmergencia = Joi.object({
    redactor_id: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            "any.required": "El ID del redactor es obligatorio.",
            "number.base": "El ID del redactor debe ser un número.",
            "number.integer": "El ID del redactor debe ser un número entero.",
            "number.positive": "El ID del redactor debe ser un número positivo.",
        }),
    fecha: Joi.date()
        .required()
        .messages({
            "date.base": "La fecha debe ser una fecha válida.",
        }),
    compañia: Joi.string()
        .max(100)
        .allow(null, "")
        .messages({
            "string.base": "La compañía debe ser una cadena de texto.",
            "string.max": "La compañía no puede exceder 100 caracteres.",
        }),
    tipo_servicio: Joi.string()
        .max(100)
        .allow(null, "")
        .messages({
            "string.base": "El tipo de servicio debe ser una cadena de texto.",
            "string.max": "El tipo de servicio no puede exceder 100 caracteres.",
        }),
    hora_despacho: Joi.string()
        .pattern(/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/)
        .allow(null, "")
        .messages({
            "string.base": "La hora debe ser una cadena de texto.",
            "string.pattern.base": "La hora debe estar en formato HH:mm (24 horas).",
        }),
    hora_6_0: Joi.string()
        .pattern(/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/)
        .allow(null, "")
        .messages({
            "string.base": "La hora debe ser una cadena de texto.",
            "string.pattern.base": "La hora debe estar en formato HH:mm (24 horas).",
        }),
    hora_6_3: Joi.string()
        .pattern(/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/)
        .allow(null, "")
        .messages({
            "string.base": "La hora debe ser una cadena de texto.",
            "string.pattern.base": "La hora debe estar en formato HH:mm (24 horas).",
        }),
    hora_6_9: Joi.string()
        .pattern(/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/)
        .allow(null, "")
        .messages({
            "string.base": "La hora debe ser una cadena de texto.",
            "string.pattern.base": "La hora debe estar en formato HH:mm (24 horas).",
        }),
    hora_6_10: Joi.string()
        .pattern(/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/)
        .allow(null, "")
        .messages({
            "string.base": "La hora debe ser una cadena de texto.",
            "string.pattern.base": "La hora debe estar en formato HH:mm (24 horas).",
        }),
    comuna: Joi.string()
        .max(100)
        .allow(null, "")
        .messages({
            "string.base": "La comuna debe ser una cadena de texto.",
            "string.max": "La comuna no puede exceder 100 caracteres.",
        }),
    direccion: Joi.string()
        .max(255)
        .allow(null, "")
        .messages({
            "string.base": "La dirección debe ser una cadena de texto.",
            "string.max": "La dirección no puede exceder 255 caracteres.",
        }),
    villa_poblacion: Joi.string()
        .max(100)
        .allow(null, "")
        .messages({
            "string.base": "La villa o población debe ser una cadena de texto.",
            "string.max": "La villa o población no puede exceder 100 caracteres.",
        }),
    tipo_incendio: Joi.string()
        .max(100)
        .allow(null, "")
        .messages({
            "string.base": "El tipo de incendio debe ser una cadena de texto.",
            "string.max": "El tipo de incendio no puede exceder 100 caracteres.",
        }),
    fase_alcanzada: Joi.string()
        .max(100)
        .allow(null, "")
        .messages({
            "string.base": "La fase alcanzada debe ser una cadena de texto.",
            "string.max": "La fase alcanzada no puede exceder 100 caracteres.",
        }),
    descripcion_preliminar: Joi.string()
        .max(500)
        .allow(null, "")
        .messages({
            "string.base": "La descripción preliminar debe ser una cadena de texto.",
            "string.max": "La descripción preliminar no puede exceder 500 caracteres.",
        }),
    estado: Joi.string()
        .allow(null, "")
        .max(50)
        .messages({
            "string.base": "El estado debe ser una cadena de texto.",
            "string.max": "El estado no puede exceder 50 caracteres.",
        }),
    km_salida: Joi.number()
        .positive()
        .allow(null, "")
        .messages({
            "number.base": "El km de salida debe ser un número.",
            "number.positive": "El km de salida debe ser un número positivo.",
        }),
    km_llegada: Joi.number()
        .positive()
        .allow(null, "")
        .messages({
            "number.base": "El km de llegada debe ser un número.",
            "number.positive": "El km de llegada debe ser un número positivo.",
        }),
})

export const validationBodyUpdateParteEmergencia = Joi.object({
    id: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            "any.required": "El ID del parte de emergencia es obligatorio.",
            "number.base": "El ID del parte de emergencia debe ser un número.",
            "number.integer": "El ID del parte de emergencia debe ser un número entero.",
            "number.positive": "El ID del parte de emergencia debe ser un número positivo.",
        }),
    redactor_id: Joi.number()
        .integer()
        .positive()
        .messages({
            "number.base": "El ID del redactor debe ser un número.",
            "number.integer": "El ID del redactor debe ser un número entero.",
            "number.positive": "El ID del redactor debe ser un número positivo.",
        }),
    fecha: Joi.date()
        .messages({
            "date.base": "La fecha debe ser una fecha válida.",
        }),
    compañia: Joi.string()
        .max(100)
        .allow(null, "")
        .messages({
            "string.base": "La compañía debe ser una cadena de texto.",
            "string.max": "La compañía no puede exceder 100 caracteres.",
        }),
    tipo_servicio: Joi.string()
        .max(100)
        .allow(null, "")
        .messages({
            "string.base": "El tipo de servicio debe ser una cadena de texto.",
            "string.max": "El tipo de servicio no puede exceder 100 caracteres.",
        }),
    hora_despacho: Joi.string()
        .pattern(/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/)
        .allow(null, "")
        .messages({
            "string.base": "La hora debe ser una cadena de texto.",
            "string.pattern.base": "La hora debe estar en formato HH:mm (24 horas).",
        }),
    hora_6_0: Joi.string()
        .pattern(/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/)
        .allow(null, "")
        .messages({
            "string.base": "La hora debe ser una cadena de texto.",
            "string.pattern.base": "La hora debe estar en formato HH:mm (24 horas).",
        }),
    hora_6_3: Joi.string()
        .pattern(/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/)
        .allow(null, "")
        .messages({
            "string.base": "La hora debe ser una cadena de texto.",
            "string.pattern.base": "La hora debe estar en formato HH:mm (24 horas).",
        }),
    hora_6_9: Joi.string()
        .pattern(/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/)
        .allow(null, "")
        .messages({
            "string.base": "La hora debe ser una cadena de texto.",
            "string.pattern.base": "La hora debe estar en formato HH:mm (24 horas).",
        }),
    hora_6_10: Joi.string()
        .pattern(/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/)
        .allow(null, "")
        .messages({
            "string.base": "La hora debe ser una cadena de texto.",
            "string.pattern.base": "La hora debe estar en formato HH:mm (24 horas).",
        }),
    comuna: Joi.string()
        .max(100)
        .allow(null, "")
        .messages({
            "string.base": "La comuna debe ser una cadena de texto.",
            "string.max": "La comuna no puede exceder 100 caracteres.",
        }),
    direccion: Joi.string()
        .max(255)
        .allow(null, "")
        .messages({
            "string.base": "La dirección debe ser una cadena de texto.",
            "string.max": "La dirección no puede exceder 255 caracteres.",
        }),
    villa_poblacion: Joi.string()
        .max(100)
        .allow(null, "")
        .messages({
            "string.base": "La villa o población debe ser una cadena de texto.",
            "string.max": "La villa o población no puede exceder 100 caracteres.",
        }),
    tipo_incendio: Joi.string()
        .max(100)
        .allow(null, "")
        .messages({
            "string.base": "El tipo de incendio debe ser una cadena de texto.",
            "string.max": "El tipo de incendio no puede exceder 100 caracteres.",
        }),
    fase_alcanzada: Joi.string()
        .max(100)
        .allow(null, "")
        .messages({
            "string.base": "La fase alcanzada debe ser una cadena de texto.",
            "string.max": "La fase alcanzada no puede exceder 100 caracteres.",
        }),
    descripcion_preliminar: Joi.string()
        .max(500)
        .allow(null, "")
        .messages({
            "string.base": "La descripción preliminar debe ser una cadena de texto.",
            "string.max": "La descripción preliminar no puede exceder 500 caracteres.",
        }),
    estado: Joi.string()
        .allow(null, "")
        .max(50)
        .messages({
            "string.base": "El estado debe ser una cadena de texto.",
            "string.max": "El estado no puede exceder 50 caracteres.",
        }),
    km_salida: Joi.number()
        .positive()
        .allow(null, "")
        .messages({
            "number.base": "El km de salida debe ser un número.",
            "number.positive": "El km de salida debe ser un número positivo.",
        }),
    km_llegada: Joi.number()
        .positive()
        .allow(null, "")
        .messages({
            "number.base": "El km de llegada debe ser un número.",
            "number.positive": "El km de llegada debe ser un número positivo.",
        }),
});