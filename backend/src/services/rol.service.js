"use strict";
import Rol from "../entities/rol.entity.js";
import Permiso from "../entities/permiso.entity.js";
import { AppDataSource } from "../config/configDb.js";
import { In } from "typeorm";

export async function getRolService(query) {
  try {
    const { id, nombre } = query;

    const rolRepository = AppDataSource.getRepository(Rol);

    const rolFound = await rolRepository.findOne({
      where: [{ id: id }, { nombre: nombre }],
      relations: ["permisos"],
    });

    if (!rolFound) return [null, "Rol no encontrado"];

    const rolData = {
      id: rolFound.id,
      nombre: rolFound.nombre,
      descripcion: rolFound.descripcion,
      creadoEl: rolFound.creadoEl,
      creadoPor: rolFound.creadoPor,
      actualizadoEl: rolFound.actualizadoEl,
      actualizadoPor: rolFound.actualizadoPor,
      permisos: rolFound.permisos
        ? rolFound.permisos.map((r) => r.nombre)
        : [],
    };
    return [rolData, null];
  } catch (error) {
    console.error("Error obtener el rol:", error);
    return [null, "Error interno del servidor"];
  }
}

export async function getRolesService(queryParams = {}) {
  try {
    const rolRepository = AppDataSource.getRepository(Rol);

    const queryBuilder = rolRepository
      .createQueryBuilder("rol")
      .leftJoinAndSelect("rol.permisos", "permiso")
      .select([
        "rol.id",
        "rol.nombre",
        "rol.descripcion",
        "rol.creadoEl",
        "rol.creadoPor",
        "rol.actualizadoEl",
        "rol.actualizadoPor",
        "permiso.id",
        "permiso.nombre",
      ])
      .orderBy("rol.id", "ASC")
      .addOrderBy("permiso.id", "ASC");

    // Solo aplicar paginación si se especifican parámetros
    if (queryParams.page || queryParams.limit) {
      const { page = 1, limit = 10 } = queryParams;
      const offset = (page - 1) * limit;
      queryBuilder.skip(offset).take(limit);
    }

    const [roles, total] = await queryBuilder.getManyAndCount();

    if (!roles || roles.length === 0) {
      return [null, "No se encontraron roles."];
    }

    const rolesSummarized = roles.map((rol) => ({
      id: rol.id,
      nombre: rol.nombre,
      descripcion: rol.descripcion,
      creadoEl: rol.creadoEl,
      creadoPor: rol.creadoPor,
      actualizadoEl: rol.actualizadoEl,
      actualizadoPor: rol.actualizadoPor,
      permisos: rol.permisos ? rol.permisos.map((r) => r.nombre) : [],
    }));

    return [rolesSummarized, null, total];
  } catch (error) {
    console.error("Error al obtener los roles:", error);
    return [null, "Error interno del servidor al obtener roles."];
  }
}

export async function updateRolService(query, body) {
  try {
    const { id, nombre } = query;

    const rolRepository = AppDataSource.getRepository(Rol);
    const permisoRepository = AppDataSource.getRepository(Permiso);

    const rolFound = await rolRepository.findOne({
      where: [{ id: id }, { nombre: nombre }],
      relations: ["permisos"],
    });

    if (!rolFound) return [null, "Rol no encontrado"];

    const existingRol = await rolRepository.findOne({
      where: [{ nombre: body.nombre }],
    });

    if (existingRol && existingRol.id !== rolFound.id) {
      return [null, "Ya existe un rol con el mismo nombre"];
    }

    // Manejar permisos si se proporcionan
    let permisosEntities = [];
    if (body.permisos && Array.isArray(body.permisos)) {
      if (body.permisos.length > 0) {
        permisosEntities = await permisoRepository.find({
          where: {
            nombre: In(body.permisos),
          },
        });

        // Verificar si todos los permisos solicitados fueron encontrados
        if (permisosEntities.length !== body.permisos.length) {
          const foundPermisosNames = permisosEntities.map((p) => p.nombre);
          const missingPermisos = body.permisos.filter(
            (pName) => !foundPermisosNames.includes(pName),
          );
          return [
            null,
            `Los siguientes permisos no existen en la BD: ${missingPermisos.join(", ")}`,
          ];
        }
      }
    } else {
      // Si no se proporcionan permisos, mantener los existentes
      permisosEntities = rolFound.permisos;
    }

    // Actualizar el rol
    rolFound.nombre = body.nombre;
    rolFound.descripcion = body.descripcion;
    rolFound.permisos = permisosEntities;
    rolFound.actualizadoEl = new Date();
    rolFound.actualizadoPor = body.actualizadoPor || rolFound.actualizadoPor;

    const savedRol = await rolRepository.save(rolFound);

    // Formatear la respuesta de manera consistente
    const rolData = {
      id: savedRol.id,
      nombre: savedRol.nombre,
      descripcion: savedRol.descripcion,
      creadoEl: savedRol.creadoEl,
      creadoPor: savedRol.creadoPor,
      actualizadoEl: savedRol.actualizadoEl,
      actualizadoPor: savedRol.actualizadoPor,
      permisos: savedRol.permisos
        ? savedRol.permisos.map((p) => p.nombre)
        : [],
    };

    return [rolData, null];
  } catch (error) {
    console.error("Error al modificar un rol:", error);
    return [null, "Error interno del servidor"];
  }
}

