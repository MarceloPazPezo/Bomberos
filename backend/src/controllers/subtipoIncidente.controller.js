"use strict";
import { handleErrorClient, handleErrorServer, handleSuccess } from "../handlers/responseHandlers.js";

import { 
  getClasificacionEmergencia, 
  getFaseIncidente, 
  getSubtipoIncidentes, 
  getTipoDano,
  getSubtipoIncidenteService,
  getSubtiposIncidentesService,
  createSubtipoIncidenteService,
  updateSubtipoIncidenteService,
  deleteSubtipoIncidenteService
} from "../services/subtipoIncidente.service.js";
import logger from "../config/configLogger.js";


export async function obtenerclasificacionesEmergencia(req, res) {
    try {
        const data = await getClasificacionEmergencia();
     
        handleSuccess(res, 200, "Clasificaciones obtenidas", data);
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }   
}

export async function obtenerSubtipoIncidente(req, res) {
    try {
        const id = req.params.id;
       
        if (!id || isNaN(Number(id))) {
            return handleErrorClient(res, 400, "ID de clasificación inválido");
        }
        const data = await getSubtipoIncidentes(id);
   
        handleSuccess(res, 200, "Subtipos obtenidos", data);
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}

export async function obtenerTipoDano(req, res) {
    try {
        const data = await getTipoDano();
   
        handleSuccess(res, 200, "Tipos de daño obtenidos", data);
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}

export async function obtenerFaseIncidente(req, res) {
    try {
        const data = await getFaseIncidente();
    
        handleSuccess(res, 200, "Fases de incidente obtenidas", data);
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}

// ===== CRUD COMPLETO PARA SUBTIPO INCIDENTE =====

export async function getSubtipoIncidente(req, res) {
  try {
    const { id } = req.params;
    
    const queryParams = {
      id: parseInt(id, 10),
    };
    
    if (isNaN(queryParams.id)) {
      return handleErrorClient(res, 400, "ID inválido");
    }

    const [subtipo, errorSubtipo] = await getSubtipoIncidenteService(queryParams);

    if (errorSubtipo) return handleErrorClient(res, 404, errorSubtipo);

    handleSuccess(res, 200, "Subtipo de incidente encontrado", subtipo);
  } catch (error) {
    logger.error("Error en getSubtipoIncidente:", error);
    handleErrorServer(res, 500, error.message);
  }
}

export async function getSubtiposIncidentes(req, res) {
  try {
    const { page, limit, clasificacion } = req.query;
    const [subtipos, errorSubtipos, total] = await getSubtiposIncidentesService({ 
      page, 
      limit, 
      clasificacion 
    });

    if (errorSubtipos) return handleErrorClient(res, 404, errorSubtipos);

    if (!subtipos || subtipos.length === 0) {
      return handleSuccess(res, 200, "No se encontraron subtipos de incidente", []);
    }

    handleSuccess(res, 200, "Subtipos de incidente encontrados", subtipos, total);
  } catch (error) {
    logger.error("Error en getSubtiposIncidentes:", error);
    handleErrorServer(res, 500, error.message);
  }
}

export async function updateSubtipoIncidente(req, res) {
  try {
    const { id } = req.params;
    const { body } = req;

    const queryParams = {
      id: parseInt(id, 10),
    };

    if (isNaN(queryParams.id)) {
      return handleErrorClient(res, 400, "ID inválido");
    }

    const [subtipo, subtipoError] = await updateSubtipoIncidenteService(queryParams, body);

    if (subtipoError)
      return handleErrorClient(res, 400, "Error modificando el subtipo de incidente", subtipoError);

    handleSuccess(res, 200, "Subtipo de incidente modificado correctamente", subtipo);
  } catch (error) {
    logger.error("Error en updateSubtipoIncidente:", error);
    handleErrorServer(res, 500, error.message);
  }
}

export async function deleteSubtipoIncidente(req, res) {
  try {
    const { id } = req.params;

    const queryParams = {
      id: parseInt(id, 10),
    };
    
    if (isNaN(queryParams.id)) {
      return handleErrorClient(res, 400, "ID inválido");
    }

    const [subtipoDelete, errorSubtipoDelete] = await deleteSubtipoIncidenteService(queryParams);

    if (errorSubtipoDelete) {
      // Si el error es porque el subtipo no existe, usar 404
      if (errorSubtipoDelete === "Subtipo de incidente no encontrado") {
        return handleErrorClient(
          res,
          404,
          "Subtipo de incidente no encontrado",
          errorSubtipoDelete,
        );
      }
      // Si el error es porque está asignado a incidentes, usar 409 (Conflict)
      return handleErrorClient(
        res,
        409,
        "No se puede eliminar el subtipo de incidente",
        errorSubtipoDelete,
      );
    }

    handleSuccess(res, 200, "Subtipo de incidente eliminado correctamente", subtipoDelete);
  } catch (error) {
    logger.error("Error en deleteSubtipoIncidente:", error);
    handleErrorServer(res, 500, error.message);
  }
}

export async function createSubtipoIncidente(req, res) {
  try {
    const { body } = req;

    if (!body.claveRadial || body.claveRadial.trim().length === 0) {
      return handleErrorClient(res, 400, "La clave radial es requerida");
    }

    if (!body.clasificacion) {
      return handleErrorClient(res, 400, "La clasificación es requerida");
    }

    if (!body.descripcion || body.descripcion.trim().length === 0) {
      return handleErrorClient(res, 400, "La descripción es requerida");
    }

    const [subtipo, errorSubtipo] = await createSubtipoIncidenteService(body);

    if (errorSubtipo) return handleErrorClient(res, 400, errorSubtipo);

    handleSuccess(res, 201, "Subtipo de incidente creado correctamente", subtipo);
  } catch (error) {
    logger.error("Error en createSubtipoIncidente:", error);
    handleErrorServer(res, 500, error.message);
  }
}