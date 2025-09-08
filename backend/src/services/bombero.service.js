"use strict";
import Bombero from "../entities/bombero.entity.js";
import Rol from "../entities/rol.entity.js";
import { AppDataSource } from "../config/configDb.js";
import { comparePassword, encryptPassword } from "../helpers/bcrypt.helper.js";
import { Brackets } from "typeorm";

export async function getBomberoService(query) {
  try {
    const { id, run, email } = query;

    if (
      id === undefined &&
      run === undefined &&
      email === undefined
    ) {
      return [
        null,
        "Debes proporcionar al menos un criterio de búsqueda (id, run o email).",
      ];
    }

    const bomberoRepository = AppDataSource.getRepository(Bombero);

    const queryBuilder = bomberoRepository
      .createQueryBuilder("bombero")
      .leftJoinAndSelect("bombero.roles", "rol")
      .select([
        "bombero.id",
        "bombero.nombres",
        "bombero.apellidos",
        "bombero.run",
        "bombero.email",
        "bombero.activo",
        "bombero.creadoEl",
        "bombero.creadoPor",
        "bombero.actualizadoEl",
        "bombero.actualizadoPor",
        "rol.id",
        "rol.nombre",
      ]);

    queryBuilder.where(
      new Brackets((qb) => {
        let hasAppliedFirstCondition = false;

        if (id !== undefined) {
          qb.where("bombero.id = :id", { id: parseInt(id, 10) });
          hasAppliedFirstCondition = true;
        }

        if (run !== undefined) {
          if (hasAppliedFirstCondition) {
            qb.orWhere("bombero.run = :run", { run });
          } else {
            qb.where("bombero.run = :run", { run });
            hasAppliedFirstCondition = true;
          }
        }

        if (email !== undefined) {
          if (hasAppliedFirstCondition) {
            qb.orWhere("bombero.email = :email", { email });
          } else {
            qb.where("bombero.email = :email", { email });
          }
        }
      }),
    );

    const bomberoFound = await queryBuilder.getOne();

    if (!bomberoFound) return [null, "Bombero no encontrado"];

    const bomberoData = {
      id: bomberoFound.id,
      nombres: bomberoFound.nombres,
      apellidos: bomberoFound.apellidos,
      run: bomberoFound.run,
      email: bomberoFound.email,
      activo: bomberoFound.activo,
      creadoEl: bomberoFound.creadoEl,
      creadoPor: bomberoFound.creadoPor,
      actualizadoEl: bomberoFound.actualizadoEl,
      actualizadoPor: bomberoFound.actualizadoPor,
      roles: bomberoFound.roles ? bomberoFound.roles.map((r) => ({
        id: r.id,
        nombre: r.nombre
      })) : [],
    };

    return [bomberoData, null];
  } catch (error) {
    console.error("Error obtener el bombero:", error);
    return [null, "Error interno del servidor"];
  }
}

export async function getBomberosService(queryParams = {}) {
  try {
    const bomberoRepository = AppDataSource.getRepository(Bombero);

    const queryBuilder = bomberoRepository
      .createQueryBuilder("bombero")
      .leftJoinAndSelect("bombero.roles", "rol")
      .select([
        "bombero.id",
        "bombero.nombres",
        "bombero.apellidos",
        "bombero.run",
        "bombero.email",
        "bombero.activo",
        "bombero.creadoEl",
        "bombero.creadoPor",
        "bombero.actualizadoEl",
        "bombero.actualizadoPor",
        "rol.id",
        "rol.nombre",
      ])
      .orderBy("bombero.id", "ASC")
      .addOrderBy("rol.id", "ASC");

    // Filtros adicionales por fecha
    const { page = 1, limit = 10, creadoDesde, creadoHasta, actualizadoDesde, actualizadoHasta } = queryParams;

    // Filtro por fecha de creación
    if (creadoDesde) {
      queryBuilder.andWhere("bombero.creadoEl >= :creadoDesde", { creadoDesde });
    }
    if (creadoHasta) {
      queryBuilder.andWhere("bombero.creadoEl <= :creadoHasta", { creadoHasta });
    }

    // Filtro por fecha de actualización
    if (actualizadoDesde) {
      queryBuilder.andWhere("bombero.actualizadoEl >= :actualizadoDesde", { actualizadoDesde });
    }
    if (actualizadoHasta) {
      queryBuilder.andWhere("bombero.actualizadoEl <= :actualizadoHasta", { actualizadoHasta });
    }
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    const [bomberos, total] = await queryBuilder.getManyAndCount();

    if (!bomberos || bomberos.length === 0) {
      return [null, "No se encontraron bomberos."];
    }

    const bomberosData = bomberos.map((bombero) => ({
      id: bombero.id,
      nombres: bombero.nombres,
      apellidos: bombero.apellidos,
      run: bombero.run,
      email: bombero.email,
      activo: bombero.activo,
      creadoEl: bombero.creadoEl,
      creadoPor: bombero.creadoPor,
      actualizadoEl: bombero.actualizadoEl,
      actualizadoPor: bombero.actualizadoPor,
      roles: bombero.roles ? bombero.roles.map((r) => ({
        id: r.id,
        nombre: r.nombre
      })) : [],
    }));

    return [bomberosData, null, total];
  } catch (error) {
    console.error("Error al obtener los bomberos:", error);
    return [null, "Error interno del servidor al obtener bomberos."];
  }
}

