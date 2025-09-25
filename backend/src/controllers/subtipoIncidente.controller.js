"use strict";
import { handleErrorClient, handleErrorServer, handleSuccess } from "../handlers/responseHandlers.js";

import { getClasificacionEmergencia, getSubtipoIncidentes, getTipoDano, getFaseIncidente } from "../services/subtipoIncidente.service.js";


export async function obtenerclasificacionesEmergencia(req, res) {
    try {
        const data = await getClasificacionEmergencia();
        console.log(data);
        handleSuccess(res, 200, "Clasificaciones obtenidas", data);
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }   
}

export async function obtenerSubtipoIncidente(req, res) {
    try {
        const id = req.params.id;
        console.log(id);
        if (!id || isNaN(Number(id))) {
            return handleErrorClient(res, 400, "ID de clasificación inválido");
        }
        const data = await getSubtipoIncidentes(id);
        console.log(data);
        handleSuccess(res, 200, "Subtipos obtenidos", data);
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}

export async function obtenerTipoDano(req, res) {
    try {
        const data = await getTipoDano();
        console.log(data);
        handleSuccess(res, 200, "Tipos de daño obtenidos", data);
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}
export async function obtenerFaseIncidente(req, res) {
    try {
        const data = await getFaseIncidente();
        console.log(data);
        handleSuccess(res, 200, "Fases de incidente obtenidas", data);
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}