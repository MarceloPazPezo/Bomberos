import React, { useState, useRef, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { MdCloudUpload, MdDelete, MdDescription, MdError, MdImage, MdPictureAsPdf } from 'react-icons/md';

/**
 * Componente para subir múltiples documentos con preview
 */
const DocumentUploader = ({
  onFileSelect,
  onFileRemove,
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
  maxSize = 10 * 1024 * 1024, // 10MB por defecto
  maxFiles = 3,
  disabled = false,
  className = '',
  placeholder = 'Seleccionar documentos...',
  error = null,
  value = [], // Array de archivos actuales
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [validationError, setValidationError] = useState(null);
  const fileInputRef = useRef(null);

  // Crear previews cuando se seleccionan archivos
  useEffect(() => {
    if (value && value.length > 0) {
      const urls = value.map(file => URL.createObjectURL(file));
      setPreviewUrls(urls);
      return () => urls.forEach(url => URL.revokeObjectURL(url));
    } else {
      setPreviewUrls([]);
    }
  }, [value]);

  // Validar archivo
  const validateFile = useCallback((file) => {
    if (!file) return false;

    // Validar tipo
    if (!acceptedTypes.includes(file.type)) {
      const allowedTypes = acceptedTypes.map(type => {
        if (type.startsWith('image/')) return type.split('/')[1].toUpperCase();
        if (type === 'application/pdf') return 'PDF';
        return type;
      }).join(', ');
      setValidationError(`Tipo de archivo no permitido. Solo se permiten: ${allowedTypes}`);
      return false;
    }

    // Validar tamaño
    if (file.size > maxSize) {
      const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1);
      setValidationError(`El archivo es demasiado grande. Tamaño máximo: ${maxSizeMB}MB`);
      return false;
    }

    return true;
  }, [acceptedTypes, maxSize]);

  // Validar múltiples archivos
  const validateFiles = useCallback((files) => {
    setValidationError(null);

    if (!files || files.length === 0) {
      setValidationError('No se han seleccionado archivos');
      return false;
    }

    if (files.length > maxFiles) {
      setValidationError(`Máximo ${maxFiles} archivos permitidos`);
      return false;
    }

    for (let i = 0; i < files.length; i++) {
      if (!validateFile(files[i])) {
        return false;
      }
    }

    return true;
  }, [maxFiles, validateFile]);

  // Manejar selección de archivos
  const handleFileSelect = useCallback((files) => {
    const fileArray = Array.from(files);
    
    if (validateFiles(fileArray)) {
      onFileSelect(fileArray);
    }
  }, [validateFiles, onFileSelect]);

  // Manejar click en el input
  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  // Manejar drag and drop
  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelect(files);
    }
  }, [disabled, handleFileSelect]);

  // Manejar cambio en input
  const handleInputChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files);
    }
  };

  // Remover archivo específico
  const removeFile = (index) => {
    if (!disabled) {
      const newFiles = value.filter((_, i) => i !== index);
      onFileRemove(newFiles);
    }
  };

  // Obtener icono según tipo de archivo
  const getFileIcon = (file) => {
    if (file.type.startsWith('image/')) {
      return <MdImage className="w-6 h-6 text-blue-500" />;
    } else if (file.type === 'application/pdf') {
      return <MdPictureAsPdf className="w-6 h-6 text-red-500" />;
    } else {
      return <MdDescription className="w-6 h-6 text-gray-500" />;
    }
  };

  // Formatear tamaño de archivo
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const displayError = error || validationError;

  return (
    <div className={`w-full ${className}`}>
      {/* Área de drop */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${dragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${displayError ? 'border-red-300 bg-red-50' : ''}
        `}
        onClick={handleClick}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleInputChange}
          className="hidden"
          disabled={disabled}
        />

        <div className="flex flex-col items-center space-y-2">
          <MdCloudUpload className={`w-12 h-12 ${displayError ? 'text-red-400' : 'text-gray-400'}`} />
          <div>
            <p className={`text-sm font-medium ${displayError ? 'text-red-600' : 'text-gray-700'}`}>
              {placeholder}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Máximo {maxFiles} archivos • {formatFileSize(maxSize)} por archivo
            </p>
            <p className="text-xs text-gray-500">
              Tipos permitidos: {acceptedTypes.map(type => {
                if (type.startsWith('image/')) return type.split('/')[1].toUpperCase();
                if (type === 'application/pdf') return 'PDF';
                return type;
              }).join(', ')}
            </p>
          </div>
        </div>
      </div>

      {/* Error */}
      {displayError && (
        <div className="mt-2 flex items-center space-x-1 text-red-600">
          <MdError className="w-4 h-4" />
          <span className="text-sm">{displayError}</span>
        </div>
      )}

      {/* Lista de archivos seleccionados */}
      {value && value.length > 0 && (
        <div className="mt-4 space-y-2">
          <p className="text-sm font-medium text-gray-700">
            Archivos seleccionados ({value.length}/{maxFiles}):
          </p>
          <div className="space-y-2">
            {value.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                <div className="flex items-center space-x-3">
                  {getFileIcon(file)}
                  <div>
                    <p className="text-sm font-medium text-gray-900">{file.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="p-1 text-red-500 hover:text-red-700 hover:bg-red-100 rounded"
                  disabled={disabled}
                >
                  <MdDelete className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Previews de imágenes */}
      {previewUrls.length > 0 && (
        <div className="mt-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Vista previa:</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {previewUrls.map((url, index) => (
              <div key={index} className="relative">
                <img
                  src={url}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-24 object-cover rounded-lg border"
                />
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                  disabled={disabled}
                >
                  <MdDelete className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

DocumentUploader.propTypes = {
  onFileSelect: PropTypes.func.isRequired,
  onFileRemove: PropTypes.func.isRequired,
  acceptedTypes: PropTypes.arrayOf(PropTypes.string),
  maxSize: PropTypes.number,
  maxFiles: PropTypes.number,
  disabled: PropTypes.bool,
  className: PropTypes.string,
  placeholder: PropTypes.string,
  error: PropTypes.string,
  value: PropTypes.arrayOf(PropTypes.instanceOf(File))
};

export default DocumentUploader;
