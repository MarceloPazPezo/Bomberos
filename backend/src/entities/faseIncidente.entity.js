"use strict";
import { EntitySchema } from "typeorm";

const FaseIncidenteSchema = new EntitySchema({
    name: "FaseIncidente",
    tableName: "faseIncidente",
    columns: {
        id: { type: "int", primary: true, generated: "increment" },
        nombre: { type: "varchar", length: 100, nullable: false },
    },
    relations: {
        faseIncidenteYDanos: {
            type: "one-to-many",
            target: "FaseYDano",
            inverseSide: "faseIncidente",
            cascade: true,
        }
    }
});
export default FaseIncidenteSchema;
