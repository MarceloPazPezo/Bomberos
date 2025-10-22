"use strict";
import { Router } from "express";
import { listarIncidentesResumen } from "../controllers/incidenteResumen.controller.js";

const router = Router();
router.get("/resumen", listarIncidentesResumen);
export default router;
