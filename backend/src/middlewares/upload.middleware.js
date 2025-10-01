"use strict";
import multer from "multer";
import path from "path";

// Configuración de almacenamiento en memoria para multer
const storage = multer.memoryStorage();

// Configuración de multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB límite por archivo
    files: 5 // Máximo 5 archivos
  },
  fileFilter: (req, file, cb) => {
    // Tipos de archivo permitidos
    const allowedTypes = [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/webp',
      'application/pdf'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Tipo de archivo no permitido: ${file.mimetype}`), false);
    }
  }
});

// Middleware para subir archivos de perfil y documentos
export const uploadProfileFiles = upload.fields([
  { name: 'profileImage', maxCount: 1 },
  { name: 'licenseDocuments', maxCount: 3 }
]);

// Middleware para manejar errores de multer
export const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        status: "Client error",
        message: "El archivo es demasiado grande. Máximo 10MB por archivo.",
        details: {}
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        status: "Client error", 
        message: "Demasiados archivos. Máximo 5 archivos por solicitud.",
        details: {}
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        status: "Client error",
        message: "Campo de archivo inesperado.",
        details: {}
      });
    }
  }
  
  if (error.message.includes('Tipo de archivo no permitido')) {
    return res.status(400).json({
      status: "Client error",
      message: error.message,
      details: {}
    });
  }
  
  next(error);
};
