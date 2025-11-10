"use strict";
import { AppDataSource } from "../config/configDb.js";

export async function getcantidadDeIncidentesDiasdelaSemana(fechaInicio, fechaFin, idcompania) {
    try {
        // Convertir timestamps a objetos Date si es necesario
        const fechaInicioDate = typeof fechaInicio === 'number' 
            ? new Date(fechaInicio).toISOString().split('T')[0]
            : fechaInicio;
        const fechaFinDate = typeof fechaFin === 'number' 
            ? new Date(fechaFin).toISOString().split('T')[0]
            : fechaFin;

      //  console.log('Fechas recibidas meses:', { fechaInicio, fechaFin, fechaInicioDate, fechaFinDate, idcompania });

        //se hara una consulta sql
        const response = await AppDataSource.query(
            `-- Conteo de INCIDENTES APROBADOS por día de la semana (Lunes→Domingo)
            WITH dias AS (
            SELECT 1 AS dow, 'lunes'::text AS dia, 1 AS ord UNION ALL
            SELECT 2, 'martes',     2 UNION ALL
            SELECT 3, 'miércoles',  3 UNION ALL
            SELECT 4, 'jueves',     4 UNION ALL
            SELECT 5, 'viernes',    5 UNION ALL
            SELECT 6, 'sábado',     6 UNION ALL
            SELECT 0, 'domingo',    7
            ),
            inc_base AS (
            SELECT i."id",
                    COALESCE(i."FechaHoraDespacho", i."creadoEl") AS fh
            FROM "incidente" i
            WHERE COALESCE(i."FechaHoraDespacho", i."creadoEl") >= $1::date
                AND COALESCE(i."FechaHoraDespacho", i."creadoEl") <  $2::date
                AND ($3::int IS NULL OR i."idCompania" = $3::int)
            ),
            estado_final AS (  -- último estado por incidente
            SELECT DISTINCT ON (ee."idIncidente")
                    ee."idIncidente",
                    UPPER(er."nombre") AS estado_final
            FROM "estadoEstablecido" ee
            JOIN "estadoReporte" er ON er."id" = ee."idEstado"
            ORDER BY ee."idIncidente", ee."fechaHora" DESC
            ),
            aprobados AS (
            SELECT ib.fh
            FROM inc_base ib
            JOIN estado_final ef ON ef."idIncidente" = ib."id"
            WHERE ef.estado_final = 'APROBADO'
            ),
            ct AS (
            SELECT EXTRACT(DOW FROM fh)::int AS dow, COUNT(*) AS cnt
            FROM aprobados
            GROUP BY 1
            )
            SELECT d.dia, COALESCE(ct.cnt, 0)::int AS cantidad
            FROM dias d
            LEFT JOIN ct ON ct.dow = d.dow
            ORDER BY d.ord;

            `,
            [fechaInicioDate, fechaFinDate, idcompania]
        );
      
        return response;
    } catch (error) {
       // console.log(error)
        console.error("Error fetching dashboard stats:", error);
        throw error;
    }
}

export async function getcantidadDeIncidentesMeses(añoDesde, añoHasta, idcompania) {
    try {
        // Consulta SQL para obtener la cantidad de incidentes por mes
        // Parámetros posicionales: $1 = añoDesde, $2 = añoHasta, $3 = idcompania
        const response = await AppDataSource.query(
            `WITH meses AS (
            SELECT 1 AS m,  'enero'::text      AS mes, 1 AS ord UNION ALL
            SELECT 2,       'febrero',                 2 UNION ALL
            SELECT 3,       'marzo',                   3 UNION ALL
            SELECT 4,       'abril',                   4 UNION ALL
            SELECT 5,       'mayo',                    5 UNION ALL
            SELECT 6,       'junio',                   6 UNION ALL
            SELECT 7,       'julio',                   7 UNION ALL
            SELECT 8,       'agosto',                  8 UNION ALL
            SELECT 9,       'septiembre',              9 UNION ALL
            SELECT 10,      'octubre',                10 UNION ALL
            SELECT 11,      'noviembre',              11 UNION ALL
            SELECT 12,      'diciembre',              12
            ),
            inc_base AS (
            SELECT i."id",
                    COALESCE(i."FechaHoraDespacho", i."creadoEl") AS fh
            FROM "incidente" i
            WHERE COALESCE(i."FechaHoraDespacho", i."creadoEl")
                    >= make_date($1::int, 1, 1)
                AND COALESCE(i."FechaHoraDespacho", i."creadoEl")
                    <  make_date($2::int + 1, 1, 1)
                AND ($3::int IS NULL OR i."idCompania" = $3::int)
            ),
            estado_final AS (
            SELECT DISTINCT ON (ee."idIncidente")
                    ee."idIncidente",
                    UPPER(er."nombre") AS estado_final
            FROM "estadoEstablecido" ee
            JOIN "estadoReporte" er ON er."id" = ee."idEstado"
            ORDER BY ee."idIncidente", ee."fechaHora" DESC
            ),
            aprobados AS (
            SELECT ib.fh
            FROM inc_base ib
            JOIN estado_final ef ON ef."idIncidente" = ib."id"
            WHERE ef.estado_final = 'APROBADO'
            ),
            ct AS (
            SELECT EXTRACT(MONTH FROM fh)::int AS mes, COUNT(*) AS cnt
            FROM aprobados
            GROUP BY 1
            )
            SELECT ms.mes, COALESCE(ct.cnt,0)::int AS cantidad
            FROM meses ms
            LEFT JOIN ct ON ct.mes = ms.m
            ORDER BY ms.ord;
            `,
            [añoDesde, añoHasta, idcompania]
        );
      
        return response;
    } catch (error) {
        console.log(error)
        console.error("Error fetching dashboard stats:", error);
        throw error;
    }
}

