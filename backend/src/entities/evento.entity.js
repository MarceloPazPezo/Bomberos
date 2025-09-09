"use strict";
import { EntitySchema } from "typeorm";

const EventoSchema = new EntitySchema({
    name: "Evento",
    tableName: "evento",
    columns: {
        id: { type: "int", primary: true, generated: "increment" },
        nombre: { type: "varchar", length: 255, nullable: false },
        descripcion: { type: "text", nullable: true },
        fecha: { type: "date", nullable: false },
        hora: { type: "time", nullable: false },
        idDireccion: { type: "int", nullable: true },
        idTipoEvento: { type: "int", nullable: false },
        creadoPor: { type: "int", nullable: true },
        creadoEl: { type: "timestamp", createDate: true, nullable: false },
        actualizadoPor: { type: "int", nullable: true },
        actualizadoEl: { type: "timestamp", updateDate: true, nullable: false },
    },
    indices: [
        { name: "IDX_EVENTO_ID", columns: ["id"] },
        { name: "IDX_EVENTO_ID_TIPO_EVENTO", columns: ["idTipoEvento"] },
        { name: "IDX_EVENTO_ID_DIRECCION", columns: ["idDireccion"] },
    ],
    relations: {
        tipoEvento: {
            type: "many-to-one",
            target: "TipoEvento",
            joinColumn: { name: "idTipoEvento", referencedColumnName: "id", onDelete: "RESTRICT" },
        },
        direccion: {
            type: "many-to-one",
            target: "Direccion",
            joinColumn: { name: "idDireccion", referencedColumnName: "id", onDelete: "SET NULL" },
        },
        creadoPor: {
            type: "many-to-one",
            target: "Bombero",
            joinColumn: { name: "creadoPor", referencedColumnName: "id", onDelete: "SET NULL" },
        },
        actualizadoPor: {
            type: "many-to-one",
            target: "Bombero",
            joinColumn: { name: "actualizadoPor", referencedColumnName: "id", onDelete: "SET NULL" },
        },
        asistenciasEvento: {
            type: "one-to-many",
            target: "AsistenciaEvento",
            inverseSide: "evento",
            cascade: true,
        },
    },
});

export default EventoSchema;
