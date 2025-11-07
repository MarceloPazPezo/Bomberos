"use strict";
import { AppDataSource } from "../config/configDb.js";

export async function obtenerHistorialCompania(historialData) {
    try {
        /*  ejecutaremos una consulta sql  */
        const query = `
            -- $1 => ID de la compañía

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
        const result = await AppDataSource.query(query, [historialData.compania]);
        return result;


    } catch (error) {
        console.error("Error al obtener el historial de la compañía:", error);
        throw error;
    }




}