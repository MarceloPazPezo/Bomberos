"use strict";
import { Router } from "express";

import { crearParteEmergencia } from "../controllers/parteEmergencia.controller.js";

const router = Router();
router.post("/", crearParteEmergencia);
export default router;