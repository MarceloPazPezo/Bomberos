import React, { useState, useEffect } from 'react';
import { MdClose, MdSave, MdError } from 'react-icons/md';
import { XCircleIcon } from '@heroicons/react/24/outline';
import PropTypes from 'prop-types';

/**
 * Modal para editar un EPP existente
 */
const EditEppModal = ({ isOpen, onClose, onSave, epp, tiposEpp, estadosEpp, readOnlyFields = [] }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    idTipoEpp: '',
    idEstadoEpp: '',
    descripcionDeEstado: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Cargar datos del EPP cuando se abre el modal
  useEffect(() => {
    if (isOpen && epp) {
      setFormData({
        nombre: epp.nombre || '',
        idTipoEpp: epp.idTipoEpp || epp.tipoEpp?.id || '',
        idEstadoEpp: epp.idEstadoEpp || epp.estadosEpp?.id || '',
        descripcionDeEstado: epp.descripcionDeEstado || ''
      });
      setErrors({});
    }
  }, [isOpen, epp]);

  // Verificar si un campo es de solo lectura
  const isFieldReadOnly = (fieldName) => {
    return readOnlyFields.includes(fieldName);
  };

  // Validar campo individual
  const validateField = (name, value) => {
    // No validar campos de solo lectura
    if (isFieldReadOnly(name)) {
      return null;
    }

    switch (name) {
      case 'nombre':
        if (!value || value.trim() === '') {
          return 'El nombre es requerido';
        }
        if (value.trim().length < 3) {
          return 'El nombre debe tener al menos 3 caracteres';
        }
        if (value.trim().length > 100) {
          return 'El nombre no puede exceder 100 caracteres';
        }
        break;
      case 'idTipoEpp':
        if (!value) {
          return 'El tipo de EPP es requerido';
        }
        break;
      case 'idEstadoEpp':
        if (!value) {
          return 'El estado es requerido';
        }
        break;
      case 'descripcionDeEstado':
        if (value && value.trim().length > 500) {
          return 'La descripción no puede exceder 500 caracteres';
        }
        break;
      default:
        break;
    }
    return null;
  };

  // Manejar cambios en los inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Validar en tiempo real
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  // Validar todo el formulario
  const validateForm = () => {
    const newErrors = {};
    
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) {
        newErrors[key] = error;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // Preparar datos (convertir IDs a números)
      // Solo incluir campos que no sean de solo lectura
      const dataToSend = {};
      
      if (!isFieldReadOnly('nombre')) {
        dataToSend.nombre = formData.nombre.trim();
      }
      if (!isFieldReadOnly('idTipoEpp')) {
        dataToSend.idTipoEpp = parseInt(formData.idTipoEpp);
      }
      if (!isFieldReadOnly('idEstadoEpp')) {
        dataToSend.idEstadoEpp = parseInt(formData.idEstadoEpp);
      }
      if (!isFieldReadOnly('descripcionDeEstado')) {
        dataToSend.descripcionDeEstado = formData.descripcionDeEstado.trim() || null;
      }

      await onSave(dataToSend);
      onClose();
    } catch (error) {
      console.error('Error al actualizar EPP:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !epp) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-[#4EB9FA] to-[#3A9BD9] rounded-t-2xl">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white rounded-lg">
              <MdSave className="w-6 h-6 text-[#3A9BD9]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                Editar EPP
              </h2>
              <p className="text-blue-100 text-sm">
                ID: {epp.id} - Modifique la información del equipo
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-3 text-white hover:bg-red-500 hover:bg-opacity-80 rounded-lg transition-colors"
            disabled={loading}
          >
            <MdClose className="w-6 h-6 text-red-300 hover:text-white" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-4 max-h-[65vh] bg-gray-50/50 space-y-4">
          {/* Nombre */}
          <div>
            <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
              Nombre del EPP {!isFieldReadOnly('nombre') && <span className="text-red-500">*</span>}
              {isFieldReadOnly('nombre') && <span className="text-xs text-gray-500 ml-2">(Solo lectura)</span>}
            </label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.nombre ? 'border-red-500' : 'border-gray-300'
              } ${isFieldReadOnly('nombre') ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              placeholder="Ej: Casco Bombero Principal"
              disabled={loading || isFieldReadOnly('nombre')}
              readOnly={isFieldReadOnly('nombre')}
            />
            {errors.nombre && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <MdError className="w-4 h-4" />
                {errors.nombre}
              </p>
            )}
          </div>

          {/* Tipo de EPP */}
          <div>
            <label htmlFor="idTipoEpp" className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de EPP {!isFieldReadOnly('idTipoEpp') && <span className="text-red-500">*</span>}
              {isFieldReadOnly('idTipoEpp') && <span className="text-xs text-gray-500 ml-2">(Solo lectura)</span>}
            </label>
            <select
              id="idTipoEpp"
              name="idTipoEpp"
              value={formData.idTipoEpp}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.idTipoEpp ? 'border-red-500' : 'border-gray-300'
              } ${isFieldReadOnly('idTipoEpp') ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              disabled={loading || isFieldReadOnly('idTipoEpp')}
            >
              <option value="">Seleccione un tipo</option>
              {tiposEpp.map(tipo => (
                <option key={tipo.id} value={tipo.id}>
                  {tipo.nombre}
                </option>
              ))}
            </select>
            {errors.idTipoEpp && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <MdError className="w-4 h-4" />
                {errors.idTipoEpp}
              </p>
            )}
          </div>

          {/* Estado */}
          <div>
            <label htmlFor="idEstadoEpp" className="block text-sm font-medium text-gray-700 mb-1">
              Estado <span className="text-red-500">*</span>
            </label>
            <select
              id="idEstadoEpp"
              name="idEstadoEpp"
              value={formData.idEstadoEpp}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.idEstadoEpp ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={loading}
            >
              <option value="">Seleccione un estado</option>
              {estadosEpp.map(estado => (
                <option key={estado.id} value={estado.id}>
                  {estado.nombre}
                </option>
              ))}
            </select>
            {errors.idEstadoEpp && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <MdError className="w-4 h-4" />
                {errors.idEstadoEpp}
              </p>
            )}
          </div>

          {/* Descripción del Estado */}
          <div>
            <label htmlFor="descripcionDeEstado" className="block text-sm font-medium text-gray-700 mb-1">
              Descripción del Estado
            </label>
            <textarea
              id="descripcionDeEstado"
              name="descripcionDeEstado"
              value={formData.descripcionDeEstado}
              onChange={handleChange}
              rows={3}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none ${
                errors.descripcionDeEstado ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Ej: Equipo en perfecto estado, recién inspeccionado"
              disabled={loading}
            />
            {errors.descripcionDeEstado && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <MdError className="w-4 h-4" />
                {errors.descripcionDeEstado}
              </p>
            )}
          </div>

        </form>

        {/* Footer con botones */}
        <div className="flex justify-end px-6 py-4 bg-white border-t border-gray-200 rounded-b-2xl">
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex items-center space-x-2 px-4 py-2.5 text-red-700 bg-white border border-red-300 rounded-lg hover:bg-red-50 hover:border-red-400 transition-all duration-200 font-medium"
              disabled={loading}
            >
              <MdClose className="w-4 h-4 text-red-500" />
              <span>Cancelar</span>
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              className={`flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-[#4EB9FA] to-[#3A9BD9] text-white rounded-lg hover:from-[#3A9BD9] hover:to-[#2E8BC7] transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <MdSave className="w-4 h-4" />
                  <span>Guardar Cambios</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

EditEppModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  epp: PropTypes.object,
  tiposEpp: PropTypes.array.isRequired,
  estadosEpp: PropTypes.array.isRequired,
  readOnlyFields: PropTypes.arrayOf(PropTypes.string)
};

export default EditEppModal;

