"use strict";
import DireccionService from "../services/direccion.service.js";
import { handleSuccess, handleErrorClient, handleErrorServer } from "../handlers/responseHandlers.js";

class DireccionController {
  /**
   * Crea una nueva dirección
   */
  static async createDireccion(req, res) {
    try {
      const direccionData = {
        ...req.body,
        creadoPor: req.bombero?.id,
        actualizadoPor: req.bombero?.id
      };

      const [direccion, error] = await DireccionService.createDireccion(direccionData);
      
      if (error) {
        return handleErrorClient(res, 400, error);
      }

      return handleSuccess(res, 201, "Dirección creada exitosamente", direccion);
    } catch (error) {
      console.error("Error en createDireccion:", error);
      return handleErrorServer(res, 500, "Error interno del servidor");
    }
  }

  /**
   * Obtiene una dirección por ID
   */
  static async getDireccionById(req, res) {
    try {
      const { id } = req.params;
      const direccionId = parseInt(id);

      if (isNaN(direccionId)) {
        return errorResponse(res, 400, "ID de dirección inválido");
      }

      const [direccion, error] = await DireccionService.getDireccionById(direccionId);
      
      if (error) {
        return handleErrorClient(res, 404, error);
      }

      return handleSuccess(res, 200, "Dirección obtenida exitosamente", direccion);
    } catch (error) {
      console.error("Error en getDireccionById:", error);
      return handleErrorServer(res, 500, "Error interno del servidor");
    }
  }

  /**
   * Actualiza una dirección
   */
  static async updateDireccion(req, res) {
    try {
      const { id } = req.params;
      const direccionId = parseInt(id);

      if (isNaN(direccionId)) {
        return errorResponse(res, 400, "ID de dirección inválido");
      }

      const direccionData = {
        ...req.body,
        actualizadoPor: req.bombero?.id
      };

      const [direccion, error] = await DireccionService.updateDireccion(direccionId, direccionData);
      
      if (error) {
        return handleErrorClient(res, 400, error);
      }

      return handleSuccess(res, 200, "Dirección actualizada exitosamente", direccion);
    } catch (error) {
      console.error("Error en updateDireccion:", error);
      return handleErrorServer(res, 500, "Error interno del servidor");
    }
  }

  /**
   * Elimina una dirección
   */
  static async deleteDireccion(req, res) {
    try {
      const { id } = req.params;
      const direccionId = parseInt(id);

      if (isNaN(direccionId)) {
        return errorResponse(res, 400, "ID de dirección inválido");
      }

      const [result, error] = await DireccionService.deleteDireccion(direccionId);
      
      if (error) {
        return handleErrorClient(res, 400, error);
      }

      return handleSuccess(res, 200, "Dirección eliminada exitosamente", { deleted: true });
    } catch (error) {
      console.error("Error en deleteDireccion:", error);
      return handleErrorServer(res, 500, "Error interno del servidor");
    }
  }

  /**
   * Busca direcciones por criterios
   */
  static async searchDirecciones(req, res) {
    try {
      const criterios = req.query;
      const [direcciones, error] = await DireccionService.searchDirecciones(criterios);
      
      if (error) {
        return handleErrorServer(res, 500, error);
      }

      return handleSuccess(res, 200, "Direcciones encontradas", direcciones);
    } catch (error) {
      console.error("Error en searchDirecciones:", error);
      return handleErrorServer(res, 500, "Error interno del servidor");
    }
  }
}

export default DireccionController;
