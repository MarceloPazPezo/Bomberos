"use strict";
import { EntitySchema } from "typeorm";

const SistemaSchema = new EntitySchema({
  name: "Sistema",
  tableName: "sistema",
  columns: {
    id: {
      type: "int",
      primary: true,
      generated: "increment",
    },
    key: {
      type: "varchar",
      length: 100,
      nullable: false,
      unique: true,
    },
    value: {
      type: "text",
      nullable: true,
    },
    description: {
      type: "varchar",
      length: 255,
      nullable: true,
    },
    category: {
      type: "varchar",
      length: 50,
      nullable: true,
      default: "general",
    },
    isEditable: {
      type: "boolean",
      default: true,
    },
    fechaCreacion: {
      type: "timestamp with time zone",
      createDate: true,
    },
    fechaActualizacion: {
      type: "timestamp with time zone",
      updateDate: true,
    },
  },
  indices: [
    { name: "IDX_CONFIGURACION_SISTEMA_KEY", columns: ["key"] },
    { name: "IDX_CONFIGURACION_SISTEMA_CATEGORY", columns: ["category"] },
  ],
});

export default SistemaSchema;
