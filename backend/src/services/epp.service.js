"use strict";
import { AppDataSource } from "../config/configDb.js";
import logger from "../config/configLogger.js";

import Epp from "../entities/epp.entity.js";
import TipoEpp from "../entities/tipoEpp.entity.js";
import EstadoEpp from "../entities/estadoEpp.entity.js";
import ACargoEpp from "../entities/aCargoEpp.entity.js";
import FichaBombero from "../entities/fichaBombero.entity.js";
import { sendIndividualNotification } from "./notification.service.js";
import { NOTIFICATION_TYPES } from "../helpers/notification.helper.js";

/**
 * Obtiene todos los EPP con paginación y filtros
 */
export async function getEppService(query) {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      idTipoEpp = null,
      idEstadoEpp = null,
      idBombero = null
    } = query;

    const queryBuilder = AppDataSource.getRepository(Epp)
      .createQueryBuilder("epp")
      .leftJoinAndSelect("epp.tipoEpp", "tipoEpp")
      .leftJoinAndSelect("epp.estadosEpp", "estadosEpp")
      .leftJoinAndSelect("epp.aCargoEpps", "aCargoEpp")
      .leftJoinAndSelect("aCargoEpp.fichaBombero", "fichaBombero")
      .leftJoinAndSelect("fichaBombero.bombero", "bombero")
      .select([
        "epp.id",
        "epp.nombre",
        "epp.descripcionDeEstado",
        "epp.creadoEl",
        "epp.actualizadoEl",
        "tipoEpp.id",
        "tipoEpp.nombre",
        "estadosEpp.id",
        "estadosEpp.nombre",
        "aCargoEpp.id",
        "aCargoEpp.fechaAsignacion",
        "fichaBombero.id",
        "bombero.id",
        "bombero.nombres",
        "bombero.apellidos"
      ]);

    // Filtro de búsqueda (case-insensitive)
    if (search) {
      queryBuilder.andWhere(
        "(LOWER(epp.nombre) LIKE LOWER(:search) OR LOWER(epp.descripcionDeEstado) LIKE LOWER(:search))",
        { search: `%${search}%` }
      );
    }

    // Filtro por tipo de EPP
    if (idTipoEpp) {
      queryBuilder.andWhere("epp.idTipoEpp = :idTipoEpp", { idTipoEpp });
    }

    // Filtro por estado de EPP
    if (idEstadoEpp) {
      queryBuilder.andWhere("epp.idEstadoEpp = :idEstadoEpp", { idEstadoEpp });
    }

    // Filtro por bombero (EPP asignados)
    if (idBombero) {
      queryBuilder.andWhere("bombero.id = :idBombero", { idBombero });
    }

    // Ordenar por fecha de creación (más recientes primero)
    queryBuilder.orderBy("epp.creadoEl", "DESC");

    // Paginación
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const [epps, total] = await queryBuilder.getManyAndCount();

    logger.info(`[EPP_SERVICE] Obtenidos ${epps.length} EPP de ${total} total`);

    return {
      epps,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    logger.error("[EPP_SERVICE] Error obteniendo EPP:", error);
    throw error;
  }
}

/**
 * Obtiene un EPP por ID con toda su información
 */
export async function getEppByIdService(id) {
  try {
    const epp = await AppDataSource.getRepository(Epp)
      .createQueryBuilder("epp")
      .leftJoinAndSelect("epp.tipoEpp", "tipoEpp")
      .leftJoinAndSelect("epp.estadosEpp", "estadosEpp")
      .leftJoinAndSelect("epp.aCargoEpps", "aCargoEpp")
      .leftJoinAndSelect("aCargoEpp.fichaBombero", "fichaBombero")
      .leftJoinAndSelect("fichaBombero.bombero", "bombero")
      .where("epp.id = :id", { id })
      .getOne();

    if (!epp) {
      throw new Error(`EPP con ID ${id} no encontrado`);
    }

    logger.info(`[EPP_SERVICE] EPP ${id} obtenido exitosamente`);
    return epp;
  } catch (error) {
    logger.error(`[EPP_SERVICE] Error obteniendo EPP ${id}:`, error);
    throw error;
  }
}

