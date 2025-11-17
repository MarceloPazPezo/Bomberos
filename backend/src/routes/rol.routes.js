"use strict";
import { Router } from "express";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { authorizePermisos } from "../middlewares/authorization.middleware.js";
import {
  createRol,
  deleteRol,
  getRol,
  getRoles,
  updateRol,
} from "../controllers/rol.controller.js";

const router = Router();

router.use(authenticateJwt);

router.get("/", authorizePermisos(["rol:obtener"]), getRoles);
router.get("/detalle/:id", authorizePermisos(["rol:admin"]), getRol);
router.patch("/detalle/:id", authorizePermisos(["rol:admin"]), updateRol);
router.delete("/detalle/:id", authorizePermisos(["rol:admin"]), deleteRol);
router.post("/", authorizePermisos(["rol:admin"]), createRol);

export default router;