export async function updateBomberoService(query, body, updatedBy = null) {
  try {
    const { id, run, email } = query;

    const bomberoRepository = AppDataSource.getRepository(Bombero);

    const bomberoFound = await bomberoRepository.findOne({
      where: [
        { id: id },
        { run: run },
        { email: email },
      ],
    });

    if (!bomberoFound) return [null, "Bombero no encontrado"];
    const dataBomberoUpdate = {};

    if (body.email && body.email !== bomberoFound.email) {
      const existingByEmail = await bomberoRepository.findOne({
        where: { email: body.email },
      });
      if (existingByEmail && existingByEmail.id !== bomberoFound.id) {
        return [null, "Ya existe otro bombero con ese correo electrónico."];
      }
      dataBomberoUpdate.email = body.email;
    }

    // 3. Validar contraseña actual si se va a cambiar la contraseña
    if (body.newPassword && body.newPassword.trim() !== "") {
      if (!body.currentPassword || body.currentPassword.trim() === "") {
        return [
          null,
          "Se requiere la contraseña actual para establecer una nueva.",
        ];
      }
      const matchPassword = await comparePassword(
        body.currentPassword,
        bomberoFound.password,
      );
      if (!matchPassword) {
        return [null, "La contraseña actual no coincide."];
      }
      dataBomberoUpdate.password = await encryptPassword(body.newPassword);
    }

    // 4. Actualizar otras propiedades directas del bombero
    if (body.nombres !== undefined) dataBomberoUpdate.nombres = body.nombres;
    if (body.apellidos !== undefined) dataBomberoUpdate.apellidos = body.apellidos;
    if (body.activo !== undefined) dataBomberoUpdate.activo = body.activo;

    // 5. Manejar actualización de roles si se proporcionan
    if (body.roles && Array.isArray(body.roles)) {
      const rolRepository = AppDataSource.getRepository(Rol);
      const roles = [];

      for (const rolItem of body.roles) {
        let rol;
        if (typeof rolItem === 'number') {
          rol = await rolRepository.findOne({ where: { id: rolItem } });
        } else if (typeof rolItem === 'string') {
          rol = await rolRepository.findOne({ where: { nombre: rolItem } });
        }
        
        if (rol) {
          roles.push(rol);
        } else {
          return [null, `Rol no encontrado: ${rolItem}`];
        }
      }
      
      // Actualizar roles del bombero
      const bomberoWithRoles = await bomberoRepository.findOne({
        where: { id: bomberoFound.id },
        relations: ["roles"],
      });
      
      if (bomberoWithRoles) {
        bomberoWithRoles.roles = roles;
        await bomberoRepository.save(bomberoWithRoles);
      }
    }

    dataBomberoUpdate.actualizadoEl = new Date();
    if (updatedBy) dataBomberoUpdate.actualizadoPor = updatedBy;

    await bomberoRepository.update({ id: bomberoFound.id }, dataBomberoUpdate);

    const bomberoData = await bomberoRepository.findOne({
      where: { id: bomberoFound.id },
      relations: ["roles"],
    });

    if (!bomberoData) {
      return [null, "Bombero no encontrado después de actualizar"];
    }

    const { password, ...bomberoUpdated } = bomberoData;

    // Formatear los roles para mantener consistencia con el login
    if (bomberoUpdated.roles) {
      bomberoUpdated.roles = bomberoUpdated.roles.map((rol) => ({
        id: rol.id,
        name: rol.nombre,
        nombre: rol.nombre,
      }));
    }

    return [bomberoUpdated, null];
  } catch (error) {
    console.error("Error al actualizar el bombero:", error);
    return [null, "Error interno del servidor"];
  }
}

