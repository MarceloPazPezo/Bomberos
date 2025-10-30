"use strict";
import { AppDataSource } from "../config/configDb.js";
import JurisdiccionSchema from "../entities/jurisdiccion.entity.js";
import { validarCoordenadas } from "../helpers/geometry.helper.js";

const jurisdiccionRepository = AppDataSource.getRepository(JurisdiccionSchema);

/**
 * Crear una nueva jurisdicción
 */
export async function createJurisdiccionService(data) {
    try {
        const { nombre, descripcion, coordenadas, color, idCompania, creadoPor } = data;

        if (!coordenadas || coordenadas.length < 4) {
            throw new Error("Se requieren al menos 4 coordenadas para crear un polígono");
        }

        // Validar todas las coordenadas
        for (const coord of coordenadas) {
            if (!validarCoordenadas(coord.lat, coord.lng)) {
                throw new Error(`Coordenadas inválidas: lat=${coord.lat}, lng=${coord.lng}`);
            }
        }

        // Crear el polígono WKT usando formato seguro
        const puntos = coordenadas
            .map(coord => `${parseFloat(coord.lng)} ${parseFloat(coord.lat)}`)
            .join(", ");

        const polygonWKT = `POLYGON((${puntos}))`;

        // Usar query parametrizado
        const result = await AppDataSource.query(
            `INSERT INTO jurisdicciones 
            (nombre, descripcion, color, "idCompania", "creadoPor", area, "creadoEl", "actualizadoEl")
            VALUES ($1, $2, $3, $4, $5, ST_SetSRID(ST_GeomFromText($6), 4326), NOW(), NOW())
            RETURNING id`,
            [nombre, descripcion, color || "#FF0000", idCompania, creadoPor, polygonWKT]
        );

        const idCreado = result[0].id;

        // Obtener la jurisdicción creada con sus relaciones
        const [jurisdiccionCreada] = await getJurisdiccionByIdService(idCreado);

        return [jurisdiccionCreada, null];
    } catch (error) {
        console.error("Error al crear jurisdicción:", error);
        return [null, error.message];
    }
}

/**
 * Obtener todas las jurisdicciones
 */
export async function getJurisdiccionesService(filtros = {}) {
    try {
        const { idCompania } = filtros;

        const query = `
            SELECT 
                j.id,
                j.nombre,
                j.descripcion,
                j.color,
                j.activo,
                j."creadoEl",
                j."actualizadoEl",
                c.id as "companiaId",
                c.nombre as "companiaNombre",
                ST_AsGeoJSON(j.area) as geojson,
                ST_Area(j.area::geography) as area_metros
            FROM jurisdicciones j
            LEFT JOIN companias c ON j."idCompania" = c.id
            WHERE j.activo = true
            ${idCompania ? `AND j."idCompania" = ${idCompania}` : ""}
            ORDER BY j.nombre ASC
        `;

        const jurisdicciones = await AppDataSource.query(query);

        const jurisdiccionesFormateadas = jurisdicciones.map(j => ({
            id: j.id,
            nombre: j.nombre,
            descripcion: j.descripcion,
            color: j.color,
            coordenadas: JSON.parse(j.geojson).coordinates[0].map(coord => ({
                lng: coord[0],
                lat: coord[1],
            })),
            areametros: parseFloat(j.area_metros),
            compania: j.companiaId ? {
                id: j.companiaId,
                nombre: j.companiaNombre,
            } : null,
            activo: j.activo,
            creadoEl: j.creadoEl,
            actualizadoEl: j.actualizadoEl,
        }));

        return [jurisdiccionesFormateadas, null];
    } catch (error) {
        console.error("Error al obtener jurisdicciones:", error);
        return [null, error.message];
    }
}

/**
 * Obtener jurisdicción por ID
 */
export async function getJurisdiccionByIdService(id) {
    try {
        const query = `
            SELECT 
                j.id,
                j.nombre,
                j.descripcion,
                j.color,
                j.activo,
                c.id as "companiaId",
                c.nombre as "companiaNombre",
                ST_AsGeoJSON(j.area) as geojson,
                ST_Area(j.area::geography) as area_metros
            FROM jurisdicciones j
            LEFT JOIN companias c ON j."idCompania" = c.id
            WHERE j.id = $1
        `;

        const resultado = await AppDataSource.query(query, [id]);

        if (resultado.length === 0) {
            return [null, "Jurisdicción no encontrada"];
        }

        const j = resultado[0];
        const jurisdiccionFormateada = {
            id: j.id,
            nombre: j.nombre,
            descripcion: j.descripcion,
            color: j.color,
            coordenadas: JSON.parse(j.geojson).coordinates[0].map(coord => ({
                lng: coord[0],
                lat: coord[1],
            })),
            areaMetros: parseFloat(j.area_metros),
            compania: j.companiaId ? {
                id: j.companiaId,
                nombre: j.companiaNombre,
            } : null,
            activo: j.activo,
        };

        return [jurisdiccionFormateada, null];
    } catch (error) {
        console.error("Error al obtener jurisdicción:", error);
        return [null, error.message];
    }
}

