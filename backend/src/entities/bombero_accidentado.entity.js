"use strict";
import { EntitySchema } from "typeorm";

const BomberoAccidentadoSchema = new EntitySchema({
  name: "BomberoAccidentado",
  tableName: "bombero_accidentado",
  columns: {
    id: {
      type: "int",
      primary: true,
      generated: "increment",
    },
    parte_id: {
      type: "int",
      nullable: false,
    },
    compañia: {
      type: "varchar",
      length: 255,
      nullable: true,
    },
    nombre: {
      type: "varchar",
      length: 255,
      nullable: false,
    },
    run: {
      type: "varchar",
      length: 12, // ajusta si usas formato sin puntos: 10
      nullable: true,
    },
    lesiones: {
      type: "text",
      nullable: true,
    },
    constancia: {
      type: "text",
      nullable: true,
    },
    comisaria: {
      type: "varchar",
      length: 255,
      nullable: true,
    },
    acciones: {
      type: "text",
      nullable: true,
    },
  },
  indices: [
    {
      name: "IDX_BOM_ACC_PARTE_ID",
      columns: ["parte_id"],
    },
  ],
  relations: {
    parte: {
      type: "many-to-one",
      target: "ParteEmergencia",
      joinColumn: {
        name: "parte_id",
        referencedColumnName: "id",
        onDelete: "CASCADE",
      },
      // Si sueles leer el Parte junto con los accidentados: segun gepeto esto sirve para tener cargado los id sin tener que hacer un join
       eager: true,
    },
  },
});

export default BomberoAccidentadoSchema;
