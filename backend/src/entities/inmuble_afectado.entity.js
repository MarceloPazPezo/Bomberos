"use strict";
import { EntitySchema } from "typeorm";

const InmuebleAfectadoSchema = new EntitySchema({
  name: "InmuebleAfectado",
  tableName: "inmueble_afectado",
  columns: {
    id: {
      type: "int",
      primary: true,
      generated: "increment",
    },

    // FK al parte de emergencia
    parte_id: {
      type: "int",
      nullable: false,
    },

    // FK al afectado
    afectado_id: {
      type: "int",
      nullable: false,
    },

    tipo_construccion: {
      type: "varchar",
      length: 255,
      nullable: true,
    },

    daños_vivienda: {
      type: "text",
      nullable: true,
    },
    daños_enseres: {
      type: "text",
      nullable: true,
    },

    // metros cuadrados construidos
    m_2_construccion: {
      type: "numeric",
      precision: 10,
      scale: 2,
      nullable: true,
    },

    // número de pisos (entero, pero lo dejas como numeric por tu diseño)
    n_pisos: {
      type: "numeric",
      precision: 5,
      scale: 0,
      nullable: true,
    },

    // metros cuadrados afectados
    m_2_afectado: {
      type: "numeric",
      precision: 10,
      scale: 2,
      nullable: true,
    },
  },

  indices: [
    { name: "IDX_INM_AFECTADO_PARTE_ID", columns: ["parte_id"] },
    { name: "IDX_INM_AFECTADO_AFECTADO_ID", columns: ["afectado_id"] },
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
       eager: true, // activa si quieres cargar siempre el parte
    },

    afectado: {
      type: "many-to-one",
      target: "Afectado",
      joinColumn: {
        name: "afectado_id",
        referencedColumnName: "id",
        onDelete: "CASCADE",
      },
       eager: true, // activa si quieres cargar siempre el afectado
    },
  },
});

export default InmuebleAfectadoSchema;
