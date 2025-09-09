"use strict";
import { EntitySchema } from "typeorm";

const AsistenciaIncidenteSchema = new EntitySchema({
    name: "AsistenciaIncidente",
    tableName: "asistenciaIncidente",
    columns: {
        idBombero: { type: "int", primary: true },
        idIncidente: { type: "int", primary: true },
    },
    relations: {
        bombero: {
            type: "many-to-one",
            target: "Bombero",
            joinColumn: { name: "idBombero", referencedColumnName: "id" },
            eager: true,
            onDelete: "RESTRICT",},

        incidente: {
            type: "many-to-one",
            target: "Incidente",
            joinColumn: { name: "idIncidente", referencedColumnName: "id" },
            onDelete: "CASCADE",}

    }
});
export default AsistenciaIncidenteSchema;