"use strict";
import { Router } from "express";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { authorizePermisos } from "../middlewares/authorization.middleware.js";
import { cleanEmptyStrings } from "../middlewares/cleanEmptyStrings.middleware.js";
import {
    createPuntoGeografico,
    getPuntosGeograficos,
    getPuntoGeograficoById,
    updatePuntoGeografico,
    deletePuntoGeografico,
    getPuntosCercanos,
} from "../controllers/puntoGeografico.controller.js";

const router = Router();

router.use(authenticateJwt);

// Obtener todos los puntos geográficos
router.get(
    "/",
    authorizePermisos(["puntoGeografico:obtener"]),
    getPuntosGeograficos
);

// Buscar puntos cercanos a una ubicación
router.get(
    "/cercanos",
    authorizePermisos(["puntoGeografico:obtener"]),
    getPuntosCercanos
);

// Obtener punto geográfico específico
router.get(
    "/:id",
    authorizePermisos(["puntoGeografico:obtener"]),
    getPuntoGeograficoById
);

// Crear punto geográfico
router.post(
    "/",
    authorizePermisos(["puntoGeografico:crear"]),
    cleanEmptyStrings,
    createPuntoGeografico
);

// Actualizar punto geográfico
router.put(
    "/:id",
    authorizePermisos(["puntoGeografico:actualizar"]),
    cleanEmptyStrings,
    updatePuntoGeografico
);

// Eliminar punto geográfico
router.delete(
    "/:id",
    authorizePermisos(["puntoGeografico:eliminar"]),
    deletePuntoGeografico
);

export default router;
