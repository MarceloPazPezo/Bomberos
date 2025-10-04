"use strict";
import Bombero from "../entities/bombero.entity.js";
import FichaBombero from "../entities/fichaBombero.entity.js";
import Rol from "../entities/rol.entity.js";
import { AppDataSource } from "../config/configDb.js";
import { comparePassword, encryptPassword } from "../helpers/bcrypt.helper.js";
import { Brackets } from "typeorm";
import { createFichaBomberoService } from "./fichaBombero.service.js";

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
      relations: ["roles"], // Incluir roles para validación
    });

    if (!bomberoFound) {
      return [null, "Bombero no encontrado"];
    }

    // Validar que el bombero no tenga roles protegidos (Administrador o Capitán)
    if (bomberoFound.roles && bomberoFound.roles.length > 0) {
      const hasProtectedRole = bomberoFound.roles.some(role => 
        role.nombre === 'Administrador' || role.nombre === 'Capitán'
      );
      
      if (hasProtectedRole) {
        return [null, "No se puede cambiar el estado de bomberos con roles Administrador o Capitán"];
      }
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

//obtener bomberos con licencias

export async function getBomberosConLicenciasService(idCompania) {
  try {

    const bomberoRepository = AppDataSource.getRepository(Bombero);

    // Join explícito a la tabla fichaBombero usando la clave foránea idBombero
    const queryBuilder = bomberoRepository
      .createQueryBuilder("bombero")
      .leftJoin(
        FichaBombero,
        "fichaBombero",
        "fichaBombero.idBombero = bombero.id AND fichaBombero.idCompania = :idCompania",
        { idCompania }
      )
      .select([
        "bombero.id AS id",
        "bombero.nombres AS nombres",
        "bombero.apellidos AS apellidos",
        "bombero.run AS run",
        "bombero.email AS email"
      ])
      .where("bombero.activo = :activo", { activo: true })
      .andWhere("fichaBombero.idCompania = :idCompania", { idCompania })
      .andWhere("fichaBombero.licenciaClaseF = true")
      .orderBy("bombero.apellidos", "ASC")
      .addOrderBy("bombero.nombres", "ASC");

  // Usamos getRawMany porque seleccionamos con alias específicos
  const bomberos = await queryBuilder.getRawMany();

    if (!bomberos || bomberos.length === 0) {
      return [null, "No se encontraron bomberos con licencias en la compañía especificada."];
    }
    // Ya vienen con los alias correctos
    return [bomberos, null];
  } catch (error) {
    console.error("Error al obtener los bomberos con licencias:", error);
    return [null, "Error interno del servidor al obtener bomberos con licencias."];
  }
}

//obetner bomberos por compania
export async function getBomberosPorCompaniaService(idCompania) {
  try {
    const bomberoRepository = AppDataSource.getRepository(Bombero);

    const queryBuilder = bomberoRepository
      .createQueryBuilder("bombero")
      .leftJoin(
        FichaBombero,
        "fichaBombero",
        "fichaBombero.idBombero = bombero.id AND fichaBombero.idCompania = :idCompania",
        { idCompania }
      )
      .select([
        "bombero.id AS id",
        "bombero.nombres AS nombres",
        "bombero.apellidos AS apellidos",
        "bombero.run AS run",
        "bombero.email AS email"
      ])
      .where("bombero.activo = :activo", { activo: true })
      .andWhere("fichaBombero.idCompania = :idCompania", { idCompania })
      .orderBy("bombero.apellidos", "ASC")
      .addOrderBy("bombero.nombres", "ASC");
    const bomberos = await queryBuilder.getRawMany();

    if (!bomberos || bomberos.length === 0) {
      return [null, "No se encontraron bomberos en la compañía especificada."];
    }
    return [bomberos, null];
  }
  catch (error) {
    console.error("Error al obtener los bomberos por compañía:", error);
    return [null, "Error interno del servidor al obtener bomberos por compañía."];
  }
}

// ==================== SERVICIOS UNIFICADOS ====================

/**
 * Agregar ficha a un bombero existente
 */
export async function addFichaToBomberoService(bomberoId, fichaData, createdBy = null) {
  try {
    const bomberoRepository = AppDataSource.getRepository(Bombero);
    
    // Verificar que el bombero existe
    const bombero = await bomberoRepository.findOne({
      where: { id: bomberoId }
    });

    if (!bombero) {
      return [null, "Bombero no encontrado"];
    }

    // Verificar que no existe ya una ficha para este bombero
    const fichaBomberoRepository = AppDataSource.getRepository(FichaBombero);
    const existingFicha = await fichaBomberoRepository.findOne({
      where: { idBombero: bomberoId }
    });

    if (existingFicha) {
      return [null, "Ya existe una ficha para este bombero"];
    }

    // Crear la ficha usando el servicio existente
    const fichaDataWithBombero = {
      ...fichaData,
      idBombero: bomberoId
    };

    const [ficha, fichaError] = await createFichaBomberoService(fichaDataWithBombero, createdBy);
    
    if (fichaError) {
      return [null, fichaError];
    }

    // Retornar el bombero con la ficha creada
    const [bomberoComplete, error] = await getBomberoCompleteService(bomberoId);
    
    if (error) {
      return [bombero, null]; // Retornar al menos el bombero si no se puede obtener completo
    }

    return [bomberoComplete, null];
  } catch (error) {
    console.error("Error al agregar ficha al bombero:", error);
    return [null, "Error interno del servidor"];
  }
}

/**
 * Crear bombero con ficha opcional
 */
export async function createBomberoWithOptionalFichaService(bomberoData, fichaData = null, createdBy = null) {
  try {
    // Crear el bombero primero
    const [bombero, bomberoError] = await createBomberoService(bomberoData, createdBy);
    
    if (bomberoError) {
      return [null, bomberoError, null];
    }

    let fichaResult = null;

    // Si se proporcionan datos de ficha, crearla
    if (fichaData) {
      const fichaDataWithBombero = {
        ...fichaData,
        idBombero: bombero.id
      };

      const [ficha, fichaError] = await createFichaBomberoService(fichaDataWithBombero, createdBy);
      
      fichaResult = {
        ficha,
        error: fichaError
      };
    }

    return [bombero, null, fichaResult];
  } catch (error) {
    console.error("Error al crear bombero con ficha opcional:", error);
    return [null, "Error interno del servidor", null];
  }
}

/**
 * Crear bombero con imagen de perfil
 */
export async function createBomberoWithImageService(bomberoData, fichaData = null, profileImage = null, createdBy = null) {
  try {
    // Crear el bombero primero
    const [bombero, bomberoError] = await createBomberoService(bomberoData, createdBy);
    
    if (bomberoError) {
      return [null, bomberoError, null];
    }

    let fichaResult = null;

    // Si se proporcionan datos de ficha, crearla
    if (fichaData) {
      const fichaDataWithBombero = {
        ...fichaData,
        idBombero: bombero.id
      };

      // Si hay imagen, agregar los datos de la imagen a la ficha
      if (profileImage) {
        fichaDataWithBombero.fotoPerfilURL = profileImage.location || profileImage.path;
        fichaDataWithBombero.fotoPerfilKEY = profileImage.key || profileImage.filename;
      }

      const [ficha, fichaError] = await createFichaBomberoService(fichaDataWithBombero, createdBy);
      
      fichaResult = {
        ficha,
        error: fichaError
      };
    }

    return [bombero, null, fichaResult];
  } catch (error) {
    console.error("Error al crear bombero con imagen:", error);
    return [null, "Error interno del servidor", null];
  }
}

/**
 * Obtener bombero completo con ficha
 */
export async function getBomberoCompleteService(bomberoId) {
  try {
    const bomberoRepository = AppDataSource.getRepository(Bombero);
    const fichaBomberoRepository = AppDataSource.getRepository(FichaBombero);

    // Obtener el bombero con sus roles
    const bombero = await bomberoRepository
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
      .where("bombero.id = :id", { id: bomberoId })
      .getOne();

    if (!bombero) {
      return [null, "Bombero no encontrado"];
    }

    // Obtener la ficha del bombero si existe
    const ficha = await fichaBomberoRepository
      .createQueryBuilder("ficha")
      .leftJoinAndSelect("ficha.compania", "compania")
      .leftJoinAndSelect("ficha.direccion", "direccion")
      .leftJoinAndSelect("ficha.tipoSangre", "tipoSangre")
      .where("ficha.idBombero = :idBombero", { idBombero: bomberoId })
      .getOne();

    // Formatear los roles
    const bomberoData = {
      ...bombero,
      roles: bombero.roles ? bombero.roles.map((rol) => ({
        id: rol.id,
        nombre: rol.nombre
      })) : [],
      ficha: ficha || null
    };

    return [bomberoData, null];
  } catch (error) {
    console.error("Error al obtener bombero completo:", error);
    return [null, "Error interno del servidor"];
  }
}

/**
 * Obtener todos los bomberos con información de ficha
 */
export async function getAllBomberosWithFichaService() {
  try {
    const bomberoRepository = AppDataSource.getRepository(Bombero);

    const bomberos = await bomberoRepository
      .createQueryBuilder("bombero")
      .leftJoinAndSelect("bombero.roles", "rol")
      .leftJoin("fichaBombero", "ficha", "ficha.idBombero = bombero.id")
      .leftJoin("compania", "compania", "compania.id = ficha.idCompania")
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
        "ficha.id",
        "ficha.nombre",
        "ficha.telefono",
        "ficha.fechaNacimiento",
        "ficha.fechaIngreso",
        "ficha.licenciaClaseF",
        "ficha.donante",
        "ficha.fotoPerfilURL",
        "compania.id",
        "compania.nombre"
      ])
      .orderBy("bombero.apellidos", "ASC")
      .addOrderBy("bombero.nombres", "ASC")
      .getMany();

    if (!bomberos || bomberos.length === 0) {
      return [[], null];
    }

    // Formatear los datos
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
      roles: bombero.roles ? bombero.roles.map((rol) => ({
        id: rol.id,
        nombre: rol.nombre
      })) : [],
      hasFicha: !!bombero.ficha,
      ficha: bombero.ficha || null
    }));

    return [bomberosData, null];
  } catch (error) {
    console.error("Error al obtener bomberos con ficha:", error);
    return [null, "Error interno del servidor"];
  }
}

