"use strict";
import { EntitySchema } from "typeorm";

const RegistroDonacionSchema = new EntitySchema({
    name: "RegistroDonacion",
    tableName: "registroDonacion",
    columns: {
        id: { type: "int", primary: true, generated: "increment" }, 
        fecha: { type: "timestamp", nullable: false },
        descripcion: { type: "varchar", length: 500, nullable: true },
        idCompania: { type: "int", nullable: true },
        creadoEl: { type: "timestamp", createDate: true },
        creadoPor: { type: "int", nullable: true },
        actualizadoEl: { type: "timestamp", updateDate: true, },
        actualizadoPor: { type: "int", nullable: true, },
    },
    relations: {
        compania: {
            type: "many-to-one",
            target: "Compania",
            joinColumn: { name: "idCompania", referencedColumnName: "id" },
            onDelete: "CASCADE",
        },
        creadopor: {
            type: "many-to-one",
            target: "Bombero",
            joinColumn: { name: "creadoPor", referencedColumnName: "id" },
            onDelete: "SET NULL",
        },
        actualizadopor: {
            type: "many-to-one",
            target: "Bombero",
            joinColumn: { name: "actualizadoPor", referencedColumnName: "id" },
            onDelete: "SET NULL",
        },
    }
});
export default RegistroDonacionSchema;