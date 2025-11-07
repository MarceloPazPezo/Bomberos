"use strict";
import { AppDataSource } from "../config/configDb.js";
import PuntoGeograficoSchema from "../entities/puntoGeografico.entity.js";
import { validarCoordenadas } from "../helpers/geometry.helper.js";

const puntoRepository = AppDataSource.getRepository(PuntoGeograficoSchema);

/**
 * Crear un nuevo punto geográfico
 */
export async function createPuntoGeograficoService(data) {
    try {
        const { nombre, descripcion, lat, lng, idTipoPunto, idCompania, creadoPor } = data;

        if (!lat || !lng) {
            throw new Error("Latitud y longitud son requeridas");
        }

        // Validar coordenadas
        if (!validarCoordenadas(lat, lng)) {
            throw new Error("Coordenadas inválidas. Latitud debe estar entre -90 y 90, longitud entre -180 y 180");
        }

        // Crear la geometría usando query parametrizado (seguro contra SQL injection)
        const result = await AppDataSource.query(
            `INSERT INTO puntos_geograficos 
            (nombre, descripcion, "idTipoPunto", "idCompania", "creadoPor", punto, "creadoEl", "actualizadoEl")
            VALUES ($1, $2, $3, $4, $5, ST_SetSRID(ST_MakePoint($6, $7), 4326), NOW(), NOW())
            RETURNING id`,
            [nombre, descripcion, idTipoPunto, idCompania, creadoPor, lng, lat]
        );

        const idCreado = result[0].id;

        // Obtener el punto creado con sus relaciones
        const [puntoCreado] = await getPuntoGeograficoByIdService(idCreado);

        return [puntoCreado, null];
    } catch (error) {
        console.error("Error al crear punto geográfico:", error);
        return [null, error.message];
    }
}

/**
 * Obtener todos los puntos geográficos
 */
export async function getPuntosGeograficosService(filtros = {}) {
    try {
        const { idTipoPunto, idCompania } = filtros;

        const puntos = await puntoRepository
            .createQueryBuilder("punto")
            .select([
                "punto.id",
                "punto.nombre",
                "punto.descripcion",
                "punto.estado",
                "punto.creadoEl",
                "punto.actualizadoEl",
            ])
            .leftJoinAndSelect("punto.tipoPunto", "tipoPunto")
            .leftJoinAndSelect("punto.compania", "compania")
            .addSelect("ST_Y(punto.punto)", "lat")
            .addSelect("ST_X(punto.punto)", "lng");

        if (idTipoPunto) {
            puntos.andWhere("punto.idTipoPunto = :idTipoPunto", { idTipoPunto });
        }

        if (idCompania) {
            puntos.andWhere("punto.idCompania = :idCompania", { idCompania });
        }

        const resultado = await puntos.getRawMany();

        // Formatear respuesta
        const puntosFormateados = resultado.map(p => ({
            id: p.punto_id,
            nombre: p.punto_nombre,
            descripcion: p.punto_descripcion,
            coordenadas: {
                lat: parseFloat(p.lat),
                lng: parseFloat(p.lng),
            },
            tipoPunto: {
                id: p.tipoPunto_id,
                nombre: p.tipoPunto_nombre,
                icono: p.tipoPunto_icono,
                color: p.tipoPunto_color,
            },
            compania: p.compania_id ? {
                id: p.compania_id,
                nombre: p.compania_nombre,
            } : null,
            estado: p.punto_estado,
            creadoEl: p.punto_creadoEl,
            actualizadoEl: p.punto_actualizadoEl,
        }));

        return [puntosFormateados, null];
    } catch (error) {
        console.error("Error al obtener puntos geográficos:", error);
        return [null, error.message];
    }
}

/**
 * Obtener punto geográfico por ID
 */
export async function getPuntoGeograficoByIdService(id) {
    try {
        const punto = await puntoRepository
            .createQueryBuilder("punto")
            .select([
                "punto.id",
                "punto.nombre",
                "punto.descripcion",
                "punto.estado",
            ])
            .leftJoinAndSelect("punto.tipoPunto", "tipoPunto")
            .leftJoinAndSelect("punto.compania", "compania")
            .addSelect("ST_Y(punto.punto)", "lat")
            .addSelect("ST_X(punto.punto)", "lng")
            .where("punto.id = :id", { id })
            .getRawOne();

        if (!punto) {
            return [null, "Punto geográfico no encontrado"];
        }

        const puntoFormateado = {
            id: punto.punto_id,
            nombre: punto.punto_nombre,
            descripcion: punto.punto_descripcion,
            coordenadas: {
                lat: parseFloat(punto.lat),
                lng: parseFloat(punto.lng),
            },
            tipoPunto: {
                id: punto.tipoPunto_id,
                nombre: punto.tipoPunto_nombre,
                icono: punto.tipoPunto_icono,
                color: punto.tipoPunto_color,
            },
            compania: punto.compania_id ? {
                id: punto.compania_id,
                nombre: punto.compania_nombre,
            } : null,
            estado: punto.punto_estado,
        };

        return [puntoFormateado, null];
    } catch (error) {
        console.error("Error al obtener punto geográfico:", error);
        return [null, error.message];
    }
}