// ==================== SERVICIOS POR COMPAÑÍA ====================

/**
 * Obtener bomberos por compañía específica
 */
export async function getBomberosByCompaniaService(idCompania) {
  try {
    const bomberoRepository = AppDataSource.getRepository(Bombero);

    const bomberos = await bomberoRepository
      .createQueryBuilder("bombero")
      .leftJoinAndSelect("bombero.roles", "rol")
      .leftJoin("fichaBombero", "ficha", "ficha.idBombero = bombero.id")
      .leftJoin("compania", "compania", "compania.id = ficha.idCompania")
      .select([
        "bombero.id",
        "bombero.nombres",
        "bombero.apellidos",
        "bombero.run",
        "bombero.email",
        "bombero.activo",
        "rol.id",
        "rol.nombre",
        "ficha.id",
        "ficha.nombre",
        "ficha.telefono",
        "ficha.licenciaClaseF",
        "compania.id",
        "compania.nombre"
      ])
      .where("bombero.activo = :activo", { activo: true })
      .andWhere("ficha.idCompania = :idCompania", { idCompania })
      .orderBy("bombero.apellidos", "ASC")
      .addOrderBy("bombero.nombres", "ASC")
      .getMany();

    if (!bomberos || bomberos.length === 0) {
      return [[], null];
    }

    // Formatear los datos
    const bomberosData = bomberos.map((bombero) => ({
      id: bombero.id,
      nombres: bombero.nombres,
      apellidos: bombero.apellidos,
      run: bombero.run,
      email: bombero.email,
      activo: bombero.activo,
      roles: bombero.roles ? bombero.roles.map((rol) => ({
        id: rol.id,
        nombre: rol.nombre
      })) : [],
      ficha: bombero.ficha || null
    }));

    return [bomberosData, null];
  } catch (error) {
    console.error("Error al obtener bomberos por compañía:", error);
    return [null, "Error interno del servidor"];
  }
}

