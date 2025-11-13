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
            // eager: true, // ⚠️ DESHABILITADO: Puede causar loops con Vehiculo.pasajeros
            onDelete: "CASCADE",
        },
        afectado: {
            type: "many-to-one",
            target: "Afectado",
            joinColumn: { name: "idAfectado", referencedColumnName: "id" },
            // eager: true, // ⚠️ DESHABILITADO: Puede causar loops con Afectado.pasajeros
            onDelete: "CASCADE",
        },
        vinculo: {
            type: "many-to-one",
            target: "Vinculo",
            joinColumn: { name: "idVinculo", referencedColumnName: "id" },
            eager: true, // ✅ OK: Vinculo no tiene relaciones bidireccionales problemáticas
            onDelete: "RESTRICT",
        },
    },
});
export default PasajeroSchema;