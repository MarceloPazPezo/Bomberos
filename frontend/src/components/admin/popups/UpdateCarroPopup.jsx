import React, { useState, useRef, useEffect, useMemo } from 'react';
import { MdClose, MdDirectionsCar, MdSave, MdError } from 'react-icons/md';
import { carroUpdatedToast } from '@helpers/toastHelper.jsx';
import Form from '@components/Form.jsx';
import LoadingSpinner from '@components/LoadingSpinner';
import ModalPortal from '@components/ModalPortal';
import PropTypes from 'prop-types';
import { getCompanias } from '@services/compania.service.js';

/**
 * Popup para actualizar un carro existente
 */
const UpdateCarroPopup = ({ show, setShow, onCarroUpdated, onUpdatingChange, carroData }) => {
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [companias, setCompanias] = useState([]);
    const [loadingCompanias, setLoadingCompanias] = useState(false);
    const [formData, setFormData] = useState({
        patente: '',
        capacidadPasajeros: '',
        idCompania: ''
    });
    const formRef = useRef(null);

    // Cargar compañías cuando se abre el popup
    useEffect(() => {
        if (show) {
            loadCompanias();
        }
    }, [show]);

    // Cargar datos del carro cuando cambia carroData o cuando se abre el popup
    useEffect(() => {
        if (carroData && show) {
            const newFormData = {
                patente: carroData.patente || '',
                capacidadPasajeros: carroData.capacidadPasajeros || '',
                idCompania: carroData.idCompania || ''
            };
            setFormData(newFormData);
        }
    }, [carroData, show]);

    // Efecto separado para setear valores en el formulario cuando esté disponible
    useEffect(() => {
        if (formData.patente && formRef.current) {
            formRef.current.setValue('patente', formData.patente);
            formRef.current.setValue('capacidadPasajeros', formData.capacidadPasajeros);
        }
    }, [formData.patente, formData.capacidadPasajeros]);

    // Función para cargar compañías
    const loadCompanias = async () => {
        setLoadingCompanias(true);
        try {
            const response = await getCompanias();
            if (response.status === 'Success' && response.data) {
                const companiasData = Array.isArray(response.data) ? response.data : response.data.companias || [];
                setCompanias(companiasData);
            }
        } catch (error) {
            console.error('Error al cargar compañías:', error);
            setCompanias([]);
        } finally {
            setLoadingCompanias(false);
        }
    };

    // Preparar opciones para el select de compañías
    const companiasOptions = useMemo(() => {
        return companias.map(compania => ({
            value: compania.id.toString(),
            label: compania.nombre
        }));
    }, [companias]);

    // Efecto para setear el valor de compañía cuando las compañías se carguen
    useEffect(() => {
        if (companias.length > 0 && formData.idCompania && formRef.current) {
            const idCompaniaString = formData.idCompania.toString();
            formRef.current.setValue('idCompania', idCompaniaString);
        }
    }, [companias, formData.idCompania]);

    // Limpiar formulario al cerrar
    const handleClose = () => {
        setFormData({
            patente: '',
            capacidadPasajeros: '',
            idCompania: ''
        });
        setErrors({});
        setLoading(false);
        if (onUpdatingChange) {
            onUpdatingChange(false);
        }
        setShow(false);
    };

    // Validar un campo específico
    const validateField = (field, value) => {
        if (field === 'patente') {
            if (!value || value.trim() === '') {
                return 'La patente es requerida';
            } else if (value.trim().length < 2) {
                return 'La patente debe tener al menos 2 caracteres';
            } else if (value.trim().length > 20) {
                return 'La patente no puede exceder 20 caracteres';
            } else if (!/^[A-Z0-9\s-]+$/.test(value.trim())) {
                return 'La patente solo puede contener letras mayúsculas, números, espacios y guiones';
            }
        } else if (field === 'capacidadPasajeros') {
            if (!value || value.trim() === '') {
                return 'La capacidad de pasajeros es requerida';
            } else if (!/^\d+$/.test(value.trim())) {
                return 'La capacidad debe contener solo números';
            } else {
                const num = parseInt(value);
                if (num < 1) {
                    return 'La capacidad debe ser al menos 1';
                } else if (num > 50) {
                    return 'La capacidad no puede exceder 50';
                }
            }
        } else if (field === 'idCompania') {
            if (!value || value === '') {
                return 'La compañía es requerida';
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

        if (!formData.patente || formData.patente.trim() === '') {
            newErrors.patente = 'La patente es requerida';
        } else if (formData.patente.trim().length < 2) {
            newErrors.patente = 'La patente debe tener al menos 2 caracteres';
        } else if (formData.patente.trim().length > 20) {
            newErrors.patente = 'La patente no puede exceder 20 caracteres';
        } else if (!/^[A-Z0-9\s-]+$/.test(formData.patente.trim())) {
            newErrors.patente = 'La patente solo puede contener letras mayúsculas, números, espacios y guiones';
        }

        if (formData.capacidadPasajeros && formData.capacidadPasajeros !== '') {
            const num = parseInt(formData.capacidadPasajeros);
            if (isNaN(num)) {
                newErrors.capacidadPasajeros = 'La capacidad debe ser un número válido';
            } else if (num < 1) {
                newErrors.capacidadPasajeros = 'La capacidad debe ser al menos 1';
            } else if (num > 50) {
                newErrors.capacidadPasajeros = 'La capacidad no puede exceder 50';
            }
        }

        if (!formData.idCompania || formData.idCompania === '') {
            newErrors.idCompania = 'La compañía es requerida';
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
        if (onUpdatingChange) {
            onUpdatingChange(true);
        }

        try {
            const carroData = {
                patente: formData.patente.trim().toUpperCase(),
                capacidadPasajeros: formData.capacidadPasajeros ? parseInt(formData.capacidadPasajeros) : null,
                idCompania: parseInt(formData.idCompania)
            };

            if (onCarroUpdated) {
                await onCarroUpdated(carroData);
                carroUpdatedToast(formData.patente);
                handleClose();
            }
        } catch (error) {
            console.error('Error al actualizar carro:', error);
            
            // Manejar error de unicidad del backend
            if (error.response?.data?.message && error.response.data.message.includes('Ya existe un carro con esa patente')) {
                setErrors({ patente: 'Ya existe un carro con esa patente' });
            }
        } finally {
            setLoading(false);
            if (onUpdatingChange) {
                onUpdatingChange(false);
            }
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
                            <MdDirectionsCar className="w-6 h-6 text-[#3A9BD9]" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">
                                Editar Carro
                            </h2>
                            <p className="text-blue-100 text-sm">
                                Modifique la información del carro
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
                            defaultValues={{
                                patente: formData.patente,
                                capacidadPasajeros: formData.capacidadPasajeros,
                                idCompania: formData.idCompania ? formData.idCompania.toString() : ''
                            }}
                            fields={[
                                {
                                    label: "Patente del Carro",
                                    name: "patente",
                                    fieldType: 'input',
                                    type: "text",
                                    placeholder: "Ej: ABC-123, DEF-456",
                                    required: true,
                                    minLength: 2,
                                    maxLength: 20,
                                    pattern: "^[A-Z0-9\\s-]+$",
                                    patternMessage: "Solo letras mayúsculas, números, espacios y guiones",
                                    errorMessageData: errors.patente,
                                    onChange: (e) => handleInputChange('patente', e.target.value.toUpperCase()),
                                    autoComplete: "off"
                                },
                                {
                                    label: "Capacidad de Pasajeros",
                                    name: "capacidadPasajeros",
                                    fieldType: 'input',
                                    type: "number",
                                    placeholder: "Ej: 6, 8, 4",
                                    min: 1,
                                    max: 50,
                                    step: 1,
                                    required: true,
                                    errorMessageData: errors.capacidadPasajeros,
                                    onChange: (e) => {
                                        const value = e.target.value;
                                        // El input type="number" ya previene letras automáticamente
                                        // Solo validar que esté en el rango correcto
                                        if (value === '' || (parseInt(value) >= 1 && parseInt(value) <= 50)) {
                                            handleInputChange('capacidadPasajeros', value);
                                        }
                                    },
                                    onKeyDown: (e) => {
                                        // Prevenir teclas no numéricas (excepto backspace, delete, tab, escape, enter, arrow keys)
                                        const allowedKeys = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
                                        const isNumber = e.key >= '0' && e.key <= '9';
                                        const isAllowedKey = allowedKeys.includes(e.key);
                                        
                                        if (!isNumber && !isAllowedKey) {
                                            e.preventDefault();
                                        }
                                    },
                                    autoComplete: "off"
                                },
                                {
                                    label: "Compañía",
                                    name: "idCompania",
                                    fieldType: 'react-select',
                                    placeholder: loadingCompanias ? "Cargando compañías..." : "Buscar compañía...",
                                    options: companiasOptions,
                                    required: true,
                                    errorMessageData: errors.idCompania,
                                    isLoading: loadingCompanias,
                                    defaultValue: formData.idCompania ? formData.idCompania.toString() : '',
                                    isSearchable: true,
                                    isClearable: true,
                                    noOptionsMessage: loadingCompanias ? 'Cargando...' : 'No se encontraron compañías',
                                    filterOption: (candidate, rawInput) => {
                                        if (!rawInput) return true;
                                        const term = rawInput.toLowerCase();
                                        return candidate.label.toLowerCase().includes(term);
                                    },
                                    onChange: (e) => handleInputChange('idCompania', e.target.value)
                                }
                            ]}
                            onSubmit={() => {}}
                            backgroundColor={'#fff'}
                        />
                    </div>

                    {/* Mostrar errores específicos */}
                    {errors.patente && errors.patente.includes('Ya existe') && (
                        <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2">
                            <MdError className="text-amber-600 flex-shrink-0" size={18} />
                            <p className="text-amber-700 text-sm">{errors.patente}</p>
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
                                    <span>Actualizar Carro</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
        </ModalPortal>
    );
};

UpdateCarroPopup.propTypes = {
    show: PropTypes.bool.isRequired,
    setShow: PropTypes.func.isRequired,
    onCarroUpdated: PropTypes.func,
    onUpdatingChange: PropTypes.func,
    carroData: PropTypes.object
};

export default UpdateCarroPopup;