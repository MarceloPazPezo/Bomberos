"use strict";
import { handleErrorClient, handleErrorServer, handleSuccess } from "../handlers/responseHandlers.js";
import { getServicios } from "../services/servicios.service.js";

export async function obtenerServicios(req, res) {
    try {
        const data = await getServicios();
   
        handleSuccess(res, 200, "Servicios obtenidos", data);
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}