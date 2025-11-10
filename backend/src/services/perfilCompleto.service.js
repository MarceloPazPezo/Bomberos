"use strict";
import { AppDataSource } from "../config/configDb.js";
import minioService from "./minio.service.js";
import { BUCKETS } from "../config/configMinIO.js";
import { createDireccionService, updateDireccionService } from "./direccion.service.js";
import logger from "../config/configLogger.js";

/**
 * Crea una ficha básica para un bombero si no la tiene
 * @param {number} idBombero - ID del bombero
 * @returns {Promise<Array>} [ficha, error]
 */
export async function ensureFichaBomberoService(idBombero) {
  try {
    const bomberoRepository = AppDataSource.getRepository("Bombero");
    const fichaRepository = AppDataSource.getRepository("FichaBombero");
    const companiaRepository = AppDataSource.getRepository("Compania");

    // Verificar si el bombero ya tiene ficha
    const bombero = await bomberoRepository.findOne({
      where: { id: idBombero },
      relations: ["fichaBombero", "fichaBombero.compania"]
    });

    if (!bombero) {
      return [null, "Bombero no encontrado"];
    }

    // Si ya tiene ficha, devolverla
    if (bombero.fichaBombero) {
      return [bombero.fichaBombero, null];
    }

    // Obtener la compañía del bombero
    let compania = null;
    if (bombero.fichaBombero?.compania) {
      compania = bombero.fichaBombero.compania;
    } else {
      // Buscar la primera compañía disponible como fallback
      compania = await companiaRepository.findOne({
        where: {},
        order: { id: 'ASC' }
      });
    }

    if (!compania) {
      return [null, "No se pudo determinar la compañía del bombero"];
    }

    // Crear ficha básica
    const ficha = fichaRepository.create({
      idBombero: idBombero,
      idCompania: compania.id,
      nombre: `${bombero.nombres?.join(' ') || ''} ${bombero.apellidos?.join(' ') || ''}`.trim() || 'Sin nombre',
      creadoEl: new Date(),
      actualizadoEl: new Date()
    });

    const savedFicha = await fichaRepository.save(ficha);

    // Actualizar la relación en el bombero
    await bomberoRepository.update(idBombero, {
      fichaBombero: savedFicha
    });

    return [savedFicha, null];
  } catch (error) {
    logger.error("ensureFichaBomberoService - Error:", error);
    return [null, "Error interno del servidor"];
  }
}

/**
 * Actualiza la información personal del bombero
 * @param {number} idBombero - ID del bombero
 * @param {Object} data - Datos a actualizar
 * @returns {Promise<Array>} [datos, error]
 */
