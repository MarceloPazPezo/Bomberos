"use strict";
import { EntitySchema } from "typeorm";

const PasajeroSchema = new EntitySchema({
    name: "Pasajero",
    tableName: "pasajero",
    columns: {
        idVehiculo: { type: "int", primary: true },
        idAfectado: { type: "int", primary: true },
        idVinculo: { type: "int", primary: true },
        esCopiloto: { type: "boolean", default: false },
    },
    relations: {
        vehiculo: {
            type: "many-to-one",
            target: "Vehiculo",
            joinColumn: { name: "idVehiculo", referencedColumnName: "id" },
            eager: true,
            onDelete: "CASCADE",
        },
        afectado: {
            type: "many-to-one",
            target: "Afectado",
            joinColumn: { name: "idAfectado", referencedColumnName: "id" },
            eager: true,
            onDelete: "CASCADE",
        },
        vinculo: {
            type: "many-to-one",
            target: "Vinculo",
            joinColumn: { name: "idVinculo", referencedColumnName: "id" },
            eager: true,
            onDelete: "RESTRICT",
        },
    },
});
export default PasajeroSchema;