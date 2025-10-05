"use strict";
import Joi from "joi";
import logger from '../config/configLogger.js';

/**
 * Validaciones para servicios usando Joi
 */

// Esquema para crear servicio
const createServicioSchema = Joi.object({
  nombre: Joi.string()
    .min(2)
    .max(100)
    .pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/)
    .required()
    .messages({
      'string.empty': 'El nombre del servicio es requerido',
      'string.min': 'El nombre debe tener al menos 2 caracteres',
      'string.max': 'El nombre no puede exceder 100 caracteres',
      'string.pattern.base': 'El nombre solo puede contener letras y espacios. No se permiten números, guiones o símbolos especiales',
      'any.required': 'El nombre del servicio es requerido'
    })
});

// Esquema para actualizar servicio
const updateServicioSchema = Joi.object({
  nombre: Joi.string()
    .min(2)
    .max(100)
    .pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/)
    .required()
    .messages({
      'string.empty': 'El nombre del servicio es requerido',
      'string.min': 'El nombre debe tener al menos 2 caracteres',
      'string.max': 'El nombre no puede exceder 100 caracteres',
      'string.pattern.base': 'El nombre solo puede contener letras y espacios. No se permiten números, guiones o símbolos especiales',
      'any.required': 'El nombre del servicio es requerido'
    })
});

// Esquema para validar ID de parámetro
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

/**
 * Función para validar creación de servicio
 */
export const validateCreateServicio = (data) => {
  const { error, value } = createServicioSchema.validate(data, { 
    abortEarly: false,
    stripUnknown: true 
  });
  
  if (error) {
    logger.warn('Servicio create validation errors:', error.details);
    
    const errorMessages = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message,
      value: detail.context?.value
    }));
    
    return { isValid: false, errors: errorMessages, data: null };
  }
  
  return { isValid: true, errors: null, data: value };
};

/**
 * Función para validar actualización de servicio
 */
export const validateUpdateServicio = (data, params) => {
  // Validar parámetro ID
  const { error: paramError } = idParamSchema.validate(params);
  if (paramError) {
    logger.warn('Servicio update param validation error:', paramError.details);
    return {
      isValid: false,
      errors: paramError.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      })),
      data: null
    };
  }
  
  // Validar body
  const { error, value } = updateServicioSchema.validate(data, { 
    abortEarly: false,
    stripUnknown: true 
  });
  
  if (error) {
    logger.warn('Servicio update validation errors:', error.details);
    
    const errorMessages = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message,
      value: detail.context?.value
    }));
    
    return { isValid: false, errors: errorMessages, data: null };
  }
  
  return { isValid: true, errors: null, data: value };
};

/**
 * Función para validar obtención de servicio por ID
 */
export const validateGetServicioById = (params) => {
  const { error } = idParamSchema.validate(params);
  
  if (error) {
    logger.warn('Servicio get by ID validation error:', error.details);
    
    const errorMessages = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message,
      value: detail.context?.value
    }));
    
    return { isValid: false, errors: errorMessages };
  }
  
  return { isValid: true, errors: null };
};

/**
 * Función para validar eliminación de servicio
 */
export const validateDeleteServicio = (params) => {
  const { error } = idParamSchema.validate(params);
  
  if (error) {
    logger.warn('Servicio delete validation error:', error.details);
    
    const errorMessages = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message,
      value: detail.context?.value
    }));
    
    return { isValid: false, errors: errorMessages };
  }
  
  return { isValid: true, errors: null };
};