"use strict";
import { EntitySchema } from "typeorm";

const ClaveRadialSchema = new EntitySchema({
    name: "ClaveRadial",
    tableName: "claveRadial",
    columns: {
        id: { type: "int", primary: true, generated: "increment" },
        nombre: { type: "varchar", length: 50, nullable: false, unique: true },
    },
    relations: {
        subtiposIncidente: {
            type: "one-to-many",
            target: "SubtipoIncidente",
            inverseSide: "claveRadial",
        },
    },
});
export default ClaveRadialSchema;

