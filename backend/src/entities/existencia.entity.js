"use strict";
import { EntitySchema } from "typeorm";

const ExistenciaSchema = new EntitySchema({
  name: "Existencia",
  tableName: "existencia",
  columns: {
    id: {
      type: "int",
      primary: true,
      generated: "increment",
    },

    asignado_id: {
      type: "int",
      nullable: true, // FK -> usuarios.id
    },

    numero_serie: {
      type: "int",
      nullable: true,
    },

    nombre: {
      type: "varchar",
      length: 255,
      nullable: false,
    },

    descripcion: {
      type: "varchar",
      length: 255,
      nullable: true,
    },

    estado: {
      type: "varchar",
      length: 50,
      nullable: true,
    },

    fecha_ingreso: {
      type: "timestamp with time zone",
      nullable: true,
    },

    fecha_asignacion: {
      type: "timestamp with time zone",
      nullable: true,
    },

    fecha_mantencion: {
      type: "timestamp with time zone",
      nullable: true,
    },

    ubicacion: {
      type: "varchar",
      length: 255,
      nullable: true,
    },

    creadoPor: {
      type: "int",
      nullable: true, // FK -> usuarios.id
    },

    actualizadoPor: {
      type: "int",
      nullable: true, // FK -> usuarios.id
    },

    fechaActualizacion: {
      type: "timestamp with time zone",
      updateDate: true,
    },
  },

  indices: [
    { name: "IDX_EXISTENCIA_ASIGNADO_ID", columns: ["asignado_id"] },
    { name: "IDX_EXISTENCIA_CREATEDBY", columns: ["creadoPor"] },
    { name: "IDX_EXISTENCIA_UPDATEDBY", columns: ["actualizadoPor"] },
  ],

  relations: {
    asignado: {
      type: "many-to-one",
      target: "Usuario",
      joinColumn: {
        name: "asignado_id",
        referencedColumnName: "id",
        onDelete: "SET NULL",
      },
    },
    creador: {
      type: "many-to-one",
      target: "Usuario",
      joinColumn: {
        name: "creadoPor",
        referencedColumnName: "id",
        onDelete: "SET NULL",
      },
    },
    actualizador: {
      type: "many-to-one",
      target: "Usuario",
      joinColumn: {
        name: "actualizadoPor",
        referencedColumnName: "id",
        onDelete: "SET NULL",
      },
    },
  },
});

export default ExistenciaSchema;
