"use strict";
import {
  assignEppToBomberoService,
  createEppService,
  deleteEppService,
  getEppByIdService,
  getEppDisponiblesService,
  getEppService,
  getEstadosEppService,
  getTiposEppService,
  unassignEppFromBomberoService,
  updateEppService
} from "../services/epp.service.js";
import { handleErrorClient, handleErrorServer, handleSuccess } from "../handlers/responseHandlers.js";
import logger from "../config/configLogger.js";

/**
 * Obtiene todos los EPP con paginación y filtros
 */
export async function getEpp(req, res) {
  try {
    const { page, limit, search, idTipoEpp, idEstadoEpp, idBombero } = req.query;

    logger.info("[EPP_CONTROLLER] Obteniendo EPP con filtros:", {
      page, limit, search, idTipoEpp, idEstadoEpp, idBombero
    });

    const result = await getEppService({
      page,
      limit,
      search,
      idTipoEpp,
      idEstadoEpp,
      idBombero
    });

    return handleSuccess(res, 200, "EPP obtenidos exitosamente", result);
  } catch (error) {
    logger.error("[EPP_CONTROLLER] Error obteniendo EPP:", error);
    return handleErrorServer(res, 500, "Error interno del servidor");
  }
}

/**
 * Obtiene un EPP por ID
 */
export async function getEppById(req, res) {
  try {
    const { id } = req.params;

    logger.info(`[EPP_CONTROLLER] Obteniendo EPP ${id}`);

    const epp = await getEppByIdService(id);

    return handleSuccess(res, 200, "EPP obtenido exitosamente", epp);
  } catch (error) {
    logger.error(`[EPP_CONTROLLER] Error obteniendo EPP ${req.params.id}:`, error);

    if (error.message.includes("no encontrado")) {
      return handleErrorClient(res, 404, error.message);
    }

    return handleErrorServer(res, 500, "Error interno del servidor");
  }
}

/**
 * Crea un nuevo EPP
 */
export async function createEpp(req, res) {
  try {
    const eppData = req.body;
    const userId = req.bombero.id;

    logger.info("[EPP_CONTROLLER] Creando EPP:", eppData);

    // Validaciones básicas
    if (!eppData.nombre) {
      return handleErrorClient(res, 400, "El nombre del EPP es requerido");
    }

    if (!eppData.idTipoEpp) {
      return handleErrorClient(res, 400, "El tipo de EPP es requerido");
    }

    if (!eppData.idEstadoEpp) {
      return handleErrorClient(res, 400, "El estado del EPP es requerido");
    }

    const epp = await createEppService(eppData, userId);

    return handleSuccess(res, 201, "EPP creado exitosamente", epp);
  } catch (error) {
    logger.error("[EPP_CONTROLLER] Error creando EPP:", error);

    if (error.message.includes("no encontrado")) {
      return handleErrorClient(res, 400, error.message);
    }

    return handleErrorServer(res, 500, "Error interno del servidor");
  }
}

/**
 * Actualiza un EPP existente
 */
export async function updateEpp(req, res) {
  try {
    const { id } = req.params;
    const eppData = req.body;
    const userId = req.bombero.id;

    logger.info(`[EPP_CONTROLLER] Actualizando EPP ${id}:`, eppData);

    const epp = await updateEppService(id, eppData, userId);

    return handleSuccess(res, 200, "EPP actualizado exitosamente", epp);
  } catch (error) {
    logger.error(`[EPP_CONTROLLER] Error actualizando EPP ${req.params.id}:`, error);

    if (error.message.includes("no encontrado")) {
      return handleErrorClient(res, 404, error.message);
    }

    return handleErrorServer(res, 500, "Error interno del servidor");
  }
}

/**
 * Elimina un EPP
 */
export async function deleteEpp(req, res) {
  try {
    const { id } = req.params;

    logger.info(`[EPP_CONTROLLER] Eliminando EPP ${id}`);

    await deleteEppService(id);

    return handleSuccess(res, 200, "EPP eliminado exitosamente");
  } catch (error) {
    logger.error(`[EPP_CONTROLLER] Error eliminando EPP ${req.params.id}:`, error);

    if (error.message.includes("no encontrado")) {
      return handleErrorClient(res, 404, error.message);
    }

    if (error.message.includes("asignado")) {
      return handleErrorClient(res, 400, error.message);
    }

    return handleErrorServer(res, 500, "Error interno del servidor");
  }
}

/**
 * Asigna un EPP a un bombero
 */
