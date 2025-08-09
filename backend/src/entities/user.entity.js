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
    run: {
      type: "varchar",
      length: 10, // 8 digitos + "-" + 1 digito verificador
      nullable: false,
      unique: true,
    },
    fechaNacimiento: {
      type: "date",
      nullable: false,
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
    passwordHash: {
      type: "varchar",
      length: 255,
      nullable: false,
    },
    fechaIngreso: {
      type: "date",
      nullable: true,
    },
    direccion: {
      type: "varchar",
      length: 255,
      nullable: true,
    },
    tipoSangre: {
      type: "varchar",
      length: 3,
      nullable: true,
    },
    alergias: {
      type: "simple-array",
      nullable: true,
    },
    medicamentos: {
      type: "simple-array",
      nullable: true,
    },
    condiciones: {
      type: "simple-array",
      nullable: true,
    },
    activo: {
      type: "boolean",
      default: true,
    },
    createdBy: {
      type: "varchar",
      length: 100,
      nullable: true,
    },
    createdAt: {
      type: "timestamp with time zone",
      createDate: true,
    },
    updatedBy: {
      type: "varchar",
      length: 100,
      nullable: true,
    },
    updatedAt: {
      type: "timestamp with time zone",
      updateDate: true,
    },
  },
  indices: [
    {
      name: "IDX_USUARIOS_RUN",
      columns: ["run"],
    },
    {
      name: "IDX_USUARIOS_EMAIL",
      columns: ["email"],
    },
    {
      name: "IDX_USUARIOS_TELEFONO",
      columns: ["telefono"],
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
    disponibilidades: {
      type: "one-to-many",
      target: "Disponibilidad",
      inverseSide: "usuario",
    },
    existenciasAsignadas: {
      type: "one-to-many",
      target: "Existencia",
      inverseSide: "asignado",
    },
    existenciasCreadas: {
      type: "one-to-many",
      target: "Existencia",
      inverseSide: "creador",
    },
    existenciasActualizadas: {
      type: "one-to-many",
      target: "Existencia",
      inverseSide: "actualizador",
    },


  },
});

export default UserSchema;