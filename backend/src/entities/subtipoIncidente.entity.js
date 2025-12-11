"use strict";
import { EntitySchema } from "typeorm";

const SubtipoIncidenteSchema = new EntitySchema({
    name: "SubtipoIncidente",
    tableName: "subTipoIncidente",
    columns: {
        id: { type: "int", primary: true, generated: "increment" },

        clasificacion: { type: "int", nullable: false },
        descripcion: { type: "varchar", length: 200, nullable: false },
        contieneFuego: { type: "boolean", default: false },
        contieneInmuebles: { type: "boolean", default: false },
        contieneVehiculos: { type: "boolean", default: false },
    },
    relations: {
        claveRadial: {
            type: "many-to-one",
            target: "ClaveRadial",
            joinColumn: { name: "claveRadialId", referencedColumnName: "id" },
            onDelete: "RESTRICT",
            nullable: false,
        },
        incidentes: {
            type: "one-to-many",
            target: "Incidente",
            inverseSide: "subtipo",
            cascade: true,
        },
        clasificacionEmergencia: {
            type: "many-to-one",
            target: "ClasificacionEmergencia",
            joinColumn: { name: "clasificacion", referencedColumnName: "id" },
            onDelete: "RESTRICT",
        },
    },
});
export default SubtipoIncidenteSchema;
