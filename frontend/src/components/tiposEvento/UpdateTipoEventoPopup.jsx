import React, { useState, useRef, useEffect } from 'react';
import Form from '../Form';
import LoadingSpinner from '@components/LoadingSpinner';
import { MdClose, MdEvent, MdSave } from 'react-icons/md';
import PropTypes from 'prop-types';

export default function UpdateTipoEventoPopup({ show, setShow, editingTipoEvento, onTipoEventoUpdated }) {
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const formRef = useRef(null);

    // Función para enfocar el primer campo con error (solo cuando se envía el formulario)
    const focusFirstErrorField = () => {
        const errorFields = Object.keys(errors);
        if (errorFields.length > 0) {
            const firstErrorField = errorFields[0];
            
            // Buscar el elemento del campo con error
            const fieldElement = document.querySelector(`[name="${firstErrorField}"]`);
            if (fieldElement) {
                // Hacer scroll hasta el elemento
                fieldElement.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'center' 
                });
                
                // Enfocar el elemento después de un pequeño delay para que el scroll termine
                setTimeout(() => {
                    fieldElement.focus();
                }, 300);
            }
        }
    };

    // useEffect para manejar tecla Escape y scroll lock
    useEffect(() => {
        const handleEscape = (event) => {
            if (event.key === 'Escape' && show) {
                handleClose();
            }
        };

        if (show) {
            // Bloquear scroll del body cuando el popup está abierto
            document.body.style.overflow = 'hidden';
            document.addEventListener('keydown', handleEscape);
        } else {
            // Restaurar scroll del body cuando el popup se cierra
            document.body.style.overflow = 'unset';
        }

        return () => {
            // Limpiar al desmontar el componente
            document.body.style.overflow = 'unset';
            document.removeEventListener('keydown', handleEscape);
        };
    }, [show]);

    // Inicializar cuando se abre el modal con datos del tipo de evento a editar
    useEffect(() => {
        if (show && editingTipoEvento) {
            setErrors({});
        } else if (show && !editingTipoEvento) {
            // Si no hay tipo de evento para editar, cerrar el modal
            setShow(false);
        }
    }, [show, editingTipoEvento]);

    // Función para manejar click fuera del modal
    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            handleClose();
        }
    };
    
    const handleInputChange = (field, value) => {
        // Validar en tiempo real y actualizar errores en una sola operación
        const fieldError = validateField(field, value);
        setErrors(prev => ({
            ...prev,
            [field]: fieldError
        }));
    };

    // Validar campo individual
    const validateField = (field, value) => {
        switch (field) {
            case 'nombre':
                if (!value || value.trim() === '') {
                    return 'El nombre del tipo de evento es requerido';
                } else if (value.trim().length < 2) {
                    return 'El nombre debe tener al menos 2 caracteres';
                } else if (value.trim().length > 100) {
                    return 'El nombre no puede exceder 100 caracteres';
                } else if (!/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s-_]+$/.test(value.trim())) {
                    return 'El nombre solo puede contener letras, números, espacios, guiones o guiones bajos';
                }
                return null;
            
            case 'descripcion':
                if (value && value.length > 500) {
                    return 'La descripción no puede exceder 500 caracteres';
                }
                return null;
            
            default:
                return null;
        }
    };

    // Validar formulario completo
    const validateForm = (formData) => {
        const newErrors = {};

        // Validar nombre
        const nombreError = validateField('nombre', formData.nombre);
        if (nombreError) {
            newErrors.nombre = nombreError;
        }

        // Validar descripción
        const descripcionError = validateField('descripcion', formData.descripcion);
        if (descripcionError) {
            newErrors.descripcion = descripcionError;
        }

        return newErrors;
    };

    const errorData = (errorDetails) => {
        setErrors(errorDetails || {});
    };

    const handleSubmit = async (updatedTipoEventoData) => {
        if (updatedTipoEventoData && editingTipoEvento) {
            setLoading(true);
            try {
                // Validar formulario completo
                const validationErrors = validateForm(updatedTipoEventoData);
                
                // Si hay errores de validación, mostrarlos
                if (Object.keys(validationErrors).length > 0) {
                    setErrors(validationErrors);
                    setLoading(false);
                    // Enfocar el primer campo con error solo después de validación fallida
                    setTimeout(() => {
                        focusFirstErrorField();
                    }, 100);
                    return;
                }

                // Pasar los datos al callback para que el componente padre maneje la actualización
                if (onTipoEventoUpdated) {
                    const result = await onTipoEventoUpdated(updatedTipoEventoData);
                    if (result.success) {
                        setShow(false);
                        setErrors({});
                    } else if (result.error && typeof result.error === 'object') {
                        // Si el error es un objeto, son errores específicos por campo
                        errorData(result.error);
                    } else if (result.error) {
                        // Si el error es un string, es un error general
                        console.error('Error general:', result.error);
                    }
                }
            } catch (error) {
                console.error('Error updating tipo evento:', error);
            } finally {
                setLoading(false);
            }
        }
    };

    const handleClose = () => {
        setShow(false);
        setErrors({});
    };

    return (
        <div>
            {show && editingTipoEvento && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
                    onClick={handleBackdropClick}
                >
                    <div className="relative w-full max-w-xs sm:max-w-2xl h-auto p-0 animate-fade-in flex flex-col rounded-2xl bg-white shadow-2xl border border-gray-200 max-h-[90vh]">
                        {/* Header mejorado */}
                        <div className="flex items-center px-4 sm:px-6 py-4 bg-gradient-to-r from-[#4EB9FA] to-[#3A9BD9] rounded-t-2xl">
                            <div className="flex items-center space-x-3 flex-1">
                                <div className="p-2 bg-white/20 rounded-lg">
                                    <MdEvent className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">Editar Tipo de Evento</h2>
                                    <p className="text-sm text-white/80">{editingTipoEvento.nombre}</p>
                                </div>
                            </div>
                            <button
                                className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-all duration-200 group"
                                onClick={handleClose}
                                aria-label="Cerrar (Esc)"
                                title="Cerrar (Esc)"
                            >
                                <MdClose className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
                            </button>
                        </div>

                        {/* Contenido mejorado */}
                        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 max-h-[70vh] bg-gray-50/50">
                            {/* Mostrar error general si existe */}
                            {errors.general && (
                                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                                    <p className="text-sm text-red-600">{errors.general}</p>
                                </div>
                            )}

                            {/* Formulario básico */}
                            <Form
                                ref={formRef}
                                title={null}
                                autoComplete="off"
                                size="max-w-xs sm:max-w-2xl"
                                fields={[
                                    {
                                        label: "Nombre del tipo de evento",
                                        name: "nombre",
                                        placeholder: 'Ej: Incendio, Capacitación, Simulacro, etc.',
                                        fieldType: 'input',
                                        type: "text",
                                        required: true,
                                        minLength: 2,
                                        maxLength: 100,
                                        pattern: /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s-_]+$/,
                                        patternMessage: "Solo se permiten letras, números, espacios, guiones y guiones bajos",
                                        errorMessageData: errors.nombre,
                                        onChange: (e) => handleInputChange('nombre', e.target.value),
                                        autoComplete: "off",
                                        defaultValue: editingTipoEvento.nombre
                                    },
                                    {
                                        label: "Descripción",
                                        name: "descripcion",
                                        placeholder: 'Describe este tipo de evento...',
                                        fieldType: 'textarea',
                                        required: false,
                                        minLength: 0,
                                        maxLength: 500,
                                        errorMessageData: errors.descripcion,
                                        onChange: (e) => handleInputChange('descripcion', e.target.value),
                                        autoComplete: "off",
                                        rows: 4,
                                        defaultValue: editingTipoEvento.descripcion
                                    }
                                ]}
                                onSubmit={handleSubmit}
                                backgroundColor={'#fff'}
                                hideSubmitButton={true}
                            />
                        </div>

                        {/* Botones mejorados */}
                        <div className="flex justify-end space-x-3 px-4 sm:px-6 py-4 bg-white border-t border-gray-200 rounded-b-2xl">
                            <button
                                type="button"
                                onClick={handleClose}
                                className="flex items-center space-x-2 px-4 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium"
                                disabled={loading}
                            >
                                <MdClose className="w-4 h-4" />
                                <span>Cancelar</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    // Activar el submit del formulario
                                    const form = document.querySelector('form');
                                    if (form) {
                                        const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
                                        form.dispatchEvent(submitEvent);
                                    }
                                }}
                                className={`flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-[#4EB9FA] to-[#3A9BD9] text-white rounded-lg hover:from-[#3A9BD9] hover:to-[#2E8BC7] transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <LoadingSpinner variant="spinner" size="sm" color="white" />
                                        <span>Actualizando...</span>
                                    </>
                                ) : (
                                    <>
                                        <MdSave className="w-4 h-4" />
                                        <span>Actualizar Tipo de Evento</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

UpdateTipoEventoPopup.propTypes = {
    show: PropTypes.bool.isRequired,
    setShow: PropTypes.func.isRequired,
    editingTipoEvento: PropTypes.object,
    onTipoEventoUpdated: PropTypes.func.isRequired,
};

