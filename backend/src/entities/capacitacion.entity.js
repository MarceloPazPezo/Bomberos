"use strict";
import { EntitySchema } from "typeorm";

const CapacitacionSchema = new EntitySchema({
    name: "Capacitacion",
    tableName: "capacitacion",
    columns: {
        id: { type: "int", primary: true, generated: "increment" },
        idTipoCapacitacion: { type: "int", nullable: false },
        descripcion: { type: "text", nullable: true },
        idFichaBombero: { type: "int", nullable: false },

        creadoPor: { type: "int", nullable: true },
        creadoEl: { type: "timestamp", createDate: true, nullable: false },
        actualizadoPor: { type: "int", nullable: true },
        actualizadoEl: { type: "timestamp", updateDate: true, nullable: false },
    },
    indices: [
        { name: "IDX_capacitacion_idTipoCapacitacion", columns: ["idTipoCapacitacion"] },
        { name: "IDX_capacitacion_idFichaBombero", columns: ["idFichaBombero"] },
    ],

    relations: {
        tipoCapacitacion: {
            type: "many-to-one",
            target: "TipoCapacitacion",
            joinColumn: { name: "idTipoCapacitacion", referencedColumnName: "id", onDelete: "RESTRICT" },
        },
        fichaBombero: {
            type: "many-to-one",
            target: "FichaBombero",
            joinColumn: { name: "idFichaBombero", referencedColumnName: "id", onDelete: "CASCADE" },
        },
        creadoPor: {
            type: "many-to-one",
            target: "Bombero",
            joinColumn: { name: "creadoPor", referencedColumnName: "id", onDelete: "SET NULL" },
        },
        actualizadoPor: {
            type: "many-to-one",
            target: "Bombero",
            joinColumn: { name: "actualizadoPor", referencedColumnName: "id", onDelete: "SET NULL" },
        },
    },
});
export default CapacitacionSchema;