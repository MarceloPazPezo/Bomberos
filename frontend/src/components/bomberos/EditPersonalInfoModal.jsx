import React, { useState, useEffect } from 'react';
import { 
  MdClose, 
  MdSave, 
  MdPerson, 
  MdEmail, 
  MdPhone, 
  MdLocationOn,
  MdDateRange,
  MdWork
} from 'react-icons/md';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Modal para editar información personal del bombero
 * @param {Object} props - Propiedades del componente
 * @param {boolean} props.isOpen - Si el modal está abierto
 * @param {Object} props.bombero - Datos del bombero
 * @param {Function} props.onClose - Función para cerrar el modal
 * @param {Function} props.onSave - Función para guardar los cambios
 * @returns {JSX.Element} Modal de edición de información personal
 */
const EditPersonalInfoModal = ({ isOpen, bombero, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    telefono: '',
    fechaNacimiento: '',
    fechaIngreso: '',
    direccion: {
      calle: '',
      numero: '',
      comuna: ''
    }
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Inicializar datos del formulario
  useEffect(() => {
    if (isOpen && bombero) {
      setFormData({
        nombres: Array.isArray(bombero.nombres) ? bombero.nombres.join(' ') : bombero.nombres || '',
        apellidos: Array.isArray(bombero.apellidos) ? bombero.apellidos.join(' ') : bombero.apellidos || '',
        telefono: bombero.ficha?.telefono || '',
        fechaNacimiento: bombero.ficha?.fechaNacimiento || '',
        fechaIngreso: bombero.ficha?.fechaIngreso || '',
        direccion: {
          calle: bombero.ficha?.direccion?.calle || '',
          numero: bombero.ficha?.direccion?.numero || '',
          comuna: bombero.ficha?.direccion?.comuna?.nombre || ''
        }
      });
      setErrors({});
    }
  }, [isOpen, bombero]);

  // Función para formatear fecha para input
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    try {
      return format(new Date(dateString), 'yyyy-MM-dd');
    } catch {
      return '';
    }
  };

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

  // Manejar cambios en la dirección
  const handleAddressChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      direccion: {
        ...prev.direccion,
        [field]: value
      }
    }));
  };

  // Validar formulario
  const validateForm = () => {
    const newErrors = {};

    // Validar nombres
    if (!formData.nombres.trim()) {
      newErrors.nombres = 'Los nombres son obligatorios';
    }

    // Validar apellidos
    if (!formData.apellidos.trim()) {
      newErrors.apellidos = 'Los apellidos son obligatorios';
    }

    // Validar teléfono (opcional pero si se proporciona debe ser válido)
    if (formData.telefono && !/^[\+]?[0-9\s\-\(\)]{8,15}$/.test(formData.telefono)) {
      newErrors.telefono = 'Formato de teléfono inválido';
    }

    // Validar fechas
    if (formData.fechaNacimiento) {
      const birthDate = new Date(formData.fechaNacimiento);
      const today = new Date();
      if (birthDate >= today) {
        newErrors.fechaNacimiento = 'La fecha de nacimiento debe ser anterior a hoy';
      }
    }

    if (formData.fechaIngreso) {
      const entryDate = new Date(formData.fechaIngreso);
      const today = new Date();
      if (entryDate > today) {
        newErrors.fechaIngreso = 'La fecha de ingreso no puede ser futura';
      }
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
      // Preparar datos para enviar
      const dataToSave = {
        nombres: formData.nombres.split(' ').filter(n => n.trim()),
        apellidos: formData.apellidos.split(' ').filter(n => n.trim()),
        telefono: formData.telefono || null,
        fechaNacimiento: formData.fechaNacimiento || null,
        fechaIngreso: formData.fechaIngreso || null,
        direccion: {
          calle: formData.direccion.calle || null,
          numero: formData.direccion.numero || null,
          comuna: formData.direccion.comuna || null
        }
      };

      await onSave(dataToSave);
      onClose();
    } catch (error) {
      console.error('Error al guardar información personal:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header del modal */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <MdPerson className="w-6 h-6" />
              <h2 className="text-xl font-bold">Editar Información Personal</h2>
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
            {/* Nombres y Apellidos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombres *
                </label>
                <input
                  type="text"
                  value={formData.nombres}
                  onChange={(e) => handleChange('nombres', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.nombres ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ingresa tus nombres"
                  disabled={loading}
                />
                {errors.nombres && (
                  <p className="mt-1 text-sm text-red-600">{errors.nombres}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Apellidos *
                </label>
                <input
                  type="text"
                  value={formData.apellidos}
                  onChange={(e) => handleChange('apellidos', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.apellidos ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ingresa tus apellidos"
                  disabled={loading}
                />
                {errors.apellidos && (
                  <p className="mt-1 text-sm text-red-600">{errors.apellidos}</p>
                )}
              </div>
            </div>

            {/* Teléfono */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MdPhone className="inline w-4 h-4 mr-2" />
                Teléfono
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

            {/* Fechas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MdDateRange className="inline w-4 h-4 mr-2" />
                  Fecha de Nacimiento
                </label>
                <input
                  type="date"
                  value={formatDateForInput(formData.fechaNacimiento)}
                  onChange={(e) => handleChange('fechaNacimiento', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.fechaNacimiento ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={loading}
                />
                {errors.fechaNacimiento && (
                  <p className="mt-1 text-sm text-red-600">{errors.fechaNacimiento}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MdWork className="inline w-4 h-4 mr-2" />
                  Fecha de Ingreso
                </label>
                <input
                  type="date"
                  value={formatDateForInput(formData.fechaIngreso)}
                  onChange={(e) => handleChange('fechaIngreso', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.fechaIngreso ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={loading}
                />
                {errors.fechaIngreso && (
                  <p className="mt-1 text-sm text-red-600">{errors.fechaIngreso}</p>
                )}
              </div>
            </div>

            {/* Dirección */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                <MdLocationOn className="inline w-4 h-4 mr-2" />
                Dirección
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <input
                    type="text"
                    value={formData.direccion.calle}
                    onChange={(e) => handleAddressChange('calle', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nombre de la calle"
                    disabled={loading}
                  />
                </div>
                <div>
                  <input
                    type="text"
                    value={formData.direccion.numero}
                    onChange={(e) => handleAddressChange('numero', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Número"
                    disabled={loading}
                  />
                </div>
              </div>
              <div className="mt-4">
                <input
                  type="text"
                  value={formData.direccion.comuna}
                  onChange={(e) => handleAddressChange('comuna', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Comuna"
                  disabled={loading}
                />
              </div>
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
                  <span>Guardar Cambios</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPersonalInfoModal;