export async function getClavesRadialesMasRepetidas(fechaInicio, fechaFin, idcompania) {
    try {
        // Convertir timestamps a objetos Date si es necesario
        const fechaInicioDate = typeof fechaInicio === 'number' 
            ? new Date(fechaInicio).toISOString().split('T')[0]
            : fechaInicio;
        const fechaFinDate = typeof fechaFin === 'number' 
            ? new Date(fechaFin).toISOString().split('T')[0]
            : fechaFin;

        // Consulta SQL para generar Diagrama de Pareto
        // Top-10 claves radiales + "Otros" con porcentaje acumulado
        const response = await AppDataSource.query(
            `WITH inc_base AS (
                SELECT i."id",
                       st."claveRadial",
                       COALESCE(i."FechaHoraDespacho", i."creadoEl") AS fh
                FROM "incidente" i
                LEFT JOIN "subTipoIncidente" st ON st."id" = i."idSubtipoIncidente"
                WHERE COALESCE(i."FechaHoraDespacho", i."creadoEl") >= $1::date
                  AND COALESCE(i."FechaHoraDespacho", i."creadoEl") <  $2::date
                  AND ($3::int IS NULL OR i."idCompania" = $3::int)
                  AND st."claveRadial" IS NOT NULL
                  AND st."claveRadial" != ''
            ),
            estado_final AS (
                SELECT DISTINCT ON (ee."idIncidente")
                       ee."idIncidente",
                       UPPER(er."nombre") AS estado_final
                FROM "estadoEstablecido" ee
                JOIN "estadoReporte" er ON er."id" = ee."idEstado"
                ORDER BY ee."idIncidente", ee."fechaHora" DESC
            ),
            aprobados AS (
                SELECT ib."claveRadial"
                FROM inc_base ib
                JOIN estado_final ef ON ef."idIncidente" = ib."id"
                WHERE ef.estado_final = 'APROBADO'
            ),
            conteo_total AS (
                SELECT COUNT(*)::int AS total
                FROM aprobados
            ),
            ranking AS (
                SELECT "claveRadial" as clave,
                       COUNT(*)::int AS cantidad,
                       ROW_NUMBER() OVER (ORDER BY COUNT(*) DESC) AS rank
                FROM aprobados
                GROUP BY "claveRadial"
            ),
            top10 AS (
                SELECT clave,
                       cantidad,
                       rank
                FROM ranking
                WHERE rank <= 10
            ),
            otros AS (
                SELECT 'Otros' as clave,
                       SUM(cantidad)::int AS cantidad,
                       11 AS rank
                FROM ranking
                WHERE rank > 10
            ),
            combined AS (
                SELECT clave, cantidad, rank FROM top10
                UNION ALL
                SELECT clave, cantidad, rank FROM otros
                WHERE cantidad > 0
            ),
            with_cumulative AS (
                SELECT c.clave,
                       c.cantidad,
                       c.rank,
                       ct.total,
                       SUM(c.cantidad) OVER (ORDER BY c.rank) AS acumulado
                FROM combined c
                CROSS JOIN conteo_total ct
            )
            SELECT clave,
                   cantidad,
                   rank,
                   ROUND((cantidad::numeric / NULLIF(total, 0) * 100), 2) AS porcentaje,
                   ROUND((acumulado::numeric / NULLIF(total, 0) * 100), 2) AS porcentaje_acumulado,
                   CASE WHEN rank <= 10 THEN true ELSE false END AS mostrar_linea
            FROM with_cumulative
            ORDER BY rank;
            `,
            [fechaInicioDate, fechaFinDate, idcompania]
        );
      
        return response;
    } catch (error) {
        console.error("Error fetching claves radiales (Pareto):", error);
        throw error;
    }
}

