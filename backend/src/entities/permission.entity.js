"use strict";
import { EntitySchema } from "typeorm";

const PermissionSchema = new EntitySchema({
  name: "Permission",
  tableName: "permisos",
  columns: {
    id: {
      type: "int",
      primary: true,
      generated: "increment",
    },
    nombre: {
      type: "varchar",
      length: 100,
      nullable: false,
      unique: true,
    },
    descripcion: {
      type: "text",
      nullable: true,
    },
    categoria: {
      type: "varchar",
      length: 50,
      nullable: true,
    },
    ruta: {
      type: "varchar",
      length: 255,
      nullable: true,
    },
    metodo: {
      type: "varchar",
      length: 10,
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
    roles: {
      type: "many-to-many",
      target: "Role",
      mappedBy: "permisos",
    },
  },
  indices: [
    {
      name: "IDX_PERMISOS_NOMBRE_PERMISO_UNICO",
      columns: ["nombre"],
      unique: true,
    },
  ],
});

export default PermissionSchema;