/**
 * Actualizar jurisdicción
 */
export async function updateJurisdiccionService(id, data) {
    try {
        const jurisdiccion = await jurisdiccionRepository.findOne({ where: { id } });

        if (!jurisdiccion) {
            return [null, "Jurisdicción no encontrada"];
        }

        const { nombre, descripcion, coordenadas, color, idCompania, actualizadoPor } = data;

        // Validar coordenadas si se proporcionan
        if (coordenadas && coordenadas.length >= 4) {
            for (const coord of coordenadas) {
                if (!validarCoordenadas(coord.lat, coord.lng)) {
                    throw new Error(`Coordenadas inválidas: lat=${coord.lat}, lng=${coord.lng}`);
                }
            }
        }

        const updateData = {};
        if (nombre) updateData.nombre = nombre;
        if (descripcion !== undefined) updateData.descripcion = descripcion;
        if (color) updateData.color = color;
        if (idCompania !== undefined) updateData.idCompania = idCompania;
        if (actualizadoPor) updateData.actualizadoPor = actualizadoPor;

        // Si se actualizan las coordenadas, usar query parametrizado
        if (coordenadas && coordenadas.length >= 4) {
            const puntos = coordenadas
                .map(coord => `${parseFloat(coord.lng)} ${parseFloat(coord.lat)}`)
                .join(", ");

            const polygonWKT = `POLYGON((${puntos}))`;

            const fields = Object.keys(updateData)
                .map((key, index) => `"${key}" = $${index + 1}`)
                .join(", ");

            const values = Object.values(updateData);
            const paramCount = values.length;

            let query = `UPDATE jurisdicciones SET `;
            if (fields) {
                query += `${fields}, `;
            }
            query += `area = ST_SetSRID(ST_GeomFromText($${paramCount + 1}), 4326), "actualizadoEl" = NOW() WHERE id = $${paramCount + 2}`;

            await AppDataSource.query(query, [...values, polygonWKT, id]);
        } else if (Object.keys(updateData).length > 0) {
            jurisdiccionRepository.merge(jurisdiccion, updateData);
            await jurisdiccionRepository.save(jurisdiccion);
        }

        // Obtener la jurisdicción actualizada
        const [jurisdiccionActualizada] = await getJurisdiccionByIdService(id);
        return [jurisdiccionActualizada, null];
    } catch (error) {
        console.error("Error al actualizar jurisdicción:", error);
        return [null, error.message];
    }
}

/**
 * Eliminar jurisdicción (soft delete)
 */
export async function deleteJurisdiccionService(id) {
    try {
        const jurisdiccion = await jurisdiccionRepository.findOne({ where: { id } });

        if (!jurisdiccion) {
            return [null, "Jurisdicción no encontrada"];
        }

        jurisdiccion.activo = false;
        await jurisdiccionRepository.save(jurisdiccion);

        return [{ message: "Jurisdicción eliminada correctamente" }, null];
    } catch (error) {
        console.error("Error al eliminar jurisdicción:", error);
        return [null, error.message];
    }
}

/**
 * Verificar en qué jurisdicción está un punto
 */
export async function getJurisdiccionPorPuntoService(lat, lng) {
    try {
        const query = `
            SELECT 
                j.id,
                j.nombre,
                j.color,
                c.id as "companiaId",
                c.nombre as "companiaNombre"
            FROM jurisdicciones j
            LEFT JOIN companias c ON j."idCompania" = c.id
            WHERE ST_Contains(
                j.area,
                ST_SetSRID(ST_MakePoint($1, $2), 4326)
            )
            AND j.activo = true
            ORDER BY ST_Area(j.area) ASC
            LIMIT 1
        `;

        const resultado = await AppDataSource.query(query, [lng, lat]);

        if (resultado.length === 0) {
            return [null, "El punto no está dentro de ninguna jurisdicción"];
        }

        const j = resultado[0];
        const jurisdiccion = {
            id: j.id,
            nombre: j.nombre,
            color: j.color,
            compania: j.companiaId ? {
                id: j.companiaId,
                nombre: j.companiaNombre,
            } : null,
        };

        return [jurisdiccion, null];
    } catch (error) {
        console.error("Error al verificar jurisdicción:", error);
        return [null, error.message];
    }
}