export async function updateInformacionPersonalService(idBombero, data) {
  // Usar transacción para operaciones múltiples
  return await AppDataSource.transaction(async (manager) => {
    try {
      const bomberoRepository = manager.getRepository("Bombero");
      const fichaRepository = manager.getRepository("FichaBombero");
      const files = data.files;

      logger.info('updateInformacionPersonalService - Datos recibidos:', {
        data: Object.keys(data),
        files: files ? Object.keys(files) : 'No files'
      });

      // Asegurar que el bombero tenga ficha (crear si no existe)
      const [ficha, fichaError] = await ensureFichaBomberoService(idBombero);
      if (fichaError) {
        return [null, fichaError];
      }

      // Preparar datos de actualización para la ficha
      const fichaUpdateData = {
        actualizadoEl: new Date()
      };

      // Manejar archivos si están presentes
      if (files) {
        // Manejar imagen de perfil
        if (files.profileImage && files.profileImage.length > 0) {
          const profileImageFile = files.profileImage[0];

          // Obtener el RUN del bombero para usar en el nombre del archivo
          const bombero = await bomberoRepository.findOne({ where: { id: idBombero } });
          const runBombero = bombero?.run || `bombero_${idBombero}`;

          // ELIMINAR IMAGEN ANTERIOR si existe
          if (ficha.fotoPerfilKEY) {
            try {
              logger.info('Eliminando imagen anterior:', {
                bucket: BUCKETS.PROFILES,
                fileName: ficha.fotoPerfilKEY
              });

              await minioService.deleteFile(BUCKETS.PROFILES, ficha.fotoPerfilKEY);
              logger.info('Imagen anterior eliminada exitosamente');
            } catch (error) {
              // No fallar si no se puede eliminar la imagen anterior
              logger.warn('Advertencia: No se pudo eliminar la imagen anterior:', error.message);
            }
          }

          const fileName = minioService.generateUniqueFileName(profileImageFile.originalname, runBombero);

          logger.info('Intentando subir nueva imagen:', {
            bucket: BUCKETS.PROFILES,
            fileName,
            runBombero,
            fileSize: profileImageFile.buffer.length,
            mimeType: profileImageFile.mimetype
          });

          try {
            const uploadResult = await minioService.uploadFile(
              BUCKETS.PROFILES,
              fileName,
              profileImageFile.buffer,
              profileImageFile.mimetype,
              {
                'bombero-id': idBombero.toString(),
                'file-type': 'profile-image'
              }
            );

            // Solo guardar el KEY, no la URL firmada (que expira)
            // La URL se generará bajo demanda cuando se necesite
            fichaUpdateData.fotoPerfilKEY = fileName;

            logger.info('Nueva imagen de perfil subida exitosamente:', uploadResult);
          } catch (error) {
            logger.error('Error subiendo nueva imagen de perfil:', error);
            return [null, "Error subiendo imagen de perfil"];
          }
        }

        // Manejar documentos de licencia
        if (files.licenseDocuments && files.licenseDocuments.length > 0) {
          // Por ahora solo logueamos los documentos, no los guardamos en la BD
          logger.info('Documentos de licencia recibidos:', files.licenseDocuments.length);
          // TODO: Implementar guardado de documentos de licencia si es necesario
        }
      }

      // Solo actualizar campos que están presentes en los datos
      if (data.email !== undefined) {
        // Actualizar email en la tabla Bombero
        await bomberoRepository.update(idBombero, {
          email: data.email,
          actualizadoEl: new Date()
        });
      }

      if (data.telefono !== undefined) {
        fichaUpdateData.telefono = data.telefono;
      }

      if (data.licenciaClaseF !== undefined) {
        fichaUpdateData.licenciaClaseF = data.licenciaClaseF;
      }

      if (data.donante !== undefined) {
        fichaUpdateData.donante = data.donante;
      }

      if (data.idTipoSangre !== undefined) {
        fichaUpdateData.idTipoSangre = data.idTipoSangre;
      }

      // Manejar dirección si está presente
      if (data.direccion !== undefined) {
        logger.info('🏠 updateInformacionPersonalService - Procesando dirección:', data.direccion);
        const direccionData = data.direccion;

        // Verificar si ya existe una dirección para este bombero
        const direccionExistente = ficha.idDireccion
          ? await manager.getRepository("Direccion").findOne({
            where: { id: ficha.idDireccion }
          }) : null;

        logger.info('🏠 updateInformacionPersonalService - Dirección existente:', direccionExistente);

        if (direccionExistente) {
          // Actualizar dirección existente
          logger.info('🏠 updateInformacionPersonalService - Actualizando dirección existente');
          logger.info('🏠 updateInformacionPersonalService - Datos de dirección a actualizar:', {
            id: direccionExistente.id,
            calle: direccionData.calle,
            numero: direccionData.numero,
            idComuna: direccionData.idComuna,
            latitud: direccionData.latitud,
            longitud: direccionData.longitud,
            tieneCoordenadas: !!(direccionData.latitud && direccionData.longitud)
          });
          const [direccionActualizada, errorDireccion] = await updateDireccionService(
            direccionExistente.id,
            direccionData
          );

          if (errorDireccion) {
            logger.error('🏠 updateInformacionPersonalService - Error al actualizar dirección:', errorDireccion);
            return [null, `Error al actualizar dirección: ${errorDireccion}`];
          }
          logger.info('🏠 updateInformacionPersonalService - Dirección actualizada exitosamente');
          logger.info('🏠 updateInformacionPersonalService - Dirección actualizada con coordenadas:', {
            latitud: direccionActualizada?.latitud,
            longitud: direccionActualizada?.longitud
          });
        } else {
          // Crear nueva dirección
          logger.info('🏠 updateInformacionPersonalService - Creando nueva dirección');
          const [nuevaDireccion, errorDireccion] = await createDireccionService(direccionData);

          if (errorDireccion) {
            logger.error('🏠 updateInformacionPersonalService - Error al crear dirección:', errorDireccion);
            return [null, `Error al crear dirección: ${errorDireccion}`];
          }
          logger.info('🏠 updateInformacionPersonalService - Dirección creada exitosamente:', nuevaDireccion);

          // Actualizar la ficha del bombero con el idDireccion
          fichaUpdateData.idDireccion = nuevaDireccion.id;
          logger.info('🏠 updateInformacionPersonalService - Actualizando ficha con idDireccion:', nuevaDireccion.id);
        }
      }

      if (data.fotoPerfilURL !== undefined) {
        fichaUpdateData.fotoPerfilURL = data.fotoPerfilURL;
      }

      if (data.fotoPerfilKEY !== undefined) {
        fichaUpdateData.fotoPerfilKEY = data.fotoPerfilKEY;
      }

      // Actualizar ficha solo si hay datos que actualizar
      if (Object.keys(fichaUpdateData).length > 1) { // Más de 1 porque siempre incluye actualizadoEl
        await fichaRepository.update(ficha.id, fichaUpdateData);
      }

      return [true, null];
    } catch (error) {
      logger.error("updateInformacionPersonalService - Error:", error);
      // El rollback se hace automáticamente por la transacción
      throw error; // Re-lanzar para que la transacción haga rollback
    }
  });
}

