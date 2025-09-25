"use strict";

import { Router } from "express";   
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { authorizePermisos } from "../middlewares/authorization.middleware.js";
import { obtenerCarrosPorCompania } from "../controllers/carro.controller.js";

const router = Router();
router.use(authenticateJwt);

router.get(
  "/compania/:companiaId",
  obtenerCarrosPorCompania,
);
export default router;
