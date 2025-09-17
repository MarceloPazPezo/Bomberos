"use strict";
import { EntitySchema } from "typeorm";

const ACargoEppSchema = new EntitySchema({
    name: "ACargoEpp",
    tableName: "aCargoEpp",
    columns: {
        id: { type: "int", primary: true, generated: "increment" },
        idEpp: { type: "int", nullable: false },
        idFichaBombero: { type: "int", nullable: false },
        fechaAsignacion: { type: "date", nullable: false },
    },
    indices: [
        { name: "IDX_epp_ficha", columns: ["idEpp", "idFichaBombero"] },
    ],
    relations: {
        fichaBombero: {
            type: "many-to-one",
            target: "FichaBombero",
            joinColumn: { name: "idFichaBombero", referencedColumnName: "id", onDelete: "CASCADE" },
        },
        epp: {
            type: "many-to-one",
            target: "Epp",
            joinColumn: { name: "idEpp", referencedColumnName: "id", onDelete: "RESTRICT" },
        },
    },
});
export default ACargoEppSchema;
            
