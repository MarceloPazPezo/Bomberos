"use strict";
import { EntitySchema } from "typeorm";

const TipoEventoSchema = new EntitySchema({
    name: "TipoEvento",
    tableName: "tipoEvento",
    columns: {
        id: { type: "int", primary: true, generated: "increment" },
        nombre: { type: "varchar", length: 100, nullable: false },
        descripcion: { type: "text", nullable: true },
    },
    indices: [{ name: "IDX_TIPO_EVENTO_ID", columns: ["id"] }],
    relations: {
        eventos: {
            type: "one-to-many",
            target: "Evento",
            inverseSide: "tipoEvento",
            cascade: true,
        },
    },
});

export default TipoEventoSchema;
