"use strict";
import { Router } from "express";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { authorizePermisos, authorizeRoles } from "../middlewares/authorization.middleware.js";
import { cleanEmptyStrings } from "../middlewares/cleanEmptyStrings.middleware.js";
import { uploadSingle } from "../middlewares/upload.middleware.js";
import {
  // CRUD básico
  deleteBombero,
  getBombero,
  getBomberos,
  updateBombero,
  createBombero,
  changeBomberoStatus,

  // Funcionalidades por compañía
  getBomberosByCompania,
  getBomberosMiCompania,
  getMiCompania,
  getEstadisticasBomberosCompania,
  getEstadisticasMiCompania,
  getBomberosOtrasCompanias,
  getBomberosConLicencias,
  getBomberosPorCompania,

  // Detalles completos
  getBomberoDetalles,
  generarFichaBomberoPdf,

  // Funcionalidades unificadas
  createBomberoWithOptionalFicha,
  createBomberoWithImage,
  getBomberoComplete,
  getAllBomberosWithFicha,
  addFichaToBombero,
  getBomberoImagenPerfilUrl,
} from "../controllers/bombero.controller.js";

const router = Router();

// Middleware de autenticación para todas las rutas
router.use(authenticateJwt);

// ==================== CRUD BÁSICO ====================

// Obtener todos los bomberos con filtros
router.get("/", authorizePermisos(["bombero:obtener"]), getBomberos);

// Obtener un bombero específico
router.get("/detalle/:id", authorizePermisos(["bombero:obtener_especifico"]), getBombero);

// Crear un bombero básico
router.post("/", cleanEmptyStrings, authorizePermisos(["bombero:crear"]), createBombero);

// Actualizar un bombero
router.patch("/detalle/:id", cleanEmptyStrings, authorizePermisos(["bombero:actualizar"]), updateBombero);
router.patch("/", cleanEmptyStrings, authorizePermisos(["bombero:actualizar"]), updateBombero);

// Eliminar un bombero
router.delete("/detalle/:id", authorizePermisos(["bombero:eliminar"]), deleteBombero);
router.delete("/", authorizePermisos(["bombero:eliminar"]), deleteBombero);

// Cambiar estado de un bombero
router.patch("/estado/:id", authorizePermisos(["bombero:cambiar_estado"]), changeBomberoStatus);

// ==================== FUNCIONALIDADES POR COMPAÑÍA ====================

// Obtener bomberos por compañía específica
router.get("/compania/:idCompania", authorizePermisos(["bombero:obtener", "bombero:admin"]), getBomberosByCompania);

// Obtener bomberos por compañía (alias para compatibilidad)
router.get("/compania/:idCompania/bomberos", authorizePermisos(["bombero:obtener", "bombero:admin"]), getBomberosPorCompania);

// Obtener bomberos con licencias de una compañía
router.get("/licencias/:idCompania", authorizePermisos(["bombero:obtener"]), getBomberosConLicencias);

// Obtener la compañía del usuario autenticado
router.get("/mi-compania", authorizePermisos(["compania:bombero_pertenece", "compania:obtener"]), getMiCompania);

// Obtener bomberos de la compañía del usuario autenticado
router.get("/mi-compania/bomberos", authorizePermisos(["bombero:obtener", "bombero:admin"]), getBomberosMiCompania);

// Obtener estadísticas de bomberos de la compañía del usuario autenticado
router.get("/mi-compania/estadisticas", authorizePermisos(["bombero:obtener", "bombero:admin"]), getEstadisticasMiCompania);

// Obtener estadísticas de bomberos de una compañía específica
router.get("/compania/:idCompania/estadisticas", authorizePermisos(["bombero:obtener", "bombero:admin"]), getEstadisticasBomberosCompania);

// Obtener bomberos de otras compañías
router.get("/otras-companias", authorizePermisos(["bombero:obtener", "bombero:admin"]), getBomberosOtrasCompanias);

// ==================== DETALLES COMPLETOS ====================

// Obtener detalles completos de un bombero
router.get("/:id/detalles", authorizePermisos(["bombero:obtener", "bombero:obtener_perfil"]), getBomberoDetalles);

// Generar PDF de ficha de bombero
router.post("/:id/ficha/pdf", authorizePermisos(["bombero:obtener", "bombero:admin"]), generarFichaBomberoPdf);

// ==================== FUNCIONALIDADES UNIFICADAS ====================

// Crear bombero con ficha opcional (sin imagen)
router.post("/with-ficha", authorizePermisos(["bombero:crear", "bombero:admin"]), createBomberoWithOptionalFicha);

// Crear bombero con ficha opcional e imagen de perfil
router.post("/with-image", authorizePermisos(["bombero:crear", "bombero:admin"]), uploadSingle('profileImage'), createBomberoWithImage);

// Obtener bombero completo con ficha (si existe)
router.get("/:id/complete", authorizePermisos(["bombero:obtener", "bombero:obtener_perfil"]), getBomberoComplete);

// Obtener todos los bomberos con información de ficha
router.get("/complete", authorizePermisos(["bombero:obtener", "bombero:admin"]), getAllBomberosWithFicha);

// Agregar ficha a un bombero existente
router.post("/:id/add-ficha", authorizePermisos(["bombero:crear", "bombero:admin"]), addFichaToBombero);

// Obtener URL firmada de imagen de perfil de un bombero específico
router.get("/:id/imagen-perfil-url", authorizePermisos(["bombero:obtener", "bombero:obtener_perfil", "bombero:admin"]), getBomberoImagenPerfilUrl);

export default router;
