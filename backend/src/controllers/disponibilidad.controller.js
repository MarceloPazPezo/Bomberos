"use strict";
import {
  cerrarDisponibilidadService,
  createDisponibilidadService,
  deleteDisponibilidadService,
  getDisponibilidadActivaService,
  getDisponibilidadesService,
  getDisponibilidadService,
} from "../services/disponibilidad.service.js";
import {
  disponibilidadBomberoParamsValidation,
  disponibilidadCerrarValidation,
  disponibilidadCreateValidation,
  disponibilidadIdParamsValidation,
  disponibilidadQueryValidation,
} from "../validations/disponibilidad.validation.js";
import { handleErrorClient, handleErrorServer, handleSuccess } from "../handlers/responseHandlers.js";
import { getIO } from "../index.js";
import { emitDisponibilidadUpdate } from "../sockets/activeUsers.socket.js";

export async function getDisponibilidades(req, res) {
  try {
    const { error } = disponibilidadQueryValidation.validate(req.query);
    if (error) return handleErrorClient(res, 400, error.message);

    const [disponibilidades, errorDisponibilidades] = await getDisponibilidadesService(req.query);

    if (errorDisponibilidades) return handleErrorClient(res, 404, errorDisponibilidades);

    handleSuccess(res, 200, "Disponibilidades obtenidas", disponibilidades);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function createDisponibilidad(req, res) {
  try {
    const { error } = disponibilidadCreateValidation.validate(req.body);
    if (error) return handleErrorClient(res, 400, error.message);

    const [newDisponibilidad, disponibilidadError] = await createDisponibilidadService(req.body);

    if (disponibilidadError) return handleErrorClient(res, 400, disponibilidadError);

    // Emitir evento de socket cuando se crea una disponibilidad
    const io = getIO();
    if (io) {
      emitDisponibilidadUpdate(io, 'created', newDisponibilidad);
    }

    handleSuccess(res, 201, "Disponibilidad creada correctamente", newDisponibilidad);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function getDisponibilidad(req, res) {
  try {
    const { error } = disponibilidadIdParamsValidation.validate(req.params);
    if (error) return handleErrorClient(res, 400, error.message);

    const [disponibilidad, errorDisponibilidad] = await getDisponibilidadService(req.params);

    if (errorDisponibilidad) return handleErrorClient(res, 404, errorDisponibilidad);

    handleSuccess(res, 200, "Disponibilidad obtenida", disponibilidad);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function deleteDisponibilidad(req, res) {
  try {
    const { error } = disponibilidadIdParamsValidation.validate(req.params);
    if (error) return handleErrorClient(res, 400, error.message);

    const [disponibilidadDelete, errorDisponibilidadDelete] = await deleteDisponibilidadService(req.params);

    if (errorDisponibilidadDelete) return handleErrorClient(res, 404, errorDisponibilidadDelete);

    handleSuccess(res, 200, "Disponibilidad eliminada correctamente", disponibilidadDelete);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function cerrarDisponibilidad(req, res) {
  try {
    const { error } = disponibilidadCerrarValidation.validate(req.body);
    if (error) return handleErrorClient(res, 400, error.message);

    const [disponibilidad, disponibilidadError] = await cerrarDisponibilidadService({}, req.body);

    if (disponibilidadError) return handleErrorClient(res, 400, disponibilidadError);

    // Emitir evento de socket cuando se cierra una disponibilidad
    const io = getIO();
    if (io) {
      emitDisponibilidadUpdate(io, 'closed', disponibilidad);
    }

    handleSuccess(res, 200, "Disponibilidad cerrada correctamente", disponibilidad);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function getDisponibilidadActiva(req, res) {
  try {
    const { error } = disponibilidadBomberoParamsValidation.validate(req.params);
    if (error) return handleErrorClient(res, 400, error.message);

    const [disponibilidad, disponibilidadError] = await getDisponibilidadActivaService(req.params.idBombero);

    if (disponibilidadError) return handleErrorClient(res, 404, disponibilidadError);

    handleSuccess(res, 200, "Disponibilidad activa obtenida", disponibilidad);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}