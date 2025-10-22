"use strict";
import { AppDataSource } from '../config/configDb.js';
import {
  // Servicios básicos
  getBomberoService,
  getBomberosService,
  updateBomberoService,
  deleteBomberoService,
  createBomberoService,
  changeBomberoStatusService,
  getBomberosConLicenciasService,
  getBomberosPorCompaniaService,
  
  // Servicios de compañía
  getBomberosByCompaniaService,
  getCompaniaUsuarioService,
  getEstadisticasBomberosCompaniaService,
  getBomberosOtrasCompaniasService,
  
  // Servicios unificados
  createBomberoWithOptionalFichaService,
  getBomberoCompleteService,
  getAllBomberosWithFichaService,
  addFichaToBomberoService,
  createBomberoWithImageService
} from "../services/bombero.service.js";

// Servicios de detalles
import { BomberoDetallesService } from "../services/bomberoDetalles.service.js";

import {
  bomberoBodyValidation,
  bomberoQueryValidation,
  bomberoCreateValidation,
} from "../validations/bombero.validation.js";
import {
  handleErrorClient,
  handleErrorServer,
  handleSuccess,
} from "../handlers/responseHandlers.js";

/**
 * CONTROLADOR UNIFICADO DE BOMBEROS
 * Consolida toda la funcionalidad de bomberos en un solo lugar
 */

// ==================== CRUD BÁSICO ====================

/**
 * Obtener un bombero específico
 * GET /api/bombero/:id
 * GET /api/bombero/?run=12345678-9&email=test@test.com
 */
