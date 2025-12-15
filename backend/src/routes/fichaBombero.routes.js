"use strict";
import { Router } from "express";
import {
  createFichaBombero,
  deleteFichaBombero,
  getFichaBombero,
  getFichasBombero,
  updateFichaBombero
} from "../controllers/fichaBombero.controller.js";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { authorizePermisos } from "../middlewares/authorization.middleware.js";

const router = Router();

// Aplicar autenticación a todas las rutas
router.use(authenticateJwt);

// Rutas CRUD para ficha de bombero
router.post("/", createFichaBombero);
router.get("/", getFichasBombero);
router.get("/:id", getFichaBombero);
router.get("/bombero/:idBombero", async (req, res, next) => {
  req.query.idBombero = req.params.idBombero;
  next();
}, getFichaBombero);
router.patch("/:id", updateFichaBombero);
router.delete("/:id", authorizePermisos(["bombero:eliminar", "bombero:admin"]), deleteFichaBombero);

export default router;
