"use strict";
import { EntitySchema } from "typeorm";

const EstadoCivilSchema = new EntitySchema({
    name: "EstadoCivil",
    tableName: "estadoCivil",
    columns: {
        id: { type: "int", primary: true, generated: true },
        nombre: { type: "varchar", length: 50, unique: true },
    },
    relations: {
        afectados: {
            type: "one-to-many",
            target: "Afectado",
            inverseSide: "estadoCivil",
        },
    },
});
export default EstadoCivilSchema;