export async function getBombero(req, res) {
  try {
    const { id } = req.params;
    const { run, email } = req.query;

    const { error } = bomberoQueryValidation.validate({
      id,
      run,
      email,
    });

    if (error) return handleErrorClient(res, 400, error.message);

    const [bombero, errorBombero] = await getBomberoService({
      id,
      run,
      email,
    });

    if (errorBombero) return handleErrorClient(res, 404, errorBombero);

    handleSuccess(res, 200, "Bombero encontrado", bombero);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

/**
 * Obtener todos los bomberos con filtros
 * GET /api/bombero/
 */
export async function getBomberos(req, res) {
  try {
    const { error } = bomberoQueryValidation.validate(req.query);
    if (error) return handleErrorClient(res, 400, error.message);

    const [bomberos, errorBomberos] = await getBomberosService(req.query);

    if (errorBomberos) return handleErrorClient(res, 404, errorBomberos);

    bomberos.length === 0
      ? handleSuccess(res, 204)
      : handleSuccess(res, 200, "Bomberos encontrados", bomberos);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

/**
 * Crear un bombero básico
 * POST /api/bombero/
 */
export async function createBombero(req, res) {
  try {
    const { body } = req;
    const creadoPor = req.bombero?.id;

    const { value, error } = bomberoCreateValidation.validate(body);

    if (error) {
      const errorMessages = error.details.map((detail) => ({
        message: detail.message,
        path: detail.path.join("."),
        type: detail.type,
        key: detail.context?.key,
      }));
      return handleErrorClient(res, 400, "Error de validación", errorMessages);
    }

    const [bombero, errorBombero] = await createBomberoService(value, creadoPor);

    if (errorBombero) return handleErrorClient(res, 400, errorBombero);

    handleSuccess(res, 201, "Bombero creado correctamente", bombero);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

/**
 * Actualizar un bombero
 * PATCH /api/bombero/:id
 * PATCH /api/bombero/?run=12345678-9
 */
export async function updateBombero(req, res) {
  try {
    const { id } = req.params;
    const { run, email } = req.query;
    const { body } = req;

    const idForValidation = id === undefined ? undefined : id;

    const { error: queryError } = bomberoQueryValidation.validate({
      id: idForValidation,
      run,
      email,
    });

    if (queryError) {
      return handleErrorClient(res, 400, "Error de validación en la consulta", queryError.message);
    }

    const { error: bodyError } = bomberoBodyValidation.validate(body);

    if (bodyError) {
      const errorMessages = bodyError.details.map((detail) => ({
        message: detail.message,
        path: detail.path.join("."),
        type: detail.type,
        key: detail.context?.key,
      }));
      return handleErrorClient(res, 400, "Error de validación", errorMessages);
    }

    const actualizadoPor = req.bombero?.id;

    const [bombero, bomberoError] = await updateBomberoService(
      { id: idForValidation, run, email },
      body,
      actualizadoPor,
    );

    if (bomberoError) {
      return handleErrorClient(res, 400, "Error modificando al bombero", bomberoError);
    }

    handleSuccess(res, 200, "Bombero modificado correctamente", bombero);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

/**
 * Eliminar un bombero
 * DELETE /api/bombero/:id
 * DELETE /api/bombero/?run=12345678-9
 */
export async function deleteBombero(req, res) {
  try {
    const { id } = req.params;
    const { run, email } = req.query;

    const idForValidation = id === undefined ? undefined : id;

    const { error: queryError } = bomberoQueryValidation.validate({
      id: idForValidation,
      run,
      email,
    });

    if (queryError) {
      return handleErrorClient(res, 400, "Error de validación en la consulta", queryError.message);
    }

    const [bomberoDelete, errorBomberoDelete] = await deleteBomberoService({
      id: idForValidation,
      run,
      email,
    });

    if (errorBomberoDelete)
      return handleErrorClient(res, 404, "Error eliminado al bombero", errorBomberoDelete);

    handleSuccess(res, 200, "Bombero eliminado correctamente", bomberoDelete);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

/**
 * Cambiar estado de un bombero
 * PATCH /api/bombero/estado/:id
 */
export async function changeBomberoStatus(req, res) {
  try {
    const { id } = req.params;
    const { activo } = req.body;

    if (!id || isNaN(parseInt(id))) {
      return handleErrorClient(res, 400, "ID de bombero inválido");
    }

    if (typeof activo !== "boolean") {
      return handleErrorClient(res, 400, "El campo 'activo' debe ser un valor booleano");
    }

    const [bombero, errorBombero] = await changeBomberoStatusService(
      parseInt(id),
      activo,
      req.bombero?.id,
    );

    if (errorBombero) return handleErrorClient(res, 404, errorBombero);

    handleSuccess(
      res,
      200,
      `Bombero ${activo ? "activado" : "desactivado"} correctamente`,
      bombero,
    );
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

// ==================== FUNCIONALIDADES POR COMPAÑÍA ====================

/**
 * Obtener bomberos por compañía específica
 * GET /api/bombero/compania/:idCompania
 */
export async function getBomberosByCompania(req, res) {
  try {
    const { idCompania } = req.params;
    
    if (!idCompania || isNaN(idCompania)) {
      return handleErrorClient(res, 400, "ID de compañía inválido", "El ID de la compañía debe ser un número válido");
    }

    const [bomberos, error] = await getBomberosByCompaniaService(parseInt(idCompania));
    
    if (error) {
      return handleErrorClient(res, 500, "Error al obtener bomberos", error);
    }

    return handleSuccess(res, 200, `Se encontraron ${bomberos.length} bomberos en la compañía`, bomberos);
  } catch (error) {
    console.error("Error en getBomberosByCompania:", error);
    return handleErrorServer(res, 500, "Ocurrió un error inesperado");
  }
}

/**
 * Obtener bomberos de la compañía del usuario autenticado
 * GET /api/bombero/mi-compania/bomberos
 */
export async function getBomberosMiCompania(req, res) {
  try {
    const idBombero = req.bombero.id;
    
    const [compania, errorCompania] = await getCompaniaUsuarioService(idBombero);
    
    if (errorCompania) {
      return handleErrorClient(res, 400, "Error al obtener compañía", errorCompania);
    }

    const [bomberos, error] = await getBomberosByCompaniaService(compania.id);
    
    if (error) {
      return handleErrorClient(res, 500, "Error al obtener bomberos", error);
    }

    return handleSuccess(res, 200, `Se encontraron ${bomberos.length} bomberos en tu compañía`, {
      compania,
      bomberos,
      totalBomberos: bomberos.length
    });
  } catch (error) {
    console.error("Error en getBomberosMiCompania:", error);
    return handleErrorServer(res, 500, "Ocurrió un error inesperado");
  }
}

/**
 * Obtener la compañía del usuario autenticado
 * GET /api/bombero/mi-compania
 */
export async function getMiCompania(req, res) {
  try {
    const idBombero = req.bombero.id;
    
    const [compania, error] = await getCompaniaUsuarioService(idBombero);
    
    if (error) {
      return handleErrorClient(res, 400, "Error al obtener compañía", error);
    }

    return handleSuccess(res, 200, "Compañía obtenida exitosamente", compania);
  } catch (error) {
    console.error("Error en getMiCompania:", error);
    return handleErrorServer(res, 500, "Ocurrió un error inesperado");
  }
}

/**
 * Obtener estadísticas de bomberos de una compañía específica
 * GET /api/bombero/compania/:idCompania/estadisticas
 */
export async function getEstadisticasBomberosCompania(req, res) {
  try {
    const { idCompania } = req.params;
    
    if (!idCompania || isNaN(idCompania)) {
      return handleErrorClient(res, 400, "ID de compañía inválido", "El ID de la compañía debe ser un número válido");
    }

    const [estadisticas, error] = await getEstadisticasBomberosCompaniaService(parseInt(idCompania));
    
    if (error) {
      return handleErrorClient(res, 500, "Error al obtener estadísticas", error);
    }

    return handleSuccess(res, 200, "Estadísticas obtenidas exitosamente", estadisticas);
  } catch (error) {
    console.error("Error en getEstadisticasBomberosCompania:", error);
    return handleErrorServer(res, 500, "Ocurrió un error inesperado");
  }
}

/**
 * Obtener estadísticas de bomberos de la compañía del usuario autenticado
 * GET /api/bombero/mi-compania/estadisticas
 */
export async function getEstadisticasMiCompania(req, res) {
  try {
    const idBombero = req.bombero.id;
    
    const [compania, errorCompania] = await getCompaniaUsuarioService(idBombero);
    
    if (errorCompania) {
      return handleErrorClient(res, 400, "Error al obtener compañía", errorCompania);
    }

    const [estadisticas, error] = await getEstadisticasBomberosCompaniaService(compania.id);
    
    if (error) {
      return handleErrorClient(res, 500, "Error al obtener estadísticas", error);
    }

    return handleSuccess(res, 200, "Estadísticas obtenidas exitosamente", {
      compania: {
        id: compania.id,
        nombre: compania.nombre
      },
      estadisticas
    });
  } catch (error) {
    console.error("Error en getEstadisticasMiCompania:", error);
    return handleErrorServer(res, 500, "Ocurrió un error inesperado");
  }
}

/**
 * Obtener bomberos de otras compañías
 * GET /api/bombero/otras-companias
 */
export async function getBomberosOtrasCompanias(req, res) {
  try {
    const idBombero = req.bombero.id;
    
    const [companiaUsuario, errorCompania] = await getCompaniaUsuarioService(idBombero);
    if (errorCompania) {
      return handleErrorServer(res, 500, errorCompania);
    }

    if (!companiaUsuario) {
      return handleErrorClient(res, 404, "No se pudo determinar la compañía del usuario");
    }

    const [bomberos, error] = await getBomberosOtrasCompaniasService(companiaUsuario.id);
    if (error) {
      return handleErrorServer(res, 500, error);
    }

    return handleSuccess(res, 200, "Bomberos de otras compañías obtenidos exitosamente", {
      bomberos,
      totalBomberos: bomberos.length
    });
  } catch (error) {
    console.error("Error en getBomberosOtrasCompanias:", error);
    return handleErrorServer(res, 500, "Ocurrió un error inesperado");
  }
}

/**
 * Obtener bomberos con licencias de una compañía
 * GET /api/bombero/licencias/:idCompania
 */
export async function getBomberosConLicencias(req, res) {
  try {
    const { idCompania } = req.params;
    if (!idCompania || isNaN(parseInt(idCompania))) {
      return handleErrorClient(res, 400, "ID de compañía inválido");
    }
    const [bomberos, errorBomberos] = await getBomberosConLicenciasService(parseInt(idCompania));
    if (errorBomberos) return handleErrorClient(res, 404, errorBomberos);

    bomberos.length === 0
      ? handleSuccess(res, 204)
      : handleSuccess(res, 200, "Bomberos encontrados", bomberos);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

/**
 * Obtener bomberos por compañía (alias para compatibilidad)
 * GET /api/bombero/compania/:idCompania/bomberos
 */
export async function getBomberosPorCompania(req, res) {
  try {
    const { idCompania } = req.params;
    if (!idCompania || isNaN(parseInt(idCompania))) {
      return handleErrorClient(res, 400, "ID de compañía inválido");
    }   
    const [bomberos, errorBomberos] = await getBomberosPorCompaniaService(parseInt(idCompania));
    if (errorBomberos) return handleErrorClient(res, 404, errorBomberos);
    bomberos.length === 0
      ? handleSuccess(res, 204)
      : handleSuccess(res, 200, "Bomberos encontrados", bomberos);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

// ==================== DETALLES COMPLETOS ====================

/**
 * Obtener detalles completos de un bombero
 * GET /api/bombero/:id/detalles
 */
export async function getBomberoDetalles(req, res) {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(parseInt(id))) {
      return handleErrorClient(res, 400, "ID de bombero inválido");
    }

    const idBombero = parseInt(id);
    
    const [bombero, error] = await BomberoDetallesService.getBomberoDetallesCompletos(idBombero);
    
    if (error) {
      if (error === "Bombero no encontrado") {
        return handleErrorClient(res, 404, error);
      }
      return handleErrorServer(res, 500, error);
    }

    return handleSuccess(res, 200, "Detalles del bombero obtenidos exitosamente", bombero);
  } catch (error) {
    console.error("Error en getBomberoDetalles:", error);
    return handleErrorServer(res, 500, "Error interno del servidor");
  }
}

// ==================== FUNCIONALIDADES UNIFICADAS ====================

/**
 * Crear bombero con ficha opcional
 * POST /api/bombero/with-ficha
 */
export async function createBomberoWithOptionalFicha(req, res) {
  try {
    const { bomberoData, fichaData } = req.body;
    const createdBy = req.bombero?.id;

    if (!bomberoData) {
      return handleErrorClient(res, 400, "Datos del bombero son requeridos");
    }

    const [bombero, bomberoError, fichaResult] = await createBomberoWithOptionalFichaService(
      bomberoData,
      fichaData,
      createdBy
    );

    if (bomberoError) {
      return handleErrorClient(res, 400, bomberoError);
    }

    let message = "Bombero creado exitosamente";
    if (fichaData) {
      if (fichaResult?.error) {
        message = "Bombero creado exitosamente, pero hubo un problema al crear la ficha";
      } else {
        message = "Bombero y ficha creados exitosamente";
      }
    }

    handleSuccess(res, 201, message, {
      bombero,
      fichaCreated: !!fichaData,
      fichaError: fichaResult?.error || null
    });
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

/**
 * Crear bombero con imagen de perfil
 * POST /api/bombero/with-image
 */
export async function createBomberoWithImage(req, res) {
  try {
    const { bomberoData, fichaData } = req.body;
    const profileImage = req.file;
    const createdBy = req.bombero?.id;

    if (!bomberoData) {
      return handleErrorClient(res, 400, "Datos del bombero son requeridos");
    }

    const [bombero, bomberoError, fichaResult] = await createBomberoWithImageService(
      bomberoData,
      fichaData,
      profileImage,
      createdBy
    );

    if (bomberoError) {
      return handleErrorClient(res, 400, bomberoError);
    }

    let message = "Bombero creado exitosamente";
    if (fichaData) {
      if (fichaResult?.error) {
        message = "Bombero creado exitosamente, pero hubo un problema al crear la ficha";
      } else {
        message = "Bombero y ficha creados exitosamente";
        if (profileImage) {
          message += " con imagen de perfil";
        }
      }
    }

    handleSuccess(res, 201, message, {
      bombero,
      fichaCreated: !!fichaData,
      imageUploaded: !!profileImage,
      fichaError: fichaResult?.error || null
    });
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

/**
 * Obtener bombero completo con ficha
 * GET /api/bombero/:id/complete
 */
export async function getBomberoComplete(req, res) {
  try {
    const { id } = req.params;
    const bomberoId = parseInt(id, 10);

    if (isNaN(bomberoId)) {
      return handleErrorClient(res, 400, "ID de bombero inválido");
    }

    const [bombero, error] = await getBomberoCompleteService(bomberoId);

    if (error) {
      return handleErrorClient(res, 404, error);
    }

    handleSuccess(res, 200, "Bombero encontrado", bombero);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

/**
 * Obtener todos los bomberos con información de ficha
 * GET /api/bombero/complete
 */
export async function getAllBomberosWithFicha(req, res) {
  try {
    const [bomberos, error] = await getAllBomberosWithFichaService();

    if (error) {
      return handleErrorClient(res, 500, error);
    }

    handleSuccess(res, 200, "Bomberos obtenidos exitosamente", bomberos);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

/**
 * Agregar ficha a un bombero existente
 * POST /api/bombero/:id/add-ficha
 */
export async function addFichaToBombero(req, res) {
  try {
    const { id } = req.params;
    const { fichaData } = req.body;
    const bomberoId = parseInt(id, 10);
    const createdBy = req.bombero?.id;

    if (isNaN(bomberoId)) {
      return handleErrorClient(res, 400, "ID de bombero inválido");
    }

    if (!fichaData) {
      return handleErrorClient(res, 400, "Datos de la ficha son requeridos");
    }

    const [bombero, error] = await addFichaToBomberoService(bomberoId, fichaData, createdBy);

    if (error) {
      return handleErrorClient(res, 400, error);
    }

    handleSuccess(res, 201, "Ficha agregada al bombero exitosamente", bombero);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

/**
 * Obtener URL firmada de imagen de perfil de un bombero específico
 * GET /api/bombero/:id/imagen-perfil-url
 */
export async function getBomberoImagenPerfilUrl(req, res) {
  try {
    const { id } = req.params;
    const idBombero = parseInt(id);

    if (isNaN(idBombero)) {
      return handleErrorClient(res, 400, "ID de bombero inválido");
    }

    // Importar servicios necesarios
    const minioService = (await import('../services/minio.service.js')).default;
    const { BUCKETS } = await import('../config/configMinIO.js');

    // Verificar que el bombero existe
    const bomberoRepository = AppDataSource.getRepository("Bombero");
    const bombero = await bomberoRepository.findOne({
      where: { id: idBombero }
    });

    if (!bombero) {
      return handleErrorClient(res, 404, "Bombero no encontrado");
    }

    // Obtener la ficha del bombero
    const fichaBomberoRepository = AppDataSource.getRepository("FichaBombero");
    const ficha = await fichaBomberoRepository.findOne({
      where: { idBombero: idBombero }
    });

    if (!ficha || !ficha.fotoPerfilKEY) {
      return handleErrorClient(res, 404, "No hay imagen de perfil para este bombero");
    }

    // Generar URL firmada
    const signedUrl = await minioService.getSignedUrl(BUCKETS.PROFILES, ficha.fotoPerfilKEY);
    
    return handleSuccess(res, 200, "URL de imagen generada exitosamente", { 
      url: signedUrl,
      bomberoId: idBombero,
      fileName: ficha.fotoPerfilKEY
    });
  } catch (error) {
    console.error("Error en getBomberoImagenPerfilUrl:", error);
    return handleErrorServer(res, 500, "Error interno del servidor");
  }
}