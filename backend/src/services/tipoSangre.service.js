"use strict";
import { AppDataSource } from "../config/configDb.js";

/**
 * Servicio para gestionar tipos de sangre
 */
export class TipoSangreService {
  
  /**
   * Obtiene todos los tipos de sangre disponibles
   * @returns {Promise<Array>} [tiposSangre, error]
   */
  static async getTiposSangre() {
    try {
      const tipoSangreRepository = AppDataSource.getRepository("TipoSangre");
      
      const tiposSangre = await tipoSangreRepository.find({
        order: { nombre: "ASC" }
      });

      return [tiposSangre, null];
    } catch (error) {
      console.error("Error al obtener tipos de sangre:", error);
      return [null, "Error interno del servidor"];
    }
  }

  /**
   * Obtiene un tipo de sangre por su ID
   * @param {number} id - ID del tipo de sangre
   * @returns {Promise<Array>} [tipoSangre, error]
   */
  static async getTipoSangreById(id) {
    try {
      const tipoSangreRepository = AppDataSource.getRepository("TipoSangre");
      
      const tipoSangre = await tipoSangreRepository.findOne({
        where: { id }
      });

      if (!tipoSangre) {
        return [null, "Tipo de sangre no encontrado"];
      }

      return [tipoSangre, null];
    } catch (error) {
      console.error("Error al obtener tipo de sangre:", error);
      return [null, "Error interno del servidor"];
    }
  }
}
