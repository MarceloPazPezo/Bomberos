"use strict";
import { EntitySchema } from "typeorm";

const PasajeroUnidadSchema = new EntitySchema({
  name: "PasajeroUnidad",
  tableName: "pasajero_unidad",
  columns: {
    // PK compuesta
    unidad_parte_id: { type: "int", primary: true }, // FK -> unidad_parte.id
    usuario_id:      { type: "int", primary: true }, // FK -> usuarios.id
  },
  indices: [
    { name: "IDX_PASAJERO_UNIDAD_UNIDAD", columns: ["unidad_parte_id"] },
    { name: "IDX_PASAJERO_UNIDAD_USUARIO", columns: ["usuario_id"] },
  ],
  relations: {
    unidad: {
      type: "many-to-one",
      target: "UnidadParte",
      joinColumn: {
        name: "unidad_parte_id",
        referencedColumnName: "id",
        onDelete: "CASCADE",
      },
    },
    usuario: {
      type: "many-to-one",
      target: "Usuario",
      joinColumn: {
        name: "usuario_id",
        referencedColumnName: "id",
        onDelete: "CASCADE",
      },
    },
  },
  // Redundante con la PK compuesta, pero útil si cambias a PK simple
  uniques: [
    { name: "UQ_PASAJERO_UNIDAD", columns: ["unidad_parte_id", "usuario_id"] },
  ],
});

export default PasajeroUnidadSchema;
