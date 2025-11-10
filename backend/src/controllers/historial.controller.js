"use strict";
import { AppDataSource } from "../config/configDb.js";
import {
    handleErrorClient,
    handleErrorServer,
    handleSuccess,
} from "../handlers/responseHandlers.js";
import {obtenerHistorialCompaniaService, obtenerHistorialVoluntarioService} from "../services/historial.service.js";


export async function obtenerHistorialCompania(req, res) {
    try {
        const { idCompania } = req.params;
        if (!idCompania) {
            return handleErrorClient(res, 400, "ID de compañía es requerido");
        }
        const result = await obtenerHistorialCompaniaService(idCompania);
        handleSuccess(res, 200, "Historial de compañía obtenido exitosamente", result);
    } catch (error) {
        console.error('Error al obtener el historial de la compañía:', error);
        handleErrorServer(res, 500, error.message);
    }
}


export async function obtenerHistorialVoluntario(req, res) {
    try {
        const { idBombero } = req.params;
        if (!idBombero) {
            return handleErrorClient(res, 400, "ID de bombero es requerido");
        }
        const result = await obtenerHistorialVoluntarioService(idBombero);
        handleSuccess(res, 200, "Historial del voluntario obtenido exitosamente", result);
    } catch (error) {
        console.error('Error al obtener el historial del voluntario:', error);
        handleErrorServer(res, 500, error.message);
    }
}