"use strict";
import Joi from "joi";
import logger from '../config/configLogger.js';

// Esquema para crear carro
const createCarroSchema = Joi.object({
  patente: Joi.string()
    .min(2)
    .max(20)
    .pattern(/^[A-Z0-9\s-]+$/)
    .required()
    .messages({
      'string.empty': 'La patente es requerida',
      'string.min': 'La patente debe tener al menos 2 caracteres',
      'string.max': 'La patente no puede exceder 20 caracteres',
      'string.pattern.base': 'La patente solo puede contener letras mayúsculas, números, espacios y guiones',
      'any.required': 'La patente es requerida'
    }),
  capacidadPasajeros: Joi.number()
    .integer()
    .min(1)
    .max(50)
    .allow(null)
    .messages({
      'number.base': 'La capacidad de pasajeros debe ser un número',
      'number.integer': 'La capacidad de pasajeros debe ser un número entero',
      'number.min': 'La capacidad de pasajeros debe ser al menos 1',
      'number.max': 'La capacidad de pasajeros no puede exceder 50'
    }),
  idCompania: Joi.number()
    .integer()
    .min(1)
    .required()
    .messages({
      'number.base': 'El ID de compañía debe ser un número',
      'number.integer': 'El ID de compañía debe ser un número entero',
      'number.min': 'El ID de compañía debe ser un número positivo',
      'any.required': 'El ID de compañía es requerido'
    })
});

// Esquema para actualizar carro
const updateCarroSchema = Joi.object({
  patente: Joi.string()
    .min(2)
    .max(20)
    .pattern(/^[A-Z0-9\s-]+$/)
    .required()
    .messages({
      'string.empty': 'La patente es requerida',
      'string.min': 'La patente debe tener al menos 2 caracteres',
      'string.max': 'La patente no puede exceder 20 caracteres',
      'string.pattern.base': 'La patente solo puede contener letras mayúsculas, números, espacios y guiones',
      'any.required': 'La patente es requerida'
    }),
  capacidadPasajeros: Joi.number()
    .integer()
    .min(1)
    .max(50)
    .allow(null)
    .messages({
      'number.base': 'La capacidad de pasajeros debe ser un número',
      'number.integer': 'La capacidad de pasajeros debe ser un número entero',
      'number.min': 'La capacidad de pasajeros debe ser al menos 1',
      'number.max': 'La capacidad de pasajeros no puede exceder 50'
    }),
  idCompania: Joi.number()
    .integer()
    .min(1)
    .required()
    .messages({
      'number.base': 'El ID de compañía debe ser un número',
      'number.integer': 'El ID de compañía debe ser un número entero',
      'number.min': 'El ID de compañía debe ser un número positivo',
      'any.required': 'El ID de compañía es requerido'
    })
});

// Esquema para validar ID en parámetros
const idParamSchema = Joi.object({
  id: Joi.number()
    .integer()
    .min(1)
    .required()
    .messages({
      'number.base': 'El ID debe ser un número',
      'number.integer': 'El ID debe ser un número entero',
      'number.min': 'El ID debe ser un número positivo',
      'any.required': 'El ID es requerido'
    })
});

// Función para validar creación de carro
export const validateCreateCarro = (data) => {
  const { error, value } = createCarroSchema.validate(data, { abortEarly: false, stripUnknown: true });
  if (error) {
    return { isValid: false, errors: error.details.map(detail => ({ field: detail.path.join('.'), message: detail.message })) };
  }
  return { isValid: true, data: value };
};

// Función para validar actualización de carro
export const validateUpdateCarro = (data) => {
  const { error, value } = updateCarroSchema.validate(data, { abortEarly: false, stripUnknown: true });
  if (error) {
    return { isValid: false, errors: error.details.map(detail => ({ field: detail.path.join('.'), message: detail.message })) };
  }
  return { isValid: true, data: value };
};

// Función para validar eliminación de carro
export const validateDeleteCarro = (params) => {
  const { error, value } = idParamSchema.validate(params);
  if (error) {
    return { isValid: false, errors: error.details.map(detail => ({ field: detail.path.join('.'), message: detail.message })) };
  }
  return { isValid: true, data: value };
};
