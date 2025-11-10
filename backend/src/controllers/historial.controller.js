"use strict";
import { AppDataSource } from "../config/configDb.js";
import {
    handleErrorClient,
    handleErrorServer,
    handleSuccess,
} from "../handlers/responseHandlers.js";

export async function obtenerHistorialCompania(req, res) {
    try {
        const historialData = req.params;
        if (!historialData.idCompania) {
            return handleErrorClient(res, "ID de compañía es requerido", 400);
        }
        const result = await obtenerHistorialCompania(historialData);
        handleSuccess(res, result);
    } catch (error) {
        handleErrorServer(res, error);

    }
}