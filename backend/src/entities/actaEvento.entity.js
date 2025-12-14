"use strict";
import { EntitySchema } from "typeorm";

const ActaEventoSchema = new EntitySchema({
    name: "ActaEvento",
    tableName: "actaEvento",
    columns: {
        idEvento: { type: "int", primary: true },
        descripcionActa: { type: "text", nullable: true },
        temas: { type: "json", nullable: true },
        creadoEl: { type: "timestamp", createDate: true, nullable: false },
        actualizadoEl: { type: "timestamp", updateDate: true, nullable: false },
    },
    indices: [
        { name: "IDX_ACTA_EVENTO_IDEVENTO", columns: ["idEvento"] },
    ],
    relations: {
        evento: {
            target: "Evento",
            type: "one-to-one",
            joinColumn: { name: "idEvento", referencedColumnName: "id" },
            onDelete: "CASCADE",
        },
    },
});

export default ActaEventoSchema;
