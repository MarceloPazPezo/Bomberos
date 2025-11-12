"use strict";
import { AppDataSource } from "../config/configDb.js";

export async function obtenerHistorialCompaniaService(idCompania, fechaInicio = null, fechaFin = null) {
    try {
        // Convertir timestamps Unix (segundos) a formato ISO para PostgreSQL
        const fechaInicioISO = fechaInicio ? new Date(fechaInicio * 1000).toISOString() : null;
        const fechaFinISO = fechaFin ? new Date(fechaFin * 1000).toISOString() : null;
        
        /*  ejecutaremos una consulta sql  */
        const query = `
            -- $1 => ID de la compañía
            -- $2 => Fecha inicio (opcional)
            -- $3 => Fecha fin (opcional)

WITH miembros_cia AS (
  SELECT fb."idBombero"
  FROM "fichaBombero" fb
  WHERE fb."idCompania" = $1
),

-- Conteo de asistentes (solo bomberos de la compañía) por EVENTO
asistencia_evento_cia AS (
  SELECT ae."idEvento", COUNT(DISTINCT ae."idBombero")::int AS cantidad
  FROM "asistenciaEvento" ae
  JOIN miembros_cia mc ON mc."idBombero" = ae."idBombero"
  GROUP BY ae."idEvento"
),

-- Eventos creados por miembros de la compañía o con asistencia de miembros
eventos_rel AS (
  SELECT DISTINCT
         e."id",
         e."fechaHoraInicio",
         e."nombre",
         te."nombre" AS tipo_evento
  FROM "evento" e
  LEFT JOIN "tipoEvento" te ON te."id" = e."idTipoEvento"
  WHERE e."creadoPor" IN (SELECT "idBombero" FROM miembros_cia)
     OR EXISTS (
          SELECT 1
          FROM "asistenciaEvento" ae2
          JOIN miembros_cia m2 ON m2."idBombero" = ae2."idBombero"
          WHERE ae2."idEvento" = e."id"
        )
),

eventos_cia AS (
  SELECT
    er."fechaHoraInicio"::timestamp AS fecha,
    'Evento'::text                  AS tipo,
    er."nombre"                     AS titulo,
    er.tipo_evento                  AS "subTipo",
    COALESCE(aec.cantidad, 0)       AS "cantidad de asistentes",
    er."id"                         AS id_origen
  FROM eventos_rel er
  LEFT JOIN asistencia_evento_cia aec ON aec."idEvento" = er."id"
  WHERE ($2::timestamp IS NULL OR er."fechaHoraInicio"::timestamp >= $2::timestamp)
    AND ($3::timestamp IS NULL OR er."fechaHoraInicio"::timestamp <= $3::timestamp)
),

-- Conteo de asistentes (solo bomberos de la compañía) por INCIDENTE
asistencia_incidente_cia AS (
  SELECT ai."idIncidente", COUNT(DISTINCT ai."idBombero")::int AS cantidad
  FROM "asistenciaIncidente" ai
  JOIN miembros_cia mc ON mc."idBombero" = ai."idBombero"
  GROUP BY ai."idIncidente"
),

incidentes_cia AS (
  SELECT
    COALESCE(i."FechaHoraDespacho", i."creadoEl")::timestamp AS fecha,
    'Incidente'::text                AS tipo,
    i."descripcionPreliminar"        AS titulo,
    sti."claveRadial"                AS "subTipo",
    COALESCE(aic.cantidad, 0)        AS "cantidad de asistentes",
    i."id"                           AS id_origen
  FROM "incidente" i
  LEFT JOIN "subTipoIncidente" sti ON sti."id" = i."idSubtipoIncidente"
  LEFT JOIN asistencia_incidente_cia aic ON aic."idIncidente" = i."id"
  WHERE i."idCompania" = $1
    AND ($2::timestamp IS NULL OR COALESCE(i."FechaHoraDespacho", i."creadoEl")::timestamp >= $2::timestamp)
    AND ($3::timestamp IS NULL OR COALESCE(i."FechaHoraDespacho", i."creadoEl")::timestamp <= $3::timestamp)
),

-- Aniversarios anuales de la compañía
aniversarios_cia AS (
  SELECT
    (c."fechaFundacion" + make_interval(years => gs.anniv))::timestamp AS fecha,
    'Aniversario'::text            AS tipo,
    'Aniversario de la Compañía'   AS titulo,
    ''::text                       AS "subTipo",
    NULL::int                      AS "cantidad de asistentes",
    c."id"                         AS id_origen
  FROM "companias" c
  JOIN LATERAL generate_series(
         1,
         EXTRACT(YEAR FROM age(current_date, c."fechaFundacion"))::int
       ) AS gs(anniv) ON TRUE
  WHERE c."id" = $1
    AND ($2::timestamp IS NULL OR (c."fechaFundacion" + make_interval(years => gs.anniv))::timestamp >= $2::timestamp)
    AND ($3::timestamp IS NULL OR (c."fechaFundacion" + make_interval(years => gs.anniv))::timestamp <= $3::timestamp)
)

SELECT fecha, tipo, titulo, "subTipo", "cantidad de asistentes", id_origen
FROM incidentes_cia
UNION ALL
SELECT fecha, tipo, titulo, "subTipo", "cantidad de asistentes", id_origen
FROM eventos_cia
UNION ALL
SELECT fecha, tipo, titulo, "subTipo", "cantidad de asistentes", id_origen
FROM aniversarios_cia
ORDER BY fecha ASC, tipo ASC, id_origen ASC;

        `;
        const result = await AppDataSource.query(query, [idCompania, fechaInicioISO, fechaFinISO]);
        return result;


    } catch (error) {
        console.error("Error al obtener el historial de la compañía:", error);
        throw error;
    }




}

