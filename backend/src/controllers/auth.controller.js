"use strict";
import { loginService } from "../services/auth.service.js";
import {
  loginValidation,
} from "../validations/auth.validation.js";
import {
  handleErrorClient,
  handleErrorServer,
  handleSuccess,
} from "../handlers/responseHandlers.js";
import jwt from "jsonwebtoken";
import { ACCESS_TOKEN_SECRET } from "../config/configEnv.js";

export async function login(req, res) {
  try {
    const { body } = req;

    const { value, error } = loginValidation.validate(body);

    if (error) {
      return handleErrorClient(res, 400, "Error de validación", error.message);
    }

    const [accessToken, errorToken] = await loginService(value);

    if (errorToken)
      return handleErrorClient(res, 400, "Error iniciando sesión", errorToken);

    res.cookie("jwt", accessToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    });

    handleSuccess(res, 200, "Inicio de sesión exitoso", { token: accessToken });
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}



export async function logout(req, res) {
  try {
    res.clearCookie("jwt", { httpOnly: true });
    handleSuccess(res, 200, "Sesión cerrada exitosamente");
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function validateToken(req, res) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return handleErrorClient(res, 401, "Token no proporcionado", "No se encontró el token de autorización");
    }

    const token = authHeader.substring(7); // Remover 'Bearer '
    
    try {
      const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);
      
      // El token es válido
      handleSuccess(res, 200, "Token válido", { 
        valid: true, 
        userId: decoded.id,
        run: decoded.run 
      });
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return handleErrorClient(res, 401, "Token expirado", "El token ha expirado");
      } else if (jwtError.name === 'JsonWebTokenError') {
        return handleErrorClient(res, 401, "Token inválido", "El token no es válido");
      } else {
        return handleErrorClient(res, 401, "Error de token", jwtError.message);
      }
    }
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}
