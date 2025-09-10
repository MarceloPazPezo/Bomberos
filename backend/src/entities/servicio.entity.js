"use strict";
import { EntitySchema } from "typeorm";

const ServicioSchema = new EntitySchema({
    name: "Servicio",
    tableName: "servicio",
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
        },
    },
    relations: {
        acude: {
            target: "AcudeServicio",
            type: "one-to-many",
            inverseSide: "servicio",
            cascade: true,
        },
    },
});
export default ServicioSchema;