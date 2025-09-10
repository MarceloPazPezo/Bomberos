"use strict";
import { EntitySchema } from "typeorm";

const EppSchema = new EntitySchema({
    name: "Epp",
    tableName: "epp",
    columns: {
        id: { type: "int", primary: true, generated: "increment" },
        nombre: { type: "varchar", length: 100, nullable: false },

        creadoPor: { type: "int", nullable: true },
        creadoEl: { type: "timestamp", createDate: true, nullable: false },
        actualizadoPor: { type: "int", nullable: true },
        actualizadoEl: { type: "timestamp", updateDate: true, nullable: false },

        idEstadoEpp: { type: "int", nullable: false },
        idTipoEpp: { type: "int", nullable: false },
        descripcionDeEstado: { type: "varchar", length: 255, nullable: true },
    },
    indices: [
        { name: "IDX_EPP_IDESTADOEPP", columns: ["idEstadoEpp"] },
        { name: "IDX_EPP_IDTIPOEPP", columns: ["idTipoEpp"] },
    ],
    relations: {
        estadosEpp: {
            type: "many-to-one",
            target: "EstadoEpp",
            joinColumn: { name: "idEstadoEpp", referencedColumnName: "id", onDelete: "RESTRICT" },
        },
        tipoEpp: {
            type: "many-to-one",
            target: "TipoEpp",
            joinColumn: { name: "idTipoEpp", referencedColumnName: "id", onDelete: "RESTRICT" },
        },

        // auditoría
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

        // Relación inversa: un Epp puede estar asignado a muchos registros ACargoEpp
        aCargoEpps: {
            type: "one-to-many",
            target: "ACargoEpp",
            inverseSide: "epp",
        },
    },
});
export default EppSchema;

