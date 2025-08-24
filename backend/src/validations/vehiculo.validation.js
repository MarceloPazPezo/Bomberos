"use strict";
import Joi from "joi";

export const createVehiculoAfectadoValidation = Joi.object({
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
    propietario_id: Joi.number()
        .integer()
        .positive()
        .allow(null, '')
        .messages({
            "number.base": "El ID del propietario debe ser un número.",
            "number.integer": "El ID del propietario debe ser un número entero.",
            "number.positive": "El ID del propietario debe ser un número positivo.",
        }),
        tipo_vehiculo: Joi.string()
        .max(50)
        .allow(null, '')
        .messages({
            "string.base": "El tipo de vehículo debe ser una cadena de texto.",
            "string.max": "El tipo de vehículo no puede exceder 50 caracteres.",
        }),
    marca: Joi.string()
        .max(50)
        .allow(null, '')
        .messages({
            "string.base": "La marca del vehículo debe ser una cadena de texto.",
            "string.max": "La marca del vehículo no puede exceder 50 caracteres.",
        }),
    modelo: Joi.string()
        .max(50)
        .allow(null, '')
        .messages({
            "string.base": "El modelo del vehículo debe ser una cadena de texto.",
            "string.max": "El modelo del vehículo no puede exceder 50 caracteres.",
        }),
    color: Joi.string()
        .max(30)
        .allow(null, '')
        .messages({
            "string.base": "El color del vehículo debe ser una cadena de texto.",
            "string.max": "El color del vehículo no puede exceder 30 caracteres.",
        }),
    patente: Joi.string()
        .max(20)
        .allow(null, '')
        .messages({
            "string.base": "La patente del vehículo debe ser una cadena de texto.",
            "string.max": "La patente del vehículo no puede exceder 20 caracteres.",
        }),
    conductor_nombres: Joi.string()
        .max(100)
        .allow(null, '')
        .messages({
            "string.base": "El nombre del conductor debe ser una cadena de texto.",
            "string.max": "El nombre del conductor no puede exceder 100 caracteres.",
        }),
    conductor_apellidos: Joi.string()
        .max(100)
        .allow(null, '')
        .messages({
            "string.base": "El apellido del conductor debe ser una cadena de texto.",
            "string.max": "El apellido del conductor no puede exceder 100 caracteres.",
        }),
    conductor_run: Joi.string()
        .max(12)
        .allow(null, '')
        .messages({
            "string.base": "El RUN del conductor debe ser una cadena de texto.",
            "string.max": "El RUN del conductor no puede exceder 12 caracteres.",
        }),
    });

export const updateVehiculoAfectadoValidation = Joi.object({
    id: Joi.number()    
        .integer()
        .positive()
        .required()
        .messages({
            "any.required": "El ID del vehículo es obligatorio.",
            "number.base": "El ID del vehículo debe ser un número.",
            "number.integer": "El ID del vehículo debe ser un número entero.",
            "number.positive": "El ID del vehículo debe ser un número positivo.",
        }),
    parte_id: Joi.number()
        .integer()
        .required()
        .positive()
        .messages({
            "number.base": "El ID del parte debe ser un número.",
            "number.integer": "El ID del parte debe ser un número entero.",
            "number.positive": "El ID del parte debe ser un número positivo.",
        }),
    propietario_id: Joi.number()
        .integer()
        .positive()
        .allow(null, '')
        .messages({
            "number.base": "El ID del propietario debe ser un número.",
            "number.integer": "El ID del propietario debe ser un número entero.",
            "number.positive": "El ID del propietario debe ser un número positivo.",
        }),
    tipo_vehiculo: Joi.string()
        .max(50)
        .allow(null, '')
        .messages({
            "string.base": "El tipo de vehículo debe ser una cadena de texto.",
            "string.max": "El tipo de vehículo no puede exceder 50 caracteres.",
        }),
    marca: Joi.string()
        .max(50)
        .allow(null, '')
        .messages({
            "string.base": "La marca del vehículo debe ser una cadena de texto.",
            "string.max": "La marca del vehículo no puede exceder 50 caracteres.",
        }),
    modelo: Joi.string()
        .max(50)
        .allow(null, '')
        .messages({
            "string.base": "El modelo del vehículo debe ser una cadena de texto.",
            "string.max": "El modelo del vehículo no puede exceder 50 caracteres.",
        }),
    color: Joi.string()
        .max(30)
        .messages({
            "string.base": "El color del vehículo debe ser una cadena de texto.",
            "string.max": "El color del vehículo no puede exceder 30 caracteres.",
        }),
    patente: Joi.string()
        .max(20)
        .allow(null)
        .messages({
            "string.base": "La patente del vehículo debe ser una cadena de texto.",
            "string.max": "La patente del vehículo no puede exceder 20 caracteres.",
        }),
    conductor_nombres: Joi.string()
        .max(100)
        .allow(null)
        .messages({
            "string.base": "El nombre del conductor debe ser una cadena de texto.",
            "string.max": "El nombre del conductor no puede exceder 100 caracteres.",
        }),
    conductor_apellidos: Joi.string()
        .max(100)
        .allow(null)
        .messages({
            "string.base": "El apellido del conductor debe ser una cadena de texto.",
            "string.max": "El apellido del conductor no puede exceder 100 caracteres.",
        }),
    conductor_run: Joi.string()
        .max(12)
        .allow(null)
        .messages({
            "string.base": "El RUN del conductor debe ser una cadena de texto.",
            "string.max": "El RUN del conductor no puede exceder 12 caracteres.",
        }),
});

