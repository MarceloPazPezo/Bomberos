"use strict";
import { EntitySchema } from "typeorm";

const TipoSangreSchema = new EntitySchema({
    name: "TipoSangre",
    tableName: "tipo_sangre",
    columns: {
        id: { type: "int", primary: true, generated: "increment" },
        nombre: { type: "varchar", length: 4, nullable: false, unique: true },
    },
    relations: {
        fichas: {
            type: "one-to-many",
            target: "FichaBombero",
            inverseSide: "tipoSangre",
            cascade: false,
        },
    },
});

export default TipoSangreSchema;
