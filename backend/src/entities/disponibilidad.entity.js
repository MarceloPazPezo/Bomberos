"use strict";
import { EntitySchema } from "typeorm";

const DisponibilidadSchema = new EntitySchema({
  name: "Disponibilidad",
  tableName: "disponibilidades",
  columns: {
    id: {
      type: "int",
      primary: true,
      generated: "increment",
    },
    idBombero: {
      type: "int",
      nullable: false,
    },
    fechaInicio: {
      type: "timestamp with time zone",
      nullable: false,
      createDate: true,
    },
    fechaTermino: {
      type: "timestamp with time zone",
      nullable: true,
    },
  },
  indices: [
    { name: "IDX_DISPONIBILIDAD_BOMBERO_ID", columns: ["idBombero"] },
  ],
  relations: {
    bombero: {
      type: "many-to-one",
      target: "Bombero",
      joinColumn: {
        name: "idBombero",
        referencedColumnName: "id",
        onDelete: "CASCADE",
      },
      eager: true,
    },
  },
});

export default DisponibilidadSchema;
