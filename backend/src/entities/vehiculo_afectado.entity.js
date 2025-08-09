"use strict";
import { EntitySchema } from "typeorm";

const VehiculoAfectadoSchema = new EntitySchema({
    name: "VehiculoAfectado",
    tableName: "vehiculo_afectado",
    columns: {
        id: {
            type: "int",
            primary: true,
            generated: "increment",
        },

        // FK al Parte de Emergencia
        parte_id: {
            type: "int",
            nullable: false,
        },

        // FK al Afectado
        afectado_id: {
            type: "int",
            nullable: false,
        },

        tipo_vehiculo: {
            type: "varchar",
            length: 100,
            nullable: true,
        },
        marca: {
            type: "varchar",
            length: 100,
            nullable: true,
        },
        modelo: {
            type: "varchar",
            length: 100,
            nullable: true,
        },
        color: {
            type: "varchar",
            length: 60,
            nullable: true,
        },
        patente: {
            type: "varchar",
            length: 15,
            nullable: true,
        },
        conductor_nombres: {
            type: "varchar",
            length: 255,
            nullable: true,
        },
        conductor_apellidos: {
            type: "varchar",
            length: 255,
            nullable: true,
        },
        conductor_run: {
            type: "varchar",
            length: 12, // 10 si usas formato sin puntos (ej: 12345678-9)
            nullable: true,
        },
    },

    indices: [
        { name: "IDX_VEH_AFECTADO_PARTE_ID", columns: ["parte_id"] },
        { name: "IDX_VEH_AFECTADO_AFECTADO_ID", columns: ["afectado_id"] },
        { name: "IDX_VEH_AFECTADO_PATENTE", columns: ["patente"] },
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
            eager: true, // si quieres cargar siempre el Parte
        },
        afectado: {
            type: "many-to-one",
            target: "Afectado",
            joinColumn: {
                name: "afectado_id",
                referencedColumnName: "id",
                onDelete: "CASCADE",
            },
            eager: true, // si quieres cargar siempre el Afectado
        },
        ocupantes: {
            type: "one-to-many",
            target: "OcupantesVehiculo",
            inverseSide: "vehiculo",
        },

    },
});

export default VehiculoAfectadoSchema;
