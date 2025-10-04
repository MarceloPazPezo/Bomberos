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
  
  // Funcionalidades unificadas
  createBomberoWithOptionalFicha,
  createBomberoWithImage,
  getBomberoComplete,
  getAllBomberosWithFicha,
  addFichaToBombero,
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
router.get("/compania/:idCompania", authorizeRoles(['Administrador', 'Supervisor']), getBomberosByCompania);

// Obtener bomberos por compañía (alias para compatibilidad)
router.get("/compania/:idCompania/bomberos", authorizeRoles(['Administrador', 'Supervisor']), getBomberosPorCompania);

// Obtener bomberos con licencias de una compañía
router.get("/licencias/:idCompania", authorizePermisos(["bombero:leer"]), getBomberosConLicencias);

// Obtener la compañía del usuario autenticado
router.get("/mi-compania", authorizeRoles(['Administrador', 'Supervisor', 'Bombero']), getMiCompania);

// Obtener bomberos de la compañía del usuario autenticado
router.get("/mi-compania/bomberos", authorizeRoles(['Administrador', 'Supervisor', 'Bombero']), getBomberosMiCompania);

// Obtener estadísticas de bomberos de la compañía del usuario autenticado
router.get("/mi-compania/estadisticas", authorizeRoles(['Administrador', 'Supervisor', 'Bombero']), getEstadisticasMiCompania);

// Obtener estadísticas de bomberos de una compañía específica
router.get("/compania/:idCompania/estadisticas", authorizeRoles(['Administrador', 'Supervisor']), getEstadisticasBomberosCompania);

// Obtener bomberos de otras compañías
router.get("/otras-companias", authorizeRoles(['Administrador', 'Supervisor']), getBomberosOtrasCompanias);

// ==================== DETALLES COMPLETOS ====================

// Obtener detalles completos de un bombero
router.get("/:id/detalles", authorizeRoles(['Administrador', 'Supervisor', 'Bombero']), getBomberoDetalles);

// ==================== FUNCIONALIDADES UNIFICADAS ====================

// Crear bombero con ficha opcional (sin imagen)
router.post("/with-ficha", authorizeRoles(['Administrador', 'Supervisor']), createBomberoWithOptionalFicha);

// Crear bombero con ficha opcional e imagen de perfil
router.post("/with-image", authorizeRoles(['Administrador', 'Supervisor']), uploadSingle('profileImage'), createBomberoWithImage);

// Obtener bombero completo con ficha (si existe)
router.get("/:id/complete", authorizeRoles(['Administrador', 'Supervisor', 'Bombero']), getBomberoComplete);

// Obtener todos los bomberos con información de ficha
router.get("/complete", authorizeRoles(['Administrador', 'Supervisor']), getAllBomberosWithFicha);

// Agregar ficha a un bombero existente
router.post("/:id/add-ficha", authorizeRoles(['Administrador', 'Supervisor']), addFichaToBombero);

export default router;
