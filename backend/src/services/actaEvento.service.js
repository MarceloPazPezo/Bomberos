import { AppDataSource } from "../config/configDb.js";
import ActaEvento from "../entities/actaEvento.entity.js";
import Bombero from "../entities/bombero.entity.js";
import AsistenciaEvento from "../entities/asistenciaEvento.entity.js";

export async function obtenerActaEventoService(idEvento) {
    const repo = AppDataSource.getRepository(ActaEvento);
    const acta = await repo.findOne({ where: { idEvento } });
    return acta || null;
}

export async function upsertActaEventoService(idEvento, data, manager = null) {
    const repo = (manager || AppDataSource).getRepository(ActaEvento);

    console.log('[upsertActaEventoService] Buscando acta existente para evento:', idEvento);
    const existing = await repo.findOne({ where: { idEvento: parseInt(idEvento, 10) } });
    console.log('[upsertActaEventoService] Acta existente encontrada:', existing ? 'SÍ' : 'NO');

    const payload = {
        descripcionActa: data?.descripcionActa ?? '',
        temas: Array.isArray(data?.temas) ? data.temas : [],
    };

    console.log('[upsertActaEventoService] Payload:', payload);

    if (existing) {
        console.log('[upsertActaEventoService] Actualizando acta existente');
        Object.assign(existing, payload);
        existing.actualizadoEl = new Date();
        await repo.save(existing);
        console.log('[upsertActaEventoService] Acta actualizada exitosamente');
        return existing;
    }

    console.log('[upsertActaEventoService] Creando nueva acta');
    const created = repo.create({
        idEvento: parseInt(idEvento, 10),
        ...payload,
    });
    await repo.save(created);
    console.log('[upsertActaEventoService] Acta creada exitosamente');
    return created;
}

export async function obtenerListaAsistenciaDetalladaService(idEvento) {
    // Devuelve todos los bomberos activos con flag de asistencia
    const bomberoRepo = AppDataSource.getRepository(Bombero);
    const asistenciaRepo = AppDataSource.getRepository(AsistenciaEvento);

    const [bomberos, asistencias] = await Promise.all([
        bomberoRepo.find({ where: { activo: true }, select: ["id", "nombres", "apellidos", "run"] }),
        asistenciaRepo.find({ where: { idEvento } }),
    ]);

    const presentesSet = new Set(asistencias.map(a => a.idBombero));

    return bomberos.map(b => ({
        idBombero: b.id,
        nombreCompleto: `${b.nombres || ""} ${b.apellidos || ""}`.trim(),
        run: b.run || "",
        asistio: presentesSet.has(b.id),
    }));
}
