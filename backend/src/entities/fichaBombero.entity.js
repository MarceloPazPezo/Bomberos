"use strict";
import { EntitySchema } from "typeorm";

const FichaBomberoSchema = new EntitySchema({
  name: "FichaBombero",
  tableName: "fichaBombero",
  columns: {
    id: { type: "int", primary: true, generated: "increment" },
    nombre: { type: "varchar", length: 100, nullable: false },
    licenciaClaseF: { type: "boolean", nullable: true, default: false },
    telefono: { type: "varchar", length: 15, nullable: true, unique: true },
    fechaNacimiento: { type: "date", nullable: true },
    fechaIngreso: { type: "date", nullable: true },
    donante: { type: "boolean", nullable: true, default: false },

    fotoPerfilURL: { type: "varchar", length: 255, nullable: true },
    fotoPerfilKEY: { type: "varchar", length: 255, nullable: true },

    idCompania: { type: "int", nullable: false },
    idDireccion: { type: "int", nullable: true },
    idTipoSangre: { type: "int", nullable: true },

    idBombero: { type: "int", nullable: false, unique: true },

    creadoPor: { type: "int", nullable: true },
    creadoEl: { type: "timestamp", createDate: true, nullable: false },
    actualizadoPor: { type: "int", nullable: true },
    actualizadoEl: { type: "timestamp", updateDate: true, nullable: false },
  },
  indices: [
    { name: "IDX_FICHABOMBERO_IDCOMPANIA", columns: ["idCompania"] },
    { name: "IDX_FICHABOMBERO_IDDIRECCION", columns: ["idDireccion"] },
    { name: "IDX_FICHABOMBERO_IDTIPOSANGRE", columns: ["idTipoSangre"] },
    { name: "IDX_FICHABOMBERO_IDBOMBERO", columns: ["idBombero"] },
  ],
  relations: {
    compania: {
      type: "many-to-one",
      target: "Compania",
      joinColumn: { name: "idCompania", referencedColumnName: "id", onDelete: "RESTRICT" },
    },
    direccion: {
      type: "many-to-one",
      target: "Direccion",
      joinColumn: { name: "idDireccion", referencedColumnName: "id", onDelete: "RESTRICT" },
    },
    tipoSangre: {
      type: "many-to-one",
      target: "TipoSangre",
      joinColumn: { name: "idTipoSangre", referencedColumnName: "id", onDelete: "SET NULL" },
    },
    // 1:1 con Bombero (FK en esta tabla)
    bombero: {
      type: "one-to-one",
      target: "Bombero",
      joinColumn: { name: "idBombero", referencedColumnName: "id", onDelete: "CASCADE" },
    },
    eppAcargo: {
      type: "one-to-many",
      target: "ACargoEpp",
      inverseSide: "fichaBombero",
    },
    capacitaciones: {
      type: "one-to-many",
      target: "Capacitacion",
      inverseSide: "fichaBombero",
    },
    contactoEmergencia: {
      type: "one-to-many",
      target: "ContactoEmergencia",
      inverseSide: "fichaBombero",
    },

    // auditoría
    creadoPor: {
      type: "many-to-one",
      target: "Bombero",
      joinColumn: { name: "creadoPor", referencedColumnName: "id", onDelete: "SET NULL" },
    },
    actualizadoPor: {
      type: "many-to-one",
      target: "Bombero",
      joinColumn: { name: "actualizadoPor", referencedColumnName: "id", onDelete: "SET NULL" },
    },
  },
});

export default FichaBomberoSchema;
