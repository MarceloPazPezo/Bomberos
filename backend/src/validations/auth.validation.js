"use strict";
import Joi from "joi";
import { validateRutDv } from "../helpers/rut.helper.js";

const domainEmailValidator = (value, helper) => {
  if (!value.endsWith("@example.cl") && !value.endsWith("@gmail.com")) {
    return helper.message(
      "El correo electrónico debe ser de un dominio permitido (ej. @example.cl, @gmail.com)",
    );
  }
  return value;
};

const normalizedRutPattern = /^\d{7,8}-[\dkK]$/;
const phonePattern = /^\+?[0-9\s-()]{7,20}$/;

const joiRutValidator = (value, helpers) => {
  if (typeof value !== "string") {
    return helpers.error("string.base", { value });
  }

  let preparedRut = value
    .replace(/\./g, "") // Quita puntos
    .replace(/\s/g, "") // Quita espacios
    .toUpperCase();

  if (!normalizedRutPattern.test(preparedRut)) {
    return helpers.error("string.rut.invalidNormalizedFormat", {
      value: preparedRut,
    });
  }

  const rutForDvValidation = preparedRut.replace("-", "");

  if (!validateRutDv(rutForDvValidation)) {
    return helpers.error("string.rut.invalidDv", { value: preparedRut });
  }
  return preparedRut;
};

const namePattern = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s'-]+$/;

const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)\S{8,}$/;

export const loginValidation = Joi.object({
  rut: Joi.string()
    .custom(joiRutValidator, "Validación completa de RUT para login")
    .required()
    .messages({
      "string.base": "El RUT debe ser de tipo string.",
      "any.required": "El RUT es obligatorio para iniciar sesión.",
      "string.rut.invalidNormalizedFormat":
        "El RUT normalizado no cumple el formato esperado (ej: XXXXXXXX-K), donde las X son números.",
      "string.rut.invalidDv": "El dígito verificador del RUT es incorrecto.",
    }),
  password: Joi.string().min(8).required().messages({
    "string.empty": "La contraseña no puede estar vacía.",
    "any.required": "La contraseña es obligatoria.",
    "string.base": "La contraseña debe ser de tipo texto.",
    "string.min": "La contraseña debe tener al menos {#limit} caracteres.",
  }),
})
  .unknown(false)
  .messages({
    "object.unknown":
      "No se permiten propiedades adicionales en el inicio de sesión.",
  });
