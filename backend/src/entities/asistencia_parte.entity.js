"use strict";
import { EntitySchema } from "typeorm";

const AsistenciaParteSchema = new EntitySchema({
  name: "AsistenciaParte",
  tableName: "asistencia_parte",
  columns: {
    // PK compuesta
    usuario_id: {
      type: "int",
      primary: true,
    },
    parte_id: {
      type: "int",
      primary: true,
    },
  },
  indices: [
    { name: "IDX_ASISTENCIA_PARTE_USUARIO", columns: ["usuario_id"] },
    { name: "IDX_ASISTENCIA_PARTE_PARTE", columns: ["parte_id"] },
  ],
  relations: {
    usuario: {
      type: "many-to-one",
      target: "Usuario",
      joinColumn: {
        name: "usuario_id",
        referencedColumnName: "id",
        onDelete: "CASCADE",
      },
    },
    parte: {
      type: "many-to-one",
      target: "ParteEmergencia",
      joinColumn: {
        name: "parte_id",
        referencedColumnName: "id",
        onDelete: "CASCADE",
      },
    },
  },
  // Evita duplicados por si en algún momento quitas la PK compuesta
  uniques: [
    { name: "UQ_ASISTENCIA_PARTE_USUARIO_PARTE", columns: ["usuario_id", "parte_id"] },
  ],
});

export default AsistenciaParteSchema;
