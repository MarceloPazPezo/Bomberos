"use strict";
import { EntitySchema } from "typeorm";

const CarroSchema = new EntitySchema({
    name: "Carro",
    tableName: "carro",
    columns: {
        id: { type: "int", primary: true, generated: "increment" },
        patente: { type: "varchar", length: 20, nullable: false, unique: true },
        capacidadPasajeros: { type: "int", nullable: true },
    },
    relations: {
        esDespachado: {
            type: "one-to-many",
            target: "EsDespachado",
            inverseSide: "carro",
        },
    }
});
export default CarroSchema;