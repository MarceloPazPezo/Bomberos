"use strict";
import { EntitySchema } from "typeorm";

const RolSchema = new EntitySchema({
  name: "Rol",
  tableName: "roles",
  columns: {
    id: {
      type: "int",
      primary: true,
      generated: "increment",
    },
    nombre: {
      type: "varchar",
      length: 50,
      nullable: false,
      unique: true,
    },
    descripcion: {
      type: "text",
      nullable: true,
    },
    creadoEl: {
      type: "timestamp with time zone",
      createDate: true,
    },
    creadoPor: {
      type: "int",
      nullable: true,
    },
    actualizadoEl: {
      type: "timestamp with time zone",
      updateDate: true,
    },
    actualizadoPor: {
      type: "int",
      nullable: true,
    },
  },
  relations: {
    creador: {
      type: "many-to-one",
      target: "Bombero",
      joinColumn: {
        name: "creadoPor",
        referencedColumnName: "id",
      },
    },
    actualizador: {
      type: "many-to-one",
      target: "Bombero",
      joinColumn: {
        name: "actualizadoPor",
        referencedColumnName: "id",
      },
    },
    bomberos: {
      type: "many-to-many",
      target: "Bombero",
      mappedBy: "roles",
    },
    permisos: {
      type: "many-to-many",
      target: "Permiso",
      joinTable: {
        name: "rolPermisos",
        joinColumn: {
          name: "idRol",
          referencedColumnName: "id",
          onDelete: "CASCADE",
        },
        inverseJoinColumn: {
          name: "idPermiso",
          referencedColumnName: "id",
        },
      },
      eager: true,
    },
  },
  indices: [
    {
      name: "IDX_ROLES_NOMBRE_ROL_UNICO",
      columns: ["nombre"],
      unique: true,
    },
  ],
});

export default RolSchema;
