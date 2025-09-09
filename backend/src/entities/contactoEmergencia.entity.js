"use strict";
import { EntitySchema } from "typeorm";

const ContactoEmergenciaSchema = new EntitySchema({
    name: "ContactoEmergencia",
    tableName: "contactoEmergencia",
    columns: {
        id: { type: "int", primary: true, generated: "increment" },
        nombreCompleto: { type: "varchar", length: 100, nullable: false },
        telefono: { type: "varchar", length: 15, nullable: false },
        idVinculo: { type: "int", nullable: false },
        idFichaBombero: { type: "int", nullable: false },
    },
    relations: {
        vinculo: {
            type: "many-to-one",
            target: "Vinculo",
            joinColumn: { name: "idVinculo", referencedColumnName: "id", onDelete: "RESTRICT" },
        },
        fichaBombero: {
            type: "many-to-one",
            target: "FichaBombero",
            joinColumn: { name: "idFichaBombero", referencedColumnName: "id", onDelete: "CASCADE" },
        }
    }
});
export default ContactoEmergenciaSchema;

