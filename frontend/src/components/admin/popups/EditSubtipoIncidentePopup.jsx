import React, { useState, useRef, useEffect } from 'react';
import Form from '@components/Form';
import LoadingSpinner from '@components/LoadingSpinner';
import { MdClose, MdWarning, MdSave } from 'react-icons/md';
import PropTypes from 'prop-types';
import { updateSubtipoIncidente } from '@services/subtipoIncidente.service';
import { getClasificacionesEmergencia } from '@services/subtipoIncidente.service';
import { fetchClavesRadiales } from '@services/claveRadial.service';
import { toast } from 'react-toastify';

export default function EditSubtipoIncidentePopup({ show, setShow, data, onSubtipoIncidenteUpdated, onUpdatingChange }) {
    const subtipoData = data || {};
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [loadingOptions, setLoadingOptions] = useState(true);
    const [formData, setFormData] = useState({
        claveRadial: subtipoData.claveRadial || '',
        clasificacion: subtipoData.clasificacion || '',
        descripcion: subtipoData.descripcion || '',
        contieneFuego: subtipoData.contieneFuego || false,
        contieneInmuebles: subtipoData.contieneInmuebles || false,
        contieneVehiculos: subtipoData.contieneVehiculos || false
    });
    const [clavesRadiales, setClavesRadiales] = useState([]);
    const [clasificaciones, setClasificaciones] = useState([]);
    const formRef = useRef(null);

    // Cargar opciones y actualizar formData cuando cambia data
    useEffect(() => {
        if (show && subtipoData) {
            setFormData({
                claveRadial: subtipoData.claveRadial || '',
                clasificacion: subtipoData.clasificacion?.toString() || subtipoData.clasificacion || '',
                descripcion: subtipoData.descripcion || '',
                contieneFuego: subtipoData.contieneFuego || false,
                contieneInmuebles: subtipoData.contieneInmuebles || false,
                contieneVehiculos: subtipoData.contieneVehiculos || false
            });
            loadOptions();
        }
    }, [show, subtipoData]);

    const loadOptions = async () => {
        try {
            setLoadingOptions(true);
            const [clavesData, clasificacionesData] = await Promise.all([
                fetchClavesRadiales({ page: 1, limit: 200 }),
                getClasificacionesEmergencia()
            ]);
            
            const clavesArray = Array.isArray(clavesData) ? clavesData : (clavesData?.data || []);
            const clasificacionesArray = Array.isArray(clasificacionesData) ? clasificacionesData : [];
            
            setClavesRadiales(clavesArray);
            setClasificaciones(clasificacionesArray);
        } catch (error) {
            console.error('Error cargando opciones:', error);
            toast.error('Error al cargar las opciones');
        } finally {
            setLoadingOptions(false);
        }
    };

    // Limpiar errores cuando se abre el modal
    useEffect(() => {
        if (show && subtipoData) {
            setErrors({});
        }
    }, [show, subtipoData]);

    // Manejar tecla Escape
    useEffect(() => {
        const handleEscape = (event) => {
            if (event.key === 'Escape' && show) {
                handleClose();
            }
        };

        if (show) {
            document.body.style.overflow = 'hidden';
            document.addEventListener('keydown', handleEscape);
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
            document.removeEventListener('keydown', handleEscape);
        };
    }, [show]);

    // Función para manejar click fuera del modal
    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget && !loading) {
            handleClose();
        }
    };

    // Limpiar estado al cerrar
    const handleClose = () => {
        if (loading) return;
        setShow(false);
        setErrors({});
    };

    // Validar campos
    const validateField = (field, value) => {
        if (field === 'claveRadial') {
            if (!value || value.trim().length === 0) {
                return 'La clave radial es requerida.';
            }
            if (value.trim().length > 10) {
                return 'La clave radial debe tener como máximo 10 caracteres.';
            }
        }
        if (field === 'clasificacion') {
            if (!value || value === '') {
                return 'La clasificación es requerida.';
            }
        }
        if (field === 'descripcion') {
            if (!value || value.trim().length === 0) {
                return 'La descripción es requerida.';
            }
            if (value.trim().length > 200) {
                return 'La descripción debe tener como máximo 200 caracteres.';
            }
        }
        return null;
    };

    // Manejar cambio de input con validación en tiempo real
    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        
        const fieldError = validateField(field, value);
        setErrors(prev => {
            const newErrors = { ...prev };
            if (fieldError) {
                newErrors[field] = fieldError;
            } else {
                delete newErrors[field];
            }
            return newErrors;
        });
    };

    // Validar datos completos
    const validateSubtipoIncidenteData = (data) => {
        const newErrors = {};

        if (!data.claveRadial || data.claveRadial.trim().length === 0) {
            newErrors.claveRadial = 'La clave radial es requerida.';
        } else if (data.claveRadial.trim().length > 10) {
            newErrors.claveRadial = 'La clave radial debe tener como máximo 10 caracteres.';
        }

        if (!data.clasificacion || data.clasificacion === '') {
            newErrors.clasificacion = 'La clasificación es requerida.';
        }

        if (!data.descripcion || data.descripcion.trim().length === 0) {
            newErrors.descripcion = 'La descripción es requerida.';
        } else if (data.descripcion.trim().length > 200) {
            newErrors.descripcion = 'La descripción debe tener como máximo 200 caracteres.';
        }

        return newErrors;
    };

    // Manejar submit
    const handleSubmit = async () => {
        setLoading(true);
        if (onUpdatingChange) onUpdatingChange(true);
        setErrors({});

        try {
            const subtipoErrors = validateSubtipoIncidenteData(formData);
            
            if (Object.keys(subtipoErrors).length > 0) {
                setErrors(subtipoErrors);
                setLoading(false);
                if (onUpdatingChange) onUpdatingChange(false);
                return;
            }

            const result = await updateSubtipoIncidente(subtipoData.id, { 
                claveRadial: formData.claveRadial.trim(),
                clasificacion: parseInt(formData.clasificacion, 10),
                descripcion: formData.descripcion.trim(),
                contieneFuego: formData.contieneFuego,
                contieneInmuebles: formData.contieneInmuebles,
                contieneVehiculos: formData.contieneVehiculos
            });

            if (!result) {
                setErrors({ general: 'Error al actualizar el subtipo de incidente' });
                setLoading(false);
                if (onUpdatingChange) onUpdatingChange(false);
                return;
            }

            toast.success(`Subtipo de incidente "${result.claveRadial}" actualizado exitosamente`);
            handleClose();
            
            if (onSubtipoIncidenteUpdated) {
                onSubtipoIncidenteUpdated(result);
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.response?.data?.details || error.message || 'Error al actualizar el subtipo de incidente';
            setErrors({ general: errorMessage });
            toast.error(errorMessage);
        } finally {
            setLoading(false);
            if (onUpdatingChange) onUpdatingChange(false);
        }
    };

    if (!show || !subtipoData || !subtipoData.id) return null;

    return (
        <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={handleBackdropClick}
        >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-[#4EB9FA] to-[#3A9BD9] rounded-t-2xl">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-white rounded-lg">
                            <MdWarning className="w-6 h-6 text-[#3A9BD9]" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">
                                Editar Subtipo de Incidente
                            </h2>
                            <p className="text-blue-100 text-sm">
                                Modifique la información del subtipo de incidente
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        className="p-3 text-white hover:bg-red-500 hover:bg-opacity-80 rounded-lg transition-colors"
                        disabled={loading}
                    >
                        <MdClose className="w-6 h-6 text-red-300 hover:text-white" />
                    </button>
                </div>

                {/* Contenido */}
                <div className="flex-1 overflow-y-auto px-6 py-4 max-h-[65vh] bg-gray-50/50">
                    {loading && (
                        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
                            <LoadingSpinner />
                        </div>
                    )}

                    {loadingOptions ? (
                        <div className="flex items-center justify-center py-8">
                            <LoadingSpinner size="md" message="Cargando opciones..." />
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Clave Radial */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Clave Radial <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="claveRadial"
                                    value={formData.claveRadial}
                                    onChange={(e) => handleInputChange('claveRadial', e.target.value)}
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#4EB9FA] focus:border-[#4EB9FA] text-sm ${
                                        errors.claveRadial ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                >
                                    <option value="">Seleccione una clave radial</option>
                                    {clavesRadiales.map((clave) => (
                                        <option key={clave.id} value={clave.nombre}>
                                            {clave.nombre}
                                        </option>
                                    ))}
                                </select>
                                {errors.claveRadial && (
                                    <p className="mt-1 text-xs text-red-600">{errors.claveRadial}</p>
                                )}
                            </div>

                            {/* Clasificación */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Clasificación de Emergencia <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="clasificacion"
                                    value={formData.clasificacion}
                                    onChange={(e) => handleInputChange('clasificacion', e.target.value)}
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#4EB9FA] focus:border-[#4EB9FA] text-sm ${
                                        errors.clasificacion ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                >
                                    <option value="">Seleccione una clasificación</option>
                                    {clasificaciones.map((clasificacion) => (
                                        <option key={clasificacion.id} value={clasificacion.id}>
                                            {clasificacion.nombre}
                                        </option>
                                    ))}
                                </select>
                                {errors.clasificacion && (
                                    <p className="mt-1 text-xs text-red-600">{errors.clasificacion}</p>
                                )}
                            </div>

                            {/* Descripción */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Descripción <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    name="descripcion"
                                    value={formData.descripcion}
                                    onChange={(e) => handleInputChange('descripcion', e.target.value)}
                                    rows={3}
                                    maxLength={200}
                                    placeholder="Descripción del subtipo de incidente..."
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#4EB9FA] focus:border-[#4EB9FA] text-sm resize-none ${
                                        errors.descripcion ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                />
                                <div className="flex justify-between mt-1">
                                    {errors.descripcion && (
                                        <p className="text-xs text-red-600">{errors.descripcion}</p>
                                    )}
                                    <p className="text-xs text-gray-500 ml-auto">
                                        {formData.descripcion.length}/200 caracteres
                                    </p>
                                </div>
                            </div>

                            {/* Checkboxes */}
                            <div className="space-y-3">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Características
                                </label>
                                <div className="space-y-2">
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={formData.contieneFuego}
                                            onChange={(e) => setFormData(prev => ({ ...prev, contieneFuego: e.target.checked }))}
                                            className="mr-2 w-4 h-4 text-[#4EB9FA] border-gray-300 rounded focus:ring-[#4EB9FA]"
                                        />
                                        <span className="text-sm text-gray-700">Contiene Fuego</span>
                                    </label>
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={formData.contieneInmuebles}
                                            onChange={(e) => setFormData(prev => ({ ...prev, contieneInmuebles: e.target.checked }))}
                                            className="mr-2 w-4 h-4 text-[#4EB9FA] border-gray-300 rounded focus:ring-[#4EB9FA]"
                                        />
                                        <span className="text-sm text-gray-700">Contiene Inmuebles</span>
                                    </label>
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={formData.contieneVehiculos}
                                            onChange={(e) => setFormData(prev => ({ ...prev, contieneVehiculos: e.target.checked }))}
                                            className="mr-2 w-4 h-4 text-[#4EB9FA] border-gray-300 rounded focus:ring-[#4EB9FA]"
                                        />
                                        <span className="text-sm text-gray-700">Contiene Vehículos</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Error general */}
                    {errors.general && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-700 text-sm">{errors.general}</p>
                        </div>
                    )}
                </div>

                {/* Botones */}
                <div className="flex justify-end px-6 py-4 bg-white border-t border-gray-200 rounded-b-2xl">
                    <div className="flex space-x-3">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="flex items-center space-x-2 px-4 py-2.5 text-red-700 bg-white border border-red-300 rounded-lg hover:bg-red-50 hover:border-red-400 transition-all duration-200 font-medium"
                            disabled={loading}
                        >
                            <MdClose className="w-4 h-4 text-red-500" />
                            <span>Cancelar</span>
                        </button>
                        <button
                            type="button"
                            onClick={handleSubmit}
                            className={`flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-[#4EB9FA] to-[#3A9BD9] text-white rounded-lg hover:from-[#3A9BD9] hover:to-[#2E8BC7] transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105 ${loading || loadingOptions ? 'opacity-50 cursor-not-allowed' : ''}`}
                            disabled={loading || loadingOptions || !formData.claveRadial || !formData.clasificacion || !formData.descripcion.trim()}
                        >
                            {loading ? (
                                <LoadingSpinner size="sm" />
                            ) : (
                                <>
                                    <MdSave className="w-4 h-4" />
                                    <span>Actualizar Subtipo de Incidente</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

EditSubtipoIncidentePopup.propTypes = {
    show: PropTypes.bool.isRequired,
    setShow: PropTypes.func.isRequired,
    data: PropTypes.object,
    onSubtipoIncidenteUpdated: PropTypes.func,
    onUpdatingChange: PropTypes.func
};