/**
 * Obtiene la ficha de un bombero
 * @param {number} idBombero - ID del bombero
 * @returns {Promise<Array>} [ficha, error]
 */
export async function getFichaBomberoService(idBombero) {
  try {
    const fichaRepository = AppDataSource.getRepository("FichaBombero");
    const ficha = await fichaRepository.findOne({
      where: { idBombero }
    });

    return [ficha, null];
  } catch (error) {
    logger.error("getFichaBomberoService - Error:", error);
    return [null, "Error interno del servidor"];
  }
}

/**
 * Genera URL firmada para imagen de perfil
 * @param {string} fileName - Nombre del archivo
 * @returns {Promise<Array>} [url, error]
 */
export async function generateImagenPerfilUrlService(fileName) {
  try {
    const signedUrl = await minioService.getSignedUrl(BUCKETS.PROFILES, fileName);
    return [signedUrl, null];
  } catch (error) {
    logger.error("generateImagenPerfilUrlService - Error:", error);
    return [null, "Error generando URL de imagen"];
  }
}

/**
 * Agrega un contacto de emergencia
 * @param {number} idBombero - ID del bombero
 * @param {Object} contactoData - Datos del contacto
 * @returns {Promise<Array>} [contacto, error]
 */
export async function addContactoEmergenciaService(idBombero, contactoData) {
  try {
    const bomberoRepository = AppDataSource.getRepository("Bombero");
    const contactoRepository = AppDataSource.getRepository("ContactoEmergencia");
    const vinculoRepository = AppDataSource.getRepository("Vinculo");

    // Asegurar que el bombero tenga ficha (crear si no existe)
    const [ficha, fichaError] = await ensureFichaBomberoService(idBombero);
    if (fichaError) {
      return [null, fichaError];
    }

    // Obtener el bombero con su ficha
    const bombero = await bomberoRepository.findOne({
      where: { id: idBombero },
      relations: ["fichaBombero"]
    });

    // Buscar o crear vínculo
    let vinculo = await vinculoRepository.findOne({
      where: { nombre: contactoData.vinculo }
    });

    if (!vinculo) {
      vinculo = vinculoRepository.create({
        nombre: contactoData.vinculo
      });
      await vinculoRepository.save(vinculo);
    }

    // Crear contacto de emergencia
    const contacto = contactoRepository.create({
      nombreCompleto: contactoData.nombreCompleto,
      telefono: contactoData.telefono,
      idVinculo: vinculo.id,
      idFichaBombero: bombero.fichaBombero.id
    });

    const savedContacto = await contactoRepository.save(contacto);

    // Obtener el contacto completo con relaciones
    const contactoCompleto = await contactoRepository.findOne({
      where: { id: savedContacto.id },
      relations: ["vinculo"]
    });

    return [contactoCompleto, null];
  } catch (error) {
    logger.error("addContactoEmergenciaService - Error:", error);
    return [null, "Error interno del servidor"];
  }
}

/**
 * Actualiza un contacto de emergencia
 * @param {number} idContacto - ID del contacto
 * @param {Object} contactoData - Datos actualizados del contacto
 * @returns {Promise<Array>} [contacto, error]
 */
