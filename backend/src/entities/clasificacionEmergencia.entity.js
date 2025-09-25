"use strict";
import { EntitySchema } from "typeorm";

const ClasificacionEmergenciaSchema = new EntitySchema({
  name: "ClasificacionEmergencia",
  tableName: "clasificacionEmergencia",
    columns: {
    id: {
        type: "int",
        primary: true,
        generated: "increment",
    },
    nombre: {
        type: "varchar",
        length: 100,
        nullable: false,
        unique: true,
    },
},
    indices: [
        { name: "IDX_CLASIFICACION_NOMBRE", columns: ["nombre"] }
    ],
    relations: {
        tiposEmergencia: {
            type: "one-to-many",
            target: "SubtipoIncidente",
            inverseSide: "clasificacionEmergencia",
            cascade: true,
        },
    },
});



export default ClasificacionEmergenciaSchema;