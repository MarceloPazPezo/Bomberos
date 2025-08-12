"use strict";
import { EntitySchema } from "typeorm";

const PermisoSchema = new EntitySchema({
  name: "Permiso",
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
    roles: {
      type: "many-to-many",
      target: "Rol",
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

export default PermisoSchema;
