"use strict";
import { EntitySchema } from "typeorm";

const VinculoSchema = new EntitySchema({
    name: "Vinculo",
    tableName: "vinculo",
    columns: {
        id: { type: "int", primary: true, generated: "increment" },
        nombre: { type: "varchar", length: 100, nullable: false, unique: true },
    },
    relations: {
        contactos: {
            type: "one-to-many",
            target: "ContactoEmergencia",
            inverseSide: "vinculo",
            cascade: false,
        },
        pasajeros: {
            type: "one-to-many",
            target: "Pasajero",
            inverseSide: "vinculo",
            cascade: false,
        },
       
    },
});
export default VinculoSchema;