"use strict";
import { Router } from "express";
import { obtenerServicios } from "../controllers/servicio.controller.js";

const router = Router();
router.get("/", obtenerServicios);
export default router;