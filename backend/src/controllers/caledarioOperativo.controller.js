"use strict";
import { handleErrorClient, handleErrorServer, handleSuccess } from "../handlers/responseHandlers.js";
import { crearEventoService, 
    obtenerEventosService, 
    obtenerTiposEventoService, 
    actualizarEventoService, 
    eliminarEventoService, 
    obtenerEventoPorIdService,
    obtenerCumpleanosYingresoService,
    obtenerAniversarioService,
    RegistrarAsistenciaEventoService,
    obtenerAsistenciaEventoService
} from "../services/evento.service.js";

import { crearDireccionService, eliminarDireccionService, actualizarDireccionService } from "../services/direccion.service.js";
import { AppDataSource } from "../config/configDb.js";
import Direccion from "../entities/direccion.entity.js";

export async function obtenerEventos(req, res) {
    try {
        const eventos = await obtenerEventosService();
        if (!eventos || eventos.length === 0) return handleSuccess(res, 204);
        return handleSuccess(res, 200, "Eventos encontrados", eventos);
    } catch (error) {
        return handleErrorServer(res, 500, error.message);
    }
}

export async function obtenerTiposEvento(req, res) {
    try {
        const tipos = await obtenerTiposEventoService();
        if (!tipos || tipos.length === 0) return handleSuccess(res, 204);
        return handleSuccess(res, 200, "Tipos de evento encontrados", tipos);
    } catch (error) {
        return handleErrorServer(res, 500, error.message);
    }
}

export async function crearEvento(req, res) {
    try {
        const data = req.body;
        if (!data || typeof data !== "object" || Object.keys(data).length === 0) {
            return handleErrorClient(res, 400, "Datos del evento son requeridos");
        }
        const eventodata = data.eventodata || data.dataevento;
        const direcciondata = data.direcciondata || data.datadireccion;
        if (!eventodata || typeof eventodata !== "object") {
            return handleErrorClient(res, 400, "Datos incompletos para crear el evento");
        }

        await AppDataSource.transaction(async (manager) => {
            let idDireccion = null;
            if (direcciondata && Object.keys(direcciondata).length > 0) {
                idDireccion = await crearDireccionService(direcciondata, manager);
            }
            const payloadEvento = { ...eventodata, ...(idDireccion ? { idDireccion } : {}) };
            await crearEventoService(payloadEvento, manager);
        });

        return handleSuccess(res, 201, "Evento creado exitosamente");
    } catch (error) {
        return handleErrorServer(res, 500, error.message);
    }
}

export async function actualizarEvento(req, res) {
    try {
        const { id } = req.params;
        const data = req.body;
        if (!data || typeof data !== "object" || Object.keys(data).length === 0) {
            return handleErrorClient(res, 400, "Datos del evento son requeridos");
        }
        const eventodata = data.eventodata || data.dataevento;
        const direcciondata = data.direcciondata || data.datadireccion;
        if (!eventodata || typeof eventodata !== "object") {
            return handleErrorClient(res, 400, "Datos incompletos para actualizar el evento");
        }

        const antiguoRegistro = await obtenerEventosService(id);
        if (!antiguoRegistro) {
            return handleErrorClient(res, 404, "Evento no encontrado");
        }

        await AppDataSource.transaction(async (manager) => {
            const tieneDireccionPrevia = !!antiguoRegistro.idDireccion;
            const hayNuevaDireccionData = !!(direcciondata && Object.keys(direcciondata).length > 0);

            if (hayNuevaDireccionData) {
                if (tieneDireccionPrevia) {
                    const dirRepo = manager.getRepository(Direccion);
                    const dir = await dirRepo.findOne({ where: { id: antiguoRegistro.idDireccion } });
                    if (!dir) throw new Error("Dirección no encontrada");
                    dirRepo.merge(dir, direcciondata);
                    await dirRepo.save(dir);
                    eventodata.idDireccion = antiguoRegistro.idDireccion;
                } else {
                    const nuevaDireccionId = await crearDireccionService(direcciondata, manager);
                    eventodata.idDireccion = nuevaDireccionId;
                }
            } else if (tieneDireccionPrevia) {
                // Quitar referencia y eliminar la dirección asociada
                await eliminarDireccionService(antiguoRegistro.idDireccion, manager);
                eventodata.idDireccion = null;

            }

            await actualizarEventoService(id, eventodata, manager);
        });

        return handleSuccess(res, 200, "Evento actualizado exitosamente");
    } catch (error) {
        return handleErrorServer(res, 500, error.message);
    }
}

export async function eliminarEvento(req, res) {
    try {
        const { id } = req.params;
        if (!id) {
            return handleErrorClient(res, 400, "ID del evento es requerido");
        }

        const antiguoRegistro = await obtenerEventoPorIdService(id);

        if (!antiguoRegistro) {
            return handleErrorClient(res, 404, "Evento no encontrado");
        }
        const idDireccionBorrar = antiguoRegistro.idDireccion || null;

        await AppDataSource.transaction(async (manager) => {
            await eliminarEventoService(id, manager);
            if (idDireccionBorrar) {

                await eliminarDireccionService(idDireccionBorrar, manager);
            }
        });


        return handleSuccess(res, 200, "Evento eliminado exitosamente");
    } catch (error) {
        return handleErrorServer(res, 500, error.message);
    }
}

export async function obtenerEventosRecurrentes(req, res) {
    try {
        const eventos = await obtenerCumpleanosYingresoService();
        const companias = await obtenerAniversarioService();
        if ((!eventos || eventos.length === 0) && (!companias || companias.length === 0)) return handleSuccess(res, 204);

        return handleSuccess(res, 200, "Eventos recurrentes encontrados", { eventos, companias });
    } catch (error) {
        return handleErrorServer(res, 500, error.message);
    }

}

export async function registrarAsistenciaEvento(req, res) {
    try {
        const { idEvento } = req.params;
        if (!idEvento) {
            return handleErrorClient(res, 400, "ID del evento es requerido");
        }
        const evento = await obtenerEventoPorIdService(idEvento); 
        if (!evento) {
            return handleErrorClient(res, 404, "Evento no encontrado");
        }
        const { idsBomberos } = req.body;

        if (!idsBomberos || !Array.isArray(idsBomberos) || idsBomberos.length === 0) {
            return handleErrorClient(res, 400, "IDs de bomberos son requeridos");
        }

        // Ejecutar en transacción; si algo falla en el proceso de registro, se hará rollback automáticamente
        await AppDataSource.transaction(async (manager) => {
            await RegistrarAsistenciaEventoService(idEvento, idsBomberos, manager);
        });

        return handleSuccess(res, 200, "Asistencia registrada exitosamente");
    } catch (error) {
        return handleErrorServer(res, 500, error.message);
    }
}

export async function obtenerAsistenciaEvento(req, res) {
    try {
        const { idEvento } = req.params;
        if (!idEvento) {
            return handleErrorClient(res, 400, "ID del evento es requerido");
        }
        const evento = await obtenerEventoPorIdService(idEvento);
        if (!evento) {
            return handleErrorClient(res, 404, "Evento no encontrado");
        }
        const asistentes = await obtenerAsistenciaEventoService(idEvento);
        // Devuelve ids de bomberos para facilitar el frontend
        const ids = (asistentes || []).map(a => a.idBombero);
        return handleSuccess(res, 200, "Asistencia del evento", ids);
    } catch (error) {
        return handleErrorServer(res, 500, error.message);
    }
}