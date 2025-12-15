"use strict";
import express from "express";
import {
  addCapacitacion,
  addContactoEmergencia,
  deleteCapacitacion,
  deleteContactoEmergencia,
  getImagenPerfilUrl,
  limpiarImagenesHuerfanas,
  updateCapacitacion,
  updateContactoEmergencia,
  updateInformacionPersonal,
  updateEppAsignado
} from "../controllers/perfilCompleto.controller.js";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { authorizePermisos } from "../middlewares/authorization.middleware.js";
import { cleanEmptyStrings } from "../middlewares/cleanEmptyStrings.middleware.js";
import { handleUploadError, uploadProfileFiles } from "../middlewares/upload.middleware.js";

const router = express.Router();

// Middleware de autenticación para todas las rutas
router.use(authenticateJwt);

router.patch(
  "/informacion-personal",
  uploadProfileFiles,
  handleUploadError,
  cleanEmptyStrings,
  authorizePermisos(["bombero:actualizar_perfil"]),
  updateInformacionPersonal
);

router.post(
  "/contactos-emergencia",
  cleanEmptyStrings,
  authorizePermisos(["bombero:actualizar_perfil"]),
  addContactoEmergencia
);

router.put(
  "/contactos-emergencia/:id",
  cleanEmptyStrings,
  authorizePermisos(["bombero:actualizar_perfil"]),
  updateContactoEmergencia
);

router.delete(
  "/contactos-emergencia/:id",
  authorizePermisos(["bombero:actualizar_perfil"]),
  deleteContactoEmergencia
);

router.post(
  "/capacitaciones",
  cleanEmptyStrings,
  authorizePermisos(["bombero:actualizar_perfil"]),
  addCapacitacion
);

router.put(
  "/capacitaciones/:id",
  cleanEmptyStrings,
  authorizePermisos(["bombero:actualizar_perfil"]),
  updateCapacitacion
);

router.delete(
  "/capacitaciones/:id",
  authorizePermisos(["bombero:actualizar_perfil"]),
  deleteCapacitacion
);

router.get(
  "/imagen-perfil-url",
  authorizePermisos(["bombero:obtener_perfil", "bombero:actualizar_perfil"]),
  getImagenPerfilUrl
);

router.post(
  "/limpiar-imagenes-huerfanas",
  authorizePermisos(["bombero:actualizar_perfil"]),
  limpiarImagenesHuerfanas
);

router.patch(
  "/epp/:idEpp",
  cleanEmptyStrings,
  authorizePermisos(["bombero:actualizar_perfil"]),
  updateEppAsignado
);

export default router;
