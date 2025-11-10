"use strict";
import { AppDataSource } from "../config/configDb.js";

export async function obtenerHistorialCompaniaService(idCompania) {
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
        const result = await AppDataSource.query(query, [idCompania]);
        return result;


    } catch (error) {
        console.error("Error al obtener el historial de la compañía:", error);
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