"use strict";
import Rol from "../../entities/rol.entity.js";
import Permiso from "../../entities/permiso.entity.js";
import { AppDataSource } from "../configDb.js";
import { In } from "typeorm";
import logger from "../configLogger.js";

async function crearPermisos() {
  try {
    const permisoRepository = AppDataSource.getRepository(Permiso);
    const count = await permisoRepository.count();
    if (count > 0) {
      logger.info("[SERVER] Permisos ya existen, omitiendo creación.");
      return;
    }

    const permisosData = [
      {
        nombre: "bombero:obtener_perfil",
        descripcion: "Permite obtener el perfil del propio bombero",
        categoria: "Perfil",
        ruta: "/api/perfil",
        metodo: "GET",
      },
      {
        nombre: "bombero:actualizar_perfil",
        descripcion: "Permite actualizar el perfil del propio bombero",
        categoria: "Perfil",
        ruta: "/api/perfil",
        metodo: "PATCH",
      },
      {
        nombre: "bombero:cambiar_contrasena",
        descripcion: "Permite cambiar la contraseña del propio bombero",
        categoria: "Perfil",
        ruta: "/api/perfil/contrasena",
        metodo: "PATCH",
      },
      {
        nombre: "bombero:obtener",
        descripcion: "Permite obtener información de todos los bomberos",
        categoria: "Bomberos",
        ruta: "/api/bombero",
        metodo: "GET",
      },
      {
        nombre: "bombero:crear",
        descripcion: "Permite crear nuevos bomberos",
        categoria: "Bomberos",
        ruta: "/api/bombero",
        metodo: "POST",
      },
      {
        nombre: "bombero:obtener_especifico",
        descripcion:
          "Permite leer información especifica de un bombero especifico (ej. por ID)",
        categoria: "Bomberos",
        ruta: "/api/bombero/detalle/:id",
        metodo: "GET",
      },
      {
        nombre: "bombero:actualizar",
        descripcion: "Permite actualizar información de un bombero especifico",
        categoria: "Bomberos",
        ruta: "/api/bombero/detalle/:id",
        metodo: "PATCH",
      },
      {
        nombre: "bombero:eliminar",
        descripcion: "Permite eliminar bomberos",
        categoria: "Bomberos",
        ruta: "/api/bombero/detalle/:id",
        metodo: "DELETE",
      },
      {
        nombre: "bombero:cambiar_estado",
        descripcion: "Permite activar/desactivar bomberos",
        categoria: "Bomberos",
        ruta: "/api/bombero/estado/:id",
        metodo: "PATCH",
      },
      {
        nombre: "bombero:asignar_rol",
        descripcion: "Permite asignar/revocar roles a un bombero",
        categoria: "Bomberos",
        ruta: "/api/bombero/roles/:id",
        metodo: "PATCH",
      },
      {
        nombre: "bombero:admin",
        descripcion:
          "Permite administración completa de bomberos (crear, actualizar, eliminar, cambiar estado, asignar roles)",
        categoria: "Bomberos",
        ruta: "/api/bombero/*",
        metodo: "*",
      },
      {
        nombre: "disponibilidad:obtener",
        descripcion:
          "Permite obtener la disponibilidad de todos los voluntarios",
        categoria: "Disponibilidad",
        ruta: "/api/disponibilidad",
        metodo: "GET",
      },
      {
        nombre: "disponibilidad:crear",
        descripcion: "Permite crear registros de disponibilidad",
        categoria: "Disponibilidad",
        ruta: "/api/disponibilidad",
        metodo: "POST",
      },
      {
        nombre: "disponibilidad:actualizar",
        descripcion:
          "Permite actualizar registros de disponibilidad específicos",
        categoria: "Disponibilidad",
        ruta: "/api/disponibilidad/detalle/:id",
        metodo: "PATCH",
      },
      {
        nombre: "disponibilidad:admin",
        descripcion:
          "Permite administración completa de disponibilidad (crear, actualizar, eliminar registros)",
        categoria: "Disponibilidad",
        ruta: "/api/disponibilidad/*",
        metodo: "*",
      },
      {
        nombre: "compania:obtener",
        descripcion: "Permite obtener la lista de todas las compañías",
        categoria: "Compañía",
        ruta: "/api/compania",
        metodo: "GET",
      },
      {
        nombre: "compania:obtener_especifico",
        descripcion: "Permite obtener información de una compañía específica",
        categoria: "Compañía",
        ruta: "/api/compania/detalle/:id",
        metodo: "GET",
      },
      {
        nombre: "compania:bombero_pertenece",
        descripcion: "Permite obtener la compañía asociada a un bombero",
        categoria: "Compañía",
        ruta: "/api/compania/bombero/:idBombero",
        metodo: "GET",
      },
      {
        nombre: "region:obtener",
        descripcion: "Permite obtener la lista de todas las regiones",
        categoria: "Región",
        ruta: "/api/region",
        metodo: "GET",
      },
      {
        nombre: "comuna:obtener",
        descripcion: "Permite obtener la lista de todas las comunas",
        categoria: "Comuna",
        ruta: "/api/comuna",
        metodo: "GET",
      },
      {
        nombre: "permiso:obtener",
        descripcion: "Permite consultar la lista de permisos del sistema",
        categoria: "Permiso",
        ruta: "/api/permiso",
        metodo: "GET",
      },
      {
        nombre: "permiso:admin",
        descripcion:
          "Permiso especial de administrador para la gestion total de permisos",
        categoria: "Administración",
        ruta: "*",
        metodo: "*",
      },
      {
        nombre: "rol:obtener",
        descripcion: "Permite consultar la lista de roles del sistema",
        categoria: "Rol",
        ruta: "/api/rol",
        metodo: "GET",
      },
      {
        nombre: "rol:admin",
        descripcion:
          "Permiso especial de administrador para la gestion total de roles",
        categoria: "Administración",
        ruta: "*",
        metodo: "*",
      },
      {
        nombre: "region:admin",
        descripcion:
          "Permiso especial de administrador para la gestion total de regiones",
        categoria: "Administración",
        ruta: "*",
        metodo: "*",
      },
      {
        nombre: "comuna:admin",
        descripcion:
          "Permiso especial de administrador para la gestion total de comunas",
        categoria: "Administración",
        ruta: "*",
        metodo: "*",
      },
      {
        nombre: "compania:admin",
        descripcion:
          "Permiso especial de administrador para la gestion total de compañias",
        categoria: "Administración",
        ruta: "*",
        metodo: "*",
      },
      {
        nombre: "tipo_sangre:obtener",
        descripcion: "Permite obtener la lista de tipos de sangre",
        categoria: "Tipos de Sangre",
        ruta: "/api/tipo-sangre",
        metodo: "GET",
      },
      {
        nombre: "direccion:crear",
        descripcion: "Permite crear direcciones",
        categoria: "Ubicación",
        ruta: "/api/direccion",
        metodo: "POST",
      },
      {
        nombre: "direccion:obtener",
        descripcion: "Permite obtener direcciones",
        categoria: "Ubicación",
        ruta: "/api/direccion",
        metodo: "GET",
      },
      {
        nombre: "direccion:actualizar",
        descripcion: "Permite actualizar direcciones",
        categoria: "Ubicación",
        ruta: "/api/direccion",
        metodo: "PATCH",
      },
      {
        nombre: "direccion:eliminar",
        descripcion: "Permite eliminar direcciones",
        categoria: "Ubicación",
        ruta: "/api/direccion",
        metodo: "DELETE",
      },
      {
        nombre: "estadoCivil:obtener",
        descripcion: "Permite obtener información de todos los estados civiles",
        categoria: "Estados Civiles",
        ruta: "/api/estado-civil",
        metodo: "GET",
      },
      {
        nombre: "estadoCivil:admin",
        descripcion: "Permite administración completa de estados civiles (crear, actualizar, eliminar)",
        categoria: "Estados Civiles",
        ruta: "/api/estado-civil/*",
        metodo: "*",
      },
    ];

    const permisos = permisosData.map((p) => permisoRepository.create(p));
    await permisoRepository.save(permisos);
    logger.info("[SERVER] Permisos creados exitosamente");
  } catch (error) {
    logger.errorWithContext(error, { function: "crearPermisos" });
    throw error;
  }
}

