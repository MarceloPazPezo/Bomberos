"use strict";
import Joi from "joi";

const incidenteCreateValidation = Joi.object({
    descripcionPreliminar: Joi.string()
        .max(500)
        .allow(null, ''),

    FechaHoraDespacho: Joi.date()
        .allow(null)
        .messages({
            "date.base": "FechaHoraDespacho debe ser una fecha válida",
        }),

    HoraOperativo6_0: Joi.string()
        .pattern(/^([0-1]\d|2[0-3]):([0-5]\d):([0-5]\d)$/)
        .allow(null, '')
        .messages({
            "string.pattern.base": "HoraOperativo6_0 debe estar en formato HH:mm:ss",
        }),
    HoraOperativo6_3: Joi.string()
        .pattern(/^([0-1]\d|2[0-3]):([0-5]\d):([0-5]\d)$/)
        .allow(null, '')
        .messages({
            "string.pattern.base": "HoraOperativo6_3 debe estar en formato HH:mm:ss",
        }),
    HoraOperativo6_9: Joi.string()
        .pattern(/^([0-1]\d|2[0-3]):([0-5]\d):([0-5]\d)$/)
        .allow(null, '')
        .messages({
            "string.pattern.base": "HoraOperativo6_9 debe estar en formato HH:mm:ss",
        }),
    HoraOperativo6_10: Joi.string()
        .pattern(/^([0-1]\d|2[0-3]):([0-5]\d):([0-5]\d)$/)
        .allow(null, '')
        .messages({
            "string.pattern.base": "HoraOperativo6_10 debe estar en formato HH:mm:ss",
        }),
    idBomberoACargo: Joi.number()
        .integer()
        .positive()
        .allow(null)
        .messages({
            "number.base": "idBomberoACargo debe ser un número",
            "number.integer": "idBomberoACargo debe ser un número entero",
            "number.positive": "idBomberoACargo debe ser un número positivo",
        }),
    idSubtipoIncidente: Joi.number()
        .integer()
        .positive()
        .allow(null)
        .messages({
            "number.base": "idSubtipoIncidente debe ser un número",
            "number.integer": "idSubtipoIncidente debe ser un número entero",
            "number.positive": "idSubtipoIncidente debe ser un número positivo",
        }),
    idDireccion: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            "number.base": "idDireccion debe ser un número",
            "number.integer": "idDireccion debe ser un número entero",
            "number.positive": "idDireccion debe ser un número positivo"
            }),
    idRedactor: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            "number.base": "idRedactor debe ser un número",
            "number.integer": "idRedactor debe ser un número entero",
            "number.positive": "idRedactor debe ser un número positivo"
            }),
    idCompania: Joi.number()
        .integer()
        .positive()
        .allow(null)
        .messages({
            "number.base": "idCompania debe ser un número",
            "number.integer": "idCompania debe ser un número entero",
            "number.positive": "idCompania debe ser un número positivo",
        }),
    // Campos de auditoría (opcionales, ignorados si no se usan)
    creadoPor: Joi.number().integer().positive().allow(null),
    actualizadoPor: Joi.number().integer().positive().allow(null)
});




export default { incidenteCreateValidation };