"use strict";
import { 
  addCapacitacionService,
  addContactoEmergenciaService,
  deleteCapacitacionService,
  deleteContactoEmergenciaService,
  generateImagenPerfilUrlService,
  getFichaBomberoService,
  limpiarImagenesHuerfanasService,
  updateCapacitacionService,
  updateContactoEmergenciaService,
  updateInformacionPersonalService,
  updateEppAsignadoService
} from "../services/perfilCompleto.service.js";
import { handleErrorClient, handleErrorServer, handleSuccess } from "../handlers/responseHandlers.js";
import logger from "../config/configLogger.js";

/**
 * Actualiza la información personal del bombero
 * PATCH /api/perfil-completo/informacion-personal
 */
export async function updateInformacionPersonal(req, res) {
  try {
    const idBombero = req.bombero.id;
    const data = req.body;
    const files = req.files;
    
    logger.info('updateInformacionPersonal - Datos recibidos:', {
      body: data,
      files: files ? Object.keys(files) : 'No files'
    });
    
    // Validar que al menos un campo esté presente
    const camposPermitidos = ['email', 'telefono', 'licenciaClaseF', 'donante', 'idTipoSangre', 'fotoPerfilURL', 'fotoPerfilKEY', 'direccion'];
    const tieneCamposValidos = camposPermitidos.some(campo => data[campo] !== undefined) || (files && Object.keys(files).length > 0);
    
    if (!tieneCamposValidos) {
      return handleErrorClient(res, 400, "Debe proporcionar al menos un campo válido para actualizar");
    }

    // Validar email si se proporciona
    if (data.email && (!data.email.includes('@') || data.email.length < 5)) {
      return handleErrorClient(res, 400, "Email inválido");
    }

    // Validar teléfono si se proporciona
    if (data.telefono && (typeof data.telefono !== 'string' || data.telefono.length < 8)) {
      return handleErrorClient(res, 400, "Teléfono inválido");
    }

    // Preparar datos con archivos
    const updateData = {
      ...data,
      files: files
    };

    const [result, error] = await updateInformacionPersonalService(idBombero, updateData);
    
    if (error) {
      logger.error("updateInformacionPersonal - Error:", error);
      return handleErrorServer(res, 500, error);
    }

    logger.info("updateInformacionPersonal - Información actualizada exitosamente");
    return handleSuccess(res, 200, "Información personal actualizada exitosamente", result);
  } catch (error) {
    logger.error("updateInformacionPersonal - Error inesperado:", error);
    return handleErrorServer(res, 500, "Error interno del servidor");
  }
}

/**
 * Agrega un contacto de emergencia
 * POST /api/perfil-completo/contactos-emergencia
 */
export async function addContactoEmergencia(req, res) {
  try {
    const idBombero = req.bombero.id;
    const contactoData = req.body;
    
    logger.info(`addContactoEmergencia - Agregando contacto para bombero ${idBombero}`);
    
    // Validar datos requeridos
    if (!contactoData.nombreCompleto || !contactoData.telefono || !contactoData.vinculo) {
      return handleErrorClient(res, 400, "Nombre completo, teléfono y vínculo son obligatorios");
    }

    const [contacto, error] = await addContactoEmergenciaService(idBombero, contactoData);
    
    if (error) {
      logger.error("addContactoEmergencia - Error:", error);
      return handleErrorServer(res, 500, error);
    }

    logger.info("addContactoEmergencia - Contacto agregado exitosamente");
    return handleSuccess(res, 201, "Contacto de emergencia agregado exitosamente", contacto);
  } catch (error) {
    logger.error("addContactoEmergencia - Error inesperado:", error);
    return handleErrorServer(res, 500, "Error interno del servidor");
  }
}

/**
 * Actualiza un contacto de emergencia
 * PUT /api/perfil-completo/contactos-emergencia/:id
 */
export async function updateContactoEmergencia(req, res) {
  try {
    const { id } = req.params;
    const contactoData = req.body;
    
    if (!id || isNaN(parseInt(id))) {
      return handleErrorClient(res, 400, "ID de contacto inválido");
    }

    logger.info(`updateContactoEmergencia - Actualizando contacto ${id}`);

    // Validar datos requeridos
    if (!contactoData.nombreCompleto || !contactoData.telefono || !contactoData.vinculo) {
      return handleErrorClient(res, 400, "Nombre completo, teléfono y vínculo son obligatorios");
    }

    const [contacto, error] = await updateContactoEmergenciaService(parseInt(id), contactoData);
    
    if (error) {
      logger.error("updateContactoEmergencia - Error:", error);
      return handleErrorServer(res, 500, error);
    }

    logger.info("updateContactoEmergencia - Contacto actualizado exitosamente");
    return handleSuccess(res, 200, "Contacto de emergencia actualizado exitosamente", contacto);
  } catch (error) {
    logger.error("updateContactoEmergencia - Error inesperado:", error);
    return handleErrorServer(res, 500, "Error interno del servidor");
  }
}

