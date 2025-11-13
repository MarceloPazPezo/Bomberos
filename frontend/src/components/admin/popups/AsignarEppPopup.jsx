import React, { useState, useEffect, useMemo } from 'react';
import LoadingSpinner from '@components/LoadingSpinner';
import { MdClose, MdPerson, MdSave } from 'react-icons/md';
import PropTypes from 'prop-types';
import Select from 'react-select';
import { useEpp } from '@hooks/epp/useEpp.jsx';
import { getAllBomberosWithFicha } from '@services/bombero.service.js';
import { toStartCase } from '@helpers/textFormatters.js';

export default function AsignarEppPopup({ show, setShow, epp, onEppAssigned }) {
    const { assignEpp, loading: eppLoading } = useEpp();
    const [bomberos, setBomberos] = useState([]);
    const [loadingBomberos, setLoadingBomberos] = useState(false);
    const [selectedFichaBomberoId, setSelectedFichaBomberoId] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Cargar bomberos al abrir el popup
    useEffect(() => {
        if (show) {
            const loadBomberos = async () => {
                try {
                    setLoadingBomberos(true);
                    const response = await getAllBomberosWithFicha();
                    console.log('[ASIGNAR_EPP_POPUP] Response completa:', response);
                    const bomberosData = response?.data || response || [];
                    console.log('[ASIGNAR_EPP_POPUP] Bomberos data:', bomberosData);
                    console.log('[ASIGNAR_EPP_POPUP] Primer bombero (si existe):', bomberosData[0]);
                    const filteredBomberos = Array.isArray(bomberosData) 
                        ? bomberosData.filter(b => b.fichaBombero?.id)
                        : [];
                    console.log('[ASIGNAR_EPP_POPUP] Bomberos con ficha:', filteredBomberos.length);
                    setBomberos(filteredBomberos);
                    setSelectedFichaBomberoId('');
                } catch (error) {
                    console.error('[ASIGNAR_EPP_POPUP] Error cargando bomberos:', error);
                    setBomberos([]);
                    setError('Error al cargar la lista de bomberos');
                } finally {
                    setLoadingBomberos(false);
                }
            };
            loadBomberos();
        }
    }, [show]);

    const handleSubmit = async () => {
        if (!selectedFichaBomberoId) {
            setError('Debe seleccionar un bombero');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await assignEpp(epp.id, parseInt(selectedFichaBomberoId));
            handleClose();
            if (onEppAssigned) {
                onEppAssigned();
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.response?.data?.details || error.message || 'Error al asignar EPP';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setShow(false);
        setSelectedFichaBomberoId('');
        setError(null);
    };

    // Función para obtener nombre completo del bombero
    const getBomberoNombre = (bombero) => {
        if (!bombero) return 'Sin nombre';
        
        const nombres = Array.isArray(bombero.nombres) ? bombero.nombres.join(' ') : bombero.nombres || '';
        const apellidos = Array.isArray(bombero.apellidos) ? bombero.apellidos.join(' ') : bombero.apellidos || '';
        return `${nombres} ${apellidos}`.trim() || 'Sin nombre';
    };

    // Función para formatear el RUN
    const formatRun = (run) => {
        if (!run) return '';
        // Formatear RUN si es necesario (ej: 12345678-9)
        return run.toString();
    };

    // Preparar opciones para react-select
    const selectOptions = useMemo(() => {
        return bomberos
            .filter(bombero => bombero.fichaBombero?.id)
            .map((bombero) => {
                const nombre = getBomberoNombre(bombero);
                const run = formatRun(bombero.run);
                return {
                    value: bombero.fichaBombero.id.toString(),
                    label: run ? `(${run}) ${nombre}` : nombre,
                    bombero: bombero // Mantener referencia al bombero completo
                };
            });
    }, [bomberos]);

    // Valor seleccionado para react-select
    const selectedOption = useMemo(() => {
        if (!selectedFichaBomberoId) return null;
        return selectOptions.find(opt => opt.value === selectedFichaBomberoId.toString()) || null;
    }, [selectedFichaBomberoId, selectOptions]);

    if (!show || !epp) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 rounded-t-2xl bg-gradient-to-r from-[#4EB9FA] to-[#3A9BD9]">
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-white rounded-xl shadow-lg">
                            <MdPerson className="w-7 h-7 text-[#3A9BD9]" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white">
                                Asignar EPP a Bombero
                            </h2>
                            <p className="text-sm mt-1 font-medium text-blue-100">
                                {toStartCase(epp.nombre)} • {epp.tipoEpp?.nombre ? toStartCase(epp.tipoEpp.nombre) : 'Sin tipo'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        className="p-3 text-white hover:bg-red-500 hover:bg-opacity-80 rounded-xl transition-colors"
                        disabled={loading}
                    >
                        <MdClose className="w-6 h-6 text-red-300 hover:text-white" />
                    </button>
                </div>

                {/* Body */}
                <div className="px-8 py-8 bg-gray-50">
                    {loading && (
                        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-b-2xl">
                            <LoadingSpinner />
                        </div>
                    )}

                    <div className="space-y-6">
                        {/* Información del EPP */}
                        <div className="bg-white rounded-xl p-6 shadow-md border-l-4 border-[#4EB9FA]">
                            <div className="flex items-start gap-4">
                                <div className="w-16 h-16 bg-gradient-to-br from-[#4EB9FA] to-[#3A9BD9] rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                                    <MdPerson className="w-8 h-8 text-white" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-[#4EB9FA] mb-2">
                                        EPP a asignar
                                    </p>
                                    <p className="text-xl font-bold text-gray-900 mb-1">
                                        {toStartCase(epp.nombre)}
                                    </p>
                                    <div className="space-y-1">
                                        {epp.tipoEpp && (
                                            <p className="text-sm text-gray-600">
                                                <span className="font-medium">Tipo:</span> {toStartCase(epp.tipoEpp.nombre)}
                                            </p>
                                        )}
                                        {epp.estadosEpp && (
                                            <p className="text-sm text-gray-600">
                                                <span className="font-medium">Estado:</span> {toStartCase(epp.estadosEpp.nombre)}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Selector de bombero mejorado */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                                Seleccionar Bombero <span className="text-red-500">*</span>
                            </label>
                            {loadingBomberos ? (
                                <div className="flex flex-col items-center justify-center py-12 bg-white rounded-xl">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4EB9FA]"></div>
                                    <p className="mt-4 text-sm text-gray-600">Cargando bomberos...</p>
                                </div>
                            ) : (
                                <Select
                                    value={selectedOption}
                                    onChange={(option) => {
                                        setSelectedFichaBomberoId(option ? option.value : '');
                                        setError(null);
                                    }}
                                    options={selectOptions}
                                    isSearchable={true}
                                    isClearable={true}
                                    placeholder="Buscar por nombre o RUN..."
                                    noOptionsMessage={() => "No se encontraron bomberos"}
                                    loadingMessage={() => "Cargando..."}
                                    isLoading={loadingBomberos}
                                    filterOption={(option, searchText) => {
                                        // Buscar en el label (que incluye RUN y nombre)
                                        const labelMatch = option.label.toLowerCase().includes(searchText.toLowerCase());
                                        // También buscar directamente en el RUN del bombero
                                        const runMatch = option.data?.bombero?.run?.toLowerCase().includes(searchText.toLowerCase());
                                        return labelMatch || runMatch;
                                    }}
                                    styles={{
                                        control: (base, state) => ({
                                            ...base,
                                            borderColor: state.isFocused ? '#4EB9FA' : '#D1D5DB',
                                            borderWidth: '2px',
                                            boxShadow: state.isFocused ? '0 0 0 3px rgba(78, 185, 250, 0.1)' : 'none',
                                            '&:hover': {
                                                borderColor: '#4EB9FA'
                                            },
                                            minHeight: '50px',
                                            borderRadius: '12px',
                                            fontSize: '15px'
                                        }),
                                        menu: (base) => ({
                                            ...base,
                                            zIndex: 9999,
                                            borderRadius: '12px',
                                            overflow: 'hidden',
                                            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                                        }),
                                        menuList: (base) => ({
                                            ...base,
                                            maxHeight: '280px',
                                            padding: '8px'
                                        }),
                                        option: (base, state) => ({
                                            ...base,
                                            backgroundColor: state.isSelected
                                                ? '#4EB9FA'
                                                : state.isFocused
                                                ? '#EFF6FF'
                                                : 'white',
                                            color: state.isSelected ? 'white' : '#1F2937',
                                            borderRadius: '8px',
                                            padding: '12px',
                                            margin: '2px 0',
                                            cursor: 'pointer',
                                            fontSize: '14px',
                                            '&:active': {
                                                backgroundColor: '#4EB9FA',
                                                color: 'white'
                                            }
                                        }),
                                        placeholder: (base) => ({
                                            ...base,
                                            color: '#9CA3AF',
                                            fontSize: '15px'
                                        }),
                                        input: (base) => ({
                                            ...base,
                                            fontSize: '15px'
                                        }),
                                        singleValue: (base) => ({
                                            ...base,
                                            fontSize: '15px',
                                            color: '#1F2937'
                                        })
                                    }}
                                />
                            )}
                            {!loadingBomberos && selectOptions.length === 0 && (
                                <p className="mt-2 text-sm text-gray-500 italic">
                                    No hay bomberos disponibles con ficha activa
                                </p>
                            )}
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
                                <p className="text-red-700 text-sm font-medium">{error}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer con botones */}
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
                            disabled={loading || !selectedFichaBomberoId || loadingBomberos}
                            className="flex items-center space-x-2 px-4 py-2.5 text-white rounded-lg transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    <span>Procesando...</span>
                                </>
                            ) : (
                                <>
                                    <MdSave className="w-4 h-4" />
                                    <span>Asignar</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

AsignarEppPopup.propTypes = {
    show: PropTypes.bool.isRequired,
    setShow: PropTypes.func.isRequired,
    epp: PropTypes.object,
    onEppAssigned: PropTypes.func
};

