"use strict";
import { EntitySchema } from "typeorm";

const ComunaSchema = new EntitySchema({
    name: "Comuna",
    tableName: "comunas",
    columns: {
        id: {
            type: "int",
            primary: true,
            generated: "increment"
        },
        nombre: {
            type: "varchar",
            length: 100,
            nullable: false,
            unique: true,
        },
        idRegion: {
            type: "int",
            nullable: false,
            unique: false,
        }
    },
    indices: [
        { name: "IDX_COMUNA_ID", columns: ["id"] },
        { name: "IDX_COMUNA_ID_REGION", columns: ["idRegion"] },
    ],
    relations: {
        region: {
            type: "many-to-one",
            target: "Region",
            joinColumn: { name: "idRegion", referencedColumnName: "id", onDelete: "CASCADE" }
        },
        direcciones:{
            type: "one-to-many",
            target: "Direccion",
            inverseSide: "comuna",
            cascade: true
        }
    },
});
export default ComunaSchema;