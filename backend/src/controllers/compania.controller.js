"use strict";
import {
  createCompaniaService,
  deleteCompaniaService,
  getCompaniaBomberoService,
  getCompaniaService,
  getCompaniasService,
  updateCompaniaService,
} from "../services/compania.service.js";
import {
  companiaCreateValidation,
  companiaIdParamsValidation,
  companiaQueryValidation,
  companiaUpdateValidation,
} from "../validations/compania.validation.js";
import {
  handleErrorClient,
  handleErrorServer,
  handleSuccess,
} from "../handlers/responseHandlers.js";

/**
 * Obtiene una compañía específica por criterios de búsqueda
 */
export async function getCompania(req, res) {
  try {
    const { id } = req.params;
    const { nombre, email } = req.query;

    // Validar parámetros de URL
    if (id) {
      const { error: paramsError } = companiaIdParamsValidation.validate({ id });
      if (paramsError) {
        return handleErrorClient(res, 400, paramsError.message);
      }
    }

    // Validar parámetros de consulta
    const { error: queryError } = companiaQueryValidation.validate({
      id,
      nombre,
      email,
    });

    if (queryError) return handleErrorClient(res, 400, queryError.message);

    const [compania, errorCompania] = await getCompaniaService({
      id,
      nombre,
      email,
    });

    if (errorCompania) return handleErrorClient(res, 404, errorCompania);

    handleSuccess(res, 200, "Compañía encontrada", compania);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

/**
 * Obtiene todas las compañías con filtros opcionales y paginación
 */
export async function getCompanias(req, res) {
  try {
    // Validar todos los parámetros de query
    const { error } = companiaQueryValidation.validate(req.query);
    if (error) return handleErrorClient(res, 400, error.message);

    const [companias, errorCompanias, total] = await getCompaniasService(req.query);

    if (errorCompanias) return handleErrorClient(res, 404, errorCompanias);

    if (companias.length === 0) {
      return handleSuccess(res, 204, "No se encontraron compañías");
    }

    // Agregar información de paginación en la respuesta
    const { page = 1, limit = 10 } = req.query;
    const pagination = {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      itemsPerPage: parseInt(limit),
    };

    handleSuccess(res, 200, "Compañías encontradas", {
      companias,
      pagination,
    });
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

/**
 * Crea una nueva compañía
 */
export async function createCompania(req, res) {
  try {
    const { body } = req;

    const { value, error } = companiaCreateValidation.validate(body);

    if (error) {
      const errorMessages = error.details.map((detail) => ({
        message: detail.message,
        path: detail.path.join("."),
        type: detail.type,
        key: detail.context?.key,
      }));
      return handleErrorClient(res, 400, "Error de validación", errorMessages);
    }

    const [compania, errorCompania] = await createCompaniaService(value);

    if (errorCompania) return handleErrorClient(res, 400, errorCompania);

    handleSuccess(res, 201, "Compañía creada correctamente", compania);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

/**
 * Actualiza una compañía existente
 */
export async function updateCompania(req, res) {
  try {
    const { id } = req.params;
    const { nombre, email } = req.query;
    const { body } = req;

    // Validar parámetros de URL
    if (id) {
      const { error: paramsError } = companiaIdParamsValidation.validate({ id });
      if (paramsError) {
        return handleErrorClient(res, 400, "Error de validación en parámetros de URL", paramsError.message);
      }
    }

    // Validar parámetros de consulta
    const { error: queryError } = companiaQueryValidation.validate({
      id,
      nombre,
      email,
    });

    if (queryError) {
      return handleErrorClient(
        res,
        400,
        "Error de validación en la consulta",
        queryError.message,
      );
    }

    // Validar cuerpo de la solicitud
    const { error: bodyError } = companiaUpdateValidation.validate(body);

    if (bodyError) {
      const errorMessages = bodyError.details.map((detail) => ({
        message: detail.message,
        path: detail.path.join("."),
        type: detail.type,
        key: detail.context?.key,
      }));
      return handleErrorClient(res, 400, "Error de validación", errorMessages);
    }

    const [compania, companiaError] = await updateCompaniaService(
      { id, nombre, email },
      body,
    );

    if (companiaError) {
      return handleErrorClient(
        res,
        400,
        "Error modificando la compañía",
        companiaError,
      );
    }

    handleSuccess(res, 200, "Compañía modificada correctamente", compania);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

/**
 * Elimina una compañía
 */
export async function deleteCompania(req, res) {
  try {
    const { id } = req.params;
    const { nombre, email } = req.query;

    // Validar parámetros de URL
    if (id) {
      const { error: paramsError } = companiaIdParamsValidation.validate({ id });
      if (paramsError) {
        return handleErrorClient(res, 400, "Error de validación en parámetros de URL", paramsError.message);
      }
    }

    // Validar parámetros de consulta
    const { error: queryError } = companiaQueryValidation.validate({
      id,
      nombre,
      email,
    });

    if (queryError) {
      return handleErrorClient(
        res,
        400,
        "Error de validación en la consulta",
        queryError.message,
      );
    }

    const [companiaDeleted, errorCompaniaDelete] = await deleteCompaniaService({
      id,
      nombre,
      email,
    });

    if (errorCompaniaDelete) {
      return handleErrorClient(
        res,
        404,
        "Error eliminando la compañía",
        errorCompaniaDelete,
      );
    }

    handleSuccess(res, 200, "Compañía eliminada correctamente", companiaDeleted);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

/**
 * Obtiene la compañía asociada a un bombero
 */
export async function getCompaniaBombero(req, res) {
  try {
    const { idBombero } = req.params;

    if (!idBombero || isNaN(parseInt(idBombero))) {
      return handleErrorClient(res, 400, "ID de bombero inválido");
    }

    const [compania, errorCompania] = await getCompaniaBomberoService(
      parseInt(idBombero),
    );

    if (errorCompania) return handleErrorClient(res, 404, errorCompania);

    handleSuccess(
      res,
      200,
      "Información de la compañía obtenida correctamente",
      compania,
    );
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

/**
 * Obtener URL firmada de logo de una compañía específica
 * GET /api/compania/:id/logo-url
 */
export async function getCompaniaLogoUrl(req, res) {
  try {
    const { id } = req.params;
    const idCompania = parseInt(id);

    if (isNaN(idCompania)) {
      return handleErrorClient(res, 400, "ID de compañía inválido");
    }

    // Importar servicios necesarios
    const minioService = (await import('../services/minio.service.js')).default;
    const { BUCKETS } = await import('../config/configMinIO.js');
    const { AppDataSource } = await import('../config/configDb.js');

    // Verificar que la compañía existe
    const companiaRepository = AppDataSource.getRepository("Compania");
    const compania = await companiaRepository.findOne({
      where: { id: idCompania }
    });

    if (!compania) {
      return handleErrorClient(res, 404, "Compañía no encontrada");
    }

    if (!compania.logoKEY) {
      return handleErrorClient(res, 404, "No hay logo para esta compañía");
    }

    // Generar URL firmada
    const signedUrl = await minioService.getSignedUrl(BUCKETS.COMPANIES, compania.logoKEY);
    
    return handleSuccess(res, 200, "URL de logo generada exitosamente", { 
      url: signedUrl,
      companiaId: idCompania,
      fileName: compania.logoKEY
    });
  } catch (error) {
    console.error("Error en getCompaniaLogoUrl:", error);
    return handleErrorServer(res, 500, "Error interno del servidor");
  }
}

export async function getCompaniaBannerUrl(req, res) {
  try {
    const { id } = req.params;
    const idCompania = parseInt(id);

    if (isNaN(idCompania)) {
      return handleErrorClient(res, 400, "ID de compañía inválido");
    }

    // Importar servicios necesarios
    const minioService = (await import('../services/minio.service.js')).default;
    const { BUCKETS } = await import('../config/configMinIO.js');
    const { AppDataSource } = await import('../config/configDb.js');

    // Verificar que la compañía existe
    const companiaRepository = AppDataSource.getRepository("Compania");
    const compania = await companiaRepository.findOne({
      where: { id: idCompania }
    });

    if (!compania) {
      return handleErrorClient(res, 404, "Compañía no encontrada");
    }

    if (!compania.bannerKEY) {
      return handleErrorClient(res, 404, "No hay banner para esta compañía");
    }

    // Generar URL firmada
    const signedUrl = await minioService.getSignedUrl(BUCKETS.COMPANIES, compania.bannerKEY);
    
    return handleSuccess(res, 200, "URL de banner generada exitosamente", { 
      url: signedUrl,
      companiaId: idCompania,
      fileName: compania.bannerKEY
    });
  } catch (error) {
    console.error("Error en getCompaniaBannerUrl:", error);
    return handleErrorServer(res, 500, "Error interno del servidor");
  }
}
