"use strict";
import { EntitySchema } from "typeorm";

const BomberoAccidentadoSchema = new EntitySchema({
    name: "BomberoAccidentado",
    tableName: "bomberoAccidentado",
    columns: {
        idBombero: { type: "int", primary: true},
        idIncidente: { type: "int", primary: true},

        lesiones: { type: "varchar", length: 500, nullable: true },
        constancia: { type: "varchar", length: 100, nullable: true },
        AccionesRealizadas: { type: "varchar", length: 500, nullable: true },
        comisaria: { type: "varchar", length: 100, nullable: true },
    },
    relations: {
        bombero: {
            type: "many-to-one",
            target: "Bombero",
            joinColumn: { name: "idBombero", referencedColumnName: "id" },
            onDelete: "RESTRICT",},
        incidente: {
            type: "many-to-one",
            target: "Incidente",
            joinColumn: { name: "idIncidente",referencedColumnName: "id" },
            onDelete: "CASCADE",}
    }
});
export default BomberoAccidentadoSchema;
