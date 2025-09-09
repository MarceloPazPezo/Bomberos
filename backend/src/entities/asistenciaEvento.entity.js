"use strict";
import { EntitySchema } from "typeorm";

const AsistenciaEventoSchema = new EntitySchema({
    name: "AsistenciaEvento",
    tableName: "asistenciaEvento",
    columns: {
        idBombero: {
            type: "int",
            primary: true,
        },
        idEvento: {
            type: "int",
            primary: true,
        },
    },
    indices: [ 
        {name: "IDX_ASISTENCIA_EVENTO_IDBOMBERO",columns: ["idBombero"],},
        {name: "IDX_ASISTENCIA_EVENTO_IDEVENTO",columns: ["idEvento"],},
    ],
    relations: {
        bombero: {
            target: "Bombero",
            type: "many-to-one",
            joinColumn: { name: "idBombero", referencedColumnName: "id" },
            onDelete: "CASCADE",
        },
        evento: {
            target: "Evento",
            type: "many-to-one",
            joinColumn: { name: "idEvento", referencedColumnName: "id" },
            onDelete: "CASCADE",
        },
    },

});
export default AsistenciaEventoSchema;