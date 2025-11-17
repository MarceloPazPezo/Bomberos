import React, { useState, useEffect, useMemo } from 'react';
import { 
  MdClose, 
  MdSave, 
  MdSchool, 
  MdDescription, 
  MdCategory
} from 'react-icons/md';
import LoadingSpinner from '@components/LoadingSpinner';
import Select from 'react-select';
import { fetchTiposCapacitacion } from '@services/tipoCapacitacion.service';

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
  const [tiposCapacitacionData, setTiposCapacitacionData] = useState([]);
  const [loadingTiposCapacitacion, setLoadingTiposCapacitacion] = useState(false);

  // Cargar tipos de capacitación dinámicamente
  useEffect(() => {
    const loadTiposCapacitacion = async () => {
      if (!isOpen) return;
      
      setLoadingTiposCapacitacion(true);
      try {
        const data = await fetchTiposCapacitacion({ limit: 200 });
        const tiposArray = Array.isArray(data) ? data : (data?.data || []);
        setTiposCapacitacionData(tiposArray);
      } catch (error) {
        console.error('Error al cargar tipos de capacitación:', error);
        setTiposCapacitacionData([]);
      } finally {
        setLoadingTiposCapacitacion(false);
      }
    };

    loadTiposCapacitacion();
  }, [isOpen]);

  // Tipos de capacitación (formato para react-select)
  const tiposCapacitacion = useMemo(() => {
    return tiposCapacitacionData.map((tipo) => ({
      label: tipo.nombre,
      value: tipo.nombre,
    }));
  }, [tiposCapacitacionData]);

  // Estilos del Select (igual que en crear-parte)
  const commonSelectStyles = useMemo(() => ({
    control: (base, state) => ({
      ...base,
      borderColor: state.isFocused ? '#4EB9FA' : errors.tipoCapacitacion ? '#EF4444' : '#D1D5DB',
      borderWidth: '2px',
      boxShadow: state.isFocused ? '0 0 0 3px rgba(78, 185, 250, 0.1)' : 'none',
      '&:hover': {
        borderColor: errors.tipoCapacitacion ? '#EF4444' : '#4EB9FA',
      },
      minHeight: '44px',
      borderRadius: '10px',
      fontSize: '0.9rem',
    }),
    menu: (base) => ({
      ...base,
      zIndex: 25,
      borderRadius: '10px',
      overflow: 'hidden',
    }),
    menuList: (base) => ({
      ...base,
      maxHeight: '260px',
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? '#4EB9FA'
        : state.isFocused
          ? '#E0F2FE'
          : 'white',
      color: state.isSelected ? '#FFFFFF' : '#1F2937',
      fontSize: '0.9rem',
    }),
    placeholder: (base) => ({
      ...base,
      fontSize: '0.9rem',
      color: '#9CA3AF',
    }),
    input: (base) => ({
      ...base,
      fontSize: '0.9rem',
    }),
    singleValue: (base) => ({
      ...base,
      fontSize: '0.9rem',
      color: '#1F2937',
    }),
    menuPortal: (base) => ({
      ...base,
      zIndex: 9999,
    }),
  }), [errors.tipoCapacitacion]);

  const selectMenuPortalTarget = typeof window !== 'undefined' ? document.body : null;

  // Opción seleccionada actual
  const selectedTipoCapacitacionOption = useMemo(() => {
    if (!formData.tipoCapacitacion) return null;
    return tiposCapacitacion.find((opt) => opt.value === formData.tipoCapacitacion) || null;
  }, [formData.tipoCapacitacion, tiposCapacitacion]);

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
    if (!formData.tipoCapacitacion || !formData.tipoCapacitacion.trim()) {
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-[#4EB9FA] to-[#3A9BD9] rounded-t-2xl">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white rounded-lg">
              <MdSchool className="w-6 h-6 text-[#3A9BD9]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                {capacitacion ? 'Editar Capacitación' : 'Agregar Capacitación'}
              </h2>
              <p className="text-blue-100 text-sm">
                {capacitacion ? 'Modifica la información de la capacitación' : 'Agrega una nueva capacitación'}
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

        {/* Contenido */}
        <div className="flex-1 overflow-y-auto bg-gray-50/50">
          {loading && (
            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-b-2xl">
              <LoadingSpinner />
            </div>
          )}

          <form onSubmit={handleSubmit} className="px-6 py-4">
            <div className="space-y-6">
            {/* Tipo de Capacitación */}
            <div>
              <label className="block text-sm font-semibold text-[#2C3E50] mb-1.5">
                <div className="flex items-center gap-1">
                  <MdCategory className="w-4 h-4" />
                  <span>Tipo de Capacitación *</span>
                </div>
              </label>
              <Select
                inputId="tipoCapacitacion"
                isSearchable
                isClearable
                isDisabled={loading || loadingTiposCapacitacion}
                isLoading={loadingTiposCapacitacion}
                value={selectedTipoCapacitacionOption}
                options={tiposCapacitacion}
                menuPortalTarget={selectMenuPortalTarget}
                onChange={(option) => {
                  handleChange('tipoCapacitacion', option?.value ?? '');
                  // Limpiar descripcionTipo cuando cambia el tipo
                  handleChange('descripcionTipo', '');
                }}
                placeholder={loadingTiposCapacitacion ? 'Cargando tipos de capacitación...' : 'Buscar tipo de capacitación...'}
                noOptionsMessage={() => 
                  loadingTiposCapacitacion ? 'Cargando...' : 'No se encontraron coincidencias'
                }
                styles={commonSelectStyles}
                classNamePrefix="capacitacion-select"
              />
              {errors.tipoCapacitacion && (
                <p className="mt-1 text-sm text-red-600">{errors.tipoCapacitacion}</p>
              )}
            </div>

            {/* Descripción del Tipo - Ya no necesario, pero lo dejamos por compatibilidad */}
            {false && formData.tipoCapacitacion === 'Otro' && (
              <div>
                <label className="block text-sm font-semibold text-[#2C3E50] mb-1.5">
                  Especificar Tipo de Capacitación
                </label>
                <input
                  type="text"
                  value={formData.descripcionTipo}
                  onChange={(e) => handleChange('descripcionTipo', e.target.value)}
                  className="w-full px-4 py-3 h-[44px] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4EB9FA] transition-all"
                  placeholder="Especifica el tipo de capacitación"
                  disabled={loading}
                />
              </div>
            )}

            {/* Descripción */}
            <div>
              <label className="block text-sm font-semibold text-[#2C3E50] mb-1.5">
                <div className="flex items-center gap-1">
                  <MdDescription className="w-4 h-4" />
                  <span>Descripción</span>
                  <span className="text-xs text-gray-500 font-normal">(Opcional)</span>
                </div>
              </label>
              <textarea
                value={formData.descripcion}
                onChange={(e) => handleChange('descripcion', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4EB9FA] transition-all min-h-[100px] resize-y ${
                  errors.descripcion ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
                }`}
                placeholder="Describe los detalles de la capacitación, institución, fecha, etc."
                rows={4}
                disabled={loading}
              />
              {errors.descripcion && (
                <p className="mt-1 text-sm text-red-600">{errors.descripcion}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Incluye detalles como institución, fecha, duración, certificación, etc.
              </p>
            </div>
          </div>

          </form>
        </div>

        {/* Botones */}
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
              type="button"
              onClick={handleSubmit}
              className={`flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-[#4EB9FA] to-[#3A9BD9] text-white rounded-lg hover:from-[#3A9BD9] hover:to-[#2E8BC7] transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={loading}
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
        </div>
      </div>
    </div>
  );
};

export default EditCapacitacionModal;
