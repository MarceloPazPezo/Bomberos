"use strict";
import { handleErrorClient, handleErrorServer, handleSuccess } from "../handlers/responseHandlers.js";

import { getRegionesService,getComunasService } from "../services/direccion.service.js";

export async function getRegiones(req, res) {
    try {
        const data = await getRegionesService();
        

        handleSuccess(res, 200, "Regiones obtenidas", data);
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}

export async function getComunas(req, res) {
    try {
        const { id } = req.params;
        if (!id || isNaN(Number(id))) {
            return handleErrorClient(res, 400, "ID de región inválido");
        }


        const data = await getComunasService(id);
       

        handleSuccess(res, 200, "Comunas obtenidas", data);

    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}