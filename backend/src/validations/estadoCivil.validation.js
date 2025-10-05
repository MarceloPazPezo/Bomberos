"use strict";
import Joi from "joi";
import logger from '../config/configLogger.js';

/**
 * Validaciones para estados civiles usando Joi
 */

// Esquema para crear estado civil
const createEstadoCivilSchema = Joi.object({
  nombre: Joi.string()
    .min(2)
    .max(50)
    .pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/)
    .required()
    .messages({
      'string.empty': 'El nombre del estado civil es requerido',
      'string.min': 'El nombre debe tener al menos 2 caracteres',
      'string.max': 'El nombre no puede exceder 50 caracteres',
      'string.pattern.base': 'El nombre solo puede contener letras y espacios. No se permiten números, guiones o símbolos especiales',
      'any.required': 'El nombre del estado civil es requerido'
    })
});

// Esquema para actualizar estado civil
const updateEstadoCivilSchema = Joi.object({
  nombre: Joi.string()
    .min(2)
    .max(50)
    .pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/)
    .required()
    .messages({
      'string.empty': 'El nombre del estado civil es requerido',
      'string.min': 'El nombre debe tener al menos 2 caracteres',
      'string.max': 'El nombre no puede exceder 50 caracteres',
      'string.pattern.base': 'El nombre solo puede contener letras y espacios. No se permiten números, guiones o símbolos especiales',
      'any.required': 'El nombre del estado civil es requerido'
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
 * Middleware para validar creación de estado civil
 */
export const validateCreateEstadoCivil = (req, res, next) => {
  const { error, value } = createEstadoCivilSchema.validate(req.body, { 
    abortEarly: false,
    stripUnknown: true 
  });
  
  if (error) {
    logger.warn('EstadoCivil create validation errors:', error.details);
    
    const errorMessages = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message,
      value: detail.context?.value
    }));
    
    return res.status(400).json({
      success: false,
      message: 'Errores de validación',
      errors: errorMessages
    });
  }
  
  req.body = value;
  next();
};

/**
 * Middleware para validar actualización de estado civil
 */
export const validateUpdateEstadoCivil = (req, res, next) => {
  // Validar parámetro ID
  const { error: paramError } = idParamSchema.validate(req.params);
  if (paramError) {
    logger.warn('EstadoCivil update param validation error:', paramError.details);
    return res.status(400).json({
      success: false,
      message: 'Error de validación en parámetros',
      errors: paramError.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }))
    });
  }
  
  // Validar body
  const { error, value } = updateEstadoCivilSchema.validate(req.body, { 
    abortEarly: false,
    stripUnknown: true 
  });
  
  if (error) {
    logger.warn('EstadoCivil update validation errors:', error.details);
    
    const errorMessages = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message,
      value: detail.context?.value
    }));
    
    return res.status(400).json({
      success: false,
      message: 'Errores de validación',
      errors: errorMessages
    });
  }
  
  req.body = value;
  next();
};

/**
 * Middleware para validar obtención de estado civil por ID
 */
export const validateGetEstadoCivilById = (req, res, next) => {
  const { error } = idParamSchema.validate(req.params);
  
  if (error) {
    logger.warn('EstadoCivil get by ID validation error:', error.details);
    
    const errorMessages = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message,
      value: detail.context?.value
    }));
    
    return res.status(400).json({
      success: false,
      message: 'Error de validación en parámetros',
      errors: errorMessages
    });
  }
  
  next();
};

/**
 * Middleware para validar eliminación de estado civil
 */
export const validateDeleteEstadoCivil = (req, res, next) => {
  const { error } = idParamSchema.validate(req.params);
  
  if (error) {
    logger.warn('EstadoCivil delete validation error:', error.details);
    
    const errorMessages = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message,
      value: detail.context?.value
    }));
    
    return res.status(400).json({
      success: false,
      message: 'Error de validación en parámetros',
      errors: errorMessages
    });
  }
  
  next();
};

/**
 * Middleware genérico para manejar errores de validación (mantenido por compatibilidad)
 */
export const handleValidationErrors = (req, res, next) => {
  // Este middleware ya no es necesario con Joi, pero se mantiene por compatibilidad
  next();
};
