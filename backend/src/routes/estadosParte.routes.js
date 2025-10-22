"use strict";
import { Router } from "express";
import {listarEstadosReporte} from "../controllers/EstadosParteEmergencia..controller.js";

const router = Router();
router.get("/", listarEstadosReporte);
export default router;