"use strict";
import Joi from "joi";
import { validateRUNDv } from "../helpers/run.helper.js";

const domainEmailValidator = (value, helper) => {
  if (!value.endsWith("@example.cl") && !value.endsWith("@gmail.com")) {
    return helper.message(
      "El correo electrónico debe ser de un dominio permitido (ej. @example.cl, @gmail.com)",
    );
  }
  return value;
};

const normalizedRUNPattern = /^\d{7,8}-[\dkK]$/;

const joiRUNValidator = (value, helpers) => {
  if (typeof value !== "string") {
    return helpers.error("string.base", { value });
  }

  let preparedRUN = value
    .replace(/\./g, "") // Quita puntos
    .replace(/\s/g, "") // Quita espacios
    .toUpperCase();

  if (!normalizedRUNPattern.test(preparedRUN)) {
    return helpers.error("string.run.invalidNormalizedFormat", {
      value: preparedRUN,
    });
  }

  const rutForDvValidation = preparedRUN.replace("-", "");

  if (!validateRUNDv(rutForDvValidation)) {
    return helpers.error("string.run.invalidDv", { value: preparedRUN });
  }
  return preparedRUN;
};

const namePattern = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s'-]+$/;

const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)\S{8,}$/;

const phonePattern = /^\+?[0-9\s-()]{7,20}$/;

// 1. Esquema para Parámetros de Consulta (Query)
export const bomberoQueryValidation = Joi.object({
  id: Joi.number().integer().positive().messages({
    "number.base": "El ID debe ser un número.",
    "number.integer": "El ID debe ser un número entero.",
    "number.positive": "El ID debe ser un número positivo.",
  }),
  run: Joi.string().pattern(normalizedRUNPattern).messages({
    "string.base": "El RUN debe ser de tipo string.",
    "string.pattern.base": "Formato de RUN inválido. Ejemplo: 12345678-9.",
  }),
  email: Joi.string()
    .email({ tlds: { allow: false } }) // tlds:false para validación general de formato email
    .messages({
      "string.base": "El correo electrónico debe ser de tipo string.",
      "string.email": "El formato del correo electrónico es inválido.",
    }),
  activo: Joi.boolean().messages({
    "boolean.base":
      "El estado 'activo' debe ser un valor booleano (true/false).",
  }),
  // Filtros por fecha
  creadoDesde: Joi.date().iso().messages({
    "date.base": "La fecha 'creadoDesde' debe ser una fecha válida.",
    "date.format": "La fecha 'creadoDesde' debe estar en formato ISO (YYYY-MM-DD o YYYY-MM-DDTHH:mm:ss.sssZ).",
  }),
  creadoHasta: Joi.date().iso().min(Joi.ref('creadoDesde')).messages({
    "date.base": "La fecha 'creadoHasta' debe ser una fecha válida.",
    "date.format": "La fecha 'creadoHasta' debe estar en formato ISO (YYYY-MM-DD o YYYY-MM-DDTHH:mm:ss.sssZ).",
    "date.min": "La fecha 'creadoHasta' debe ser posterior a 'creadoDesde'.",
  }),
  actualizadoDesde: Joi.date().iso().messages({
    "date.base": "La fecha 'actualizadoDesde' debe ser una fecha válida.",
    "date.format": "La fecha 'actualizadoDesde' debe estar en formato ISO (YYYY-MM-DD o YYYY-MM-DDTHH:mm:ss.sssZ).",
  }),
  actualizadoHasta: Joi.date().iso().min(Joi.ref('actualizadoDesde')).messages({
    "date.base": "La fecha 'actualizadoHasta' debe ser una fecha válida.",
    "date.format": "La fecha 'actualizadoHasta' debe estar en formato ISO (YYYY-MM-DD o YYYY-MM-DDTHH:mm:ss.sssZ).",
    "date.min": "La fecha 'actualizadoHasta' debe ser posterior a 'actualizadoDesde'.",
  }),
})
  .or("id", "run", "email", "activo", "creadoDesde", "creadoHasta", "actualizadoDesde", "actualizadoHasta")
  .unknown(false)
  .messages({
    "object.unknown": "No se permiten parámetros de consulta adicionales.",
    "object.missing":
      "Debes proporcionar al menos un parámetro de búsqueda: id, run, email o activo.",
  });

