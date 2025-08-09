"use strict";
import { EntitySchema } from "typeorm";

const OcupantesVehiculoSchema = new EntitySchema({
  name: "OcupantesVehiculo",
  tableName: "ocupantes_vehiculo",
  columns: {
    id: {
      type: "int",
      primary: true,
      generated: "increment",
    },
    vehiculo_id: {
      type: "int",
      nullable: false, // FK -> vehiculo_afectado.id
    },
    nombre: {
      type: "varchar",
      length: 255,
      nullable: true,
    },
    edad: {
      type: "int",
      nullable: true,
    },
    run: {
      type: "varchar",
      length: 12, // usa 10 si manejas formato sin puntos
      nullable: true,
    },
    ocupantes: {
      type: "text",
      nullable: true, // notas adicionales (p.ej. lista/descripcion)
    },
    vinculo: {
      type: "varchar",
      length: 100, // p.ej. conductor, dueño, pasajero, etc.
      nullable: true,
    },
    gravedad: {
      type: "varchar",
      length: 100, // p.ej. leve, moderada, grave
      nullable: true,
    },
  },
  indices: [
    { name: "IDX_OCUP_VEHICULO_ID", columns: ["vehiculo_id"] },
  ],
  relations: {
    vehiculo: {
      type: "many-to-one",
      target: "VehiculoAfectado",
      joinColumn: {
        name: "vehiculo_id",
        referencedColumnName: "id",
        onDelete: "CASCADE",
      },
        eager: true, // si quieres cargar siempre el vehículo
    },
  },
});

export default OcupantesVehiculoSchema;
