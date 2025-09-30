"use strict";
import { EntitySchema } from "typeorm";

const EsDespachadoSchema = new EntitySchema({
    name: "EsDespachado",
    tableName: "esDespachado",
    columns: {
        idBomberoMaquinista: { type: "int", primary: true },
        idIncidente: { type: "int", primary: true },
        idCarro: { type: "int", primary: true },
        kmSalida: { type: "int", nullable: true },
        kmLlegada: { type: "int", nullable: true },
        nPersonal: { type: "int", nullable: true },
    },
    indices: [
        { name: "IDX_ESDESPACHADO_IDINCIDENTE", columns: ["idIncidente"] },
        { name: "IDX_ESDESPACHADO_IDCARRO", columns: ["idCarro"] },
        { name: "IDX_ESDESPACHADO_IDMAQ", columns: ["idBomberoMaquinista"] },
    ],
    relations: {
        bomberoMaquinista: {
            type: "many-to-one",
            target: "Bombero",
            joinColumn: { name: "idBomberoMaquinista", referencedColumnName: "id" },
            onDelete: "RESTRICT",
        },
        incidente: {
            type: "many-to-one",
            target: "Incidente",
            joinColumn: { name: "idIncidente", referencedColumnName: "id" },
            onDelete: "CASCADE",
        },
        carro: {
            type: "many-to-one",
            target: "Carro",
            joinColumn: { name: "idCarro", referencedColumnName: "id" },
            onDelete: "RESTRICT",
        },
    }
});
export default EsDespachadoSchema;