/**
 * Obtener la compañía de un usuario/bombero
 */
export async function getCompaniaUsuarioService(idBombero) {
  try {
    const fichaBomberoRepository = AppDataSource.getRepository(FichaBombero);

    const ficha = await fichaBomberoRepository
      .createQueryBuilder("ficha")
      .leftJoinAndSelect("ficha.compania", "compania")
      .select([
        "ficha.id",
        "ficha.idCompania",
        "compania.id",
        "compania.nombre",
        "compania.direccion",
        "compania.telefono"
      ])
      .where("ficha.idBombero = :idBombero", { idBombero })
      .getOne();

    if (!ficha || !ficha.compania) {
      return [null, "No se encontró compañía para este bombero"];
    }

    return [ficha.compania, null];
  } catch (error) {
    console.error("Error al obtener compañía del usuario:", error);
    return [null, "Error interno del servidor"];
  }
}

/**
 * Obtener estadísticas de bomberos de una compañía
 */
export async function getEstadisticasBomberosCompaniaService(idCompania) {
  try {
    const bomberoRepository = AppDataSource.getRepository(Bombero);

    // Obtener estadísticas básicas
    const queryBuilder = bomberoRepository
      .createQueryBuilder("bombero")
      .leftJoin("fichaBombero", "ficha", "ficha.idBombero = bombero.id")
      .where("ficha.idCompania = :idCompania", { idCompania });

    const totalBomberos = await queryBuilder.getCount();
    
    const bomberosActivos = await queryBuilder
      .clone()
      .andWhere("bombero.activo = :activo", { activo: true })
      .getCount();

    const bomberosInactivos = totalBomberos - bomberosActivos;

    // Bomberos con licencia clase F
    const bomberosConLicencia = await queryBuilder
      .clone()
      .andWhere("bombero.activo = :activo", { activo: true })
      .andWhere("ficha.licenciaClaseF = :licencia", { licencia: true })
      .getCount();

    // Bomberos donantes
    const bomberosDonantes = await queryBuilder
      .clone()
      .andWhere("bombero.activo = :activo", { activo: true })
      .andWhere("ficha.donante = :donante", { donante: true })
      .getCount();

    const estadisticas = {
      totalBomberos,
      bomberosActivos,
      bomberosInactivos,
      bomberosConLicencia,
      bomberosDonantes,
      porcentajeActivos: totalBomberos > 0 ? Math.round((bomberosActivos / totalBomberos) * 100) : 0,
      porcentajeConLicencia: bomberosActivos > 0 ? Math.round((bomberosConLicencia / bomberosActivos) * 100) : 0,
      porcentajeDonantes: bomberosActivos > 0 ? Math.round((bomberosDonantes / bomberosActivos) * 100) : 0
    };

    return [estadisticas, null];
  } catch (error) {
    console.error("Error al obtener estadísticas de bomberos:", error);
    return [null, "Error interno del servidor"];
  }
}

