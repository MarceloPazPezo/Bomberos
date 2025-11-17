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
        const { 
            nombre, 
            descripcion, 
            lat, 
            lng, 
            idTipoPunto, 
            idCompania, 
            creadoPor,
            categoria = 'PUNTO_INTERES',
            idBombero = null,
            idIncidente = null,
            estado = 'BUENO'
        } = data;

        if (!lat || !lng) {
            throw new Error("Latitud y longitud son requeridas");
        }

        // Validar coordenadas
        if (!validarCoordenadas(lat, lng)) {
            throw new Error("Coordenadas inválidas. Latitud debe estar entre -90 y 90, longitud entre -180 y 180");
        }

        // Validar categoría
        const categoriasValidas = ['PUNTO_INTERES', 'UBICACION_BOMBERO', 'INCIDENTE'];
        if (!categoriasValidas.includes(categoria)) {
            throw new Error(`Categoría inválida. Debe ser una de: ${categoriasValidas.join(', ')}`);
        }

        // Validar coherencia de datos según categoría
        if (categoria === 'UBICACION_BOMBERO' && !idBombero) {
            throw new Error("idBombero es requerido para categoría UBICACION_BOMBERO");
        }
        if (categoria === 'INCIDENTE' && !idIncidente) {
            throw new Error("idIncidente es requerido para categoría INCIDENTE");
        }

        // Crear la geometría usando query parametrizado (seguro contra SQL injection)
        const result = await AppDataSource.query(
            `INSERT INTO puntos_geograficos 
            (nombre, descripcion, "idTipoPunto", "idCompania", "creadoPor", categoria, "idBombero", "idIncidente", estado, punto, "creadoEl", "actualizadoEl")
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, ST_SetSRID(ST_MakePoint($10, $11), 4326), NOW(), NOW())
            RETURNING id`,
            [nombre, descripcion, idTipoPunto, idCompania, creadoPor, categoria, idBombero, idIncidente, estado, lng, lat]
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
 * Crear punto geográfico para un incidente
 * @param {Object} data - Datos del incidente y coordenadas
 * @returns {Promise<Array>} Punto creado o error
 */
export async function createPuntoGeograficoParaIncidenteService(data) {
    try {
        const { idIncidente, lat, lng, idCompania, creadoPor, nombre, descripcion } = data;
        
        if (!idIncidente) {
            throw new Error("idIncidente es requerido");
        }
        
        if (!lat || !lng) {
            throw new Error("Coordenadas son requeridas");
        }
        
        // Buscar un tipo de punto genérico para incidentes (o crear uno por defecto)
        const tipoPuntoRepository = AppDataSource.getRepository("TipoPunto");
        let tipoPunto = await tipoPuntoRepository.findOne({
            where: { nombre: "Incidente" }
        });
        
        // Si no existe, buscar cualquier tipo de punto activo
        if (!tipoPunto) {
            tipoPunto = await tipoPuntoRepository.findOne({
                where: {},
                order: { id: 'ASC' }
            });
        }
        
        if (!tipoPunto) {
            throw new Error("No hay tipos de punto disponibles");
        }
        
        const nombrePunto = nombre || `Incidente #${idIncidente}`;
        const descripcionPunto = descripcion || "Ubicación del incidente";
        
        return await createPuntoGeograficoService({
            nombre: nombrePunto,
            descripcion: descripcionPunto,
            lat,
            lng,
            idTipoPunto: tipoPunto.id,
            idCompania,
            creadoPor,
            categoria: 'INCIDENTE',
            idIncidente,
            estado: 'BUENO'
        });
    } catch (error) {
        console.error("Error al crear punto geográfico para incidente:", error);
        return [null, error.message];
    }
}

/**
 * Crear o actualizar punto geográfico para la ubicación de un bombero
 * @param {Object} data - Datos del bombero y coordenadas
 * @returns {Promise<Array>} Punto creado/actualizado o error
 */
export async function createOrUpdatePuntoGeograficoParaBomberoService(data) {
    try {
        const { idBombero, lat, lng, idCompania, creadoPor, nombre, descripcion } = data;
        
        if (!idBombero) {
            throw new Error("idBombero es requerido");
        }
        
        if (!lat || !lng) {
            throw new Error("Coordenadas son requeridas");
        }
        
        // Verificar si ya existe un punto para este bombero
        const puntoGeoRepository = AppDataSource.getRepository("PuntoGeografico");
        const puntoExistente = await puntoGeoRepository.findOne({
            where: { 
                idBombero,
                categoria: 'UBICACION_BOMBERO'
            }
        });
        
        if (puntoExistente) {
            // Actualizar punto existente
            await AppDataSource.query(
                `UPDATE puntos_geograficos 
                SET punto = ST_SetSRID(ST_MakePoint($1, $2), 4326),
                    nombre = $3,
                    descripcion = $4,
                    "actualizadoEl" = NOW()
                WHERE id = $5`,
                [lng, lat, nombre || puntoExistente.nombre, descripcion || puntoExistente.descripcion, puntoExistente.id]
            );
            
            const [puntoActualizado] = await getPuntoGeograficoByIdService(puntoExistente.id);
            return [puntoActualizado, null];
        }
        
        // Crear nuevo punto
        // Buscar un tipo de punto genérico para ubicaciones de bomberos
        const tipoPuntoRepository = AppDataSource.getRepository("TipoPunto");
        let tipoPunto = await tipoPuntoRepository.findOne({
            where: { nombre: "Ubicación Bombero" }
        });
        
        // Si no existe, buscar cualquier tipo de punto activo
        if (!tipoPunto) {
            tipoPunto = await tipoPuntoRepository.findOne({
                where: {},
                order: { id: 'ASC' }
            });
        }
        
        if (!tipoPunto) {
            throw new Error("No hay tipos de punto disponibles");
        }
        
        const nombrePunto = nombre || `Ubicación Bombero #${idBombero}`;
        const descripcionPunto = descripcion || "Ubicación de residencia del bombero";
        
        return await createPuntoGeograficoService({
            nombre: nombrePunto,
            descripcion: descripcionPunto,
            lat,
            lng,
            idTipoPunto: tipoPunto.id,
            idCompania,
            creadoPor,
            categoria: 'UBICACION_BOMBERO',
            idBombero,
            estado: 'BUENO'
        });
    } catch (error) {
        console.error("Error al crear/actualizar punto geográfico para bombero:", error);
        return [null, error.message];
    }
}

/**
 * Obtener todos los puntos geográficos
 */
export async function getPuntosGeograficosService(filtros = {}) {
    try {
        const { idTipoPunto, idCompania, categoria, idBombero, idIncidente } = filtros;

        const puntos = await puntoRepository
            .createQueryBuilder("punto")
            .select([
                "punto.id",
                "punto.nombre",
                "punto.descripcion",
                "punto.estado",
                "punto.categoria",
                "punto.idBombero",
                "punto.idIncidente",
                "punto.creadoEl",
                "punto.actualizadoEl",
            ])
            .leftJoinAndSelect("punto.tipoPunto", "tipoPunto")
            .leftJoinAndSelect("punto.compania", "compania")
            .leftJoinAndSelect("punto.bombero", "bombero")
            .leftJoinAndSelect("punto.incidente", "incidente")
            .addSelect("ST_Y(punto.punto)", "lat")
            .addSelect("ST_X(punto.punto)", "lng");

        if (idTipoPunto) {
            puntos.andWhere("punto.idTipoPunto = :idTipoPunto", { idTipoPunto });
        }

        if (idCompania) {
            puntos.andWhere("punto.idCompania = :idCompania", { idCompania });
        }

        if (categoria) {
            puntos.andWhere("punto.categoria = :categoria", { categoria });
        }

        if (idBombero) {
            puntos.andWhere("punto.idBombero = :idBombero", { idBombero });
        }

        if (idIncidente) {
            puntos.andWhere("punto.idIncidente = :idIncidente", { idIncidente });
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
            bombero: p.bombero_id ? {
                id: p.bombero_id,
                nombres: p.bombero_nombres,
                apellidos: p.bombero_apellidos,
            } : null,
            incidente: p.incidente_id ? {
                id: p.incidente_id,
                numeroIncidente: p.incidente_numeroIncidente,
            } : null,
            estado: p.punto_estado,
            categoria: p.punto_categoria,
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

