"use strict";
import express from "express";
import { 
  updateInformacionPersonal,
  addContactoEmergencia,
  updateContactoEmergencia,
  deleteContactoEmergencia,
  addCapacitacion,
  updateCapacitacion,
  deleteCapacitacion,
  getImagenPerfilUrl,
  limpiarImagenesHuerfanas
} from "../controllers/perfilCompleto.controller.js";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { authorizePermisos } from "../middlewares/authorization.middleware.js";
import { cleanEmptyStrings } from "../middlewares/cleanEmptyStrings.middleware.js";
import { uploadProfileFiles, handleUploadError } from "../middlewares/upload.middleware.js";

const router = express.Router();

/**
 * Rutas para el perfil completo del bombero
 * Todas las rutas requieren autenticación y permisos específicos
 */

// Middleware de autenticación para todas las rutas
router.use(authenticateJwt);

/**
 * PATCH /api/perfil-completo/informacion-personal
 * Actualiza la información personal del bombero
 * Permisos: bombero:actualizar_perfil
 */
router.patch(
  "/informacion-personal",
  uploadProfileFiles,
  handleUploadError,
  cleanEmptyStrings,
  authorizePermisos(["bombero:actualizar_perfil"]),
  updateInformacionPersonal
);

/**
 * POST /api/perfil-completo/contactos-emergencia
 * Agrega un contacto de emergencia
 * Permisos: bombero:actualizar_perfil
 */
router.post(
  "/contactos-emergencia",
  cleanEmptyStrings,
  authorizePermisos(["bombero:actualizar_perfil"]),
  addContactoEmergencia
);

/**
 * PUT /api/perfil-completo/contactos-emergencia/:id
 * Actualiza un contacto de emergencia
 * Permisos: bombero:actualizar_perfil
 */
router.put(
  "/contactos-emergencia/:id",
  cleanEmptyStrings,
  authorizePermisos(["bombero:actualizar_perfil"]),
  updateContactoEmergencia
);

/**
 * DELETE /api/perfil-completo/contactos-emergencia/:id
 * Elimina un contacto de emergencia
 * Permisos: bombero:actualizar_perfil
 */
router.delete(
  "/contactos-emergencia/:id",
  authorizePermisos(["bombero:actualizar_perfil"]),
  deleteContactoEmergencia
);

/**
 * POST /api/perfil-completo/capacitaciones
 * Agrega una capacitación
 * Permisos: bombero:actualizar_perfil
 */
router.post(
  "/capacitaciones",
  cleanEmptyStrings,
  authorizePermisos(["bombero:actualizar_perfil"]),
  addCapacitacion
);

/**
 * PUT /api/perfil-completo/capacitaciones/:id
 * Actualiza una capacitación
 * Permisos: bombero:actualizar_perfil
 */
router.put(
  "/capacitaciones/:id",
  cleanEmptyStrings,
  authorizePermisos(["bombero:actualizar_perfil"]),
  updateCapacitacion
);

/**
 * DELETE /api/perfil-completo/capacitaciones/:id
 * Elimina una capacitación
 * Permisos: bombero:actualizar_perfil
 */
router.delete(
  "/capacitaciones/:id",
  authorizePermisos(["bombero:actualizar_perfil"]),
  deleteCapacitacion
);

/**
 * GET /api/perfil-completo/imagen-perfil-url
 * Genera URL firmada para imagen de perfil
 * Permisos: bombero:actualizar_perfil
 */
router.get(
  "/imagen-perfil-url",
  authorizePermisos(["bombero:actualizar_perfil"]),
  getImagenPerfilUrl
);

/**
 * POST /api/perfil-completo/limpiar-imagenes-huerfanas
 * Limpia imágenes de perfil huérfanas en MinIO
 * Permisos: bombero:actualizar_perfil (o podría ser un permiso de administrador)
 */
router.post(
  "/limpiar-imagenes-huerfanas",
  authorizePermisos(["bombero:actualizar_perfil"]),
  limpiarImagenesHuerfanas
);

export default router;
