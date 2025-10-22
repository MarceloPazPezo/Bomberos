"use strict";
import {
  createFichaBomberoService,
  getFichaBomberoService,
  updateFichaBomberoService,
  deleteFichaBomberoService,
  getFichasBomberoService
} from "../services/fichaBombero.service.js";
import {
  handleErrorClient,
  handleErrorServer,
  handleSuccess,
} from "../handlers/responseHandlers.js";

export async function createFichaBombero(req, res) {
  try {
    const { body } = req;
    const creadoPor = req.bombero?.id;

    // Validaciones básicas
    if (!body.idBombero) {
      return handleErrorClient(res, 400, "ID del bombero es requerido");
    }

    if (!body.nombre) {
      return handleErrorClient(res, 400, "Nombre es requerido");
    }

    if (!body.idCompania) {
      return handleErrorClient(res, 400, "ID de compañía es requerido");
    }

    const [ficha, errorFicha] = await createFichaBomberoService(body, creadoPor);

    if (errorFicha) {
      if (typeof errorFicha === 'object') {
        return handleErrorClient(res, 400, "Error de validación", errorFicha);
      }
      return handleErrorClient(res, 400, errorFicha);
    }

    handleSuccess(res, 201, "Ficha de bombero creada correctamente", ficha);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function getFichaBombero(req, res) {
  try {
    const { id } = req.params;
    const { idBombero } = req.query;

    const [ficha, errorFicha] = await getFichaBomberoService({
      id,
      idBombero
    });

    if (errorFicha) return handleErrorClient(res, 404, errorFicha);

    handleSuccess(res, 200, "Ficha de bombero encontrada", ficha);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function updateFichaBombero(req, res) {
  try {
    const { id } = req.params;
    const { body } = req;
    const actualizadoPor = req.bombero?.id;

    const [ficha, errorFicha] = await updateFichaBomberoService(id, body, actualizadoPor);

    if (errorFicha) return handleErrorClient(res, 400, errorFicha);

    handleSuccess(res, 200, "Ficha de bombero actualizada correctamente", ficha);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function deleteFichaBombero(req, res) {
  try {
    const { id } = req.params;

    const [result, errorFicha] = await deleteFichaBomberoService(id);

    if (errorFicha) return handleErrorClient(res, 400, errorFicha);

    handleSuccess(res, 200, "Ficha de bombero eliminada correctamente", { deleted: result });
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function getFichasBombero(req, res) {
  try {
    const queryParams = req.query;

    const [result, errorFichas] = await getFichasBomberoService(queryParams);

    if (errorFichas) return handleErrorClient(res, 404, errorFichas);

    handleSuccess(res, 200, "Fichas de bomberos obtenidas correctamente", result);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}
