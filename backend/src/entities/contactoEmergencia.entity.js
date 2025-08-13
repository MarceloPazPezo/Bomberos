"use strict";
import { EntitySchema } from "typeorm";

const ContactoEmergenciaSchema = new EntitySchema({
  name: "ContactoEmergencia",
  tableName: "contacto_emergencia",
  columns: {
    id: {
      type: "int",
      primary: true,
      generated: "increment",
    },
    usuario_id: {
      type: "int",
      nullable: false, // FK → usuarios.id
    },
    nombres: {
      type: "varchar",
      length: 255,
      nullable: false,
    },
    apellidos: {
      type: "varchar",
      length: 255,
      nullable: false,
    },
    vinculo: {
      type: "varchar",
      length: 100,
      nullable: true, // p.ej. padre, madre, amigo, pareja
    },
    telefono: {
      type: "varchar",
      length: 20,
      nullable: true,
    },
    email: {
      type: "varchar",
      length: 255,
      nullable: true,
    },
  },
  indices: [
    { name: "IDX_CONTACTO_EMERGENCIA_USUARIO_ID", columns: ["usuario_id"] },
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
       eager: true, // Actívalo si quieres cargar siempre el usuario junto
    },
  },
});

export default ContactoEmergenciaSchema;
