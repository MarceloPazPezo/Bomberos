"use strict";
import { EntitySchema } from "typeorm";

const FaseYDanoSchema = new EntitySchema({
    name: "FaseYDano",
    tableName: "faseYDano",
    columns: {
        idTipoDano: { type: "int", primary: true },
        idFase: { type: "int", primary: true },
        idIncidente: { type: "int", primary: true },
    },
    relations: {
        tipoDano: {
            type: "many-to-one",
            target: "TipoDano",
            joinColumn: { name: "idTipoDano", referencedColumnName: "id" },
            eager: true,
            onDelete: "RESTRICT",
        },
        faseIncidente: {
            type: "many-to-one",
            target: "FaseIncidente",
            joinColumn: { name: "idFase", referencedColumnName: "id" },
            eager: true,
            onDelete: "RESTRICT",
        },
        incidente: {
            type: "many-to-one",
            target: "Incidente",
            joinColumn: { name: "idIncidente", referencedColumnName: "id" },
            eager: true,
            onDelete: "CASCADE",
        },
    }
});

export default FaseYDanoSchema;