// 2. Esquema para el Cuerpo de la Solicitud al Crear un Bombero (Create)
export const bomberoCreateValidation = Joi.object({
  nombres: Joi.array()
    .items(
      Joi.string().min(2).max(50).pattern(namePattern).messages({
        "string.base": "Cada nombre debe ser de tipo string.",
        "string.empty": "Un nombre no puede estar vacío.",
        "string.min": "Un nombre debe tener como mínimo {#limit} caracteres.",
        "string.max": "Un nombre debe tener como máximo {#limit} caracteres.",
        "string.pattern.base":
          "Un nombre solo puede contener letras, espacios, apóstrofes o guiones.",
      }),
    )
    .max(3)
    .optional()
    .allow(null, "")
    .messages({
      "array.base": "El campo 'nombres' debe ser un array.",
      "array.max":
        "El campo 'nombres' no puede tener más de {#limit} elementos.",
    }),
  apellidos: Joi.array()
    .items(
      Joi.string().min(2).max(50).pattern(namePattern).messages({
        "string.base": "Cada apellido debe ser de tipo string.",
        "string.empty": "Un apellido no puede estar vacío.",
        "string.min": "Un apellido debe tener como mínimo {#limit} caracteres.",
        "string.max": "Un apellido debe tener como máximo {#limit} caracteres.",
        "string.pattern.base":
          "Un apellido solo puede contener letras, espacios, apóstrofes o guiones.",
      }),
    )
    .max(2)
    .optional()
    .allow(null, "")
    .messages({
      "array.base": "El campo 'apellidos' debe ser un array.",
      "array.max":
        "El campo 'apellidos' no puede tener más de {#limit} elementos.",
    }),
  run: Joi.string()
    .custom(joiRUNValidator, "Validación completa de RUN")
    .required()
    .messages({
      "string.base": "El RUN debe ser de tipo string.",
      "any.required": "El RUN es obligatorio.",
      "string.run.invalidNormalizedFormat":
        "El RUN normalizado no cumple el formato esperado (ej: XXXXXXXX-K) donde X son números",
      "string.run.invalidDv": "El dígito verificador del RUN es incorrecto.",
    }),
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .min(5)
    .max(255)
    .custom(domainEmailValidator, "Validación de dominio de correo electrónico")
    .required()
    .messages({
      "string.empty": "El correo electrónico no puede estar vacío.",
      "string.base": "El correo electrónico debe ser de tipo string.",
      "string.email": "El formato del correo electrónico es inválido.",
      "string.min":
        "El correo electrónico debe tener como mínimo {#limit} caracteres.",
      "string.max":
        "El correo electrónico debe tener como máximo {#limit} caracteres.",
      "any.required": "El correo electrónico es obligatorio.",
    }),
  password: Joi.string()
    .min(8)
    .max(100)
    .pattern(passwordPattern)
    .required()
    .messages({
      "string.empty": "La contraseña no puede estar vacía.",
      "string.base": "La contraseña debe ser de tipo string.",
      "string.min": "La contraseña debe tener como mínimo {#limit} caracteres.",
      "string.max": "La contraseña debe tener como máximo {#limit} caracteres.",
      "string.pattern.base":
        "La contraseña debe tener al menos 8 caracteres, incluyendo una mayúscula, una minúscula y un número.",
      "any.required": "La contraseña es obligatoria.",
    }),
  roles: Joi.array()
    .items(
      Joi.alternatives().try(
        Joi.number().integer().positive(),
        Joi.string().min(3).max(50),
      ),
    )
    .min(1)
    .optional()
    .messages({
      "array.base": "El campo 'roles' debe ser un array.",
      "array.min": "Se debe asignar al menos un rol.",
      "alternatives.types":
        "Cada rol debe ser un ID numérico o un nombre de rol válido.",
    }),
  activo: Joi.boolean().default(true).messages({
    "boolean.base":
      "El estado 'activo' debe ser un valor booleano (true/false).",
  }),
})
  .unknown(false)
  .messages({
    "object.unknown":
      "No se permiten propiedades adicionales en la creación del usuario.",
  });

