"use strict";
import { EntitySchema } from "typeorm";

const DisponibilidadSchema = new EntitySchema({
  name: "Disponibilidad",
  tableName: "disponibilidad",
  columns: {
    id: {
      type: "int",
      primary: true,
      generated: "increment",
    },
    usuario_id: {
      type: "int",
      nullable: false, // FK -> usuarios.id
    },
    estado: {
      type: "varchar",
      length: 50, // ajusta si tienes catálogo
      nullable: false,
    },
    fecha_inicio: {
      type: "timestamp with time zone",
      nullable: false,
    },
    fecha_termino: {
      type: "timestamp with time zone",
      nullable: true, // puede estar abierta
    },
    rol_servicio: {
      type: "varchar",
      length: 100,
      nullable: true,
    },
  },
  indices: [
    { name: "IDX_DISPONIBILIDAD_USUARIO_ID", columns: ["usuario_id"] },
    { name: "IDX_DISPONIBILIDAD_ESTADO", columns: ["estado"] },
  ],
  relations: {
    usuario: {
      type: "many-to-one",
      target: "User",
      joinColumn: {
        name: "usuario_id",
        referencedColumnName: "id",
        onDelete: "CASCADE", // si se borra el usuario, se borran sus disponibilidades
      },
        eager: true, // activa si quieres cargar siempre el usuario
    },
  },
});

export default DisponibilidadSchema;
