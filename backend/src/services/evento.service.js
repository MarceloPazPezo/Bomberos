import { AppDataSource } from "../config/configDb.js";
import evento from "../entities/evento.entity.js"
import tipoEvento from "../entities/tipoEvento.entity.js"
import bombero from "../entities/bombero.entity.js";
import compania from "../entities/compania.entity.js";
import AsistenciaEvento from "../entities/asistenciaEvento.entity.js";

export async function obtenerEventosService() {
    const repo = AppDataSource.getRepository(evento);
    const eventos = await repo.find();
    return eventos;
}

export async function obtenerEventoPorIdService(id) {
    const repo = AppDataSource.getRepository(evento);
    const eventoEncontrado = await repo.findOne({
        where: { id },
        relations: ['direccion', 'direccion.comuna', 'direccion.comuna.region']
    });
    return eventoEncontrado;
}

export async function obtenerNumeroEventoEnAnioService(idEvento) {
    try {
        const repo = AppDataSource.getRepository(evento);
        const eventoActual = await repo.findOneBy({ id: idEvento });
        if (!eventoActual) return null;

        const fechaEvento = eventoActual.fechaHoraInicio;
        const anio = new Date(fechaEvento).getFullYear();

        // Contar eventos del mismo año que son anteriores o iguales a este evento
        const count = await repo.createQueryBuilder('e')
            .where('EXTRACT(YEAR FROM e.fechaHoraInicio) = :anio', { anio })
            .andWhere('e.fechaHoraInicio <= :fecha', { fecha: fechaEvento })
            .getCount();

        return { numero: count, anio };
    } catch (error) {
        console.error('Error al obtener número de evento en año:', error);
        return null;
    }
}

export async function crearEventoService(data, manager = null) {
    try {
        const repo = (manager || AppDataSource).getRepository(evento);
        const ent = repo.create(data);
        await repo.save(ent);
        return true;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

export async function obtenerTiposEventoService() {
    try {
        const repo = AppDataSource.getRepository(tipoEvento);
        const tipos = await repo.find();
        return tipos;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

export async function actualizarEventoService(id, data, manager = null) {
    try {
        const repo = (manager || AppDataSource).getRepository(evento);
        const ent = await repo.findOneBy({ id });
        if (!ent) {
            throw new Error("Evento no encontrado");
        }
        repo.merge(ent, data);
        await repo.save(ent);
        return true;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

export async function eliminarEventoService(id, manager = null) {
    try {
        const repo = (manager || AppDataSource).getRepository(evento);
        const ent = await repo.findOneBy({ id });
        if (!ent) {
            throw new Error("Evento no encontrado");
        }
        await repo.remove(ent);
        return true;
    } catch (error) {
        console.log(error);
        throw error;
    }
}


export async function obtenerCumpleanosYingresoService() {
    try {
        const repo = AppDataSource.getRepository(bombero);
        const resultado = await repo.query(`
    select
      b.nombres                AS nombre,
      b.apellidos              AS apellido,
      fb."fechaNacimiento"     AS fecha_cumpleanos,
      fb."fechaIngreso"        AS fecha_ingreso,
      b.id                     AS "idBombero",
      b.email
    FROM public.bomberos b
    JOIN public."fichaBombero" fb
      ON fb."idBombero" = b.id
    WHERE b.activo = TRUE;
    `);
        return resultado;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

export async function obtenerAniversarioService() {
    try {
        const repo = AppDataSource.getRepository(compania);
        const resultado = await repo.find({
            select: { nombre: true, id: true, fechaFundacion: true },
        });
        return resultado;
    } catch (error) {
        console.log(error);
        throw error;
    }
}


export async function RegistrarAsistenciaEventoService(eventoId, presentesIds, manager = null) {
    try {
        const repoEvento = (manager || AppDataSource).getRepository(AsistenciaEvento);

        // Estrategia simple y segura: eliminar todas las asistencias actuales del evento y reinsertar las recibidas
        await repoEvento.delete({ idEvento: eventoId });

        if (presentesIds && Array.isArray(presentesIds) && presentesIds.length > 0) {
            const registros = presentesIds.map((idBombero) => repoEvento.create({ idEvento: eventoId, idBombero }));
            await repoEvento.save(registros);
        }
        return true;

    } catch (error) {
        console.log(error);
        throw error;
    }
}

export async function obtenerAsistenciaEventoService(eventoId, manager = null) {
    try {
        const repoEvento = (manager || AppDataSource).getRepository(AsistenciaEvento);
        const asistencias = await repoEvento.find({ where: { idEvento: eventoId } });
        return asistencias;
    } catch (error) {
        console.log(error);
        throw error;
    }
}