"use strict";
import Joi from "joi";

const rolNamePattern = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s-_]+$/;
const permisoIdentifierPattern = /^[a-zA-Z0-9_:]+$/;

// 1. Esquema para Parámetros de Consulta (Query) para Roles
export const rolQueryValidation = Joi.object({
  id: Joi.number().integer().positive().messages({
    "number.base": "El ID del rol debe ser un número.",
    "number.integer": "El ID del rol debe ser un número entero.",
    "number.positive": "El ID del rol debe ser un número positivo.",
  }),
  nombre: Joi.string().min(2).max(50).pattern(rolNamePattern).messages({
    "string.base": "El nombre del rol debe ser de tipo string.",
    "string.min":
      "El nombre del rol debe tener como mínimo {#limit} caracteres.",
    "string.max":
      "El nombre del rol debe tener como máximo {#limit} caracteres.",
    "string.pattern.base":
      "El nombre del rol contiene caracteres no permitidos.",
  }),
})
  .or("id", "nombre")
  .unknown(false)
  .messages({
    "object.unknown":
      "No se permiten parámetros de consulta adicionales para roles.",
    "object.missing":
      "Debes proporcionar al menos un parámetro de búsqueda para roles: id o nombre.",
  });

// 2. Esquema para el Cuerpo de la Solicitud al Crear un Rol (Create)
export const rolCreateValidation = Joi.object({
  nombre: Joi.string()
    .min(2)
    .max(50)
    .pattern(rolNamePattern)
    .required()
    .messages({
      "string.base": "El nombre del rol debe ser de tipo string.",
      "string.empty": "El nombre del rol no puede estar vacío.",
      "string.min":
        "El nombre del rol debe tener como mínimo {#limit} caracteres.",
      "string.max":
        "El nombre del rol debe tener como máximo {#limit} caracteres.",
      "string.pattern.base":
        "El nombre del rol solo puede contener letras, números, espacios, guiones o guiones bajos.",
      "any.required": "El nombre del rol es obligatorio.",
    }),
  descripcion: Joi.string()
    .max(500) // Ajusta el máximo según sea necesario para un campo 'text'
    .optional()
    .allow(null, "")
    .messages({
      "string.base": "La descripción del rol debe ser de tipo string.",
      "string.max":
        "La descripción del rol debe tener como máximo {#limit} caracteres.",
    }),
  permisos: Joi.array()
    .items(
      Joi.alternatives().try(
        Joi.number().integer().positive().messages({
          // Asumiendo que los permisos pueden ser referenciados por ID
          "number.base": "El ID del permiso debe ser un número.",
          "number.integer": "El ID del permiso debe ser un número entero.",
          "number.positive": "El ID del permiso debe ser un número positivo.",
        }),
        Joi.string()
          .min(3)
          .max(100)
          .pattern(permisoIdentifierPattern)
          .messages({
            // O por un nombre/código de permiso
            "string.base":
              "El identificador del permiso debe ser de tipo string.",
            "string.min":
              "El identificador del permiso debe tener como mínimo {#limit} caracteres.",
            "string.max":
              "El identificador del permiso debe tener como máximo {#limit} caracteres.",
            "string.pattern.base":
              "El identificador del permiso contiene caracteres no permitidos.",
          }),
      ),
    )
    .min(0) // Puede crearse un rol sin permisos inicialmente
    .optional()
    .messages({
      "array.base": "El campo 'permisos' debe ser un array.",
      "array.min":
        "Si se proporciona 'permisos', debe contener al menos {#limit} elementos.", // Se activaría si min es > 0
      "alternatives.types":
        "Cada permiso debe ser un ID numérico positivo o un identificador de permiso (string) válido.",
    }),
})
  .unknown(false)
  .messages({
    "object.unknown":
      "No se permiten propiedades adicionales en la creación del rol.",
  });

// 3. Esquema para el Cuerpo de la Solicitud al Actualizar un Rol (Update)
export const rolBodyValidation = Joi.object({
  nombre: Joi.string()
    .min(2)
    .max(50)
    .pattern(rolNamePattern)
    .optional()
    .messages({
      "string.base": "El nombre del rol debe ser de tipo string.",
      "string.min":
        "El nombre del rol debe tener como mínimo {#limit} caracteres.",
      "string.max":
        "El nombre del rol debe tener como máximo {#limit} caracteres.",
      "string.pattern.base":
        "El nombre del rol solo puede contener letras, números, espacios, guiones o guiones bajos.",
    }),
  descripcion: Joi.string()
    .max(500)
    .optional()
    .allow(null, "") // Permite explícitamente borrar la descripción
    .messages({
      "string.base": "La descripción del rol debe ser de tipo string.",
      "string.max":
        "La descripción del rol debe tener como máximo {#limit} caracteres.",
    }),
  permisos: Joi.array()
    .items(
      Joi.alternatives().try(
        Joi.number().integer().positive().messages({
          "number.base": "El ID del permiso debe ser un número.",
          "number.integer": "El ID del permiso debe ser un número entero.",
          "number.positive": "El ID del permiso debe ser un número positivo.",
        }),
        Joi.string()
          .min(3)
          .max(100)
          .pattern(permisoIdentifierPattern)
          .messages({
            "string.base":
              "El identificador del permiso debe ser de tipo string.",
            "string.min":
              "El identificador del permiso debe tener como mínimo {#limit} caracteres.",
            "string.max":
              "El identificador del permiso debe tener como máximo {#limit} caracteres.",
            "string.pattern.base":
              "El identificador del permiso contiene caracteres no permitidos.",
          }),
      ),
    )
    .min(0) // Permite enviar un array vacío para quitar todos los permisos
    .optional()
    .messages({
      "array.base": "El campo 'permisos' debe ser un array.",
      "alternatives.types":
        "Cada permiso debe ser un ID numérico positivo o un identificador de permiso (string) válido.",
    }),
})
  .or("nombre", "descripcion", "permisos") // Debe haber al menos un campo para actualizar
  .unknown(false)
  .messages({
    "object.unknown":
      "No se permiten propiedades adicionales en la actualización del rol.",
    "object.missing":
      "Debes proporcionar al menos un campo para actualizar (nombre, descripcion o permisos).",
  });
