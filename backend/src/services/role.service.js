"use strict";
import Role from "../entities/role.entity.js";
import Permission from "../entities/permission.entity.js";
import { AppDataSource } from "../config/configDb.js";

export async function getRoleService(query) {
  try {
    const { id, nombre } = query;

    const roleRepository = AppDataSource.getRepository(Role);

    const roleFound = await roleRepository.findOne({
      where: [{ id: id }, { nombre: nombre }],
      relations: ["permisos"],
    });

    if (!roleFound) return [null, "Rol no encontrado"];

    const roleData = {
      id: roleFound.id,
      nombre: roleFound.nombre,
      descripcion: roleFound.descripcion,
      createdAt: roleFound.createdAt,
      updatedAt: roleFound.updatedAt,
      permisos: roleFound.permisos
        ? roleFound.permisos.map((r) => r.nombre)
        : [],
    };
    return [roleData, null];
  } catch (error) {
    console.error("Error obtener el rol:", error);
    return [null, "Error interno del servidor"];
  }
}

export async function getRolesService(queryParams = {}) {
  try {
    const roleRepository = AppDataSource.getRepository(Role);

    const queryBuilder = roleRepository
      .createQueryBuilder("role")
      .leftJoinAndSelect("role.permisos", "permission")
      .select([
        "role.id",
        "role.nombre",
        "role.descripcion",
        "role.createdAt",
        "role.updatedAt",
        "permission.id",
        "permission.nombre",
      ])
      .orderBy("role.id", "ASC")
      .addOrderBy("permission.id", "ASC");

    const { page = 1, limit = 10 } = queryParams;
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    const [roles, total] = await queryBuilder.getManyAndCount();

    if (!roles || roles.length === 0) {
      return [null, "No se encontraron roles."];
    }

    const rolesSummarized = roles.map((role) => ({
      id: role.id,
      nombre: role.nombre,
      descripcion: role.descripcion,
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
      permisos: role.permisos ? role.permisos.map((r) => r.nombre) : [],
    }));

    return [rolesSummarized, null, total];
  } catch (error) {
    console.error("Error al obtener los roles:", error);
    return [null, "Error interno del servidor al obtener roles."];
  }
}

export async function updateRoleService(query, body) {
  try {
    const { id, nombre } = query;

    const roleRepository = AppDataSource.getRepository(Role);
    const permissionRepository = AppDataSource.getRepository(Permission);

    const roleFound = await roleRepository.findOne({
      where: [{ id: id }, { nombre: nombre }],
      relations: ["permisos"],
    });

    if (!roleFound) return [null, "Rol no encontrado"];

    const existingRole = await roleRepository.findOne({
      where: [{ nombre: body.nombre }],
    });

    if (existingRole && existingRole.id !== roleFound.id) {
      return [null, "Ya existe un rol con el mismo nombre"];
    }

    // Manejar permisos si se proporcionan
    let permissionsEntities = [];
    if (body.permisos && Array.isArray(body.permisos)) {
      if (body.permisos.length > 0) {
        permissionsEntities = await permissionRepository.find({
          where: {
            nombre: body.permisos,
          },
        });

        // Verificar si todos los permisos solicitados fueron encontrados
        if (permissionsEntities.length !== body.permisos.length) {
          const foundPermissionNames = permissionsEntities.map((p) => p.nombre);
          const missingPermissions = body.permisos.filter(
            (pName) => !foundPermissionNames.includes(pName),
          );
          return [
            null,
            `Los siguientes permisos no existen en la BD: ${missingPermissions.join(", ")}`,
          ];
        }
      }
    } else {
      // Si no se proporcionan permisos, mantener los existentes
      permissionsEntities = roleFound.permisos;
    }

    // Actualizar el rol
    roleFound.nombre = body.nombre;
    roleFound.descripcion = body.descripcion;
    roleFound.permisos = permissionsEntities;
    roleFound.updatedAt = new Date();

    const savedRole = await roleRepository.save(roleFound);

    return [savedRole, null];
  } catch (error) {
    console.error("Error al modificar un rol:", error);
    return [null, "Error interno del servidor"];
  }
}

export async function deleteRoleService(query) {
  try {
    const { id, nombre } = query;

    const roleRepository = AppDataSource.getRepository(Role);

    const roleFound = await roleRepository.findOne({
      where: [{ id: id }, { nombre: nombre }],
    });

    if (!roleFound) return [null, "Rol no encontrado"];

    const roleDeleted = await roleRepository.remove(roleFound);

    return [roleDeleted, null];
  } catch (error) {
    console.error("Error al eliminar un rol:", error);
    return [null, "Error interno del servidor"];
  }
}

export async function createRoleService(body) {
  try {
    const roleRepository = AppDataSource.getRepository(Role);
    const permissionRepository = AppDataSource.getRepository(Permission);

    const existingRol = await roleRepository.findOne({
      where: [{ nombre: body.nombre }],
    });

    if (existingRol) {
      return [null, "Ya existe un rol con el mismo nombre"];
    }

    let permissionsEntities = [];
    if (body.permisos && body.permisos.length > 0) {
      permissionsEntities = await permissionRepository.find({
        where: {
          nombre: body.permisos,
        },
      });

      // Verificar si todos los permisos solicitados fueron encontrados
      if (permissionsEntities.length !== body.permisos.length) {
        const foundPermissionNames = permissionsEntities.map((p) => p.nombre);
        const missingPermissions = body.permisos.filter(
          (pName) => !foundPermissionNames.includes(pName),
        );
        return [
          null,
          `Los siguientes permisos no existen en la BD: ${missingPermissions.join(", ")}`,
        ];
      }
    }

    const newRol = roleRepository.create({
      nombre: body.nombre,
      descripcion: body.descripcion,
      permisos: permissionsEntities,
    });

    const savedRol = await roleRepository.save(newRol);

    return [savedRol, null];
  } catch (error) {
    console.error("Error al crear un rol:", error);
    return [null, "Error interno del servidor"];
  }
}
