"use strict";
import User from "../entities/user.entity.js";
import Role from "../entities/role.entity.js";
import Permission from "../entities/permission.entity.js";
import { AppDataSource } from "./configDb.js";
import { encryptPassword } from "../helpers/bcrypt.helper.js";
import { In } from "typeorm";
import logger from "./logger.js";

async function createPermissions() {
  try {
    const permissionRepository = AppDataSource.getRepository(Permission);
    const count = await permissionRepository.count();
    if (count > 0) {
      logger.info("[SERVER] Permisos ya existen, omitiendo creación.");
      return;
    }

    const permissionsData = [
      {
        nombre: "user:read_profile",
        descripcion: "Permite leer el perfil del propio usuario",
        categoria: "Perfil",
        ruta: "/api/profile",
        metodo: "GET",
      },
      {
        nombre: "user:update_profile",
        descripcion: "Permite actualizar el perfil del propio usuario",
        categoria: "Perfil",
        ruta: "/api/profile",
        metodo: "PATCH",
      },
      {
        nombre: "user:create",
        descripcion: "Permite crear nuevos usuarios",
        categoria: "Usuarios",
        ruta: "/api/user",
        metodo: "POST",
      },
      {
        nombre: "user:read_all",
        descripcion: "Permite leer información de todos los usuarios",
        categoria: "Usuarios",
        ruta: "/api/user",
        metodo: "GET",
      },
      {
        nombre: "user:read_specific",
        descripcion:
          "Permite leer información de un usuario especifico (ej. por ID)",
        categoria: "Usuarios",
        ruta: "/api/user/detail/:id",
        metodo: "GET",
      },
      {
        nombre: "user:update_specific",
        descripcion: "Permite actualizar información de un usuario especifico",
        categoria: "Usuarios",
        ruta: "/api/user/detail/:id",
        metodo: "PATCH",
      },
      {
        nombre: "user:delete",
        descripcion: "Permite eliminar usuarios",
        categoria: "Usuarios",
        ruta: "/api/user/detail/:id",
        metodo: "DELETE",
      },
      {
        nombre: "user:change_status",
        descripcion: "Permite activar/desactivar usuarios",
        categoria: "Usuarios",
        ruta: "/api/user/status/:id",
        metodo: "PATCH",
      },
      {
        nombre: "user:assign_role",
        descripcion: "Permite asignar/revocar roles a un usuario",
        categoria: "Usuarios",
        ruta: "/api/user/roles/:id",
        metodo: "PATCH",
      },
      {
        nombre: "role:create",
        descripcion: "Permite crear nuevos roles",
        categoria: "Roles",
        ruta: "/api/role",
        metodo: "POST",
      },
      {
        nombre: "role:read",
        descripcion: "Permite leer la lista de roles y sus detalles",
        categoria: "Roles",
        ruta: "/api/role",
        metodo: "GET",
      },
      {
        nombre: "role:update",
        descripcion: "Permite actualizar roles (nombre, descripción)",
        categoria: "Roles",
        ruta: "/api/role/detail/:id",
        metodo: "PATCH",
      },
      {
        nombre: "role:delete",
        descripcion: "Permite eliminar roles",
        categoria: "Roles",
        ruta: "/api/role/detail/:id",
        metodo: "DELETE",
      },
      {
        nombre: "role:assign_permission",
        descripcion: "Permite asignar/revocar permisos a un rol",
        categoria: "Roles",
        ruta: "/api/role/permissions/:id",
        metodo: "PATCH",
      },
      {
        nombre: "permission:read",
        descripcion:
          "Permite leer la lista de todos los permisos disponibles en el sistema",
        categoria: "Permisos",
        ruta: "/api/permission",
        metodo: "GET",
      },
      {
        nombre: "permission:read_categories",
        descripcion: "Permite leer los permisos agrupados por categorías",
        categoria: "Permisos",
        ruta: "/api/permission/categories",
        metodo: "GET",
      },
      {
        nombre: "permission:read_stats",
        descripcion: "Permite leer las estadísticas de permisos del sistema",
        categoria: "Permisos",
        ruta: "/api/permission/stats",
        metodo: "GET",
      },
      {
        nombre: "permission:update",
        descripcion: "Permite actualizar la descripción de permisos existentes",
        categoria: "Permisos",
        ruta: "/api/permission/:id",
        metodo: "PUT",
      },
    ];

    const permissions = permissionsData.map((p) =>
      permissionRepository.create(p),
    );
    await permissionRepository.save(permissions);
    logger.info("[SERVER] Permisos creados exitosamente");
  } catch (error) {
    logger.errorWithContext(error, { function: "createPermissions" });
    throw error;
  }
}

