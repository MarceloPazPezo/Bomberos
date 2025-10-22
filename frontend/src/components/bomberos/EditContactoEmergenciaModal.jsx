import React, { useState, useEffect } from 'react';
import { 
  MdClose, 
  MdSave, 
  MdEmergency, 
  MdPerson, 
  MdPhone, 
  MdFamilyRestroom
} from 'react-icons/md';

/**
 * Modal para agregar o editar contactos de emergencia
 * @param {Object} props - Propiedades del componente
 * @param {boolean} props.isOpen - Si el modal está abierto
 * @param {Object|null} props.contacto - Datos del contacto (null para nuevo)
 * @param {Function} props.onClose - Función para cerrar el modal
 * @param {Function} props.onSave - Función para guardar los cambios
 * @returns {JSX.Element} Modal de edición de contacto de emergencia
 */
const EditContactoEmergenciaModal = ({ isOpen, contacto, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    nombreCompleto: '',
    telefono: '',
    vinculo: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Opciones de vínculo predefinidas
  const vinculosComunes = [
    'Padre',
    'Madre',
    'Hijo(a)',
    'Hermano(a)',
    'Cónyuge',
    'Pareja',
    'Abuelo(a)',
    'Tío(a)',
    'Primo(a)',
    'Amigo(a)',
    'Otro'
  ];

  // Inicializar datos del formulario
  useEffect(() => {
    if (isOpen) {
      if (contacto) {
        // Modo edición
        setFormData({
          nombreCompleto: contacto.nombreCompleto || '',
          telefono: contacto.telefono || '',
          vinculo: contacto.vinculo?.nombre || ''
        });
      } else {
        // Modo creación
        setFormData({
          nombreCompleto: '',
          telefono: '',
          vinculo: ''
        });
      }
      setErrors({});
    }
  }, [isOpen, contacto]);

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

    // Validar nombre completo
    if (!formData.nombreCompleto.trim()) {
      newErrors.nombreCompleto = 'El nombre completo es obligatorio';
    } else if (formData.nombreCompleto.trim().length < 2) {
      newErrors.nombreCompleto = 'El nombre debe tener al menos 2 caracteres';
    }

    // Validar teléfono
    if (!formData.telefono.trim()) {
      newErrors.telefono = 'El teléfono es obligatorio';
    } else if (!/^[\+]?[0-9\s\-\(\)]{8,15}$/.test(formData.telefono)) {
      newErrors.telefono = 'Formato de teléfono inválido';
    }

    // Validar vínculo
    if (!formData.vinculo.trim()) {
      newErrors.vinculo = 'El vínculo es obligatorio';
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
      console.error('Error al guardar contacto de emergencia:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        {/* Header del modal */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <MdEmergency className="w-6 h-6" />
              <h2 className="text-xl font-bold">
                {contacto ? 'Editar Contacto de Emergencia' : 'Agregar Contacto de Emergencia'}
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
            {/* Nombre Completo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MdPerson className="inline w-4 h-4 mr-2" />
                Nombre Completo *
              </label>
              <input
                type="text"
                value={formData.nombreCompleto}
                onChange={(e) => handleChange('nombreCompleto', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.nombreCompleto ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Ingresa el nombre completo"
                disabled={loading}
              />
              {errors.nombreCompleto && (
                <p className="mt-1 text-sm text-red-600">{errors.nombreCompleto}</p>
              )}
            </div>

            {/* Teléfono */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MdPhone className="inline w-4 h-4 mr-2" />
                Teléfono *
              </label>
              <input
                type="tel"
                value={formData.telefono}
                onChange={(e) => handleChange('telefono', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.telefono ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="+56 9 1234 5678"
                disabled={loading}
              />
              {errors.telefono && (
                <p className="mt-1 text-sm text-red-600">{errors.telefono}</p>
              )}
            </div>

            {/* Vínculo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MdFamilyRestroom className="inline w-4 h-4 mr-2" />
                Vínculo *
              </label>
              <select
                value={formData.vinculo}
                onChange={(e) => handleChange('vinculo', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.vinculo ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={loading}
              >
                <option value="">Selecciona un vínculo</option>
                {vinculosComunes.map((vinculo) => (
                  <option key={vinculo} value={vinculo}>
                    {vinculo}
                  </option>
                ))}
              </select>
              {errors.vinculo && (
                <p className="mt-1 text-sm text-red-600">{errors.vinculo}</p>
              )}
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
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <MdSave className="w-4 h-4" />
                  <span>{contacto ? 'Actualizar' : 'Agregar'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditContactoEmergenciaModal;