export async function obtenerKpiAsistenciaVoluntarioService(idBombero, fechaInicio = null, fechaFin = null) {
    try {
        // Convertir timestamps Unix (segundos) a formato ISO para PostgreSQL
        const fechaInicioISO = fechaInicio ? new Date(fechaInicio * 1000).toISOString() : null;
        const fechaFinISO = fechaFin ? new Date(fechaFin * 1000).toISOString() : null;

        const query = `
            -- $1 => ID del bombero
            -- $2 => Fecha inicio (opcional)
            -- $3 => Fecha fin (opcional)
            
            WITH asistencia_eventos AS (
              SELECT COUNT(*)::int AS total
              FROM "asistenciaEvento" ae
              JOIN "evento" e ON e."id" = ae."idEvento"
              WHERE ae."idBombero" = $1
                AND ($2::timestamp IS NULL OR e."fechaHoraInicio"::timestamp >= $2::timestamp)
                AND ($3::timestamp IS NULL OR e."fechaHoraInicio"::timestamp <= $3::timestamp)
            ),
            asistencia_incidentes AS (
              SELECT COUNT(*)::int AS total
              FROM "asistenciaIncidente" ai
              JOIN "incidente" i ON i."id" = ai."idIncidente"
              WHERE ai."idBombero" = $1
                AND ($2::timestamp IS NULL OR COALESCE(i."FechaHoraDespacho", i."creadoEl")::timestamp >= $2::timestamp)
                AND ($3::timestamp IS NULL OR COALESCE(i."FechaHoraDespacho", i."creadoEl")::timestamp <= $3::timestamp)
                AND EXISTS (
                  SELECT 1
                  FROM "estadoEstablecido" ee
                  JOIN "estadoReporte" er ON er."id" = ee."idEstado"
                  WHERE ee."idIncidente" = i."id"
                    AND UPPER(er."nombre") = 'APROBADO'
                )
            )
            SELECT 
              COALESCE(ae.total, 0) AS "asistenciaEventos",
              COALESCE(ai.total, 0) AS "asistenciaIncidentes",
              COALESCE(ae.total, 0) + COALESCE(ai.total, 0) AS "totalAsistencias"
            FROM asistencia_eventos ae, asistencia_incidentes ai;
        `;

        const result = await AppDataSource.query(query, [idBombero, fechaInicioISO, fechaFinISO]);
        return result[0] || { asistenciaEventos: 0, asistenciaIncidentes: 0, totalAsistencias: 0 };
    } catch (error) {
        console.error("Error al obtener KPI de asistencia del voluntario:", error);
        throw error;
    }
}

