"use strict";
import { EntitySchema } from "typeorm";

const EstadoCivilSchema = new EntitySchema({
    name: "EstadoCivil",
    tableName: "estadoCivil",
    columns: {
        id: {type: "int", primary: true, generated: true},
        nombre: {type: "varchar", length: 100},
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