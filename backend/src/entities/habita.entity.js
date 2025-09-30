// habita.entity.js
"use strict";
import { EntitySchema } from "typeorm";

const HabitaSchema = new EntitySchema({
  name: "Habita",
  tableName: "habita",
  columns: {
    inmuebleId: { type: "int", primary: true },
    afectadoId: { type: "int", primary: true },
  },
  relations: {
    inmueble: {
      type: "many-to-one",
      target: "Inmueble",
      joinColumns: [{ name: "inmuebleId", referencedColumnName: "id" }], // 👈 explícito
      onDelete: "CASCADE",
    },
    afectado: {
      type: "many-to-one",
      target: "Afectado",
      joinColumns: [{ name: "afectadoId", referencedColumnName: "id" }], // 👈 explícito
      onDelete: "CASCADE",
    },
  },
});

export default HabitaSchema;
