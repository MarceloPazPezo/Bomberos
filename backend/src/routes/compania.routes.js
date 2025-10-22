"use strict";
import { Router } from "express";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { authorizePermisos } from "../middlewares/authorization.middleware.js";
import { cleanEmptyStrings } from "../middlewares/cleanEmptyStrings.middleware.js";
import {
  getCompania,
  getCompanias,
  createCompania,
  updateCompania,
  deleteCompania,
  getCompaniaBombero,
  getCompaniaLogoUrl,
  getCompaniaBannerUrl,
} from "../controllers/compania.controller.js";

const router = Router();

router.use(authenticateJwt);

router.get("/", 
  //authorizePermisos(["compania:obtener"]), 
  getCompanias);


router.get(
  "/detalle/:id",
  authorizePermisos(["compania:admin"]),
  getCompania,
);
router.get(
  "/bombero/:idBombero",
  authorizePermisos(["compania:bombero_pertenece"]),
  getCompaniaBombero,
);
router.get(
  "/:id/logo-url",
  authorizePermisos(["compania:obtener"]),
  getCompaniaLogoUrl,
);
router.get(
  "/:id/banner-url",
  authorizePermisos(["compania:obtener"]),
  getCompaniaBannerUrl,
);
router.post(
  "/",
  cleanEmptyStrings,
  authorizePermisos(["compania:admin"]),
  createCompania,
);
router.patch(
  "/detalle/:id",
  cleanEmptyStrings,
  authorizePermisos(["compania:admin"]),
  updateCompania,
);
router.delete(
  "/detalle/:id",
  authorizePermisos(["compania:admin"]),
  deleteCompania,
);

export default router;