/**
 * Crea un nuevo EPP
 */
export async function createEppService(eppData, userId) {
  try {
    // Verificar que el tipo y estado existan
    const tipoEpp = await AppDataSource.getRepository(TipoEpp).findOne({
      where: { id: eppData.idTipoEpp }
    });
    if (!tipoEpp) {
      throw new Error(`Tipo de EPP con ID ${eppData.idTipoEpp} no encontrado`);
    }

    const estadoEpp = await AppDataSource.getRepository(EstadoEpp).findOne({
      where: { id: eppData.idEstadoEpp }
    });
    if (!estadoEpp) {
      throw new Error(`Estado de EPP con ID ${eppData.idEstadoEpp} no encontrado`);
    }

    const epp = AppDataSource.getRepository(Epp).create({
      ...eppData,
      creadoPor: userId,
      actualizadoPor: userId
    });

    const savedEpp = await AppDataSource.getRepository(Epp).save(epp);

    logger.info(`[EPP_SERVICE] EPP ${savedEpp.id} creado exitosamente`);
    return savedEpp;
  } catch (error) {
    logger.error("[EPP_SERVICE] Error creando EPP:", error);
    throw error;
  }
}

/**
 * Actualiza un EPP existente
 */
export async function updateEppService(id, eppData, userId) {
  try {
    const epp = await AppDataSource.getRepository(Epp).findOne({ where: { id } });
    if (!epp) {
      throw new Error(`EPP con ID ${id} no encontrado`);
    }

    // Verificar tipo y estado si se proporcionan
    if (eppData.idTipoEpp) {
      const tipoEpp = await AppDataSource.getRepository(TipoEpp).findOne({
        where: { id: eppData.idTipoEpp }
      });
      if (!tipoEpp) {
        throw new Error(`Tipo de EPP con ID ${eppData.idTipoEpp} no encontrado`);
      }
    }

    if (eppData.idEstadoEpp) {
      const estadoEpp = await AppDataSource.getRepository(EstadoEpp).findOne({
        where: { id: eppData.idEstadoEpp }
      });
      if (!estadoEpp) {
        throw new Error(`Estado de EPP con ID ${eppData.idEstadoEpp} no encontrado`);
      }
    }

    Object.assign(epp, eppData, {
      actualizadoPor: userId
    });

    const updatedEpp = await AppDataSource.getRepository(Epp).save(epp);

    logger.info(`[EPP_SERVICE] EPP ${id} actualizado exitosamente`);
    return updatedEpp;
  } catch (error) {
    logger.error(`[EPP_SERVICE] Error actualizando EPP ${id}:`, error);
    throw error;
  }
}

/**
 * Elimina un EPP
 */
export async function deleteEppService(id) {
  try {
    const epp = await AppDataSource.getRepository(Epp).findOne({ where: { id } });
    if (!epp) {
      throw new Error(`EPP con ID ${id} no encontrado`);
    }

    // Verificar si el EPP está asignado a algún bombero
    const asignaciones = await AppDataSource.getRepository(ACargoEpp).find({
      where: { idEpp: id }
    });

    if (asignaciones.length > 0) {
      throw new Error("No se puede eliminar un EPP que está asignado a bomberos");
    }

    await AppDataSource.getRepository(Epp).remove(epp);

    logger.info(`[EPP_SERVICE] EPP ${id} eliminado exitosamente`);
    return true;
  } catch (error) {
    logger.error(`[EPP_SERVICE] Error eliminando EPP ${id}:`, error);
    throw error;
  }
}

/**
 * Asigna un EPP a un bombero
 */
