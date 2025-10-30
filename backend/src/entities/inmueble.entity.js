"use strict";
import { EntitySchema } from "typeorm";

const InmuebleSchema = new EntitySchema({
    name: "Inmueble",
    tableName: "inmueble",
    columns: {
        id: { type: "int", primary: true, generated: true },
        tipoConstruccion: { type: "varchar", nullable: true, length: 100 },
        nPisos: { type: "int", nullable: true },
        m2Construccion: { type: "int", nullable: true },
        m2Afectados: { type: "int", nullable: true },
        danosVivienda: { type: "varchar", nullable: true, length: 500 },
        danosAnexos: { type: "varchar", nullable: true, length: 500 },
        idIncidente: { type: "int", nullable: true },
        idPropietario: { type: "int", nullable: true },
        idDireccion: { type: "int", nullable: true },

    },
    indices: [
        { name: "IDX_INMUEBLE_IDINCIDENTE", columns: ["idIncidente"] },
        { name: "IDX_INMUEBLE_IDPROPIETARIO", columns: ["idPropietario"] },
        { name: "IDX_INMUEBLE_IDDIRECCION", columns: ["idDireccion"] },
    ],
    relations: {
        incidente: {
            type: "many-to-one",
            target: "Incidente",
            joinColumn: { name: "idIncidente", referencedColumnName: "id" },
            onDelete: "CASCADE",
        },
        propietario: {
            type: "many-to-one",
            target: "Afectado",
            joinColumn: { name: "idPropietario", referencedColumnName: "id" },
            onDelete: "SET NULL",
        },
        direccion: {
            type: "many-to-one",
            target: "Direccion",
            joinColumn: { name: "idDireccion", referencedColumnName: "id" },
            onDelete: "SET NULL",
        },
        habitaAfectados: {
            type: "one-to-many",
            target: "Habita",
            inverseSide: "inmueble",
            cascade: true,
        },
    },
});
export default InmuebleSchema;