export async function deleteRolService(query) {
  try {
    const { id, nombre } = query;

    const rolRepository = AppDataSource.getRepository(Rol);

    const rolFound = await rolRepository.findOne({
      where: [{ id: id }, { nombre: nombre }],
    });

    if (!rolFound) {
      return [null, "Rol no encontrado"];
    }

    // Verificar si el rol está siendo usado por algún bombero consultando la tabla de unión
    const bomberoWithRol = await AppDataSource.query(
      `SELECT COUNT(*) as count FROM "bomberoRoles" WHERE "idRol" = $1`,
      [rolFound.id]
    );

    const bomberoCount = parseInt(bomberoWithRol[0].count);
    
    if (bomberoCount > 0) {
      return [null, `No se puede eliminar el rol "${rolFound.nombre}" porque está asignado a ${bomberoCount} bombero(s)`];
    }

    // Primero eliminar las relaciones con permisos
    await AppDataSource.query(
      `DELETE FROM "rolPermisos" WHERE "idRol" = $1`,
      [rolFound.id]
    );
    
    // Ahora eliminar el rol usando SQL directo
    await AppDataSource.query(
      `DELETE FROM roles WHERE id = $1`,
      [rolFound.id]
    );

    return [{ id: rolFound.id, nombre: rolFound.nombre }, null];
  } catch (error) {
    console.error("Error al eliminar un rol:", error);
    return [null, "Error interno del servidor"];
  }
}

export async function createRolService(roleData) {
  try {
    // Validar que roleData existe y tiene las propiedades necesarias
    if (!roleData) {
      return [null, "Datos del rol no proporcionados"];
    }
    
    if (!roleData.nombre) {
      return [null, "El nombre del rol es requerido"];
    }

    const rolRepository = AppDataSource.getRepository(Rol);
    const permisoRepository = AppDataSource.getRepository(Permiso);

    const existingRol = await rolRepository.findOne({
      where: [{ nombre: roleData.nombre }],
    });

    if (existingRol) {
      return [null, "Ya existe un rol con el mismo nombre"];
    }

    let permisosEntities = [];
    if (roleData.permisos && roleData.permisos.length > 0) {
      permisosEntities = await permisoRepository.find({
        where: {
          nombre: In(roleData.permisos),
        },
      });

      // Verificar si todos los permisos solicitados fueron encontrados
      if (permisosEntities.length !== roleData.permisos.length) {
        const foundPermisosNames = permisosEntities.map((p) => p.nombre);
        const missingPermisos = roleData.permisos.filter(
          (pName) => !foundPermisosNames.includes(pName),
        );
        return [
          null,
          `Los siguientes permisos no existen en la BD: ${missingPermisos.join(", ")}`,
        ];
      }
    }

    const newRol = rolRepository.create({
      nombre: roleData.nombre,
      descripcion: roleData.descripcion,
      creadoPor: roleData.creadoPor,
      permisos: permisosEntities,
    });

    const savedRol = await rolRepository.save(newRol);

    // Obtener el rol guardado con sus relaciones para devolverlo formateado
    const rolWithPermisos = await rolRepository.findOne({
      where: { id: savedRol.id },
      relations: ["permisos"],
    });

    const rolData = {
      id: rolWithPermisos.id,
      nombre: rolWithPermisos.nombre,
      descripcion: rolWithPermisos.descripcion,
      creadoEl: rolWithPermisos.fechaCreacion,
      creadoPor: rolWithPermisos.creadoPor,
      actualizadoEl: rolWithPermisos.fechaActualizacion,
      actualizadoPor: rolWithPermisos.actualizadoPor,
      permisos: rolWithPermisos.permisos
        ? rolWithPermisos.permisos.map((p) => p.nombre)
        : [],
    };

    return [rolData, null];
  } catch (error) {
    return [null, "Error interno del servidor"];
  }
}
