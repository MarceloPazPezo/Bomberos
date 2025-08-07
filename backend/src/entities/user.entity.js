"use strict";
import { EntitySchema } from "typeorm";

const UserSchema = new EntitySchema({
  name: "User",
  tableName: "usuarios",
  columns: {
    id: {
      type: "int",
      primary: true,
      generated: "increment",
    },
    nombres: {
      type: "simple-array",
      nullable: true,
    },
    apellidos: {
      type: "simple-array",
      nullable: true,
    },
    rut: {
      type: "varchar",
      length: 10, // 8 digitos + "-" + 1 digito verificador
      nullable: false,
      unique: true,
    },
    fechaNacimiento: {
      type: "date",
      nullable: true,
    },
    email: {
      type: "varchar",
      length: 255,
      nullable: false,
      unique: true,
    },
    telefono: {
      type: "varchar",
      length: 20,
      nullable: true,
      unique: true,
    },
    hashedPassword: {
      type: "varchar",
      length: 255,
      nullable: false,
    },
    activo: {
      type: "boolean",
      default: true,
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
  indices: [
    {
      name: "IDX_USUARIOS_RUT",
      columns: ["rut"],
      unique: true,
    },
    {
      name: "IDX_USUARIOS_EMAIL",
      columns: ["email"],
      unique: true,
    },
  ],

  relations: {
    roles: {
      type: "many-to-many",
      target: "Role",
      joinTable: {
        name: "usuario_roles",
        joinColumn: {
          name: "usuario_id",
          referencedColumnName: "id",
          onDelete: "CASCADE",
        },
        inverseJoinColumn: {
          name: "rol_id",
          referencedColumnName: "id",
          onDelete: "CASCADE",
        },
      },
      eager: true,
    },
  },
});

export default UserSchema;
