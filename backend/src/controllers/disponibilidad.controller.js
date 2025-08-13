"use strict";
import {
  createDisponibilidadService,
  deleteDisponibilidadService,
  getDisponibilidadService,
  getDisponibilidadesService,
  updateDisponibilidadService,
  changeDisponibilidadStatusService,
  getDisponibilidadActivaService,
} from "../services/disponibilidad.service.js";
import {
  disponibilidadBodyValidation,
  disponibilidadQueryValidation,
} from "../validations/disponibilidad.validation.js";
import { handleErrorClient, handleErrorServer, handleSuccess } from "../handlers/responseHandlers.js";

export async function getDisponibilidades(req, res) {
  try {
    const { error: queryError } = disponibilidadQueryValidation.validate(req.query);
    
    if (queryError) {
      return handleErrorClient(res, 400, queryError.message);
    }

    const [disponibilidades, errorDisponibilidades] = await getDisponibilidadesService(req.query);

    if (errorDisponibilidades) return handleErrorClient(res, 404, errorDisponibilidades);

    handleSuccess(res, 200, "Disponibilidades obtenidas", disponibilidades);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function createDisponibilidad(req, res) {
  try {
    const { error: bodyError } = disponibilidadBodyValidation.validate(req.body);
    
    if (bodyError) return handleErrorClient(res, 400, bodyError.message);

    const [newDisponibilidad, disponibilidadError] = await createDisponibilidadService(req.body);

    if (disponibilidadError) return handleErrorClient(res, 400, disponibilidadError);

    handleSuccess(res, 201, "Disponibilidad creada correctamente", newDisponibilidad);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function getDisponibilidad(req, res) {
  try {
    const { id } = req.params;

    const { error: queryError } = disponibilidadQueryValidation.validate({ id });
    
    if (queryError) {
      return handleErrorClient(res, 400, queryError.message);
    }

    const [disponibilidad, errorDisponibilidad] = await getDisponibilidadService({ id });

    if (errorDisponibilidad) return handleErrorClient(res, 404, errorDisponibilidad);

    handleSuccess(res, 200, "Disponibilidad obtenida", disponibilidad);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function updateDisponibilidad(req, res) {
  try {
    const { id } = req.params;

    const { error: queryError } = disponibilidadQueryValidation.validate({ id });
    
    if (queryError) {
      return handleErrorClient(res, 400, queryError.message);
    }

    const { error: bodyError } = disponibilidadBodyValidation.validate(req.body);
    
    if (bodyError) return handleErrorClient(res, 400, bodyError.message);

    const [disponibilidad, disponibilidadError] = await updateDisponibilidadService({ id }, req.body);

    if (disponibilidadError) return handleErrorClient(res, 400, disponibilidadError);

    handleSuccess(res, 200, "Disponibilidad actualizada correctamente", disponibilidad);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function deleteDisponibilidad(req, res) {
  try {
    const { id } = req.params;

    const { error: queryError } = disponibilidadQueryValidation.validate({ id });
    
    if (queryError) {
      return handleErrorClient(res, 400, queryError.message);
    }

    const [disponibilidadDelete, errorDisponibilidadDelete] = await deleteDisponibilidadService({ id });

    if (errorDisponibilidadDelete) return handleErrorClient(res, 404, errorDisponibilidadDelete);

    handleSuccess(res, 200, "Disponibilidad eliminada correctamente", disponibilidadDelete);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function changeDisponibilidadStatus(req, res) {
  try {
    const { error: bodyError } = disponibilidadBodyValidation.validate(req.body);
    
    if (bodyError) return handleErrorClient(res, 400, bodyError.message);

    const [disponibilidad, disponibilidadError] = await changeDisponibilidadStatusService({}, req.body);

    if (disponibilidadError) return handleErrorClient(res, 400, disponibilidadError);

    handleSuccess(res, 200, "Estado de disponibilidad actualizado correctamente", disponibilidad);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function getDisponibilidadActiva(req, res) {
  try {
    const { usuario_id } = req.params;

    if (!usuario_id) {
      return handleErrorClient(res, 400, "usuario_id es requerido");
    }

    const [disponibilidad, disponibilidadError] = await getDisponibilidadActivaService(usuario_id);

    if (disponibilidadError) return handleErrorClient(res, 404, disponibilidadError);

    handleSuccess(res, 200, "Disponibilidad activa obtenida", disponibilidad);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}