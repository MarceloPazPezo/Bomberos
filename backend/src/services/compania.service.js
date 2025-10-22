"use strict";
import { AppDataSource } from "../config/configDb.js";
import Compania from "../entities/compania.entity.js";

/**
 * Obtiene una compañía específica por criterios de búsqueda
 * @param {Object} query - Criterios de búsqueda (id, nombre, email)
 * @returns {Promise<Array>} [compania, error]
 */
export async function getCompaniaService(query) {
  try {
    const { id, nombre, email } = query;

    if (id === undefined && nombre === undefined && email === undefined) {
      return [
        null,
        "Debes proporcionar al menos un criterio de búsqueda (id, nombre o email).",
      ];
    }

    const companiaRepository = AppDataSource.getRepository(Compania);

    const queryBuilder = companiaRepository
      .createQueryBuilder("compania")
      .leftJoinAndSelect("compania.direccion", "direccion")
      .select([
        "compania.id",
        "compania.nombre",
        "compania.fechaFundacion",
        "compania.email",
        "compania.telefono",
        "compania.idDireccion",
        "compania.logoKEY",
        "compania.bannerKEY",
        "direccion.id",
        "direccion.calle",
        "direccion.numero",
        "direccion.depto",
        "direccion.referencia",
        "direccion.idComuna",
      ]);

    // Construir condiciones WHERE dinámicamente
    let hasAppliedFirstCondition = false;

    if (id !== undefined) {
      queryBuilder.where("compania.id = :id", { id: parseInt(id, 10) });
      hasAppliedFirstCondition = true;
    }

    if (nombre !== undefined) {
      if (hasAppliedFirstCondition) {
        queryBuilder.orWhere("compania.nombre ILIKE :nombre", { 
          nombre: `%${nombre}%` 
        });
      } else {
        queryBuilder.where("compania.nombre ILIKE :nombre", { 
          nombre: `%${nombre}%` 
        });
        hasAppliedFirstCondition = true;
      }
    }

    if (email !== undefined) {
      if (hasAppliedFirstCondition) {
        queryBuilder.orWhere("compania.email = :email", { email });
      } else {
        queryBuilder.where("compania.email = :email", { email });
      }
    }

    const companiaFound = await queryBuilder.getOne();

    if (!companiaFound) return [null, "Compañía no encontrada"];

    return [companiaFound, null];
  } catch (error) {
    console.error("Error al obtener la compañía:", error);
    return [null, "Error interno del servidor"];
  }
}

/**
 * Obtiene todas las compañías con filtros opcionales y paginación
 * @param {Object} queryParams - Parámetros de filtrado y paginación
 * @returns {Promise<Array>} [companias, error, total]
 */
export async function getCompaniasService(queryParams = {}) {
  try {
    const companiaRepository = AppDataSource.getRepository(Compania);

    const queryBuilder = companiaRepository
      .createQueryBuilder("compania")
      .leftJoinAndSelect("compania.direccion", "direccion")
      .select([
        "compania.id",
        "compania.nombre",
        "compania.fechaFundacion",
        "compania.email",
        "compania.telefono",
        "compania.idDireccion",
        "compania.logoKEY",
        "compania.bannerKEY",
        "direccion.id",
        "direccion.calle",
        "direccion.numero",
        "direccion.depto",
        "direccion.referencia",
        "direccion.idComuna",
      ])
      .orderBy("compania.id", "ASC");

    // Aplicar filtros
    const { nombre, email, telefono, page = 1, limit = 10 } = queryParams;

    if (nombre) {
      queryBuilder.andWhere("compania.nombre ILIKE :nombre", { 
        nombre: `%${nombre}%` 
      });
    }

    if (email) {
      queryBuilder.andWhere("compania.email = :email", { email });
    }

    if (telefono) {
      queryBuilder.andWhere("compania.telefono ILIKE :telefono", { 
        telefono: `%${telefono}%` 
      });
    }

    // Aplicar paginación
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    const [companias, total] = await queryBuilder.getManyAndCount();

    if (!companias || companias.length === 0) {
      return [[], "No se encontraron compañías.", 0];
    }

    return [companias, null, total];
  } catch (error) {
    console.error("Error al obtener las compañías:", error);
    return [null, "Error interno del servidor al obtener compañías.", 0];
  }
}

