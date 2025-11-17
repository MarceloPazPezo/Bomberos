import React, { useState, useRef, useEffect } from 'react';
import Form from '@components/Form';
import LoadingSpinner from '@components/LoadingSpinner';
import ModalPortal from '@components/ModalPortal';
import { MdClose, MdRadioButtonChecked, MdSave } from 'react-icons/md';
import PropTypes from 'prop-types';
import { updateClaveRadial } from '@services/claveRadial.service';
import { toStartCase } from '@helpers/textFormatters.js';
import { toast } from 'react-toastify';

export default function EditClaveRadialPopup({ show, setShow, data, onClaveRadialUpdated, onUpdatingChange }) {
    const claveRadialData = data || {};
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const formRef = useRef(null);

    // Limpiar errores cuando se abre el modal
    useEffect(() => {
        if (show && claveRadialData) {
            setErrors({});
        }
    }, [show, claveRadialData]);

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

    // Validar un campo específico en tiempo real
    const validateField = (field, value) => {
        const namePattern = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s'-]*$/; // Permite vacío mientras escribe

        if (field === 'nombre') {
            if (!value || value.trim().length === 0) {
                return 'El nombre no puede estar vacío.';
            } else if (value.trim().length < 2) {
                return 'El nombre debe tener como mínimo 2 caracteres.';
            } else if (value.trim().length > 50) {
                return 'El nombre debe tener como máximo 50 caracteres.';
            } else if (!namePattern.test(value.trim())) {
                return 'El nombre solo puede contener letras, números, espacios, apóstrofes o guiones.';
            }
        }
        return null;
    };

    // Manejar cambio de input con validación en tiempo real
    const handleInputChange = (field, value) => {
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

    // Validar datos de la clave radial
    const validateClaveRadialData = (data) => {
        const newErrors = {};
        const namePattern = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s'-]+$/;

        if (!data.nombre || data.nombre.trim().length === 0) {
            newErrors.nombre = 'El nombre no puede estar vacío.';
        } else if (data.nombre.trim().length < 2) {
            newErrors.nombre = 'El nombre debe tener como mínimo 2 caracteres.';
        } else if (data.nombre.trim().length > 50) {
            newErrors.nombre = 'El nombre debe tener como máximo 50 caracteres.';
        } else if (!namePattern.test(data.nombre.trim())) {
            newErrors.nombre = 'El nombre solo puede contener letras, números, espacios, apóstrofes o guiones.';
        }

        return newErrors;
    };

    // Manejar submit desde el Form
    const handleSubmit = async (formValues) => {
        setLoading(true);
        if (onUpdatingChange) onUpdatingChange(true);
        setErrors({});

        try {
            // Validar datos
            const claveRadialErrors = validateClaveRadialData(formValues);
            
            if (Object.keys(claveRadialErrors).length > 0) {
                setErrors(claveRadialErrors);
                setLoading(false);
                if (onUpdatingChange) onUpdatingChange(false);
                return;
            }

            // Actualizar clave radial
            const result = await updateClaveRadial(claveRadialData.id, { 
                nombre: formValues.nombre.trim() 
            });

            if (!result) {
                setErrors({ general: 'Error al actualizar la clave radial' });
                setLoading(false);
                if (onUpdatingChange) onUpdatingChange(false);
                return;
            }

            toast.success(`Clave radial "${toStartCase(result.nombre)}" actualizada exitosamente`);
            handleClose();
            
            // Notificar al componente padre
            if (onClaveRadialUpdated) {
                onClaveRadialUpdated(result);
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || 'Error al actualizar la clave radial';
            setErrors({ general: errorMessage });
            toast.error(errorMessage);
        } finally {
            setLoading(false);
            if (onUpdatingChange) onUpdatingChange(false);
        }
    };

    if (!show || !claveRadialData || !claveRadialData.id) return null;

    return (
        <ModalPortal>
            <div 
                className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
                onClick={handleBackdropClick}
            >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-[#4EB9FA] to-[#3A9BD9] rounded-t-2xl">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-white rounded-lg">
                            <MdRadioButtonChecked className="w-6 h-6 text-[#3A9BD9]" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">
                                Editar Clave Radial
                            </h2>
                            <p className="text-blue-100 text-sm">
                                Modifique la información de la clave radial
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
                            key={`edit-clave-radial-${claveRadialData.id || 'new'}`}
                            ref={formRef}
                            title={null}
                            autoComplete="off"
                            size="w-full"
                            defaultValues={{
                                nombre: claveRadialData.nombre || ''
                            }}
                            fields={[
                                {
                                    label: "Nombre de la Clave Radial",
                                    name: "nombre",
                                    placeholder: 'Ej: 10-20, 10-40, Alarma...',
                                    fieldType: 'input',
                                    type: "text",
                                    required: true,
                                    minLength: 2,
                                    maxLength: 50,
                                    pattern: /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s'-]+$/,
                                    patternMessage: "El nombre solo puede contener letras, números, espacios, apóstrofes o guiones.",
                                    errorMessageData: errors.nombre,
                                    defaultValue: claveRadialData.nombre || '',
                                    onChange: (e) => handleInputChange('nombre', e.target.value),
                                    autoComplete: "off"
                                }
                            ]}
                            onSubmit={handleSubmit}
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
                            onClick={() => {
                                // Obtener los valores del formulario y llamar a handleSubmit
                                if (formRef.current?.getValues) {
                                    const formValues = formRef.current.getValues();
                                    handleSubmit(formValues);
                                }
                            }}
                            className={`flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-[#4EB9FA] to-[#3A9BD9] text-white rounded-lg hover:from-[#3A9BD9] hover:to-[#2E8BC7] transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            disabled={loading}
                        >
                            {loading ? (
                                <LoadingSpinner size="sm" />
                            ) : (
                                <>
                                    <MdSave className="w-4 h-4" />
                                    <span>Actualizar Clave Radial</span>
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

EditClaveRadialPopup.propTypes = {
    show: PropTypes.bool.isRequired,
    setShow: PropTypes.func.isRequired,
    data: PropTypes.object,
    onClaveRadialUpdated: PropTypes.func,
    onUpdatingChange: PropTypes.func
};

