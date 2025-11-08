"use strict";
import { EntitySchema } from "typeorm";

const DireccionSchema = new EntitySchema({
    name: "Direccion",
    tableName: "direcciones",
    columns: {
        id: {
            type: "int",
            primary: true,
            generated: "increment",
        },
        calle: {
            type: "varchar",
            length: 255,
            nullable: false,
        },
        numero: {
            type: "varchar",
            length: 50,
            nullable: false,
        },
        depto: {
            type: "varchar",
            length: 50,
            nullable: true,
        },
        referencia: {
            type: "varchar",
            length: 255,
            nullable: true,
        },
        codigoPostal: {
            type: "varchar",
            length: 20,
            nullable: true,
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
        idComuna: {
            type: "int",
            nullable: false,
        },
        punto: {
            type: "geometry",
            spatialFeatureType: "Point",
            srid: 4326,
            nullable: true,
            comment: "Ubicación geográfica de la dirección (SRID 4326 - WGS 84). Opcional para consultas geoespaciales."
        },
    },
    indices: [
        { name: "IDX_DIRECCION_IDCOMUNA", columns: ["idComuna"] },
        {
            name: "IDX_DIRECCION_PUNTO",
            columns: ["punto"],
            spatial: true,
            comment: "Índice espacial para consultas geoespaciales"
        },
    ],
    relations: {
        comuna: {
            type: "many-to-one",
            target: "Comuna",
            joinColumn: { name: "idComuna", referencedColumnName: "id", onDelete: "RESTRICT" } //uso restrict para evitar borrar comunas con direcciones ya creadas
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
        incidentes: {
            type: "one-to-many",
            target: "Incidente",
            inverseSide: "direccion",
            cascade: true,
        },
        afectados: {
            type: "one-to-many",
            target: "Afectado",
            inverseSide: "direccion",
            cascade: true,
        },
        inmuebles: {
            type: "one-to-many",
            target: "Inmueble",
            inverseSide: "direccion",
            cascade: true,
        },
        eventos: {
            type: "one-to-many",
            target: "Evento",
            inverseSide: "direccion",
            cascade: true,
        },
        companias: {
            type: "one-to-many",
            target: "Compania",
            inverseSide: "direccion",
            cascade: true,
        },
        fichaBombero: {
            type: "one-to-one",
            target: "FichaBombero",
            inverseSide: "direccion",
        },

    },
});

export default DireccionSchema;