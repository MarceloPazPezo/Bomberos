"use strict";
import Joi from "joi";

/**
 * Esquema de validación para actualizar un permiso
 */
const updatePermissionSchema = Joi.object({
  name: Joi.string()
    .min(3)
    .max(100)
    .pattern(/^[a-z_:]+$/)
    .messages({
      "string.pattern.base":
        "El nombre debe contener solo letras minúsculas, guiones bajos y dos puntos",
      "string.min": "El nombre debe tener al menos 3 caracteres",
      "string.max": "El nombre no puede exceder 100 caracteres",
    }),

  description: Joi.string().min(10).max(500).messages({
    "string.min": "La descripción debe tener al menos 10 caracteres",
    "string.max": "La descripción no puede exceder 500 caracteres",
  }),

  category: Joi.string()
    .valid("users", "roles", "permissions", "system", "auth", "locations")
    .messages({
      "any.only":
        "La categoría debe ser una de: users, roles, permissions, system, auth, locations",
    }),

  isActive: Joi.boolean(),
}).min(1);

/**
 * Esquema de validación para parámetros de ID
 */
const permissionIdSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});

/**
 * Esquema de validación para filtros de consulta
 */
const queryPermissionSchema = Joi.object({
  category: Joi.string().valid(
    "users",
    "roles",
    "permissions",
    "system",
    "auth",
    "locations",
  ),
  isActive: Joi.boolean(),
  search: Joi.string().max(100),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
});

export {
  createPermissionSchema,
  updatePermissionSchema,
  permissionIdSchema,
  queryPermissionSchema,
};