export async function obtenerKpiResponsabilidadesVoluntarioService(idBombero, fechaInicio = null, fechaFin = null) {
    try {
        // Convertir timestamps Unix (segundos) a formato ISO para PostgreSQL
        const fechaInicioISO = fechaInicio ? new Date(fechaInicio * 1000).toISOString() : null;
        const fechaFinISO = fechaFin ? new Date(fechaFin * 1000).toISOString() : null;

        const query = `
            -- Parámetros: $1 = bombero_id, $2 = fecha_inicio (timestamp), $3 = fecha_fin (timestamp)
            WITH IncAprobadosEnRango AS (
              SELECT i.id
              FROM public.incidente i
              WHERE ($2::timestamp IS NULL OR i."FechaHoraDespacho" >= $2::timestamp)
                AND ($3::timestamp IS NULL OR i."FechaHoraDespacho" <= $3::timestamp)
                AND EXISTS (
                  SELECT 1
                  FROM public."estadoEstablecido" ee
                  JOIN public."estadoReporte" er ON ee."idEstado" = er.id
                  WHERE ee."idIncidente" = i.id
                    AND UPPER(er.nombre) = 'APROBADO'
                )
            )
            SELECT
              COUNT(*) FILTER (WHERE i."idBomberoACargo" = $1) AS "incidentesACargo",
              COUNT(DISTINCT ed."idIncidente") FILTER (WHERE ed."idBomberoMaquinista" = $1) AS "vecesChofer"
            FROM IncAprobadosEnRango ar
            LEFT JOIN public.incidente i ON i.id = ar.id
            LEFT JOIN public."esDespachado" ed ON ed."idIncidente" = ar.id;
        `;

        const result = await AppDataSource.query(query, [idBombero, fechaInicioISO, fechaFinISO]);
        return result[0] || { incidentesACargo: 0, vecesChofer: 0 };
    } catch (error) {
        console.error("Error al obtener KPI de responsabilidades del voluntario:", error);
        throw error;
    }
}

export async function obtenerResumenActividadVoluntarioService(idBombero, fechaInicio = null, fechaFin = null) {
    try {
        // Convertir timestamps Unix (segundos) a formato ISO para PostgreSQL
        const fechaInicioISO = fechaInicio ? new Date(fechaInicio * 1000).toISOString() : null;
        const fechaFinISO = fechaFin ? new Date(fechaFin * 1000).toISOString() : null;

        const query = `
            -- $1 => ID del bombero
            -- $2 => Fecha inicio (opcional)
            -- $3 => Fecha fin (opcional)
            
            WITH 
            -- Disponibilidades en el rango
            disponibilidades_rango AS (
              SELECT 
                d."fechaInicio",
                d."fechaTermino",
                DATE(d."fechaInicio") AS dia,
                EXTRACT(EPOCH FROM (d."fechaTermino" - d."fechaInicio")) / 3600.0 AS horas_sesion
              FROM "disponibilidades" d
              WHERE d."idBombero" = $1
                AND d."fechaInicio" IS NOT NULL
                AND d."fechaTermino" IS NOT NULL
                AND ($2::timestamp IS NULL OR d."fechaInicio" >= $2::timestamp)
                AND ($3::timestamp IS NULL OR d."fechaTermino" <= $3::timestamp)
            ),
            -- Calcular horas totales de disponibilidad
            horas_disponibilidad AS (
              SELECT 
                COALESCE(SUM(dr.horas_sesion), 0) AS total_horas,
                COUNT(*)::int AS total_sesiones
              FROM disponibilidades_rango dr
            ),
            -- Contar días únicos de disponibilidad
            dias_disponibilidad AS (
              SELECT COUNT(DISTINCT dr.dia)::int AS total_dias
              FROM disponibilidades_rango dr
            ),
            -- Calcular promedio de horas por sesión
            promedio_horas AS (
              SELECT 
                CASE 
                  WHEN hd.total_sesiones > 0 THEN hd.total_horas / hd.total_sesiones
                  ELSE 0
                END AS promedio_horas_sesion
              FROM horas_disponibilidad hd
            )
            
            SELECT 
              COALESCE(hd.total_horas, 0) AS "horasDisponibles",
              COALESCE(dd.total_dias, 0) AS "diasDisponibles",
              COALESCE(hd.total_sesiones, 0) AS "totalSesiones",
              COALESCE(ph.promedio_horas_sesion, 0) AS "promedioHorasSesion"
            FROM horas_disponibilidad hd, dias_disponibilidad dd, promedio_horas ph;
        `;

        const result = await AppDataSource.query(query, [idBombero, fechaInicioISO, fechaFinISO]);
        
        if (result && result[0]) {
            const data = result[0];
            const horasDisponibles = parseFloat(data.horasDisponibles) || 0;
            const horasEnteras = Math.floor(horasDisponibles);
            const minutos = Math.round((horasDisponibles - horasEnteras) * 60);
            
            const promedioHoras = parseFloat(data.promedioHorasSesion) || 0;
            const promedioHorasEnteras = Math.floor(promedioHoras);
            const promedioMinutos = Math.round((promedioHoras - promedioHorasEnteras) * 60);
            
            return {
                horasDisponibles: horasEnteras,
                minutosDisponibles: minutos,
                diasDisponibles: parseInt(data.diasDisponibles) || 0,
                totalSesiones: parseInt(data.totalSesiones) || 0,
                promedioHorasSesion: promedioHorasEnteras,
                promedioMinutosSesion: promedioMinutos
            };
        }
        
        return {
            horasDisponibles: 0,
            minutosDisponibles: 0,
            diasDisponibles: 0,
            totalSesiones: 0,
            promedioHorasSesion: 0,
            promedioMinutosSesion: 0
        };
    } catch (error) {
        console.error("Error al obtener resumen de disponibilidad del voluntario:", error);
        throw error;
    }
}

