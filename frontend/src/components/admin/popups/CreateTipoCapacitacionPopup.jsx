import React, { useState, useRef, useEffect } from 'react';
import Form from '@components/Form';
import LoadingSpinner from '@components/LoadingSpinner';
import ModalPortal from '@components/ModalPortal';
import { MdClose, MdSchool, MdSave } from 'react-icons/md';
import PropTypes from 'prop-types';
import { createTipoCapacitacion } from '@services/tipoCapacitacion.service';
import { toStartCase } from '@helpers/textFormatters.js';
import { toast } from 'react-toastify';

export default function CreateTipoCapacitacionPopup({ show, setShow, onTipoCapacitacionCreated, onCreatingChange }) {
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: ''
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
            nombre: '',
            descripcion: ''
        });
    };

    // Validar un campo específico en tiempo real
    const validateField = (field, value) => {
        if (field === 'nombre') {
            if (!value || value.trim().length === 0) {
                return 'El nombre no puede estar vacío.';
            } else if (value.trim().length < 2) {
                return 'El nombre debe tener como mínimo 2 caracteres.';
            } else if (value.trim().length > 100) {
                return 'El nombre debe tener como máximo 100 caracteres.';
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

    // Validar datos del tipo de capacitación
    const validateTipoCapacitacionData = (data) => {
        const newErrors = {};

        if (!data.nombre || data.nombre.trim().length === 0) {
            newErrors.nombre = 'El nombre no puede estar vacío.';
        } else if (data.nombre.trim().length < 2) {
            newErrors.nombre = 'El nombre debe tener como mínimo 2 caracteres.';
        } else if (data.nombre.trim().length > 100) {
            newErrors.nombre = 'El nombre debe tener como máximo 100 caracteres.';
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
            const tipoErrors = validateTipoCapacitacionData(formData);
            
            if (Object.keys(tipoErrors).length > 0) {
                setErrors(tipoErrors);
                setLoading(false);
                if (onCreatingChange) onCreatingChange(false);
                return;
            }

            // Crear tipo de capacitación
            const result = await createTipoCapacitacion({ 
                nombre: formData.nombre.trim(),
                descripcion: formData.descripcion?.trim() || null
            });

            if (!result) {
                setErrors({ general: 'Error al crear el tipo de capacitación' });
                setLoading(false);
                if (onCreatingChange) onCreatingChange(false);
                return;
            }

            toast.success(`Tipo de capacitación "${toStartCase(result.nombre)}" creado exitosamente`);
            handleClose();
            
            // Notificar al componente padre
            if (onTipoCapacitacionCreated) {
                onTipoCapacitacionCreated(result);
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || 'Error al crear el tipo de capacitación';
            setErrors({ general: errorMessage });
            toast.error(errorMessage);
        } finally {
            setLoading(false);
            if (onCreatingChange) onCreatingChange(false);
        }
    };

    if (!show) return null;

    return (
        <ModalPortal>
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-[#4EB9FA] to-[#3A9BD9] rounded-t-2xl">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-white rounded-lg">
                            <MdSchool className="w-6 h-6 text-[#3A9BD9]" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">
                                Crear Nuevo Tipo de Capacitación
                            </h2>
                            <p className="text-blue-100 text-sm">
                                Complete la información para registrar un nuevo tipo de capacitación
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

                    <div className="space-y-6">
                        <Form
                            ref={formRef}
                            title={null}
                            autoComplete="off"
                            size="w-full"
                            defaultValues={formData}
                            fields={[
                                {
                                    label: "Nombre del Tipo de Capacitación",
                                    name: "nombre",
                                    placeholder: 'Ej: Primeros Auxilios, Rescate en Altura...',
                                    fieldType: 'input',
                                    type: "text",
                                    required: true,
                                    minLength: 2,
                                    maxLength: 100,
                                    errorMessageData: errors.nombre,
                                    onChange: (e) => handleInputChange('nombre', e.target.value),
                                    autoComplete: "off"
                                },
                                {
                                    label: "Descripción",
                                    name: "descripcion",
                                    placeholder: 'Descripción opcional del tipo de capacitación...',
                                    fieldType: 'textarea',
                                    rows: 4,
                                    required: false,
                                    errorMessageData: errors.descripcion,
                                    onChange: (e) => handleInputChange('descripcion', e.target.value),
                                    autoComplete: "off"
                                }
                            ]}
                            onSubmit={() => {}} // No submit automático
                            backgroundColor={'#fff'}
                        />
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
                                    <span>Crear Tipo de Capacitación</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
        </ModalPortal>
    );
}

CreateTipoCapacitacionPopup.propTypes = {
    show: PropTypes.bool.isRequired,
    setShow: PropTypes.func.isRequired,
    onTipoCapacitacionCreated: PropTypes.func,
    onCreatingChange: PropTypes.func
};

