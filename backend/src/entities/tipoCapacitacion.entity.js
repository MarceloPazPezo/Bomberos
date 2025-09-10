"use strict";
import { EntitySchema } from "typeorm";

const TipoCapacitacionSchema = new EntitySchema({
    name: "TipoCapacitacion",
    tableName: "tipoCapacitacion",
    columns: {
        id: { type: "int", primary: true, generated: "increment" },
        nombre: { type: "varchar", length: 100, nullable: false },
        descripcion: { type: "text", nullable: true },
    },
    relations: {
        capacitaciones: {
            type: "one-to-many",
            target: "Capacitacion",
            inverseSide: "tipoCapacitacion",
        },
    }
});

export default TipoCapacitacionSchema;
    