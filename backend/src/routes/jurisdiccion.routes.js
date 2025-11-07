"use strict";
import { Router } from "express";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { authorizePermisos } from "../middlewares/authorization.middleware.js";
import { cleanEmptyStrings } from "../middlewares/cleanEmptyStrings.middleware.js";
import {
    createJurisdiccion,
    getJurisdicciones,
    getJurisdiccionById,
    updateJurisdiccion,
    deleteJurisdiccion,
    getJurisdiccionPorPunto,
} from "../controllers/jurisdiccion.controller.js";

const router = Router();

router.use(authenticateJwt);

// Obtener todas las jurisdicciones
router.get(
    "/",
    authorizePermisos(["jurisdiccion:obtener"]),
    getJurisdicciones
);

// Verificar en qué jurisdicción está un punto
router.get(
    "/punto",
    authorizePermisos(["jurisdiccion:obtener"]),
    getJurisdiccionPorPunto
);

// Obtener jurisdicción específica
router.get(
    "/:id",
    authorizePermisos(["jurisdiccion:obtener"]),
    getJurisdiccionById
);

// Crear jurisdicción
router.post(
    "/",
    authorizePermisos(["jurisdiccion:crear"]),
    cleanEmptyStrings,
    createJurisdiccion
);

// Actualizar jurisdicción
router.put(
    "/:id",
    authorizePermisos(["jurisdiccion:actualizar"]),
    cleanEmptyStrings,
    updateJurisdiccion
);

// Eliminar jurisdicción
router.delete(
    "/:id",
    authorizePermisos(["jurisdiccion:eliminar"]),
    deleteJurisdiccion
);

export default router;
