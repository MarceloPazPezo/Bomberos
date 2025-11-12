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
      nullable: false, // FK -> bomberos.id
    },
    fechaInicio: {
      type: "timestamp with time zone",
      nullable: false,
      createDate: true,
    },
    fechaTermino: {
      type: "timestamp with time zone",
      nullable: true, // puede estar abierta
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
        onDelete: "CASCADE", // si se borra el bombero, se borran sus disponibilidades
      },
        eager: true, // activa si quieres cargar siempre el bombero
    },
  },
});

export default DisponibilidadSchema;
