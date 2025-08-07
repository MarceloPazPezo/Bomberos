"use strict";
import { AppDataSource } from "../config/configDb.js";
import Permission from "../entities/permission.entity.js";

/**
 * Obtiene todos los permisos con filtros opcionales
 */
const getPermissions = async (filters = {}) => {
  try {
    const permissionRepository = AppDataSource.getRepository(Permission);
    const queryBuilder = permissionRepository.createQueryBuilder("permission");

    // Aplicar filtros
    if (filters.category) {
      queryBuilder.andWhere("permission.categoria = :category", {
        category: filters.category,
      });
    }

    if (filters.search) {
      queryBuilder.andWhere(
        "(permission.nombre ILIKE :search OR permission.descripcion ILIKE :search)",
        { search: `%${filters.search}%` },
      );
    }

    // Ordenar por categoría y nombre
    queryBuilder
      .orderBy("permission.categoria", "ASC")
      .addOrderBy("permission.nombre", "ASC");

    // Paginación
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    queryBuilder.skip(skip).take(limit);

    const [permissions, total] = await queryBuilder.getManyAndCount();

    return {
      permissions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    throw new Error(`Error al obtener permisos: ${error.message}`);
  }
};

/**
 * Obtiene permisos agrupados por categoría
 */
const getPermissionsByCategory = async () => {
  try {
    const permissionRepository = AppDataSource.getRepository(Permission);
    const permissions = await permissionRepository.find({
      order: { categoria: "ASC", nombre: "ASC" },
    });

    // Agrupar por categoría
    const groupedPermissions = permissions.reduce((acc, permission) => {
      const categoria = permission.categoria || "Sin categoría";
      if (!acc[categoria]) {
        acc[categoria] = [];
      }
      acc[categoria].push(permission);
      return acc;
    }, {});

    return groupedPermissions;
  } catch (error) {
    throw new Error(
      `Error al obtener permisos por categoría: ${error.message}`,
    );
  }
};

/**
 * Obtiene un permiso por ID
 */
const getPermissionById = async (id) => {
  try {
    const permissionRepository = AppDataSource.getRepository(Permission);
    const permission = await permissionRepository.findOne({
      where: { id },
    });

    if (!permission) {
      throw new Error("Permiso no encontrado");
    }

    return permission;
  } catch (error) {
    throw new Error(`Error al obtener permiso: ${error.message}`);
  }
};

/**
 * Crea un nuevo permiso
 */
const createPermission = async (permissionData) => {
  try {
    const permissionRepository = AppDataSource.getRepository(Permission);

    // Verificar si ya existe un permiso con el mismo nombre
    const existingPermission = await permissionRepository.findOne({
      where: { nombre: permissionData.nombre },
    });

    if (existingPermission) {
      throw new Error("Ya existe un permiso con ese nombre");
    }

    const permission = permissionRepository.create(permissionData);
    const savedPermission = await permissionRepository.save(permission);

    return savedPermission;
  } catch (error) {
    throw new Error(`Error al crear permiso: ${error.message}`);
  }
};

/**
 * Actualiza un permiso existente
 */
const updatePermission = async (id, updateData) => {
  try {
    const permissionRepository = AppDataSource.getRepository(Permission);

    const permission = await permissionRepository.findOne({
      where: { id },
    });

    if (!permission) {
      throw new Error("Permiso no encontrado");
    }

    // Si se está actualizando el nombre, verificar que no exista otro con el mismo nombre
    if (updateData.nombre && updateData.nombre !== permission.nombre) {
      const existingPermission = await permissionRepository.findOne({
        where: { nombre: updateData.nombre },
      });

      if (existingPermission) {
        throw new Error("Ya existe un permiso con ese nombre");
      }
    }

    // Actualizar campos
    Object.assign(permission, updateData);
    const updatedPermission = await permissionRepository.save(permission);

    return updatedPermission;
  } catch (error) {
    throw new Error(`Error al actualizar permiso: ${error.message}`);
  }
};

/**
 * Elimina un permiso (soft delete)
 */
const deletePermission = async (id) => {
  try {
    const permissionRepository = AppDataSource.getRepository(Permission);

    const permission = await permissionRepository.findOne({
      where: { id },
      relations: ["roles"],
    });

    if (!permission) {
      throw new Error("Permiso no encontrado");
    }

    // Verificar si el permiso está siendo usado por algún rol
    if (permission.roles && permission.roles.length > 0) {
      throw new Error(
        "No se puede eliminar un permiso que está asignado a roles",
      );
    }

    // Soft delete - marcar como inactivo
    permission.isActive = false;
    await permissionRepository.save(permission);

    return { message: "Permiso eliminado correctamente" };
  } catch (error) {
    throw new Error(`Error al eliminar permiso: ${error.message}`);
  }
};

/**
 * Obtiene estadísticas de permisos
 */
const getPermissionStats = async () => {
  try {
    const permissionRepository = AppDataSource.getRepository(Permission);

    const [total, active, byCategory] = await Promise.all([
      permissionRepository.count(),
      permissionRepository.count({ where: { isActive: true } }),
      permissionRepository
        .createQueryBuilder("permission")
        .select("permission.category", "category")
        .addSelect("COUNT(*)", "count")
        .where("permission.isActive = :isActive", { isActive: true })
        .groupBy("permission.category")
        .getRawMany(),
    ]);

    return {
      total,
      active,
      inactive: total - active,
      byCategory: byCategory.reduce((acc, item) => {
        acc[item.category] = parseInt(item.count);
        return acc;
      }, {}),
    };
  } catch (error) {
    throw new Error(
      `Error al obtener estadísticas de permisos: ${error.message}`,
    );
  }
};

export {
  getPermissions,
  getPermissionsByCategory,
  getPermissionById,
  createPermission,
  updatePermission,
  deletePermission,
  getPermissionStats,
};
