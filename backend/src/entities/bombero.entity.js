"use strict";
import { EntitySchema } from "typeorm";

const BomberoSchema = new EntitySchema({
  name: "Bombero",
  tableName: "bomberos",
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
    email: {
      type: "varchar",
      length: 255,
      unique: true,
    },
    password: {
      type: "varchar",
      length: 255,
    },
    activo: {
      type: "boolean",
      default: true,
    },
    creadoEl: {
      type: "timestamp",
      createDate: true,
    },
    creadoPor: {
      type: "int",
      nullable: true,
    },
    actualizadoEl: {
      type: "timestamp",
      updateDate: true,
    },
    actualizadoPor: {
      type: "int",
      nullable: true,
    },
  },
  indices: [
    {
      name: "IDX_BOMBERO_RUN",
      columns: ["run"],
    },
    {
      name: "IDX_BOMBERO_EMAIL",
      columns: ["email"],
    },
    {
      name: "IDX_BOMBERO_ACTIVO",
      columns: ["activo"],
    },
  ],
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
    roles: {
      type: "many-to-many",
      target: "Rol",
      joinTable: {
        name: "bomberoRoles",
        joinColumn: {
          name: "idBombero",
          referencedColumnName: "id",
          onDelete: "CASCADE",
        },
        inverseJoinColumn: {
          name: "idRol",
          referencedColumnName: "id",
          onDelete: "CASCADE",
        },
      },
      eager: true,
    },
    asistenciasEvento: {
      type: "one-to-many",
      target: "AsistenciaEvento",
      inverseSide: "bombero",
      cascade: true,
    },
    asistenciasIncidente: {
      type: "one-to-many",
      target: "AsistenciaIncidente",
      inverseSide: "bombero",
      cascade: true,
    },
    bomberosAccidentados: {
      type: "one-to-many",
      target: "BomberoAccidentado",
      inverseSide: "bombero",
      cascade: true,
    },
    bomberoActualizaestadoIncidente: {
      type: "one-to-many",
      target: "EstadoEstablecido",
      inverseSide: "bombero",
      cascade: true,
    },
    bomberoActualizaIncidente: {
      type: "one-to-many",
      target: "Incidente",
      inverseSide: "actualizadopor",
      cascade: true,
    },
    bomberoCreaIncidente: {
      type: "one-to-many",
      target: "Incidente",
      inverseSide: "creadopor",
      cascade: true,
    },
    bomberoACargoIncidente: {
      type: "one-to-many",
      target: "Incidente",
      inverseSide: "bomberoACargo",
      cascade: true,
    },
    redactaIncidente: {
      type: "one-to-many",
      target: "Incidente",
      inverseSide: "redactor",
      cascade: true,
    },

    registroDonaciones: {
      type: "one-to-many",
      target: "RegistroDonacion",
      inverseSide: "creadopor",
      cascade: true,
    },
    actualizaRegistroDonaciones: {
      type: "one-to-many",
      target: "RegistroDonacion",
      inverseSide: "actualizadopor",
      cascade: true,
    },
    conduceCarro: {
      type: "one-to-many",
      target: "EsDespachado",
      inverseSide: "bomberoMaquinista",
      cascade: true,
    },
  },
});

export default BomberoSchema;