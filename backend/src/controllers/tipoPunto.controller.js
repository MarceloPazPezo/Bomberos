"use strict";
import {
    createTipoPuntoService,
    getTiposPuntoService,
    getTipoPuntoByIdService,
    updateTipoPuntoService,
    deleteTipoPuntoService,
} from "../services/tipoPunto.service.js";
import {
    tipoPuntoCreateValidation,
    tipoPuntoUpdateValidation,
} from "../validations/tipoPunto.validation.js";
import {
    handleSuccess,
    handleErrorClient,
    handleErrorServer,
} from "../handlers/responseHandlers.js";

/**
 * Crear un nuevo tipo de punto
 */
export async function createTipoPunto(req, res) {
    try {
        const { error } = tipoPuntoCreateValidation.validate(req.body);
        if (error) return handleErrorClient(res, 400, error.message);

        const [tipo, errorService] = await createTipoPuntoService(req.body);

        if (errorService) return handleErrorClient(res, 400, errorService);

        handleSuccess(res, 201, "Tipo de punto creado correctamente", tipo);
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}

/**
 * Obtener todos los tipos de punto
 */
export async function getTiposPunto(req, res) {
    try {
        const { incluirInactivos } = req.query;
        const [tipos, error] = await getTiposPuntoService(
            incluirInactivos === "true"
        );

        if (error) return handleErrorClient(res, 404, error);

        tipos.length === 0
            ? handleSuccess(res, 204)
            : handleSuccess(res, 200, "Tipos de punto encontrados", tipos);
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}

/**
 * Obtener tipo de punto por ID
 */
export async function getTipoPuntoById(req, res) {
    try {
        const { id } = req.params;

        const [tipo, error] = await getTipoPuntoByIdService(id);

        if (error) return handleErrorClient(res, 404, error);

        handleSuccess(res, 200, "Tipo de punto encontrado", tipo);
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}

/**
 * Actualizar tipo de punto
 */
export async function updateTipoPunto(req, res) {
    try {
        const { id } = req.params;

        const { error } = tipoPuntoUpdateValidation.validate(req.body);
        if (error) return handleErrorClient(res, 400, error.message);

        const [tipo, errorService] = await updateTipoPuntoService(id, req.body);

        if (errorService) return handleErrorClient(res, 400, errorService);

        handleSuccess(res, 200, "Tipo de punto actualizado correctamente", tipo);
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}

/**
 * Eliminar tipo de punto
 */
export async function deleteTipoPunto(req, res) {
    try {
        const { id } = req.params;

        const [result, error] = await deleteTipoPuntoService(id);

        if (error) return handleErrorClient(res, 404, error);

        handleSuccess(res, 200, result.message);
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}

