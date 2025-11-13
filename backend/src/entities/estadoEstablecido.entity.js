"use strict";
import { EntitySchema } from "typeorm";

const EstadoEstablecidoSchema = new EntitySchema({
    name: "EstadoEstablecido",
    tableName: "estadoEstablecido",
    columns: {
        idBombero: { type: "int", primary: true },
        idEstado: { type: "int", primary: true },
        idIncidente: { type: "int", primary: true },
        fechaHora: { type: "timestamp", primary: true },
    },
    relations: {
        bombero: {
            type: "many-to-one",
            target: "Bombero",
            joinColumn: { name: "idBombero", referencedColumnName: "id" },
            // eager: true, // ⚠️ DESHABILITADO: Puede causar loops con Bombero.bomberoActualizaestadoIncidente
            onDelete: "RESTRICT",

        },
        estado: {
            type: "many-to-one",
            target: "EstadoReporte",
            joinColumn: { name: "idEstado", referencedColumnName: "id" },
            eager: true, // ✅ OK: EstadoReporte no tiene relaciones inversas problemáticas
            onDelete: "RESTRICT",
            
        },
        incidente: {
            type: "many-to-one",
            target: "Incidente",
            joinColumn: { name: "idIncidente", referencedColumnName: "id" },
            // eager: true, // ⚠️ DESHABILITADO: CAUSA LOOP INFINITO con Incidente.EstadoEstablecido
            onDelete: "CASCADE",
        },
    }
});

export default EstadoEstablecidoSchema;