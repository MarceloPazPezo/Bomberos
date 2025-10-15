"use strict";
import { Router } from "express";
import { obtenerEventos, crearEvento, obtenerTiposEvento, actualizarEvento, eliminarEvento } from "../controllers/caledarioOperativo.controller.js";

const router = Router();
router.get("/eventos", obtenerEventos);
router.post("/eventos", crearEvento);
router.put("/eventos/:id", actualizarEvento);
router.delete("/eventos/:id", eliminarEvento);
router.get("/tipos-evento", obtenerTiposEvento);

export default router;

