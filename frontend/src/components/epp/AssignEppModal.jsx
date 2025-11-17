import React, { useState, useEffect } from 'react';
import { MdClose, MdSave, MdError, MdSearch, MdPerson } from 'react-icons/md';
import { XCircleIcon, UserIcon } from '@heroicons/react/24/outline';
import PropTypes from 'prop-types';
import { getBomberos } from '@services/bombero.service';

/**
 * Modal para asignar/desasignar EPP a un bombero
 */
const AssignEppModal = ({ isOpen, onClose, onAssign, onUnassign, epp }) => {
  const [bomberos, setBomberos] = useState([]);
  const [filteredBomberos, setFilteredBomberos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBombero, setSelectedBombero] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingBomberos, setLoadingBomberos] = useState(false);

  // Determinar si es asignación o desasignación
  const isAssigned = epp?.aCargoEpps && epp.aCargoEpps.length > 0;
  const assignedBombero = isAssigned ? epp.aCargoEpps[0].fichaBombero?.bombero : null;

  // Cargar bomberos cuando se abre el modal
  useEffect(() => {
    if (isOpen && !isAssigned) {
      loadBomberos();
    }
  }, [isOpen, isAssigned]);

  // Filtrar bomberos según búsqueda
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredBomberos(bomberos);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = bomberos.filter(bombero => {
        const nombreCompleto = `${bombero.nombres} ${bombero.apellidos}`.toLowerCase();
        const run = bombero.run?.toLowerCase() || '';
        const email = bombero.email?.toLowerCase() || '';
        return nombreCompleto.includes(term) || run.includes(term) || email.includes(term);
      });
      setFilteredBomberos(filtered);
    }
  }, [searchTerm, bomberos]);

  // Cargar lista de bomberos
  const loadBomberos = async () => {
    try {
      setLoadingBomberos(true);
      const response = await getBomberos();
      
      // Filtrar solo bomberos activos con ficha
      const bomberosActivos = (response.data || response).filter(b => 
        b.activo && b.ficha && b.ficha.id
      );
      
      setBomberos(bomberosActivos);
      setFilteredBomberos(bomberosActivos);
    } catch (error) {
      console.error('Error al cargar bomberos:', error);
    } finally {
      setLoadingBomberos(false);
    }
  };

  // Manejar asignación
  const handleAssign = async () => {
    if (!selectedBombero) {
      return;
    }

    setLoading(true);
    try {
      await onAssign(epp.id, selectedBombero.ficha.id);
      onClose();
    } catch (error) {
      console.error('Error al asignar EPP:', error);
    } finally {
      setLoading(false);
    }
  };

  // Manejar desasignación
  const handleUnassign = async () => {
    setLoading(true);
    try {
      await onUnassign(epp.id);
      onClose();
    } catch (error) {
      console.error('Error al desasignar EPP:', error);
    } finally {
      setLoading(false);
    }
  };

  // Resetear al cerrar
  const handleClose = () => {
    setSearchTerm('');
    setSelectedBombero(null);
    onClose();
  };

  if (!isOpen || !epp) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b border-gray-200 rounded-t-2xl ${
          isAssigned 
            ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' 
            : 'bg-gradient-to-r from-[#4EB9FA] to-[#3A9BD9]'
        }`}>
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white rounded-xl shadow-lg">
              <MdPerson className={`w-7 h-7 ${isAssigned ? 'text-yellow-600' : 'text-[#3A9BD9]'}`} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                {isAssigned ? 'Desasignar EPP' : 'Asignar EPP a Bombero'}
              </h2>
              <p className={`text-sm mt-1 font-medium ${isAssigned ? 'text-yellow-100' : 'text-blue-100'}`}>
                {epp.nombre} • {epp.tipoEpp?.nombre}
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
        <div className="flex-1 overflow-y-auto px-8 py-6 bg-gray-50">
          {isAssigned ? (
            /* Vista de desasignación */
            <div className="space-y-6">
              <div className="bg-white rounded-xl p-6 shadow-md border-l-4 border-yellow-500">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                    <MdPerson className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-yellow-800 mb-2">
                      EPP actualmente asignado a:
                    </p>
                    <p className="text-xl font-bold text-gray-900 mb-1">
                      {assignedBombero?.nombres} {assignedBombero?.apellidos}
                    </p>
                    <div className="space-y-1">
                      {assignedBombero?.run && (
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">RUN:</span> {assignedBombero.run}
                        </p>
                      )}
                      {assignedBombero?.email && (
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Email:</span> {assignedBombero.email}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Vista de asignación */
            <div className="space-y-6">
              {/* Buscador mejorado */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Buscar Bombero
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <MdSearch className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Buscar por nombre, RUN o email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#4EB9FA] focus:border-[#4EB9FA] text-base transition-all"
                  />
                </div>
              </div>

              {/* Lista de bomberos mejorada */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Seleccionar Bombero {filteredBomberos.length > 0 && `(${filteredBomberos.length})`}
                </label>
                
                {loadingBomberos ? (
                  <div className="flex flex-col items-center justify-center py-12 bg-white rounded-xl">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4EB9FA]"></div>
                    <p className="mt-4 text-sm text-gray-600">Cargando bomberos...</p>
                  </div>
                ) : filteredBomberos.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-xl">
                    <UserIcon className="mx-auto h-16 w-16 text-gray-300" />
                    <p className="mt-4 text-base font-medium text-gray-900">
                      {searchTerm ? 'No se encontraron bomberos' : 'No hay bomberos disponibles'}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      {searchTerm ? 'Intenta con otro término de búsqueda' : 'No hay bomberos habilitados con ficha'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                    {filteredBomberos.map(bombero => (
                      <button
                        key={bombero.id}
                        onClick={() => setSelectedBombero(bombero)}
                        className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                          selectedBombero?.id === bombero.id
                            ? 'border-[#4EB9FA] bg-blue-50 shadow-md scale-[1.02]'
                            : 'border-gray-200 bg-white hover:border-[#4EB9FA]/50 hover:shadow-sm'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all ${
                            selectedBombero?.id === bombero.id
                              ? 'bg-gradient-to-br from-[#4EB9FA] to-[#3A9BD9] text-white shadow-lg'
                              : 'bg-gray-100 text-gray-500'
                          }`}>
                            <MdPerson className="w-7 h-7" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-base text-gray-900 truncate">
                              {bombero.nombres} {bombero.apellidos}
                            </p>
                            <div className="flex items-center gap-3 mt-1">
                              {bombero.run && (
                                <span className="text-sm text-gray-600">
                                  <span className="font-medium">RUN:</span> {bombero.run}
                                </span>
                              )}
                              {bombero.ficha?.compania?.nombre && (
                                <>
                                  <span className="text-gray-300">•</span>
                                  <span className="text-sm text-gray-600 truncate">
                                    {bombero.ficha.compania.nombre}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                          {selectedBombero?.id === bombero.id && (
                            <div className="flex-shrink-0">
                              <div className="w-6 h-6 bg-[#4EB9FA] rounded-full flex items-center justify-center">
                                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </div>
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
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
              onClick={isAssigned ? handleUnassign : handleAssign}
              disabled={loading || (!isAssigned && !selectedBombero)}
              className={`flex items-center space-x-2 px-4 py-2.5 text-white rounded-lg transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
                isAssigned
                  ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700'
                  : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
              }`}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Procesando...</span>
                </>
              ) : (
                <>
                  <MdSave className="w-4 h-4" />
                  <span>{isAssigned ? 'Desasignar' : 'Asignar'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

AssignEppModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onAssign: PropTypes.func.isRequired,
  onUnassign: PropTypes.func.isRequired,
  epp: PropTypes.object
};

export default AssignEppModal;