/**
 * Actualizar punto geográfico
 */
export async function updatePuntoGeograficoService(id, data) {
    try {
        const punto = await puntoRepository.findOne({ where: { id } });

        if (!punto) {
            return [null, "Punto geográfico no encontrado"];
        }

        const { nombre, descripcion, lat, lng, idTipoPunto, idCompania, actualizadoPor } = data;

        // Validar coordenadas si se proporcionan
        if (lat && lng && !validarCoordenadas(lat, lng)) {
            throw new Error("Coordenadas inválidas. Latitud debe estar entre -90 y 90, longitud entre -180 y 180");
        }

        const updateData = {};
        if (nombre) updateData.nombre = nombre;
        if (descripcion !== undefined) updateData.descripcion = descripcion;
        if (idTipoPunto) updateData.idTipoPunto = idTipoPunto;
        if (idCompania !== undefined) updateData.idCompania = idCompania;
        if (actualizadoPor) updateData.actualizadoPor = actualizadoPor;

        // Si se actualizan las coordenadas, usar query parametrizado
        if (lat && lng) {
            const fields = Object.keys(updateData)
                .map((key, index) => `"${key}" = $${index + 1}`)
                .join(", ");

            const values = Object.values(updateData);
            const paramCount = values.length;

            let query = `UPDATE puntos_geograficos SET `;
            if (fields) {
                query += `${fields}, `;
            }
            query += `punto = ST_SetSRID(ST_MakePoint($${paramCount + 1}, $${paramCount + 2}), 4326), "actualizadoEl" = NOW() WHERE id = $${paramCount + 3}`;

            await AppDataSource.query(query, [...values, lng, lat, id]);
        } else if (Object.keys(updateData).length > 0) {
            puntoRepository.merge(punto, updateData);
            await puntoRepository.save(punto);
        }

        // Obtener el punto actualizado
        const [puntoActualizado] = await getPuntoGeograficoByIdService(id);
        return [puntoActualizado, null];
    } catch (error) {
        console.error("Error al actualizar punto geográfico:", error);
        return [null, error.message];
    }
}

/**
 * Eliminar punto geográfico
 */
export async function deletePuntoGeograficoService(id) {
    try {
        const punto = await puntoRepository.findOne({ where: { id } });

        if (!punto) {
            return [null, "Punto geográfico no encontrado"];
        }

        await puntoRepository.remove(punto);

        return [{ message: "Punto geográfico eliminado correctamente" }, null];
    } catch (error) {
        console.error("Error al eliminar punto geográfico:", error);
        return [null, error.message];
    }
}

/**
 * Buscar puntos cercanos a una ubicación
 */
export async function getPuntosCercanosService(lat, lng, radio = 5000) {
    try {
        const puntos = await puntoRepository
            .createQueryBuilder("punto")
            .select([
                "punto.id",
                "punto.nombre",
                "punto.descripcion",
            ])
            .leftJoinAndSelect("punto.tipoPunto", "tipoPunto")
            .leftJoinAndSelect("punto.compania", "compania")
            .addSelect("ST_Y(punto.punto)", "lat")
            .addSelect("ST_X(punto.punto)", "lng")
            .addSelect(
                `ST_Distance(
                    punto.punto::geography,
                    ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography
                )`,
                "distancia"
            )
            .where(`ST_DWithin(
                punto.punto::geography,
                ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography,
                :radio
            )`)
            .setParameters({ lat, lng, radio })
            .orderBy("distancia", "ASC")
            .getRawMany();

        const puntosFormateados = puntos.map(p => ({
            id: p.punto_id,
            nombre: p.punto_nombre,
            coordenadas: {
                lat: parseFloat(p.lat),
                lng: parseFloat(p.lng),
            },
            tipoPunto: {
                nombre: p.tipoPunto_nombre,
                icono: p.tipoPunto_icono,
                color: p.tipoPunto_color,
            },
            distancia: parseFloat(p.distancia),
        }));

        return [puntosFormateados, null];
    } catch (error) {
        console.error("Error al buscar puntos cercanos:", error);
        return [null, error.message];
    }
}