export async function getIncidentesPorFranjaHoraria(fechaInicio, fechaFin, idcompania) {
    try {
        // Convertir timestamps a objetos Date si es necesario
        const fechaInicioDate = typeof fechaInicio === 'number' 
            ? new Date(fechaInicio).toISOString().split('T')[0]
            : fechaInicio;
        const fechaFinDate = typeof fechaFin === 'number' 
            ? new Date(fechaFin).toISOString().split('T')[0]
            : fechaFin;

        // Consulta SQL para obtener incidentes por franja horaria (0-23)
        // Parámetros posicionales: $1 = fechaInicio, $2 = fechaFin, $3 = idcompania
        const response = await AppDataSource.query(
            `WITH franjas AS (
            SELECT generate_series(0, 22, 2) AS hora_inicio
            ),
            inc_base AS (
            SELECT i."id",
                   COALESCE(i."FechaHoraDespacho", i."creadoEl") AS fh
            FROM "incidente" i
            WHERE COALESCE(i."FechaHoraDespacho", i."creadoEl") >= $1::date
                AND COALESCE(i."FechaHoraDespacho", i."creadoEl") <  $2::date
                AND ($3::int IS NULL OR i."idCompania" = $3::int)
            ),
            estado_final AS (
            SELECT DISTINCT ON (ee."idIncidente")
                    ee."idIncidente",
                    UPPER(er."nombre") AS estado_final
            FROM "estadoEstablecido" ee
            JOIN "estadoReporte" er ON er."id" = ee."idEstado"
            ORDER BY ee."idIncidente", ee."fechaHora" DESC
            ),
            aprobados AS (
            SELECT EXTRACT(HOUR FROM ib.fh)::int AS hora
            FROM inc_base ib
            JOIN estado_final ef ON ef."idIncidente" = ib."id"
            WHERE ef.estado_final = 'APROBADO'
            ),
            ct AS (
            SELECT 
                FLOOR(hora / 2) * 2 AS hora_inicio,
                COUNT(*) AS cnt
            FROM aprobados
            GROUP BY FLOOR(hora / 2) * 2
            )
            SELECT 
                f.hora_inicio,
                f.hora_inicio + 1 AS hora_fin,
                COALESCE(ct.cnt, 0)::int AS cantidad
            FROM franjas f
            LEFT JOIN ct ON ct.hora_inicio = f.hora_inicio
            ORDER BY f.hora_inicio;
            `,
            [fechaInicioDate, fechaFinDate, idcompania]
        );
      
        return response;
    } catch (error) {
        console.error("Error fetching incidentes por franja horaria:", error);
        throw error;
    }
}

/**
 * Obtiene el mapa de calor de incidentes por día de la semana y hora
 * @param {string} fechaInicio - Fecha de inicio
 * @param {string} fechaFin - Fecha de fin
 * @param {number} idcompania - ID de la compañía
 * @returns {Array} Array con datos en formato: {dia, hora, cantidad}
 */
export async function getHeatmapDiaHora(fechaInicio, fechaFin, idcompania) {
    try {
        const fechaInicioDate = typeof fechaInicio === 'number' 
            ? new Date(fechaInicio).toISOString().split('T')[0]
            : fechaInicio;
        const fechaFinDate = typeof fechaFin === 'number' 
            ? new Date(fechaFin).toISOString().split('T')[0]
            : fechaFin;

        const response = await AppDataSource.query(
            `-- Mapa de calor: Día de la semana × Hora del día (APROBADOS)
            WITH dias AS (
                SELECT 1 AS dow, 'Lunes'::text AS dia, 1 AS ord UNION ALL
                SELECT 2, 'Martes',     2 UNION ALL
                SELECT 3, 'Miércoles',  3 UNION ALL
                SELECT 4, 'Jueves',     4 UNION ALL
                SELECT 5, 'Viernes',    5 UNION ALL
                SELECT 6, 'Sábado',     6 UNION ALL
                SELECT 0, 'Domingo',    7
            ),
            horas AS (
                SELECT generate_series(0, 23) AS hora
            ),
            combinaciones AS (
                SELECT d.dia, d.dow, d.ord, h.hora
                FROM dias d
                CROSS JOIN horas h
            ),
            inc_base AS (
                SELECT i."id",
                       COALESCE(i."FechaHoraDespacho", i."creadoEl") AS fh
                FROM "incidente" i
                WHERE COALESCE(i."FechaHoraDespacho", i."creadoEl") >= $1::date
                  AND COALESCE(i."FechaHoraDespacho", i."creadoEl") <  $2::date
                  AND ($3::int IS NULL OR i."idCompania" = $3::int)
            ),
            estado_final AS (
                SELECT DISTINCT ON (ee."idIncidente")
                       ee."idIncidente",
                       UPPER(er."nombre") AS estado_final
                FROM "estadoEstablecido" ee
                JOIN "estadoReporte" er ON er."id" = ee."idEstado"
                ORDER BY ee."idIncidente", ee."fechaHora" DESC
            ),
            aprobados AS (
                SELECT ib.fh
                FROM inc_base ib
                JOIN estado_final ef ON ef."idIncidente" = ib."id"
                WHERE ef.estado_final = 'APROBADO'
            ),
            ct AS (
                SELECT EXTRACT(DOW FROM a.fh)::int AS dow,
                       EXTRACT(HOUR FROM a.fh)::int AS hora,
                       COUNT(*) AS cantidad
                FROM aprobados a
                GROUP BY dow, hora
            )
            SELECT c.dia,
                   c.dow,
                   c.hora,
                   COALESCE(ct.cantidad, 0)::int AS cantidad,
                   c.ord
            FROM combinaciones c
            LEFT JOIN ct ON ct.dow = c.dow AND ct.hora = c.hora
            ORDER BY c.ord, c.hora;
            `,
            [fechaInicioDate, fechaFinDate, idcompania]
        );
      
        return response;
    } catch (error) {
        console.error("Error fetching heatmap día-hora:", error);
        throw error;
    }
}

/**
 * Obtiene la asistencia promedio de voluntarios por incidente
 * @param {string} fechaInicio - Fecha de inicio
 * @param {string} fechaFin - Fecha de fin
 * @param {number} idcompania - ID de la compañía
 * @returns {Object} Objeto con promedio de asistencia
 */