/**
 * Crea una nueva compañía
 * @param {Object} body - Datos de la compañía
 * @returns {Promise<Array>} [compania, error]
 */
export async function createCompaniaService(body) {
  return await AppDataSource.transaction(async (transactionalEntityManager) => {
    try {
      const companiaRepository = transactionalEntityManager.getRepository(Compania);

      // Verificar si ya existe una compañía con el mismo nombre
      if (body.nombre) {
        const existingByNombre = await companiaRepository.findOne({
          where: { nombre: body.nombre },
        });

        if (existingByNombre) {
          return [null, "Ya existe una compañía con ese nombre."];
        }
      }

      // Verificar si ya existe una compañía con el mismo email
      if (body.email) {
        const existingByEmail = await companiaRepository.findOne({
          where: { email: body.email },
        });

        if (existingByEmail) {
          return [null, "Ya existe una compañía con ese correo electrónico."];
        }
      }

      // Validar que la dirección existe si se proporciona
      if (body.idDireccion) {
        const direccionRepository = transactionalEntityManager.getRepository("Direccion");
        const direccionExists = await direccionRepository.findOne({
          where: { id: body.idDireccion },
        });

        if (!direccionExists) {
          return [null, "La dirección especificada no existe."];
        }
      }

      const companiaData = {
        nombre: body.nombre,
        fechaFundacion: body.fechaFundacion || null,
        email: body.email || null,
        telefono: body.telefono || null,
        idDireccion: body.idDireccion || null,
        logoKEY: body.logoKEY || null,
        bannerKEY: body.bannerKEY || null,
      };

      const newCompania = companiaRepository.create(companiaData);
      const savedCompania = await companiaRepository.save(newCompania);

      // Cargar la compañía con sus relaciones
      const companiaWithRelations = await companiaRepository.findOne({
        where: { id: savedCompania.id },
        relations: ["direccion"],
      });

      return [companiaWithRelations, null];
    } catch (error) {
      console.error("Error al crear la compañía:", error);
      return [null, "Error interno del servidor"];
    }
  });
}

/**
 * Actualiza una compañía existente
 * @param {Object} query - Criterios de búsqueda (id, nombre, email)
 * @param {Object} body - Datos a actualizar
 * @returns {Promise<Array>} [compania, error]
 */
