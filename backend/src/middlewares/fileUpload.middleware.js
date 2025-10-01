import multer from 'multer';
import { FILE_CONFIG } from '../config/configMinIO.js';
import logger from '../config/configLogger.js';

// Configuración de multer para almacenamiento en memoria
const storage = multer.memoryStorage();

// Filtro de archivos
const fileFilter = (req, file, cb) => {
  const contentType = file.mimetype;
  
  // Determinar tipo de archivo basado en el campo
  let allowedTypes = [];
  
  if (file.fieldname === 'profileImage' || file.fieldname === 'companyImage') {
    allowedTypes = FILE_CONFIG.ALLOWED_IMAGE_TYPES;
  } else if (file.fieldname === 'document') {
    allowedTypes = FILE_CONFIG.ALLOWED_DOCUMENT_TYPES;
  } else if (file.fieldname === 'tile') {
    allowedTypes = FILE_CONFIG.ALLOWED_TILE_TYPES;
  } else {
    // Por defecto, permitir imágenes
    allowedTypes = FILE_CONFIG.ALLOWED_IMAGE_TYPES;
  }

  if (allowedTypes.includes(contentType)) {
    cb(null, true);
  } else {
    const error = new Error(`Tipo de archivo no permitido: ${contentType}`);
    error.code = 'INVALID_FILE_TYPE';
    cb(error, false);
  }
};

// Configuración de multer
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: FILE_CONFIG.MAX_FILE_SIZE,
    files: 5 // Máximo 5 archivos por request
  }
});

// Middleware para subida de archivos individuales
export const uploadSingle = (fieldName) => {
  return (req, res, next) => {
    const uploadSingleFile = upload.single(fieldName);
    
    uploadSingleFile(req, res, (err) => {
      if (err) {
        logger.error('Error en upload single:', err);
        
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: `El archivo es demasiado grande. Máximo permitido: ${FILE_CONFIG.MAX_FILE_SIZE / (1024 * 1024)}MB`
          });
        }
        
        if (err.code === 'INVALID_FILE_TYPE') {
          return res.status(400).json({
            success: false,
            message: err.message
          });
        }
        
        return res.status(400).json({
          success: false,
          message: 'Error procesando el archivo',
          error: err.message
        });
      }
      
      next();
    });
  };
};

// Middleware para subida de múltiples archivos
export const uploadMultiple = (fieldName, maxCount = 5) => {
  return (req, res, next) => {
    const uploadMultipleFiles = upload.array(fieldName, maxCount);
    
    uploadMultipleFiles(req, res, (err) => {
      if (err) {
        logger.error('Error en upload multiple:', err);
        
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: `Uno o más archivos son demasiado grandes. Máximo permitido: ${FILE_CONFIG.MAX_FILE_SIZE / (1024 * 1024)}MB`
          });
        }
        
        if (err.code === 'INVALID_FILE_TYPE') {
          return res.status(400).json({
            success: false,
            message: err.message
          });
        }
        
        return res.status(400).json({
          success: false,
          message: 'Error procesando los archivos',
          error: err.message
        });
      }
      
      next();
    });
  };
};

// Middleware para subida de archivos con campos específicos
export const uploadFields = (fields) => {
  return (req, res, next) => {
    const uploadSpecificFields = upload.fields(fields);
    
    uploadSpecificFields(req, res, (err) => {
      if (err) {
        logger.error('Error en upload fields:', err);
        
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: `Uno o más archivos son demasiado grandes. Máximo permitido: ${FILE_CONFIG.MAX_FILE_SIZE / (1024 * 1024)}MB`
          });
        }
        
        if (err.code === 'INVALID_FILE_TYPE') {
          return res.status(400).json({
            success: false,
            message: err.message
          });
        }
        
        return res.status(400).json({
          success: false,
          message: 'Error procesando los archivos',
          error: err.message
        });
      }
      
      next();
    });
  };
};

// Middleware para validar archivos después de la subida
export const validateUploadedFiles = (req, res, next) => {
  if (!req.file && !req.files) {
    return res.status(400).json({
      success: false,
      message: 'No se encontraron archivos para subir'
    });
  }
  
  // Validar archivo único
  if (req.file) {
    if (!req.file.buffer || req.file.buffer.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'El archivo está vacío'
      });
    }
  }
  
  // Validar archivos múltiples
  if (req.files) {
    const files = Array.isArray(req.files) ? req.files : Object.values(req.files).flat();
    
    for (const file of files) {
      if (!file.buffer || file.buffer.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Uno o más archivos están vacíos'
        });
      }
    }
  }
  
  next();
};

// Middleware para logging de archivos subidos
export const logUploadedFiles = (req, res, next) => {
  if (req.file) {
      logger.info(`[MINIO] Archivo subido: ${req.file.originalname} (${req.file.size} bytes, ${req.file.mimetype})`);
  }
  
  if (req.files) {
    const files = Array.isArray(req.files) ? req.files : Object.values(req.files).flat();
    files.forEach(file => {
      logger.info(`[MINIO] Archivo subido: ${file.originalname} (${file.size} bytes, ${file.mimetype})`);
    });
  }
  
  next();
};

export default upload;