export async function getAsistenciaPromedio(fechaInicio, fechaFin, idcompania) {
    try {
        const fechaInicioDate = typeof fechaInicio === 'number' 
            ? new Date(fechaInicio).toISOString().split('T')[0]
            : fechaInicio;
        const fechaFinDate = typeof fechaFin === 'number' 
            ? new Date(fechaFin).toISOString().split('T')[0]
            : fechaFin;

        const response = await AppDataSource.query(
            `-- KPI: Asistencia promedio de voluntarios por incidente (APROBADOS)
            WITH inc_base AS (
                SELECT i."id",
                       COALESCE(i."FechaHoraDespacho", i."creadoEl") AS fh
                FROM "incidente" i
                WHERE COALESCE(i."FechaHoraDespacho", i."creadoEl") >= $1::date
                  AND COALESCE(i."FechaHoraDespacho", i."creadoEl") <  $2::date
                  AND ($3::int IS NULL OR i."idCompania" = $3::int)
            ),
            estado_final AS (
                SELECT DISTINCT ON (ee."idIncidente")
                       ee."idIncidente",
                       UPPER(er."nombre") AS estado_final
                FROM "estadoEstablecido" ee
                JOIN "estadoReporte" er ON er."id" = ee."idEstado"
                ORDER BY ee."idIncidente", ee."fechaHora" DESC
            ),
            aprobados AS (
                SELECT ib."id"
                FROM inc_base ib
                JOIN estado_final ef ON ef."idIncidente" = ib."id"
                WHERE ef.estado_final = 'APROBADO'
            ),
            asistencia_por_incidente AS (
                SELECT a."id",
                       COUNT(DISTINCT ai."idBombero")::int AS num_voluntarios
                FROM aprobados a
                LEFT JOIN "asistenciaIncidente" ai ON ai."idIncidente" = a."id"
                GROUP BY a."id"
            )
            SELECT 
                COALESCE(ROUND(AVG(num_voluntarios), 2), 0) AS promedio_asistencia,
                COUNT(*)::int AS total_incidentes,
                COALESCE(SUM(num_voluntarios), 0)::int AS total_voluntarios
            FROM asistencia_por_incidente;
            `,
            [fechaInicioDate, fechaFinDate, idcompania]
        );
      
        return response[0] || { promedio_asistencia: 0, total_incidentes: 0, total_voluntarios: 0 };
    } catch (error) {
        console.error("Error fetching asistencia promedio:", error);
        throw error;
    }
}
export async function getHeatmapDisponibilidad(fechaInicio, fechaFin, idcompania) {
  try {
    // Normaliza fechas considerando zona horaria local
    const toIsoTz = (v, isEnd = false) => {
      if (typeof v === 'number') {
        // Si es timestamp, convertir a fecha local de Chile
        const d = new Date(v);
        return d.toISOString();
      }
      if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v)) {
        // Si es "YYYY-MM-DD", interpretar en zona horaria local de Chile
        // Chile está en UTC-3
        const d = new Date(v + 'T00:00:00-03:00');
        if (isEnd) {
          d.setDate(d.getDate() + 1);
        }
        return d.toISOString();
      }
      return new Date(v).toISOString();
    };

    const desde = toIsoTz(fechaInicio, false);
    const hasta = toIsoTz(fechaFin, true);
    const idComp = idcompania ?? null;

    console.log('getHeatmapDisponibilidad - Fechas UTC:', { desde, hasta });

    const sql = `
      WITH p AS (
        SELECT $1::timestamptz AS desde, $2::timestamptz AS hasta, $3::int AS id_comp
      ),
      -- 1) Todos los slots de 1h dentro del rango (en hora local de Chile)
      slots AS (
        SELECT generate_series(
          date_trunc('hour', p.desde AT TIME ZONE 'America/Santiago') AT TIME ZONE 'America/Santiago',
          date_trunc('hour', (p.hasta - interval '1 hour') AT TIME ZONE 'America/Santiago') AT TIME ZONE 'America/Santiago',
          interval '1 hour'
        ) AS slot_ini
        FROM p
      ),
      slots_labeled AS (
        SELECT
          s.slot_ini,
          CASE EXTRACT(DOW FROM s.slot_ini AT TIME ZONE 'America/Santiago')::int
            WHEN 0 THEN 7 ELSE EXTRACT(DOW FROM s.slot_ini AT TIME ZONE 'America/Santiago')::int
          END AS dow,
          EXTRACT(HOUR FROM s.slot_ini AT TIME ZONE 'America/Santiago')::int AS hora
        FROM slots s
      ),
      -- 2) Presencia binaria por bombero y hora (cualquier solape con el slot cuenta)
      presence AS (
        SELECT DISTINCT
          sl.slot_ini,
          d."idBombero"
        FROM slots_labeled sl
        JOIN p ON true
        JOIN "disponibilidades" d
          ON d."fechaInicio" <  sl.slot_ini + interval '1 hour'
         AND COALESCE(d."fechaTermino", p.hasta) > sl.slot_ini
        JOIN "fichaBombero" fb ON fb."idBombero" = d."idBombero"
        WHERE (p.id_comp IS NULL OR fb."idCompania" = p.id_comp)
      ),
      -- 3) Conteo por slot (incluye 0 cuando no hay nadie)
      cnt_slot AS (
        SELECT
          sl.slot_ini,
          COALESCE(COUNT(DISTINCT pr."idBombero"), 0)::int AS present_cnt
        FROM slots_labeled sl
        LEFT JOIN presence pr ON pr.slot_ini = sl.slot_ini
        GROUP BY sl.slot_ini
      ),
      -- 4) Promedio por Día×Hora usando TODOS los slots del período
      avg_cell AS (
        SELECT
          sl.dow,
          sl.hora,
          AVG(cnt.present_cnt)::numeric(10,2) AS avg_present,
          COUNT(*)::int                        AS num_slots
        FROM slots_labeled sl
        LEFT JOIN cnt_slot cnt ON cnt.slot_ini = sl.slot_ini
        GROUP BY sl.dow, sl.hora
      ),
      dias AS (
        SELECT 1 AS dow, 'lunes'::text AS dia, 1 AS ord UNION ALL
        SELECT 2, 'martes', 2 UNION ALL
        SELECT 3, 'miércoles', 3 UNION ALL
        SELECT 4, 'jueves', 4 UNION ALL
        SELECT 5, 'viernes', 5 UNION ALL
        SELECT 6, 'sábado', 6 UNION ALL
        SELECT 7, 'domingo', 7
      ),
      horas AS (SELECT generate_series(0,23) AS hora)
      SELECT
        d.dia,
        d.dow,
        h.hora,
        COALESCE(ROUND(a.avg_present), 0)::int AS cantidad,  -- oferta promedio redondeada
        COALESCE(a.num_slots, 0)               AS num_slots
      FROM dias d
      CROSS JOIN horas h
      LEFT JOIN avg_cell a ON a.dow = d.dow AND a.hora = h.hora
      ORDER BY d.ord, h.hora;
    `;

    const rows = await AppDataSource.query(sql, [desde, hasta, idComp]);
    
    console.log('Heatmap disponibilidad - Total filas:', rows.length);
    console.log('Heatmap disponibilidad - Filas con cantidad > 0:', 
      rows.filter(r => r.cantidad > 0).length);
    
    return rows; // [{ dia, dow, hora, cantidad, num_slots }]
  } catch (err) {
    console.error('Error getHeatmapDisponibles:', err);
    throw err;
  }
}

