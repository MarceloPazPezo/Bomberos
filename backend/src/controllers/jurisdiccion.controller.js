"use strict";
import {
    createJurisdiccionService,
    getJurisdiccionesService,
    getJurisdiccionByIdService,
    updateJurisdiccionService,
    deleteJurisdiccionService,
    getJurisdiccionPorPuntoService,
} from "../services/jurisdiccion.service.js";
import {
    jurisdiccionCreateValidation,
    jurisdiccionUpdateValidation,
    jurisdiccionPorPuntoQueryValidation,
} from "../validations/jurisdiccion.validation.js";
import {
    handleSuccess,
    handleErrorClient,
    handleErrorServer,
} from "../handlers/responseHandlers.js";

/**
 * Crear una nueva jurisdicción
 */
export async function createJurisdiccion(req, res) {
    try {
        const { error } = jurisdiccionCreateValidation.validate(req.body);
        if (error) return handleErrorClient(res, 400, error.message);

        const { body, bombero } = req;
        const data = { ...body, creadoPor: bombero?.id };

        const [jurisdiccion, errorService] = await createJurisdiccionService(data);

        if (errorService) return handleErrorClient(res, 400, errorService);

        handleSuccess(res, 201, "Jurisdicción creada correctamente", jurisdiccion);
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}

/**
 * Obtener todas las jurisdicciones
 */
export async function getJurisdicciones(req, res) {
    try {
        const { idCompania } = req.query;

        const filtros = {};
        if (idCompania) filtros.idCompania = parseInt(idCompania);

        const [jurisdicciones, errorService] = await getJurisdiccionesService(filtros);

        if (errorService) return handleErrorClient(res, 404, errorService);

        jurisdicciones.length === 0
            ? handleSuccess(res, 204)
            : handleSuccess(res, 200, "Jurisdicciones encontradas", jurisdicciones);
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}

/**
 * Obtener jurisdicción por ID
 */
export async function getJurisdiccionById(req, res) {
    try {
        const { id } = req.params;

        const [jurisdiccion, errorService] = await getJurisdiccionByIdService(id);

        if (errorService) return handleErrorClient(res, 404, errorService);

        handleSuccess(res, 200, "Jurisdicción encontrada", jurisdiccion);
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}

/**
 * Actualizar jurisdicción
 */
export async function updateJurisdiccion(req, res) {
    try {
        const { id } = req.params;

        const { error } = jurisdiccionUpdateValidation.validate(req.body);
        if (error) return handleErrorClient(res, 400, error.message);

        const { body, bombero } = req;
        const data = { ...body, actualizadoPor: bombero?.id };

        const [jurisdiccion, errorService] = await updateJurisdiccionService(id, data);

        if (errorService) return handleErrorClient(res, 400, errorService);

        handleSuccess(
            res,
            200,
            "Jurisdicción actualizada correctamente",
            jurisdiccion
        );
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}

/**
 * Eliminar jurisdicción
 */
export async function deleteJurisdiccion(req, res) {
    try {
        const { id } = req.params;

        const [result, errorService] = await deleteJurisdiccionService(id);

        if (errorService) return handleErrorClient(res, 404, errorService);

        handleSuccess(res, 200, result.message);
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}

/**
 * Verificar en qué jurisdicción está un punto
 */
export async function getJurisdiccionPorPunto(req, res) {
    try {
        const { error } = jurisdiccionPorPuntoQueryValidation.validate(req.query);
        if (error) return handleErrorClient(res, 400, error.message);

        const { lat, lng } = req.query;

        const [jurisdiccion, errorService] = await getJurisdiccionPorPuntoService(
            parseFloat(lat),
            parseFloat(lng)
        );

        if (errorService) return handleErrorClient(res, 404, errorService);

        handleSuccess(res, 200, "Jurisdicción encontrada", jurisdiccion);
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}