export async function assignEppToBombero(req, res) {
  try {
    const { id } = req.params;
    const { fichaBomberoId } = req.body;
    const userId = req.bombero.id;

    logger.info(`[EPP_CONTROLLER] Asignando EPP ${id} a ficha ${fichaBomberoId}`);

    if (!fichaBomberoId) {
      return handleErrorClient(res, 400, "El ID de la ficha del bombero es requerido");
    }

    const asignacion = await assignEppToBomberoService(id, fichaBomberoId, userId);

    return handleSuccess(res, 200, "EPP asignado exitosamente", asignacion);
  } catch (error) {
    logger.error(`[EPP_CONTROLLER] Error asignando EPP:`, error);

    if (error.message.includes("no encontrado") || error.message.includes("asignado")) {
      return handleErrorClient(res, 400, error.message);
    }

    return handleErrorServer(res, 500, "Error interno del servidor");
  }
}

/**
 * Desasigna un EPP de un bombero
 */
export async function unassignEppFromBombero(req, res) {
  try {
    const { id } = req.params;
    const userId = req.bombero?.id || null;

    logger.info(`[EPP_CONTROLLER] Desasignando EPP ${id}`);

    await unassignEppFromBomberoService(id, userId);

    return handleSuccess(res, 200, "EPP desasignado exitosamente");
  } catch (error) {
    logger.error(`[EPP_CONTROLLER] Error desasignando EPP:`, error);

    if (error.message.includes("no encontrado")) {
      return handleErrorClient(res, 404, error.message);
    }

    return handleErrorServer(res, 500, "Error interno del servidor");
  }
}

/**
 * Obtiene todos los tipos de EPP
 */
export async function getTiposEpp(req, res) {
  try {
    logger.info("[EPP_CONTROLLER] Obteniendo tipos de EPP");

    const tipos = await getTiposEppService();

    return handleSuccess(res, 200, "Tipos de EPP obtenidos exitosamente", tipos);
  } catch (error) {
    logger.error("[EPP_CONTROLLER] Error obteniendo tipos de EPP:", error);
    return handleErrorServer(res, 500, "Error interno del servidor");
  }
}

/**
 * Obtiene todos los estados de EPP
 */
export async function getEstadosEpp(req, res) {
  try {
    logger.info("[EPP_CONTROLLER] Obteniendo estados de EPP");

    const estados = await getEstadosEppService();

    return handleSuccess(res, 200, "Estados de EPP obtenidos exitosamente", estados);
  } catch (error) {
    logger.error("[EPP_CONTROLLER] Error obteniendo estados de EPP:", error);
    return handleErrorServer(res, 500, "Error interno del servidor");
  }
}

/**
 * Obtiene EPP disponibles (no asignados)
 */
export async function getEppDisponibles(req, res) {
  try {
    logger.info("[EPP_CONTROLLER] Obteniendo EPP disponibles");

    const epps = await getEppDisponiblesService();

    return handleSuccess(res, 200, "EPP disponibles obtenidos exitosamente", epps);
  } catch (error) {
    logger.error("[EPP_CONTROLLER] Error obteniendo EPP disponibles:", error);
    return handleErrorServer(res, 500, "Error interno del servidor");
  }
}

/**
 * Obtiene estadísticas del inventario
 */
export async function getInventarioStats(req, res) {
  try {
    logger.info("[EPP_CONTROLLER] Obteniendo estadísticas del inventario");

    // Obtener conteos básicos
    const [
      totalEpps,
      eppsDisponibles,
      tiposCount
    ] = await Promise.all([
      getEppService({ limit: 1000 }), // Obtener todos para contar
      getEppDisponiblesService(),
      getTiposEppService()
    ]);

    // Contar EPP asignados (que tienen aCargoEpps)
    const eppsAsignados = totalEpps.epps.filter(epp => epp.aCargoEpps && epp.aCargoEpps.length > 0);

    // Calcular tipos de EPP disponibles (que tienen al menos un ítem disponible)
    const tiposDisponiblesSet = new Set(eppsDisponibles.map(epp => epp.tipoEpp?.id).filter(id => id != null));
    const tiposDisponibles = tiposDisponiblesSet.size;

    const stats = {
      totalEpps: totalEpps.pagination.total,
      eppsDisponibles: eppsDisponibles.length,
      eppsAsignados: eppsAsignados.length,
      totalTipos: new Set(totalEpps.epps.map(epp => epp.tipoEpp?.id).filter(id => id != null)).size,
      tiposDisponibles: tiposDisponibles, // Nueva estadística
      porcentajeDisponibilidad: totalEpps.pagination.total > 0
        ? Math.round((eppsDisponibles.length / totalEpps.pagination.total) * 100)
        : 0
    };

    return handleSuccess(res, 200, "Estadísticas obtenidas exitosamente", stats);
  } catch (error) {
    logger.error("[EPP_CONTROLLER] Error obteniendo estadísticas:", error);
    return handleErrorServer(res, 500, "Error interno del servidor");
  }
}