// ============================================
// Servicios para Dashboard de Eventos
// ============================================

/**
 * Obtiene la cantidad de eventos por día de la semana
 */
export async function getcantidadDeEventosDiasdelaSemana(fechaInicio, fechaFin) {
  try {
    const fechaInicioDate = typeof fechaInicio === 'number' 
      ? new Date(fechaInicio).toISOString().split('T')[0]
      : fechaInicio;
    const fechaFinDate = typeof fechaFin === 'number' 
      ? new Date(fechaFin).toISOString().split('T')[0]
      : fechaFin;

    const response = await AppDataSource.query(
      `WITH dias AS (
        SELECT 1 AS dow, 'lunes'::text AS dia, 1 AS ord UNION ALL
        SELECT 2, 'martes',     2 UNION ALL
        SELECT 3, 'miércoles',  3 UNION ALL
        SELECT 4, 'jueves',     4 UNION ALL
        SELECT 5, 'viernes',    5 UNION ALL
        SELECT 6, 'sábado',     6 UNION ALL
        SELECT 0, 'domingo',    7
      ),
      conteo AS (
        SELECT EXTRACT(DOW FROM e."fechaHoraInicio")::int AS dow, 
               COUNT(*) AS cnt
        FROM "evento" e
        WHERE e."fechaHoraInicio" >= $1::date
          AND e."fechaHoraInicio" < $2::date
        GROUP BY dow
      )
      SELECT d.dia, COALESCE(c.cnt, 0)::int AS cantidad
      FROM dias d
      LEFT JOIN conteo c ON c.dow = d.dow
      ORDER BY d.ord;`,
      [fechaInicioDate, fechaFinDate]
    );

    return response;
  } catch (error) {
    console.error("Error fetching eventos por día de la semana:", error);
    throw error;
  }
}

/**
 * Obtiene la cantidad de eventos por mes
 */
export async function getcantidadDeEventosMeses(añoDesde, añoHasta) {
  try {
    const response = await AppDataSource.query(
      `WITH meses AS (
        SELECT 1 AS m,  'enero'::text      AS mes, 1 AS ord UNION ALL
        SELECT 2,       'febrero',                 2 UNION ALL
        SELECT 3,       'marzo',                   3 UNION ALL
        SELECT 4,       'abril',                   4 UNION ALL
        SELECT 5,       'mayo',                    5 UNION ALL
        SELECT 6,       'junio',                   6 UNION ALL
        SELECT 7,       'julio',                   7 UNION ALL
        SELECT 8,       'agosto',                  8 UNION ALL
        SELECT 9,       'septiembre',              9 UNION ALL
        SELECT 10,      'octubre',                10 UNION ALL
        SELECT 11,      'noviembre',              11 UNION ALL
        SELECT 12,      'diciembre',              12
      ),
      eventos_años AS (
        SELECT EXTRACT(YEAR FROM e."fechaHoraInicio")::int  AS año,
               EXTRACT(MONTH FROM e."fechaHoraInicio")::int AS mes,
               COUNT(*) AS cantidad
        FROM "evento" e
        WHERE EXTRACT(YEAR FROM e."fechaHoraInicio") >= $1::int
          AND EXTRACT(YEAR FROM e."fechaHoraInicio") <= $2::int
        GROUP BY año, mes
      ),
      años AS (
        SELECT generate_series($1::int, $2::int) AS año
      )
      SELECT a.año, m.mes, COALESCE(ev.cantidad, 0)::int AS cantidad
      FROM años a
      CROSS JOIN meses m
      LEFT JOIN eventos_años ev ON ev.año = a.año AND ev.mes = m.m
      ORDER BY a.año, m.ord;`,
      [añoDesde, añoHasta]
    );

    return response;
  } catch (error) {
    console.error("Error fetching eventos por meses:", error);
    throw error;
  }
}

