"use strict";
import { Router } from "express";
import { listarParaRevision } from "../controllers/revisionPartes.controller.js";

const router = Router();

// GET /incidentes/revision?estados=ENVIADO,APROBADO,RECHAZADO
router.get("/revision", listarParaRevision);

export default router;