/**
 * Elimina un contacto de emergencia
 * DELETE /api/perfil-completo/contactos-emergencia/:id
 */
export async function deleteContactoEmergencia(req, res) {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(parseInt(id))) {
      return handleErrorClient(res, 400, "ID de contacto inválido");
    }

    logger.info(`deleteContactoEmergencia - Eliminando contacto ${id}`);

    const [result, error] = await deleteContactoEmergenciaService(parseInt(id));
    
    if (error) {
      logger.error("deleteContactoEmergencia - Error:", error);
      return handleErrorServer(res, 500, error);
    }

    logger.info("deleteContactoEmergencia - Contacto eliminado exitosamente");
    return handleSuccess(res, 200, "Contacto de emergencia eliminado exitosamente", result);
  } catch (error) {
    logger.error("deleteContactoEmergencia - Error inesperado:", error);
    return handleErrorServer(res, 500, "Error interno del servidor");
  }
}

/**
 * Agrega una capacitación
 * POST /api/perfil-completo/capacitaciones
 */
export async function addCapacitacion(req, res) {
  try {
    const idBombero = req.bombero.id;
    const capacitacionData = req.body;
    
    logger.info(`addCapacitacion - Agregando capacitación para bombero ${idBombero}`);
    
    // Validar datos requeridos
    if (!capacitacionData.tipoCapacitacion) {
      return handleErrorClient(res, 400, "Tipo de capacitación es obligatorio");
    }

    const [capacitacion, error] = await addCapacitacionService(idBombero, capacitacionData);
    
    if (error) {
      logger.error("addCapacitacion - Error:", error);
      return handleErrorServer(res, 500, error);
    }

    logger.info("addCapacitacion - Capacitación agregada exitosamente");
    return handleSuccess(res, 201, "Capacitación agregada exitosamente", capacitacion);
  } catch (error) {
    logger.error("addCapacitacion - Error inesperado:", error);
    return handleErrorServer(res, 500, "Error interno del servidor");
  }
}

/**
 * Actualiza una capacitación
 * PUT /api/perfil-completo/capacitaciones/:id
 */
export async function updateCapacitacion(req, res) {
  try {
    const { id } = req.params;
    const capacitacionData = req.body;
    
    if (!id || isNaN(parseInt(id))) {
      return handleErrorClient(res, 400, "ID de capacitación inválido");
    }

    logger.info(`updateCapacitacion - Actualizando capacitación ${id}`);

    // Validar datos requeridos
    if (!capacitacionData.tipoCapacitacion) {
      return handleErrorClient(res, 400, "Tipo de capacitación es obligatorio");
    }

    const [capacitacion, error] = await updateCapacitacionService(parseInt(id), capacitacionData);
    
    if (error) {
      logger.error("updateCapacitacion - Error:", error);
      return handleErrorServer(res, 500, error);
    }

    logger.info("updateCapacitacion - Capacitación actualizada exitosamente");
    return handleSuccess(res, 200, "Capacitación actualizada exitosamente", capacitacion);
  } catch (error) {
    logger.error("updateCapacitacion - Error inesperado:", error);
    return handleErrorServer(res, 500, "Error interno del servidor");
  }
}

/**
 * Elimina una capacitación
 * DELETE /api/perfil-completo/capacitaciones/:id
 */
export async function deleteCapacitacion(req, res) {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(parseInt(id))) {
      return handleErrorClient(res, 400, "ID de capacitación inválido");
    }

    logger.info(`deleteCapacitacion - Eliminando capacitación ${id}`);

    const [result, error] = await deleteCapacitacionService(parseInt(id));
    
    if (error) {
      logger.error("deleteCapacitacion - Error:", error);
      return handleErrorServer(res, 500, error);
    }

    logger.info("deleteCapacitacion - Capacitación eliminada exitosamente");
    return handleSuccess(res, 200, "Capacitación eliminada exitosamente", result);
  } catch (error) {
    logger.error("deleteCapacitacion - Error inesperado:", error);
    return handleErrorServer(res, 500, "Error interno del servidor");
  }
}

