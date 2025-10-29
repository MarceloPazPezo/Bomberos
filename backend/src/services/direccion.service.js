"use strict";
import { AppDataSource } from "../config/configDb.js";
import Direccion from "../entities/direccion.entity.js";

class DireccionService {
  /**
   * Crea una nueva dirección
   * @param {Object} direccionData - Datos de la dirección
   * @returns {Promise<Array>} Dirección creada o error
   */
  static async createDireccion(direccionData) {
    try {
      const direccionRepository = AppDataSource.getRepository("Direccion");
      
      // Validar que la comuna existe
      const comunaRepository = AppDataSource.getRepository("Comuna");
      const comuna = await comunaRepository.findOne({
        where: { id: direccionData.idComuna }
      });

      if (!comuna) {
        return [null, "Comuna no encontrada"];
      }

      // Crear la dirección
      const nuevaDireccion = direccionRepository.create({
        calle: direccionData.calle,
        numero: direccionData.numero,
        depto: direccionData.depto || null,
        referencia: direccionData.referencia || null,
        codigoPostal: direccionData.codigoPostal || null,
        idComuna: direccionData.idComuna,
        creadoPor: direccionData.creadoPor || null,
        actualizadoPor: direccionData.actualizadoPor || null
      });

      const direccionGuardada = await direccionRepository.save(nuevaDireccion);

      // Obtener la dirección con relaciones
      const direccionCompleta = await direccionRepository.findOne({
        where: { id: direccionGuardada.id },
        relations: ["comuna", "comuna.region"]
      });

      return [direccionCompleta, null];
    } catch (error) {
      console.error("Error al crear dirección:", error);
      return [null, "Error interno del servidor"];
    }
  }

  /**
   * Obtiene una dirección por ID
   * @param {number} id - ID de la dirección
   * @returns {Promise<Array>} Dirección encontrada o error
   */
  static async getDireccionById(id) {
    try {
      const direccionRepository = AppDataSource.getRepository("Direccion");
      const direccion = await direccionRepository.findOne({
        where: { id },
        relations: ["comuna", "comuna.region"]
      });

      if (!direccion) {
        return [null, "Dirección no encontrada"];
      }

      return [direccion, null];
    } catch (error) {
      console.error("Error al obtener dirección:", error);
      return [null, "Error interno del servidor"];
    }
  }

  /**
   * Actualiza una dirección
   * @param {number} id - ID de la dirección
   * @param {Object} direccionData - Datos actualizados
   * @returns {Promise<Array>} Dirección actualizada o error
   */
  static async updateDireccion(id, direccionData) {
    try {
      const direccionRepository = AppDataSource.getRepository("Direccion");
      
      // Verificar que la dirección existe
      const direccionExistente = await direccionRepository.findOne({
        where: { id }
      });

      if (!direccionExistente) {
        return [null, "Dirección no encontrada"];
      }

      // Si se cambia la comuna, validar que existe
      if (direccionData.idComuna && direccionData.idComuna !== direccionExistente.idComuna) {
        const comunaRepository = AppDataSource.getRepository("Comuna");
        const comuna = await comunaRepository.findOne({
          where: { id: direccionData.idComuna }
        });

        if (!comuna) {
          return [null, "Comuna no encontrada"];
        }
      }

      // Actualizar la dirección
      await direccionRepository.update(id, {
        calle: direccionData.calle,
        numero: direccionData.numero,
        depto: direccionData.depto || null,
        referencia: direccionData.referencia || null,
        codigoPostal: direccionData.codigoPostal || null,
        idComuna: direccionData.idComuna,
        actualizadoPor: direccionData.actualizadoPor || null,
        actualizadoEl: new Date()
      });

      // Obtener la dirección actualizada con relaciones
      const direccionActualizada = await direccionRepository.findOne({
        where: { id },
        relations: ["comuna", "comuna.region"]
      });

      return [direccionActualizada, null];
    } catch (error) {
      console.error("Error al actualizar dirección:", error);
      return [null, "Error interno del servidor"];
    }
  }

