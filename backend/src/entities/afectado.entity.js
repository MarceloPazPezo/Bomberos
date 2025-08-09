"use strict";
import { EntitySchema } from "typeorm";

const AfectadoSchema = new EntitySchema({
    name: "Afectado",
    tableName: "afectado",
    columns: {
        id: {
            type: "int",
            primary: true,
            generated: "increment",
        },
        parte_id: {
            type: "int",
            nullable: false,
        },
        nombres: {
            type: "varchar",
            length: 255,
            nullable: false,
        },
        apellidos: {
            type: "varchar",
            length: 255,
            nullable: false,
        },
        run: {
            type: "varchar",
            length: 12, // 10 si usas formato sin puntos (ej: 12345678-9)
            nullable: true,
        },
        telefono: {
            type: "varchar",
            length: 20,
            nullable: true,
        },
        direccion: {
            type: "varchar",
            length: 255,
            nullable: true,
        },
        edad: {
            type: "int",
            nullable: true,
        },
        estado_civil: {
            type: "varchar",
            length: 50,
            nullable: true,
        },
    },
    indices: [
        {
            name: "IDX_AFECTADO_PARTE_ID",
            columns: ["parte_id"],
        },
    ],
    relations: {
        parte: {
            type: "many-to-one",
            target: "ParteEmergencia",
            joinColumn: {
                name: "parte_id",
                referencedColumnName: "id",
                onDelete: "CASCADE",
            },
            eager: true, // <- si quieres que siempre cargue el Parte junto
        },
        inmuebles: {
            type: "one-to-many",
            target: "InmuebleAfectado",
            inverseSide: "afectado",
        },
        vehiculosAfectados: {
            type: "one-to-many",
            target: "VehiculoAfectado",
            inverseSide: "afectado", // ← coincide con la propiedad many-to-one en vehiculo_afectado.js
        },


    },
});

export default AfectadoSchema;