/**
 * Genera URL firmada para imagen de perfil
 * GET /api/perfil-completo/imagen-perfil-url
 */
export async function getImagenPerfilUrl(req, res) {
  try {
    const idBombero = req.bombero.id;
    
    logger.info(`getImagenPerfilUrl - Generando URL para bombero ${idBombero}`);
    
    // Obtener el KEY de la imagen de perfil
    const [ficha, error] = await getFichaBomberoService(idBombero);
    if (error) {
      logger.error("getImagenPerfilUrl - Error obteniendo ficha:", error);
      return handleErrorServer(res, 500, error);
    }
    
    if (!ficha || !ficha.fotoPerfilKEY) {
      return handleErrorClient(res, 404, "No hay imagen de perfil");
    }
    
    // Generar URL firmada
    const [signedUrl, urlError] = await generateImagenPerfilUrlService(ficha.fotoPerfilKEY);
    if (urlError) {
      logger.error("getImagenPerfilUrl - Error generando URL:", urlError);
      return handleErrorServer(res, 500, urlError);
    }
    
    logger.info("getImagenPerfilUrl - URL generada exitosamente");
    return handleSuccess(res, 200, "URL de imagen generada exitosamente", { url: signedUrl });
  } catch (error) {
    logger.error("getImagenPerfilUrl - Error inesperado:", error);
    return handleErrorServer(res, 500, "Error interno del servidor");
  }
}

/**
 * Limpia imágenes de perfil huérfanas en MinIO
 * POST /api/perfil-completo/limpiar-imagenes-huerfanas
 */
export async function limpiarImagenesHuerfanas(req, res) {
  try {
    logger.info("limpiarImagenesHuerfanas - Iniciando limpieza");
    
    const [resultado, error] = await limpiarImagenesHuerfanasService();
    
    if (error) {
      logger.error("limpiarImagenesHuerfanas - Error:", error);
      return handleErrorServer(res, 500, error);
    }
    
    logger.info("limpiarImagenesHuerfanas - Limpieza completada");
    return handleSuccess(res, 200, "Limpieza de imágenes huérfanas completada", resultado);
  } catch (error) {
    logger.error("limpiarImagenesHuerfanas - Error inesperado:", error);
    return handleErrorServer(res, 500, "Error interno del servidor");
  }
}

/**
 * Actualiza un EPP asignado al bombero (solo estado y descripción)
 * PATCH /api/perfil-completo/epp/:idEpp
 */
export async function updateEppAsignado(req, res) {
  try {
    const idBombero = req.bombero.id;
    const { idEpp } = req.params;
    const eppData = req.body;
    
    logger.info(`updateEppAsignado - Bombero ${idBombero} actualizando EPP ${idEpp}:`, eppData);
    
    // Validar que al menos un campo esté presente
    if (!eppData.idEstadoEpp && eppData.descripcionDeEstado === undefined) {
      return handleErrorClient(res, 400, "Debe proporcionar al menos un campo para actualizar (idEstadoEpp o descripcionDeEstado)");
    }

    // Validar idEstadoEpp si se proporciona
    if (eppData.idEstadoEpp && (!Number.isInteger(Number(eppData.idEstadoEpp)) || eppData.idEstadoEpp < 1)) {
      return handleErrorClient(res, 400, "ID de estado de EPP inválido");
    }

    // Validar descripcionDeEstado si se proporciona
    if (eppData.descripcionDeEstado !== undefined && eppData.descripcionDeEstado !== null) {
      if (typeof eppData.descripcionDeEstado !== 'string') {
        return handleErrorClient(res, 400, "La descripción debe ser un texto");
      }
      if (eppData.descripcionDeEstado.length > 255) {
        return handleErrorClient(res, 400, "La descripción no puede exceder 255 caracteres");
      }
    }

    const [epp, error] = await updateEppAsignadoService(idBombero, Number(idEpp), eppData);
    
    if (error) {
      logger.error(`updateEppAsignado - Error: ${error}`);
      if (error.includes("no está asignado")) {
        return handleErrorClient(res, 403, error);
      }
      if (error.includes("no encontrado") || error.includes("no tiene ficha")) {
        return handleErrorClient(res, 404, error);
      }
      return handleErrorServer(res, 500, error);
    }
    
    logger.info(`updateEppAsignado - EPP ${idEpp} actualizado exitosamente`);
    return handleSuccess(res, 200, "EPP actualizado exitosamente", epp);
  } catch (error) {
    logger.error("updateEppAsignado - Error inesperado:", error);
    return handleErrorServer(res, 500, "Error interno del servidor");
  }
}
