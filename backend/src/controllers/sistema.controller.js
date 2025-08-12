"use strict";
import {
  getSystemConfigService,
  updateSystemConfigService,
  createSystemConfigService,
  getSystemConfigByCategory
} from "../services/sistema.service.js";
import { handleErrorClient, handleErrorServer, handleSuccess } from "../handlers/responseHandlers.js";

export async function getSystemConfig(req, res) {
  try {
    const { key, category } = req.query;
    
    let result, error;
    
    if (category) {
      [result, error] = await getSystemConfigByCategory(category);
    } else {
      [result, error] = await getSystemConfigService(key);
    }
    
    if (error) return handleErrorClient(res, 400, error);
    
    return handleSuccess(res, 200, "Configuración obtenida exitosamente", result);
  } catch (error) {
    console.error("systemConfig.controller -> getSystemConfig:", error);
    return handleErrorServer(res, 500, "Error interno del servidor");
  }
}

export async function updateSystemConfig(req, res) {
  try {
    const { key } = req.params;
    const { value } = req.body;
    
    if (!value && value !== "") {
      return handleErrorClient(res, 400, "El valor es requerido");
    }
    
    const [result, error] = await updateSystemConfigService(key, value);
    
    if (error) {
      return handleErrorClient(res, 400, error);
    }
    
    return handleSuccess(res, 200, "Configuración actualizada exitosamente", result);
  } catch (error) {
    console.error("systemConfig.controller -> updateSystemConfig:", error);
    return handleErrorServer(res, 500, "Error interno del servidor");
  }
}

export async function createSystemConfig(req, res) {
  try {
    const { key } = req.params;
    
    if (!key) {
      return handleErrorClient(res, 400, "La clave es requerida");
    }
    
    const configData = {
      key,
      ...req.body
    };
    
    const [result, error] = await createSystemConfigService(configData);
    
    if (error) {
      return handleErrorClient(res, 400, error);
    }
    
    return handleSuccess(res, 201, "Configuración creada exitosamente", result);
  } catch (error) {
    console.error("systemConfig.controller -> createSystemConfig:", error);
    return handleErrorServer(res, 500, "Error interno del servidor");
  }
}