export async function updateCompaniaService(query, body) {
  return await AppDataSource.transaction(async (transactionalEntityManager) => {
    try {
      const { id, nombre, email } = query;
      const companiaRepository = transactionalEntityManager.getRepository(Compania);

      // Buscar la compañía a actualizar
      const companiaFound = await companiaRepository.findOne({
        where: [
          { id: id },
          { nombre: nombre },
          { email: email },
        ],
      });

      if (!companiaFound) return [null, "Compañía no encontrada"];

      const dataCompaniaUpdate = {};

      // Validar unicidad de nombre si se va a cambiar
      if (body.nombre && body.nombre !== companiaFound.nombre) {
        const existingByNombre = await companiaRepository.findOne({
          where: { nombre: body.nombre },
        });
        if (existingByNombre && existingByNombre.id !== companiaFound.id) {
          return [null, "Ya existe otra compañía con ese nombre."];
        }
        dataCompaniaUpdate.nombre = body.nombre;
      }

      // Validar unicidad de email si se va a cambiar
      if (body.email && body.email !== companiaFound.email) {
        const existingByEmail = await companiaRepository.findOne({
          where: { email: body.email },
        });
        if (existingByEmail && existingByEmail.id !== companiaFound.id) {
          return [null, "Ya existe otra compañía con ese correo electrónico."];
        }
        dataCompaniaUpdate.email = body.email;
      }

      // Validar que la dirección existe si se proporciona
      if (body.idDireccion !== undefined) {
        if (body.idDireccion !== null) {
          const direccionRepository = transactionalEntityManager.getRepository("Direccion");
          const direccionExists = await direccionRepository.findOne({
            where: { id: body.idDireccion },
          });

          if (!direccionExists) {
            return [null, "La dirección especificada no existe."];
          }
        }
        dataCompaniaUpdate.idDireccion = body.idDireccion;
      }

      // Actualizar otros campos directos
      if (body.fechaFundacion !== undefined) {
        dataCompaniaUpdate.fechaFundacion = body.fechaFundacion;
      }
      if (body.telefono !== undefined) {
        dataCompaniaUpdate.telefono = body.telefono;
      }
      if (body.logoKEY !== undefined) {
        dataCompaniaUpdate.logoKEY = body.logoKEY;
      }
      if (body.bannerKEY !== undefined) {
        dataCompaniaUpdate.bannerKEY = body.bannerKEY;
      }

      // Actualizar la compañía
      await companiaRepository.update({ id: companiaFound.id }, dataCompaniaUpdate);

      // Cargar la compañía actualizada con sus relaciones
      const companiaUpdated = await companiaRepository.findOne({
        where: { id: companiaFound.id },
        relations: ["direccion"],
      });

      if (!companiaUpdated) {
        return [null, "Compañía no encontrada después de actualizar"];
      }

      return [companiaUpdated, null];
    } catch (error) {
      console.error("Error al actualizar la compañía:", error);
      return [null, "Error interno del servidor"];
    }
  });
}

/**
 * Elimina una compañía
 * @param {Object} query - Criterios de búsqueda (id, nombre, email)
 * @returns {Promise<Array>} [compania, error]
 */
export async function deleteCompaniaService(query) {
  return await AppDataSource.transaction(async (transactionalEntityManager) => {
    try {
      const { id, nombre, email } = query;
      const companiaRepository = transactionalEntityManager.getRepository(Compania);

      const companiaFound = await companiaRepository.findOne({
        where: [{ id: id }, { nombre: nombre }, { email: email }],
        relations: ["direccion"],
      });

      if (!companiaFound) return [null, "Compañía no encontrada"];

      // Verificar si hay bomberos asociados a esta compañía
      // Nota: Esto dependerá de si agregas la relación en el futuro
      // Por ahora comentado, pero aquí es donde harías la validación

      const companiaDeleted = await companiaRepository.remove(companiaFound);

      return [companiaDeleted, null];
    } catch (error) {
      console.error("Error al eliminar la compañía:", error);
      return [null, "Error interno del servidor"];
    }
  });
}

/**
 * Obtiene la compañía de un bombero (por ahora retorna la primera compañía)
 * En el futuro, cuando agregues relación bombero-compañía, buscarás por idBombero
 * @param {number} idBombero - ID del bombero
 * @returns {Promise<Array>} [compania, error]
 */
export async function getCompaniaBomberoService(idBombero) {
  try {
    const companiaRepository = AppDataSource.getRepository(Compania);

    // Por ahora, como no hay relación directa, retornamos la primera compañía
    // En el futuro, aquí buscarías la compañía específica del bombero
    const compania = await companiaRepository.findOne({
      where: {},
      relations: ["direccion"],
      order: { id: "ASC" }
    });

    if (!compania) {
      return [null, "No se encontró información de la compañía"];
    }

    // TODO: En el futuro, cuando tengas la relación bombero-compañía:
    // const bomberoRepository = AppDataSource.getRepository(Bombero);
    // const bombero = await bomberoRepository.findOne({
    //   where: { id: idBombero },
    //   relations: ["compania"]
    // });
    // 
    // if (!bombero) return [null, "Bombero no encontrado"];
    // if (!bombero.compania) return [null, "El bombero no tiene asignada una compañía"];
    //
    // return [bombero.compania, null];

    return [compania, null];
  } catch (error) {
    console.error("Error al obtener la compañía del bombero:", error);
    return [null, "Error interno del servidor"];
  }
}
