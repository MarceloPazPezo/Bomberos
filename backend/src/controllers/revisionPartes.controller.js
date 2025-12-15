"use strict";
import { obtenerIncidentesResumenService } from "../services/incidenteResumen.service.js";
import { handleErrorServer, handleSuccess } from "../handlers/responseHandlers.js";

// Endpoint para ver incidentes con filtros de estado
// - Usuarios con parte_emergencia:revisar o admin: pueden ver TODOS los estados
// - Usuarios con solo parte_emergencia:obtener: pueden ver ENVIADO, APROBADO, CORREGIR (no BORRADOR de otros)
// Query params:
//   estados: coma separada, e.g. "ENVIADO,APROBADO,RECHAZADO"
export async function listarParaRevision(req, res) {
  try {
    // Verificar permisos del usuario
    const bomberoPermisos = new Set();
    if (req.bombero?.roles && Array.isArray(req.bombero.roles)) {
      req.bombero.roles.forEach((rol) => {
        if (rol?.permisos && Array.isArray(rol.permisos)) {
          rol.permisos.forEach((permisoObject) => {
            if (permisoObject?.nombre && typeof permisoObject.nombre === "string") {
              bomberoPermisos.add(permisoObject.nombre.toLowerCase());
            }
          });
        }
      });
    }

    const tienePermisoRevisar = bomberoPermisos.has("parte_emergencia:revisar") || bomberoPermisos.has("parte_emergencia:admin");
    const idBomberoActual = req.bombero?.id;

    const estadosParam = (req.query?.estados || "").toString();
    const estados = estadosParam
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const options = {
      allowedEstados: estados.length > 0 ? estados : undefined,
    };

    // Si el usuario NO tiene permiso de revisar, excluir BORRADOR de otros usuarios
    if (!tienePermisoRevisar) {
      options.excludeBorradorExcepto = idBomberoActual;
    }

    const data = await obtenerIncidentesResumenService(options);

    return handleSuccess(res, 200, "Incidentes para revisión", data);
  } catch (error) {
    return handleErrorServer(res, 500, error.message || "Error interno");
  }
}

export default { listarParaRevision };
