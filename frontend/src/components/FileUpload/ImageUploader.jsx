import React, { useState, useRef, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { MdCloudUpload, MdDelete, MdImage, MdError, MdCrop } from 'react-icons/md';

/**
 * Componente para subir imágenes con recorte automático 1:1
 * Aplica el recorte automáticamente al seleccionar la imagen
 */
const ImageUploader = ({
  onFileSelect,
  onFileRemove,
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp'],
  maxSize = 5 * 1024 * 1024, // 5MB por defecto
  disabled = false,
  className = '',
  placeholder = 'Seleccionar imagen...',
  error = null,
  value = null, // Archivo actual
  cropSize = null, // Tamaño del recorte en píxeles (null = usar tamaño mínimo de la imagen)
  previewUrl = null, // URL de preview existente (para mostrar imagen actual cuando no hay archivo nuevo)
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [croppedUrl, setCroppedUrl] = useState(null);
  const [validationError, setValidationError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef(null);

  // Crear preview cuando se selecciona un archivo o hay una URL de preview
  useEffect(() => {
    if (value && value.cropped) {
      const url = URL.createObjectURL(value);
      setCroppedUrl(url);
      return () => URL.revokeObjectURL(url);
    } else if (previewUrl && !value) {
      // Mostrar preview de URL existente cuando no hay archivo nuevo
      setCroppedUrl(previewUrl);
    } else {
      setCroppedUrl(null);
    }
  }, [value, previewUrl]);

  // Validar archivo
  const validateFile = useCallback((file) => {
    setValidationError(null);

    if (!file) {
      setValidationError('No se ha seleccionado ningún archivo');
      return false;
    }

    // Validar tipo
    if (!acceptedTypes.includes(file.type)) {
      const allowedTypes = acceptedTypes.map(type => type.split('/')[1].toUpperCase()).join(', ');
      setValidationError(`Tipo de archivo no permitido. Solo se permiten: ${allowedTypes}`);
      return false;
    }

    // Validar tamaño
    if (file.size > maxSize) {
      const maxSizeMB = Math.round(maxSize / (1024 * 1024));
      setValidationError(`El archivo es demasiado grande. Máximo permitido: ${maxSizeMB}MB`);
      return false;
    }

    return true;
  }, [acceptedTypes, maxSize]);

  // Función para recortar imagen automáticamente a 1:1
  const cropImageToSquare = useCallback((file) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      img.onload = () => {
        try {
          // Calcular dimensiones del recorte cuadrado
          const minDimension = Math.min(img.width, img.height);
          const startX = (img.width - minDimension) / 2;
          const startY = (img.height - minDimension) / 2;

          // Usar cropSize si se proporciona, de lo contrario usar el tamaño mínimo de la imagen
          const finalSize = cropSize || minDimension;

          // Configurar canvas para el tamaño final
          canvas.width = finalSize;
          canvas.height = finalSize;

          // Dibujar la imagen recortada
          ctx.drawImage(
            img,
            startX, startY, minDimension, minDimension, // Área de origen (cuadrado)
            0, 0, finalSize, finalSize // Área de destino
          );

          // Convertir a blob
          canvas.toBlob((blob) => {
            if (blob) {
              // Crear archivo con el blob recortado
              const croppedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now()
              });
              
              // Marcar como recortado
              croppedFile.cropped = true;
              croppedFile.originalSize = file.size;
              croppedFile.croppedSize = blob.size;
              
              resolve(croppedFile);
            } else {
              reject(new Error('Error al procesar la imagen'));
            }
          }, file.type, 0.95); // Calidad 95% (mejor calidad)
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => reject(new Error('Error al cargar la imagen'));
      img.src = URL.createObjectURL(file);
    });
  }, [cropSize]);

  // Manejar selección de archivo
  const handleFileSelect = useCallback(async (file) => {
    if (!validateFile(file)) {
      return;
    }
    
    // Limpiar estados anteriores
    setValidationError(null);
    setIsProcessing(true);
    
    try {
      // Aplicar recorte automáticamente
      const croppedFile = await cropImageToSquare(file);
      onFileSelect?.(croppedFile);
    } catch (error) {
      setValidationError('Error al procesar la imagen');
    } finally {
      setIsProcessing(false);
    }
  }, [validateFile, cropImageToSquare, onFileSelect]);


  // Manejar cambio en input
  const handleInputChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  // Manejar drag and drop
  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (disabled) return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [disabled, handleFileSelect]);

  // Manejar click en el área de upload
  const handleClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Manejar eliminación de archivo
  const handleRemove = (e) => {
    e.stopPropagation();
    setValidationError(null);
    setCroppedUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onFileRemove?.();
  };

  // Formatear tamaño de archivo
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const hasError = error || validationError;
  const hasFile = value && !hasError;
  const hasPreview = croppedUrl && (hasFile || previewUrl);

  return (
    <div className={`image-uploader-with-crop ${className}`}>
      {/* Input oculto */}
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes.join(',')}
        onChange={handleInputChange}
        className="hidden"
        disabled={disabled}
      />

      {/* Área de upload */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 transition-all duration-200 cursor-pointer
          ${dragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${hasError ? 'border-red-400 bg-red-50' : ''}
          ${hasFile ? 'border-green-400 bg-green-50' : ''}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <div className="text-center">
          {hasPreview ? (
            // Preview de imagen recortada o existente
            <div className="relative">
              <img
                src={croppedUrl}
                alt="Preview"
                className="mx-auto w-32 h-32 rounded-lg object-cover border-2 border-gray-200"
              />
              {!disabled && (
                <button
                  type="button"
                  onClick={handleRemove}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                  title={hasFile ? "Eliminar imagen" : "Eliminar logo actual"}
                >
                  <MdDelete size={16} />
                </button>
              )}
              {hasFile && (
                <div className="absolute -bottom-1 -right-1 bg-green-500 text-white rounded-full p-1" title="Imagen recortada automáticamente">
                  <MdCrop size={12} />
                </div>
              )}
            </div>
          ) : (
            // Icono de upload
            <div className="flex flex-col items-center space-y-2">
              {hasError ? (
                <MdError className="text-red-500" size={48} />
              ) : isProcessing ? (
                <div className="flex flex-col items-center space-y-2">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                  <div className="text-xs text-blue-600 font-medium">Procesando imagen...</div>
                </div>
              ) : (
                <MdCloudUpload className="text-gray-400" size={48} />
              )}
              <div className="text-sm text-gray-600">
                {hasError ? 'Error en el archivo' : 
                 isProcessing ? 'Por favor espera...' : 
                 placeholder}
              </div>
              {hasFile && (
                <div className="text-xs text-gray-500">
                  <MdImage className="inline mr-1" />
                  {value.name} ({formatFileSize(value.size)})
                  {value.originalSize && (
                    <span className="text-green-600 ml-1">
                      (optimizado de {formatFileSize(value.originalSize)})
                    </span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Información adicional */}
        {!hasFile && !hasPreview && !hasError && !isProcessing && (
          <div className="mt-2 text-xs text-gray-500">
            Arrastra y suelta una imagen aquí o haz clic para seleccionar
          </div>
        )}
      </div>

      {/* Mensajes de error */}
      {hasError && (
        <div className="mt-2 text-sm text-red-600 flex items-center">
          <MdError className="mr-1" size={16} />
          {error || validationError}
        </div>
      )}

      {/* Información de archivo seleccionado */}
      {hasFile && (
        <div className="mt-2 text-sm text-green-600">
          ✓ Imagen recortada: {value.name} ({formatFileSize(value.size)})
        </div>
      )}

    </div>
  );
};

ImageUploader.propTypes = {
  onFileSelect: PropTypes.func,
  onFileRemove: PropTypes.func,
  acceptedTypes: PropTypes.arrayOf(PropTypes.string),
  maxSize: PropTypes.number,
  disabled: PropTypes.bool,
  className: PropTypes.string,
  placeholder: PropTypes.string,
  error: PropTypes.string,
  value: PropTypes.object, // File object
  cropSize: PropTypes.number,
  previewUrl: PropTypes.string, // URL de preview existente
};

export default ImageUploader;
