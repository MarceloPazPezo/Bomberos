import React, { useState, useEffect } from 'react';
import { 
  MdClose, 
  MdSave, 
  MdSchool, 
  MdDescription, 
  MdCategory
} from 'react-icons/md';

/**
 * Modal para agregar o editar capacitaciones
 * @param {Object} props - Propiedades del componente
 * @param {boolean} props.isOpen - Si el modal está abierto
 * @param {Object|null} props.capacitacion - Datos de la capacitación (null para nueva)
 * @param {Function} props.onClose - Función para cerrar el modal
 * @param {Function} props.onSave - Función para guardar los cambios
 * @returns {JSX.Element} Modal de edición de capacitación
 */
const EditCapacitacionModal = ({ isOpen, capacitacion, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    tipoCapacitacion: '',
    descripcion: '',
    descripcionTipo: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Tipos de capacitación predefinidos
  const tiposCapacitacion = [
    'Primeros Auxilios',
    'Manejo de Extintores',
    'Rescate en Altura',
    'Manejo de Materiales Peligrosos',
    'Liderazgo y Comando',
    'Comunicaciones de Emergencia',
    'Rescate Acuático',
    'Rescate Vehicular',
    'Manejo de Incidentes',
    'Prevención de Riesgos',
    'Capacitación Técnica',
    'Otro'
  ];

  // Inicializar datos del formulario
  useEffect(() => {
    if (isOpen) {
      if (capacitacion) {
        // Modo edición
        setFormData({
          tipoCapacitacion: capacitacion.tipoCapacitacion?.nombre || '',
          descripcion: capacitacion.descripcion || '',
          descripcionTipo: capacitacion.tipoCapacitacion?.descripcion || ''
        });
      } else {
        // Modo creación
        setFormData({
          tipoCapacitacion: '',
          descripcion: '',
          descripcionTipo: ''
        });
      }
      setErrors({});
    }
  }, [isOpen, capacitacion]);

  // Manejar cambios en el formulario
  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpiar error del campo
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  // Validar formulario
  const validateForm = () => {
    const newErrors = {};

    // Validar tipo de capacitación
    if (!formData.tipoCapacitacion.trim()) {
      newErrors.tipoCapacitacion = 'El tipo de capacitación es obligatorio';
    }

    // Validar descripción (opcional pero si se proporciona debe tener al menos 10 caracteres)
    if (formData.descripcion && formData.descripcion.trim().length < 10) {
      newErrors.descripcion = 'La descripción debe tener al menos 10 caracteres';
    }

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
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error al guardar capacitación:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        {/* Header del modal */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <MdSchool className="w-6 h-6" />
              <h2 className="text-xl font-bold">
                {capacitacion ? 'Editar Capacitación' : 'Agregar Capacitación'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
              disabled={loading}
            >
              <MdClose className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Contenido del modal */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* Tipo de Capacitación */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MdCategory className="inline w-4 h-4 mr-2" />
                Tipo de Capacitación *
              </label>
              <select
                value={formData.tipoCapacitacion}
                onChange={(e) => handleChange('tipoCapacitacion', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  errors.tipoCapacitacion ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={loading}
              >
                <option value="">Selecciona un tipo de capacitación</option>
                {tiposCapacitacion.map((tipo) => (
                  <option key={tipo} value={tipo}>
                    {tipo}
                  </option>
                ))}
              </select>
              {errors.tipoCapacitacion && (
                <p className="mt-1 text-sm text-red-600">{errors.tipoCapacitacion}</p>
              )}
            </div>

            {/* Descripción del Tipo (solo si es "Otro") */}
            {formData.tipoCapacitacion === 'Otro' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Especificar Tipo de Capacitación
                </label>
                <input
                  type="text"
                  value={formData.descripcionTipo}
                  onChange={(e) => handleChange('descripcionTipo', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Especifica el tipo de capacitación"
                  disabled={loading}
                />
              </div>
            )}

            {/* Descripción */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MdDescription className="inline w-4 h-4 mr-2" />
                Descripción
              </label>
              <textarea
                value={formData.descripcion}
                onChange={(e) => handleChange('descripcion', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  errors.descripcion ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Describe los detalles de la capacitación, institución, fecha, etc."
                rows={4}
                disabled={loading}
              />
              {errors.descripcion && (
                <p className="mt-1 text-sm text-red-600">{errors.descripcion}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Opcional: Incluye detalles como institución, fecha, duración, certificación, etc.
              </p>
            </div>
          </div>

          {/* Botones */}
          <div className="flex items-center justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <MdSave className="w-4 h-4" />
                  <span>{capacitacion ? 'Actualizar' : 'Agregar'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCapacitacionModal;