/**
 * Obtiene la cantidad de eventos por granularidad (semana, mes, año)
 */
export async function getcantidadDeEventosPorGranularidad(fechaInicio, fechaFin, granularidad) {
  try {
    const fechaInicioDate = typeof fechaInicio === 'number' 
      ? new Date(fechaInicio).toISOString().split('T')[0]
      : fechaInicio;
    const fechaFinDate = typeof fechaFin === 'number' 
      ? new Date(fechaFin).toISOString().split('T')[0]
      : fechaFin;

    let query = '';

    if (granularidad === 'semana') {
      query = `
        SELECT 
          EXTRACT(YEAR FROM e."fechaHoraInicio")::int AS año,
          EXTRACT(WEEK FROM e."fechaHoraInicio")::int AS semana,
          COUNT(*) AS cantidad
        FROM "evento" e
        WHERE e."fechaHoraInicio" >= $1::date
          AND e."fechaHoraInicio" < $2::date
        GROUP BY año, semana
        ORDER BY año, semana;
      `;
    } else if (granularidad === 'mes') {
      query = `
        SELECT 
          EXTRACT(YEAR FROM e."fechaHoraInicio")::int AS año,
          EXTRACT(MONTH FROM e."fechaHoraInicio")::int AS mes,
          COUNT(*) AS cantidad
        FROM "evento" e
        WHERE e."fechaHoraInicio" >= $1::date
          AND e."fechaHoraInicio" < $2::date
        GROUP BY año, mes
        ORDER BY año, mes;
      `;
    } else if (granularidad === 'año') {
      query = `
        SELECT 
          EXTRACT(YEAR FROM e."fechaHoraInicio")::int AS año,
          COUNT(*) AS cantidad
        FROM "evento" e
        WHERE e."fechaHoraInicio" >= $1::date
          AND e."fechaHoraInicio" < $2::date
        GROUP BY año
        ORDER BY año;
      `;
    } else {
      throw new Error('Granularidad no válida. Use: semana, mes o año');
    }

    const response = await AppDataSource.query(query, [fechaInicioDate, fechaFinDate]);
    return response;
  } catch (error) {
    console.error("Error fetching eventos por granularidad:", error);
    throw error;
  }
}

/**
 * Obtiene la cantidad de eventos por tipo dentro de un rango de fechas.
 * Supuestos de esquema (validar en BD):
 *  - Tabla "evento" tiene columna "idTipoEvento" que referencia a "tipoEvento"."id"
 *  - Tabla "tipoEvento" posee columna "nombre" (o "descripcion") para etiqueta.
 * Si no existe la tabla o columnas exactas, ajustar nombres según esquema real.
 * @param {string|number} fechaInicio - fecha (YYYY-MM-DD) o timestamp
 * @param {string|number} fechaFin - fecha (YYYY-MM-DD) o timestamp (exclusiva)
 * @returns {Array<{tipo:string,cantidad:number}>}
 */
export async function getcantidadDeEventosPorTipo(fechaInicio, fechaFin) {
  try {
    const fechaInicioDate = typeof fechaInicio === 'number'
      ? new Date(fechaInicio).toISOString().split('T')[0]
      : fechaInicio;
    const fechaFinDate = typeof fechaFin === 'number'
      ? new Date(fechaFin).toISOString().split('T')[0]
      : fechaFin;

    // Usamos nombre si existe, si no intentamos con descripcion.
    const query = `
      WITH base AS (
        SELECT e."id", e."idTipoEvento", e."fechaHoraInicio"
        FROM "evento" e
        WHERE e."fechaHoraInicio" >= $1::date
          AND e."fechaHoraInicio" <  $2::date
      )
      SELECT 
        COALESCE(te."nombre", te."descripcion", 'Sin tipo') AS tipo,
        COUNT(b."id")::int AS cantidad
      FROM base b
      LEFT JOIN "tipoEvento" te ON te."id" = b."idTipoEvento"
      GROUP BY tipo
      ORDER BY cantidad DESC, tipo ASC;
    `;

    const response = await AppDataSource.query(query, [fechaInicioDate, fechaFinDate]);
    return response;
  } catch (error) {
    console.error('Error fetching eventos por tipo:', error);
    throw error;
  }
}

