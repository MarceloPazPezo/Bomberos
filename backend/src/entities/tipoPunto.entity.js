"use strict";
import { EntitySchema } from "typeorm";

const TipoPuntoSchema = new EntitySchema({
    name: "TipoPunto",
    tableName: "tipos_punto",
    columns: {
        id: {
            type: "int",
            primary: true,
            generated: "increment",
        },
        nombre: {
            type: "varchar",
            length: 100,
            nullable: false,
            unique: true,
            comment: "Nombre del tipo de punto (ej: Cuartel, Hospital, Hidrante)",
        },
        icono: {
            type: "varchar",
            length: 50,
            nullable: true,
            comment: "Nombre del icono para visualización en el mapa",
        },
        color: {
            type: "varchar",
            length: 7,
            nullable: true,
            default: "#FF0000",
            comment: "Color hexadecimal para el marcador en el mapa",
        },
        descripcion: {
            type: "text",
            nullable: true,
            comment: "Descripción del tipo de punto",
        },
        activo: {
            type: "boolean",
            default: true,
            nullable: false,
            comment: "Indica si el tipo de punto está activo",
        },
        creadoEl: {
            type: "timestamp",
            createDate: true,
            nullable: false,
        },
        actualizadoEl: {
            type: "timestamp",
            updateDate: true,
            nullable: false,
        },
    },
    indices: [
        {
            name: "IDX_TIPO_PUNTO_NOMBRE",
            columns: ["nombre"],
        },
        {
            name: "IDX_TIPO_PUNTO_ACTIVO",
            columns: ["activo"],
        },
    ],
    relations: {
        puntosGeograficos: {
            type: "one-to-many",
            target: "PuntoGeografico",
            inverseSide: "tipoPunto",
            cascade: true,
        },
    },
});

export default TipoPuntoSchema;

