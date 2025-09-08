import React, { useState, useEffect } from 'react';
import {
  FaUserCheck,
  FaUserTimes,
  FaUsers,
  FaClock
} from 'react-icons/fa';
import {
  getDisponibilidades,
  createDisponibilidad,
  cerrarDisponibilidad
} from '@services/disponibilidad.service';
import { getBomberos } from '@services/bombero.service';
import { useAuth } from '@hooks/auth/useAuth';
import { dateHelper } from '@helpers/dateHelper';
import CustomDatePicker from '@components/CustomDatePicker';

const Disponibilidad = () => {
  const { bombero, hasPermiso } = useAuth();
  const [disponibilidades, setDisponibilidades] = useState([]);
  const [bomberos, setBomberos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingMyStatus, setUpdatingMyStatus] = useState(false);
  const [miDisponibilidad, setMiDisponibilidad] = useState(null);
  const [stats, setStats] = useState({
    disponibles: 0,
    inactivos: 0,
    total: 0
  });

  // Estados para fechas simplificadas
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaTermino, setFechaTermino] = useState('');

  const initializeFechas = () => {
    const now = dateHelper.now().plus({ minutes: 10 });
    const fechaInicioStr = dateHelper.toInputFormat(now);
    setFechaInicio(fechaInicioStr);
    
    // Fecha de término por defecto: 4 horas después
    const termino = now.plus({ hours: 4 });
    const fechaTerminoStr = dateHelper.toInputFormat(termino);
    setFechaTermino(fechaTerminoStr);
  };

  useEffect(() => {
    initializeFechas();
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [disponibilidadesResponse, bomberosResponse] = await Promise.all([
        getDisponibilidades(),
        getBomberos()
      ]);

      const disponibilidadesData = disponibilidadesResponse || [];
      const bomberosData = bomberosResponse || [];

      setDisponibilidades(disponibilidadesData);
      setBomberos(bomberosData);

      // Buscar mi disponibilidad activa
      if (bombero?.id && Array.isArray(disponibilidadesData)) {
        const miDisp = disponibilidadesData.find(d => 
          d.idBombero === bombero.id && 
          (!d.fechaTermino || new Date(d.fechaTermino) > new Date())
        );
        
        setMiDisponibilidad(miDisp || null);
      }

      calculateStats(disponibilidadesData);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data) => {
    const dataArray = Array.isArray(data) ? data : [];
    
    // Filtrar disponibilidades activas (sin fechaTermino o fechaTermino futura)
    const filteredData = dataArray
      .filter((disponibilidad) => {
        if (!disponibilidad.fechaTermino) {
          return true; // Sin fecha de término = activa
        }
        
        try {
          const now = new Date();
          const fechaTermino = new Date(disponibilidad.fechaTermino);
          return fechaTermino > now; // Solo si la fecha de término es futura
        } catch (error) {
          console.warn('Error checking fechaTermino:', error);
          return false;
        }
      })
      .reduce((unique, disponibilidad) => {
        // Eliminar duplicados por idBombero, manteniendo el más reciente
        const existingIndex = unique.findIndex(d => d.idBombero === disponibilidad.idBombero);
        if (existingIndex === -1) {
          unique.push(disponibilidad);
        } else {
          try {
            const existing = unique[existingIndex];
            const currentDate = new Date(disponibilidad.fechaInicio);
            const existingDate = new Date(existing.fechaInicio);
            
            if (currentDate > existingDate) {
              unique[existingIndex] = disponibilidad;
            }
          } catch (error) {
            console.warn('Error comparing dates:', error);
          }
        }
        return unique;
      }, []);
    
    const stats = {
      disponibles: filteredData.length,
      inactivos: dataArray.filter(d => d.fechaTermino && new Date(d.fechaTermino) <= new Date()).length,
      total: dataArray.length
    };
    setStats(stats);
  };

  const handleCreateDisponibilidad = async () => {
    if (!bombero?.id) {
      setError('Bombero no válido');
      return;
    }

    try {
      setUpdatingMyStatus(true);
      setError(null);

      const datosDisponibilidad = {
        idBombero: bombero.id,
      };

      // Si hay fecha de inicio, convertirla a UTC para el backend
      if (fechaInicio) {
        const inicioUTC = dateHelper.toUTC(dateHelper.fromInputFormat(fechaInicio));
        datosDisponibilidad.fechaInicio = inicioUTC.toISO();
      }

      // Si hay fecha de término, convertirla a UTC para el backend
      if (fechaTermino) {
        const terminoUTC = dateHelper.toUTC(dateHelper.fromInputFormat(fechaTermino));
        datosDisponibilidad.fechaTermino = terminoUTC.toISO();
      }

      await createDisponibilidad(datosDisponibilidad);
      loadData();
    } catch (err) {
      console.error('Error creating disponibilidad:', err);
      setError('Error al crear disponibilidad');
    } finally {
      setUpdatingMyStatus(false);
    }
  };

  const handleCerrarDisponibilidad = async () => {
    if (!miDisponibilidad || !bombero?.id) return;

    try {
      setUpdatingMyStatus(true);
      setError(null);

      await cerrarDisponibilidad({
        idBombero: bombero.id
      });

      setMiDisponibilidad(null);
      loadData();
    } catch (err) {
      console.error('Error cerrando disponibilidad:', err);
      setError('Error al cerrar disponibilidad');
    } finally {
      setUpdatingMyStatus(false);
    }
  };

  const getBomberoInfo = (idBombero, disponibilidad = null) => {
    // Si la disponibilidad incluye datos del bombero, usarlos directamente
    if (disponibilidad?.bombero) {
      const { nombres, apellidos } = disponibilidad.bombero;
      const nombreCompleto = nombres ? nombres.join(' ') : '';
      const apellidoCompleto = apellidos ? apellidos.join(' ') : '';
      return `${nombreCompleto} ${apellidoCompleto}`.trim() || 'Bombero desconocido';
    }
    
    // Fallback: buscar en la lista de bomberos
    const bomberoInfo = bomberos.find(b => b.id === idBombero);
    if (bomberoInfo) {
      const nombreCompleto = bomberoInfo.nombres ? bomberoInfo.nombres.join(' ') : (bomberoInfo.nombre || '');
      const apellidoCompleto = bomberoInfo.apellidos ? bomberoInfo.apellidos.join(' ') : (bomberoInfo.apellido || '');
      return `${nombreCompleto} ${apellidoCompleto}`.trim() || 'Bombero desconocido';
    }
    
    return 'Bombero desconocido';
  };

  const formatFecha = (fecha) => {
    try {
      if (!fecha) return '-';
      const fechaObj = dateHelper.toSantiago(fecha);
      return dateHelper.format(fechaObj, 'dd/MM/yyyy HH:mm');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Fecha inválida';
    }
  };

  const estaDisponible = (disponibilidad) => {
    return !disponibilidad.fechaTermino || new Date(disponibilidad.fechaTermino) > new Date();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Control de Disponibilidad
          </h1>
          <p className="text-gray-600">
            Gestiona tu disponibilidad y visualiza el estado del personal
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Formulario de Disponibilidad - Izquierda */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Mi Disponibilidad</h2>
            
            {/* Si hay disponibilidad activa, mostrar información */}
            {miDisponibilidad ? (
              <div className="text-center mb-6">
                <div className="border-2 rounded-xl p-6 mb-4 bg-green-50 border-green-200">
                  <div className="flex items-center justify-center gap-3 mb-3">
                    <FaUserCheck className="text-green-600 text-2xl" />
                    <span className="text-xl font-semibold text-gray-800">
                      Disponible
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    Desde: {formatFecha(miDisponibilidad.fechaInicio)}
                  </p>
                  {miDisponibilidad.fechaTermino && (
                    <p className="text-sm text-gray-500">
                      Hasta: {formatFecha(miDisponibilidad.fechaTermino)}
                    </p>
                  )}
                </div>
                
                <button
                  onClick={handleCerrarDisponibilidad}
                  disabled={updatingMyStatus}
                  className="w-full py-4 px-6 bg-red-500 hover:bg-red-600 text-white text-lg font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                >
                  {updatingMyStatus ? 'Cerrando...' : 'Cerrar Disponibilidad'}
                </button>
              </div>
            ) : (
              // Formulario para crear disponibilidad
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha y Hora de Inicio
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Fecha</label>
                      <CustomDatePicker
                        selected={fechaInicio ? dateHelper.fromInputFormat(fechaInicio).toJSDate() : null}
                        onChange={(date) => {
                          if (date) {
                            const currentTime = fechaInicio ? fechaInicio.split('T')[1] : '09:00';
                            const dateStr = dateHelper.format(dateHelper.fromJSDate(date), 'yyyy-MM-dd');
                            setFechaInicio(`${dateStr}T${currentTime}`);
                          }
                        }}
                        placeholder="Seleccionar fecha de inicio"
                        minDate={new Date()}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Hora</label>
                      <input
                        type="time"
                        value={fechaInicio ? fechaInicio.split('T')[1] : '09:00'}
                        onChange={(e) => {
                          const newTime = e.target.value;
                          const currentDate = fechaInicio ? fechaInicio.split('T')[0] : dateHelper.toInputFormat(dateHelper.now()).split('T')[0];
                          setFechaInicio(`${currentDate}T${newTime}`);
                        }}
                        className="w-full p-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha y Hora de Término (Opcional)
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Fecha</label>
                      <CustomDatePicker
                        selected={fechaTermino ? dateHelper.fromInputFormat(fechaTermino).toJSDate() : null}
                        onChange={(date) => {
                          if (date) {
                            const currentTime = fechaTermino ? fechaTermino.split('T')[1] : '13:00';
                            const dateStr = dateHelper.format(dateHelper.fromJSDate(date), 'yyyy-MM-dd');
                            setFechaTermino(`${dateStr}T${currentTime}`);
                          } else {
                            setFechaTermino('');
                          }
                        }}
                        placeholder="Seleccionar fecha de término"
                        minDate={fechaInicio ? dateHelper.fromInputFormat(fechaInicio).toJSDate() : new Date()}
                        isClearable
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Hora</label>
                      <input
                        type="time"
                        value={fechaTermino ? fechaTermino.split('T')[1] : '13:00'}
                        onChange={(e) => {
                          const newTime = e.target.value;
                          const currentDate = fechaTermino ? fechaTermino.split('T')[0] : (fechaInicio ? fechaInicio.split('T')[0] : dateHelper.toInputFormat(dateHelper.now()).split('T')[0]);
                          setFechaTermino(`${currentDate}T${newTime}`);
                        }}
                        disabled={!fechaTermino}
                        className="w-full p-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                      />
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleCreateDisponibilidad}
                  disabled={updatingMyStatus || !fechaInicio}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {updatingMyStatus ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Creando...
                    </>
                  ) : (
                    'Marcar como Disponible'
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Resumen del Personal - Derecha */}
          {hasPermiso('disponibilidad:read_all') && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Personal Disponible</h2>
                <span className="flex items-center gap-2 text-sm text-gray-600">
                  <FaUsers />
                  {stats.disponibles} disponibles
                </span>
              </div>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {disponibilidades
                  .filter(d => estaDisponible(d))
                  .reduce((unique, disponibilidad) => {
                    const existingIndex = unique.findIndex(d => d.idBombero === disponibilidad.idBombero);
                    if (existingIndex === -1) {
                      unique.push(disponibilidad);
                    } else {
                      const existing = unique[existingIndex];
                      if (new Date(disponibilidad.fechaInicio) > new Date(existing.fechaInicio)) {
                        unique[existingIndex] = disponibilidad;
                      }
                    }
                    return unique;
                  }, [])
                  .map((disponibilidad) => (
                    <div key={disponibilidad.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0">
                        <FaUserCheck className="text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm truncate">
                          {getBomberoInfo(disponibilidad.idBombero, disponibilidad)}
                        </p>
                        <p className="text-xs text-gray-500">
                          Desde {formatFecha(disponibilidad.fechaInicio).split(' ')[1]}
                        </p>
                        {disponibilidad.fechaTermino && (
                          <p className="text-xs text-gray-500">
                            Hasta {formatFecha(disponibilidad.fechaTermino).split(' ')[1]}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                
                {disponibilidades.filter(d => estaDisponible(d)).length === 0 && (
                  <div className="text-center py-8">
                    <FaUsers className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                      No hay personal disponible
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Actualmente no hay bomberos marcados como disponibles.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Disponibles</p>
                <p className="text-2xl font-bold text-green-600">{stats.disponibles}</p>
              </div>
              <FaUserCheck className="text-3xl text-green-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Registros</p>
                <p className="text-2xl font-bold text-gray-700">{stats.total}</p>
              </div>
              <FaClock className="text-3xl text-gray-700" />
            </div>
          </div>
        </div>

        {/* Tabla de Disponibilidades */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Historial de Disponibilidades
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bombero
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha Inicio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha Término
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {disponibilidades
                  .sort((a, b) => new Date(b.fechaInicio) - new Date(a.fechaInicio))
                  .map((disponibilidad) => (
                  <tr key={disponibilidad.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {getBomberoInfo(disponibilidad.idBombero, disponibilidad)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {estaDisponible(disponibilidad) ? (
                          <>
                            <FaUserCheck className="text-green-600" />
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                              DISPONIBLE
                            </span>
                          </>
                        ) : (
                          <>
                            <FaUserTimes className="text-gray-600" />
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                              FINALIZADO
                            </span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatFecha(disponibilidad.fechaInicio)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {disponibilidad.fechaTermino ? formatFecha(disponibilidad.fechaTermino) : 'En curso'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {disponibilidades.length === 0 && (
              <div className="text-center py-12">
                <FaClock className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No hay registros de disponibilidad
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  No se encontraron registros de disponibilidad.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Disponibilidad;
