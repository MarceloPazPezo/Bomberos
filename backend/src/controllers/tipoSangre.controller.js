"use strict";
import { TipoSangreService } from "../services/tipoSangre.service.js";
import { handleSuccess, handleErrorServer, handleErrorClient } from "../handlers/responseHandlers.js";

export class TipoSangreController {
  
  /**
   * Obtiene todos los tipos de sangre
   */
  static async getTiposSangre(req, res) {
    try {
      const [tiposSangre, error] = await TipoSangreService.getTiposSangre();
      
      if (error) {
        return handleErrorServer(res, 500, error);
      }

      return handleSuccess(res, 200, "Tipos de sangre obtenidos exitosamente", tiposSangre);
    } catch (error) {
      console.error("Error en getTiposSangre:", error);
      return handleErrorServer(res, 500, "Error interno del servidor");
    }
  }

  /**
   * Obtiene un tipo de sangre por ID
   */
  static async getTipoSangreById(req, res) {
    try {
      const { id } = req.params;
      
      if (!id || isNaN(parseInt(id))) {
        return handleErrorClient(res, 400, "ID de tipo de sangre inválido");
      }

      const idTipoSangre = parseInt(id);
      const [tipoSangre, error] = await TipoSangreService.getTipoSangreById(idTipoSangre);
      
      if (error) {
        if (error === "Tipo de sangre no encontrado") {
          return handleErrorClient(res, 404, error);
        }
        return handleErrorServer(res, 500, error);
      }

      return handleSuccess(res, 200, "Tipo de sangre obtenido exitosamente", tipoSangre);
    } catch (error) {
      console.error("Error en getTipoSangreById:", error);
      return handleErrorServer(res, 500, "Error interno del servidor");
    }
  }
}
