"use strict";
import { EntitySchema } from "typeorm";

const JurisdiccionSchema = new EntitySchema({
    name: "Jurisdiccion",
    tableName: "jurisdicciones",
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
            comment: "Nombre de la jurisdicción o zona de cobertura",
        },
        area: {
            type: "geometry",
            spatialFeatureType: "Polygon",
            srid: 4326,
            nullable: false,
            comment: "Área geográfica de la jurisdicción (SRID 4326 - WGS 84)",
        },
        color: {
            type: "varchar",
            length: 7,
            nullable: true,
            default: "#FF0000",
            comment: "Color hexadecimal para visualización en el mapa",
        },
        descripcion: {
            type: "text",
            nullable: true,
            comment: "Descripción de la jurisdicción",
        },
        activo: {
            type: "boolean",
            default: true,
            comment: "Indica si la jurisdicción está activa",
        },
        idCompania: {
            type: "int",
            nullable: false,
            comment: "Compañía responsable de esta jurisdicción",
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
            name: "IDX_JURISDICCION_AREA",
            columns: ["area"],
            spatial: true,
        },
        {
            name: "IDX_JURISDICCION_COMPANIA",
            columns: ["idCompania"],
        },
        {
            name: "IDX_JURISDICCION_ACTIVO",
            columns: ["activo"],
        },
    ],
    relations: {
        compania: {
            type: "many-to-one",
            target: "Compania",
            joinColumn: {
                name: "idCompania",
                referencedColumnName: "id",
                onDelete: "RESTRICT",
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

export default JurisdiccionSchema;




