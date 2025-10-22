"use strict";
import { AppDataSource } from "../config/configDb.js";
import { handleErrorClient, handleErrorServer, handleSuccess } from "../handlers/responseHandlers.js";
import { crearEstadoEstablecidoService, obtenerUltimoEstadoPorIncidenteService } from "../services/estadoEstablecido.service.js";

export async function cambiarEstadoIncidente(req, res) {
  const idIncidente = Number(req.params?.id);
  if (!Number.isInteger(idIncidente) || idIncidente <= 0) {
    return handleErrorClient(res, 400, "Id inválido");
  }
  const estadoRaw = (req.body?.estado || "").toString().trim();
  const idBombero = Number(req.body?.idBombero);
  const estado = estadoRaw.toUpperCase();
  const ALLOWED_DEST = new Set(["APROBADO", "CORREGIR", "ENVIADO"]);
  if (!ALLOWED_DEST.has(estado)) {
    return handleErrorClient(res, 400, "Estado destino no permitido");
  }
  if (!Number.isInteger(idBombero) || idBombero <= 0) {
    return handleErrorClient(res, 400, "idBombero requerido");
  }
  try {
    const last = await obtenerUltimoEstadoPorIncidenteService(idIncidente);
    const lastEstado = (last?.estado || "").toUpperCase();
    if (!lastEstado) {
      return handleErrorClient(res, 409, "Incidente sin estado actual");
    }
    // Reglas de transición:
    // - Si actual = ENVIADO => destino en {APROBADO, CORREGIR}
    // - Si actual = BORRADOR o CORREGIR => destino solamente ENVIADO
    let permitido = false;
    if (lastEstado === "ENVIADO" && (estado === "APROBADO" || estado === "CORREGIR")) {
      permitido = true;
    }
    if ((lastEstado === "BORRADOR" || lastEstado === "CORREGIR") && estado === "ENVIADO") {
      permitido = true;
    }
    if (!permitido) {
      return handleErrorClient(res, 409, `Transición no permitida desde ${lastEstado} a ${estado}`);
    }
    // Buscar id del estado destino en EstadoReporte por nombre
    const repoEstado = AppDataSource.getRepository("EstadoReporte");
    const estadoEntidad = await repoEstado.createQueryBuilder("e")
      .where("UPPER(e.nombre) = :n", { n: estado })
      .getOne();
    if (!estadoEntidad) {
      return handleErrorClient(res, 400, "Estado destino no existe");
    }
    await crearEstadoEstablecidoService({
      idBombero,
      idEstado: Number(estadoEntidad.id),
      idIncidente,
      fechaHora: new Date(),
    });
    return handleSuccess(res, 201, "Estado cambiado", { idIncidente, nuevoEstado: estado });
  } catch (err) {
    return handleErrorServer(res, 500, err.message || "Error interno");
  }
}

export default { cambiarEstadoIncidente };
