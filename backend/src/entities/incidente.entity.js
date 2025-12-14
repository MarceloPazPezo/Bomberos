"use strict";
import { EntitySchema } from "typeorm";

const IncidenteSchema = new EntitySchema({
    name: "Incidente",
    tableName: "incidente",
    columns: {
        id: { type: "int", primary: true, generated: "increment" },
        descripcionPreliminar: { type: "varchar", length: 500, nullable: true },

        FechaHoraDespacho: { type: "timestamp", nullable: true },
        HoraOperativo6_0: { type: "time", nullable: true },
        HoraOperativo6_3: { type: "time", nullable: true },
        HoraOperativo6_9: { type: "time", nullable: true },
        HoraOperativo6_10: { type: "time", nullable: true },

        idBomberoACargo: { type: "int", nullable: true },
        idDireccion: { type: "int", nullable: true },
        idRedactor: { type: "int", nullable: true },
        idSubtipoIncidente: { type: "int", nullable: true },
        idCompania: { type: "int", nullable: true },

        creadoEl: { type: "timestamp", createDate: true },
        creadoPor: { type: "int", nullable: true },
        actualizadoEl: { type: "timestamp", updateDate: true, },
        actualizadoPor: { type: "int", nullable: true, },
    },

    relations: {
        creadopor: {
            type: "many-to-one",
            target: "Bombero",
            joinColumn: { name: "creadoPor", referencedColumnName: "id" },
        },
        actualizadopor: {
            type: "many-to-one",
            target: "Bombero",
            joinColumn: { name: "actualizadoPor", referencedColumnName: "id" },
        },
        bomberoACargo: {
            type: "many-to-one",
            target: "Bombero",
            joinColumn: { name: "idBomberoACargo", referencedColumnName: "id" },
            onDelete: "RESTRICT",
        },
        direccion: {
            type: "many-to-one",
            target: "Direccion",
            joinColumn: { name: "idDireccion", referencedColumnName: "id" },
            onDelete: "RESTRICT",
        },
        redactor: {
            type: "many-to-one",
            target: "Bombero",
            joinColumn: { name: "idRedactor", referencedColumnName: "id" },
            onDelete: "RESTRICT",
        },
        subtipo: {
            type: "many-to-one",
            target: "SubtipoIncidente",
            joinColumn: { name: "idSubtipoIncidente", referencedColumnName: "id" },
            onDelete: "RESTRICT",
        },

        asistenciaIncidentes: {
            type: "one-to-many",
            target: "AsistenciaIncidente",
            inverseSide: "incidente",
            cascade: true,

        },
        bomberoAccidentados: {
            type: "one-to-many",
            target: "BomberoAccidentado",
            inverseSide: "incidente",
            cascade: true,
        },
        EstadoEstablecido: {
            type: "one-to-many",
            target: "EstadoEstablecido",
            inverseSide: "incidente",
            cascade: true,
        },
        otroServicio: {
            type: "one-to-many",
            target: "AcudeServicio",
            inverseSide: "incidente",
            cascade: true,
        },
        faseYDano: {
            type: "one-to-many",
            target: "FaseYDano",
            inverseSide: "incidente",
            cascade: true,
        },
        carrodespachado: {
            type: "one-to-many",
            target: "EsDespachado",
            inverseSide: "incidente",
            cascade: true,
        },
        inmuebleAfectado: {
            type: "one-to-many",
            target: "Inmueble",
            inverseSide: "incidente",
            cascade: true,
        },
        afectados: {
            type: "one-to-many",
            target: "Afectado",
            inverseSide: "incidente",
            cascade: true,
        },
        vehiculos: {
            type: "one-to-many",
            target: "Vehiculo",
            inverseSide: "incidente",
            cascade: true,
        },
        compania: {
            type: "many-to-one",
            target: "Compania",
            joinColumn: { name: "idCompania", referencedColumnName: "id" },
            onDelete: "RESTRICT",
        },



    }
});
export default IncidenteSchema;

