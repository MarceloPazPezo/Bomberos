"use strict";
import { EntitySchema } from "typeorm";

const AfectadoSchema = new EntitySchema({
    name: "Afectado",
    tableName: "afectado",
    columns: {
        id: {type: "int", primary: true, generated: true},
        nombreCompleto: {type: "varchar", length: 200},
        run: {type: "varchar", length: 20, nullable: true},
        telefono: {type: "varchar", length: 20, nullable: true},
        edad: {type: "int", nullable: true},
        descripcionGravedad: {type: "varchar", length: 500, nullable: true},
        esEmpresa: {type: "boolean", default: false},
        idIncidente: {type: "int", nullable: true},
        idDireccion: {type: "int", nullable: true},
        idEstadoCivil: {type: "int", nullable: true},
    },
    relations: {
        incidente: {
            type: "many-to-one",
            target: "Incidente",
            joinColumn: {name: "idIncidente", referencedColumnName: "id"},
            eager: true,
            onDelete: "CASCADE",
        },
        direccion: {
            type: "many-to-one",
            target: "Direccion",
            joinColumn: {name: "idDireccion", referencedColumnName: "id"},
            onDelete: "SET NULL",
        },
        estadoCivil: {
            type: "many-to-one",
            target: "EstadoCivil",
            joinColumn: {name: "idEstadoCivil", referencedColumnName: "id"},
            onDelete: "SET NULL",
        },
        propietarioInmuebles: {
            type: "one-to-many",
            target: "Inmueble",
            inverseSide: "propietario",
            cascade: true,
        },
        habitaInmuebles: {
            type: "one-to-many",
            target: "Habita",
            inverseSide: "afectado",
            cascade: true,
        },
        conduce: {
            type: "one-to-many",
            target: "Vehiculo",
            inverseSide: "conductor",
            cascade: true,
        },
        posee: {
            type: "one-to-many",
            target: "Vehiculo",
            inverseSide: "dueno",
            cascade: true,
        },
        pasajeros: {
            type: "one-to-many",
            target: "Pasajero",
            inverseSide: "afectado",
            cascade: true,
        },
    },
});
export default AfectadoSchema;  

