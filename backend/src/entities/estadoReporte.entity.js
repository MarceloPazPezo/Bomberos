"use strict";
import { EntitySchema } from "typeorm";

const estadoReporteSchema = new EntitySchema({
    name: "EstadoReporte",
    tableName: "estadoReporte",
    columns: {
        id: { type: "int", primary: true, generated: "increment" },
        nombre: { type: "varchar", length: 100, nullable: false },
        color: { type: "varchar", length: 7, nullable: true }, 
    },

    relations: {
    reportes: {
            type: "one-to-many",
            target: "EstadoEstablecido",
            inverseSide: "estado",
            cascade: true,
        },
    }
});
export default estadoReporteSchema;