  /**
   * Elimina una dirección
   * @param {number} id - ID de la dirección
   * @returns {Promise<Array>} Resultado de la eliminación
   */
  static async deleteDireccion(id) {
    try {
      const direccionRepository = AppDataSource.getRepository("Direccion");
      
      // Verificar que la dirección existe
      const direccion = await direccionRepository.findOne({
        where: { id }
      });

      if (!direccion) {
        return [null, "Dirección no encontrada"];
      }

      // Eliminar la dirección
      await direccionRepository.remove(direccion);

      return [true, null];
    } catch (error) {
      console.error("Error al eliminar dirección:", error);
      return [null, "Error interno del servidor"];
    }
  }

  /**
   * Busca direcciones por criterios
   * @param {Object} criterios - Criterios de búsqueda
   * @returns {Promise<Array>} Lista de direcciones encontradas
   */
  static async searchDirecciones(criterios) {
    try {
      const direccionRepository = AppDataSource.getRepository("Direccion");
      
      const queryBuilder = direccionRepository
        .createQueryBuilder("direccion")
        .leftJoinAndSelect("direccion.comuna", "comuna")
        .leftJoinAndSelect("comuna.region", "region");

      if (criterios.calle) {
        queryBuilder.andWhere("direccion.calle ILIKE :calle", { 
          calle: `%${criterios.calle}%` 
        });
      }

      if (criterios.numero) {
        queryBuilder.andWhere("direccion.numero ILIKE :numero", { 
          numero: `%${criterios.numero}%` 
        });
      }

      if (criterios.idComuna) {
        queryBuilder.andWhere("direccion.idComuna = :idComuna", { 
          idComuna: criterios.idComuna 
        });
      }

      if (criterios.idRegion) {
        queryBuilder.andWhere("region.id = :idRegion", { 
          idRegion: criterios.idRegion 
        });
      }

      const direcciones = await queryBuilder
        .orderBy("direccion.calle", "ASC")
        .addOrderBy("direccion.numero", "ASC")
        .getMany();

      return [direcciones, null];
    } catch (error) {
      console.error("Error al buscar direcciones:", error);
      return [null, "Error interno del servidor"];
    }
  }
}
export async function crearDireccionService(direccionData, manager = null) {
    const direccionRepository = (manager || AppDataSource).getRepository(Direccion);
    const nuevaDireccion = direccionRepository.create(direccionData);
    await direccionRepository.save(nuevaDireccion);
    return nuevaDireccion.id;
}

export async function getDireccionService(idDireccion) {
    try {
        const direccionRepository = AppDataSource.getRepository(Direccion);
        const dir = await direccionRepository.findOne({
            where: { id: idDireccion },
            relations: {
                comuna: { region: true },
            },
        });
        if (!dir) return null;
        // Extra: exponer idRegion directamente para facilitar al frontend
        const idRegion = dir?.comuna?.idRegion ?? dir?.comuna?.region?.id ?? null;
        // Devolver objeto enriquecido sin romper compatibilidad
        return { ...dir, idRegion };
    } catch (error) {
        throw new Error("Error al obtener la dirección");
    }
}

export async function actualizarDireccionService(idDireccion, direccionData, manager = null) {
    try {
    const direccionRepository = (manager || AppDataSource).getRepository(Direccion);
    const direccion = await direccionRepository.findOne({ where: { id: idDireccion } });
    if (!direccion) {
        throw new Error("Dirección no encontrada");
    }
    direccionRepository.merge(direccion, direccionData);
    return await direccionRepository.save(direccion);
    } catch (error) {
        throw new Error("Error al actualizar la dirección");
    }
}



export async function eliminarDireccionService(idDireccion, manager = null) {
    try {
    const direccionRepository = (manager || AppDataSource).getRepository(Direccion);
    const direccion = await direccionRepository.findOne({ where: { id: idDireccion } });
    if (!direccion) {
        throw new Error("Dirección no encontrada");
    }
    return await direccionRepository.remove(direccion);
    } catch (error) {
        throw new Error("Error al eliminar la dirección");
    }
}


export default DireccionService;