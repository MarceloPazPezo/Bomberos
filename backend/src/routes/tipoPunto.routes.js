"use strict";
import { Router } from "express";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { authorizePermisos } from "../middlewares/authorization.middleware.js";
import { cleanEmptyStrings } from "../middlewares/cleanEmptyStrings.middleware.js";
import {
    createTipoPunto,
    getTiposPunto,
    getTipoPuntoById,
    updateTipoPunto,
    deleteTipoPunto,
} from "../controllers/tipoPunto.controller.js";

const router = Router();

router.use(authenticateJwt);

// Obtener todos los tipos de punto
router.get(
    "/",
    authorizePermisos(["puntoGeografico:obtener"]),
    getTiposPunto
);

// Obtener tipo de punto específico
router.get(
    "/:id",
    authorizePermisos(["puntoGeografico:obtener"]),
    getTipoPuntoById
);

// Crear tipo de punto
router.post(
    "/",
    authorizePermisos(["puntoGeografico:crear"]),
    cleanEmptyStrings,
    createTipoPunto
);

// Actualizar tipo de punto
router.put(
    "/:id",
    authorizePermisos(["puntoGeografico:actualizar"]),
    cleanEmptyStrings,
    updateTipoPunto
);

// Eliminar tipo de punto
router.delete(
    "/:id",
    authorizePermisos(["puntoGeografico:eliminar"]),
    deleteTipoPunto
);

export default router;