async function crearRoles() {
  try {
    const roleRepository = AppDataSource.getRepository(Rol);
    const permisoRepository = AppDataSource.getRepository(Permiso);

    const count = await roleRepository.count();
    if (count > 0) {
      logger.info("[SERVER] Roles ya existen, omitiendo creación.");
      return;
    }

    const rolesData = [
      {
        nombre: "Bombero",
        descripcion: "Rol básico para bomberos con perfil.",
        permisoNames: [
          "bombero:obtener_perfil",
          "bombero:actualizar_perfil",
          "bombero:cambiar_contrasena", // Agregar permiso para cambiar contraseña
          "compania:bombero_pertenece", // Permite obtener su propia compañía
          "compania:obtener", // Permite ver todas las compañías
          "region:obtener", // Permite obtener regiones para dropdowns
          "comuna:obtener", // Permite obtener comunas para dropdowns
          "rol:obtener", // Permite obtener roles para dropdowns
          "permiso:obtener", // Permite obtener permisos para dropdowns
          "disponibilidad:obtener", // Permite obtener disponibilidades
          "disponibilidad:crear", // Permite crear su propia disponibilidad
          "disponibilidad:actualizar", // Permite cambiar su propio estado
          "tipo_sangre:obtener", // Permite obtener tipos de sangre
          "region:obtener", // Permite obtener regiones y comunas
          "direccion:crear", // Permite crear direcciones
          "direccion:obtener", // Permite obtener direcciones
          "direccion:actualizar", // Permite actualizar direcciones
        ],
      },
      {
        nombre: "Supervisor",
        descripcion: "Rol intermedio con permisos limitados.",
        permisoNames: [],
      },
      {
        nombre: "Administrador",
        descripcion: "Rol con acceso total al sistema.",
        permisoNames: [
          "bombero:crear",
          "bombero:obtener",
          "bombero:obtener_especifico",
          "bombero:actualizar",
          "bombero:eliminar",
          "bombero:cambiar_estado",
          "bombero:asignar_rol",
          "compania:obtener_especifico",
          "compania:admin",
          "disponibilidad:admin",
          "permiso:admin",
          "rol:admin",
          "region:admin",
          "comuna:admin",
          "tipo_sangre:obtener",
          "region:obtener",
          "direccion:crear",
          "direccion:obtener",
          "direccion:actualizar",
          "direccion:eliminar",
          "estadoCivil:obtener",
          "estadoCivil:admin",
        ],
      },
    ];

    const allNeededPermisoNames = [
      ...new Set(rolesData.flatMap((r) => r.permisoNames)),
    ];
    const existingPermisos = await permisoRepository.findBy({
      nombre: In(allNeededPermisoNames),
    });

    if (existingPermisos.length !== allNeededPermisoNames.length) {
      const foundNames = existingPermisos.map((p) => p.nombre);
      const missingNames = allNeededPermisoNames.filter(
        (name) => !foundNames.includes(name),
      );
      logger.error(
        `Error: Faltan los siguientes permisos en la BD: ${missingNames.join(", ")}. Asegúrate de que createPermisos se ejecutó correctamente.`,
      );
      return;
    }

    const permisosMap = new Map(existingPermisos.map((p) => [p.nombre, p]));

    const rolesToSave = rolesData.map((roleDef) => {
      const permisosForRole = roleDef.permisoNames
        .map((name) => permisosMap.get(name))
        .filter((p) => p); // Filter out undefined if any mistake
      return roleRepository.create({
        nombre: roleDef.nombre,
        descripcion: roleDef.descripcion,
        permisos: permisosForRole,
      });
    });

    await roleRepository.save(rolesToSave);
    logger.info("[SERVER] Roles creados exitosamente");
  } catch (error) {
    logger.errorWithContext(error, { function: "crearRoles" });
    throw error;
  }
}

export { crearPermisos, crearRoles };
