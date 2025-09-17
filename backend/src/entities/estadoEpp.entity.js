"use strict";
import { EntitySchema } from "typeorm";

const EstadoEppSchema = new EntitySchema({
    name: "EstadoEpp",
    tableName: "estadoEpp",
    columns: {
        id: { type: "int", primary: true, generated: "increment" },
        nombre: { type: "varchar", length: 50, nullable: false, unique: true },
    },
    relations: {
        epps: {
            type: "one-to-many",
            target: "Epp",
            inverseSide: "estadosEpp",
        },
    },
});
export default EstadoEppSchema;