/**
 * Obtiene el promedio de asistencia de bomberos por tipo de evento.
 * Calcula cuántos bomberos asisten en promedio a cada tipo de evento.
 * @param {string|number} fechaInicio - fecha (YYYY-MM-DD) o timestamp
 * @param {string|number} fechaFin - fecha (YYYY-MM-DD) o timestamp (exclusiva)
 * @returns {Array<{tipo:string, promedio_asistencia:number, total_eventos:number, total_asistencias:number}>}
 */
export async function getPromedioAsistenciaPorTipoEvento(fechaInicio, fechaFin) {
  try {
    const fechaInicioDate = typeof fechaInicio === 'number'
      ? new Date(fechaInicio).toISOString().split('T')[0]
      : fechaInicio;
    const fechaFinDate = typeof fechaFin === 'number'
      ? new Date(fechaFin).toISOString().split('T')[0]
      : fechaFin;

    const query = `
      WITH eventos_periodo AS (
        SELECT 
          e."id" AS id_evento,
          e."idTipoEvento",
          COALESCE(te."nombre", 'Sin tipo') AS tipo
        FROM "evento" e
        LEFT JOIN "tipoEvento" te ON te."id" = e."idTipoEvento"
        WHERE e."fechaHoraInicio" >= $1::date
          AND e."fechaHoraInicio" < $2::date
      ),
      asistencias_por_evento AS (
        SELECT 
          ep.id_evento,
          ep.tipo,
          ep."idTipoEvento",
          COUNT(DISTINCT ae."idBombero")::int AS num_asistentes
        FROM eventos_periodo ep
        LEFT JOIN "asistenciaEvento" ae ON ae."idEvento" = ep.id_evento
        GROUP BY ep.id_evento, ep.tipo, ep."idTipoEvento"
      ),
      promedios AS (
        SELECT 
          ape.tipo,
          AVG(ape.num_asistentes)::numeric(10,2) AS promedio_asistencia,
          COUNT(ape.id_evento)::int AS total_eventos,
          SUM(ape.num_asistentes)::int AS total_asistencias
        FROM asistencias_por_evento ape
        GROUP BY ape.tipo
      )
      SELECT 
        tipo,
        COALESCE(promedio_asistencia, 0)::numeric(10,2) AS promedio_asistencia,
        total_eventos,
        COALESCE(total_asistencias, 0)::int AS total_asistencias
      FROM promedios
      WHERE total_eventos > 0
      ORDER BY promedio_asistencia DESC, tipo ASC;
    `;

    const response = await AppDataSource.query(query, [fechaInicioDate, fechaFinDate]);
    return response;
  } catch (error) {
    console.error('Error fetching promedio asistencia por tipo evento:', error);
    throw error;
  }
}

/**
 * Obtiene la tendencia mensual de asistencia a eventos (suma de asistentes por mes).
 * Permite identificar estacionalidad y evolución de la participación.
 * @param {string|number} fechaInicio - fecha (YYYY-MM-DD) o timestamp
 * @param {string|number} fechaFin - fecha (YYYY-MM-DD) o timestamp (exclusiva)
 * @returns {Array<{año:number, mes:number, mes_nombre:string, total_asistentes:number, total_eventos:number}>}
 */
export async function getTendenciaMensualAsistencia(fechaInicio, fechaFin) {
  try {
    const fechaInicioDate = typeof fechaInicio === 'number'
      ? new Date(fechaInicio).toISOString().split('T')[0]
      : fechaInicio;
    const fechaFinDate = typeof fechaFin === 'number'
      ? new Date(fechaFin).toISOString().split('T')[0]
      : fechaFin;

    const query = `
      WITH meses_nombres AS (
        SELECT 1 AS m, 'Enero' AS nombre UNION ALL
        SELECT 2, 'Febrero' UNION ALL
        SELECT 3, 'Marzo' UNION ALL
        SELECT 4, 'Abril' UNION ALL
        SELECT 5, 'Mayo' UNION ALL
        SELECT 6, 'Junio' UNION ALL
        SELECT 7, 'Julio' UNION ALL
        SELECT 8, 'Agosto' UNION ALL
        SELECT 9, 'Septiembre' UNION ALL
        SELECT 10, 'Octubre' UNION ALL
        SELECT 11, 'Noviembre' UNION ALL
        SELECT 12, 'Diciembre'
      ),
      eventos_periodo AS (
        SELECT 
          e."id" AS id_evento,
          e."fechaHoraInicio",
          EXTRACT(YEAR FROM e."fechaHoraInicio")::int AS año,
          EXTRACT(MONTH FROM e."fechaHoraInicio")::int AS mes
        FROM "evento" e
        WHERE e."fechaHoraInicio" >= $1::date
          AND e."fechaHoraInicio" < $2::date
      ),
      asistencias_por_mes AS (
        SELECT 
          ep.año,
          ep.mes,
          COUNT(DISTINCT ep.id_evento)::int AS total_eventos,
          COUNT(ae."idBombero")::int AS total_asistentes
        FROM eventos_periodo ep
        LEFT JOIN "asistenciaEvento" ae ON ae."idEvento" = ep.id_evento
        GROUP BY ep.año, ep.mes
      )
      SELECT 
        apm.año,
        apm.mes,
        mn.nombre AS mes_nombre,
        COALESCE(apm.total_asistentes, 0)::int AS total_asistentes,
        COALESCE(apm.total_eventos, 0)::int AS total_eventos
      FROM asistencias_por_mes apm
      LEFT JOIN meses_nombres mn ON mn.m = apm.mes
      ORDER BY apm.año ASC, apm.mes ASC;
    `;

    const response = await AppDataSource.query(query, [fechaInicioDate, fechaFinDate]);
    return response;
  } catch (error) {
    console.error('Error fetching tendencia mensual asistencia:', error);
    throw error;
  }
}

