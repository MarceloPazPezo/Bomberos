"use strict";
import {
  handleErrorClient,
  handleErrorServer,
  handleSuccess,
} from "../handlers/responseHandlers.js";

import { getCarrosByCompania } from "../services/carro.service.js";

export async function obtenerCarrosPorCompania(req, res) {
    try {
        const { companiaId } = req.params;

        if (!companiaId || isNaN(companiaId)) {
            return handleErrorClient(res, 400, "ID de compañía inválido");
        }
        const carros = await getCarrosByCompania(parseInt(companiaId));
        if (carros.length === 0) {
            return handleSuccess(res, 204);
        }
        return handleSuccess(res, 200, "Carros encontrados", carros);
    } catch (error) {
        return handleErrorServer(res, 500, error.message);
    }
}