import Usuario from "../entities/usuario.entity.js";
import { AppDataSource } from "../config/configDb.js";
import {
  handleErrorClient,
  handleErrorServer,
} from "../handlers/responseHandlers.js";

export async function isAdmin(req, res, next) {
  try {
    const userRepository = AppDataSource.getRepository(Usuario);

    const userFound = await userRepository.findOneBy({ email: req.user.email });

    if (!userFound) {
      return handleErrorClient(
        res,
        404,
        "Usuario no encontrado en la base de datos",
      );
    }

    const rolUser = userFound.rol;

    if (rolUser !== "Administrador") {
      return handleErrorClient(
        res,
        403,
        "Error al acceder al recurso",
        "Se requiere un rol de administrador para realizar esta acción.",
      );
    }
    next();
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

/**
 * Middleware para verificar si el usuario autenticado tiene al menos uno de los roles especificados.
 * Espera que req.user esté poblado por un middleware de autenticación previo
 * y que req.user.roles sea un array de objetos Role, donde cada objeto Role tiene una propiedad 'nombre'.
 *
 * @param {string[]} allowedRoles Array de nombres de roles permitidos para acceder al recurso.
 */
export function authorizeRoles(allowedRoles) {
  return (req, res, next) => {
    // Usamos optional chaining para req.user y req.user.roles.
    // También verificamos que req.user.roles sea un array.
    if (!req.user?.roles || !Array.isArray(req.user.roles)) {
      console.error(
        "Error de autorización: req.user.roles no está definido o no es un array válido. req.user:",
        req.user, // Mostrar el req.user puede ser útil para depurar
      );
      return handleErrorClient(
        res,
        403,
        "Acceso denegado.",
        "Información de roles no disponible en la sesión.",
      );
    }

    // Al mapear, usamos optional chaining para role.nombre.
    // Si role.nombre es undefined, .toLowerCase() fallaría. Con ?., será undefined y .includes lo manejará.
    const userRoles = req.user.roles
      .map((role) => role?.nombre?.toLowerCase())
      .filter(Boolean);
    // .filter(Boolean) eliminará cualquier undefined o null del array userRoles si algún rol no tiene nombre.

    const hasRequiredRole = allowedRoles.some((allowedRole) =>
      userRoles.includes(allowedRole.toLowerCase()),
    );

    if (!hasRequiredRole) {
      return handleErrorClient(
        res,
        403,
        "Acceso denegado.",
        `No tienes los roles necesarios para acceder a este recurso. Roles requeridos: ${allowedRoles.join(
          ", ",
        )}`,
      );
    }

    next();
  };
}

/**
 * Middleware para verificar si el usuario autenticado tiene TODOS los permisos especificados.
 * Espera que req.user sea un objeto User completo de la BD,
 * con req.user.roles como un array de objetos Role, y cada Role tenga una propiedad 'permisos'
 * que es un array de OBJETOS Permission, donde cada Permission tiene una propiedad 'nombre'.
 *
 * @param {string[]} requiredPermissions Array de nombres de permisos requeridos.
 */
export function authorizePermissions(requiredPermissions) {
  return (req, res, next) => {
    if (!req.user?.roles || !Array.isArray(req.user.roles)) {
      console.error(
        "Error de autorización: req.user.roles no está definido o no es un array válido. req.user:",
        req.user,
      );
      return handleErrorClient(
        res,
        403,
        "Acceso denegado.",
        "Información de roles no disponible en la sesión.",
      );
    }

    const userPermissions = new Set();
    req.user.roles.forEach((role) => {
      if (role?.permisos && Array.isArray(role.permisos)) {
        role.permisos.forEach((permissionObject) => {
          if (
            permissionObject?.nombre &&
            typeof permissionObject.nombre === "string"
          ) {
            userPermissions.add(permissionObject.nombre.toLowerCase());
          } else {
            console.warn(
              "ADVERTENCIA: Se encontró un objeto de permiso sin una propiedad 'nombre' válida. Permiso:",
              permissionObject,
              "en el rol:",
              role.nombre,
            );
          }
        });
      } else {
        console.warn(
          "ADVERTENCIA: El rol no tiene una propiedad 'permisos' válida o no es un array. Rol:",
          role?.nombre,
        );
      }
    });

    const hasAllRequiredPermissions = requiredPermissions.every(
      (requiredPermission) =>
        userPermissions.has(requiredPermission.toLowerCase()),
    );

    if (!hasAllRequiredPermissions) {
      const missingPermissions = requiredPermissions.filter(
        (rp) => !userPermissions.has(rp.toLowerCase()),
      );
      return handleErrorClient(
        res,
        403,
        "Acceso denegado.",
        `No tienes todos los permisos necesarios para esta acción. Permisos faltantes: ${missingPermissions.join(", ")}`,
      );
    }

    next();
  };
}
