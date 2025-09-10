"use strict";
import { EntitySchema } from "typeorm";

const CompaniaSchema = new EntitySchema({
  name: "Compania",
  tableName: "companias",
  columns: {
    id: {
      type: "int",
      primary: true,
      generated: "increment",
    },
    nombre: {
      type: "varchar",
      length: 255,
      nullable: false,
    },
    fechaFundacion: {
      type: "date",
      nullable: true,
    },
    email: {
      type: "varchar",
      length: 255,
      nullable: true,
    },
    telefono: {
      type: "varchar",
      length: 50,
      nullable: true,
    },
    idDireccion: {
      type: "int",
      nullable: true,
    },
    logoURL: {
      type: "varchar",
      length: 255,
      nullable: true,
    },
    logoKEY: {
      type: "varchar",
      length: 255,
      nullable: true,
    },
  },
  indices: [
    { name: "IDX_COMPANIA_NOMBRE", columns: ["nombre"] },
    { name: "IDX_COMPANIA_EMAIL", columns: ["email"] }
  ],
  relations: {
    direccion: {
      type: "many-to-one",
      target: "Direccion",
      joinColumn: {
        name: "idDireccion",
        referencedColumnName: "id",
        onDelete: "SET NULL",
      },
    },
    fichas: {
      type: "one-to-many",
      target: "FichaBombero",
      inverseSide: "compania",
    },
    registroDonacion: {
      type: "one-to-many",
      target: "RegistroDonacion",
      inverseSide: "compania",
    },

  },
});

export default CompaniaSchema;
