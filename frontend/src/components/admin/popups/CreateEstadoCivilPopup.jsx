import React, { useState, useRef } from 'react';
import Form from '@components/Form';
import LoadingSpinner from '@components/LoadingSpinner';
import { MdClose, MdPersonAdd, MdSave, MdInfo, MdError } from 'react-icons/md';
import PropTypes from 'prop-types';
import { useEstadoCivil } from '@hooks/estadoCivil/useEstadoCivil.jsx';
import { showErrorAlert } from '@helpers/fireAlert.js';
import { toStartCase } from '@helpers/textFormatters.js';

export default function CreateEstadoCivilPopup({ show, setShow, onEstadoCivilCreated, onCreatingChange }) {
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        nombre: ''
    });
    const formRef = useRef(null);

    // Hook para crear estado civil
    const { createEstadoCivil } = useEstadoCivil();

    // Limpiar formulario al cerrar
    const handleClose = () => {
        setFormData({ nombre: '' });
        setErrors({});
        setLoading(false);
        if (onCreatingChange) {
            onCreatingChange(false);
        }
        setShow(false);
    };

    // Validar un campo específico
    const validateField = (field, value) => {
        if (field === 'nombre') {
            if (!value || value.trim() === '') {
                return 'El nombre del estado civil es requerido';
            } else if (value.trim().length < 2) {
                return 'El nombre debe tener al menos 2 caracteres';
            } else if (value.trim().length > 50) {
                return 'El nombre no puede exceder 50 caracteres';
            } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/.test(value.trim())) {
                return 'Solo se permiten letras y espacios. No se permiten números, guiones o símbolos especiales';
            }
        }
        return null;
    };

    // Manejar cambios en los inputs
    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        
        // Validar en tiempo real
        const fieldError = validateField(field, value);
        setErrors(prev => ({
            ...prev,
            [field]: fieldError
        }));
    };

    // Validar formulario
    const validateForm = () => {
        const newErrors = {};

        if (!formData.nombre || formData.nombre.trim() === '') {
            newErrors.nombre = 'El nombre del estado civil es requerido';
        } else if (formData.nombre.trim().length < 2) {
            newErrors.nombre = 'El nombre debe tener al menos 2 caracteres';
        } else if (formData.nombre.trim().length > 50) {
            newErrors.nombre = 'El nombre no puede exceder 50 caracteres';
        } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/.test(formData.nombre.trim())) {
            newErrors.nombre = 'El nombre solo puede contener letras y espacios. No se permiten números, guiones o símbolos especiales';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Manejar envío del formulario
    const handleSubmit = async () => {
        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setErrors({});
        if (onCreatingChange) {
            onCreatingChange(true);
        }

        try {
            const result = await createEstadoCivil({
                nombre: formData.nombre.trim()
            });

            if (result.success) {
                handleClose();
                if (onEstadoCivilCreated) {
                    onEstadoCivilCreated();
                }
            } else {
                // Solo manejar errores de validación del campo (unicidad)
                if (result.message && result.message.includes('Ya existe un estado civil con ese nombre')) {
                    setErrors({ nombre: 'Ya existe un estado civil con ese nombre' });
                }
                // Los demás errores ya los maneja el hook con FireAlert
            }
        } catch (error) {
            console.error('Error creating estado civil:', error);
            
            // Solo manejar error de unicidad del backend
            if (error.response?.data?.message && error.response.data.message.includes('Ya existe un estado civil con ese nombre')) {
                setErrors({ nombre: 'Ya existe un estado civil con ese nombre' });
            }
            // Los demás errores ya los maneja el hook con FireAlert
        } finally {
            setLoading(false);
            if (onCreatingChange) {
                onCreatingChange(false);
            }
        }
    };

    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-[#4EB9FA] to-[#3A9BD9] rounded-t-2xl">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-white rounded-lg">
                            <MdPersonAdd className="w-6 h-6 text-[#3A9BD9]" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">
                                Crear Estado Civil
                            </h2>
                            <p className="text-blue-100 text-sm">
                                Agregue un nuevo estado civil al sistema
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
                <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                    {/* Formulario */}
                    <div className="space-y-6">
                            <Form
                                ref={formRef}
                                fields={[
                                    {
                                        label: "Nombre del Estado Civil",
                                        name: "nombre",
                                        fieldType: 'input',
                                        type: "text",
                                        placeholder: "Ej: Soltero, Casado, Viudo, Divorciado",
                                        required: true,
                                        minLength: 2,
                                        maxLength: 50,
                                        pattern: "^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\\s]+$",
                                        patternMessage: "Solo se permiten letras y espacios",
                                        errorMessageData: errors.nombre,
                                        onChange: (e) => handleInputChange('nombre', e.target.value),
                                        value: formData.nombre,
                                        autoComplete: "off"
                                    }
                                ]}
                                onSubmit={() => {}} // No submit en el formulario, manejamos con botón
                                backgroundColor={'#fff'}
                            />
                    </div>

                    {/* Error de unicidad - más sutil */}
                    {errors.nombre && errors.nombre.includes('Ya existe') && (
                        <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2">
                            <MdError className="text-amber-600 flex-shrink-0" size={18} />
                            <p className="text-amber-700 text-sm">{errors.nombre}</p>
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
                            disabled={loading}
                        >
                            {loading ? (
                                <LoadingSpinner size="sm" />
                            ) : (
                                <>
                                    <MdSave className="w-4 h-4" />
                                    <span>Crear Estado Civil</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

CreateEstadoCivilPopup.propTypes = {
    show: PropTypes.bool.isRequired,
    setShow: PropTypes.func.isRequired,
    onEstadoCivilCreated: PropTypes.func,
    onCreatingChange: PropTypes.func
};
