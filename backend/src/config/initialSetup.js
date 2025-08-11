"use strict";
import Usuario from "../entities/usuario.entity.js";
import Rol from "../entities/rol.entity.js";
import Permiso from "../entities/permiso.entity.js";
import Sistema from "../entities/sistema.entity.js";
import { AppDataSource } from "./configDb.js";
import { encryptPassword } from "../helpers/bcrypt.helper.js";
import { In } from "typeorm";
import logger from "./logger.js";

async function crearPermisos() {
  try {
    const permissionRepository = AppDataSource.getRepository(Permiso);
    const count = await permissionRepository.count();
    if (count > 0) {
      logger.info("[SERVER] Permisos ya existen, omitiendo creación.");
      return;
    }

    const permissionsData = [
      {
        nombre: "usuario:leer_perfil",
        descripcion: "Permite leer el perfil del propio usuario",
        categoria: "Perfil",
        ruta: "/api/perfil",
        metodo: "GET",
      },
      {
        nombre: "usuario:actualizar_perfil",
        descripcion: "Permite actualizar el perfil del propio usuario",
        categoria: "Perfil",
        ruta: "/api/perfil",
        metodo: "PATCH",
      },
      {
        nombre: "usuario:crear",
        descripcion: "Permite crear nuevos usuarios",
        categoria: "Usuarios",
        ruta: "/api/usuario",
        metodo: "POST",
      },
      {
        nombre: "usuario:leer_todos",
        descripcion: "Permite leer información de todos los usuarios",
        categoria: "Usuarios",
        ruta: "/api/usuario",
        metodo: "GET",
      },
      {
        nombre: "usuario:leer_especifico",
        descripcion:
          "Permite leer información de un usuario especifico (ej. por ID)",
        categoria: "Usuarios",
        ruta: "/api/usuario/detalles/:id",
        metodo: "GET",
      },
      {
        nombre: "usuario:actualizar_especifico",
        descripcion: "Permite actualizar información de un usuario especifico",
        categoria: "Usuarios",
        ruta: "/api/usuario/detalles/:id",
        metodo: "PATCH",
      },
      {
        nombre: "usuario:eliminar",
        descripcion: "Permite eliminar usuarios",
        categoria: "Usuarios",
        ruta: "/api/usuario/detalles/:id",
        metodo: "DELETE",
      },
      {
        nombre: "usuario:cambiar_estado",
        descripcion: "Permite activar/desactivar usuarios",
        categoria: "Usuarios",
        ruta: "/api/usuario/estado/:id",
        metodo: "PATCH",
      },
      {
        nombre: "usuario:asignar_rol",
        descripcion: "Permite asignar/revocar roles a un usuario",
        categoria: "Usuarios",
        ruta: "/api/usuario/roles/:id",
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
        nombre: "permiso:leer_categorias",
        descripcion: "Permite leer los permisos agrupados por categorías",
        categoria: "Permisos",
        ruta: "/api/permiso/categorias",
        metodo: "GET",
      },
      {
        nombre: "permiso:leer_estadisticas",
        descripcion: "Permite leer las estadísticas de permisos del sistema",
        categoria: "Permisos",
        ruta: "/api/permiso/estadisticas",
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
        nombre: "configuracion:leer",
        descripcion: "Permite leer las configuraciones del sistema",
        categoria: "Configuraciones",
        ruta: "/api/configuracion",
        metodo: "GET",
      },
      {
        nombre: "configuracion:actualizar",
        descripcion: "Permite actualizar las configuraciones del sistema",
        categoria: "Configuraciones",
        ruta: "/api/configuracion/:key",
        metodo: "PUT",
      },
      {
        nombre: "configuracion:crear",
        descripcion: "Permite crear nuevas configuraciones del sistema",
        categoria: "Configuraciones",
        ruta: "/api/configuracion",
        metodo: "POST",
      },
    ];

    const permissions = permissionsData.map((p) =>
      permissionRepository.create(p),
    );
    await permissionRepository.save(permissions);
    logger.info("[SERVER] Permisos creados exitosamente");
  } catch (error) {
    logger.errorWithContext(error, { function: "crearPermisos" });
    throw error;
  }
}

