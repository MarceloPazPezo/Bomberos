"use strict";
import { EntitySchema } from "typeorm";

const RoleSchema = new EntitySchema({
  name: "Role",
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
    createdAt: {
      type: "timestamp with time zone",
      createDate: true,
    },
    updatedAt: {
      type: "timestamp with time zone",
      updateDate: true,
    },
  },
  relations: {
    users: {
      type: "many-to-many",
      target: "User",
      mappedBy: "roles",
    },
    permisos: {
      type: "many-to-many",
      target: "Permission",
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

export default RoleSchema;
