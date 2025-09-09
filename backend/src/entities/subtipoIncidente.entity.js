"use strict";
import { EntitySchema } from "typeorm";

const SubtipoIncidenteSchema = new EntitySchema({
    name: "SubtipoIncidente",
    tableName: "subTipoIncidente",
    columns: {
        id: { type: "int", primary: true, generated: "increment" },
        claveRadial: { type: "varchar", length: 10, nullable: false },
        clasificacion: { type: "varchar", length: 100, nullable: false },
        descripcion: { type: "varchar", length: 200, nullable: false },
    },
    relations: {
        incidentes: {
            type: "one-to-many",
            target: "Incidente",
            inverseSide: "subtipo",
            cascade: true,
        },
    },
});
export default SubtipoIncidenteSchema;
