"use strict";
import { EntitySchema } from "typeorm";

const CarroSchema = new EntitySchema({
    name: "Carro",
    tableName: "carro",
    columns: {
        id: { type: "int", primary: true, generated: "increment" },
        patente: { type: "varchar", length: 20, nullable: false, unique: true },
        capacidadPasajeros: { type: "int", nullable: true },
        idCompania: { type: "int", nullable: false },
    },
    relations: {
        esDespachado: {
            type: "one-to-many",
            target: "EsDespachado",
            inverseSide: "carro",
        },
        compania: {
            type: "many-to-one",
            target: "Compania",
            joinColumn: { name: "idCompania" },
            inverseSide: "carros",
            onDelete: "CASCADE",
            onUpdate: "CASCADE",
        }
    }
});
export default CarroSchema;