"use strict";
import { EntitySchema } from "typeorm";

const AsistenciaIncidenteSchema = new EntitySchema({
    name: "AsistenciaIncidente",
    tableName: "asistenciaIncidente",
    columns: {
        idBombero: { type: "int", primary: true },
        idIncidente: { type: "int", primary: true },
    },
    indices: [
        { name: "IDX_ASISTENCIAINCIDENTE_IDINCIDENTE", columns: ["idIncidente"] },
        { name: "IDX_ASISTENCIAINCIDENTE_IDBOMBERO", columns: ["idBombero"] },
    ],
    relations: {
        bombero: {
            type: "many-to-one",
            target: "Bombero",
            joinColumn: { name: "idBombero", referencedColumnName: "id" },
            onDelete: "RESTRICT", },

        incidente: {
            type: "many-to-one",
            target: "Incidente",
            joinColumn: { name: "idIncidente", referencedColumnName: "id" },
            onDelete: "CASCADE", }

    }
});
export default AsistenciaIncidenteSchema;