export async function obtenerHistorialVoluntarioService(idBombero) {
    try {
        /*  ejecutaremos una consulta sql  */
        const query = `
            WITH params AS (SELECT $1::int AS id_bombero),
fb AS (
  SELECT f."id" AS id_ficha, f."idBombero" AS id_bombero,
         f."fechaIngreso" AS fecha_ingreso, f."fechaNacimiento" AS fecha_nac
  FROM "fichaBombero" f
  JOIN params p ON p.id_bombero = f."idBombero"
),
cumples AS (
  SELECT (f.fecha_nac + (gs.n || ' years')::interval)::timestamp AS fecha,
         gs.n AS n_anios
  FROM fb f
  JOIN LATERAL generate_series(
         1,
         GREATEST(0, EXTRACT(year FROM age(now(), f.fecha_nac))::int)
       ) gs(n) ON true
),
lustros AS (
  SELECT (f.fecha_ingreso + (5 * gs.n || ' years')::interval)::timestamp AS fecha,
         5 * gs.n AS anios
  FROM fb f
  JOIN LATERAL generate_series(
         1,
         GREATEST(0, floor(EXTRACT(year FROM age(now(), f.fecha_ingreso)) / 5.0)::int)
       ) gs(n) ON true
)
SELECT * FROM (
  -- Usuario creado / actualizado
  SELECT b."creadoEl" AS fecha,'usuario' AS tipo,'Usuario creado' AS descripcion,
         'crear' AS subtipo, NULL::text AS detalle,'bomberos' AS ref_tabla,b."id" AS ref_id
  FROM "bomberos" b JOIN params p ON p.id_bombero = b."id" WHERE b."creadoEl" IS NOT NULL
  UNION ALL
  SELECT b."actualizadoEl",'usuario','Usuario actualizado',
         'modificar',NULL,'bomberos',b."id"
  FROM "bomberos" b JOIN params p ON p.id_bombero = b."id" WHERE b."actualizadoEl" IS NOT NULL

  UNION ALL
  -- Ingreso, lustros y cumpleaños
  SELECT f.fecha_ingreso,'ingreso','Ingreso a la compañía','ingreso',NULL,'fichaBombero',f.id_ficha FROM fb f
  UNION ALL
  SELECT l.fecha,'ingreso',('Cumple '||l.anios||' años de servicio')::text,'aniversario',NULL,'fichaBombero',f.id_ficha
  FROM lustros l JOIN fb f ON true
  UNION ALL
  SELECT c.fecha,'usuario',('Cumpleaños N° '||c.n_anios)::text,'cumpleaños',NULL,'fichaBombero',f.id_ficha
  FROM cumples c JOIN fb f ON true

  UNION ALL
  -- Asistencia a EVENTOS (detalle: tipo de evento)
  SELECT e."fechaHoraInicio",'asistencia','Asistencia a evento',
         'asistencia a evento',te."nombre",'evento',e."id"
  FROM "asistenciaEvento" ae
  JOIN params p ON p.id_bombero = ae."idBombero"
  JOIN "evento" e ON e."id" = ae."idEvento"
  LEFT JOIN "tipoEvento" te ON te."id" = e."idTipoEvento"

  UNION ALL
  -- Asistencia a INCIDENTES (SOLO APROBADOS) (detalle: clave radial)
  SELECT COALESCE(i."FechaHoraDespacho", i."creadoEl")::timestamp,
         'asistencia',
         'Asistencia a incidente',
         'asistencia a incidente',
         sti."claveRadial",
         'incidente',i."id"
  FROM "asistenciaIncidente" ai
  JOIN params p ON p.id_bombero = ai."idBombero"
  JOIN "incidente" i ON i."id" = ai."idIncidente"
  LEFT JOIN "subTipoIncidente" sti ON sti."id" = i."idSubtipoIncidente"
  WHERE EXISTS (
    SELECT 1
    FROM "estadoEstablecido" ee
    JOIN "estadoReporte" er ON er."id" = ee."idEstado"
    WHERE ee."idIncidente" = i."id"
      AND UPPER(er."nombre") = 'APROBADO'
  )

  UNION ALL
  -- Cambios de estado en incidentes hechos por el voluntario (excluye "Borrador")
  -- (detalle: estado nuevo)
  SELECT ee."fechaHora",'incidente',
         'Modificó estado de incidente',
         'modificar estado',
         er."nombre",
         'estadoEstablecido',ee."idIncidente"
  FROM "estadoEstablecido" ee
  JOIN params p ON p.id_bombero = ee."idBombero"
  LEFT JOIN "estadoReporte" er ON er."id" = ee."idEstado"
  WHERE (er."nombre" IS DISTINCT FROM 'Borrador')

  UNION ALL
  -- Creó / actualizó EVENTO (sin IDs en descripcion)
  SELECT e."creadoEl",'evento','Creó evento','crear',NULL,'evento',e."id"
  FROM "evento" e JOIN params p ON p.id_bombero = e."creadoPor" WHERE e."creadoEl" IS NOT NULL
  UNION ALL
  SELECT e."actualizadoEl",'evento','Actualizó evento','actualizar',NULL,'evento',e."id"
  FROM "evento" e JOIN params p ON p.id_bombero = e."actualizadoPor" WHERE e."actualizadoEl" IS NOT NULL

  UNION ALL
  -- Creó / actualizó INCIDENTE (detalle: clave radial)
  SELECT i."creadoEl",'incidente','Creó incidente','crear incidente',sti."claveRadial",'incidente',i."id"
  FROM "incidente" i
  JOIN params p ON p.id_bombero = i."creadoPor"
  LEFT JOIN "subTipoIncidente" sti ON sti."id" = i."idSubtipoIncidente"
  WHERE i."creadoEl" IS NOT NULL
  UNION ALL
  SELECT i."actualizadoEl",'incidente','Actualizó incidente','modificar incidente',sti."claveRadial",'incidente',i."id"
  FROM "incidente" i
  JOIN params p ON p.id_bombero = i."actualizadoPor"
  LEFT JOIN "subTipoIncidente" sti ON sti."id" = i."idSubtipoIncidente"
  WHERE i."actualizadoEl" IS NOT NULL

  UNION ALL
  -- EPP asignado (aCargoEpp)
  SELECT ace."fechaAsignacion",'Epp',('EPP asignado: '||epp."nombre")::text,'asignado',NULL,'aCargoEpp',ace."id"
  FROM "aCargoEpp" ace
  JOIN fb f ON f.id_ficha = ace."idFichaBombero"
  JOIN "epp" epp ON epp."id" = ace."idEpp"

  UNION ALL
  -- EPP creados/actualizados por el voluntario (tabla epp)
  SELECT epp."creadoEl",'Epp',('Creó EPP: '||epp."nombre")::text,'creadoPor',NULL,'epp',epp."id"
  FROM "epp" epp JOIN params p ON p.id_bombero = epp."creadoPor" WHERE epp."creadoEl" IS NOT NULL
  UNION ALL
  SELECT epp."actualizadoEl",'Epp',('Actualizó EPP: '||epp."nombre")::text,'actualizadoPor',NULL,'epp',epp."id"
  FROM "epp" epp JOIN params p ON p.id_bombero = epp."actualizadoPor" WHERE epp."actualizadoEl" IS NOT NULL

  UNION ALL
  -- Disponibilidades
  SELECT d."fechaInicio",'Disponibilidad','Inicio de disponibilidad','disponibilidad inicio',NULL,'disponibilidades',d."id"
  FROM "disponibilidades" d JOIN params p ON p.id_bombero = d."idBombero" WHERE d."fechaInicio" IS NOT NULL
  UNION ALL
  SELECT d."fechaTermino",'Disponibilidad','Fin de disponibilidad','disponibilidad fin',NULL,'disponibilidades',d."id"
  FROM "disponibilidades" d JOIN params p ON p.id_bombero = d."idBombero" WHERE d."fechaTermino" IS NOT NULL
) t
WHERE t.fecha IS NOT NULL
  AND t.fecha >= (SELECT f.fecha_ingreso FROM fb f)   -- desde la fecha de ingreso
ORDER BY t.fecha DESC, t.ref_tabla, t.ref_id;

        `;
        const result = await AppDataSource.query(query, [idBombero]);
        return result;
    } catch (error) {
        console.error("Error al obtener el historial del voluntario:", error);
        throw error;
    }
}

