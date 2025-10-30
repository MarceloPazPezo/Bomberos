"use strict";
import { EntitySchema } from "typeorm";

const PuntoGeograficoSchema = new EntitySchema({
    name: "PuntoGeografico",
    tableName: "puntos_geograficos",
    columns: {
        id: {
            type: "int",
            primary: true,
            generated: "increment",
        },
        nombre: {
            type: "varchar",
            length: 255,
            nullable: false,
            comment: "Nombre del punto de interés",
        },
        punto: {
            type: "geometry",
            spatialFeatureType: "Point",
            srid: 4326,
            nullable: false,
            comment: "Ubicación geográfica del punto (SRID 4326 - WGS 84)",
        },
        descripcion: {
            type: "text",
            nullable: true,
            comment: "Descripción adicional del punto",
        },
        estado: {
            type: "enum",
            enum: ["BUENO", "MALO", "REGULAR", "FUERA_DE_SERVICIO"],
            default: "BUENO",
            nullable: false,
            comment: "Estado físico/operativo del punto: BUENO, MALO, REGULAR, FUERA_DE_SERVICIO",
        },
        idTipoPunto: {
            type: "int",
            nullable: false,
            comment: "Tipo de punto (cuartel, hospital, hidrante, etc.)",
        },
        idCompania: {
            type: "int",
            nullable: true,
            comment: "Compañía responsable del punto",
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
        creadoPor: {
            type: "int",
            nullable: true,
        },
        actualizadoPor: {
            type: "int",
            nullable: true,
        },
    },
    indices: [
        {
            name: "IDX_PUNTO_GEOGRAFICO_PUNTO",
            columns: ["punto"],
            spatial: true,
        },
        {
            name: "IDX_PUNTO_GEOGRAFICO_TIPO",
            columns: ["idTipoPunto"],
        },
        {
            name: "IDX_PUNTO_GEOGRAFICO_COMPANIA",
            columns: ["idCompania"],
        },
        {
            name: "IDX_PUNTO_GEOGRAFICO_ESTADO",
            columns: ["estado"],
        },
    ],
    relations: {
        tipoPunto: {
            type: "many-to-one",
            target: "TipoPunto",
            joinColumn: {
                name: "idTipoPunto",
                referencedColumnName: "id",
                onDelete: "RESTRICT",
            },
            eager: true,
        },
        compania: {
            type: "many-to-one",
            target: "Compania",
            joinColumn: {
                name: "idCompania",
                referencedColumnName: "id",
                onDelete: "SET NULL",
            },
            eager: true,
        },
        creadoPor: {
            type: "many-to-one",
            target: "Bombero",
            joinColumn: {
                name: "creadoPor",
                referencedColumnName: "id",
                onDelete: "SET NULL",
            },
        },
        actualizadoPor: {
            type: "many-to-one",
            target: "Bombero",
            joinColumn: {
                name: "actualizadoPor",
                referencedColumnName: "id",
                onDelete: "SET NULL",
            },
        },
    },
});

export default PuntoGeograficoSchema;

