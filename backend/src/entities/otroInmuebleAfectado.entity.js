"use strict";
import { EntitySchema } from "typeorm";


const OtroInmuebleAfectadoSchema = new EntitySchema({
    name: "Otro_Inmueble_Afectado",
    tableName: "otro_inmueble_afectado",
    columns: {
        id: {
            type: "int",
            primary: true,
            generated: "increment",
        },
        parte_id: {
            type: "int",
            nullable: false,
        },
        direccion: {
            type: "varchar",
            length: 255,
            nullable: false,
        },
        nombres: {
            type: "varchar",
            length: 100,
            nullable: true,
        },
        apellidos: {
            type: "varchar",
            length: 100,
            nullable: true,
        },
        run: {
            type: "varchar",
            length: 13,
            nullable: true,
        },
        edad: {
            type: "int",
            nullable: true,
        },
        estado_civil: {
            type: "varchar",
            length: 50,
            nullable: true,
        },
    },
    indices: [
        { name: "IDX_OTROINM_PROPIETARIO_PARTE_ID", columns: ["parte_id"] },
    ],
    relations: {

        parte: {
            type: "many-to-one",
            target: "ParteEmergencia",
            joinColumn: { name: "parte_id", referencedColumnName: "id", onDelete: "CASCADE" }
        },
    },
});

export default OtroInmuebleAfectadoSchema;



