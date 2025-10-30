import { Router } from 'express';
import fileController from '../controllers/file.controller.js';
import { logUploadedFiles, uploadMultiple, uploadSingle, validateUploadedFiles } from '../middlewares/upload.middleware.js';
import { authenticateJwt } from '../middlewares/authentication.middleware.js';
import { authorizeRoles } from '../middlewares/authorization.middleware.js';

const router = Router();

// Rutas de subida de archivos
router.post('/upload/profile/:bomberoId', authenticateJwt, uploadSingle('profileImage'), validateUploadedFiles, logUploadedFiles, fileController.uploadProfileImage);
router.post('/upload/company/:companiaId', authenticateJwt, uploadSingle('companyImage'), validateUploadedFiles, logUploadedFiles, fileController.uploadCompanyImage);
router.post('/upload/document', authenticateJwt, uploadSingle('document'), validateUploadedFiles, logUploadedFiles, fileController.uploadDocument);
router.post('/upload/tiles', authenticateJwt, authorizeRoles(['admin', 'supervisor']), uploadMultiple('tiles', 10), validateUploadedFiles, logUploadedFiles, fileController.uploadTiles);

// Rutas de acceso a archivos
router.get('/signed-url/:bucket/:fileName', authenticateJwt, fileController.getSignedUrl);
router.get('/download/:bucket/:fileName', authenticateJwt, fileController.downloadFile);
router.get('/info/:bucket/:fileName', authenticateJwt, fileController.getFileInfo);
router.delete('/:bucket/:fileName', authenticateJwt, authorizeRoles(['admin', 'supervisor']), fileController.deleteFile);

// Rutas de gestión de archivos
router.get('/list/:bucket', authenticateJwt, fileController.listFiles);

// Rutas públicas para tiles
router.get('/public/:fileName', fileController.getPublicTileUrl);

export default router;
