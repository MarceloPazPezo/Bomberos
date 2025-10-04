import { Router } from 'express';
import fileController from '../controllers/file.controller.js';
import { uploadSingle, uploadMultiple, validateUploadedFiles, logUploadedFiles } from '../middlewares/upload.middleware.js';
import { authenticateJwt } from '../middlewares/authentication.middleware.js';
import { authorizeRoles } from '../middlewares/authorization.middleware.js';

const router = Router();

// ===========================================
// RUTAS DE SUBIDA DE ARCHIVOS
// ===========================================

/**
 * @route POST /api/files/upload/profile/:bomberoId
 * @desc Subir imagen de perfil de bombero
 * @access Private (Autenticado)
 */
router.post(
  '/upload/profile/:bomberoId',
  authenticateJwt,
  uploadSingle('profileImage'),
  validateUploadedFiles,
  logUploadedFiles,
  fileController.uploadProfileImage
);

/**
 * @route POST /api/files/upload/company/:companiaId
 * @desc Subir imagen de compañía
 * @access Private (Autenticado)
 */
router.post(
  '/upload/company/:companiaId',
  authenticateJwt,
  uploadSingle('companyImage'),
  validateUploadedFiles,
  logUploadedFiles,
  fileController.uploadCompanyImage
);

/**
 * @route POST /api/files/upload/document
 * @desc Subir documento
 * @access Private (Autenticado)
 */
router.post(
  '/upload/document',
  authenticateJwt,
  uploadSingle('document'),
  validateUploadedFiles,
  logUploadedFiles,
  fileController.uploadDocument
);

/**
 * @route POST /api/files/upload/tiles
 * @desc Subir paquete de tiles
 * @access Private (Autenticado + Admin)
 */
router.post(
  '/upload/tiles',
  authenticateJwt,
  authorizeRoles(['admin', 'supervisor']),
  uploadMultiple('tiles', 10),
  validateUploadedFiles,
  logUploadedFiles,
  fileController.uploadTiles
);

// ===========================================
// RUTAS DE ACCESO A ARCHIVOS
// ===========================================

/**
 * @route GET /api/files/signed-url/:bucket/:fileName
 * @desc Obtener URL firmada para descarga
 * @access Private (Autenticado)
 */
router.get(
  '/signed-url/:bucket/:fileName',
  authenticateJwt,
  fileController.getSignedUrl
);

/**
 * @route GET /api/files/download/:bucket/:fileName
 * @desc Descargar archivo directamente
 * @access Private (Autenticado)
 */
router.get(
  '/download/:bucket/:fileName',
  authenticateJwt,
  fileController.downloadFile
);

/**
 * @route GET /api/files/info/:bucket/:fileName
 * @desc Obtener información de un archivo
 * @access Private (Autenticado)
 */
router.get(
  '/info/:bucket/:fileName',
  authenticateJwt,
  fileController.getFileInfo
);

/**
 * @route DELETE /api/files/:bucket/:fileName
 * @desc Eliminar archivo
 * @access Private (Autenticado + Admin)
 */
router.delete(
  '/:bucket/:fileName',
  authenticateJwt,
  authorizeRoles(['admin', 'supervisor']),
  fileController.deleteFile
);

// ===========================================
// RUTAS DE GESTIÓN DE ARCHIVOS
// ===========================================

/**
 * @route GET /api/files/list/:bucket
 * @desc Listar archivos en un bucket
 * @access Private (Autenticado)
 */
router.get(
  '/list/:bucket',
  authenticateJwt,
  fileController.listFiles
);

// ===========================================
// RUTAS PÚBLICAS PARA TILES
// ===========================================

/**
 * @route GET /api/tiles/public/:fileName
 * @desc Obtener URL pública para tiles
 * @access Public
 */
router.get(
  '/public/:fileName',
  fileController.getPublicTileUrl
);

export default router;
