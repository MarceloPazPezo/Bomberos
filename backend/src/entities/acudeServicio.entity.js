"use strict";
import { EntitySchema } from "typeorm";

const AcudeServicioSchema = new EntitySchema({
    name: "AcudeServicio",
    tableName: "acudeServicio",
    columns: {
        idServicio: {
            type: "int",
            primary: true,
        },
        idIncidente: {
            type: "int",
            primary: true,
        },
        unidad: {
            type: "varchar",
            length: 50,
        },
        observaciones: {
            type: "text",
            nullable: true,
        },
        nPersonal: {
            type: "int",
            nullable: true,
        },
        nombrePersonalACargo: {
            type: "varchar",
            length: 100,
            nullable: true,
        },
    },
    relations: {
        servicio: {
            target: "Servicio",
            type: "many-to-one",
            joinColumn: { name: "idServicio", referencedColumnName: "id" },
            eager: true,
            onDelete: "RESTRICT",
        },
        incidente: {
            target: "Incidente",
            type: "many-to-one",
            joinColumn: { name: "idIncidente", referencedColumnName: "id" },
            eager: true,
            onDelete: "CASCADE",
        }
    },
});
export default AcudeServicioSchema;
    
        