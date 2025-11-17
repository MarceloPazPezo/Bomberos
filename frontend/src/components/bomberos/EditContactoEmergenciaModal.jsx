import React, { useState, useEffect, useMemo } from 'react';
import { 
  MdClose, 
  MdSave, 
  MdEmergency, 
  MdPerson, 
  MdPhone, 
  MdFamilyRestroom
} from 'react-icons/md';
import LoadingSpinner from '@components/LoadingSpinner';
import Select from 'react-select';
import { fetchVinculos } from '@services/vinculo.service';

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
  const [vinculos, setVinculos] = useState([]);
  const [loadingVinculos, setLoadingVinculos] = useState(false);

  // Cargar vínculos dinámicamente
  useEffect(() => {
    const loadVinculos = async () => {
      if (!isOpen) return;
      
      setLoadingVinculos(true);
      try {
        const data = await fetchVinculos({ limit: 200 });
        const vinculosArray = Array.isArray(data) ? data : (data?.data || []);
        setVinculos(vinculosArray);
      } catch (error) {
        console.error('Error al cargar vínculos:', error);
        setVinculos([]);
      } finally {
        setLoadingVinculos(false);
      }
    };

    loadVinculos();
  }, [isOpen]);

  // Opciones de vínculo (formato para react-select)
  const vinculosComunes = useMemo(() => {
    return vinculos.map((vinculo) => ({
      label: vinculo.nombre,
      value: vinculo.nombre,
    }));
  }, [vinculos]);

  // Estilos del Select (igual que en crear-parte)
  const commonSelectStyles = useMemo(() => ({
    control: (base, state) => ({
      ...base,
      borderColor: state.isFocused ? '#4EB9FA' : errors.vinculo ? '#EF4444' : '#D1D5DB',
      borderWidth: '2px',
      boxShadow: state.isFocused ? '0 0 0 3px rgba(78, 185, 250, 0.1)' : 'none',
      '&:hover': {
        borderColor: errors.vinculo ? '#EF4444' : '#4EB9FA',
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
  }), [errors.vinculo]);

  const selectMenuPortalTarget = typeof window !== 'undefined' ? document.body : null;

  // Opción seleccionada actual
  const selectedVinculoOption = useMemo(() => {
    if (!formData.vinculo) return null;
    return vinculosComunes.find((opt) => opt.value === formData.vinculo) || null;
  }, [formData.vinculo, vinculosComunes]);

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
    if (!formData.vinculo || !formData.vinculo.trim()) {
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-[#4EB9FA] to-[#3A9BD9] rounded-t-2xl">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white rounded-lg">
              <MdEmergency className="w-6 h-6 text-[#3A9BD9]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                {contacto ? 'Editar Contacto de Emergencia' : 'Agregar Contacto de Emergencia'}
              </h2>
              <p className="text-blue-100 text-sm">
                {contacto ? 'Modifica la información del contacto' : 'Agrega un nuevo contacto de emergencia'}
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
            {/* Nombre Completo */}
            <div>
              <label className="block text-sm font-semibold text-[#2C3E50] mb-1.5">
                <div className="flex items-center gap-1">
                  <MdPerson className="w-4 h-4" />
                  <span>Nombre Completo *</span>
                </div>
              </label>
              <input
                type="text"
                value={formData.nombreCompleto}
                onChange={(e) => handleChange('nombreCompleto', e.target.value)}
                className={`w-full px-4 py-3 h-[44px] border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4EB9FA] transition-all ${
                  errors.nombreCompleto ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
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
              <label className="block text-sm font-semibold text-[#2C3E50] mb-1.5">
                <div className="flex items-center gap-1">
                  <MdPhone className="w-4 h-4" />
                  <span>Teléfono *</span>
                </div>
              </label>
              <input
                type="tel"
                value={formData.telefono}
                onChange={(e) => handleChange('telefono', e.target.value)}
                className={`w-full px-4 py-3 h-[44px] border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4EB9FA] transition-all ${
                  errors.telefono ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
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
              <label className="block text-sm font-semibold text-[#2C3E50] mb-1.5">
                <div className="flex items-center gap-1">
                  <MdFamilyRestroom className="w-4 h-4" />
                  <span>Vínculo *</span>
                </div>
              </label>
              <Select
                inputId="vinculo"
                isSearchable
                isClearable
                isDisabled={loading || loadingVinculos}
                isLoading={loadingVinculos}
                value={selectedVinculoOption}
                options={vinculosComunes}
                menuPortalTarget={selectMenuPortalTarget}
                onChange={(option) => {
                  handleChange('vinculo', option?.value ?? '');
                }}
                placeholder={loadingVinculos ? 'Cargando vínculos...' : 'Buscar vínculo...'}
                noOptionsMessage={() => 
                  loadingVinculos ? 'Cargando...' : 'No se encontraron coincidencias'
                }
                styles={commonSelectStyles}
                classNamePrefix="vinculo-select"
              />
              {errors.vinculo && (
                <p className="mt-1 text-sm text-red-600">{errors.vinculo}</p>
              )}
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
                  <span>{contacto ? 'Actualizar' : 'Agregar'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditContactoEmergenciaModal;
