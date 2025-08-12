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
    fechaCreacion: {
      type: "timestamp with time zone",
      createDate: true,
    },
    fechaActualizacion: {
      type: "timestamp with time zone",
      updateDate: true,
    },
  },
  relations: {
    usuarios: {
      type: "many-to-many",
      target: "Usuario",
      mappedBy: "roles",
    },
    permisos: {
      type: "many-to-many",
      target: "Permiso",
      joinTable: {
        name: "rol_permisos",
        joinColumn: {
          name: "rol_id",
          referencedColumnName: "id",
          onDelete: "CASCADE",
        },
        inverseJoinColumn: {
          name: "permiso_id",
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
