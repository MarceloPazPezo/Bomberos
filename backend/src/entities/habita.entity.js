// habita.entity.js
"use strict";
import { EntitySchema } from "typeorm";

const HabitaSchema = new EntitySchema({
  name: "Habita",
  tableName: "habita",
  columns: {
    idInmueble: { type: "int", primary: true },
    idAfectado: { type: "int", primary: true },
  },
  relations: {
    inmueble: {
      type: "many-to-one",
      target: "Inmueble",
      joinColumns: [{ name: "idInmueble", referencedColumnName: "id" }], // 👈 explícito
      onDelete: "CASCADE",
    },
    afectado: {
      type: "many-to-one",
      target: "Afectado",
      joinColumns: [{ name: "idAfectado", referencedColumnName: "id" }], // 👈 explícito
      onDelete: "CASCADE",
    },
  },
});

export default HabitaSchema;
