"use strict";
import Rol from "../../entities/rol.entity.js";
import Permiso from "../../entities/permiso.entity.js";
import { AppDataSource } from "../configDb.js";
import { In } from "typeorm";
import logger from "../logger.js";

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
        nombre: "bombero:leer_perfil",
        descripcion: "Permite leer el perfil del propio bombero",
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
        nombre: "bombero:crear",
        descripcion: "Permite crear nuevos bomberos",
        categoria: "Bomberos",
        ruta: "/api/bombero",
        metodo: "POST",
      },
      {
        nombre: "bombero:leer",
        descripcion: "Permite leer información de todos los bomberos",
        categoria: "Bomberos",
        ruta: "/api/bombero",
        metodo: "GET",
      },
      {
        nombre: "bombero:leer_especifico",
        descripcion:
          "Permite leer información de un bombero especifico (ej. por ID)",
        categoria: "Bomberos",
        ruta: "/api/bombero/detalles/:id",
        metodo: "GET",
      },
      {
        nombre: "bombero:actualizar",
        descripcion: "Permite actualizar información de un bombero especifico",
        categoria: "Bomberos",
        ruta: "/api/bombero/detalles/:id",
        metodo: "PATCH",
      },
      {
        nombre: "bombero:eliminar",
        descripcion: "Permite eliminar bomberos",
        categoria: "Bomberos",
        ruta: "/api/bombero/detalles/:id",
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
        nombre: "rol:crear",
        descripcion: "Permite crear nuevos roles",
        categoria: "Roles",
        ruta: "/api/rol",
        metodo: "POST",
      },
      {
        nombre: "rol:leer",
        descripcion: "Permite leer la lista de roles y sus detalles",
        categoria: "Roles",
        ruta: "/api/rol",
        metodo: "GET",
      },
      {
        nombre: "rol:actualizar",
        descripcion: "Permite actualizar roles (nombre, descripción)",
        categoria: "Roles",
        ruta: "/api/rol/detalles/:id",
        metodo: "PATCH",
      },
      {
        nombre: "rol:eliminar",
        descripcion: "Permite eliminar roles",
        categoria: "Roles",
        ruta: "/api/rol/detalles/:id",
        metodo: "DELETE",
      },
      {
        nombre: "rol:asignar_permiso",
        descripcion: "Permite asignar/revocar permisos a un rol",
        categoria: "Roles",
        ruta: "/api/rol/permisos/:id",
        metodo: "PATCH",
      },
      {
        nombre: "permiso:leer",
        descripcion:
          "Permite leer la lista de todos los permisos disponibles en el sistema",
        categoria: "Permisos",
        ruta: "/api/permiso",
        metodo: "GET",
      },
      {
        nombre: "permiso:actualizar",
        descripcion: "Permite actualizar la descripción de permisos existentes",
        categoria: "Permisos",
        ruta: "/api/permiso/:id",
        metodo: "PUT",
      },
      {
        nombre: "disponibilidad:leer",
        descripcion: "Permite leer la disponibilidad de todos los voluntarios",
        categoria: "Disponibilidad",
        ruta: "/api/disponibilidad",
        metodo: "GET",
      },
      {
        nombre: "disponibilidad:leer_especifico",
        descripcion: "Permite leer una disponibilidad específica",
        categoria: "Disponibilidad",
        ruta: "/api/disponibilidad/detail/:id",
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
        descripcion: "Permite actualizar registros de disponibilidad específicos",
        categoria: "Disponibilidad",
        ruta: "/api/disponibilidad/detail/:id",
        metodo: "PATCH",
      },
      {
        nombre: "disponibilidad:eliminar",
        descripcion: "Permite eliminar registros de disponibilidad",
        categoria: "Disponibilidad",
        ruta: "/api/disponibilidad/detail/:id",
        metodo: "DELETE",
      },
      {
        nombre: "disponibilidad:cambiar_estado",
        descripcion: "Permite cambiar el estado de disponibilidad de voluntarios",
        categoria: "Disponibilidad",
        ruta: "/api/disponibilidad/estado/:id",
        metodo: "PATCH",
      },
      // Permisos de Compañía
      {
        nombre: "compania:leer",
        descripcion: "Permite leer la lista de todas las compañías",
        categoria: "Compañía",
        ruta: "/api/compania",
        metodo: "GET",
      },
      {
        nombre: "compania:leer_especifico",
        descripcion: "Permite leer información de una compañía específica",
        categoria: "Compañía",
        ruta: "/api/compania/detail/:id",
        metodo: "GET",
      },
      {
        nombre: "compania:leer_bombero",
        descripcion: "Permite obtener la compañía asociada a un bombero",
        categoria: "Compañía",
        ruta: "/api/compania/bombero/:idBombero",
        metodo: "GET",
      },
      {
        nombre: "compania:crear",
        descripcion: "Permite crear nuevas compañías",
        categoria: "Compañía",
        ruta: "/api/compania",
        metodo: "POST",
      },
      {
        nombre: "compania:actualizar",
        descripcion: "Permite actualizar información de compañías",
        categoria: "Compañía",
        ruta: "/api/compania/detail/:id",
        metodo: "PATCH",
      },
      {
        nombre: "compania:eliminar",
        descripcion: "Permite eliminar compañías",
        categoria: "Compañía",
        ruta: "/api/compania/detail/:id",
        metodo: "DELETE",
      },
    ];

    const permisos = permisosData.map((p) =>
      permisoRepository.create(p),
    );
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
        nivel: 1,
        permisoNames: [
          "bombero:leer_perfil", 
          "bombero:actualizar_perfil",
          "compania:leer_bombero" // Permite ver su propia compañía
        ],
      },
      {
        nombre: "Supervisor",
        descripcion: "Rol intermedio con permisos limitados.",
        nivel: 2,
        permisoNames: [
          "bombero:leer",
          "bombero:cambiar_estado",
          "rol:leer",
          "rol:actualizar",
          "permiso:leer",
          "disponibilidad:leer",
          "disponibilidad:cambiar_estado",
          // Permisos de compañía para supervisores
          "compania:leer",
          "compania:leer_especifico",
          "compania:leer_bombero",
          "compania:actualizar"
        ],
      },
      {
        nombre: "Administrador",
        descripcion: "Rol con acceso total al sistema.",
        nivel: 3,
        permisoNames: [
          "bombero:crear",
          "bombero:leer",
          "bombero:leer_especifico",
          "bombero:actualizar",
          "bombero:eliminar",
          "bombero:cambiar_estado",
          "bombero:asignar_rol",
          "rol:crear",
          "rol:leer",
          "rol:actualizar",
          "rol:eliminar",
          "rol:asignar_permiso",
          "permiso:leer",
          "permiso:actualizar",
          "disponibilidad:leer",
          "disponibilidad:leer_especifico",
          "disponibilidad:crear",
          "disponibilidad:actualizar",
          "disponibilidad:eliminar",
          "disponibilidad:cambiar_estado",
          // Todos los permisos de compañía para administradores
          "compania:leer",
          "compania:leer_especifico",
          "compania:leer_bombero",
          "compania:crear",
          "compania:actualizar",
          "compania:eliminar",
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

    const permisosMap = new Map(
      existingPermisos.map((p) => [p.nombre, p]),
    );

    const rolesToSave = rolesData.map((roleDef) => {
      const permisosForRole = roleDef.permisoNames
        .map((name) => permisosMap.get(name))
        .filter((p) => p); // Filter out undefined if any mistake
      return roleRepository.create({
        nombre: roleDef.nombre,
        descripcion: roleDef.descripcion,
        nivel: roleDef.nivel,
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