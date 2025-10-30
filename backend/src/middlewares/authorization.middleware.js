import {
  handleErrorClient,
  handleErrorServer,
} from "../handlers/responseHandlers.js";

/**
 * Middleware para verificar si el bombero autenticado tiene al menos uno de los roles especificados.
 * Espera que req.bombero esté poblado por un middleware de autenticación previo
 * y que req.bombero.roles sea un array de objetos Rol, donde cada objeto Rol tiene una propiedad 'nombre'.
 *
 * @param {string[]} allowedRoles Array de nombres de roles permitidos para acceder al recurso.
 */
export function authorizeRoles(allowedRoles) {
  return (req, res, next) => {
    try {
      // Usamos optional chaining para req.bombero y req.bombero.roles.
      // También verificamos que req.bombero.roles sea un array.
      if (!req.bombero?.roles || !Array.isArray(req.bombero.roles)) {
        console.error(
          "Error de autorización: req.bombero.roles no está definido o no es un array válido. req.bombero:",
          req.bombero, // Mostrar el req.bombero puede ser útil para depurar
        );
        return handleErrorClient(
          res,
          403,
          "Acceso denegado.",
          "Información de roles no disponible en la sesión.",
        );
      }

      // Al mapear, usamos optional chaining para rol.nombre.
      // Si rol.nombre es undefined, .toLowerCase() fallaría. Con ?., será undefined y .includes lo manejará.
      const bomberoRoles = req.bombero.roles
        .map((rol) => rol?.nombre?.toLowerCase())
        .filter(Boolean);
      // .filter(Boolean) eliminará cualquier undefined o null del array bomberoRoles si algún rol no tiene nombre.

      const hasRequiredRole = allowedRoles.some((allowedRole) =>
        bomberoRoles.includes(allowedRole.toLowerCase()),
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
    } catch (error) {
      console.error("Error inesperado en authorizeRoles:", error);
      return handleErrorServer(
        res,
        500,
        "Error interno del servidor en la autorización de roles.",
      );
    }
  };
}

/**
 * Middleware para verificar si el bombero autenticado tiene TODOS los permisos especificados.
 * Espera que req.bombero sea un objeto Bombero completo de la BD,
 * con req.bombero.roles como un array de objetos Rol, y cada Rol tenga una propiedad 'permisos'
 * que es un array de OBJETOS Permiso, donde cada Permiso tiene una propiedad 'nombre'.
 *
 * @param {string[]} requiredPermisos Array de nombres de permisos requeridos.
 */
export function authorizePermisos(requiredPermisos) {
  return (req, res, next) => {
    try {
      if (!req.bombero?.roles || !Array.isArray(req.bombero.roles)) {
        console.error(
          "Error de autorización: req.bombero.roles no está definido o no es un array válido. req.bombero:",
          req.bombero,
        );
        return handleErrorClient(
          res,
          403,
          "Acceso denegado.",
          "Información de roles no disponible en la sesión.",
        );
      }

      const bomberoPermisos = new Set();
      req.bombero.roles.forEach((rol) => {
        if (rol?.permisos && Array.isArray(rol.permisos)) {
          rol.permisos.forEach((permisoObject) => {
            if (
              permisoObject?.nombre
              && typeof permisoObject.nombre === "string"
            ) {
              bomberoPermisos.add(permisoObject.nombre.toLowerCase());
            } else {
              console.warn(
                "ADVERTENCIA: Se encontró un objeto de permiso sin una propiedad 'nombre' válida. Permiso:",
                permisoObject,
                "en el rol:",
                rol.nombre,
              );
            }
          });
        } else {
          console.warn(
            "ADVERTENCIA: El rol no tiene una propiedad 'permisos' válida o no es un array. Rol:",
            rol?.nombre,
          );
        }
      });

      const hasAllRequiredPermisos = requiredPermisos.every((requiredPermiso) =>
        bomberoPermisos.has(requiredPermiso.toLowerCase()),
      );

      if (!hasAllRequiredPermisos) {
        const missingPermisos = requiredPermisos.filter(
          (rp) => !bomberoPermisos.has(rp.toLowerCase()),
        );
        return handleErrorClient(
          res,
          403,
          "Acceso denegado.",
          `No tienes todos los permisos necesarios para esta acción. Permisos faltantes: ${missingPermisos.join(", ")}`,
        );
      }

      next();
    } catch (error) {
      console.error("Error inesperado en authorizePermisos:", error);
      return handleErrorServer(
        res,
        500,
        "Error interno del servidor en la autorización de permisos.",
      );
    }
  };
}
