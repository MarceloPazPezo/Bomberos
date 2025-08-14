"use strict";
import { EntitySchema } from "typeorm";

const UnidadParteSchema = new EntitySchema({
  name: "UnidadParte",
  tableName: "unidad_parte",
  columns: {
    id: { type: "int", primary: true, generated: "increment" },

    // FK al Parte de Emergencia
    parte_id: { type: "int", nullable: false },

    nombre: { type: "varchar", length: 255, nullable: false },

    // FKs a usuarios
    conductor_id: { type: "int", nullable: true }, // chofer (Usuario.id)
    oficial_id:   { type: "int", nullable: true }, // oficial (Usuario.id)

    n_voluntarios: { type: "int", nullable: true },
    km_salida:     { type: "int", nullable: true },
    km_llegada:    { type: "int", nullable: true },
  },
  indices: [
    { name: "IDX_UNIDAD_PARTE_PARTE_ID", columns: ["parte_id"] },
    { name: "IDX_UNIDAD_PARTE_CONDUCTOR_ID", columns: ["conductor_id"] },
    { name: "IDX_UNIDAD_PARTE_OFICIAL_ID", columns: ["oficial_id"] },
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
    },
    conductor: {
      type: "many-to-one",
      target: "Usuario",
      joinColumn: {
        name: "conductor_id",
        referencedColumnName: "id",
        onDelete: "SET NULL",
      },
      nullable: true,
    },
    oficial: {
      type: "many-to-one",
      target: "Usuario",
      joinColumn: {
        name: "oficial_id",
        referencedColumnName: "id",
        onDelete: "SET NULL",
      },
      nullable: true,
    },
    pasajeros: { 
        type: "one-to-many", 
        target: "PasajeroUnidad", 
        inverseSide: "unidad" 
    },

  },
});

export default UnidadParteSchema;
