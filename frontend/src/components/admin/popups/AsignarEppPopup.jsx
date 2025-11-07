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
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col">
                <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-[#4EB9FA] to-[#3A9BD9] rounded-t-2xl">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-white rounded-lg">
                            <MdPerson className="w-6 h-6 text-[#3A9BD9]" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Asignar EPP</h2>
                            <p className="text-blue-100 text-sm">Asignar "{toStartCase(epp.nombre)}" a un bombero</p>
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

                <div className="flex-1 overflow-y-auto px-6 py-4 bg-gray-50/50">
                    {loading && (
                        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-b-2xl">
                            <LoadingSpinner />
                        </div>
                    )}

                    <div className="space-y-4">
                        {/* Información del EPP */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h3 className="text-sm font-semibold text-blue-900 mb-2">EPP a asignar</h3>
                            <p className="text-blue-800 font-medium">{toStartCase(epp.nombre)}</p>
                            {epp.tipoEpp && (
                                <p className="text-sm text-blue-600 mt-1">Tipo: {toStartCase(epp.tipoEpp.nombre)}</p>
                            )}
                        </div>

                        {/* Selector de bombero */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Seleccione el bombero <span className="text-red-500">*</span>
                            </label>
                            {loadingBomberos ? (
                                <div className="flex items-center justify-center py-8">
                                    <LoadingSpinner size="sm" />
                                    <span className="ml-2 text-gray-600">Cargando bomberos...</span>
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
                                    placeholder="Buscar bombero por nombre o RUN..."
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
                                            borderColor: state.isFocused ? '#3B82F6' : '#D1D5DB',
                                            boxShadow: state.isFocused ? '0 0 0 2px rgba(59, 130, 246, 0.1)' : 'none',
                                            '&:hover': {
                                                borderColor: '#3B82F6'
                                            },
                                            minHeight: '42px'
                                        }),
                                        menu: (base) => ({
                                            ...base,
                                            zIndex: 9999
                                        }),
                                        option: (base, state) => ({
                                            ...base,
                                            backgroundColor: state.isSelected
                                                ? '#3B82F6'
                                                : state.isFocused
                                                ? '#EFF6FF'
                                                : 'white',
                                            color: state.isSelected ? 'white' : '#1F2937',
                                            '&:active': {
                                                backgroundColor: '#3B82F6',
                                                color: 'white'
                                            }
                                        })
                                    }}
                                    className="text-sm"
                                />
                            )}
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-red-700 text-sm">{error}</p>
                            </div>
                        )}

                        {/* Advertencia */}
                        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <p className="text-yellow-800 text-sm">
                                <strong>Nota:</strong> El EPP será asignado al bombero seleccionado. Si el EPP ya estaba asignado a otro bombero, será reasignado.
                            </p>
                        </div>
                    </div>
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
                            className={`flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-[#4EB9FA] to-[#3A9BD9] text-white rounded-lg hover:from-[#3A9BD9] hover:to-[#2E8BC7] transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105 ${loading || !selectedFichaBomberoId || loadingBomberos ? 'opacity-50 cursor-not-allowed' : ''}`}
                            disabled={loading || !selectedFichaBomberoId || loadingBomberos}
                        >
                            {loading ? (
                                <LoadingSpinner size="sm" />
                            ) : (
                                <>
                                    <MdSave className="w-4 h-4" />
                                    <span>Asignar EPP</span>
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