async function createRoles() {
  try {
    const roleRepository = AppDataSource.getRepository(Role);
    const permissionRepository = AppDataSource.getRepository(Permission);

    const count = await roleRepository.count();
    if (count > 0) {
      logger.info("[SERVER] Roles ya existen, omitiendo creación.");
      return;
    }

    const rolesData = [
      {
        nombre: "Usuario",
        descripcion: "Rol básico para usuarios con perfil.",
        permissionNames: ["user:read_profile", "user:update_profile"],
      },
      {
        nombre: "Supervisor",
        descripcion: "Rol intermedio con permisos limitados.",
        permissionNames: [
          "user:read_all",
          "user:change_status",
          "role:read",
          "role:update",
          "permission:read",
          "permission:read_categories",
          "permission:read_stats",
        ],
      },
      {
        nombre: "Administrador",
        descripcion: "Rol con acceso total al sistema.",
        permissionNames: [
          "user:create",
          "user:read_all",
          "user:read_specific",
          "user:update_specific",
          "user:delete",
          "user:change_status",
          "user:assign_role",
          "role:create",
          "role:read",
          "role:update",
          "role:delete",
          "role:assign_permission",
          "permission:read",
          "permission:read_categories",
          "permission:read_stats",
          "permission:update",
        ],
      },
    ];

    const allNeededPermissionNames = [
      ...new Set(rolesData.flatMap((r) => r.permissionNames)),
    ];
    const existingPermissions = await permissionRepository.findBy({
      nombre: In(allNeededPermissionNames),
    });

    if (existingPermissions.length !== allNeededPermissionNames.length) {
      const foundNames = existingPermissions.map((p) => p.nombre);
      const missingNames = allNeededPermissionNames.filter(
        (name) => !foundNames.includes(name),
      );
      logger.error(
        `Error: Faltan los siguientes permisos en la BD: ${missingNames.join(", ")}. Asegúrate de que createPermissions se ejecutó correctamente.`,
      );
      return;
    }

    const permissionsMap = new Map(
      existingPermissions.map((p) => [p.nombre, p]),
    );

    const rolesToSave = rolesData.map((roleDef) => {
      const permissionsForRole = roleDef.permissionNames
        .map((name) => permissionsMap.get(name))
        .filter((p) => p); // Filter out undefined if any mistake
      return roleRepository.create({
        nombre: roleDef.nombre,
        descripcion: roleDef.descripcion,
        permisos: permissionsForRole,
      });
    });

    await roleRepository.save(rolesToSave);
    logger.info("[SERVER] Roles creados exitosamente");
  } catch (error) {
    logger.errorWithContext(error, { function: "createRoles" });
    throw error;
  }
}

async function createUsers() {
  try {
    const userRepository = AppDataSource.getRepository(User);
    const roleRepository = AppDataSource.getRepository(Role);

    const count = await userRepository.count();
    if (count > 0) {
      logger.info("[SERVER] Usuarios ya existen, omitiendo creación.");
      return;
    }

    const adminRole = await roleRepository.findOneBy({
      nombre: "Administrador",
    });
    const supervisorRole = await roleRepository.findOneBy({
      nombre: "Supervisor",
    });
    const userRole = await roleRepository.findOneBy({ nombre: "Usuario" });

    if (!adminRole || !supervisorRole || !userRole) {
      logger.error(
        "Error: No se encontraron todos los roles necesarios (Administrador, Supervisor, Usuario). Asegúrate de que createRoles se ejecutó correctamente.",
      );
      return;
    }

    const usersData = [
      {
        nombres: ["Admin", "Principal"],
        apellidos: ["Del Sistema"],
        run: "1234567-4",
        fechaNacimiento: new Date("1980-01-01"),
        email: "admin@example.com",
        telefono: "+569 34526789",
        passwordHash: await encryptPassword("user1234"),
        fechaIngreso: new Date("2020-01-01"),
        direccion: "Av. Providencia 1234, Providencia, Santiago",
        tipoSangre: "O+",
        alergias: ["Polvo", "Ácaros"],
        medicamentos: ["Losartán 50mg"],
        condiciones: ["Diabetes tipo 2 controlada"],
        createdBy: "Sistema",
        activo: true,
        roles: [adminRole, userRole],
      },
      {
        nombres: ["Juan", "Andrés"],
        apellidos: ["Pérez", "Gómez"],
        run: "12345678-5",
        fechaNacimiento: new Date("1990-05-15"),
        email: "editor.juan@example.com",
        telefono: "987654321",
        passwordHash: await encryptPassword("user1234"),
        fechaIngreso: new Date("2022-03-15"),
        direccion: "Calle San Pablo 567, Santiago Centro",
        tipoSangre: "A+",
        alergias: ["Maní", "Nueces"],
        medicamentos: ["Ibuprofeno 600mg"],
        condiciones: ["Asma leve"],
        createdBy: "Sistema",
        activo: true,
        roles: [supervisorRole, userRole],
      },
      {
        nombres: ["Ana", "Lucia"],
        apellidos: ["López", "Diaz"],
        run: "18765432-7",
        fechaNacimiento: new Date("1995-10-20"),
        email: "ana.lopez@example.com",
        telefono: "112233445",
        passwordHash: await encryptPassword("user1234"),
        fechaIngreso: new Date("2023-07-10"),
        direccion: "Pasaje Los Álamos 890, La Florida, Santiago",
        tipoSangre: "B-",
        alergias: [],
        medicamentos: ["Vitamina C 1000mg", "Omega 3"],
        condiciones: ["Miopia"],
        createdBy: "Sistema",
        activo: false,
        roles: [userRole],
      },
    ];

    const users = usersData.map((userData) => userRepository.create(userData));
    await userRepository.save(users);
    logger.info("[SERVER] Usuarios creados exitosamente");
  } catch (error) {
    logger.errorWithContext(error, { function: "createUsers" });
    throw error;
  }
}

export { createPermissions, createRoles, createUsers };
