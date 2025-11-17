import React, { useState, useRef, useEffect, useMemo } from 'react';
import Form from '@components/Form';
import LoadingSpinner from '@components/LoadingSpinner';
import ModalPortal from '@components/ModalPortal';
import { MdClose, MdShield, MdSave } from 'react-icons/md';
import PropTypes from 'prop-types';
import { useEpp } from '@hooks/epp/useEpp.jsx';
import { toStartCase } from '@helpers/textFormatters.js';

export default function EditEppPopup({ show, setShow, data, onEppUpdated, onUpdatingChange }) {
    const { updateEpp, tiposEpp, estadosEpp, fetchTiposEpp, fetchEstadosEpp } = useEpp();
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        nombre: '',
        idTipoEpp: '',
        idEstadoEpp: '',
        descripcionDeEstado: ''
    });
    const formRef = useRef(null);

    // Cargar datos cuando se abre el popup o cambia data
    useEffect(() => {
        if (show && data) {
            const initialData = {
                nombre: data.nombre || '',
                idTipoEpp: data.idTipoEpp ? data.idTipoEpp.toString() : (data.tipoEpp?.id?.toString() || ''),
                idEstadoEpp: data.idEstadoEpp ? data.idEstadoEpp.toString() : (data.estadosEpp?.id?.toString() || ''),
                descripcionDeEstado: data.descripcionDeEstado || ''
            };
            setFormData(initialData);
            setErrors({});
            
            // Actualizar valores del formulario usando setValue del Form
            if (formRef.current) {
                const { setValue } = formRef.current;
                if (setValue) {
                    setValue('nombre', initialData.nombre);
                    setValue('idTipoEpp', initialData.idTipoEpp);
                    setValue('idEstadoEpp', initialData.idEstadoEpp);
                    setValue('descripcionDeEstado', initialData.descripcionDeEstado);
                }
            }
        }
    }, [show, data]);

    // Cargar tipos y estados al montar
    useEffect(() => {
        if (show) {
            fetchTiposEpp();
            fetchEstadosEpp();
        }
    }, [show, fetchTiposEpp, fetchEstadosEpp]);

    // Preparar opciones para los selects
    const tiposOptions = useMemo(() => {
        return tiposEpp.map(tipo => ({
            value: tipo.id.toString(),
            label: toStartCase(tipo.nombre)
        }));
    }, [tiposEpp]);

    const estadosOptions = useMemo(() => {
        return estadosEpp.map(estado => ({
            value: estado.id.toString(),
            label: toStartCase(estado.nombre)
        }));
    }, [estadosEpp]);

    // Validar campo en tiempo real
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

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        
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

    const validateEppData = (data) => {
        const newErrors = {};

        if (!data.nombre || data.nombre.trim().length === 0) {
            newErrors.nombre = 'El nombre no puede estar vacío.';
        } else if (data.nombre.trim().length < 2) {
            newErrors.nombre = 'El nombre debe tener como mínimo 2 caracteres.';
        } else if (data.nombre.trim().length > 100) {
            newErrors.nombre = 'El nombre debe tener como máximo 100 caracteres.';
        }

        if (!data.idTipoEpp) {
            newErrors.idTipoEpp = 'Debe seleccionar un tipo de EPP.';
        }

        if (!data.idEstadoEpp) {
            newErrors.idEstadoEpp = 'Debe seleccionar un estado.';
        }

        if (data.descripcionDeEstado && data.descripcionDeEstado.trim().length > 255) {
            newErrors.descripcionDeEstado = 'La descripción debe tener como máximo 255 caracteres.';
        }

        return newErrors;
    };

    const handleSubmit = async () => {
        setLoading(true);
        if (onUpdatingChange) onUpdatingChange(true);
        setErrors({});

        try {
            const eppErrors = validateEppData(formData);
            
            if (Object.keys(eppErrors).length > 0) {
                setErrors(eppErrors);
                setLoading(false);
                if (onUpdatingChange) onUpdatingChange(false);
                return;
            }

            const result = await updateEpp(data.id, {
                nombre: formData.nombre.trim(),
                idTipoEpp: parseInt(formData.idTipoEpp),
                idEstadoEpp: parseInt(formData.idEstadoEpp),
                descripcionDeEstado: formData.descripcionDeEstado?.trim() || null
            });

            if (result) {
                handleClose();
                if (onEppUpdated) {
                    onEppUpdated(result);
                }
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || 'Error al actualizar EPP';
            setErrors({ general: errorMessage });
        } finally {
            setLoading(false);
            if (onUpdatingChange) onUpdatingChange(false);
        }
    };

    const handleClose = () => {
        setShow(false);
        setErrors({});
        setLoading(false);
        setFormData({
            nombre: '',
            idTipoEpp: '',
            idEstadoEpp: '',
            descripcionDeEstado: ''
        });
    };

    if (!show || !data || !data.id) return null;

    return (
        <ModalPortal>
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-[#4EB9FA] to-[#3A9BD9] rounded-t-2xl">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-white rounded-lg">
                            <MdShield className="w-6 h-6 text-[#3A9BD9]" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Editar EPP</h2>
                            <p className="text-blue-100 text-sm">Modifique la información del EPP</p>
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

                <div className="flex-1 overflow-y-auto px-6 py-4 max-h-[65vh] bg-gray-50/50">
                    {loading && (
                        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
                            <LoadingSpinner />
                        </div>
                    )}

                    <div className="space-y-6">
                        <Form
                            key={`edit-epp-${data?.id || 'new'}`}
                            ref={formRef}
                            title={null}
                            autoComplete="off"
                            size="w-full"
                            defaultValues={formData}
                            fields={[
                                {
                                    label: "Nombre del EPP",
                                    name: "nombre",
                                    placeholder: 'Ej: Casco #001, Chaqueta Bombero, Botas Seguridad...',
                                    fieldType: 'input',
                                    type: "text",
                                    required: true,
                                    defaultValue: formData.nombre,
                                    errorMessageData: errors.nombre,
                                    onChange: (e) => handleInputChange('nombre', e.target.value)
                                },
                                {
                                    label: "Tipo de EPP",
                                    name: "idTipoEpp",
                                    fieldType: 'react-select',
                                    placeholder: 'Buscar tipo de EPP...',
                                    options: tiposOptions,
                                    required: true,
                                    defaultValue: formData.idTipoEpp,
                                    errorMessageData: errors.idTipoEpp,
                                    isSearchable: true,
                                    isClearable: true,
                                    noOptionsMessage: 'No se encontraron tipos de EPP',
                                    filterOption: (candidate, rawInput) => {
                                        if (!rawInput) return true;
                                        const term = rawInput.toLowerCase();
                                        return candidate.label.toLowerCase().includes(term);
                                    },
                                    onChange: (e) => handleInputChange('idTipoEpp', e.target.value)
                                },
                                {
                                    label: "Estado",
                                    name: "idEstadoEpp",
                                    fieldType: 'react-select',
                                    placeholder: 'Buscar estado...',
                                    options: estadosOptions,
                                    required: true,
                                    defaultValue: formData.idEstadoEpp,
                                    errorMessageData: errors.idEstadoEpp,
                                    isSearchable: true,
                                    isClearable: true,
                                    noOptionsMessage: 'No se encontraron estados',
                                    filterOption: (candidate, rawInput) => {
                                        if (!rawInput) return true;
                                        const term = rawInput.toLowerCase();
                                        return candidate.label.toLowerCase().includes(term);
                                    },
                                    onChange: (e) => handleInputChange('idEstadoEpp', e.target.value)
                                },
                                {
                                    label: "Descripción del Estado (opcional)",
                                    name: "descripcionDeEstado",
                                    placeholder: 'Ej: Daño menor en el visor, necesita reparación...',
                                    fieldType: 'textarea',
                                    rows: 3,
                                    maxLength: 255,
                                    defaultValue: formData.descripcionDeEstado,
                                    errorMessageData: errors.descripcionDeEstado,
                                    onChange: (e) => handleInputChange('descripcionDeEstado', e.target.value)
                                }
                            ]}
                            onSubmit={() => {}}
                            backgroundColor={'#fff'}
                        />
                    </div>

                    {errors.general && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-700 text-sm">{errors.general}</p>
                        </div>
                    )}
                </div>

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
                            disabled={loading || !formData.nombre.trim() || !formData.idTipoEpp || !formData.idEstadoEpp}
                        >
                            {loading ? (
                                <LoadingSpinner size="sm" />
                            ) : (
                                <>
                                    <MdSave className="w-4 h-4" />
                                    <span>Actualizar EPP</span>
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

EditEppPopup.propTypes = {
    show: PropTypes.bool.isRequired,
    setShow: PropTypes.func.isRequired,
    data: PropTypes.object,
    onEppUpdated: PropTypes.func,
    onUpdatingChange: PropTypes.func
};

