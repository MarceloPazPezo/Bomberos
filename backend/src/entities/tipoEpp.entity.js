"use strict";
import { EntitySchema } from "typeorm";

const TipoEppSchema = new EntitySchema({
    name: "TipoEpp",
    tableName: "tipoEpp",
    columns: {
        id: { type: "int", primary: true, generated: "increment" },
        nombre: { type: "varchar", length: 50, nullable: false, unique: true },
    },
    relations: {
        epps: {
            type: "one-to-many",
            target: "Epp",
            inverseSide: "tipoEpp",
        },
    },
});
export default TipoEppSchema;