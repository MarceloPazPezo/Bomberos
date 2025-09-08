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
    },
    indices: [
        { name: "IDX_DIRECCION_IDCOMUNA", columns: ["idComuna"] },
    ],
    relations: {
        comuna: {
            type: "many-to-one",
            target: "Comuna",
            joinColumn: { name: "idComuna", referencedColumnName: "id", onDelete: "RESTRICT" } //uso restrict para evitar borrar comunas con direcciones ya creadas
        },
    },
});

export default DireccionSchema;