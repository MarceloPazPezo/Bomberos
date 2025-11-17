import React, { useState, useRef, useEffect } from 'react';
import LoadingSpinner from '@components/LoadingSpinner';
import { MdClose, MdCategory, MdSave } from 'react-icons/md';
import PropTypes from 'prop-types';
import { createClasificacionEmergencia } from '@services/clasificacionEmergencia.service';
import { toStartCase } from '@helpers/textFormatters.js';
import { toast } from 'react-toastify';

export default function CreateClasificacionEmergenciaPopup({ show, setShow, onClasificacionEmergenciaCreated, onCreatingChange }) {
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        nombre: ''
    });
    const formRef = useRef(null);

    // Función para enfocar el primer campo con error
    const focusFirstErrorField = () => {
        const errorFields = Object.keys(errors);
        if (errorFields.length > 0) {
            const firstErrorField = errorFields[0];
            const fieldElement = document.querySelector(`[name="${firstErrorField}"]`);
            if (fieldElement) {
                fieldElement.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'center' 
                });
                setTimeout(() => {
                    fieldElement.focus();
                }, 300);
            }
        }
    };

    useEffect(() => {
        if (Object.keys(errors).length > 0) {
            focusFirstErrorField();
        }
    }, [errors]);

    // Limpiar estado al cerrar
    const handleClose = () => {
        setShow(false);
        setErrors({});
        setLoading(false);
        setFormData({
            nombre: ''
        });
    };

    // Validar un campo específico en tiempo real
    const validateField = (field, value) => {
        const namePattern = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s'-]*$/; // Permite vacío mientras escribe

        if (field === 'nombre') {
            if (!value || value.trim().length === 0) {
                return 'El nombre no puede estar vacío.';
            } else if (value.trim().length < 2) {
                return 'El nombre debe tener como mínimo 2 caracteres.';
            } else if (value.trim().length > 100) {
                return 'El nombre debe tener como máximo 100 caracteres.';
            } else if (!namePattern.test(value.trim())) {
                return 'El nombre solo puede contener letras, números, espacios, apóstrofes o guiones.';
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
        
        // Validación en tiempo real
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

    // Validar datos de la clasificación de emergencia
    const validateClasificacionData = (data) => {
        const newErrors = {};
        const namePattern = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s'-]+$/;

        if (!data.nombre || data.nombre.trim().length === 0) {
            newErrors.nombre = 'El nombre no puede estar vacío.';
        } else if (data.nombre.trim().length < 2) {
            newErrors.nombre = 'El nombre debe tener como mínimo 2 caracteres.';
        } else if (data.nombre.trim().length > 100) {
            newErrors.nombre = 'El nombre debe tener como máximo 100 caracteres.';
        } else if (!namePattern.test(data.nombre.trim())) {
            newErrors.nombre = 'El nombre solo puede contener letras, números, espacios, apóstrofes o guiones.';
        }

        return newErrors;
    };

    // Manejar submit
    const handleSubmit = async () => {
        setLoading(true);
        if (onCreatingChange) onCreatingChange(true);
        setErrors({});

        try {
            // Validar datos
            const clasificacionErrors = validateClasificacionData(formData);
            
            if (Object.keys(clasificacionErrors).length > 0) {
                setErrors(clasificacionErrors);
                setLoading(false);
                if (onCreatingChange) onCreatingChange(false);
                return;
            }

            const result = await createClasificacionEmergencia({ 
                nombre: formData.nombre.trim()
            });

            if (!result) {
                setErrors({ general: 'Error al crear la clasificación de emergencia' });
                setLoading(false);
                if (onCreatingChange) onCreatingChange(false);
                return;
            }

            toast.success(`Clasificación de emergencia "${toStartCase(result.nombre)}" creada exitosamente`);
            handleClose();
            
            if (onClasificacionEmergenciaCreated) {
                onClasificacionEmergenciaCreated(result);
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.response?.data?.details || error.message || 'Error al crear la clasificación de emergencia';
            setErrors({ general: errorMessage });
            toast.error(errorMessage);
        } finally {
            setLoading(false);
            if (onCreatingChange) onCreatingChange(false);
        }
    };

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

    if (!show) return null;

    return (
        <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={handleBackdropClick}
        >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-[#4EB9FA] to-[#3A9BD9] rounded-t-2xl">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-white rounded-lg">
                            <MdCategory className="w-6 h-6 text-[#3A9BD9]" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">
                                Crear Nueva Clasificación de Emergencia
                            </h2>
                            <p className="text-blue-100 text-sm">
                                Complete la información para registrar una nueva clasificación
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
                <div className="flex-1 overflow-y-auto px-6 py-4 bg-gray-50/50">
                    {loading && (
                        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
                            <LoadingSpinner />
                        </div>
                    )}

                    <div className="space-y-6">
                        {/* Nombre */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Nombre <span className="text-red-500">*</span>
                            </label>
                            <input
                                name="nombre"
                                type="text"
                                value={formData.nombre}
                                onChange={(e) => handleInputChange('nombre', e.target.value)}
                                placeholder="Ej: EDIFICACION, FUEGO EN VEHICULO, etc."
                                maxLength={100}
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#4EB9FA] focus:border-[#4EB9FA] text-sm ${
                                    errors.nombre ? 'border-red-500' : 'border-gray-300'
                                }`}
                            />
                            <div className="flex justify-between mt-1">
                                {errors.nombre && (
                                    <p className="text-xs text-red-600">{errors.nombre}</p>
                                )}
                                <p className="text-xs text-gray-500 ml-auto">
                                    {formData.nombre.length}/100 caracteres
                                </p>
                            </div>
                        </div>
                    </div>

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
                            className={`flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-[#4EB9FA] to-[#3A9BD9] text-white rounded-lg hover:from-[#3A9BD9] hover:to-[#2E8BC7] transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            disabled={loading || !formData.nombre.trim()}
                        >
                            {loading ? (
                                <LoadingSpinner size="sm" />
                            ) : (
                                <>
                                    <MdSave className="w-4 h-4" />
                                    <span>Crear Clasificación</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

CreateClasificacionEmergenciaPopup.propTypes = {
    show: PropTypes.bool.isRequired,
    setShow: PropTypes.func.isRequired,
    onClasificacionEmergenciaCreated: PropTypes.func,
    onCreatingChange: PropTypes.func
};