// 3. Esquema para el Cuerpo de la Solicitud al Actualizar un Bombero (Update)
export const bomberoBodyValidation = Joi.object({
  nombres: Joi.array()
    .items(
      Joi.string().min(2).max(50).pattern(namePattern).messages({
        "string.base": "Cada nombre debe ser de tipo string.",
        "string.empty": "Un nombre no puede estar vacío.",
        "string.min": "Un nombre debe tener como mínimo {#limit} caracteres.",
        "string.max": "Un nombre debe tener como máximo {#limit} caracteres.",
        "string.pattern.base":
          "Un nombre solo puede contener letras, espacios, apóstrofes o guiones.",
      }),
    )
    .min(1)
    .max(3)
    .optional()
    .messages({
      "array.base": "El campo 'nombres' debe ser un array.",
      "array.min": "Debes proporcionar al menos un nombre.",
      "array.max":
        "El campo 'nombres' no puede tener más de {#limit} elementos.",
    }),
  apellidos: Joi.array()
    .items(
      Joi.string().min(2).max(50).pattern(namePattern).messages({
        "string.base": "Cada apellido debe ser de tipo string.",
        "string.empty": "Un apellido no puede estar vacío.",
        "string.min": "Un apellido debe tener como mínimo {#limit} caracteres.",
        "string.max": "Un apellido debe tener como máximo {#limit} caracteres.",
        "string.pattern.base":
          "Un apellido solo puede contener letras, espacios, apóstrofes o guiones.",
      }),
    )
    .min(1)
    .optional()
    .messages({
      "array.base": "El campo 'apellidos' debe ser un array.",
      "array.min": "Debes proporcionar al menos un apellido.",
      "array.max":
        "El campo 'apellidos' no puede tener más de {#limit} elementos.",
    }),
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .min(5)
    .max(255)
    .custom(domainEmailValidator, "Validación de dominio de correo electrónico")
    .optional()
    .messages({
      "string.base": "El correo electrónico debe ser de tipo string.",
      "string.email": "El formato del correo electrónico es inválido.",
      "string.min":
        "El correo electrónico debe tener como mínimo {#limit} caracteres.",
      "string.max":
        "El correo electrónico debe tener como máximo {#limit} caracteres.",
    }),
  newPassword: Joi.string()
    .min(8)
    .max(100)
    .pattern(passwordPattern)
    .optional()
    .allow(null, "")
    .messages({
      "string.base": "La nueva contraseña debe ser de tipo string.",
      "string.min":
        "La nueva contraseña debe tener como mínimo {#limit} caracteres.",
      "string.max":
        "La nueva contraseña debe tener como máximo {#limit} caracteres.",
      "string.pattern.base":
        "La nueva contraseña debe tener al menos 8 caracteres, incluyendo una mayúscula, una minúscula y un número.",
    }),
  currentPassword: Joi.string()
    .when("newPassword", {
      is: Joi.exist(),
      then: Joi.required(),
      otherwise: Joi.optional(),
    })
    .messages({
      "any.required":
        "La contraseña actual es requerida para cambiar la contraseña.",
    }),
  roles: Joi.array()
    .items(
      Joi.alternatives().try(
        Joi.number().integer().positive(),
        Joi.string().min(3).max(50),
      ),
    )
    .min(1)
    .optional()
    .messages({
      "array.base": "El campo 'roles' debe ser un array.",
      "array.min": "Se debe asignar al menos un rol si se actualiza.",
      "alternatives.types":
        "Cada rol debe ser un ID numérico o un nombre de rol válido.",
    }),
  activo: Joi.boolean().optional().messages({
    "boolean.base":
      "El estado 'activo' debe ser un valor booleano (true/false).",
  }),
})
  .or(
    "nombres",
    "apellidos",
    "email",
    "newPassword",
    "currentPassword",
    "roles",
    "activo",
  )
  .unknown(false)
  .messages({
    "object.unknown":
      "No se permiten propiedades adicionales en la actualización del usuario.",
    "object.missing": "Debes proporcionar al menos un campo para actualizar.",
  });

// 4. Esquema específico para cambio de contraseña
export const changePasswordValidation = Joi.object({
  currentPassword: Joi.string().required().messages({
    "string.base": "La contraseña actual debe ser de tipo string.",
    "string.empty": "La contraseña actual no puede estar vacía.",
    "any.required": "La contraseña actual es obligatoria.",
  }),
  newPassword: Joi.string()
    .min(8)
    .max(100)
    .pattern(passwordPattern)
    .required()
    .messages({
      "string.empty": "La nueva contraseña no puede estar vacía.",
      "string.base": "La nueva contraseña debe ser de tipo string.",
      "string.min":
        "La nueva contraseña debe tener como mínimo {#limit} caracteres.",
      "string.max":
        "La nueva contraseña debe tener como máximo {#limit} caracteres.",
      "string.pattern.base":
        "La nueva contraseña debe tener al menos 8 caracteres, incluyendo una mayúscula, una minúscula y un número.",
      "any.required": "La nueva contraseña es obligatoria.",
    }),
})
  .unknown(false)
  .messages({
    "object.unknown":
      "No se permiten propiedades adicionales para el cambio de contraseña.",
  });