/**
 * Obtiene la evolución diaria de eventos y asistentes
 * Permite filtrar opcionalmente por tipo de evento
 * @param {number|string} fechaInicio - Timestamp o fecha de inicio
 * @param {number|string} fechaFin - Timestamp o fecha de fin
 * @param {number|null} idTipoEvento - ID del tipo de evento (opcional)
 * @returns {Promise<Array>} Array con fecha, cantidad de eventos y total de asistentes
 */
export async function getEvolucionEventosYAsistentes(fechaInicio, fechaFin, idTipoEvento = null) {
  try {
    const fechaInicioDate = typeof fechaInicio === 'number'
      ? new Date(fechaInicio).toISOString().split('T')[0]
      : fechaInicio;
    const fechaFinDate = typeof fechaFin === 'number'
      ? new Date(fechaFin).toISOString().split('T')[0]
      : fechaFin;

    const query = `
      WITH eventos_periodo AS (
        SELECT 
          e."id" AS id_evento,
          e."fechaHoraInicio"::date AS fecha,
          e."idTipoEvento"
        FROM "evento" e
        WHERE e."fechaHoraInicio" >= $1::date
          AND e."fechaHoraInicio" < $2::date
          AND ($3::int IS NULL OR e."idTipoEvento" = $3::int)
      ),
      datos_diarios AS (
        SELECT 
          ep.fecha,
          COUNT(DISTINCT ep.id_evento)::int AS cantidad_eventos,
          COUNT(ae."idBombero")::int AS total_asistentes
        FROM eventos_periodo ep
        LEFT JOIN "asistenciaEvento" ae ON ae."idEvento" = ep.id_evento
        GROUP BY ep.fecha
      )
      SELECT 
        fecha,
        cantidad_eventos,
        total_asistentes
      FROM datos_diarios
      ORDER BY fecha ASC;
    `;

    const params = [
      fechaInicioDate, 
      fechaFinDate,
      idTipoEvento
    ];

    const response = await AppDataSource.query(query, params);
    return response;
  } catch (error) {
    console.error('Error fetching evolución eventos y asistentes:', error);
    throw error;
  }
}

/**
 * Obtiene el porcentaje de participación de voluntarios en eventos
 * @param {number} fechaInicio - Timestamp de inicio
 * @param {number} fechaFin - Timestamp de fin
 * @param {Array<number>|null} idsEventos - Array de IDs de tipos de evento, o null para todos
 * @returns {Promise<Object>} Objeto con porcentaje y datos de participación
 */
export async function getPorcentajeParticipacion(fechaInicio, fechaFin, idsEventos = null) {
  try {
    const fechaInicioDate = typeof fechaInicio === 'number' 
      ? new Date(fechaInicio).toISOString().split('T')[0]
      : fechaInicio;
    const fechaFinDate = typeof fechaFin === 'number' 
      ? new Date(fechaFin).toISOString().split('T')[0]
      : fechaFin;

    // Construir condición de filtro de tipos de evento
    // Solo aplicar filtro si hay IDs y el array no está vacío
    const aplicarFiltro = idsEventos && Array.isArray(idsEventos) && idsEventos.length > 0;
    const filtroTipos = aplicarFiltro ? `AND e."idTipoEvento" = ANY($3::int[])` : '';

    const query = `
      WITH eventos_periodo AS (
        SELECT DISTINCT e."id"
        FROM "evento" e
        WHERE e."fechaHoraInicio" >= $1::date
          AND e."fechaHoraInicio" < $2::date
          ${filtroTipos}
      ),
      voluntarios_participantes AS (
        SELECT DISTINCT ae."idBombero"
        FROM "asistenciaEvento" ae
        JOIN eventos_periodo ep ON ep."id" = ae."idEvento"
      ),
      total_voluntarios AS (
        SELECT COUNT(DISTINCT b."id")::int AS total
        FROM "bomberos" b
        WHERE b."activo" = true
      )
      SELECT 
        (SELECT COUNT(*)::int FROM voluntarios_participantes) AS voluntarios_participantes,
        tv.total AS total_voluntarios,
        CASE 
          WHEN tv.total > 0 THEN 
            ROUND((SELECT COUNT(*)::numeric FROM voluntarios_participantes) * 100.0 / tv.total, 2)
          ELSE 0 
        END AS porcentaje
      FROM total_voluntarios tv;
    `;

    const params = aplicarFiltro
      ? [fechaInicioDate, fechaFinDate, idsEventos]
      : [fechaInicioDate, fechaFinDate];

    const response = await AppDataSource.query(query, params);
    return response[0] || { voluntarios_participantes: 0, total_voluntarios: 0, porcentaje: 0 };
  } catch (error) {
    console.error('Error fetching porcentaje participación:', error);
    throw error;
  }
}