/**
 * Obtener bomberos de otras compañías (excluyendo la del usuario)
 */
export async function getBomberosOtrasCompaniasService(idCompaniaUsuario) {
  try {
    const bomberoRepository = AppDataSource.getRepository(Bombero);

    const bomberos = await bomberoRepository
      .createQueryBuilder("bombero")
      .leftJoinAndSelect("bombero.roles", "rol")
      .leftJoin("fichaBombero", "ficha", "ficha.idBombero = bombero.id")
      .leftJoin("compania", "compania", "compania.id = ficha.idCompania")
      .select([
        "bombero.id",
        "bombero.nombres",
        "bombero.apellidos",
        "bombero.run",
        "bombero.email",
        "bombero.activo",
        "rol.id",
        "rol.nombre",
        "ficha.id",
        "ficha.nombre",
        "ficha.telefono",
        "compania.id",
        "compania.nombre"
      ])
      .where("bombero.activo = :activo", { activo: true })
      .andWhere("ficha.idCompania != :idCompaniaUsuario", { idCompaniaUsuario })
      .andWhere("ficha.idCompania IS NOT NULL")
      .orderBy("compania.nombre", "ASC")
      .addOrderBy("bombero.apellidos", "ASC")
      .addOrderBy("bombero.nombres", "ASC")
      .getMany();

    if (!bomberos || bomberos.length === 0) {
      return [[], null];
    }

    // Formatear los datos
    const bomberosData = bomberos.map((bombero) => ({
      id: bombero.id,
      nombres: bombero.nombres,
      apellidos: bombero.apellidos,
      run: bombero.run,
      email: bombero.email,
      activo: bombero.activo,
      roles: bombero.roles ? bombero.roles.map((rol) => ({
        id: rol.id,
        nombre: rol.nombre
      })) : [],
      compania: bombero.compania ? {
        id: bombero.compania.id,
        nombre: bombero.compania.nombre
      } : null
    }));

    return [bomberosData, null];
  } catch (error) {
    console.error("Error al obtener bomberos de otras compañías:", error);
    return [null, "Error interno del servidor"];
  }
}