export async function assignEppToBomberoService(eppId, fichaBomberoId, userId) {
  try {
    // Repositorios
    const eppRepository = AppDataSource.getRepository(Epp);
    const fichaBomberoRepository = AppDataSource.getRepository(FichaBombero);
    const aCargoEppRepository = AppDataSource.getRepository(ACargoEpp);
    const estadoEppRepository = AppDataSource.getRepository(EstadoEpp);

    // Verificar que el EPP existe y obtener sus datos completos
    const epp = await eppRepository.findOne({ 
      where: { id: eppId },
      relations: ["tipoEpp"]
    });
    if (!epp) {
      throw new Error(`EPP con ID ${eppId} no encontrado`);
    }

    // Verificar que la ficha del bombero existe y obtener datos del bombero
    const fichaBombero = await fichaBomberoRepository.findOne({
      where: { id: fichaBomberoId },
      relations: ["bombero"]
    });
    if (!fichaBombero) {
      throw new Error(`Ficha de bombero con ID ${fichaBomberoId} no encontrada`);
    }

    // Verificar que el EPP no esté ya asignado a otro bombero
    const asignacionExistente = await aCargoEppRepository.findOne({
      where: { idEpp: eppId }
    });

    if (asignacionExistente) {
      throw new Error("Este EPP ya está asignado a otro bombero");
    }

    // Buscar el estado "En Uso" para asignarlo automáticamente
    const estadoEnUso = await estadoEppRepository.findOne({
      where: { nombre: "En Uso" }
    });

    // Crear la asignación
    const asignacion = aCargoEppRepository.create({
      idEpp: eppId,
      idFichaBombero: fichaBomberoId,
      fechaAsignacion: new Date()
    });

    const savedAsignacion = await aCargoEppRepository.save(asignacion);

    // Actualizar el estado del EPP a "En Uso" si existe ese estado
    if (estadoEnUso) {
      await eppRepository.update(eppId, {
        idEstadoEpp: estadoEnUso.id,
        actualizadoEl: new Date(),
        actualizadoPor: userId
      });
      logger.info(`[EPP_SERVICE] Estado del EPP ${eppId} cambiado a "En Uso"`);
    }

    // Enviar notificación al bombero
    try {
      const bomberoId = fichaBombero.bombero.id;
      const tipoEppNombre = epp.tipoEpp?.nombre || "EPP";
      
      await sendIndividualNotification(
        {
          type: NOTIFICATION_TYPES.PERSONAL,
          title: "Nuevo EPP Asignado",
          message: `Se te ha asignado el equipo: ${epp.nombre} (${tipoEppNombre}). Recuerda mantenerlo en buen estado y reportar cualquier problema.`,
          data: {
            eppId: epp.id,
            eppNombre: epp.nombre,
            tipoEpp: tipoEppNombre,
            fechaAsignacion: savedAsignacion.fechaAsignacion
          }
        },
        bomberoId
      );
      logger.info(`[EPP_SERVICE] Notificación enviada al bombero ${bomberoId} por asignación de EPP ${eppId}`);
    } catch (notificationError) {
      // No fallar la asignación si falla la notificación
      logger.error(`[EPP_SERVICE] Error enviando notificación de asignación de EPP:`, notificationError);
    }

    logger.info(`[EPP_SERVICE] EPP ${eppId} asignado a ficha ${fichaBomberoId}`);
    return savedAsignacion;
  } catch (error) {
    logger.error(`[EPP_SERVICE] Error asignando EPP:`, error);
    throw error;
  }
}

/**
 * Desasigna un EPP de un bombero
 */