export async function updateContactoEmergenciaService(idContacto, contactoData) {
  try {
    const contactoRepository = AppDataSource.getRepository("ContactoEmergencia");
    const vinculoRepository = AppDataSource.getRepository("Vinculo");

    // Buscar o crear vínculo
    let vinculo = await vinculoRepository.findOne({
      where: { nombre: contactoData.vinculo }
    });

    if (!vinculo) {
      vinculo = vinculoRepository.create({
        nombre: contactoData.vinculo
      });
      await vinculoRepository.save(vinculo);
    }

    // Actualizar contacto
    await contactoRepository.update(idContacto, {
      nombreCompleto: contactoData.nombreCompleto,
      telefono: contactoData.telefono,
      idVinculo: vinculo.id
    });

    // Obtener el contacto actualizado
    const contactoActualizado = await contactoRepository.findOne({
      where: { id: idContacto },
      relations: ["vinculo"]
    });

    return [contactoActualizado, null];
  } catch (error) {
    logger.error("updateContactoEmergenciaService - Error:", error);
    return [null, "Error interno del servidor"];
  }
}

/**
 * Elimina un contacto de emergencia
 * @param {number} idContacto - ID del contacto
 * @returns {Promise<Array>} [success, error]
 */
export async function deleteContactoEmergenciaService(idContacto) {
  try {
    const contactoRepository = AppDataSource.getRepository("ContactoEmergencia");

    await contactoRepository.delete(idContacto);

    return [true, null];
  } catch (error) {
    logger.error("deleteContactoEmergenciaService - Error:", error);
    return [null, "Error interno del servidor"];
  }
}

/**
 * Agrega una capacitación
 * @param {number} idBombero - ID del bombero
 * @param {Object} capacitacionData - Datos de la capacitación
 * @returns {Promise<Array>} [capacitacion, error]
 */
export async function addCapacitacionService(idBombero, capacitacionData) {
  try {
    const bomberoRepository = AppDataSource.getRepository("Bombero");
    const capacitacionRepository = AppDataSource.getRepository("Capacitacion");
    const tipoCapacitacionRepository = AppDataSource.getRepository("TipoCapacitacion");

    // Asegurar que el bombero tenga ficha (crear si no existe)
    const [ficha, fichaError] = await ensureFichaBomberoService(idBombero);
    if (fichaError) {
      return [null, fichaError];
    }

    // Obtener el bombero con su ficha
    const bombero = await bomberoRepository.findOne({
      where: { id: idBombero },
      relations: ["fichaBombero"]
    });

    // Buscar o crear tipo de capacitación
    let tipoCapacitacion = await tipoCapacitacionRepository.findOne({
      where: { nombre: capacitacionData.tipoCapacitacion }
    });

    if (!tipoCapacitacion) {
      tipoCapacitacion = tipoCapacitacionRepository.create({
        nombre: capacitacionData.tipoCapacitacion,
        descripcion: capacitacionData.descripcionTipo || null
      });
      await tipoCapacitacionRepository.save(tipoCapacitacion);
    }

    // Crear capacitación
    const capacitacion = capacitacionRepository.create({
      idTipoCapacitacion: tipoCapacitacion.id,
      descripcion: capacitacionData.descripcion,
      idFichaBombero: bombero.fichaBombero.id,
      creadoEl: new Date(),
      actualizadoEl: new Date()
    });

    const savedCapacitacion = await capacitacionRepository.save(capacitacion);

    // Obtener la capacitación completa con relaciones
    const capacitacionCompleta = await capacitacionRepository.findOne({
      where: { id: savedCapacitacion.id },
      relations: ["tipoCapacitacion"]
    });

    return [capacitacionCompleta, null];
  } catch (error) {
    logger.error("addCapacitacionService - Error:", error);
    return [null, "Error interno del servidor"];
  }
}

/**
 * Actualiza una capacitación
 * @param {number} idCapacitacion - ID de la capacitación
 * @param {Object} capacitacionData - Datos actualizados de la capacitación
 * @returns {Promise<Array>} [capacitacion, error]
 */
