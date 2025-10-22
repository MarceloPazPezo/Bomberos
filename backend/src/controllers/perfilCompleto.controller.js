"use strict";
import { PerfilCompletoService } from "../services/perfilCompleto.service.js";
import { handleSuccess, handleErrorClient, handleErrorServer } from "../handlers/responseHandlers.js";

/**
 * Controlador para manejar las APIs del perfil completo del bombero
 */
export class PerfilCompletoController {

  /**
   * Actualiza la información personal del bombero
   * PATCH /api/perfil-completo/informacion-personal
   */
  static async updateInformacionPersonal(req, res) {
    try {
      const idBombero = req.bombero.id;
      const data = req.body;
      const files = req.files;
      
      console.log('Controlador - Datos recibidos:', {
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

      const [result, error] = await PerfilCompletoService.updateInformacionPersonal(idBombero, updateData);
      
      if (error) {
        return handleErrorServer(res, 500, error);
      }

      return handleSuccess(res, 200, "Información personal actualizada exitosamente", result);
    } catch (error) {
      console.error("Error en updateInformacionPersonal:", error);
      return handleErrorServer(res, 500, "Error interno del servidor");
    }
  }

  /**
   * Agrega un contacto de emergencia
   * POST /api/perfil-completo/contactos-emergencia
   */
  static async addContactoEmergencia(req, res) {
    try {
      const idBombero = req.bombero.id;
      const contactoData = req.body;
      
      // Validar datos requeridos
      if (!contactoData.nombreCompleto || !contactoData.telefono || !contactoData.vinculo) {
        return handleErrorClient(res, 400, "Nombre completo, teléfono y vínculo son obligatorios");
      }

      const [contacto, error] = await PerfilCompletoService.addContactoEmergencia(idBombero, contactoData);
      
      if (error) {
        return handleErrorServer(res, 500, error);
      }

      return handleSuccess(res, 201, "Contacto de emergencia agregado exitosamente", contacto);
    } catch (error) {
      console.error("Error en addContactoEmergencia:", error);
      return handleErrorServer(res, 500, "Error interno del servidor");
    }
  }

  /**
   * Actualiza un contacto de emergencia
   * PUT /api/perfil-completo/contactos-emergencia/:id
   */
  static async updateContactoEmergencia(req, res) {
    try {
      const { id } = req.params;
      const contactoData = req.body;
      
      if (!id || isNaN(parseInt(id))) {
        return handleErrorClient(res, 400, "ID de contacto inválido");
      }

      // Validar datos requeridos
      if (!contactoData.nombreCompleto || !contactoData.telefono || !contactoData.vinculo) {
        return handleErrorClient(res, 400, "Nombre completo, teléfono y vínculo son obligatorios");
      }

      const [contacto, error] = await PerfilCompletoService.updateContactoEmergencia(parseInt(id), contactoData);
      
      if (error) {
        return handleErrorServer(res, 500, error);
      }

      return handleSuccess(res, 200, "Contacto de emergencia actualizado exitosamente", contacto);
    } catch (error) {
      console.error("Error en updateContactoEmergencia:", error);
      return handleErrorServer(res, 500, "Error interno del servidor");
    }
  }

  /**
   * Elimina un contacto de emergencia
   * DELETE /api/perfil-completo/contactos-emergencia/:id
   */
  static async deleteContactoEmergencia(req, res) {
    try {
      const { id } = req.params;
      
      if (!id || isNaN(parseInt(id))) {
        return handleErrorClient(res, 400, "ID de contacto inválido");
      }

      const [result, error] = await PerfilCompletoService.deleteContactoEmergencia(parseInt(id));
      
      if (error) {
        return handleErrorServer(res, 500, error);
      }

      return handleSuccess(res, 200, "Contacto de emergencia eliminado exitosamente", result);
    } catch (error) {
      console.error("Error en deleteContactoEmergencia:", error);
      return handleErrorServer(res, 500, "Error interno del servidor");
    }
  }

  /**
   * Agrega una capacitación
   * POST /api/perfil-completo/capacitaciones
   */
  static async addCapacitacion(req, res) {
    try {
      const idBombero = req.bombero.id;
      const capacitacionData = req.body;
      
      // Validar datos requeridos
      if (!capacitacionData.tipoCapacitacion) {
        return handleErrorClient(res, 400, "Tipo de capacitación es obligatorio");
      }

      const [capacitacion, error] = await PerfilCompletoService.addCapacitacion(idBombero, capacitacionData);
      
      if (error) {
        return handleErrorServer(res, 500, error);
      }

      return handleSuccess(res, 201, "Capacitación agregada exitosamente", capacitacion);
    } catch (error) {
      console.error("Error en addCapacitacion:", error);
      return handleErrorServer(res, 500, "Error interno del servidor");
    }
  }

  /**
   * Actualiza una capacitación
   * PUT /api/perfil-completo/capacitaciones/:id
   */
  static async updateCapacitacion(req, res) {
    try {
      const { id } = req.params;
      const capacitacionData = req.body;
      
      if (!id || isNaN(parseInt(id))) {
        return handleErrorClient(res, 400, "ID de capacitación inválido");
      }

      // Validar datos requeridos
      if (!capacitacionData.tipoCapacitacion) {
        return handleErrorClient(res, 400, "Tipo de capacitación es obligatorio");
      }

      const [capacitacion, error] = await PerfilCompletoService.updateCapacitacion(parseInt(id), capacitacionData);
      
      if (error) {
        return handleErrorServer(res, 500, error);
      }

      return handleSuccess(res, 200, "Capacitación actualizada exitosamente", capacitacion);
    } catch (error) {
      console.error("Error en updateCapacitacion:", error);
      return handleErrorServer(res, 500, "Error interno del servidor");
    }
  }

  /**
   * Elimina una capacitación
   * DELETE /api/perfil-completo/capacitaciones/:id
   */
  static async deleteCapacitacion(req, res) {
    try {
      const { id } = req.params;
      
      if (!id || isNaN(parseInt(id))) {
        return handleErrorClient(res, 400, "ID de capacitación inválido");
      }

      const [result, error] = await PerfilCompletoService.deleteCapacitacion(parseInt(id));
      
      if (error) {
        return handleErrorServer(res, 500, error);
      }

      return handleSuccess(res, 200, "Capacitación eliminada exitosamente", result);
    } catch (error) {
      console.error("Error en deleteCapacitacion:", error);
      return handleErrorServer(res, 500, "Error interno del servidor");
    }
  }

  /**
   * Genera URL firmada para imagen de perfil
   * GET /api/perfil-completo/imagen-perfil-url
   */
  static async getImagenPerfilUrl(req, res) {
    try {
      const idBombero = req.bombero.id;
      
      // Obtener el KEY de la imagen de perfil
      const [ficha, error] = await PerfilCompletoService.getFichaBombero(idBombero);
      if (error) {
        return handleErrorServer(res, 500, error);
      }
      
      if (!ficha || !ficha.fotoPerfilKEY) {
        return handleErrorClient(res, 404, "No hay imagen de perfil");
      }
      
      // Generar URL firmada
      const [signedUrl, urlError] = await PerfilCompletoService.generateImagenPerfilUrl(ficha.fotoPerfilKEY);
      if (urlError) {
        return handleErrorServer(res, 500, urlError);
      }
      
      return handleSuccess(res, 200, "URL de imagen generada exitosamente", { url: signedUrl });
    } catch (error) {
      console.error("Error en getImagenPerfilUrl:", error);
      return handleErrorServer(res, 500, "Error interno del servidor");
    }
  }

  /**
   * Limpia imágenes de perfil huérfanas en MinIO
   * POST /api/perfil-completo/limpiar-imagenes-huerfanas
   */
  static async limpiarImagenesHuerfanas(req, res) {
    try {
      const [resultado, error] = await PerfilCompletoService.limpiarImagenesHuerfanas();
      
      if (error) {
        return handleErrorServer(res, 500, error);
      }
      
      return handleSuccess(res, 200, "Limpieza de imágenes huérfanas completada", resultado);
    } catch (error) {
      console.error("Error en limpiarImagenesHuerfanas:", error);
      return handleErrorServer(res, 500, "Error interno del servidor");
    }
  }
}

export default PerfilCompletoController;
