"use strict";
import { AppDataSource } from "../config/configDb.js";
import ContactoEmergencia from "../entities/contactoEmergencia.entity.js";


const getContactoEmergenciaService = async (id) => {
    try {

        //obtener los contactos de emergencia del usuario
        const contactoEmergenciaRepository = AppDataSource.getRepository(ContactoEmergencia);
        const contactoEmergencia = await contactoEmergenciaRepository.find({
            where: { usuario_id: id },
        });
        return contactoEmergencia;

    } catch (error) {
        throw new Error(`Error al obtener contacto de emergencia: ${error.message}`);
    }
}

const createContactoEmergenciaService = async (data) => {
    try {
        const contactoEmergenciaRepository = AppDataSource.getRepository(ContactoEmergencia);
        const newContactoEmergencia = contactoEmergenciaRepository.create(data);
        await contactoEmergenciaRepository.save(newContactoEmergencia);
        return newContactoEmergencia;
    } catch (error) {
        throw new Error(`Error al crear contacto de emergencia: ${error.message}`);
    }
}

const deleteContactoEmergenciaService = async (id) => {
    try {
        const contactoEmergenciaRepository = AppDataSource.getRepository(ContactoEmergencia);
        const contactoEmergencia = await contactoEmergenciaRepository.findOneBy({ id: id });
        if (!contactoEmergencia) {
            throw new Error("Contacto de emergencia no encontrado");
        }
        await contactoEmergenciaRepository.remove(contactoEmergencia);
        return;
    } catch (error) {
        throw new Error(`Error al eliminar contacto de emergencia: ${error.message}`);
    }
}

const updateContactoEmergenciaService = async (id, data) => {
    try {
        const contactoEmergenciaRepository = AppDataSource.getRepository(ContactoEmergencia);
        let contactoEmergencia = await contactoEmergenciaRepository.findOneBy({ id: id });
        if (!contactoEmergencia) {
            throw new Error("Contacto de emergencia no encontrado");
        }
        contactoEmergenciaRepository.merge(contactoEmergencia, data);
        const updatedContactoEmergencia = await contactoEmergenciaRepository.save(contactoEmergencia);
        return updatedContactoEmergencia;
    } catch (error) {
        throw new Error(`Error al actualizar contacto de emergencia: ${error.message}`);
    }
}


export {
    getContactoEmergenciaService,
    createContactoEmergenciaService,
    deleteContactoEmergenciaService,
    updateContactoEmergenciaService
};