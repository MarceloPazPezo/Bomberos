"use strict";
import { EntitySchema } from "typeorm";

const TipoDanoSchema = new EntitySchema({
    name: "TipoDano",
    tableName: "tipoDano",
    columns: {
        id: { type: "int", primary: true, generated: "increment" },
        nombre: { type: "varchar", length: 100, nullable: false },
    },
    relations: {
        faseydano: {
            type: "one-to-many",
            target: "FaseYDano",
            inverseSide: "tipoDano",
            cascade: true,
        },
    }
});
export default TipoDanoSchema;