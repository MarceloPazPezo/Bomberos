import { EntitySchema } from "typeorm";

const EstadoEstablecidoSchema = new EntitySchema({
    name: "EstadoEstablecido",
    tableName: "estadoEstablecido",
    columns: {
        id: {
            primary: true,
            type: "int",
            generated: true,
        },
        fechaHora: {
            type: "timestamp",
            default: () => "CURRENT_TIMESTAMP",
        },
        comentario: {
            type: "text",
            nullable: true,
        },
        idEstado: {
            type: "int",
            nullable: false,
        },
        idIncidente: {
            type: "int",
            nullable: false,
        },
        idBombero: {
            type: "int",
            nullable: true,
        },
    },
    relations: {
        estado: {
            type: "many-to-one",
            target: "EstadoReporte",
            joinColumn: { name: "idEstado", referencedColumnName: "id" },
            eager: true,
            onDelete: "RESTRICT",
            nullable: false,
        },
        incidente: {
            type: "many-to-one",
            target: "Incidente",
            joinColumn: { name: "idIncidente", referencedColumnName: "id" },
            onDelete: "CASCADE",
            nullable: false,
        },
        bombero: {
            type: "many-to-one",
            target: "Bombero",
            joinColumn: { name: "idBombero", referencedColumnName: "id" },
            onDelete: "SET NULL",
            nullable: true,
        },
    },
});

export default EstadoEstablecidoSchema;