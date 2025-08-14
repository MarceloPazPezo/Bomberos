"use strict";

import {
    handleSuccess,
    handleErrorClient,
    handleErrorServer,
} from "../handlers/responseHandlers.js";
import { idValidation } from "../validations/generico.validation.js";
import {validationCreateContactoEmergenciaBody, validationUpdateContactoEmergenciaBody} from "../validations/contactoEmergencia.validation.js";
import { getContactoEmergenciaService,
        createContactoEmergenciaService,
        deleteContactoEmergenciaService,
        updateContactoEmergenciaService,
 } from "../services/contactoEmergencia.service.js";

const getContactoEmergencia = async (req, res) => {
    try {
        const { id } = req.params;
        const { error } = idValidation.validate(id);
        if (error) {
            return handleErrorClient(res, 400, error.message);
        }

        const contactoEmergencia = await getContactoEmergenciaService(parseInt(id));
        if (!contactoEmergencia) {
            return handleSuccess(res, 200, "Usuario no registra contacto de emergencia", null);
        }
        handleSuccess(res, 200, "Contacto de emergencia obtenido correctamente", contactoEmergencia);

    } catch (error) {
        console.error("Error en getContactoEmergencia:", error);
        handleErrorServer(res, 500, error.message);
    }

}

const createContactoEmergencia = async (req, res) => {
    try {
        const data = req.body;
        // Remove empty fields from body: "", '', null, or undefined (also trims whitespace-only strings)
        if (data && typeof data === "object" && !Array.isArray(data)) {
            for (const [key, value] of Object.entries(data)) {
                if (value == null) {
                    delete data[key];
                } else if (typeof value === "string" && value.trim() === "") {
                    delete data[key];
                }
            }
        }

        const { error } = validationCreateContactoEmergenciaBody.validate(data);
        if (error) {
            console.error("Error en createContactoEmergencia:", error);
            return handleErrorClient(res, 400, error.message);
        }
        const newContactoEmergencia = await createContactoEmergenciaService(data);
        handleSuccess(res, 201, "Contacto de emergencia creado correctamente", newContactoEmergencia);
    } catch (error) {
        console.error("Error en createContactoEmergencia:", error);
        handleErrorServer(res, 500, error.message);
    }   
}

const deleteContactoEmergencia = async (req, res) => {
    try {
        const { id } = req.params;
        const { error } = idValidation.validate(id);
        if (error) {
        return handleErrorClient(res, 400, error.message);
        }
    
        await deleteContactoEmergenciaService(parseInt(id));
    
        handleSuccess(res, 200, "Contacto de emergencia eliminado correctamente");
    } catch (error) {
        console.error("Error en deleteContactoEmergencia:", error);
        handleErrorServer(res, 500, error.message);
    }
}

const updateContactoEmergencia = async (req, res) => {
    try {
        const { id } = req.params;
        const { error2 } = idValidation.validate(id);
        if (error2) {
            return handleErrorClient(res, 400, error2.message);
        }
         const data = req.body;
        const { error } = validationUpdateContactoEmergenciaBody.validate(data);
        if (error) {
            console.error("Error en createContactoEmergencia:", error);
            return handleErrorClient(res, 400, error.message);
        }

        const updatedContactoEmergencia = await updateContactoEmergenciaService(parseInt(id), data);
        handleSuccess(res, 200, "Contacto de emergencia actualizado correctamente", updatedContactoEmergencia);

    } catch (error) {
        console.error("Error en updateContactoEmergencia:", error);
        handleErrorServer(res, 500, error.message);
    }
}

export {
    getContactoEmergencia,
    createContactoEmergencia,
    deleteContactoEmergencia,
    updateContactoEmergencia,
};