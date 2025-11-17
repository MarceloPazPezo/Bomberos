import React, { useState, useEffect } from 'react';
import { 
  MdClose, 
  MdSave,
  MdWarning,
  MdShield
} from 'react-icons/md';
import { useEstadoEpp } from '@hooks/estadoEpp/useEstadoEpp';
import BomberosLoader from '@components/BomberosLoader';

/**
 * Modal para editar la descripción y estado de un EPP asignado
 */
const EditEppModal = ({ isOpen, epp, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    descripcionDeEstado: '',
    idEstadoEpp: null
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // Hook para obtener estados de EPP
  const { estadosEpp, loading: loadingEstados } = useEstadoEpp();

  // Inicializar formulario cuando se abre el modal o cambia el EPP
  useEffect(() => {
    if (isOpen && epp) {
      setFormData({
        descripcionDeEstado: epp.epp?.descripcionDeEstado || '',
        idEstadoEpp: epp.epp?.estadosEpp?.id || epp.epp?.idEstadoEpp || null
      });
      setErrors({});
    }
  }, [isOpen, epp]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpiar error del campo cuando el usuario empieza a escribir
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.idEstadoEpp) {
      newErrors.idEstadoEpp = 'Debe seleccionar un estado';
    }

    if (formData.descripcionDeEstado && formData.descripcionDeEstado.length > 255) {
      newErrors.descripcionDeEstado = 'La descripción no puede exceder 255 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSaving(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error al guardar EPP:', error);
      setErrors({ submit: error.message || 'Error al guardar los cambios' });
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (!saving) {
      setFormData({
        descripcionDeEstado: '',
        idEstadoEpp: null
      });
      setErrors({});
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl transform transition-all">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-white/20 p-2 rounded-lg">
                  <MdShield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">
                    Actualizar EPP
                  </h3>
                  <p className="text-blue-100 text-sm">
                    {epp?.epp?.nombre}
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                disabled={saving}
                className="text-white/80 hover:text-white hover:bg-white/20 rounded-lg p-2 transition-colors disabled:opacity-50"
              >
                <MdClose className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit} className="p-6">
            {/* Información del EPP */}
            <div className="mb-6 bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="block text-gray-600 font-medium mb-1">Tipo de EPP</label>
                  <p className="text-gray-900">{epp?.epp?.tipoEpp?.nombre || 'No especificado'}</p>
                </div>
                <div>
                  <label className="block text-gray-600 font-medium mb-1">Fecha de Asignación</label>
                  <p className="text-gray-900">
                    {epp?.fechaAsignacion ? (() => {
                      const date = new Date(epp.fechaAsignacion);
                      const day = date.getDate().toString().padStart(2, '0');
                      const month = (date.getMonth() + 1).toString().padStart(2, '0');
                      const year = date.getFullYear();
                      return `${day}/${month}/${year}`;
                    })() : 'No especificada'}
                  </p>
                </div>
              </div>
            </div>

            {/* Estado del EPP */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado del EPP <span className="text-red-500">*</span>
              </label>
              {loadingEstados ? (
                <div className="flex items-center justify-center py-4">
                  <BomberosLoader size="sm" message="Cargando estados..." />
                </div>
              ) : (
                <select
                  name="idEstadoEpp"
                  value={formData.idEstadoEpp || ''}
                  onChange={handleChange}
                  disabled={saving}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.idEstadoEpp ? 'border-red-500' : 'border-gray-300'
                  } disabled:bg-gray-100 disabled:cursor-not-allowed`}
                >
                  <option value="">Seleccionar estado...</option>
                  {estadosEpp.map((estado) => (
                    <option key={estado.id} value={estado.id}>
                      {estado.nombre}
                    </option>
                  ))}
                </select>
              )}
              {errors.idEstadoEpp && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <MdWarning className="w-4 h-4 mr-1" />
                  {errors.idEstadoEpp}
                </p>
              )}
            </div>

            {/* Descripción del estado */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción del Estado
              </label>
              <textarea
                name="descripcionDeEstado"
                value={formData.descripcionDeEstado}
                onChange={handleChange}
                disabled={saving}
                rows={4}
                maxLength={255}
                placeholder="Describe el estado actual del EPP, daños, observaciones, etc..."
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none ${
                  errors.descripcionDeEstado ? 'border-red-500' : 'border-gray-300'
                } disabled:bg-gray-100 disabled:cursor-not-allowed`}
              />
              <div className="flex justify-between items-center mt-1">
                <div>
                  {errors.descripcionDeEstado && (
                    <p className="text-sm text-red-600 flex items-center">
                      <MdWarning className="w-4 h-4 mr-1" />
                      {errors.descripcionDeEstado}
                    </p>
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  {formData.descripcionDeEstado.length}/255 caracteres
                </p>
              </div>
            </div>

            {/* Error de submit */}
            {errors.submit && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <MdWarning className="w-5 h-5 text-red-600" />
                  <p className="text-sm text-red-800">{errors.submit}</p>
                </div>
              </div>
            )}

            {/* Botones de acción */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={handleClose}
                disabled={saving}
                className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving || loadingEstados}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Guardando...</span>
                  </>
                ) : (
                  <>
                    <MdSave className="w-5 h-5" />
                    <span>Guardar Cambios</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditEppModal;