export async function changeBomberoStatusService(idBombero, activo, updatedBy = null) {
  try {
    const bomberoRepository = AppDataSource.getRepository(Bombero);

    const bomberoFound = await bomberoRepository.findOne({
      where: { id: idBombero },
    });

    if (!bomberoFound) {
      return [null, "Bombero no encontrado"];
    }
    
    // Actualizar el estado
    bomberoFound.activo = activo;
    bomberoFound.actualizadoEl = new Date();
    if (updatedBy) bomberoFound.actualizadoPor = updatedBy;
    
    const bomberoUpdated = await bomberoRepository.save(bomberoFound);

    // Remover la contraseña del resultado
    const { password, ...bomberoResult } = bomberoUpdated;

    return [bomberoResult, null];
  } catch (error) {
    console.error("Error al cambiar el estado del bombero:", error);
    return [null, "Error interno del servidor"];
  }
}

export async function deleteBomberoService(query) {
  try {
    const { id, run, email } = query;

    const bomberoRepository = AppDataSource.getRepository(Bombero);

    const bomberoFound = await bomberoRepository.findOne({
      where: [{ id: id }, { run: run }, { email: email }],
      relations: ["roles"],
    });

    if (!bomberoFound) return [null, "Bombero no encontrado"];

    // Verificar si el bombero tiene rol de administrador
    const hasAdminRole = bomberoFound.roles?.some(rol => rol.nombre === "Administrador");
    if (hasAdminRole) {
      return [null, "No se puede eliminar un bombero con rol de administrador"];
    }

    const bomberoDeleted = await bomberoRepository.remove(bomberoFound);

    const { password, roles, ...dataBombero } = bomberoDeleted;

    return [dataBombero, null];
  } catch (error) {
    console.error("Error al eliminar un bombero:", error);
    return [null, "Error interno del servidor"];
  }
}

export async function createBomberoService(body, createdBy = null) {
  try {
    const bomberoRepository = AppDataSource.getRepository(Bombero);
    const rolRepository = AppDataSource.getRepository(Rol);

    // Verificar duplicados específicos por campo
    const existingByRun = await bomberoRepository.findOne({
      where: { run: body.run },
    });

    const existingByEmail = await bomberoRepository.findOne({
      where: { email: body.email },
    });

    // Si hay duplicados, retornar errores específicos por campo
    if (existingByRun || existingByEmail) {
      const fieldErrors = {};
      
      if (existingByRun) {
        fieldErrors.run = "Ya existe un bombero con este RUT";
      }
      
      if (existingByEmail) {
        fieldErrors.email = "Ya existe un bombero con este email";
      }

      return [null, fieldErrors];
    }

    const rolBombero = await rolRepository.findOneBy({ nombre: "Bombero" });
    if (!rolBombero) {
      return [null, "Rol de bombero no encontrado"];
    }

    const bomberoData = {
      nombres: body.nombres,
      apellidos: body.apellidos,
      run: body.run,
      email: body.email,
      password: await encryptPassword(body.password),
      activo: body.activo !== undefined ? body.activo : true,
      creadoPor: createdBy,
      roles: [rolBombero],
    };

    const newBombero = bomberoRepository.create(bomberoData);

    const savedBombero = await bomberoRepository.save(newBombero);

    const { password, ...bomberoDataResult } = savedBombero;

    return [bomberoDataResult, null];
  } catch (error) {
    console.error("Error al crear un bombero:", error);
    return [null, "Error interno del servidor"];
  }
}
