"use strict";
import { EntitySchema } from "typeorm";

const OtroServicioSchema = new EntitySchema({
  name: "OtroServicio",
  tableName: "otro_servicio",
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
    nombre: {
      type: "varchar",
      length: 255,
      nullable: true,
    },
    unidad: {
      type: "varchar",
      length: 255,
      nullable: true,
    },
    a_cargo: {
      type: "varchar",
      length: 255,
      nullable: true,
    },
    n_personal: {
      type: "varchar",
      length: 50,
      nullable: true,
    },
    observaciones: {
      type: "text",
      nullable: true,
    },
  },
  indices: [
    {
      name: "IDX_OTRO_SERVICIO_PARTE_ID",
      columns: ["parte_id"],
    },
  ],
  relations: {
    parte: {
      type: "many-to-one",
      target: "ParteEmergencia",
      joinColumn: {
        name: "parte_id",
        referencedColumnName: "id",
        onDelete: "CASCADE",
      },
      // Si quieres que siempre cargue el Parte junto:
      eager: true,
    },
  },
});

export default OtroServicioSchema;
