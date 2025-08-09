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

    createdBy: {
      type: "int",
      nullable: true, // FK -> usuarios.id
    },

    updatedBy: {
      type: "int",
      nullable: true, // FK -> usuarios.id
    },

    updatedAt: {
      type: "timestamp with time zone",
      updateDate: true,
    },
  },

  indices: [
    { name: "IDX_EXISTENCIA_ASIGNADO_ID", columns: ["asignado_id"] },
    { name: "IDX_EXISTENCIA_CREATEDBY", columns: ["createdBy"] },
    { name: "IDX_EXISTENCIA_UPDATEDBY", columns: ["updatedBy"] },
  ],

  relations: {
    asignado: {
      type: "many-to-one",
      target: "User",
      joinColumn: {
        name: "asignado_id",
        referencedColumnName: "id",
        onDelete: "SET NULL",
      },
    },
    creador: {
      type: "many-to-one",
      target: "User",
      joinColumn: {
        name: "createdBy",
        referencedColumnName: "id",
        onDelete: "SET NULL",
      },
    },
    actualizador: {
      type: "many-to-one",
      target: "User",
      joinColumn: {
        name: "updatedBy",
        referencedColumnName: "id",
        onDelete: "SET NULL",
      },
    },
  },
});

export default ExistenciaSchema;
