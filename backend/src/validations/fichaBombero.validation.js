"use strict";
import Joi from "joi";

export const fichaBomberoCreateValidation = Joi.object({
    licenciaClaseF: Joi.boolean().optional().messages({
        "boolean.base": "Licencia Clase F debe ser un valor booleano."
    }),
    telefono: Joi.string().pattern(/^\+?[0-9\s-()]{7,20}$/).optional().allow(null, "").messages({
        "string.pattern.base": "El formato del teléfono no es válido."
    }),
    fechaNacimiento: Joi.date().iso().optional().allow(null).messages({
        "date.format": "Fecha de nacimiento debe ser una fecha válida (ISO)."
    }),
    fechaIngreso: Joi.date().iso().optional().allow(null).messages({
        "date.format": "Fecha de ingreso debe ser una fecha válida (ISO)."
    }),
    donante: Joi.boolean().optional().messages({
        "boolean.base": "Donante debe ser un valor booleano."
    }),
    idCompania: Joi.number().integer().positive().required().messages({
        "number.base": "ID de compañía debe ser un número.",
        "any.required": "La compañía es obligatoria."
    }),
    idDireccion: Joi.number().integer().positive().optional().allow(null),
    idTipoSangre: Joi.number().integer().positive().optional().allow(null),
    // Campos de imagen (se validan aparte si vienen en multipart o URL)
    fotoPerfilURL: Joi.string().uri().optional().allow(null, ""),
    fotoPerfilKEY: Joi.string().optional().allow(null, "")
}).unknown(false).messages({
    "object.unknown": "No se permiten campos adicionales en la ficha."
});
