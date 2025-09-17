import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import LoadingPage from '@components/LoadingPage';
import {
  FaUserCheck,
  FaUserTimes,
  FaUsers,
  FaClock,
  FaCalendarAlt,
  FaSync,
  FaFilter,
  FaSearch,
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
  FaAngleDoubleLeft,
  FaAngleDoubleRight
} from 'react-icons/fa';
import {
  MdAccessTime,
  MdEvent,
  MdHistory,
  MdAdd
} from 'react-icons/md';
import {
  getDisponibilidades,
  createDisponibilidad,
  cerrarDisponibilidad
} from '@services/disponibilidad.service';
import { getBomberos } from '@services/bombero.service';
import { useAuth } from '@hooks/auth/useAuth';
import dateHelper from '@helpers/dateHelper';
import CustomDatePicker from '@components/CustomDatePicker';
import DateTimePicker from '@components/DateTimePicker';

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
  const [usarFechaTermino, setUsarFechaTermino] = useState(false);
  const [autoAjustado, setAutoAjustado] = useState(false);

  // Estados para modal de confirmación de acceso rápido
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [presetConfirmacion, setPresetConfirmacion] = useState(null);
  const [contador, setContador] = useState(3);
  const [timerRef, setTimerRef] = useState(null);

  // Estados para la interfaz con pestañas
  const [activeTab, setActiveTab] = useState('marcar'); // 'marcar' o 'historial'
  
  // Estados para filtros del historial
  const [filtros, setFiltros] = useState({
    bombero: '',
    fechaDesde: '',
    fechaHasta: '',
    estado: 'todos', // 'todos', 'disponible', 'finalizado'
    busqueda: ''
  });

  // Estados para paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const [registrosPorPagina] = useState(10);

  const initializeFechas = () => {
    // Usar la hora actual como mínimo
    const now = dateHelper.now();
    const fechaInicioStr = dateHelper.toInputFormat(now);
    setFechaInicio(fechaInicioStr);
    
    // No establecer fecha de término por defecto
    setFechaTermino('');
    setUsarFechaTermino(false);
    setAutoAjustado(false);
  };

  useEffect(() => {
    initializeFechas();
    loadData();
  }, []);

  // Cleanup del timer al desmontar el componente
  useEffect(() => {
    return () => {
      if (timerRef) {
        clearInterval(timerRef);
      }
    };
  }, [timerRef]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Cargar disponibilidades siempre
      const disponibilidadesResponse = await getDisponibilidades();
      const disponibilidadesData = Array.isArray(disponibilidadesResponse) ? disponibilidadesResponse : [];
      setDisponibilidades(disponibilidadesData);

      // Solo cargar bomberos si tiene permisos para leer todos los bomberos
      let bomberosData = [];
      if (hasPermiso('bombero:leer')) {
        try {
          const bomberosResponse = await getBomberos();
          bomberosData = Array.isArray(bomberosResponse) ? bomberosResponse : [];
        } catch (bomberosError) {
          console.warn('No se pudieron cargar los datos de bomberos (sin permisos):', bomberosError);
          // No es un error crítico, continuamos sin datos de bomberos
        }
      }
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

  // Función para mostrar confirmación de acceso rápido
  const handleAccesoRapido = (preset) => {
    if (!bombero?.id) {
      toast.error('Bombero no válido', {
        position: "bottom-right",
        autoClose: 3000,
      });
      return;
    }

    // Si ya hay disponibilidad activa, mostrar error
    if (miDisponibilidad) {
      toast.warning('Ya tienes una disponibilidad activa. Ciérrala antes de crear una nueva.', {
        position: "bottom-right",
        autoClose: 4000,
      });
      return;
    }

    // Mostrar modal de confirmación e iniciar contador
    setPresetConfirmacion(preset);
    setShowConfirmModal(true);
    setContador(3);
    
    // Iniciar countdown
    const timer = setInterval(() => {
      setContador(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          // Auto-confirmar cuando llegue a 0
          setTimeout(() => {
            confirmarAccesoRapido();
          }, 100);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    setTimerRef(timer);
  };

  // Función para confirmar y crear disponibilidad
  const confirmarAccesoRapido = async () => {
    if (!presetConfirmacion) return;

    try {
      setUpdatingMyStatus(true);
      setShowConfirmModal(false);
      
      const now = dateHelper.now();
      
      // Configurar fechas según el preset
      let fechaInicioStr = dateHelper.toInputFormat(now);
      let fechaTerminoStr = '';
      let usarTermino = false;
      let descripcionPreset = '';

      switch (presetConfirmacion) {
        case 'ahora': {
          descripcionPreset = 'disponibilidad indefinida';
          break;
        }
        case '2h': {
          const termino2h = now.plus({ hours: 2 });
          fechaTerminoStr = dateHelper.toInputFormat(termino2h);
          usarTermino = true;
          descripcionPreset = 'disponibilidad por 2 horas';
          break;
        }
        case '4h': {
          const termino4h = now.plus({ hours: 4 });
          fechaTerminoStr = dateHelper.toInputFormat(termino4h);
          usarTermino = true;
          descripcionPreset = 'disponibilidad por 4 horas';
          break;
        }
        case '8h': {
          const termino8h = now.plus({ hours: 8 });
          fechaTerminoStr = dateHelper.toInputFormat(termino8h);
          usarTermino = true;
          descripcionPreset = 'disponibilidad por 8 horas';
          break;
        }
        case '22h': {
          const hoy = now.startOf('day');
          const termino22h = hoy.set({ hour: 22, minute: 0 });
          fechaTerminoStr = dateHelper.toInputFormat(termino22h);
          usarTermino = true;
          descripcionPreset = 'disponibilidad hasta las 22:00';
          break;
        }
        case 'noche': {
          const manana = now.plus({ days: 1 }).startOf('day');
          const terminoNoche = manana.set({ hour: 6, minute: 0 });
          fechaTerminoStr = dateHelper.toInputFormat(terminoNoche);
          usarTermino = true;
          descripcionPreset = 'turno de noche hasta las 06:00';
          break;
        }
      }

      // Actualizar estado del formulario
      setFechaInicio(fechaInicioStr);
      setFechaTermino(fechaTerminoStr);
      setUsarFechaTermino(usarTermino);

      // Crear disponibilidad inmediatamente
      const datosDisponibilidad = {
        idBombero: bombero.id,
      };

      // Configurar fecha de inicio
      const inicioUTC = dateHelper.toUTC(dateHelper.fromInputFormat(fechaInicioStr));
      datosDisponibilidad.fechaInicio = inicioUTC.toISO();

      // Configurar fecha de término si aplica
      if (usarTermino && fechaTerminoStr) {
        const terminoUTC = dateHelper.toUTC(dateHelper.fromInputFormat(fechaTerminoStr));
        datosDisponibilidad.fechaTermino = terminoUTC.toISO();
      }

      await createDisponibilidad(datosDisponibilidad);
      
      // Mostrar toast de éxito con información específica
      toast.success(`¡${descripcionPreset.charAt(0).toUpperCase() + descripcionPreset.slice(1)} creada correctamente!`, {
        position: "bottom-right",
        autoClose: 4000,
        icon: "🚒",
      });
      
      // Recargar datos
      loadData();
    } catch (err) {
      console.error('Error creating disponibilidad:', err);
      toast.error('Error al crear la disponibilidad. Inténtalo nuevamente.', {
        position: "bottom-right",
        autoClose: 5000,
      });
    } finally {
      // Limpiar timer si existe
      if (timerRef) {
        clearInterval(timerRef);
        setTimerRef(null);
      }
      
      setUpdatingMyStatus(false);
      setPresetConfirmacion(null);
      setContador(3);
    }
  };

  // Función para cancelar confirmación
  const cancelarAccesoRapido = () => {
    // Limpiar timer si existe
    if (timerRef) {
      clearInterval(timerRef);
      setTimerRef(null);
    }
    
    setShowConfirmModal(false);
    setPresetConfirmacion(null);
    setContador(3);
  };

  // Función para obtener información del preset para el modal
  const getPresetInfo = (preset) => {
    const now = dateHelper.now();
    switch (preset) {
      case 'ahora':
        return {
          titulo: 'Disponibilidad Indefinida',
          descripcion: 'Te marcarás como disponible sin límite de tiempo',
          icono: '🕐',
          tiempo: 'Sin límite'
        };
      case '2h':
        return {
          titulo: 'Disponibilidad por 2 Horas',
          descripcion: 'Te marcarás como disponible por las próximas 2 horas',
          icono: '⏱️',
          tiempo: `Hasta ${dateHelper.format(now.plus({ hours: 2 }), 'HH:mm')}`
        };
      case '4h':
        return {
          titulo: 'Disponibilidad por 4 Horas',
          descripcion: 'Te marcarás como disponible por las próximas 4 horas',
          icono: '⏰',
          tiempo: `Hasta ${dateHelper.format(now.plus({ hours: 4 }), 'HH:mm')}`
        };
      case '8h':
        return {
          titulo: 'Disponibilidad por 8 Horas',
          descripcion: 'Te marcarás como disponible por las próximas 8 horas',
          icono: '🕰️',
          tiempo: `Hasta ${dateHelper.format(now.plus({ hours: 8 }), 'HH:mm')}`
        };
      case '22h': {
        return {
          titulo: 'Turno Diurno',
          descripcion: 'Te marcarás como disponible hasta las 22:00',
          icono: '☀️',
          tiempo: 'Hasta 22:00'
        };
      }
      case 'noche':
        return {
          titulo: 'Turno Nocturno',
          descripcion: 'Te marcarás como disponible hasta las 06:00 de mañana',
          icono: '🌙',
          tiempo: 'Hasta 06:00'
        };
      default:
        return {
          titulo: 'Disponibilidad',
          descripcion: 'Confirma tu disponibilidad',
          icono: '🚒',
          tiempo: ''
        };
    }
  };

  const handleCreateDisponibilidad = async () => {
    if (!bombero?.id) {
      setError('Bombero no válido');
      return;
    }

    // Validaciones adicionales
    if (!fechaInicio) {
      toast.error('Debes seleccionar una fecha y hora de inicio', {
        position: "bottom-right",
        autoClose: 4000,
      });
      return;
    }

    const ahora = dateHelper.now();
    const inicioDateTime = dateHelper.fromInputFormat(fechaInicio);
    
    // Solo validar si es en el pasado (con un margen de 1 minuto para evitar problemas de sincronización)
    if (inicioDateTime < ahora.minus({ minutes: 1 })) {
      toast.error('La fecha y hora de inicio no puede ser en el pasado', {
        position: "bottom-right",
        autoClose: 4000,
      });
      return;
    }

    if (usarFechaTermino && fechaTermino) {
      const terminoDateTime = dateHelper.fromInputFormat(fechaTermino);
      if (terminoDateTime <= inicioDateTime) {
        toast.error('La fecha de término debe ser posterior a la fecha de inicio', {
          position: "bottom-right",
          autoClose: 4000,
        });
        return;
      }
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
      
      // Mostrar mensaje de éxito
      toast.success('¡Disponibilidad creada correctamente!', {
        position: "bottom-right",
        autoClose: 4000,
        icon: "✅",
      });
      
      // Reinicializar formulario después de crear la disponibilidad
      initializeFechas();
      loadData();
    } catch (err) {
      console.error('Error creating disponibilidad:', err);
      setError('Error al crear disponibilidad');
      toast.error('Error al crear la disponibilidad. Inténtalo nuevamente.', {
        position: "bottom-right",
        autoClose: 5000,
      });
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
      toast.success('Disponibilidad cerrada correctamente', {
        position: "bottom-right",
        autoClose: 3000,
        icon: "🔒",
      });
      loadData();
    } catch (err) {
      console.error('Error cerrando disponibilidad:', err);
      setError('Error al cerrar disponibilidad');
      toast.error('Error al cerrar la disponibilidad. Inténtalo nuevamente.', {
        position: "bottom-right",
        autoClose: 5000,
      });
    } finally {
      setUpdatingMyStatus(false);
    }
  };

  // Función para formatear el RUN con puntos y guión
  const formatRUN = (run) => {
    if (!run) return '';
    
    // Limpiar el RUN de caracteres no numéricos y dígito verificador
    const cleanRUN = run.toString().replace(/[^0-9kK]/g, '');
    
    if (cleanRUN.length < 2) return run; // Si es muy corto, devolver original
    
    // Separar número y dígito verificador
    const numero = cleanRUN.slice(0, -1);
    const digitoVerificador = cleanRUN.slice(-1).toUpperCase();
    
    // Formatear con puntos cada 3 dígitos desde la derecha
    const numeroFormateado = numero.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    
    return `${numeroFormateado}-${digitoVerificador}`;
  };

  const getBomberoInfo = (idBombero, disponibilidad = null) => {
    // Si la disponibilidad incluye datos del bombero, usarlos directamente
    if (disponibilidad?.bombero) {
      const { nombres, apellidos, run } = disponibilidad.bombero;
      const nombreCompleto = nombres ? nombres.join(' ') : '';
      const apellidoCompleto = apellidos ? apellidos.join(' ') : '';
      const nombreFinal = `${nombreCompleto} ${apellidoCompleto}`.trim() || 'Bombero desconocido';
      
      if (run) {
        const runFormateado = formatRUN(run);
        return (
          <span>
            (<strong>{runFormateado}</strong>) {nombreFinal}
          </span>
        );
      }
      return nombreFinal;
    }
    
    // Fallback: buscar en la lista de bomberos
    const bomberoInfo = bomberos.find(b => b.id === idBombero);
    if (bomberoInfo) {
      const nombreCompleto = bomberoInfo.nombres ? bomberoInfo.nombres.join(' ') : (bomberoInfo.nombre || '');
      const apellidoCompleto = bomberoInfo.apellidos ? bomberoInfo.apellidos.join(' ') : (bomberoInfo.apellido || '');
      const nombreFinal = `${nombreCompleto} ${apellidoCompleto}`.trim() || 'Bombero desconocido';
      
      if (bomberoInfo.run) {
        const runFormateado = formatRUN(bomberoInfo.run);
        return (
          <span>
            (<strong>{runFormateado}</strong>) {nombreFinal}
          </span>
        );
      }
      return nombreFinal;
    }
    
    return 'Bombero desconocido';
  };

  const formatFecha = (fecha) => {
    try {
      if (!fecha) return '-';
      const fechaObj = dateHelper.toSantiago(fecha);
      return dateHelper.format(fechaObj, 'dd-MM-yyyy HH:mm');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Fecha inválida';
    }
  };

  const calcularDuracion = (fechaInicio, fechaTermino) => {
    try {
      if (!fechaInicio) return '';
      
      const inicio = dateHelper.toSantiago(fechaInicio);
      const termino = fechaTermino ? dateHelper.toSantiago(fechaTermino) : dateHelper.now();
      
      const duracionMillis = termino.toMillis() - inicio.toMillis();
      const duracionMinutos = Math.floor(duracionMillis / (1000 * 60));
      
      if (duracionMinutos < 60) {
        return `${duracionMinutos}min`;
      }
      
      const horas = Math.floor(duracionMinutos / 60);
      const minutosRestantes = duracionMinutos % 60;
      
      if (minutosRestantes === 0) {
        return `${horas}h`;
      }
      
      return `${horas}h ${minutosRestantes}min`;
    } catch (error) {
      console.error('Error calculando duración:', error);
      return '';
    }
  };

  const estaDisponible = (disponibilidad) => {
    return !disponibilidad.fechaTermino || new Date(disponibilidad.fechaTermino) > new Date();
  };

  // Función para filtrar disponibilidades según los filtros activos
  const filtrarDisponibilidades = () => {
    if (!Array.isArray(disponibilidades)) return [];
    
    return disponibilidades.filter(disponibilidad => {
      // Filtro por bombero
      if (filtros.bombero && disponibilidad.idBombero !== parseInt(filtros.bombero)) {
        return false;
      }
      
      // Filtro por estado
      if (filtros.estado !== 'todos') {
        const disponible = estaDisponible(disponibilidad);
        if (filtros.estado === 'disponible' && !disponible) return false;
        if (filtros.estado === 'finalizado' && disponible) return false;
      }
      
      // Filtro por fecha desde
      if (filtros.fechaDesde) {
        try {
          const fechaInicio = dateHelper.toSantiago(disponibilidad.fechaInicio);
          const fechaDesde = dateHelper.fromJSDate(new Date(filtros.fechaDesde + 'T00:00:00'));
          if (fechaInicio < fechaDesde) return false;
        } catch (error) {
          console.warn('Error comparando fecha desde:', error);
        }
      }
      
      // Filtro por fecha hasta
      if (filtros.fechaHasta) {
        try {
          const fechaInicio = dateHelper.toSantiago(disponibilidad.fechaInicio);
          const fechaHasta = dateHelper.fromJSDate(new Date(filtros.fechaHasta + 'T23:59:59'));
          if (fechaInicio > fechaHasta) return false;
        } catch (error) {
          console.warn('Error comparando fecha hasta:', error);
        }
      }
      
      // Filtro por búsqueda de texto
      if (filtros.busqueda) {
        const busquedaLower = filtros.busqueda.toLowerCase();
        let textoParaBuscar = '';
        
        // Extraer texto para búsqueda desde los datos de la disponibilidad
        if (disponibilidad?.bombero) {
          const { nombres, apellidos, run } = disponibilidad.bombero;
          const nombreCompleto = nombres ? nombres.join(' ') : '';
          const apellidoCompleto = apellidos ? apellidos.join(' ') : '';
          const nombreFinal = `${nombreCompleto} ${apellidoCompleto}`.trim();
          textoParaBuscar = `${nombreFinal} ${run || ''}`.toLowerCase();
        } else {
          // Fallback: buscar en la lista de bomberos
          const bomberoInfo = bomberos.find(b => b.id === disponibilidad.idBombero);
          if (bomberoInfo) {
            const nombreCompleto = bomberoInfo.nombres ? bomberoInfo.nombres.join(' ') : (bomberoInfo.nombre || '');
            const apellidoCompleto = bomberoInfo.apellidos ? bomberoInfo.apellidos.join(' ') : (bomberoInfo.apellido || '');
            const nombreFinal = `${nombreCompleto} ${apellidoCompleto}`.trim();
            textoParaBuscar = `${nombreFinal} ${bomberoInfo.run || ''}`.toLowerCase();
          }
        }
        
        if (!textoParaBuscar.includes(busquedaLower)) return false;
      }
      
      return true;
    });
  };

  // Efecto para resetear página cuando cambien los filtros
  React.useEffect(() => {
    setPaginaActual(1);
  }, [filtros]);

  // Función para limpiar filtros
  const limpiarFiltros = () => {
    setFiltros({
      bombero: '',
      fechaDesde: '',
      fechaHasta: '',
      estado: 'todos',
      busqueda: ''
    });
    setPaginaActual(1); // Resetear a la primera página
  };

  // Funciones de paginación
  const obtenerRegistrosPaginados = (registrosFiltrados) => {
    const indiceInicio = (paginaActual - 1) * registrosPorPagina;
    const indiceFin = indiceInicio + registrosPorPagina;
    return registrosFiltrados.slice(indiceInicio, indiceFin);
  };

  const calcularTotalPaginas = (totalRegistros) => {
    return Math.ceil(totalRegistros / registrosPorPagina);
  };

  const cambiarPagina = (nuevaPagina) => {
    setPaginaActual(nuevaPagina);
    // Scroll suave hacia arriba cuando se cambia de página
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const generarNumerosPaginas = (paginaActual, totalPaginas) => {
    const paginas = [];
    const maxPaginasVisibles = 5;
    
    if (totalPaginas <= maxPaginasVisibles) {
      // Si hay pocas páginas, mostrar todas
      for (let i = 1; i <= totalPaginas; i++) {
        paginas.push(i);
      }
    } else {
      // Lógica para mostrar páginas alrededor de la actual
      const inicio = Math.max(1, paginaActual - 2);
      const fin = Math.min(totalPaginas, paginaActual + 2);
      
      // Agregar primera página si no está incluida
      if (inicio > 1) {
        paginas.push(1);
        if (inicio > 2) paginas.push('...');
      }
      
      // Agregar páginas del rango
      for (let i = inicio; i <= fin; i++) {
        paginas.push(i);
      }
      
      // Agregar última página si no está incluida
      if (fin < totalPaginas) {
        if (fin < totalPaginas - 1) paginas.push('...');
        paginas.push(totalPaginas);
      }
    }
    
    return paginas;
  };

  // Obtener lista única de bomberos para el filtro
  const getBomberosParaFiltro = () => {
    const bomberosUnicos = new Map();
    
    disponibilidades.forEach(disponibilidad => {
      const id = disponibilidad.idBombero;
      if (!bomberosUnicos.has(id)) {
        let nombre = 'Bombero desconocido';
        
        // Intentar extraer el nombre desde los datos de la disponibilidad
        if (disponibilidad?.bombero) {
          const { nombres, apellidos, run } = disponibilidad.bombero;
          const nombreCompleto = nombres ? nombres.join(' ') : '';
          const apellidoCompleto = apellidos ? apellidos.join(' ') : '';
          const nombreFinal = `${nombreCompleto} ${apellidoCompleto}`.trim();
          
          if (nombreFinal && nombreFinal !== 'Bombero desconocido') {
            nombre = run ? `(${formatRUN(run)}) ${nombreFinal}` : nombreFinal;
          }
        } else {
          // Fallback: buscar en la lista de bomberos
          const bomberoInfo = bomberos.find(b => b.id === id);
          if (bomberoInfo) {
            const nombreCompleto = bomberoInfo.nombres ? bomberoInfo.nombres.join(' ') : (bomberoInfo.nombre || '');
            const apellidoCompleto = bomberoInfo.apellidos ? bomberoInfo.apellidos.join(' ') : (bomberoInfo.apellido || '');
            const nombreFinal = `${nombreCompleto} ${apellidoCompleto}`.trim();
            
            if (nombreFinal && nombreFinal !== 'Bombero desconocido') {
              nombre = bomberoInfo.run ? `(${formatRUN(bomberoInfo.run)}) ${nombreFinal}` : nombreFinal;
            }
          }
        }
        
        bomberosUnicos.set(id, { id, nombre });
      }
    });
    
    return Array.from(bomberosUnicos.values()).sort((a, b) => a.nombre.localeCompare(b.nombre));
  };

  if (loading) {
    return <LoadingPage />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Header compacto con título y pestañas en la misma línea */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
            <div className="mb-3 sm:mb-0">
              <h1 className="text-2xl font-bold text-gray-900">
                Control de Disponibilidad
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Gestiona tu disponibilidad y visualiza el estado del personal
              </p>
            </div>
            
            {/* Pestañas compactas */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('marcar')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                  activeTab === 'marcar'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <MdAdd className="h-4 w-4" />
                  <span className="hidden sm:inline">Marcar</span>
                  <span className="sm:hidden">Crear</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('historial')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                  activeTab === 'historial'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <MdHistory className="h-4 w-4" />
                  <span className="hidden sm:inline">Historial</span>
                  <span className="sm:hidden">Lista</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Contenido según la pestaña activa */}
        {activeTab === 'marcar' ? (
          /* Vista de Marcar Disponibilidad */
          <>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
              {/* Formulario de Disponibilidad - 2 partes */}
              <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Mi Disponibilidad</h2>
                  {miDisponibilidad && (
                    <div className="flex items-center gap-2 text-sm">
                      <FaUserCheck className="text-green-600" />
                      <span className="font-medium text-green-600">ACTIVA</span>
                    </div>
                  )}
                </div>
                
                {/* Si hay disponibilidad activa, mostrar información */}
                {miDisponibilidad ? (
                  <div className="text-center">
                    <div className="border-2 rounded-lg p-4 mb-4 bg-green-50 border-green-200">
                      <p className="text-sm text-gray-600 mb-2">
                        Disponible desde: <span className="font-medium">{formatFecha(miDisponibilidad.fechaInicio)}</span>
                      </p>
                      {miDisponibilidad.fechaTermino && (
                        <p className="text-sm text-gray-600">
                          Hasta: <span className="font-medium">{formatFecha(miDisponibilidad.fechaTermino)}</span>
                        </p>
                      )}
                    </div>
                    
                    <button
                      onClick={handleCerrarDisponibilidad}
                      disabled={updatingMyStatus}
                      className="w-full py-3 px-4 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {updatingMyStatus ? 'Cerrando...' : 'Cerrar Disponibilidad'}
                    </button>
                  </div>
                ) : (
                  // Formulario para crear disponibilidad
                  <div className="space-y-4">
                    {/* Botones de acceso rápido */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 bg-blue-500 rounded-lg flex items-center justify-center">
                          <FaClock className="h-3 w-3 text-white" />
                        </div>
                        <h3 className="text-sm font-semibold text-gray-800">Acceso Rápido</h3>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          onClick={() => handleAccesoRapido('ahora')}
                          disabled={updatingMyStatus || miDisponibilidad}
                          className="group flex flex-col items-center gap-2 px-3 py-2.5 text-sm font-medium text-blue-700 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <div className="w-6 h-6 bg-blue-100 group-hover:bg-blue-200 rounded-lg flex items-center justify-center transition-colors">
                            <FaClock className="h-3 w-3 text-blue-600" />
                          </div>
                          <div className="text-center">
                            <div className="font-semibold text-xs">Ahora</div>
                            <div className="text-xs text-blue-600 opacity-75">Sin límite</div>
                          </div>
                        </button>
                        
                        <button
                          onClick={() => handleAccesoRapido('2h')}
                          disabled={updatingMyStatus || miDisponibilidad}
                          className="group flex flex-col items-center gap-2 px-3 py-2.5 text-sm font-medium text-green-700 bg-white border border-green-200 rounded-lg hover:bg-green-50 hover:border-green-300 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <div className="w-6 h-6 bg-green-100 group-hover:bg-green-200 rounded-lg flex items-center justify-center transition-colors">
                            <MdAccessTime className="h-3 w-3 text-green-600" />
                          </div>
                          <div className="text-center">
                            <div className="font-semibold text-xs">2 Horas</div>
                            <div className="text-xs text-green-600 opacity-75">Turno corto</div>
                          </div>
                        </button>
                        
                        <button
                          onClick={() => handleAccesoRapido('4h')}
                          disabled={updatingMyStatus || miDisponibilidad}
                          className="group flex flex-col items-center gap-2 px-3 py-2.5 text-sm font-medium text-orange-700 bg-white border border-orange-200 rounded-lg hover:bg-orange-50 hover:border-orange-300 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <div className="w-6 h-6 bg-orange-100 group-hover:bg-orange-200 rounded-lg flex items-center justify-center transition-colors">
                            <MdAccessTime className="h-3 w-3 text-orange-600" />
                          </div>
                          <div className="text-center">
                            <div className="font-semibold text-xs">4 Horas</div>
                            <div className="text-xs text-orange-600 opacity-75">Turno medio</div>
                          </div>
                        </button>
                        
                        <button
                          onClick={() => handleAccesoRapido('8h')}
                          disabled={updatingMyStatus || miDisponibilidad}
                          className="group flex flex-col items-center gap-2 px-3 py-2.5 text-sm font-medium text-purple-700 bg-white border border-purple-200 rounded-lg hover:bg-purple-50 hover:border-purple-300 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <div className="w-6 h-6 bg-purple-100 group-hover:bg-purple-200 rounded-lg flex items-center justify-center transition-colors">
                            <MdAccessTime className="h-3 w-3 text-purple-600" />
                          </div>
                          <div className="text-center">
                            <div className="font-semibold text-xs">8 Horas</div>
                            <div className="text-xs text-purple-600 opacity-75">Completo</div>
                          </div>
                        </button>
                        
                        <button
                          onClick={() => handleAccesoRapido('22h')}
                          disabled={updatingMyStatus || miDisponibilidad}
                          className="group flex flex-col items-center gap-2 px-3 py-2.5 text-sm font-medium text-indigo-700 bg-white border border-indigo-200 rounded-lg hover:bg-indigo-50 hover:border-indigo-300 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <div className="w-6 h-6 bg-indigo-100 group-hover:bg-indigo-200 rounded-lg flex items-center justify-center transition-colors">
                            <MdEvent className="h-3 w-3 text-indigo-600" />
                          </div>
                          <div className="text-center">
                            <div className="font-semibold text-xs">22:00</div>
                            <div className="text-xs text-indigo-600 opacity-75">Turno día</div>
                          </div>
                        </button>
                        
                        <button
                          onClick={() => handleAccesoRapido('noche')}
                          disabled={updatingMyStatus || miDisponibilidad}
                          className="group flex flex-col items-center gap-2 px-3 py-2.5 text-sm font-medium text-red-700 bg-white border border-red-200 rounded-lg hover:bg-red-50 hover:border-red-300 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <div className="w-6 h-6 bg-red-100 group-hover:bg-red-200 rounded-lg flex items-center justify-center transition-colors">
                            <MdAccessTime className="h-3 w-3 text-red-600" />
                          </div>
                          <div className="text-center">
                            <div className="font-semibold text-xs">Noche</div>
                            <div className="text-xs text-red-600 opacity-75">Hasta 06:00</div>
                          </div>
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fecha y Hora de Inicio
                      </label>
                      <DateTimePicker
                        value={fechaInicio ? dateHelper.fromInputFormat(fechaInicio).toJSDate() : null}
                        onChange={(date) => {
                          if (date) {
                            const newFechaInicio = dateHelper.toInputFormat(dateHelper.fromJSDate(date));
                            setFechaInicio(newFechaInicio);
                            
                            // Si hay fecha de término habilitada, ajustarla si es necesaria
                            if (usarFechaTermino && fechaTermino) {
                              const inicioDateTime = dateHelper.fromJSDate(date);
                              const terminoDateTime = dateHelper.fromInputFormat(fechaTermino);
                              
                              // Si la fecha de término es anterior a la de inicio, ajustarla
                              if (terminoDateTime <= inicioDateTime) {
                                const nuevoTermino = inicioDateTime.plus({ hours: 1 });
                                setFechaTermino(dateHelper.toInputFormat(nuevoTermino));
                                setAutoAjustado(true);
                                setTimeout(() => setAutoAjustado(false), 3000);
                              }
                            }
                          }
                        }}
                        placeholder="Seleccionar fecha y hora de inicio"
                        minDate={new Date()}
                        maxDate={new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)}
                        showTime={true}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                           onClick={() => document.getElementById('usarFechaTermino').click()}>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-700">
                            Establecer fecha y hora de término
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Define cuándo terminará automáticamente tu disponibilidad
                          </p>
                        </div>
                        
                        {/* Switch personalizado */}
                        <label htmlFor="usarFechaTermino" className="relative cursor-pointer">
                          <input
                            type="checkbox"
                            id="usarFechaTermino"
                            checked={usarFechaTermino}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setUsarFechaTermino(checked);
                              
                              if (!checked) {
                                setFechaTermino('');
                              } else {
                                // Establecer fecha de término por defecto: 4 horas después del inicio
                                const inicioDate = fechaInicio ? dateHelper.fromInputFormat(fechaInicio) : dateHelper.now();
                                const termino = inicioDate.plus({ hours: 4 });
                                const fechaTerminoStr = dateHelper.toInputFormat(termino);
                                setFechaTermino(fechaTerminoStr);
                              }
                            }}
                            className="sr-only"
                          />
                          <div className={`
                            relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 ease-in-out
                            ${usarFechaTermino 
                              ? 'bg-blue-600 shadow-lg shadow-blue-200' 
                              : 'bg-gray-300 hover:bg-gray-400'
                            }
                            hover:scale-105 focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2
                          `}>
                            <span className={`
                              inline-block h-4 w-4 transform rounded-full bg-white transition-all duration-300 ease-in-out shadow-md
                              ${usarFechaTermino ? 'translate-x-6 scale-110' : 'translate-x-1'}
                            `}>
                              {/* Icono dentro del switch */}
                              <span className={`
                                absolute inset-0 flex items-center justify-center transition-opacity duration-200
                                ${usarFechaTermino ? 'opacity-100' : 'opacity-0'}
                              `}>
                                <MdEvent className="h-2.5 w-2.5 text-blue-600" />
                              </span>
                              <span className={`
                                absolute inset-0 flex items-center justify-center transition-opacity duration-200
                                ${!usarFechaTermino ? 'opacity-100' : 'opacity-0'}
                              `}>
                                <FaSync className="h-2 w-2 text-gray-400" />
                              </span>
                            </span>
                          </div>
                        </label>
                      </div>
                      
                      <div className="flex items-start gap-2 text-xs text-gray-600 mb-3 p-2 bg-gray-50 rounded-lg">
                        {usarFechaTermino ? (
                          <>
                            <MdAccessTime className="text-blue-500 mt-0.5 flex-shrink-0" />
                            <span>Tu disponibilidad terminará automáticamente en la fecha y hora especificada.</span>
                          </>
                        ) : (
                          <>
                            <FaSync className="text-green-500 mt-0.5 flex-shrink-0" />
                            <span>Tu disponibilidad permanecerá activa hasta que la cierres manualmente.</span>
                          </>
                        )}
                      </div>

                      {/* Campos de fecha de término con animación */}
                      <div className={`
                        overflow-hidden transition-all duration-500 ease-in-out
                        ${usarFechaTermino 
                          ? 'max-h-96 opacity-100 transform translate-y-0' 
                          : 'max-h-0 opacity-0 transform -translate-y-2'
                        }
                      `}>
                        <div className="pt-2">
                          <label className="block text-xs text-gray-500 mb-1">Fecha y Hora de Término</label>
                          <DateTimePicker
                            value={fechaTermino ? dateHelper.fromInputFormat(fechaTermino).toJSDate() : null}
                            onChange={(date) => {
                              if (date) {
                                const newFechaTermino = dateHelper.toInputFormat(dateHelper.fromJSDate(date));
                                setFechaTermino(newFechaTermino);
                              }
                            }}
                            placeholder="Seleccionar fecha y hora de término"
                            minDate={fechaInicio ? dateHelper.fromInputFormat(fechaInicio).toJSDate() : new Date()}
                            showTime={true}
                            className="w-full"
                          />
                        </div>
                      </div>
                      
                      {/* Indicador de auto-ajuste */}
                      {autoAjustado && (
                        <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-700 flex items-center gap-2">
                          <MdAccessTime className="flex-shrink-0" />
                          <span>Fecha ajustada automáticamente para ser posterior al inicio</span>
                        </div>
                      )}
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
                        <>
                          <FaUserCheck className="h-4 w-4" />
                          Marcar como Disponible
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Resumen del Personal - 3 partes */}
              {hasPermiso('disponibilidad:leer') && (
                <div className="lg:col-span-3 bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Personal Disponible</h2>
                    <div className="flex items-center gap-2 text-sm text-gray-600 bg-blue-50 px-3 py-1 rounded-full">
                      <FaUsers />
                      {stats.disponibles}
                    </div>
                  </div>
                  
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {Array.isArray(disponibilidades) && disponibilidades
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
                      .map((disponibilidad, index) => (
                        <div key={disponibilidad.id} className="border-b border-gray-100 last:border-b-0">
                          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg mb-2">
                            {/* Columna de numeración */}
                            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm font-medium">
                              {index + 1}
                            </div>
                            
                            <div className="flex-shrink-0">
                              <FaUserCheck className="text-green-600 text-sm" />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 text-sm truncate">
                                {getBomberoInfo(disponibilidad.idBombero, disponibilidad)}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatFecha(disponibilidad.fechaInicio).split(' ')[1]}
                                {disponibilidad.fechaTermino && ` - ${formatFecha(disponibilidad.fechaTermino).split(' ')[1]}`}
                                <span className="text-blue-600 font-medium ml-2">
                                  ({calcularDuracion(disponibilidad.fechaInicio, disponibilidad.fechaTermino)})
                                </span>
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    
                    {Array.isArray(disponibilidades) && disponibilidades.filter(d => estaDisponible(d)).length === 0 && (
                      <div className="text-center py-6">
                        <FaUsers className="mx-auto h-8 w-8 text-gray-400" />
                        <p className="mt-2 text-sm text-gray-500">
                          No hay personal disponible
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          /* Vista de Historial con Filtros */
          <div className="space-y-4">
            {/* Panel de Filtros compacto */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <FaFilter className="h-4 w-4" />
                  Filtros
                </h2>
                <button
                  onClick={limpiarFiltros}
                  className="flex items-center gap-2 px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <FaTimes className="h-3 w-3" />
                  Limpiar
                </button>
              </div>

              <div className="flex flex-wrap items-end gap-3">
                {/* Filtro por Bombero - Más ancho */}
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Bombero
                  </label>
                  <select
                    value={filtros.bombero}
                    onChange={(e) => setFiltros(prev => ({ ...prev, bombero: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="">Todos</option>
                    {getBomberosParaFiltro().map(bombero => (
                      <option key={bombero.id} value={bombero.id}>
                        {bombero.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Filtro por Estado - Ancho justo */}
                <div className="w-32">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Estado
                  </label>
                  <select
                    value={filtros.estado}
                    onChange={(e) => setFiltros(prev => ({ ...prev, estado: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="todos">Todos</option>
                    <option value="disponible">Disponible</option>
                    <option value="finalizado">Finalizado</option>
                  </select>
                </div>

                {/* Filtro Fecha Desde - Usando DateTimePicker */}
                <div className="w-40">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Desde
                  </label>
                  <DateTimePicker
                    value={filtros.fechaDesde ? new Date(filtros.fechaDesde) : null}
                    onChange={(date) => {
                      const fechaStr = date ? dateHelper.format(dateHelper.fromJSDate(date), 'yyyy-MM-dd') : '';
                      setFiltros(prev => ({ ...prev, fechaDesde: fechaStr }));
                    }}
                    placeholder="Fecha desde"
                    maxDate={new Date()}
                    className="w-full text-sm"
                  />
                </div>

                {/* Filtro Fecha Hasta - Usando DateTimePicker */}
                <div className="w-40">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Hasta
                  </label>
                  <DateTimePicker
                    value={filtros.fechaHasta ? new Date(filtros.fechaHasta) : null}
                    onChange={(date) => {
                      const fechaStr = date ? dateHelper.format(dateHelper.fromJSDate(date), 'yyyy-MM-dd') : '';
                      setFiltros(prev => ({ ...prev, fechaHasta: fechaStr }));
                    }}
                    placeholder="Fecha hasta"
                    minDate={filtros.fechaDesde ? new Date(filtros.fechaDesde) : null}
                    maxDate={new Date()}
                    className="w-full text-sm"
                  />
                </div>

                {/* Búsqueda por Texto - Ancho medio */}
                <div className="w-48">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Búsqueda
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Nombre o RUN..."
                      value={filtros.busqueda}
                      onChange={(e) => setFiltros(prev => ({ ...prev, busqueda: e.target.value }))}
                      className="w-full p-2 pl-7 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                    <FaSearch className="absolute left-2 top-2.5 h-3 w-3 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Tabla de Historial Filtrada */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Historial de Disponibilidades
                  </h2>
                  <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {filtrarDisponibilidades().length} registros
                  </span>
                </div>
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
                    {(() => {
                      const registrosFiltrados = filtrarDisponibilidades()
                        .sort((a, b) => new Date(b.fechaInicio) - new Date(a.fechaInicio));
                      const registrosPaginados = obtenerRegistrosPaginados(registrosFiltrados);
                      
                      return registrosPaginados.map((disponibilidad) => (
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
                      ));
                    })()}
                  </tbody>
                </table>

                {filtrarDisponibilidades().length === 0 && (
                  <div className="text-center py-12">
                    <FaClock className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                      No se encontraron registros
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      No hay registros que coincidan con los filtros aplicados.
                    </p>
                  </div>
                )}
              </div>

              {/* Componente de Paginación */}
              {(() => {
                const registrosFiltrados = filtrarDisponibilidades();
                const totalPaginas = calcularTotalPaginas(registrosFiltrados.length);
                
                if (totalPaginas <= 1) return null; // No mostrar paginación si hay 1 página o menos
                
                const numerosPaginas = generarNumerosPaginas(paginaActual, totalPaginas);
                const indiceInicio = (paginaActual - 1) * registrosPorPagina + 1;
                const indiceFin = Math.min(paginaActual * registrosPorPagina, registrosFiltrados.length);
                
                return (
                  <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                    <div className="flex items-center justify-between">
                      {/* Información de registros */}
                      <div className="flex-1 flex justify-between sm:hidden">
                        <button
                          onClick={() => cambiarPagina(paginaActual - 1)}
                          disabled={paginaActual === 1}
                          className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Anterior
                        </button>
                        <button
                          onClick={() => cambiarPagina(paginaActual + 1)}
                          disabled={paginaActual === totalPaginas}
                          className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Siguiente
                        </button>
                      </div>
                      
                      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm text-gray-700">
                            Mostrando{' '}
                            <span className="font-medium">{indiceInicio}</span>
                            {' '}a{' '}
                            <span className="font-medium">{indiceFin}</span>
                            {' '}de{' '}
                            <span className="font-medium">{registrosFiltrados.length}</span>
                            {' '}resultados
                          </p>
                        </div>
                        
                        <div>
                          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                            {/* Botón Primera Página */}
                            <button
                              onClick={() => cambiarPagina(1)}
                              disabled={paginaActual === 1}
                              className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Primera página"
                            >
                              <FaAngleDoubleLeft className="h-3 w-3" />
                            </button>
                            
                            {/* Botón Página Anterior */}
                            <button
                              onClick={() => cambiarPagina(paginaActual - 1)}
                              disabled={paginaActual === 1}
                              className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Página anterior"
                            >
                              <FaChevronLeft className="h-3 w-3" />
                            </button>
                            
                            {/* Números de Página */}
                            {numerosPaginas.map((numero, index) => (
                              numero === '...' ? (
                                <span
                                  key={`ellipsis-${index}`}
                                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                                >
                                  ...
                                </span>
                              ) : (
                                <button
                                  key={numero}
                                  onClick={() => cambiarPagina(numero)}
                                  className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                    numero === paginaActual
                                      ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                      : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                  }`}
                                >
                                  {numero}
                                </button>
                              )
                            ))}
                            
                            {/* Botón Página Siguiente */}
                            <button
                              onClick={() => cambiarPagina(paginaActual + 1)}
                              disabled={paginaActual === totalPaginas}
                              className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Página siguiente"
                            >
                              <FaChevronRight className="h-3 w-3" />
                            </button>
                            
                            {/* Botón Última Página */}
                            <button
                              onClick={() => cambiarPagina(totalPaginas)}
                              disabled={paginaActual === totalPaginas}
                              className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Última página"
                            >
                              <FaAngleDoubleRight className="h-3 w-3" />
                            </button>
                          </nav>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}
      </div>

      {/* Modal de Confirmación para Acceso Rápido */}
      {showConfirmModal && presetConfirmacion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 max-w-md w-full mx-4 animate-fade-in">
            {(() => {
              const presetInfo = getPresetInfo(presetConfirmacion);
              return (
                <>
                  {/* Header del modal */}
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-t-2xl p-6 text-white">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-2xl">
                        {presetInfo.icono}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">{presetInfo.titulo}</h3>
                        <p className="text-blue-100 text-sm mt-1">{presetInfo.tiempo}</p>
                      </div>
                    </div>
                  </div>

                  {/* Contenido del modal */}
                  <div className="p-6">
                    <div className="mb-6">
                      <p className="text-gray-700 text-center mb-4">
                        {presetInfo.descripcion}
                      </p>
                      
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm">🚒</span>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-blue-900">
                              ¿Confirmas que quieres marcar tu disponibilidad?
                            </p>
                            <p className="text-xs text-blue-700 mt-1">
                              Esta acción creará inmediatamente tu registro de disponibilidad
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Contador y botones de acción */}
                    <div className="space-y-4">
                      {/* Contador visual */}
                      <div className="text-center">
                        <div className="inline-flex items-center gap-3 px-4 py-2 bg-orange-50 border border-orange-200 rounded-lg">
                          <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                            {contador}
                          </div>
                          <div className="text-sm">
                            <p className="font-medium text-orange-900">
                              {contador > 0 ? 'Confirmación automática en' : 'Confirmando...'}
                            </p>
                            <p className="text-orange-700 text-xs">
                              {contador > 0 ? 'Cancela si no deseas continuar' : 'Creando disponibilidad'}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={cancelarAccesoRapido}
                          disabled={updatingMyStatus || contador === 0}
                          className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={confirmarAccesoRapido}
                          disabled={updatingMyStatus}
                          className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {updatingMyStatus ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              Creando...
                            </>
                          ) : contador === 0 ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              Confirmando...
                            </>
                          ) : (
                            <>
                              <span>🚒</span>
                              Confirmar Ahora
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

export default Disponibilidad;