export async function unassignEppFromBomberoService(eppId, userId = null) {
  try {
    const aCargoEppRepository = AppDataSource.getRepository(ACargoEpp);
    const eppRepository = AppDataSource.getRepository(Epp);
    const estadoEppRepository = AppDataSource.getRepository(EstadoEpp);
    const fichaBomberoRepository = AppDataSource.getRepository(FichaBombero);

    // Obtener la asignación con todas las relaciones necesarias
    const asignacion = await aCargoEppRepository.findOne({
      where: { idEpp: eppId },
      relations: ["fichaBombero", "fichaBombero.bombero"]
    });

    if (!asignacion) {
      throw new Error("No se encontró asignación para este EPP");
    }

    // Obtener datos del EPP antes de desasignar
    const epp = await eppRepository.findOne({
      where: { id: eppId },
      relations: ["tipoEpp"]
    });

    // Guardar el ID del bombero para la notificación
    const bomberoId = asignacion.fichaBombero?.bombero?.id;
    const eppNombre = epp?.nombre || "EPP";
    const tipoEppNombre = epp?.tipoEpp?.nombre || "EPP";

    await aCargoEppRepository.remove(asignacion);

    // Buscar el estado "Disponible" para asignarlo automáticamente al desasignar
    const estadoDisponible = await estadoEppRepository.findOne({
      where: { nombre: "Disponible" }
    });

    // Actualizar el estado del EPP a "Disponible" si existe ese estado
    if (estadoDisponible) {
      await eppRepository.update(eppId, {
        idEstadoEpp: estadoDisponible.id,
        actualizadoEl: new Date(),
        actualizadoPor: userId
      });
      logger.info(`[EPP_SERVICE] Estado del EPP ${eppId} cambiado a "Disponible"`);
    }

    // Enviar notificación al bombero si se obtuvo su ID
    if (bomberoId) {
      try {
        await sendIndividualNotification(
          {
            type: NOTIFICATION_TYPES.PERSONAL,
            title: "EPP Desasignado",
            message: `El equipo ${eppNombre} (${tipoEppNombre}) ha sido desasignado de tu inventario. Si tienes dudas, contacta con tu superior.`,
            data: {
              eppId: eppId,
              eppNombre: eppNombre,
              tipoEpp: tipoEppNombre,
              fechaDesasignacion: new Date()
            }
          },
          bomberoId
        );
        logger.info(`[EPP_SERVICE] Notificación enviada al bombero ${bomberoId} por desasignación de EPP ${eppId}`);
      } catch (notificationError) {
        // No fallar la desasignación si falla la notificación
        logger.error(`[EPP_SERVICE] Error enviando notificación de desasignación de EPP:`, notificationError);
      }
    }

    logger.info(`[EPP_SERVICE] EPP ${eppId} desasignado exitosamente`);
    return true;
  } catch (error) {
    logger.error(`[EPP_SERVICE] Error desasignando EPP:`, error);
    throw error;
  }
}

/**
 * Obtiene todos los tipos de EPP
 */
export async function getTiposEppService() {
  try {
    const tipos = await AppDataSource.getRepository(TipoEpp).find({
      order: { nombre: "ASC" }
    });

    logger.info(`[EPP_SERVICE] Obtenidos ${tipos.length} tipos de EPP`);
    return tipos;
  } catch (error) {
    logger.error("[EPP_SERVICE] Error obteniendo tipos de EPP:", error);
    throw error;
  }
}

/**
 * Obtiene todos los estados de EPP
 */
export async function getEstadosEppService() {
  try {
    const estados = await AppDataSource.getRepository(EstadoEpp).find({
      order: { nombre: "ASC" }
    });

    logger.info(`[EPP_SERVICE] Obtenidos ${estados.length} estados de EPP`);
    return estados;
  } catch (error) {
    logger.error("[EPP_SERVICE] Error obteniendo estados de EPP:", error);
    throw error;
  }
}

/**
 * Obtiene EPP disponibles (no asignados)
 */
export async function getEppDisponiblesService() {
  try {
    const epps = await AppDataSource.getRepository(Epp)
      .createQueryBuilder("epp")
      .leftJoinAndSelect("epp.tipoEpp", "tipoEpp")
      .leftJoinAndSelect("epp.estadosEpp", "estadosEpp")
      .leftJoin("epp.aCargoEpps", "aCargoEpp")
      .where("aCargoEpp.id IS NULL")
      .andWhere("estadosEpp.nombre = 'Disponible'")
      .getMany();

    logger.info(`[EPP_SERVICE] Obtenidos ${epps.length} EPP disponibles`);
    return epps;
  } catch (error) {
    logger.error("[EPP_SERVICE] Error obteniendo EPP disponibles:", error);
    throw error;
  }
}
