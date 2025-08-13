import React, { useState, useEffect } from 'react';
import {
  FaUserCheck,
  FaUserTimes,
  FaExclamationTriangle,
  FaUsers,
  FaClock,
  FaFire,
  FaAsterisk
} from 'react-icons/fa';
import {
  MdCalendarToday,
  MdBusiness
} from 'react-icons/md';
import {
  getDisponibilidades,
  updateDisponibilidad,
  createDisponibilidad,
  getDisponibilidadActiva,
  changeDisponibilidadStatus
} from '@services/disponibilidad.service';
import { getUsers } from '@services/usuario.service';
import { useAuth } from '@hooks/auth/useAuth';
import { dateHelper } from '@helpers/dateHelper';
import DatePicker, { registerLocale } from 'react-datepicker';
import { es } from 'date-fns/locale';
import 'react-datepicker/dist/react-datepicker.css';
import Select from '@components/Select';
import CustomDatePicker from '@components/CustomDatePicker';

// Registrar el locale español
registerLocale('es', es);



const Disponibilidad = () => {
  const { user, hasPermission } = useAuth();
  const [disponibilidades, setDisponibilidades] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingMyStatus, setUpdatingMyStatus] = useState(false);
  const [miEstado, setMiEstado] = useState('disponible');
  const [miRolServicio, setMiRolServicio] = useState('');
  const [miDisponibilidad, setMiDisponibilidad] = useState(null);
  const [stats, setStats] = useState({
    disponibles: 0,
    noDisponibles: 0,
    enServicio: 0,
    total: 0
  });

  // Estados para fechas y tiempos
  const [fechaInicio, setFechaInicio] = useState('');
  const [tipoTermino, setTipoTermino] = useState('duracion');
  const [duracionHoras, setDuracionHoras] = useState(2);
  const [duracionMinutos, setDuracionMinutos] = useState(0);
  const [fechaTermino, setFechaTermino] = useState('');
  const [customHours, setCustomHours] = useState(1);

  const initializeFechas = () => {
    // Inicializar con la fecha actual en Santiago más 10 minutos
    const now = dateHelper.now().plus({ minutes: 10 });
    const fechaInicioStr = dateHelper.toInputFormat(now);
    setFechaInicio(fechaInicioStr);
  };

  const calcularFechaTermino = () => {
    if (!fechaInicio) return null;
    
    const inicio = dateHelper.fromInputFormat(fechaInicio);
    const termino = dateHelper.add(inicio, { hours: duracionHoras, minutes: duracionMinutos });
    
    return dateHelper.toUTC(termino).toISO();
  };

  useEffect(() => {
    initializeFechas();
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [disponibilidadesResponse, usuariosResponse] = await Promise.all([
        getDisponibilidades(),
        getUsers()
      ]);

      // Asegurar que siempre trabajemos con arrays
      const disponibilidadesData = Array.isArray(disponibilidadesResponse) 
        ? disponibilidadesResponse 
        : disponibilidadesResponse?.data || [];
      
      const usuariosData = Array.isArray(usuariosResponse) 
        ? usuariosResponse 
        : usuariosResponse?.data || [];

      setDisponibilidades(disponibilidadesData);
      setUsuarios(usuariosData);
      calculateStats(disponibilidadesData);

      // Cargar disponibilidad activa del usuario actual
      if (user?.id) {
        try {
          const disponibilidadActivaResponse = await getDisponibilidadActiva(user.id);
          const miDisp = disponibilidadActivaResponse?.data;
          
          setMiDisponibilidad(miDisp);
          if (miDisp) {
            setMiEstado(miDisp.estado);
            setMiRolServicio(miDisp.rol_servicio || '');
            if (miDisp.fecha_inicio) {
              try {
                setFechaInicio(dateHelper.toInputFormat(miDisp.fecha_inicio));
              } catch (error) {
                console.warn('Error processing fecha_inicio:', error, miDisp.fecha_inicio);
                initializeFechas();
              }
            }
          } else {
            // Si no hay disponibilidad activa, resetear el formulario
            setMiEstado('disponible');
            setMiRolServicio('');
            initializeFechas();
          }
        } catch (err) {
          // Si no hay disponibilidad activa, no es un error
          setMiDisponibilidad(null);
          setMiEstado('disponible');
          setMiRolServicio('');
          initializeFechas();
        }
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data) => {
    // Asegurar que data sea un array
    const dataArray = Array.isArray(data) ? data : [];
    
    // Aplicar los mismos filtros que en la tabla: solo activas y sin duplicados
    const filteredData = dataArray
      .filter((disponibilidad) => {
        // Filtrar solo disponibilidades activas
        if (!disponibilidad.fecha_termino) {
          return true; // Sin fecha de término = activa
        }
        
        try {
          const now = dateHelper.now();
          const fechaTermino = dateHelper.toSantiago(disponibilidad.fecha_termino);
          return fechaTermino > now; // Solo si la fecha de término es futura
        } catch (error) {
          console.warn('Error checking fecha_termino in stats:', error);
          return false;
        }
      })
      .reduce((unique, disponibilidad) => {
        // Eliminar duplicados por usuario_id, manteniendo el más reciente
        const existingIndex = unique.findIndex(d => d.usuario_id === disponibilidad.usuario_id);
        if (existingIndex === -1) {
          unique.push(disponibilidad);
        } else {
          try {
            const existingDate = dateHelper.toSantiago(unique[existingIndex].createdAt || unique[existingIndex].fecha_inicio);
            const currentDate = dateHelper.toSantiago(disponibilidad.createdAt || disponibilidad.fecha_inicio);
            if (currentDate > existingDate) {
              unique[existingIndex] = disponibilidad;
            }
          } catch (error) {
            console.warn('Error comparing dates for duplicates in stats:', error);
          }
        }
        return unique;
      }, []);
    
    const stats = {
      disponibles: filteredData.filter(d => d.estado === 'disponible').length,
      noDisponibles: filteredData.filter(d => d.estado === 'no_disponible').length,
      enServicio: filteredData.filter(d => d.estado === 'en_servicio').length,
      total: filteredData.length
    };
    setStats(stats);
  };



  const handleMyStatusUpdate = async () => {
    if (!user?.id) {
      setError('Usuario no válido');
      return;
    }

    // Validar que se seleccione un rol de servicio cuando el estado es 'en_servicio'
    if (miEstado === 'en_servicio' && (!miRolServicio || miRolServicio.trim() === '')) {
      setError('Debes seleccionar un rol de servicio cuando estás "En Servicio"');
      return;
    }

    try {
      setUpdatingMyStatus(true);
      setError(null);

      const datosDisponibilidad = {
        usuario_id: user.id,
        estado: miEstado,
        rol_servicio: miRolServicio || null
      };

      // Si hay fecha de inicio, convertirla a UTC para el backend
      if (fechaInicio) {
        const inicioUTC = dateHelper.toUTC(dateHelper.fromInputFormat(fechaInicio));
        datosDisponibilidad.fecha_inicio = inicioUTC.toISO();
      }

      // Si hay fecha de término, convertirla a UTC para el backend
      if (fechaTermino) {
        const terminoUTC = dateHelper.toUTC(dateHelper.fromInputFormat(fechaTermino));
        datosDisponibilidad.fecha_termino = terminoUTC.toISO();
      }

      await changeDisponibilidadStatus(datosDisponibilidad);
      loadData();
    } catch (err) {
      console.error('Error updating my status:', err);
      setError('Error al actualizar tu estado');
    } finally {
      setUpdatingMyStatus(false);
    }
  };

  const handleRemoveStatus = async () => {
    if (!miDisponibilidad || !user?.id) return;

    try {
      setUpdatingMyStatus(true);
      setError(null);

      // Cerrar el estado actual sin crear uno nuevo
      await changeDisponibilidadStatus({
        usuario_id: user.id,
        estado: 'cerrar_estado'
      });

      // Limpiar el estado local inmediatamente
      setMiDisponibilidad(null);
      setMiEstado('disponible');
      setMiRolServicio('');
      setFechaInicio('');
      setFechaTermino('');
      initializeFechas();

      // Recargar datos después de quitar el estado
      await loadData();
    } catch (err) {
      console.error('❌ Error removing status:', err);
      setError('Error al quitar el estado');
    } finally {
      setUpdatingMyStatus(false);
    }
  };

  const getUsuarioInfo = (usuarioId, disponibilidad = null) => {
    // Si la disponibilidad incluye datos del usuario, usarlos directamente
    if (disponibilidad?.usuario) {
      const { nombres, apellidos } = disponibilidad.usuario;
      const nombreCompleto = nombres ? nombres.join(' ') : '';
      const apellidoCompleto = apellidos ? apellidos.join(' ') : '';
      return `${nombreCompleto} ${apellidoCompleto}`.trim() || 'Usuario desconocido';
    }
    
    // Fallback: buscar en la lista de usuarios
    const usuario = usuarios.find(u => u.id === usuarioId);
    if (usuario) {
      const nombreCompleto = usuario.nombres ? usuario.nombres.join(' ') : (usuario.nombre || '');
      const apellidoCompleto = usuario.apellidos ? usuario.apellidos.join(' ') : (usuario.apellido || '');
      return `${nombreCompleto} ${apellidoCompleto}`.trim() || 'Usuario desconocido';
    }
    
    return 'Usuario desconocido';
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'disponible':
      case 'en_servicio':
        return 'bg-green-100 text-green-800';
      case 'no_disponible':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getEstadoIcon = (estado) => {
    switch (estado) {
      case 'disponible':
      case 'en_servicio':
        return <FaUserCheck className="text-green-600" />;
      case 'no_disponible':
        return <FaUserTimes className="text-red-600" />;
      default:
        return <FaUsers className="text-gray-600" />;
    }
  };

  const formatFecha = (fecha) => {
    try {
      if (!fecha) return '-';
      return dateHelper.format(fecha, 'dd/MM/yyyy HH:mm');
    } catch (error) {
      console.warn('Error formatting date:', error, fecha);
      return '-';
    }
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
            Gestiona tu estado de disponibilidad y visualiza el estado del personal
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Formulario de Estado - Izquierda */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Mi Estado de Servicio</h2>
            
            {/* Si hay disponibilidad activa, mostrar botón grande para quitar estado */}
            {miDisponibilidad && (
              <div className="text-center mb-6">
                <div className={`border-2 rounded-xl p-6 mb-4 ${
                  miDisponibilidad.estado === 'en_servicio' 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-red-50 border-red-200'
                }`}>
                  <div className="flex items-center justify-center gap-3 mb-3">
                    {getEstadoIcon(miDisponibilidad.estado)}
                    <span className="text-xl font-semibold text-gray-800">
                      {miDisponibilidad.estado === 'en_servicio' ? 'En Servicio' : 'No Disponible'}
                    </span>
                  </div>
                  {miDisponibilidad.rol_servicio && (
                    <p className="text-lg text-gray-600 mb-2">
                      Rol: {miDisponibilidad.rol_servicio}
                    </p>
                  )}
                  <p className="text-sm text-gray-500">
                    Desde: {formatFecha(miDisponibilidad.fecha_inicio)}
                  </p>
                  {miDisponibilidad.fecha_termino && (
                    <p className="text-sm text-gray-500">
                      Hasta: {formatFecha(miDisponibilidad.fecha_termino)}
                    </p>
                  )}
                </div>
                
                <button
                  onClick={handleRemoveStatus}
                  disabled={updatingMyStatus}
                  className="w-full py-4 px-6 bg-red-500 hover:bg-red-600 text-white text-lg font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                >
                  {updatingMyStatus ? 'Quitando Estado...' : 'Quitar Estado Actual'}
                </button>
              </div>
            )}
            
            {/* Formulario solo aparece si no hay disponibilidad activa */}
            {!miDisponibilidad && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <button
                    onClick={() => setMiEstado('en_servicio')}
                    className={`flex items-center justify-center gap-2 p-4 rounded-lg border-2 transition-colors ${
                      miEstado === 'en_servicio'
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-300 hover:border-green-300'
                    }`}
                  >
                    <FaUserCheck />
                    En Servicio
                  </button>
                  
                  <button
                    onClick={() => setMiEstado('no_disponible')}
                    className={`flex items-center justify-center gap-2 p-4 rounded-lg border-2 transition-colors ${
                      miEstado === 'no_disponible'
                        ? 'border-red-500 bg-red-50 text-red-700'
                        : 'border-gray-300 hover:border-red-300'
                    }`}
                  >
                    <FaUserTimes />
                    No Disponible
                  </button>
                </div>

                {/* Opciones específicas para En Servicio */}
                {miEstado === 'en_servicio' && (
                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <div className="flex items-center gap-1">
                          <span>Rol de Servicio</span>
                          <span className="relative group">
                            <FaAsterisk className="w-2 h-2 text-red-500" />
                            <span className="absolute left-4 top-0 z-10 hidden group-hover:block bg-white text-xs text-gray-700 border border-gray-300 rounded px-2 py-1 shadow-lg min-w-max">
                              Este campo es obligatorio
                            </span>
                          </span>
                        </div>
                      </label>
                      <Select
                        value={miRolServicio}
                        onChange={(e) => setMiRolServicio(e.target.value)}
                        options={[
                          { value: '', label: 'Seleccionar rol' },
                          { value: 'Maquinista', label: 'Maquinista' },
                          { value: 'Tripulante', label: 'Tripulante' }
                        ]}
                        placeholder="Seleccionar rol"
                        icon={<MdBusiness size={22} />}
                        required
                      />
                    </div>

                    {/* Campo de Fecha y Hora de Inicio */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fecha y Hora de Inicio
                      </label>
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">
                            Fecha
                          </label>
                          <CustomDatePicker
                            selected={fechaInicio ? dateHelper.fromInputFormat(fechaInicio).toJSDate() : null}
                            onChange={(date) => {
                              if (date) {
                                const currentTime = fechaInicio ? fechaInicio.split('T')[1] : '09:00';
                                const luxonDate = dateHelper.toSantiago(date);
                                const newFechaInicio = luxonDate.toFormat('yyyy-MM-dd') + 'T' + currentTime;
                                
                                try {
                                  const now = dateHelper.now();
                                  const selectedDate = dateHelper.fromInputFormat(newFechaInicio);
                                  if (selectedDate < now) {
                                    alert('La fecha de inicio no puede ser anterior a la hora actual');
                                    return;
                                  }
                                  
                                  if (fechaTermino) {
                                    const terminoDate = dateHelper.fromInputFormat(fechaTermino);
                                    if (selectedDate >= terminoDate) {
                                      setFechaTermino('');
                                    }
                                  }
                                  
                                  setFechaInicio(newFechaInicio);
                                } catch (error) {
                                  console.warn('Error validating fecha inicio:', error);
                                }
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
                              const newFechaInicio = `${currentDate}T${newTime}`;
                              setFechaInicio(newFechaInicio);
                              
                              // Validar que no sea menor a la hora actual
                              try {
                                const now = dateHelper.now();
                                const selectedDate = dateHelper.fromInputFormat(newFechaInicio);
                                if (selectedDate < now) {
                                  alert('La fecha de inicio no puede ser anterior a la hora actual');
                                  return;
                                }
                                
                                // Si hay fecha de término, validar que inicio sea antes que término
                                if (fechaTermino) {
                                  const terminoDate = dateHelper.fromInputFormat(fechaTermino);
                                  if (selectedDate >= terminoDate) {
                                    setFechaTermino(''); // Limpiar fecha de término si es inválida
                                  }
                                }
                              } catch (error) {
                                console.warn('Error validating fecha inicio:', error);
                              }
                            }}
                            className="w-full p-3 bg-white border border-[#2C3E50]/20 rounded-lg text-[#2C3E50] placeholder-[#2C3E50]/60 focus:outline-none focus:ring-2 focus:ring-[#4EB9FA]/40 transition"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="grid grid-cols-3 gap-2">
                          <button
                             type="button"
                             onClick={() => {
                               const now = dateHelper.now();
                               setFechaInicio(dateHelper.toInputFormat(now));
                             }}
                             className="px-3 py-2 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                           >
                             Ahora
                           </button>
                           <button
                             type="button"
                             onClick={() => {
                               const now = dateHelper.now();
                               const futureTime = dateHelper.add(now, { minutes: 30 });
                               setFechaInicio(dateHelper.toInputFormat(futureTime));
                             }}
                             className="px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                           >
                             +30 min
                           </button>
                           <button
                             type="button"
                             onClick={() => {
                               const now = dateHelper.now();
                               const futureTime = dateHelper.add(now, { hours: 1 });
                               setFechaInicio(dateHelper.toInputFormat(futureTime));
                             }}
                             className="px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                           >
                             +1 hora
                           </button>
                        </div>
                      </div>
                    </div>

                    {/* Campo de Fecha y Hora de Término */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fecha y Hora de Término Estimada
                      </label>
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">
                            Fecha
                          </label>
                          <CustomDatePicker
                            selected={fechaTermino ? dateHelper.fromInputFormat(fechaTermino).toJSDate() : null}
                            onChange={(date) => {
                              if (date) {
                                const currentTime = fechaTermino ? fechaTermino.split('T')[1] : '18:00';
                                const luxonDate = dateHelper.toSantiago(date);
                                const newFechaTermino = luxonDate.toFormat('yyyy-MM-dd') + 'T' + currentTime;
                                
                                try {
                                  const now = dateHelper.now();
                                  const selectedDate = dateHelper.fromInputFormat(newFechaTermino);
                                  if (selectedDate < now) {
                                    alert('La fecha de término no puede ser anterior a la hora actual');
                                    return;
                                  }
                                  
                                  if (fechaInicio) {
                                    const inicioDate = dateHelper.fromInputFormat(fechaInicio);
                                    if (selectedDate <= inicioDate) {
                                      alert('La fecha de término debe ser posterior a la fecha de inicio');
                                      return;
                                    }
                                  }
                                  
                                  setFechaTermino(newFechaTermino);
                                } catch (error) {
                                  console.warn('Error validating fecha termino:', error);
                                }
                              }
                            }}
                            placeholder="Seleccionar fecha de término"
                            minDate={fechaInicio ? dateHelper.fromInputFormat(fechaInicio).toJSDate() : new Date()}
                            className="w-full"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Hora</label>
                          <input
                            type="time"
                            value={fechaTermino ? fechaTermino.split('T')[1] : '11:00'}
                            onChange={(e) => {
                              const newTime = e.target.value;
                              const currentDate = fechaTermino ? fechaTermino.split('T')[0] : (fechaInicio ? fechaInicio.split('T')[0] : dateHelper.toInputFormat(dateHelper.now()).split('T')[0]);
                              const newFechaTermino = `${currentDate}T${newTime}`;
                              
                              // Validar que no sea menor a la hora actual
                              try {
                                const now = dateHelper.now();
                                const selectedDate = dateHelper.fromInputFormat(newFechaTermino);
                                if (selectedDate < now) {
                                  alert('La fecha de término no puede ser anterior a la hora actual');
                                  return;
                                }
                                
                                // Validar que término sea después de inicio
                                if (fechaInicio) {
                                  const inicioDate = dateHelper.fromInputFormat(fechaInicio);
                                  if (selectedDate <= inicioDate) {
                                    alert('La fecha de término debe ser posterior a la fecha de inicio');
                                    return;
                                  }
                                }
                                
                                setFechaTermino(newFechaTermino);
                              } catch (error) {
                                console.warn('Error validating fecha termino:', error);
                                setFechaTermino(newFechaTermino);
                              }
                            }}
                            className="w-full p-3 bg-white border border-[#2C3E50]/20 rounded-lg text-[#2C3E50] placeholder-[#2C3E50]/60 focus:outline-none focus:ring-2 focus:ring-[#4EB9FA]/40 transition"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="grid grid-cols-3 gap-2">
                          <button
                             type="button"
                             onClick={() => {
                               const baseTime = fechaInicio ? dateHelper.fromInputFormat(fechaInicio) : dateHelper.now();
                               const futureTime = dateHelper.add(baseTime, { hours: 2 });
                               setFechaTermino(dateHelper.toInputFormat(futureTime));
                             }}
                             className="px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                           >
                             +2 horas
                           </button>
                           <button
                             type="button"
                             onClick={() => {
                               const baseTime = fechaInicio ? dateHelper.fromInputFormat(fechaInicio) : dateHelper.now();
                               const futureTime = dateHelper.add(baseTime, { hours: 4 });
                               setFechaTermino(dateHelper.toInputFormat(futureTime));
                             }}
                             className="px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                           >
                             +4 horas
                           </button>
                           <button
                             type="button"
                             onClick={() => {
                               const baseTime = fechaInicio ? dateHelper.fromInputFormat(fechaInicio) : dateHelper.now();
                               const futureTime = dateHelper.add(baseTime, { hours: 8 });
                               setFechaTermino(dateHelper.toInputFormat(futureTime));
                             }}
                             className="px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                           >
                             +8 horas
                           </button>
                        </div>
                        
                        {/* Campo personalizado para horas */}
                        <div className="flex items-center gap-2">
                          <label className="text-sm text-gray-600 whitespace-nowrap">Horas personalizadas:</label>
                          <div className="flex items-center gap-1">
                             <button
                               type="button"
                               onClick={() => {
                                 if (customHours > 1) setCustomHours(customHours - 1);
                               }}
                               className="px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                             >
                               -
                             </button>
                             <input
                               type="number"
                               min="1"
                               max="24"
                               value={customHours}
                               onChange={(e) => setCustomHours(parseInt(e.target.value) || 1)}
                               className="w-16 px-2 py-1 text-center border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                             />
                             <button
                               type="button"
                               onClick={() => {
                                 if (customHours < 24) setCustomHours(customHours + 1);
                               }}
                               className="px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                             >
                               +
                             </button>
                             <button
                               type="button"
                               onClick={() => {
                                 const baseTime = fechaInicio ? dateHelper.fromInputFormat(fechaInicio) : dateHelper.now();
                                 const futureTime = dateHelper.add(baseTime, { hours: customHours });
                                 setFechaTermino(dateHelper.toInputFormat(futureTime));
                               }}
                               className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm"
                             >
                               Aplicar
                             </button>
                           </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleMyStatusUpdate}
                  disabled={updatingMyStatus || (miEstado !== 'en_servicio' && miEstado !== 'no_disponible') || (miEstado === 'en_servicio' && (!miRolServicio || miRolServicio.trim() === ''))}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {updatingMyStatus ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Actualizando...
                    </>
                  ) : (
                    'Actualizar Estado'
                  )}
                </button>
              </>
            )}
            

          </div>

          {/* Lista de Personal En Servicio - Derecha */}
          {hasPermission('disponibilidad:read_all') && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Personal En Servicio</h2>
                <span className="flex items-center gap-2 text-sm text-gray-600">
                  <FaUsers />
                  {stats.disponibles + stats.enServicio} activos
                </span>
              </div>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {(Array.isArray(disponibilidades) ? disponibilidades : [])
                  .filter((disponibilidad) => {
                    // Solo disponibles o en servicio
                    if (disponibilidad.estado !== 'disponible' && disponibilidad.estado !== 'en_servicio') {
                      return false;
                    }
                    
                    // Filtrar solo disponibilidades activas
                    if (!disponibilidad.fecha_termino) {
                      return true; // Sin fecha de término = activa
                    }
                    
                    try {
                      const now = dateHelper.now();
                      const fechaTermino = dateHelper.toSantiago(disponibilidad.fecha_termino);
                      return fechaTermino > now; // Solo si la fecha de término es futura
                    } catch (error) {
                      console.warn('Error checking fecha_termino in personal list:', error);
                      return false;
                    }
                  })
                  .reduce((unique, disponibilidad) => {
                    // Eliminar duplicados por usuario_id, manteniendo el más reciente
                    const existingIndex = unique.findIndex(d => d.usuario_id === disponibilidad.usuario_id);
                    if (existingIndex === -1) {
                      unique.push(disponibilidad);
                    } else {
                      try {
                        const existingDate = dateHelper.toSantiago(unique[existingIndex].createdAt || unique[existingIndex].fecha_inicio);
                        const currentDate = dateHelper.toSantiago(disponibilidad.createdAt || disponibilidad.fecha_inicio);
                        if (currentDate > existingDate) {
                          unique[existingIndex] = disponibilidad;
                        }
                      } catch (error) {
                        console.warn('Error comparing dates for duplicates in personal list:', error);
                      }
                    }
                    return unique;
                  }, [])
                  .map((disponibilidad) => (
                    <div key={disponibilidad.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0">
                        {getEstadoIcon(disponibilidad.estado)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm truncate">
                          {getUsuarioInfo(disponibilidad.usuario_id, disponibilidad)}
                        </p>
                        <p className="text-xs text-gray-600">
                          {disponibilidad.rol_servicio || 'Sin rol asignado'}
                        </p>
                        <p className="text-xs text-gray-500">
                          Desde {formatFecha(disponibilidad.fecha_inicio).split(' ')[1]}
                        </p>
                      </div>
                    </div>
                  ))}
                
                {(Array.isArray(disponibilidades) ? disponibilidades : [])
                  .filter((disponibilidad) => {
                    // Solo disponibles o en servicio
                    if (disponibilidad.estado !== 'disponible' && disponibilidad.estado !== 'en_servicio') {
                      return false;
                    }
                    
                    // Filtrar solo disponibilidades activas
                    if (!disponibilidad.fecha_termino) {
                      return true; // Sin fecha de término = activa
                    }
                    
                    try {
                      const now = dateHelper.now();
                      const fechaTermino = dateHelper.toSantiago(disponibilidad.fecha_termino);
                      return fechaTermino > now; // Solo si la fecha de término es futura
                    } catch (error) {
                      console.warn('Error checking fecha_termino in empty check:', error);
                      return false;
                    }
                  })
                  .reduce((unique, disponibilidad) => {
                    // Eliminar duplicados por usuario_id, manteniendo el más reciente
                    const existingIndex = unique.findIndex(d => d.usuario_id === disponibilidad.usuario_id);
                    if (existingIndex === -1) {
                      unique.push(disponibilidad);
                    } else {
                      try {
                        const existingDate = dateHelper.toSantiago(unique[existingIndex].createdAt || unique[existingIndex].fecha_inicio);
                        const currentDate = dateHelper.toSantiago(disponibilidad.createdAt || disponibilidad.fecha_inicio);
                        if (currentDate > existingDate) {
                          unique[existingIndex] = disponibilidad;
                        }
                      } catch (error) {
                        console.warn('Error comparing dates for duplicates in empty check:', error);
                      }
                    }
                    return unique;
                  }, []).length === 0 && (
                  <div className="text-center py-8">
                    <FaUsers className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                      No hay personal en servicio
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Actualmente no hay voluntarios disponibles o en servicio.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">En Servicio</p>
                <p className="text-2xl font-bold text-green-600">{stats.disponibles + stats.enServicio}</p>
              </div>
              <FaUserCheck className="text-3xl text-green-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">No Disponibles</p>
                <p className="text-2xl font-bold text-red-600">{stats.noDisponibles}</p>
              </div>
              <FaUserTimes className="text-3xl text-red-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Voluntarios</p>
                <p className="text-2xl font-bold text-gray-700">{stats.total}</p>
              </div>
              <FaUsers className="text-3xl text-gray-700" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Disponibilidades Activas
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Voluntario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rol de Servicio
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
                {(Array.isArray(disponibilidades) ? disponibilidades : [])
                  .filter((disponibilidad) => {
                    // Filtrar solo disponibilidades activas
                    if (!disponibilidad.fecha_termino) {
                      return true; // Sin fecha de término = activa
                    }
                    
                    try {
                      const now = dateHelper.now();
                      const fechaTermino = dateHelper.toSantiago(disponibilidad.fecha_termino);
                      return fechaTermino > now; // Solo si la fecha de término es futura
                    } catch (error) {
                      console.warn('Error checking fecha_termino:', error);
                      return false;
                    }
                  })
                  .reduce((unique, disponibilidad) => {
                    // Eliminar duplicados por usuario_id, manteniendo el más reciente
                    const existingIndex = unique.findIndex(d => d.usuario_id === disponibilidad.usuario_id);
                    if (existingIndex === -1) {
                      unique.push(disponibilidad);
                    } else {
                      try {
                        const existingDate = dateHelper.toSantiago(unique[existingIndex].createdAt || unique[existingIndex].fecha_inicio);
                        const currentDate = dateHelper.toSantiago(disponibilidad.createdAt || disponibilidad.fecha_inicio);
                        if (currentDate > existingDate) {
                          unique[existingIndex] = disponibilidad;
                        }
                      } catch (error) {
                        console.warn('Error comparing dates for duplicates:', error);
                      }
                    }
                    return unique;
                  }, [])
                  .sort((a, b) => {
                    try {
                      if (!a.createdAt || !b.createdAt) {
                        return 0;
                      }
                      const dateA = dateHelper.toSantiago(a.createdAt);
                      const dateB = dateHelper.toSantiago(b.createdAt);
                      return dateB.toMillis() - dateA.toMillis();
                    } catch (error) {
                      console.warn('Error sorting dates:', error);
                      return 0;
                    }
                  })
                  .map((disponibilidad) => (
                  <tr key={disponibilidad.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {getUsuarioInfo(disponibilidad.usuario_id, disponibilidad)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getEstadoIcon(disponibilidad.estado)}
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEstadoColor(disponibilidad.estado)}`}>
                          {disponibilidad.estado === 'disponible' || disponibilidad.estado === 'en_servicio' 
                            ? 'EN SERVICIO' 
                            : 'NO DISPONIBLE'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {disponibilidad.rol_servicio || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {disponibilidad.fecha_inicio ? formatFecha(disponibilidad.fecha_inicio) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {disponibilidad.fecha_termino ? formatFecha(disponibilidad.fecha_termino) : 'En curso'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {(!Array.isArray(disponibilidades) || disponibilidades.length === 0) && (
              <div className="text-center py-12">
                <FaUsers className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No hay datos de disponibilidad
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  No se encontraron registros de disponibilidad de voluntarios.
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