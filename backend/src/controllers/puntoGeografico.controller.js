"use strict";
import {
    createPuntoGeograficoService,
    getPuntosGeograficosService,
    getPuntoGeograficoByIdService,
    updatePuntoGeograficoService,
    deletePuntoGeograficoService,
    getPuntosCercanosService,
} from "../services/puntoGeografico.service.js";
import {
    puntoGeograficoCreateValidation,
    puntoGeograficoUpdateValidation,
    puntosCercanosQueryValidation,
} from "../validations/puntoGeografico.validation.js";
import {
    handleSuccess,
    handleErrorClient,
    handleErrorServer,
} from "../handlers/responseHandlers.js";

/**
 * Crear un nuevo punto geográfico
 */
export async function createPuntoGeografico(req, res) {
    try {
        const { error } = puntoGeograficoCreateValidation.validate(req.body);
        if (error) return handleErrorClient(res, 400, error.message);

        const { body, bombero } = req;
        const data = { ...body, creadoPor: bombero?.id };

        const [punto, errorService] = await createPuntoGeograficoService(data);

        if (errorService) return handleErrorClient(res, 400, errorService);

        handleSuccess(res, 201, "Punto geográfico creado correctamente", punto);
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}

/**
 * Obtener todos los puntos geográficos
 */
export async function getPuntosGeograficos(req, res) {
    try {
        const { idTipoPunto, idCompania } = req.query;

        const filtros = {};
        if (idTipoPunto) filtros.idTipoPunto = parseInt(idTipoPunto);
        if (idCompania) filtros.idCompania = parseInt(idCompania);

        const [puntos, errorService] = await getPuntosGeograficosService(filtros);

        if (errorService) return handleErrorClient(res, 404, errorService);

        puntos.length === 0
            ? handleSuccess(res, 204)
            : handleSuccess(res, 200, "Puntos geográficos encontrados", puntos);
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}

/**
 * Obtener punto geográfico por ID
 */
export async function getPuntoGeograficoById(req, res) {
    try {
        const { id } = req.params;

        const [punto, errorService] = await getPuntoGeograficoByIdService(id);

        if (errorService) return handleErrorClient(res, 404, errorService);

        handleSuccess(res, 200, "Punto geográfico encontrado", punto);
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}

/**
 * Actualizar punto geográfico
 */
export async function updatePuntoGeografico(req, res) {
    try {
        const { id } = req.params;

        const { error } = puntoGeograficoUpdateValidation.validate(req.body);
        if (error) return handleErrorClient(res, 400, error.message);

        const { body, bombero } = req;
        const data = { ...body, actualizadoPor: bombero?.id };

        const [punto, errorService] = await updatePuntoGeograficoService(id, data);

        if (errorService) return handleErrorClient(res, 400, errorService);

        handleSuccess(
            res,
            200,
            "Punto geográfico actualizado correctamente",
            punto
        );
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}

/**
 * Eliminar punto geográfico
 */
export async function deletePuntoGeografico(req, res) {
    try {
        const { id } = req.params;

        const [result, errorService] = await deletePuntoGeograficoService(id);

        if (errorService) return handleErrorClient(res, 404, errorService);

        handleSuccess(res, 200, result.message);
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}

/**
 * Buscar puntos cercanos a una ubicación
 */
export async function getPuntosCercanos(req, res) {
    try {
        const { error } = puntosCercanosQueryValidation.validate(req.query);
        if (error) return handleErrorClient(res, 400, error.message);

        const { lat, lng, radio } = req.query;

        const [puntos, errorService] = await getPuntosCercanosService(
            parseFloat(lat),
            parseFloat(lng),
            radio ? parseFloat(radio) : 5000
        );

        if (errorService) return handleErrorClient(res, 400, errorService);

        handleSuccess(res, 200, "Puntos cercanos encontrados", puntos);
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}