/**
 * Obtiene el heatmap de disponibilidad día×hora para un voluntario específico
 * @param {number} idBombero - ID del bombero
 * @param {number} fechaInicio - Timestamp Unix (segundos) de fecha inicio
 * @param {number} fechaFin - Timestamp Unix (segundos) de fecha fin
 * @returns {Promise<Array>} Array con conteos por día de semana y hora
 */
export async function obtenerHeatmapDisponibilidadVoluntarioService(idBombero, fechaInicio, fechaFin) {
    try {
        // Convertir timestamps Unix (segundos) a formato ISO para PostgreSQL
        const fechaInicioISO = new Date(fechaInicio * 1000).toISOString();
        const fechaFinISO = new Date(fechaFin * 1000).toISOString();

        const query = `
            WITH disponibilidades_filtradas AS (
                SELECT 
                    d."id",
                    d."fechaInicio",
                    d."fechaTermino"
                FROM "disponibilidades" d
                WHERE d."idBombero" = $1
                    AND d."fechaInicio" IS NOT NULL
                    AND d."fechaTermino" IS NOT NULL
                    AND d."fechaInicio" >= $2::timestamp
                    AND d."fechaInicio" <= $3::timestamp
            ),
            horas_generadas AS (
                SELECT 
                    df."id",
                    generate_series(
                        date_trunc('hour', df."fechaInicio"),
                        date_trunc('hour', df."fechaTermino"),
                        interval '1 hour'
                    ) AS hora_slot
                FROM disponibilidades_filtradas df
            )
            SELECT 
                EXTRACT(DOW FROM hg.hora_slot)::int AS dia_semana,
                EXTRACT(HOUR FROM hg.hora_slot)::int AS hora,
                COUNT(*)::int AS cantidad
            FROM horas_generadas hg
            GROUP BY dia_semana, hora
            ORDER BY dia_semana, hora;
        `;

        const result = await AppDataSource.query(query, [idBombero, fechaInicioISO, fechaFinISO]);
        return result;
    } catch (error) {
        console.error("Error al obtener heatmap de disponibilidad del voluntario:", error);
        throw error;
    }
}