export async function updateCapacitacionService(idCapacitacion, capacitacionData) {
  try {
    const capacitacionRepository = AppDataSource.getRepository("Capacitacion");
    const tipoCapacitacionRepository = AppDataSource.getRepository("TipoCapacitacion");

    // Buscar o crear tipo de capacitación
    let tipoCapacitacion = await tipoCapacitacionRepository.findOne({
      where: { nombre: capacitacionData.tipoCapacitacion }
    });

    if (!tipoCapacitacion) {
      tipoCapacitacion = tipoCapacitacionRepository.create({
        nombre: capacitacionData.tipoCapacitacion,
        descripcion: capacitacionData.descripcionTipo || null
      });
      await tipoCapacitacionRepository.save(tipoCapacitacion);
    }

    // Actualizar capacitación
    await capacitacionRepository.update(idCapacitacion, {
      idTipoCapacitacion: tipoCapacitacion.id,
      descripcion: capacitacionData.descripcion,
      actualizadoEl: new Date()
    });

    // Obtener la capacitación actualizada
    const capacitacionActualizada = await capacitacionRepository.findOne({
      where: { id: idCapacitacion },
      relations: ["tipoCapacitacion"]
    });

    return [capacitacionActualizada, null];
  } catch (error) {
    logger.error("updateCapacitacionService - Error:", error);
    return [null, "Error interno del servidor"];
  }
}

/**
 * Elimina una capacitación
 * @param {number} idCapacitacion - ID de la capacitación
 * @returns {Promise<Array>} [success, error]
 */
export async function deleteCapacitacionService(idCapacitacion) {
  try {
    const capacitacionRepository = AppDataSource.getRepository("Capacitacion");

    await capacitacionRepository.delete(idCapacitacion);

    return [true, null];
  } catch (error) {
    logger.error("deleteCapacitacionService - Error:", error);
    return [null, "Error interno del servidor"];
  }
}

/**
 * Limpia imágenes de perfil huérfanas en MinIO
 * Elimina archivos que ya no están referenciados en la base de datos
 * @returns {Promise<Array>} [resultado, error]
 */
export async function limpiarImagenesHuerfanasService() {
  try {
    const fichaRepository = AppDataSource.getRepository("FichaBombero");

    // Obtener todas las claves de imágenes de perfil que están en uso
    const fichasConImagen = await fichaRepository.find({
      where: { fotoPerfilKEY: { $ne: null } },
      select: ['fotoPerfilKEY']
    });

    const clavesEnUso = new Set(
      fichasConImagen
        .map(ficha => ficha.fotoPerfilKEY)
        .filter(key => key && key.trim() !== '')
    );

    logger.info(`[LIMPIEZA] Encontradas ${clavesEnUso.size} imágenes en uso en la BD`);

    // Obtener todas las imágenes en el bucket de perfiles
    const imagenesEnMinIO = await minioService.listFiles(BUCKETS.PROFILES);

    logger.info(`[LIMPIEZA] Encontradas ${imagenesEnMinIO.length} imágenes en MinIO`);

    // Identificar imágenes huérfanas
    const imagenesHuerfanas = imagenesEnMinIO.filter(imagen =>
      !clavesEnUso.has(imagen.name)
    );

    logger.info(`[LIMPIEZA] Encontradas ${imagenesHuerfanas.length} imágenes huérfanas`);

    // Eliminar imágenes huérfanas
    const resultados = {
      eliminadas: 0,
      errores: 0,
      detalles: []
    };

    for (const imagen of imagenesHuerfanas) {
      try {
        await minioService.deleteFile(BUCKETS.PROFILES, imagen.name);
        resultados.eliminadas++;
        resultados.detalles.push({
          archivo: imagen.name,
          estado: 'eliminado',
          tamaño: imagen.size
        });
        logger.info(`[LIMPIEZA] Eliminada imagen huérfana: ${imagen.name}`);
      } catch (error) {
        resultados.errores++;
        resultados.detalles.push({
          archivo: imagen.name,
          estado: 'error',
          error: error.message
        });
        logger.error(`[LIMPIEZA] Error eliminando ${imagen.name}:`, error.message);
      }
    }

    logger.info(`[LIMPIEZA] Proceso completado: ${resultados.eliminadas} eliminadas, ${resultados.errores} errores`);

    return [resultados, null];
  } catch (error) {
    logger.error("limpiarImagenesHuerfanasService - Error:", error);
    return [null, "Error interno del servidor"];
  }
}