async function crearRoles() {
  try {
    const roleRepository = AppDataSource.getRepository(Rol);
    const permissionRepository = AppDataSource.getRepository(Permiso);

    const count = await roleRepository.count();
    if (count > 0) {
      logger.info("[SERVER] Roles ya existen, omitiendo creación.");
      return;
    }

    const rolesData = [
      {
        nombre: "Usuario",
        descripcion: "Rol básico para usuarios con perfil.",
        permissionNames: ["usuario:leer_perfil", "usuario:actualizar_perfil"],
      },
      {
        nombre: "Supervisor",
        descripcion: "Rol intermedio con permisos limitados.",
        permissionNames: [
          "usuario:leer_todos",
          "usuario:cambiar_estado",
          "rol:leer",
          "rol:actualizar",
          "permiso:leer",
          "permiso:leer_categorias",
          "permiso:leer_estadisticas",
        ],
      },
      {
        nombre: "Administrador",
        descripcion: "Rol con acceso total al sistema.",
        permissionNames: [
          "usuario:crear",
          "usuario:leer_todos",
          "usuario:leer_especifico",
          "usuario:actualizar_especifico",
          "usuario:eliminar",
          "usuario:cambiar_estado",
          "usuario:asignar_rol",
          "rol:crear",
          "rol:leer",
          "rol:actualizar",
          "rol:eliminar",
          "rol:asignar_permiso",
          "permiso:leer",
          "permiso:leer_categorias",
          "permiso:leer_estadisticas",
          "permiso:actualizar",
          "configuracion:leer",
          "configuracion:actualizar",
          "configuracion:crear",
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
    logger.errorWithContext(error, { function: "crearRoles" });
    throw error;
  }
}

async function crearUsuarios() {
  try {
    const userRepository = AppDataSource.getRepository(Usuario);
    const roleRepository = AppDataSource.getRepository(Rol);

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
        creadoPor: "Sistema",
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
        creadoPor: "Sistema",
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
        creadoPor: "Sistema",
        activo: false,
        roles: [userRole],
      },
    ];

    const users = usersData.map((userData) => userRepository.create(userData));
    await userRepository.save(users);
    logger.info("[SERVER] Usuarios creados exitosamente");
  } catch (error) {
    logger.errorWithContext(error, { function: "crearUsuarios" });
    throw error;
  }
}

async function crearConfiguracionesSistema() {
  try {
    const systemConfigRepository = AppDataSource.getRepository(Sistema);
    
    const count = await systemConfigRepository.count();
    if (count > 0) {
      logger.info("[SERVER] Configuraciones del sistema ya existen, omitiendo creación.");
      return;
    }

    const configsData = [
      {
        key: "company_name",
        value: "Primera Compañía de Bomberos de Cabrero",
        description: "Nombre de la compañía de bomberos",
        category: "company",
        isEditable: true,
      },
      {
        key: "company_address",
        value: "Av. Principal 123, Cabrero, Chile",
        description: "Dirección de la compañía de bomberos",
        category: "company",
        isEditable: true,
      },
      {
        key: "company_phone",
        value: "+56 9 1234 5678",
        description: "Teléfono de contacto de la compañía",
        category: "company",
        isEditable: true,
      },
      {
        key: "company_email",
        value: "contacto@bomberoscabrero.cl",
        description: "Email de contacto de la compañía",
        category: "company",
        isEditable: true,
      },
      {
        key: "company_logo_url",
        value: "",
        description: "URL del logo de la compañía",
        category: "company",
        isEditable: true,
      },
      {
        key: "company_founded_year",
        value: "1920",
        description: "Año de fundación de la compañía",
        category: "company",
        isEditable: true,
      },
      {
        key: "company_region",
        value: "Región del Biobío",
        description: "Región donde opera la compañía",
        category: "company",
        isEditable: true,
      },
      {
        key: "company_city",
        value: "Cabrero",
        description: "Ciudad donde opera la compañía",
        category: "company",
        isEditable: true,
      },
      {
        key: "system_version",
        value: "1.0.0",
        description: "Versión del sistema",
        category: "system",
        isEditable: false,
      },
      {
        key: "maintenance_mode",
        value: "false",
        description: "Modo de mantenimiento del sistema",
        category: "system",
        isEditable: true,
      },
    ];

    const configs = configsData.map((configData) =>
      systemConfigRepository.create(configData)
    );
    await systemConfigRepository.save(configs);
    logger.info("[SERVER] Configuraciones del sistema creadas exitosamente");
  } catch (error) {
    logger.errorWithContext(error, { function: "crearConfiguracionesSistema" });
    throw error;
  }
}

export { crearPermisos, crearRoles, crearUsuarios, crearConfiguracionesSistema };

