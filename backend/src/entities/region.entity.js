"use strict";
import { EntitySchema } from "typeorm";

const RegionSchema = new EntitySchema({
    name: "Region",
    tableName: "regiones",
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
        }
    },
    indices: [
        { name: "IDX_REGION_NOMBRE", columns: ["nombre"], unique: true }
    ],
    relations: {
        comunas: {
            type: "one-to-many",
            target: "Comuna",
            inverseSide: "region",
            cascade: true
            
        },
    },
});
export default RegionSchema;