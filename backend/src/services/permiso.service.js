"use strict";
import { AppDataSource } from "../config/configDb.js";
import Permiso from "../entities/permiso.entity.js";

/**
 * Obtiene todos los permisos con filtros opcionales
 */
export async function getPermisosService(filters = {}) {
  try {
    const permisoRepository = AppDataSource.getRepository(Permiso);
    const queryBuilder = permisoRepository.createQueryBuilder("permiso");

    // Aplicar filtros
    if (filters.category) {
      queryBuilder.andWhere("permiso.categoria = :category", {
        category: filters.category,
      });
    }

    if (filters.search) {
      queryBuilder.andWhere(
        "(permiso.nombre ILIKE :search OR permiso.descripcion ILIKE :search)",
        { search: `%${filters.search}%` },
      );
    }

    // Ordenar por categoría y nombre
    queryBuilder
      .orderBy("permiso.categoria", "ASC")
      .addOrderBy("permiso.nombre", "ASC");

    // Paginación
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    queryBuilder.skip(skip).take(limit);

    const [permisos, total] = await queryBuilder.getManyAndCount();

    return {
      permisos,
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
 * Obtiene un permiso por su ID
 */
export async function getPermisoService(id) {
  try {
    const permisoRepository = AppDataSource.getRepository(Permiso);
    const permiso = await permisoRepository.findOne({
      where: { id },
    });

    if (!permiso) {
      throw new Error("Permiso no encontrado");
    }

    return permiso;
  } catch (error) {
    throw new Error(`Error al obtener permiso: ${error.message}`);
  }
}

/**
 * Actualiza un permiso existente
 */
export async function updatePermisoService(id, updateData) {
  try {
    const permisoRepository = AppDataSource.getRepository(Permiso);

    const permiso = await permisoRepository.findOne({
      where: { id },
    });

    if (!permiso) {
      throw new Error("Permiso no encontrado");
    }

    // Si se está actualizando el nombre, verificar que no exista otro con el mismo nombre
    if (updateData.nombre && updateData.nombre !== permiso.nombre) {
      const existingPermiso = await permisoRepository.findOne({
        where: { nombre: updateData.nombre },
      });

      if (existingPermiso) {
        throw new Error("Ya existe un permiso con ese nombre");
      }
    }

    // Actualizar campos
    Object.assign(permiso, updateData);
    const updatedPermiso = await permisoRepository.save(permiso);

    return updatedPermiso;
  } catch (error) {
    throw new Error(`Error al actualizar permiso: ${error.message}`);
  }
};