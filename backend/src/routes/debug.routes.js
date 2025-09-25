"use strict";
import { Router } from "express";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { authorizePermisos } from "../middlewares/authorization.middleware.js";
import { AppDataSource } from "../config/configDb.js";
import Rol from "../entities/rol.entity.js";
import {
  handleErrorServer,
  handleSuccess,
} from "../handlers/responseHandlers.js";

const router = Router();

router.use(authenticateJwt);

// Endpoint para debug - ver roles y permisos
router.get(
  "/debug-roles-permisos",
  authorizePermisos(["permiso:leer"]), // Solo administradores pueden ver esto
  async (req, res) => {
    try {
      const roleRepository = AppDataSource.getRepository(Rol);
      
      const roles = await roleRepository
        .createQueryBuilder("rol")
        .leftJoinAndSelect("rol.permisos", "permiso")
        .orderBy("rol.nombre", "ASC")
        .addOrderBy("permiso.nombre", "ASC")
        .getMany();

      const rolesData = roles.map(rol => ({
        id: rol.id,
        nombre: rol.nombre,
        descripcion: rol.descripcion,
        nivel: rol.nivel,
        permisos: rol.permisos.map(permiso => ({
          id: permiso.id,
          nombre: permiso.nombre,
          descripcion: permiso.descripcion,
          categoria: permiso.categoria
        }))
      }));

      handleSuccess(res, 200, "Roles y permisos obtenidos", rolesData);
    } catch (error) {
      console.error("Error al obtener roles y permisos:", error);
      handleErrorServer(res, 500, "Error interno del servidor");
    }
  }
);

export default router;
