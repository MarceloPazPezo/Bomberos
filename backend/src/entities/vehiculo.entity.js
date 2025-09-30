"use strict";
import { EntitySchema } from "typeorm";

const VehiculoSchema = new EntitySchema({
    name: "Vehiculo",
    tableName: "vehiculo",
    columns: {
        id: {type: "int", primary: true, generated: true},
        patente: {type: "varchar", length: 20},
        color: {type: "varchar", length: 50, nullable: true},
        marca: {type: "varchar", length: 100, nullable: true},
        modelo: {type: "varchar", length: 100, nullable: true},
        descripciondanos: {type: "varchar", length: 500, nullable: true},
        idDueno: {type: "int", nullable: true},
        idConductor: {type: "int", nullable: true},
        idIncidente: {type: "int", nullable: true},
    },
    indices: [
        { name: "IDX_VEHICULO_IDINCIDENTE", columns: ["idIncidente"] },
        { name: "IDX_VEHICULO_IDDUENO", columns: ["idDueno"] },
        { name: "IDX_VEHICULO_IDCONDUCTOR", columns: ["idConductor"] },
    ],
    relations: {
        dueno: {
            type: "many-to-one",
            target: "Afectado",
            joinColumn: {name: "idDueno", referencedColumnName: "id"},
            onDelete: "SET NULL",
        },
        conductor: {
            type: "many-to-one",
            target: "Afectado",
            joinColumn: {name: "idConductor", referencedColumnName: "id"},
            onDelete: "SET NULL",
        },
        incidente: {
            type: "many-to-one",
            target: "Incidente",
            joinColumn: {name: "idIncidente", referencedColumnName: "id"},
            onDelete: "CASCADE",
        },
        pasajeros: {
            type: "one-to-many",
            target: "Pasajero",
            inverseSide: "vehiculo",
            cascade: true,
        },
        
    },
});
export default VehiculoSchema;