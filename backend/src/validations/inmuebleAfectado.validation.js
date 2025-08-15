"use strict";
import Joi from "joi";

export const validationBodycreateInmuebleAfectado = Joi.object({
    id: Joi.number()
        .allow(null, '')
        .integer()
        .positive()
        .messages({
            "number.base": "El ID debe ser un número.",
            "number.integer": "El ID debe ser un número entero.",
            "number.positive": "El ID debe ser un número positivo.",
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
    afectado_id: Joi.number()
        .integer()
        .positive()
        .allow(null, '')
        .messages({
            "number.base": "El ID del afectado debe ser un número.",
            "number.integer": "El ID del afectado debe ser un número entero.",
            "number.positive": "El ID del afectado debe ser un número positivo.",
        }),
        tipo_construccion: Joi.string()
        .max(100)
        .messages({
            "string.base": "El tipo de construcción debe ser una cadena de texto.",
            "string.max": "El tipo de construcción no puede exceder 100 caracteres.",
        }),
        daños_vivienda: Joi.string()
        .max(200)
        .messages({
            "string.base": "Los daños a la vivienda deben ser una cadena de texto.",
            "string.max": "Los daños a la vivienda no pueden exceder 200 caracteres.",
        }),
        daños_enseres: Joi.string()
        .max(200)
        .messages({
            "string.base": "Los daños a los enseres deben ser una cadena de texto.",
            "string.max": "Los daños a los enseres no pueden exceder 200 caracteres.",
        }),
        m_2_construccion: Joi.number()
        .integer()
        .positive()
        .allow(null, '')
        .messages({
            "number.base": "Los metros cuadrados de construcción deben ser un número.",
            "number.integer": "Los metros cuadrados de construcción deben ser un número entero.",
            "number.positive": "Los metros cuadrados de construcción deben ser un número positivo.",
        }),
        m_2_afectado: Joi.number()
        .integer()
        .positive()
        .allow(null, '')
        .messages({
            "number.base": "Los metros cuadrados afectados deben ser un número.",
            "number.integer": "Los metros cuadrados afectados deben ser un número entero.",
            "number.positive": "Los metros cuadrados afectados deben ser un número positivo.",
        }),
    })
    