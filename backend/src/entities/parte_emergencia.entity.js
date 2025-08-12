"use strict";
import { EntitySchema } from "typeorm";

const ParteEmergenciaSchema = new EntitySchema({
    name: "ParteEmergencia",
    tableName: "parte_emergencia",
    columns: {
        id: {
            type: "int",
            primary: true,
            generated: "increment",
        },
        redactor_id: {
            type: "int",
            nullable: false,
        },
        fecha: {
            type: "date",
            nullable: false,
        },
        compañia: {
            type: "varchar",
            length: 255,
            nullable: true,
        },
        tipo_servicio: {
            type: "varchar",
            length: 255,
            nullable: true,
        },
        hora_despacho: {
            type: "time",
            nullable: true,
        },
        hora_6_0: {
            type: "time",
            nullable: true,
        },
        hora_6_3: {
            type: "time",
            nullable: true,
        },
        hora_6_9: {
            type: "time",
            nullable: true,
        },
        hora_6_10: {
            type: "time",
            nullable: true,
        },
        comuna: {
            type: "varchar",
            length: 255,
            nullable: true,
        },
        direccion: {
            type: "varchar",
            length: 255,
            nullable: true,
        },
        villa_poblacion: {
            type: "varchar",
            length: 255,
            nullable: true,
        },
        tipo_incendio: {
            type: "enum",
            enum: ["COMPARTIMENTAL", "MULTICOMPARTIMENTAL", "ESTRUCTURAL", "OTRO"], // ajusta según catálogo real
            nullable: true,
        },
        fase_alcanzada: {
            type: "enum",
            enum: ["IGNICION", "INCREMENTO", "LATENTE", "LIBRE COMBUSTIÓN", "DECAIMIENTO"], // ajusta según catálogo real
            nullable: true,
        },
        descripcion_preliminar: {
            type: "text",
            nullable: true,
        },
        estado: {
            type: "varchar",
            length: 50,
            nullable: true,
        },
        fechaCreacion: {
            type: "timestamp with time zone",
            createDate: true,
        },
        actualizadoPor: {
            type: "int",
            nullable: true,
        },
        fechaActualizacion: {
            type: "timestamp with time zone",
            updateDate: true,
        },
    },
    relations: {
        redactor: {
            type: "many-to-one",
            target: "Usuario",
            joinColumn: {
                name: "redactor_id",
                referencedColumnName: "id",
                onDelete: "SET NULL",
            },
        },
        bomberosAccidentados: {
            type: "one-to-many",
            target: "BomberoAccidentado",
            inverseSide: "parte",
        },
        otrosServicios: {
            type: "one-to-many",
            target: "OtroServicio",
            inverseSide: "parte",
        },
        afectados: {
            type: "one-to-many",
            target: "Afectado",
            inverseSide: "parte",
        },
        inmueblesAfectados: {
            type: "one-to-many",
            target: "InmuebleAfectado",
            inverseSide: "parte",
        },
        vehiculosAfectados: {
            type: "one-to-many",
            target: "VehiculoAfectado",
            inverseSide: "parte", // ← coincide con la propiedad many-to-one en vehiculo_afectado.js
        },


        updatedByUser: {
            type: "many-to-one",
            target: "Usuario",
            joinColumn: {
                name: "actualizadoPor",
                referencedColumnName: "id",
                onDelete: "SET NULL",
            },
        },
    },
});

export default ParteEmergenciaSchema;
