"use strict";
import {
    handleSuccess,
    handleErrorClient,
    handleErrorServer,
} from "../handlers/responseHandlers.js";

//importan servicios de tablas paso 1
import { createParteEmergenciaService, updateParteEmergenciaService } from "../services/parteEmergencia.service.js";
import { createAfectadoService, updateAfectadoService } from "../services/afectado.service.js";
import { createInmuebleAfectadoService, updateInmuebleAfectadoService, getInmuebleAfectadoByIdParteService } from "../services/inmuebleAfectado.service.js";

//importan validaciones de tablas paso 1
import { validationBodycreateParteEmergencia } from "../validations/parteEmergencia.validation.js";
import { validationBodycreateAfectado } from "../validations/afectado.validation.js";
import { validationBodycreateInmuebleAfectado } from "../validations/inmuebleAfectado.validation.js";

export const paso1SaveParteEmergencia = async (req, res) => {
    try {
        let idParteEmergencia, idAfectado, idInmuebleAfectado;
        //jason con la data de 3 tablas: parteEmergencia, afectado, inmuebleAfectado
        const data = req.body;
        if (!data || Object.keys(data).length === 0) {
            return handleErrorClient(res, 400, "Datos incompletos para crear parte de emergencia");
        }
        //extraer datos parteEmergencia

        const dataparteEmergencia = data.parteEmergencia;

        //validacion de datos parteEmergencia
        const { errorParte } = validationBodycreateParteEmergencia.validate(dataparteEmergencia);
        if (errorParte) {
            return handleErrorClient(res, 400, `Error de validación: ${errorParte.details[0].message}`);
        }

        //crear parteEmergencia solo si NO existe (verificar por id)

        if (dataparteEmergencia.id == '' || dataparteEmergencia.id == null) {
            //crear parteEmergencia
            console.log("Creando parte de emergencia...")
            const newParteEmergencia = await createParteEmergenciaService(dataparteEmergencia);
            idParteEmergencia = newParteEmergencia.id;
        } else {
            //actualizar parteEmergencia
            console.log("Actualizando parte de emergencia...")
            const updatedParteEmergencia = await updateParteEmergenciaService(dataparteEmergencia.id, dataparteEmergencia);
            idParteEmergencia = updatedParteEmergencia.id;
        }


        //extraer datos afectado
        const dataAfectado = data.afectado;
        const { errorAfectado } = validationBodycreateAfectado.validate(dataAfectado);
        if (errorAfectado) {
            return handleErrorClient(res, 400, `Error de validación: ${errorAfectado.details[0].message}`);
        }


        //crear afectado solo si NO existe (verificar por id_parte en inmuebleAfectado) (explicacion del ¿por qué? en service)
        const inmuebleAfectadoExistente = await getInmuebleAfectadoByIdParteService(idParteEmergencia);
        console.log("Inmueble afectado existente:");


        if (inmuebleAfectadoExistente==null || inmuebleAfectadoExistente.afectado_id == '' || inmuebleAfectadoExistente.afectado_id == null) {
            //crear afectado
            console.log("Creando afectado...")
            //asignar id de parteEmergencia a afectado
            dataAfectado.parte_id = idParteEmergencia;

            const newAfectado = await createAfectadoService(dataAfectado);
            idAfectado = newAfectado.id;
        } else {
            console.log("Afectado ya existe, actualizando...")
            //actualizar afectado
            const updatedAfectado = await updateAfectadoService(inmuebleAfectadoExistente.afectado_id, dataAfectado);
            idAfectado = updatedAfectado.id;
        }

        //crear inmuebleAfectado
        const inmuebleAfectadoData = data.inmuebleAfectado;
        //validar inmuebleAfectadoData
        const { errorInmueble } = validationBodycreateInmuebleAfectado.validate(inmuebleAfectadoData);
        if (errorInmueble) {
            return handleErrorClient(res, 400, `Error de validación: ${errorInmueble.details[0].message}`);
        }
        //verificar si existe inmuebleAfectado por si trae un id
        if (inmuebleAfectadoData.id == '' || inmuebleAfectadoData.id == null) {
            //crear inmuebleAfectado
            console.log("Creando inmueble afectado...")
            //asignar id de parteEmergencia y afectado a inmuebleAfectado
            inmuebleAfectadoData.parte_id = idParteEmergencia;
            inmuebleAfectadoData.afectado_id = idAfectado;
            const newInmuebleAfectado = await createInmuebleAfectadoService(inmuebleAfectadoData);
            idInmuebleAfectado = newInmuebleAfectado.id;
        } else {
            //actualizar inmuebleAfectado
            console.log("Actualizando inmueble afectado...")
            const updatedInmuebleAfectado = await updateInmuebleAfectadoService(inmuebleAfectadoData.id, inmuebleAfectadoData);
            idInmuebleAfectado = updatedInmuebleAfectado.id;
        }

        console.log("Parte de emergencia, afectado e inmueble afectado procesados exitosamente");
        console.log("ID Parte de emergencia:", idParteEmergencia);
        console.log("ID Afectado:", idAfectado);
        console.log("ID Inmueble Afectado:", idInmuebleAfectado);


        handleSuccess(res, 201, "Parte de emergencia creado exitosamente", {
            parteEmergenciaId: idParteEmergencia,
            afectadoId: idAfectado,
            inmuebleAfectadoId: idInmuebleAfectado,
        });


    } catch (error) {
        handleErrorServer(res, 500, `Error al crear parte de emergencia: ${error.message}`);
    }

}



