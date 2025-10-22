import React, { useState, useEffect } from 'react';
import { MdWaterDrop, MdDescription, MdRefresh, MdCheck, MdError } from 'react-icons/md';
import { tipoSangreService } from '@services/tipoSangre.service';
// import { showSuccessAlert, showErrorAlert } from '@helpers/fireAlert';

/**
 * Componente demo para mostrar y seleccionar valores estáticos
 * - Tipos de sangre
 * - Estados de reporte (simulados)
 */
const StaticValuesDemo = () => {
  const [tiposSangre, setTiposSangre] = useState([]);
  const [loadingTiposSangre, setLoadingTiposSangre] = useState(false);
  const [errorTiposSangre, setErrorTiposSangre] = useState(null);
  
  const [selectedTipoSangre, setSelectedTipoSangre] = useState('');
  const [selectedEstadoReporte, setSelectedEstadoReporte] = useState('');
  const [selectedTipoDano, setSelectedTipoDano] = useState('');
  const [selectedFaseAlcanzada, setSelectedFaseAlcanzada] = useState('');
  
  // Estados de reporte estáticos (simulados)
  const estadosReporte = [
    { id: 1, nombre: 'Borrador', descripcion: 'Reporte en proceso de creación o edición', color: '#6B7280' },
    { id: 2, nombre: 'En revisión', descripcion: 'Reporte enviado y pendiente de revisión', color: '#F59E0B' },
    { id: 3, nombre: 'Archivado', descripcion: 'Reporte revisado y archivado', color: '#10B981' }
  ];

  // Tipos de daño estáticos (simulados)
  const tiposDano = [
    { id: 1, nombre: 'Compartimental', descripcion: 'Daño limitado a un compartimento específico' },
    { id: 2, nombre: 'Multicompartimental', descripcion: 'Daño que afecta múltiples compartimentos' },
    { id: 3, nombre: 'Estructura', descripcion: 'Daño estructural significativo' }
  ];

  // Fases alcanzadas estáticas (simuladas)
  const fasesAlcanzadas = [
    { id: 1, nombre: 'Ignición', descripcion: 'Fase inicial del incendio, inicio de la combustión' },
    { id: 2, nombre: 'Incremento', descripcion: 'Fase de crecimiento del incendio' },
    { id: 3, nombre: 'Latente', descripcion: 'Fase de desarrollo lento del incendio' },
    { id: 4, nombre: 'Libre combustión', descripcion: 'Fase de combustión libre y activa' },
    { id: 5, nombre: 'Decaimiento', descripcion: 'Fase de disminución del incendio' }
  ];

  // Cargar tipos de sangre desde la API
  const cargarTiposSangre = async () => {
    try {
      setLoadingTiposSangre(true);
      setErrorTiposSangre(null);
      
      const response = await tipoSangreService.getTiposSangre();
      
      if (response.status === 'Success') {
        setTiposSangre(response.data || []);
        // showSuccessAlert('Éxito', 'Tipos de sangre cargados correctamente');
      } else {
        setErrorTiposSangre(response.message || 'Error al cargar tipos de sangre');
        // showErrorAlert('Error', response.message || 'Error al cargar tipos de sangre');
      }
    } catch (error) {
      console.error('Error al cargar tipos de sangre:', error);
      setErrorTiposSangre('Error de conexión con el servidor');
      // showErrorAlert('Error', 'Error de conexión con el servidor');
    } finally {
      setLoadingTiposSangre(false);
    }
  };

  // Cargar tipos de sangre al montar el componente
  useEffect(() => {
    cargarTiposSangre();
  }, []);

  // Manejar selección de tipo de sangre
  const handleTipoSangreChange = (e) => {
    const tipoId = e.target.value;
    setSelectedTipoSangre(tipoId);
    
    if (tipoId) {
      const tipo = tiposSangre.find(t => t.id === parseInt(tipoId));
      if (tipo) {
        // showSuccessAlert('Selección', `Tipo de sangre seleccionado: ${tipo.nombre}`);
      }
    }
  };

  // Manejar selección de estado de reporte
  const handleEstadoReporteChange = (e) => {
    const estadoId = e.target.value;
    setSelectedEstadoReporte(estadoId);
    
    if (estadoId) {
      const estado = estadosReporte.find(e => e.id === parseInt(estadoId));
      if (estado) {
        // showSuccessAlert('Selección', `Estado de reporte seleccionado: ${estado.nombre}`);
      }
    }
  };

  // Manejar selección de tipo de daño
  const handleTipoDanoChange = (e) => {
    const tipoId = e.target.value;
    setSelectedTipoDano(tipoId);
    
    if (tipoId) {
      const tipo = tiposDano.find(t => t.id === parseInt(tipoId));
      if (tipo) {
        // showSuccessAlert('Selección', `Tipo de daño seleccionado: ${tipo.nombre}`);
      }
    }
  };

  // Manejar selección de fase alcanzada
  const handleFaseAlcanzadaChange = (e) => {
    const faseId = e.target.value;
    setSelectedFaseAlcanzada(faseId);
    
    if (faseId) {
      const fase = fasesAlcanzadas.find(f => f.id === parseInt(faseId));
      if (fase) {
        // showSuccessAlert('Selección', `Fase alcanzada seleccionada: ${fase.nombre}`);
      }
    }
  };

  // Obtener valores seleccionados
  const getValoresSeleccionados = () => {
    const tipoSangre = tiposSangre.find(t => t.id === parseInt(selectedTipoSangre));
    const estadoReporte = estadosReporte.find(e => e.id === parseInt(selectedEstadoReporte));
    const tipoDano = tiposDano.find(t => t.id === parseInt(selectedTipoDano));
    const faseAlcanzada = fasesAlcanzadas.find(f => f.id === parseInt(selectedFaseAlcanzada));
    
    return {
      tipoSangre: tipoSangre ? { id: tipoSangre.id, nombre: tipoSangre.nombre } : null,
      estadoReporte: estadoReporte ? { id: estadoReporte.id, nombre: estadoReporte.nombre, color: estadoReporte.color } : null,
      tipoDano: tipoDano ? { id: tipoDano.id, nombre: tipoDano.nombre, descripcion: tipoDano.descripcion } : null,
      faseAlcanzada: faseAlcanzada ? { id: faseAlcanzada.id, nombre: faseAlcanzada.nombre, descripcion: faseAlcanzada.descripcion } : null
    };
  };

  const valoresSeleccionados = getValoresSeleccionados();

  return (
    <div className="p-6 bg-white rounded-2xl shadow-lg border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <MdDescription className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Demo - Valores Estáticos</h2>
            <p className="text-sm text-gray-600">Selecciona tipos de sangre y estados de reporte</p>
          </div>
        </div>
        <button
          onClick={cargarTiposSangre}
          disabled={loadingTiposSangre}
          className="flex items-center gap-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50"
        >
          <MdRefresh className={`w-4 h-4 ${loadingTiposSangre ? 'animate-spin' : ''}`} />
          <span>Recargar</span>
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Tipos de Sangre */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <MdWaterDrop className="w-5 h-5 text-red-600" />
            <h3 className="text-lg font-semibold text-gray-900">Tipos de Sangre</h3>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Seleccionar tipo de sangre:
            </label>
            <select
              value={selectedTipoSangre}
              onChange={handleTipoSangreChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={loadingTiposSangre || !!errorTiposSangre}
            >
              <option value="">Seleccionar tipo de sangre...</option>
              {tiposSangre.map((tipo) => (
                <option key={tipo.id} value={tipo.id}>
                  {tipo.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Estado de carga/error para tipos de sangre */}
          {loadingTiposSangre && (
            <div className="flex items-center gap-2 text-blue-600 text-sm">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span>Cargando tipos de sangre...</span>
            </div>
          )}

          {errorTiposSangre && (
            <div className="flex items-center gap-2 text-red-600 text-sm">
              <MdError className="w-4 h-4" />
              <span>{errorTiposSangre}</span>
            </div>
          )}

          {/* Información del tipo seleccionado */}
          {valoresSeleccionados.tipoSangre && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2">
                <MdCheck className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-gray-900">Tipo seleccionado:</span>
              </div>
              <div className="mt-1 flex items-center gap-2">
                <MdWaterDrop className="w-4 h-4 text-red-600" />
                <span className="text-sm text-gray-700">
                  {valoresSeleccionados.tipoSangre.nombre}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Estados de Reporte */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <MdDescription className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Estados de Reporte</h3>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Seleccionar estado de reporte:
            </label>
            <select
              value={selectedEstadoReporte}
              onChange={handleEstadoReporteChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Seleccionar estado...</option>
              {estadosReporte.map((estado) => (
                <option key={estado.id} value={estado.id}>
                  {estado.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Información del estado seleccionado */}
          {valoresSeleccionados.estadoReporte && (
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-2">
                <MdCheck className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-gray-900">Estado seleccionado:</span>
              </div>
              <div className="mt-1 flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: valoresSeleccionados.estadoReporte.color }}
                ></div>
                <span className="text-sm text-gray-700">
                  {valoresSeleccionados.estadoReporte.nombre}
                </span>
              </div>
              <div className="mt-2 text-xs text-gray-600">
                {estadosReporte.find(e => e.id === valoresSeleccionados.estadoReporte.id)?.descripcion}
              </div>
            </div>
          )}
        </div>

        {/* Tipos de Daño */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <MdDescription className="w-5 h-5 text-orange-600" />
            <h3 className="text-lg font-semibold text-gray-900">Tipos de Daño</h3>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Seleccionar tipo de daño:
            </label>
            <select
              value={selectedTipoDano}
              onChange={handleTipoDanoChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="">Seleccionar tipo de daño...</option>
              {tiposDano.map((tipo) => (
                <option key={tipo.id} value={tipo.id}>
                  {tipo.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Información del tipo seleccionado */}
          {valoresSeleccionados.tipoDano && (
            <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center gap-2">
                <MdCheck className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-gray-900">Tipo seleccionado:</span>
              </div>
              <div className="mt-1 flex items-center gap-2">
                <MdDescription className="w-4 h-4 text-orange-600" />
                <span className="text-sm text-gray-700">
                  {valoresSeleccionados.tipoDano.nombre}
                </span>
              </div>
              <div className="mt-2 text-xs text-gray-600">
                {valoresSeleccionados.tipoDano.descripcion}
              </div>
            </div>
          )}
        </div>

        {/* Fases Alcanzadas */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <MdDescription className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900">Fases Alcanzadas</h3>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Seleccionar fase alcanzada:
            </label>
            <select
              value={selectedFaseAlcanzada}
              onChange={handleFaseAlcanzadaChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="">Seleccionar fase...</option>
              {fasesAlcanzadas.map((fase) => (
                <option key={fase.id} value={fase.id}>
                  {fase.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Información de la fase seleccionada */}
          {valoresSeleccionados.faseAlcanzada && (
            <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="flex items-center gap-2">
                <MdCheck className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-gray-900">Fase seleccionada:</span>
              </div>
              <div className="mt-1 flex items-center gap-2">
                <MdDescription className="w-4 h-4 text-purple-600" />
                <span className="text-sm text-gray-700">
                  {valoresSeleccionados.faseAlcanzada.nombre}
                </span>
              </div>
              <div className="mt-2 text-xs text-gray-600">
                {valoresSeleccionados.faseAlcanzada.descripcion}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Resumen de valores seleccionados */}
      {(valoresSeleccionados.tipoSangre || valoresSeleccionados.estadoReporte || valoresSeleccionados.tipoDano || valoresSeleccionados.faseAlcanzada) && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="text-sm font-semibold text-blue-900 mb-2">Resumen de Selecciones</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            {valoresSeleccionados.tipoSangre && (
              <div className="flex items-center gap-2">
                <span className="text-blue-800">Tipo de sangre:</span>
                <span className="font-medium text-blue-900">{valoresSeleccionados.tipoSangre.nombre}</span>
              </div>
            )}
            {valoresSeleccionados.estadoReporte && (
              <div className="flex items-center gap-2">
                <span className="text-blue-800">Estado de reporte:</span>
                <span className="font-medium text-blue-900">{valoresSeleccionados.estadoReporte.nombre}</span>
              </div>
            )}
            {valoresSeleccionados.tipoDano && (
              <div className="flex items-center gap-2">
                <span className="text-blue-800">Tipo de daño:</span>
                <span className="font-medium text-blue-900">{valoresSeleccionados.tipoDano.nombre}</span>
              </div>
            )}
            {valoresSeleccionados.faseAlcanzada && (
              <div className="flex items-center gap-2">
                <span className="text-blue-800">Fase alcanzada:</span>
                <span className="font-medium text-blue-900">{valoresSeleccionados.faseAlcanzada.nombre}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Información adicional */}
      <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <h4 className="text-sm font-semibold text-gray-900 mb-2">Información del Demo</h4>
        <div className="text-xs text-gray-600 space-y-1">
          <p>• <strong>Tipos de sangre:</strong> Cargados dinámicamente desde la API backend</p>
          <p>• <strong>Estados de reporte:</strong> Valores estáticos simulados (Borrador, En revisión, Archivado)</p>
          <p>• <strong>Tipos de daño:</strong> Valores estáticos simulados (Compartimental, Multicompartimental, Estructura)</p>
          <p>• <strong>Fases alcanzadas:</strong> Valores estáticos simulados (Ignición, Incremento, Latente, Libre combustión, Decaimiento)</p>
          <p>• <strong>Funcionalidad:</strong> Selección, validación y obtención de valores</p>
        </div>
      </div>
    </div>
  );
};

export default StaticValuesDemo;
