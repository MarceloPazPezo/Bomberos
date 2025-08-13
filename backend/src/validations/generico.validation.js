"use strict";
import Joi from "joi";

//validacion para un id
export const idValidation = Joi.number()
  .integer()
  .positive()
  .required()
  .messages({
  "any.required": "El ID es obligatorio.",
  "number.base": "El ID debe ser un número.",
  "number.integer": "El ID debe ser un número entero.",
  "number.positive": "El ID debe ser un número positivo.",
});