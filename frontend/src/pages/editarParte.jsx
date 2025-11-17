import React, { useEffect, useState, useContext, useRef, useMemo } from 'react';
import { useParams, useNavigate, useRoutes } from 'react-router-dom';


// Flag simple de depuración (desactívalo en producción)
const DEBUG_INIT = false;
// Services
import { getRegiones, getComunas } from '../services/region.service.js';
import {
  getClasificacionesEmergencia,
  getSubtiposIncidente,
  getTiposDano,
  getFasesIncidente,
} from '../services/subtipoIncidente.service.js';
import { getCompanias } from '../services/compania.service.js';
import { getCarrosByCompania } from '../services/carro.service.js';
import { getBomberosPorCompania, getBomberosConLicencias } from '../services/bombero.service.js';
import { getServicios } from '../services/servicios.service.js';
import { obtenerParteEmergenciaPorId, actualizarParteEmergencia, obtenerUltimoEstadoIncidente } from '../services/parteEmergencia.service.js';

// UI
import { toast } from 'react-toastify';
import {
  ClipboardList,
  Home,
  Users,
  AlertTriangle,
  Plus,
  Handshake,
} from 'lucide-react';
import Card from '../components/Card.jsx';
import Switch from '../components/Switch.jsx';
import SelectableCard from '../components/SelectableCard.jsx';
import InmuebleCard from '../components/parteEmergencia/InmuebleCard.jsx';
import VehicleCard from '../components/parteEmergencia/VehicleCard.jsx';
import UnidadCard from '../components/parteEmergencia/UnidadCard.jsx';
import AccidentadoCard from '../components/parteEmergencia/AccidentadoCard.jsx';
import ServicioExternoCard from '../components/parteEmergencia/ServicioExternoCard.jsx';
import { AuthContext } from '../context/AuthContext.jsx';
import { useCompaniaConfig } from '@hooks/compania/useCompaniaConfig';
import PrimeDatePicker from '@components/inputs/PrimeDatePicker.jsx';
import PrimeTimePicker from '@components/inputs/PrimeTimePicker.jsx';
import Select from 'react-select';
import { Dropdown } from 'primereact/dropdown';
import { formatRutForDisplay } from '@helpers/rutFormatter.js';


/* ================================
   Helpers
================================ */
const genId = () => Math.random().toString(36).slice(2, 10);

// Normaliza: [] | {data:[...]} | {data:{clave:[...]}}
function normalizeArray(res, nestedKey) {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data)) return res.data;
  if (nestedKey && Array.isArray(res?.data?.[nestedKey])) return res.data[nestedKey];
  return [];
}

const nombreBombero = (b) => {
  const n = [b.nombres, b.apellidos].filter(Boolean).join(' ').trim();
  return n || `Bombero ${b.id}`;
};

// HH:mm -> minutos (ya no se usa para validación de orden de horas, pero lo dejamos por si se reutiliza)
const timeToMin = (t) => {
  if (!t || typeof t !== 'string' || !t.includes(':')) return null;
  const [h, m] = t.split(':').map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return h * 60 + m;
};
const isInt = (v) => Number.isInteger(Number(v));
const isPosInt = (v) => isInt(v) && Number(v) > 0;
// Normalizador a número para IDs en selects
const toId = (v) => (v === '' || v === null || v === undefined ? '' : Number(v));
// Normaliza una hora a HH:mm (recorta segundos si vienen)
const toHHmm = (t) => {
  if (!t || typeof t !== 'string') return '';
  // t puede venir como 'HH:mm' o 'HH:mm:ss'
  const m = t.match(/^([0-1]\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?$/);
  if (!m) return '';
  const hh = m[1];
  const mm = m[2];
  return `${hh}:${mm}`;
};

const formatDateLocal = (date) => {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Helpers: Enviar sólo IDs de BD (numéricos positivos); eliminar IDs generados en UI
const keepDbIdOrDrop = (val) => {
  const n = Number(val);
  return Number.isFinite(n) && n > 0 && String(n) === String(val) ? n : null;
};
function sanitizeIdShallow(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  const out = { ...obj };
  if (Object.prototype.hasOwnProperty.call(out, 'id')) {
    const n = keepDbIdOrDrop(out.id);
    if (n === null) delete out.id; else out.id = n;
  }
  return out;
}
function sanitizeDeepKnown(item) {
  if (!item || typeof item !== 'object') return item;
  let out = sanitizeIdShallow(item);
  if (out.dueno && typeof out.dueno === 'object') {
    out = { ...out, dueno: sanitizeIdShallow(out.dueno) };
  }
  if (Array.isArray(out.habitantes)) {
    out = { ...out, habitantes: out.habitantes.map((h) => sanitizeIdShallow(h)) };
  }
  if (out.chofer && typeof out.chofer === 'object') {
    out = { ...out, chofer: sanitizeIdShallow(out.chofer) };
  }
  if (Array.isArray(out.pasajeros)) {
    out = { ...out, pasajeros: out.pasajeros.map((p) => sanitizeIdShallow(p)) };
  }
  return out;
}

/* =========================================
   Hook: cachea bomberos por compañía on-demand
========================================= */
function useBomberosPorCompania() {
  const [bomberosByCompania, setBomberosByCompania] = useState({}); // { [companiaId]: Bombero[] }
  const [loadingByCompania, setLoadingByCompania] = useState({});   // { [companiaId]: boolean }
  const [errorByCompania, setErrorByCompania] = useState({});       // { [companiaId]: string }

  const ensureLoaded = async (companiaId) => {
    if (!companiaId || bomberosByCompania[companiaId]) return;
    try {
      setLoadingByCompania((m) => ({ ...m, [companiaId]: true }));
      setErrorByCompania((m) => ({ ...m, [companiaId]: '' }));
      const res = await getBomberosPorCompania(companiaId);
      const arr = normalizeArray(res, 'bomberos').length > 0
        ? normalizeArray(res, 'bomberos')
        : normalizeArray(res);
      setBomberosByCompania((m) => ({ ...m, [companiaId]: arr }));
    } catch {
      setBomberosByCompania((m) => ({ ...m, [companiaId]: [] }));
      setErrorByCompania((m) => ({ ...m, [companiaId]: 'No se pudieron cargar los bomberos.' }));
    } finally {
      setLoadingByCompania((m) => ({ ...m, [companiaId]: false }));
    }
  };

  return { bomberosByCompania, loadingByCompania, errorByCompania, ensureLoaded };
}

/* ================================
   Componente principal
================================ */
const EditarParte = () => {
  const { bombero } = useContext(AuthContext);
  const { loading: configLoading, getConfigValue } = useCompaniaConfig();
  const { id } = useParams();
  const navigate = useNavigate();
  /* ---------- Catálogos / dependencias ---------- */
  // Dirección
  const [regiones, setRegiones] = useState([]);
  const [comunas, setComunas] = useState([]);
  const [regionId, setRegionId] = useState('');
  const [comunaId, setComunaId] = useState('');
  const [loadingRegiones, setLoadingRegiones] = useState(false);
  const [loadingComunas, setLoadingComunas] = useState(false);
  const [errorRegiones, setErrorRegiones] = useState('');
  const [errorComunas, setErrorComunas] = useState('');

  // Compañías
  const [companias, setCompanias] = useState([]);
  const [companiaId, setCompaniaId] = useState('');
  const [loadingCompanias, setLoadingCompanias] = useState(false);
  const [errorCompanias, setErrorCompanias] = useState('');

  // Autoseleccionar compañía desde autenticación o configuración si no viene en el parte cargado
  useEffect(() => {
    if (companiaId) return; // Respetar la compañía ya establecida por la carga del parte
    // 1) Preferir ID desde autenticación o config
    const idCandidates = [
      bombero?.companiaId,
      bombero?.compania_id,
      bombero?.compania?.id,
      getConfigValue?.('company_id'),
    ];
    let picked = idCandidates.find((v) => v !== undefined && v !== null && v !== '');
    // 3) Convertir a número si es posible
    if (picked !== undefined && picked !== null && picked !== '') {
      const n = Number(picked);
      if (!Number.isNaN(n) && Number.isFinite(n) && n > 0) {
        setCompaniaId(n);
        return;
      }
    }
    // 4) Fallback por nombre (auth o config) con carga si es necesario
    const nameCandidates = [
      bombero?.compania?.nombre,
      getConfigValue?.('company_name'),
    ]
      .filter(Boolean)
      .map((s) => (typeof s === 'string' ? s.trim().toLowerCase() : ''))
      .filter(Boolean);

    if (!companiaId && nameCandidates.length > 0) {
      const tryResolveByName = (list) => {
        const lowerList = Array.isArray(list) ? list : [];
        for (const name of nameCandidates) {
          const match = lowerList.find((c) => c?.nombre?.toLowerCase?.() === name);
          if (match?.id) {
            const n = Number(match.id);
            if (!Number.isNaN(n) && n > 0) {
              setCompaniaId(n);
              return true;
            }
          }
        }
        return false;
      };

      if (companias.length > 0 && tryResolveByName(companias)) return;
      if (!loadingCompanias) {
        (async () => {
          try {
            setLoadingCompanias(true);
            setErrorCompanias('');
            const res = await getCompanias();
            const arr = normalizeArray(res, 'companias').length > 0 ? normalizeArray(res, 'companias') : normalizeArray(res);
            setCompanias(arr);
            tryResolveByName(arr);
          } catch {
            setErrorCompanias('No se pudieron cargar las compañías.');
          } finally {
            setLoadingCompanias(false);
          }
        })();
      }
    }
  }, [companiaId, bombero, companias, loadingCompanias, configLoading, getConfigValue]);

  // Bomberos (derivados de la compañía general)
  const [conductores, setConductores] = useState([]);
  const [bomberos, setBomberos] = useState([]);
  const [loadingConductores, setLoadingConductores] = useState(false);
  const [loadingBomberos, setLoadingBomberos] = useState(false);

  // Tipo de emergencia
  const [clasificaciones, setClasificaciones] = useState([]);
  const [clasificacionId, setClasificacionId] = useState('');
  const [loadingClasificaciones, setLoadingClasificaciones] = useState(false);
  const [errorClasificaciones, setErrorClasificaciones] = useState('');
  const [subtipos, setSubtipos] = useState([]);
  const [subtipoId, setSubtipoId] = useState('');
  const [loadingSubtipos, setLoadingSubtipos] = useState(false);
  const [errorSubtipos, setErrorSubtipos] = useState('');

  // Características
  const [tipoIncendioEnabled, setTipoIncendioEnabled] = useState(false);
  const [tipoIncendioId, setTipoIncendioId] = useState('');
  const [tiposDano, setTiposDano] = useState([]);
  const [loadingTiposDano, setLoadingTiposDano] = useState(false);
  const [errorTiposDano, setErrorTiposDano] = useState('');
  const [faseEnabled, setFaseEnabled] = useState(false);
  const [faseId, setFaseId] = useState('');
  const [fasesIncidente, setFasesIncidente] = useState([]);
  const [loadingFases, setLoadingFases] = useState(false);
  const [errorFases, setErrorFases] = useState('');

  // Carros por compañía
  const [carros, setCarros] = useState([]);
  const [loadingCarros, setLoadingCarros] = useState(false);
  const [errorCarros, setErrorCarros] = useState('');

  // Servicios externos
  const [servicios, setServicios] = useState([]);
  const [loadingServicios, setLoadingServicios] = useState(false);
  const [errorServicios, setErrorServicios] = useState('');

  /* ---------- Secciones de detalle ---------- */
  // Inmuebles (ahora con calle y numero)
  const [inmuebles, setInmuebles] = useState([]);
  const addInmueble = () =>
    setInmuebles((prev) => [...prev, {
      id: genId(),
      tipo_construccion: '',
      n_pisos: '',
      m2_construccion: '',
      m2_afectado: '',
      danos_vivienda: '',
      danos_anexos: '',
      calle: '',
      numero: '',
      dueno: null,
      habitantes: [],
    }]);
  const updateInmueble = (idx, next) => setInmuebles((prev) => prev.map((it, i) => (i === idx ? next : it)));
  const removeInmueble = (idx) => setInmuebles((prev) => prev.filter((_, i) => i !== idx));

  // Vehículos
  const [vehiculos, setVehiculos] = useState([]);
  const addVehiculo = () =>
    setVehiculos((prev) => [...prev, {
      id: genId(),
      patente: '',
      marca: '',
      modelo: '',
      anio: '',
      color: '',
      danos_vehiculo: '',
      dueno: null,
      chofer: null,
      pasajeros: [],
    }]);
  const updateVehiculo = (idx, next) => setVehiculos((prev) => prev.map((it, i) => (i === idx ? next : it)));
  const removeVehiculo = (idx) => setVehiculos((prev) => prev.filter((_, i) => i !== idx));

  // Material mayor (sección 7)
  const [materialMayor, setMaterialMayor] = useState([]);
  const addUnidad = () => setMaterialMayor((prev) => [...prev, {
    id: genId(), unidadId: '', conductorId: '', bomberoId: '', voluntarios: '', kmSalida: '', kmLlegada: ''
  }]);
  const updateUnidad = (idx, next) => setMaterialMayor((prev) => prev.map((row, i) => (i === idx ? next : row)));
  const removeUnidad = (idx) => setMaterialMayor((prev) => prev.filter((_, i) => i !== idx));
  const totalVoluntarios = materialMayor.reduce(
    (acc, r) => acc + (Number.isFinite(Number(r.voluntarios)) ? Number(r.voluntarios) : 0),
    0
  );

  // Accidentados (sección 8)
  const [accidentados, setAccidentados] = useState([]);
  const addAccidentado = () =>
    setAccidentados((prev) => [...prev, {
      id: genId(), companiaId: '', bomberoId: '', rut: '', lesiones: '', constancia: '', comisaria: '', acciones: ''
    }]);
  const updateAccidentado = (idx, next) => setAccidentados((prev) => prev.map((a, i) => (i === idx ? next : a)));
  const removeAccidentado = (idx) => setAccidentados((prev) => prev.filter((_, i) => i !== idx));

  // Otros servicios (sección 9)
  const [otrosServicios, setOtrosServicios] = useState([]);
  const addOtroServicio = () =>
    setOtrosServicios((prev) => [...prev, {
      id: genId(), servicioId: '', tipoUnidad: '', responsable: '', personal: '', observaciones: ''
    }]);
  const updateOtroServicio = (idx, next) => setOtrosServicios((prev) => prev.map((s, i) => (i === idx ? next : s)));
  const removeOtroServicio = (idx) => setOtrosServicios((prev) => prev.filter((_, i) => i !== idx));

  // Asistencia (sección 10) — switches por voluntario con exclusión cruzada
  const [asistenciaLugar, setAsistenciaLugar] = useState({});   // { [bomberoId]: true }
  const [asistenciaCuartel, setAsistenciaCuartel] = useState({}); // { [bomberoId]: true }
  const [searchLugar, setSearchLugar] = useState('');
  const [searchCuartel, setSearchCuartel] = useState('');
  const toggleLugar = (id, checked) => {
    setAsistenciaLugar((prev) => ({ ...prev, [id]: checked }));
    if (checked) setAsistenciaCuartel((prev) => { const m = { ...prev }; delete m[id]; return m; });
  };
  const toggleCuartel = (id, checked) => {
    setAsistenciaCuartel((prev) => ({ ...prev, [id]: checked }));
    if (checked) setAsistenciaLugar((prev) => { const m = { ...prev }; delete m[id]; return m; });
  };

  // Cache de bomberos por compañía para Accidentados
  const { bomberosByCompania, loadingByCompania, errorByCompania, ensureLoaded } = useBomberosPorCompania();

  /* ---------- Validación ---------- */
  const [errors, setErrors] = useState({});
  const hasError = (k) => !!errors[k];
  const baseInput = 'w-full border border-gray-300 rounded-md px-3 py-3 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-400 h-[44px]';
  const baseTextarea = 'w-full border border-gray-300 rounded-md px-3 py-3 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-400';
  const inputCls = (k) =>
    `${baseInput} ${hasError(k) ? 'ring-2 ring-red-400 border-red-300' : ''}`;

  const isPositiveInt = (x) => Number.isInteger(Number(x)) && Number(x) > 0;

  // Si ya tenemos companiaId válido, limpiar el error asociado
  useEffect(() => {
    if (companiaId) {
      setErrors((prev) => (prev?.companiaId ? { ...prev, companiaId: undefined } : prev));
    }
  }, [companiaId]);

  /* ---------- Campos controlados (persisten entre pestañas) ---------- */
  // Datos generales
  const [fecha, setFecha] = useState('');
  const [horaDespacho, setHoraDespacho] = useState('');
  const [hora60, setHora60] = useState('');
  const [hora63, setHora63] = useState('');
  const [hora69, setHora69] = useState('');
  const [hora610, setHora610] = useState('');
  // Nuevos campos
  const [descripcionPreliminar, setDescripcionPreliminar] = useState('');
  const [bomberoACargoId, setBomberoACargoId] = useState('');
  // Dirección
  const [calleTxt, setCalleTxt] = useState('');
  const [numeroTxt, setNumeroTxt] = useState('');
  const [deptoTxt, setDeptoTxt] = useState('');
  const [referenciaTxt, setReferenciaTxt] = useState('');
  // Carga del parte existente
  const [loadingParte, setLoadingParte] = useState(false);
  const [estadoParte, setEstadoParte] = useState('');
  // Track de cambio real de compañía para evitar reset en carga inicial
  const prevCompaniaIdRef = useRef(undefined);
  // Pendientes a aplicar después de cargar catálogos dependientes (región/comunas y compañía)
  // ready: indica que ya cargamos el parte y dejamos listos los pendientes
  const pendingInitRef = useRef({ appliedComuna: false, appliedCompaniaDeps: false, ready: false });
  // Gatillo para re-ejecutar efectos cuando 'ready' cambia (los refs no disparan efectos)
  const [initGate, setInitGate] = useState(0);

  const commonSelectStyles = useMemo(() => ({
    control: (base, state) => ({
      ...base,
      borderColor: state.isFocused ? '#4EB9FA' : '#D1D5DB',
      borderWidth: '2px',
      boxShadow: state.isFocused ? '0 0 0 3px rgba(78, 185, 250, 0.1)' : 'none',
      '&:hover': {
        borderColor: '#4EB9FA',
      },
      minHeight: '44px',
      borderRadius: '10px',
      fontSize: '0.9rem',
    }),
    menu: (base) => ({
      ...base,
      zIndex: 25,
      borderRadius: '10px',
      overflow: 'hidden',
    }),
    menuList: (base) => ({
      ...base,
      maxHeight: '260px',
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? '#4EB9FA'
        : state.isFocused
          ? '#E0F2FE'
          : 'white',
      color: state.isSelected ? '#FFFFFF' : '#1F2937',
      fontSize: '0.9rem',
    }),
    placeholder: (base) => ({
      ...base,
      fontSize: '0.9rem',
      color: '#9CA3AF',
    }),
    input: (base) => ({
      ...base,
      fontSize: '0.9rem',
    }),
    singleValue: (base) => ({
      ...base,
      fontSize: '0.9rem',
      color: '#1F2937',
    }),
    menuPortal: (base) => ({
      ...base,
      zIndex: 9999,
    }),
  }), []);

  const selectMenuPortalTarget = typeof window !== 'undefined' ? document.body : null;

  const bomberoSearchOptions = useMemo(() => bomberos.map((b) => {
    const nombre = nombreBombero(b);
    const run = formatRutForDisplay(b.run);
    const value = b.id?.toString() ?? '';
    if (!value) return null;
    return {
      value,
      label: run ? `${run} • ${nombre}` : nombre,
      data: {
        run: (run || '').toLowerCase(),
        nombre: nombre.toLowerCase(),
      },
    };
  }).filter(Boolean), [bomberos]);

  const selectedBomberoOption = useMemo(() => {
    if (!bomberoACargoId) return null;
    return bomberoSearchOptions.find((opt) => opt.value === bomberoACargoId.toString()) || null;
  }, [bomberoACargoId, bomberoSearchOptions]);

  const regionOptions = useMemo(() => regiones.map((region) => {
    const value = region.id?.toString() ?? '';
    if (!value) return null;
    return {
      value,
      label: region.nombre || `Región ${value}`,
      data: {
        nombre: (region.nombre || '').toLowerCase(),
      },
    };
  }).filter(Boolean), [regiones]);

  const selectedRegionOption = useMemo(() => {
    if (regionId === '' || regionId === null || regionId === undefined) return null;
    return regionOptions.find((opt) => opt.value === regionId.toString()) || null;
  }, [regionId, regionOptions]);

  const comunaOptions = useMemo(() => comunas.map((comuna) => {
    const value = comuna.id?.toString() ?? '';
    if (!value) return null;
    return {
      value,
      label: comuna.nombre || `Comuna ${value}`,
      data: {
        nombre: (comuna.nombre || '').toLowerCase(),
      },
    };
  }).filter(Boolean), [comunas]);

  const selectedComunaOption = useMemo(() => {
    if (comunaId === '' || comunaId === null || comunaId === undefined) return null;
    return comunaOptions.find((opt) => opt.value === comunaId.toString()) || null;
  }, [comunaId, comunaOptions]);

  const claveRadialOptions = useMemo(() => subtipos.map((st) => {
    const value = st.id?.toString() ?? '';
    if (!value) return null;
    const codigo = st.claveRadial ?? st.codigoRadial ?? `Clave ${value}`;
    const nombre = st.nombre ?? st.descripcion ?? '';
    const label = nombre ? `${codigo} • ${nombre}` : codigo;
    return {
      value,
      label,
      data: {
        codigo: (codigo || '').toLowerCase(),
        nombre: (nombre || '').toLowerCase(),
      },
    };
  }).filter(Boolean), [subtipos]);

  const selectedClaveRadialOption = useMemo(() => {
    if (subtipoId === '' || subtipoId === null || subtipoId === undefined) return null;
    return claveRadialOptions.find((opt) => opt.value === subtipoId.toString()) || null;
  }, [subtipoId, claveRadialOptions]);

  const todayIso = useMemo(() => formatDateLocal(new Date()), []);

  /* ---------- Envío del formulario ---------- */
  const [submitting, setSubmitting] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Verificación previa del último estado para bloquear actualización
    try {
      const estResp = await obtenerUltimoEstadoIncidente(id);
      const estData = estResp?.data?.data ?? estResp?.data ?? estResp;
      const estadoUpper = (estData?.estado || '').toString().trim().toUpperCase();
      setEstadoParte(estadoUpper);
      if (estadoUpper === 'ENVIADO' || estadoUpper === 'APROBADO') {
        toast.error('Este parte no se puede modificar porque está ENVIADO o APROBADO.');
        navigate('/404');
        return;
      }
    } catch (_) {
      // Si no se puede verificar, continuamos; el backend también valida
    }
    const nextErrors = {};

    // Requeridos simples
    if (!companiaId) nextErrors.companiaId = 'Obligatorio.';
    if (!fecha) nextErrors.fecha = 'Obligatorio.';
    if (!horaDespacho) nextErrors.horadespacho = 'Obligatorio.';
    if (!hora60) nextErrors.hora6_0 = 'Obligatorio.';
    if (!hora63) nextErrors.hora6_3 = 'Obligatorio.';
    if (!hora69) nextErrors.hora6_9 = 'Obligatorio.';
    if (!hora610) nextErrors.hora6_10 = 'Obligatorio.';
    if (!regionId && regionId !== 0) nextErrors.regionId = 'Obligatorio.';
    if (!comunaId && comunaId !== 0) nextErrors.comunaId = 'Obligatorio.';
    if (!calleTxt.trim()) nextErrors.calle = 'Obligatorio.';

    // (Eliminadas) Validaciones de orden entre horas 6_0, 6_3, 6_9, 6_10

    // Tipo de emergencia / Clave radial
    if (!clasificacionId) nextErrors.clasificacionId = 'Seleccione una clasificación.';
    if (!subtipoId) nextErrors.subtipoId = 'Seleccione una clave radial.';
    // Si la clave radial elegida contiene fuego, exigir tipo de incendio y fase
    const subtipoSeleccionado = subtipos.find((s) => s.id === subtipoId);
    if (subtipoSeleccionado?.contieneFuego) {
      if (!tipoIncendioId) nextErrors.tipoIncendioId = 'Seleccione el tipo de incendio/daño.';
      if (!faseId) nextErrors.faseId = 'Seleccione la fase alcanzada.';
    }

    // Material mayor: al menos 1 y completo
    if (materialMayor.length === 0) {
      nextErrors.materialMayor = 'Debe agregar al menos una unidad.';
    } else {
      // Validar campos completos y válidos
      const invalidRow = materialMayor.find(
        (r) => !r.unidadId || !r.conductorId || !r.bomberoId || !isPositiveInt(r.voluntarios) || !isPositiveInt(r.kmSalida) || !isPositiveInt(r.kmLlegada)
      );
      if (invalidRow) {
        nextErrors.materialMayor = 'Complete todos los campos de la(s) unidad(es). Voluntarios y KM deben ser enteros > 0.';
      } else {
        // Validar que kmLlegada >= kmSalida
        const kmInvalidRow = materialMayor.find(
          (r) => isPositiveInt(r.kmSalida) && isPositiveInt(r.kmLlegada) && Number(r.kmLlegada) < Number(r.kmSalida)
        );
        if (kmInvalidRow) {
          nextErrors.materialMayor = 'El kilometraje de llegada debe ser igual o mayor que el de salida.';
        }
      }
    }

    // Asistencia en el lugar: al menos 1
    const anyLugar = Object.values(asistenciaLugar).some(Boolean);
    if (!anyLugar) nextErrors.asistenciaLugar = 'Registre al menos 1 voluntario presente en el lugar.';

    // Inmuebles: validaciones extra
    const inmErrors = [];
    inmuebles.forEach((inm, i) => {
      if (inm.n_pisos !== '' && !isPosInt(inm.n_pisos)) {
        inmErrors.push(`Inmueble #${i + 1}: "N° de pisos" debe ser entero > 0.`);
      }
      if (inm.m2_construccion !== '' && !(Number(inm.m2_construccion) > 0)) {
        inmErrors.push(`Inmueble #${i + 1}: "m² construcción" debe ser > 0.`);
      }
      if (inm.m2_afectado !== '' && !(Number(inm.m2_afectado) > 0)) {
        inmErrors.push(`Inmueble #${i + 1}: "m² afectado" debe ser > 0.`);
      }
      const edades = [];
      if (inm.dueno?.edad !== undefined && inm.dueno?.edad !== '') edades.push(inm.dueno.edad);
      (inm.habitantes || []).forEach(h => {
        if (h?.edad !== undefined && h?.edad !== '') edades.push(h.edad);
      });
      const invalidEdad = edades.find(ed => !isPosInt(ed));
      if (invalidEdad !== undefined) {
        inmErrors.push(`Inmueble #${i + 1}: "Edad" debe ser entero positivo en los campos informados.`);
      }
    });
    if (inmErrors.length > 0) {
      nextErrors.inmuebles = inmErrors.join(' ');
    }

    // Vehículos: validaciones extra
    const currentYear = new Date().getFullYear();
    const vehErrors = [];
    vehiculos.forEach((v, i) => {
      if (v.anio !== '' && (!isPosInt(v.anio) || Number(v.anio) <= 1900 || Number(v.anio) >= currentYear)) {
        vehErrors.push(`Vehículo #${i + 1}: "Año" debe ser entero > 1900 y menor que ${currentYear}.`);
      }
      const edades = [];
      if (v.dueno?.edad !== undefined && v.dueno?.edad !== '') edades.push(v.dueno.edad);
      if (v.chofer?.edad !== undefined && v.chofer?.edad !== '') edades.push(v.chofer.edad);
      (v.pasajeros || []).forEach(p => {
        if (p?.edad !== undefined && p?.edad !== '') edades.push(p.edad);
      });
      const invalidEdad = edades.find(ed => !isPosInt(ed));
      if (invalidEdad !== undefined) {
        vehErrors.push(`Vehículo #${i + 1}: "Edad" debe ser entero positivo en los campos informados.`);
      }
    });
    if (vehErrors.length > 0) {
      nextErrors.vehiculos = vehErrors.join(' ');
    }

    // Validar idRedactor (usuario autenticado)
    const idRedactor = bombero?.id ? Number(bombero.id) : null;
    if (!idRedactor) {
      nextErrors.idRedactor = 'Sesión inválida: vuelva a iniciar sesión.';
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      // Mostrar toasts por cada error principal
      const keys = Object.keys(nextErrors);
      // Limitar cantidad de toasts para no saturar
      const maxToasts = Math.min(keys.length, 4);
      for (let i = 0; i < maxToasts; i++) {
        const k = keys[i];
        const msg = Array.isArray(nextErrors[k]) ? nextErrors[k].join(' ') : nextErrors[k];
        toast.error(typeof msg === 'string' ? msg : 'Hay errores en el formulario', {
          position: 'top-right', autoClose: 4000, hideProgressBar: false, closeOnClick: true,
        });
      }
      const firstKey = Object.keys(nextErrors)[0];
      const firstEl = document.querySelector(`[data-error-key="${firstKey}"]`);
      if (firstEl?.scrollIntoView) firstEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    setSubmitting(true);
    try {
      const fechaTrim = (fecha || '').trim();
      const horaTrim = (horaDespacho || '').trim();
      let fechaHoraDespacho = null;
      if (fechaTrim && horaTrim && /^\d{4}-\d{2}-\d{2}$/.test(fechaTrim) && /^\d{2}:\d{2}$/.test(horaTrim)) {
        // Construimos un ISO local sin Z para que el backend lo pueda parsear si quiere, y además un iso con Z
        const [yy, mm, dd] = fechaTrim.split('-').map(Number);
        const [hh, mi] = horaTrim.split(':').map(Number);
        const localDate = new Date(yy, mm - 1, dd, hh, mi, 0, 0);
        fechaHoraDespacho = localDate.toISOString(); // se envía en UTC
      }
      // Sanitizar arrays: eliminar ids generados en UI, conservar sólo IDs numéricos provenientes del GET
      const cleanInmuebles = Array.isArray(inmuebles) ? inmuebles.map((x) => sanitizeDeepKnown(x)) : [];
      const cleanVehiculos = Array.isArray(vehiculos) ? vehiculos.map((x) => sanitizeDeepKnown(x)) : [];
      const cleanMaterialMayor = Array.isArray(materialMayor) ? materialMayor.map((x) => sanitizeIdShallow(x)) : [];
      const normalizedMaterialMayor = cleanMaterialMayor.map((row) => ({
        ...row,
        unidadId: row.unidadId ? Number(row.unidadId) : null,
        conductorId: row.conductorId ? Number(row.conductorId) : null,
        bomberoId: row.bomberoId ? Number(row.bomberoId) : null,
        voluntarios: row.voluntarios === '' ? null : Number(row.voluntarios),
        kmSalida: row.kmSalida === '' ? null : Number(row.kmSalida),
        kmLlegada: row.kmLlegada === '' ? null : Number(row.kmLlegada),
      }));
      const cleanAccidentados = Array.isArray(accidentados) ? accidentados.map((x) => sanitizeIdShallow(x)) : [];
      const cleanOtrosServicios = Array.isArray(otrosServicios) ? otrosServicios.map((x) => sanitizeIdShallow(x)) : [];
      const normalizedOtrosServicios = cleanOtrosServicios.map((s) => ({
        ...s,
        servicioId: s.servicioId ? Number(s.servicioId) : null,
        personal: s.personal === '' ? null : Number(s.personal),
      }));

      const payload = {
        companiaId,
        fecha,
        horaDespacho: toHHmm(horaDespacho),
        fechaHoraDespacho,
        hora6_0: toHHmm(hora60),
        hora6_3: toHHmm(hora63),
        hora6_9: toHHmm(hora69),
        hora6_10: toHHmm(hora610),
        regionId, comunaId,
        calle: calleTxt,
        numero: numeroTxt || null,
        depto: deptoTxt || null,
        referencia: referenciaTxt || '',
        clasificacionId,
        subtipoId,
        idSubtipoIncidente: subtipoId, // compatibilidad con backend
        tipoIncendioId: tipoIncendioId ? Number(tipoIncendioId) : null,
        faseId: faseId ? Number(faseId) : null,
        descripcionPreliminar: descripcionPreliminar || '',
        bomberoACargoId: bomberoACargoId ? Number(bomberoACargoId) : null,
        idRedactor: bombero?.id ? Number(bombero.id) : null,
        inmuebles: cleanInmuebles,
        vehiculos: cleanVehiculos,
        materialMayor: normalizedMaterialMayor,
        accidentados: cleanAccidentados,
        otrosServicios: normalizedOtrosServicios,
        asistencia: {
          lugar: Object.keys(asistenciaLugar).filter((k) => !!asistenciaLugar[k]).map((k) => Number(k)),
          cuartel: Object.keys(asistenciaCuartel).filter((k) => !!asistenciaCuartel[k]).map((k) => Number(k)),
        },
      };
      // Envío update
      const resp = await actualizarParteEmergencia(id, payload);
      toast.success('Parte actualizado con éxito.', { position: 'top-right', autoClose: 3500 });
      navigate(`/vista-parte/${id}`);
    } catch (err) {
      console.error('Error al actualizar parte:', err);
      toast.error(err?.message || 'Ocurrió un error al actualizar el parte. Inténtalo nuevamente.', { position: 'top-right', autoClose: 5000 });
    } finally {
      setSubmitting(false);
    }
  };

  /* ---------- Cargas iniciales ---------- */
  useEffect(() => {
    (async () => {
      try {
        setLoadingCompanias(true); setErrorCompanias('');
        const res = await getCompanias();
        const arr = normalizeArray(res, 'companias').length > 0
          ? normalizeArray(res, 'companias')
          : normalizeArray(res?.data?.companias ?? res, null);
        setCompanias(arr);
      } catch {
        setErrorCompanias('No se pudieron cargar las compañías.'); setCompanias([]);
      } finally { setLoadingCompanias(false); }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        setLoadingRegiones(true); setErrorRegiones('');
        const res = await getRegiones();
        setRegiones(normalizeArray(res, 'regiones'));
      } catch {
        setErrorRegiones('No se pudieron cargar las regiones.'); setRegiones([]);
      } finally { setLoadingRegiones(false); }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        setLoadingClasificaciones(true); setErrorClasificaciones('');
        const res = await getClasificacionesEmergencia();
        const arr = normalizeArray(res, 'clasificaciones').length > 0
          ? normalizeArray(res, 'clasificaciones')
          : normalizeArray(res?.data?.clasificaciones ?? res, null);
        setClasificaciones(arr);
      } catch {
        setErrorClasificaciones('No se pudieron cargar las clasificaciones.'); setClasificaciones([]);
      } finally { setLoadingClasificaciones(false); }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        setLoadingTiposDano(true); setErrorTiposDano('');
        const res = await getTiposDano();
        const arr = normalizeArray(res, 'tipos').length > 0
          ? normalizeArray(res, 'tipos')
          : normalizeArray(res, 'tiposDano').length > 0
            ? normalizeArray(res, 'tiposDano')
            : normalizeArray(res);
        setTiposDano(arr);
      } catch {
        setErrorTiposDano('No se pudieron cargar los tipos de incendio/daño.'); setTiposDano([]);
      } finally { setLoadingTiposDano(false); }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        setLoadingFases(true); setErrorFases('');
        const res = await getFasesIncidente();
        const arr = normalizeArray(res, 'fases').length > 0
          ? normalizeArray(res, 'fases')
          : normalizeArray(res, 'fasesIncidente').length > 0
            ? normalizeArray(res, 'fasesIncidente')
            : normalizeArray(res);
        setFasesIncidente(arr);
      } catch {
        setErrorFases('No se pudieron cargar las fases del incidente.'); setFasesIncidente([]);
      } finally { setLoadingFases(false); }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        setLoadingServicios(true); setErrorServicios('');
        const res = await getServicios();
        const arr = normalizeArray(res, 'servicios').length > 0
          ? normalizeArray(res, 'servicios')
          : normalizeArray(res);
        setServicios(arr);
      } catch {
        setServicios([]); setErrorServicios('No se pudieron cargar los servicios.');
      } finally { setLoadingServicios(false); }
    })();
  }, []);

  // Cargar parte por ID y poblar estados
  useEffect(() => {
    (async () => {
      if (!id) return;
      const userId = Number(bombero?.id);
      if (!Number.isInteger(userId)) return; // esperar a tener el id del usuario
      try {
        setLoadingParte(true);
        // Chequear último estado antes de cargar datos
        try {
          const estResp = await obtenerUltimoEstadoIncidente(id);
          const estData = estResp?.data?.data ?? estResp?.data ?? estResp;
          const estadoUpper = (estData?.estado || '').toString().trim().toUpperCase();
          setEstadoParte(estadoUpper);
          if (estadoUpper === 'ENVIADO' || estadoUpper === 'APROBADO') {
            navigate('/404');
            return;
          }
        } catch (_) {
          // si falla, continuamos y el backend controlará permisos y update
        }
  const resp = await obtenerParteEmergenciaPorId(id, { idRedactor: userId });
        const data = resp?.data?.data ?? resp?.data ?? resp;
        if (!data) {
          navigate('/404');
          return;
        }

  // Precarga: marcar ready antes de setear companiaId para evitar reset y gatillar dependencias
  pendingInitRef.current.appliedCompaniaDeps = false;
  pendingInitRef.current.ready = true;
  setInitGate((n) => n + 1);
  if (DEBUG_INIT) console.debug('[EditarParte] precarga lista: ready=true (initGate++) antes de setear companiaId');

        setCompaniaId(toId(data.companiaId));
        setFecha(data.fecha ?? '');
  setHoraDespacho(toHHmm(data.horaDespacho ?? ''));
  setHora60(toHHmm(data.hora6_0 ?? data.hora60 ?? ''));
  setHora63(toHHmm(data.hora6_3 ?? data.hora63 ?? ''));
  setHora69(toHHmm(data.hora6_9 ?? data.hora69 ?? ''));
  setHora610(toHHmm(data.hora6_10 ?? data.hora610 ?? ''));

  setRegionId(toId(data.regionId));
  // Guardar comuna pendiente para aplicar cuando carguen las comunas de la región
  pendingInitRef.current.comunaId = toId(data.comunaId);
  pendingInitRef.current.appliedComuna = false;
        setCalleTxt(data.calle ?? '');
        setNumeroTxt(data.numero ?? '');
        setDeptoTxt(data.depto ?? '');
        setReferenciaTxt(data.referencia ?? '');

  // Asegurar que usamos IDs numéricos para los selects
  setClasificacionId(toId(data.clasificacionId));
  // Guardamos el subtipo esperado para re-aplicarlo tras cargar los subtipos
  pendingInitRef.current.subtipoId = toId(data.subtipoId);
  setSubtipoId(toId(data.subtipoId));
  if (data.tipoIncendioId) { setTipoIncendioEnabled(true); setTipoIncendioId(toId(data.tipoIncendioId)); } else { setTipoIncendioEnabled(false); setTipoIncendioId(''); }
  if (data.faseId) { setFaseEnabled(true); setFaseId(toId(data.faseId)); } else { setFaseEnabled(false); setFaseId(''); }

        setDescripcionPreliminar(data.descripcionPreliminar ?? '');
  // Guardar dependientes de compañía para aplicar cuando carguen las listas
  // Sólo si hay un ID válido (>0)
  {
    const pac = toId(data.bomberoACargoId);
    if (pac !== '' && Number.isFinite(Number(pac)) && Number(pac) > 0) {
      pendingInitRef.current.bomberoACargoId = pac;
    } else {
      delete pendingInitRef.current.bomberoACargoId;
    }
  }

        const safeWithId = (arr) => (Array.isArray(arr) ? arr.map((x) => ({ id: x?.id ?? genId(), ...x })) : []);
        setInmuebles(safeWithId(data.inmuebles));
        setVehiculos(safeWithId((data.vehiculos || []).map((v) => ({
          ...v,
          pasajeros: Array.isArray(v?.pasajeros) ? v.pasajeros : [],
        }))));
        // Normaliza material mayor extrayendo IDs aunque vengan como objetos anidados
        const getId = (v) => {
          if (v === null || v === undefined) return '';
          if (typeof v === 'object') {
            const cand = v.id ?? v.value ?? v.bomberoId ?? v.unidadId ?? v.conductorId ?? v.carroId ?? v.idCarro;
            return getId(cand);
          }
          const n = Number(v);
          return Number.isFinite(n) && n > 0 ? String(n) : '';
        };
        pendingInitRef.current.materialMayor = safeWithId((data.materialMayor || []).map((m) => ({
          ...m,
          unidadId: getId(m?.unidadId ?? m?.carroId ?? m?.idCarro ?? m?.unidad ?? m?.carro),
          conductorId: getId(m?.conductorId ?? m?.idConductor ?? m?.conductor),
          bomberoId: getId(m?.bomberoId ?? m?.idBombero ?? m?.bombero),
        })));
  // Accidentados: guardar y aplicar cuando se cargue la compañía específica si difiere
  pendingInitRef.current.accidentados = safeWithId(data.accidentados || []);
        setOtrosServicios(safeWithId(data.otrosServicios));

        // Guardar asistencia pendiente para aplicar cuando carguen los bomberos de la compañía
        const toIdStr = (v) => {
          if (v === null || v === undefined) return '';
          if (typeof v === 'object') return toIdStr(v.id ?? v.value ?? v.bomberoId);
          const n = Number(v);
          return Number.isFinite(n) && n > 0 ? String(n) : '';
        };
        const lugarMap = Object.fromEntries(((data.asistencia?.lugar) || []).map((bid) => {
          const k = toIdStr(bid);
          return k ? [k, true] : null;
        }).filter(Boolean));
        const cuartelMap = Object.fromEntries(((data.asistencia?.cuartel) || []).map((bid) => {
          const k = toIdStr(bid);
          return k ? [k, true] : null;
        }).filter(Boolean));
        pendingInitRef.current.asistenciaLugar = lugarMap;
  pendingInitRef.current.asistenciaCuartel = cuartelMap;
  // (ready/applied ya se setearon arriba)
      } catch (e) {
        console.error('Error cargando parte:', e);
        navigate('/404');
      } finally {
        setLoadingParte(false);
      }
    })();
  }, [id, bombero?.id]);

  /* ---------- Efectos dependientes ---------- */
  // Comunas por región
  useEffect(() => {
    (async () => {
      if (!regionId && regionId !== 0) { setComunas([]); setComunaId(''); return; }
      try {
        setLoadingComunas(true); setErrorComunas('');
        const res = await getComunas(regionId);
        setComunas(normalizeArray(res));
      } catch {
        setErrorComunas('No se pudieron cargar las comunas de la región seleccionada.'); setComunas([]);
      } finally { setLoadingComunas(false); }
    })();
  }, [regionId]);

  // Aplicar comuna una vez que regionId haya cargado sus comunas
  useEffect(() => {
    if (!regionId) return;
    if (loadingComunas) return;
    if (pendingInitRef.current.appliedComuna) return;
    const pendingComuna = pendingInitRef.current.comunaId;
    if (pendingComuna) {
      setComunaId(pendingComuna);
    }
    pendingInitRef.current.appliedComuna = true;
  }, [regionId, loadingComunas, comunas.length]);

  // Subtipos por clasificación
  useEffect(() => {
    (async () => {
      if (clasificacionId === '' || clasificacionId === null) { setSubtipos([]); setSubtipoId(''); return; }
      try {
        setLoadingSubtipos(true); setErrorSubtipos('');
        const res = await getSubtiposIncidente(clasificacionId);
        const arr = normalizeArray(res, 'subtipos').length > 0
          ? normalizeArray(res, 'subtipos')
          : normalizeArray(res?.data?.subtipos ?? res, null);
        setSubtipos(arr);
      } catch {
        setErrorSubtipos('No se pudieron cargar los subtipos de la clasificación seleccionada.'); setSubtipos([]);
      } finally { setLoadingSubtipos(false); }
    })();
  }, [clasificacionId]);

  // Re-aplicar subtipo una vez cargada la lista de subtipos para la clasificación seleccionada
  useEffect(() => {
    const pending = pendingInitRef.current.subtipoId;
    if (!pending || !Array.isArray(subtipos) || subtipos.length === 0) return;
    // Solo aplicar si el pendiente existe en la lista actual de subtipos
    const exists = subtipos.some(s => s.id === pending);
    if (exists) {
      setSubtipoId(pending);
      delete pendingInitRef.current.subtipoId;
    }
  }, [subtipos.length, loadingSubtipos]);

  // Bomberos / Conductores / Carros por compañía + Reset asistencia
  useEffect(() => {
    // Detecta cambio real de compañía después de la carga inicial
    const prev = prevCompaniaIdRef.current;
    if (prev === undefined) {
      // Primera vez: setear y NO resetear
      prevCompaniaIdRef.current = companiaId;
    } else if (prev !== companiaId) {
      // Cambio de compañía por el usuario: reset dependientes
      prevCompaniaIdRef.current = companiaId;
      // Si aún estamos en la aplicación inicial (ready true y applied false), no reseteamos para no perder la precarga
      const isInitialApplicationPending = !pendingInitRef.current.appliedCompaniaDeps;
      if (!isInitialApplicationPending) {
        setMaterialMayor((prev) => prev.map((row) => ({ ...row, unidadId: '', conductorId: '', bomberoId: '' })));
        setAsistenciaLugar({});
        setAsistenciaCuartel({});
      }
    }

    if (!companiaId) {
      setConductores([]); setBomberos([]); setCarros([]); setErrorCarros('');
      return;
    }

    (async () => {
      try {
        setLoadingConductores(true);
        const res = await getBomberosConLicencias(companiaId);
        const arr = normalizeArray(res, 'bomberos').length > 0 ? normalizeArray(res, 'bomberos') : normalizeArray(res);
        setConductores(arr);
      } catch { setConductores([]); } finally { setLoadingConductores(false); }
    })();

    (async () => {
      try {
        setLoadingBomberos(true);
        const res = await getBomberosPorCompania(companiaId);
        const arr = normalizeArray(res, 'bomberos').length > 0 ? normalizeArray(res, 'bomberos') : normalizeArray(res);
        setBomberos(arr);
      } catch { setBomberos([]); } finally { setLoadingBomberos(false); }
    })();

    (async () => {
      try {
        setLoadingCarros(true); setErrorCarros('');
        const res = await getCarrosByCompania(companiaId);
        const arr = normalizeArray(res, 'carros').length > 0 ? normalizeArray(res, 'carros') : normalizeArray(res);
        setCarros(arr);
      } catch {
        setCarros([]); setErrorCarros('No se pudieron cargar los carros de la compañía.');
      } finally { setLoadingCarros(false); }
    })();
  }, [companiaId]);

  // Aplicar dependientes de compañía (bombero a cargo, material mayor, asistencia) cuando listas estén listas
  useEffect(() => {
    if (!companiaId) return;
    // No aplicar hasta que el parte haya sido cargado y hayamos preparado los pendientes
    if (!pendingInitRef.current.ready) return;
    if (loadingConductores || loadingBomberos || loadingCarros) return;
    if (pendingInitRef.current.appliedCompaniaDeps) return;
    if (DEBUG_INIT) console.debug('[EditarParte] aplicando dependientes de compañía…');
    // Aplicar bombero a cargo si viene (ID válido)
    if (pendingInitRef.current.bomberoACargoId !== undefined) {
      const bac = pendingInitRef.current.bomberoACargoId;
      if (bac !== '' && Number.isFinite(Number(bac)) && Number(bac) > 0) {
        setBomberoACargoId(bac);
      }
    }
    // Aplicar material mayor manteniendo los IDs aunque no existan en las listas actuales
    // La UI (UnidadCard) ya muestra un fallback cuando el ID no está disponible en la compañía seleccionada.
    if (Array.isArray(pendingInitRef.current.materialMayor)) {
      setMaterialMayor(pendingInitRef.current.materialMayor);
    }
    // Aplicar asistencia directamente (usa IDs de bomberos)
    setAsistenciaLugar(pendingInitRef.current.asistenciaLugar || {});
    setAsistenciaCuartel(pendingInitRef.current.asistenciaCuartel || {});
    // Marcar como aplicado para no reintentar
    pendingInitRef.current.appliedCompaniaDeps = true;
    if (DEBUG_INIT) console.debug('[EditarParte] dependientes aplicados y appliedCompaniaDeps=true');
  }, [companiaId, loadingConductores, loadingBomberos, loadingCarros, conductores.length, bomberos.length, carros.length, initGate]);

  // Aplicar accidentados en cascada por compañía: primero setear companiaId de cada fila, luego setear bombero cuando existan opciones
  useEffect(() => {
    const pending = pendingInitRef.current.accidentados;
    if (!Array.isArray(pending) || pending.length === 0) return;
    // Si no hay bomberos cargados aún, esperar a que cargue la compañía general. Los accidentados pueden ser de otras compañías.
    // Estrategia: aplicamos directamente las filas (con su companiaId y bomberoId). La UI ya reacciona a companiaId para filtrar el selector de bomberos si corresponde.
    setAccidentados(pending);
    // limpiar para no re-aplicar
    delete pendingInitRef.current.accidentados;
  }, [bomberos.length]);

  // Guards anti-HMR
  useEffect(() => {
    if (Array.isArray(asistenciaLugar)) {
      const map = Object.fromEntries(asistenciaLugar.filter(r => r?.bomberoId).map(r => [r.bomberoId, true]));
      setAsistenciaLugar(map);
    }
    if (Array.isArray(asistenciaCuartel)) {
      const map = Object.fromEntries(asistenciaCuartel.filter(r => r?.bomberoId).map(r => [r.bomberoId, true]));
      setAsistenciaCuartel(map);
    }
  }, [asistenciaLugar, asistenciaCuartel]);

  /* ---------- Derivados de UI ---------- */
  const selectedClasificacion = clasificaciones.find((c) => c.id === clasificacionId) || null;
  const selectedSubtipo = subtipos.find((s) => s.id === subtipoId) || null;
  const selectedTipoDano = tiposDano.find((t) => t.id === tipoIncendioId) || null;
  const selectedFase = fasesIncidente.find((f) => f.id === faseId) || null;

  // Flags según subtipo (para mostrar/ocultar secciones)
  const hasFuego = !!selectedSubtipo?.contieneFuego;
  const hasInmuebles = !!selectedSubtipo?.contieneInmuebles;
  const hasVehiculos = !!selectedSubtipo?.contieneVehiculos;

  // Evitar duplicados en Unidad/Conductor
  const usedUnidadIds = materialMayor.map(r => r.unidadId).filter(Boolean).map(String);
  const usedConductorIds = materialMayor.map(r => r.conductorId).filter(Boolean).map(String);

  // Búsqueda asistencia
  const bomberosLugarFiltrados = bomberos.filter(b => nombreBombero(b).toLowerCase().includes(searchLugar.toLowerCase()));
  const bomberosCuartelFiltrados = bomberos.filter(b => nombreBombero(b).toLowerCase().includes(searchCuartel.toLowerCase()));

  /* ---------- Tabs ---------- */
  const tabs = [
    { key: 'dg', label: 'Datos generales & Lugar' },             // 1 & 2
    { key: 'te', label: 'Tipo de emergencia & Características' },// 4 & 5
    { key: 'mm', label: 'Material mayor' },                      // 7
    { key: 'ex', label: 'Accidentados & Otros servicios' },      // 8 & 9
    { key: 'as', label: 'Asistencia' },                          // 10
  ];
  // Mapear qué campos pertenecen a cada pestaña para mostrar indicador de error en el título
  const tabErrorKeys = {
    dg: ['idRedactor', 'companiaId', 'fecha', 'horadespacho', 'hora6_0', 'hora6_3', 'hora6_9', 'hora6_10', 'regionId', 'comunaId', 'calle'],
    te: ['clasificacionId', 'subtipoId', 'inmuebles', 'vehiculos'],
    mm: ['materialMayor'],
    ex: [], // actualmente sin validaciones bloqueantes
    as: ['asistenciaLugar'],
  };

  const [activeTabIdx, setActiveTabIdx] = useState(0);
  const isFirst = activeTabIdx === 0;
  const isLast = activeTabIdx === tabs.length - 1;
  const goPrev = () => !isFirst && setActiveTabIdx((i) => i - 1);
  const goNext = () => !isLast && setActiveTabIdx((i) => i + 1);

  /* ---------- Render ---------- */
  return (
    <form onSubmit={handleSubmit} noValidate className="bg-slate-50 min-h-screen py-6 px-3 md:px-6">
      <div className="max-w-6xl mx-auto">
        {/* Mostrar error de idRedactor si aplica */}
        {errors.idRedactor && (
          <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-2" data-error-key="idRedactor">
            {errors.idRedactor}
          </div>
        )}

        <main className="space-y-6">
          {/* Encabezado */}
          <div className="bg-white rounded-3xl shadow-sm p-6 mb-4 sticky top-0 z-40">
            <div className="flex items-center gap-3">
              <ClipboardList className="text-blue-600" />
              <h1 className="text-xl font-semibold">Antecedentes Generales</h1>
            </div>

            {/* Tabs header */}
            <div className="mt-4 border-b border-gray-200">
              <nav className="flex gap-6 overflow-x-auto">
                {tabs.map((t, i) => {
                  const active = i === activeTabIdx;
                  return (
                    <button
                      key={t.key}
                      type="button"
                      onClick={() => setActiveTabIdx(i)}
                      className={`relative py-2 text-sm whitespace-nowrap ${active ? 'text-blue-600 font-medium' : 'text-gray-600 hover:text-gray-800'
                        }`}
                      title={
                        <>
                          {t.label}
                          {Object.keys(errors).some((k) => (tabErrorKeys[t.key] || []).includes(k)) && (
                            <span
                              aria-label="Errores"
                              className="ml-1 inline-block align-middle h-2 w-2 rounded-full bg-red-500"
                            />
                          )}
                        </>
                      }
                    >
                      {t.label} {Object.keys(errors).some((k) => (tabErrorKeys[t.key] || []).includes(k)) && (<span aria-label="Errores" className="ml-1 inline-block align-middle h-2 w-2 rounded-full bg-red-500" />)}
                      <span
                        className={`absolute left-0 right-0 -bottom-px h-0.5 transition-all ${active ? 'bg-blue-600' : 'bg-transparent'
                          }`}
                      />
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* ---------- TAB 0: Datos generales + Lugar ---------- */}
          {activeTabIdx === 0 && (
            <>
              {/* 1. Datos generales */}
              <Card title="1. Datos generales" titleIcon={<Users className="text-blue-600" />}>
                <div className="grid md:grid-cols-4 gap-3">
                  <div className="md:col-span-2" data-error-key="companiaId">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Compañía:</label>
                    <Dropdown
                      value={companiaId === '' ? null : Number(companiaId)}
                      options={companias.map(c => ({ label: c.nombre, value: c.id }))}
                      placeholder={loadingCompanias ? 'Cargando…' : (getConfigValue('company_name') || bombero?.compania?.nombre || '—')}
                      disabled={true}
                      className={hasError('companiaId') ? 'p-invalid' : ''}
                      style={{ width: '100%' }}
                    />
                    {hasError('companiaId') && <p className="mt-1 text-xs text-red-600">{errors.companiaId}</p>}
                  </div>

                  <div data-error-key="fecha">
                    <label htmlFor="fecha" className="block text-sm font-medium text-gray-700 mb-1">Fecha:</label>
                    <PrimeDatePicker
                      id="fecha"
                      value={fecha}
                      onChange={(next) => {
                        setFecha(next);
                        if (errors.fecha) setErrors((p) => ({ ...p, fecha: undefined }));
                      }}
                      maxDate={todayIso}
                      error={hasError('fecha')}
                      placeholder="Selecciona la fecha"
                    />
                    {hasError('fecha') && <p className="mt-1 text-xs text-red-600">{errors.fecha}</p>}
                  </div>

                  <div data-error-key="horadespacho">
                    <label htmlFor="horadespacho" className="block text-sm font-medium text-gray-700 mb-1">Hora Despacho:</label>
                    <PrimeTimePicker
                      id="horadespacho"
                      value={horaDespacho}
                      onChange={(next) => {
                        setHoraDespacho(next);
                        if (errors.horadespacho) setErrors((p) => ({ ...p, horadespacho: undefined }));
                      }}
                      error={hasError('horadespacho')}
                      placeholder="Selecciona hora de despacho"
                    />
                    {hasError('horadespacho') && <p className="mt-1 text-xs text-red-600">{errors.horadespacho}</p>}
                  </div>

                  <div data-error-key="hora6_0">
                    <label htmlFor="hora6_0" className="block text-sm font-medium text-gray-700 mb-1">Hora 6_0</label>
                    <PrimeTimePicker
                      id="hora6_0"
                      value={hora60}
                      onChange={(next) => {
                        setHora60(next);
                        if (errors.hora6_0) setErrors((p) => ({ ...p, hora6_0: undefined }));
                      }}
                      error={hasError('hora6_0')}
                      placeholder="Selecciona hora 6_0"
                    />
                    {hasError('hora6_0') && <p className="mt-1 text-xs text-red-600">{errors.hora6_0}</p>}
                  </div>

                  <div data-error-key="hora6_3">
                    <label htmlFor="hora6_3" className="block text-sm font-medium text-gray-700 mb-1">Hora 6_3</label>
                    <PrimeTimePicker
                      id="hora6_3"
                      value={hora63}
                      onChange={(next) => {
                        setHora63(next);
                        if (errors.hora6_3) setErrors((p) => ({ ...p, hora6_3: undefined }));
                      }}
                      error={hasError('hora6_3')}
                      placeholder="Selecciona hora 6_3"
                    />
                    {hasError('hora6_3') && <p className="mt-1 text-xs text-red-600">{errors.hora6_3}</p>}
                  </div>

                  <div data-error-key="hora6_9">
                    <label htmlFor="hora6_9" className="block text-sm font-medium text-gray-700 mb-1">Hora 6_9</label>
                    <PrimeTimePicker
                      id="hora6_9"
                      value={hora69}
                      onChange={(next) => {
                        setHora69(next);
                        if (errors.hora6_9) setErrors((p) => ({ ...p, hora6_9: undefined }));
                      }}
                      error={hasError('hora6_9')}
                      placeholder="Selecciona hora 6_9"
                    />
                    {hasError('hora6_9') && <p className="mt-1 text-xs text-red-600">{errors.hora6_9}</p>}
                  </div>

                  <div data-error-key="hora6_10">
                    <label htmlFor="hora6_10" className="block text-sm font-medium text-gray-700 mb-1">Hora 6_10</label>
                    <PrimeTimePicker
                      id="hora6_10"
                      value={hora610}
                      onChange={(next) => {
                        setHora610(next);
                        if (errors.hora6_10) setErrors((p) => ({ ...p, hora6_10: undefined }));
                      }}
                      error={hasError('hora6_10')}
                      placeholder="Selecciona hora 6_10"
                    />
                    {hasError('hora6_10') && <p className="mt-1 text-xs text-red-600">{errors.hora6_10}</p>}
                  </div>

                  {/* NUEVOS CAMPOS EN DATOS GENERALES */}
                  <div className="md:col-span-2">
                    <label htmlFor="bomberoACargo" className="block text-sm font-medium text-gray-700 mb-1">
                      Bombero a cargo:
                    </label>
                    <Select
                      inputId="bomberoACargo"
                      isSearchable
                      isClearable
                      isDisabled={!companiaId}
                      isLoading={loadingBomberos}
                      value={selectedBomberoOption}
                      options={bomberoSearchOptions}
                      onChange={(option) => setBomberoACargoId(option?.value ?? '')}
                      placeholder={!companiaId ? 'Selecciona primero una compañía...' : loadingBomberos ? 'Cargando bomberos...' : 'Buscar por nombre o RUN...'}
                      noOptionsMessage={() => (!companiaId ? 'Selecciona una compañía' : 'Sin coincidencias')}
                      filterOption={(candidate, rawInput) => {
                        if (!rawInput) return true;
                        const term = rawInput.toLowerCase();
                        const labelMatch = candidate.label.toLowerCase().includes(term);
                        const runMatch = candidate.data?.run?.includes(term);
                        return labelMatch || runMatch;
                      }}
                      styles={commonSelectStyles}
                      classNamePrefix="bombero-select"
                      menuPortalTarget={selectMenuPortalTarget}
                    />
                  </div>

                  <div className="md:col-span-4">
                    <label htmlFor="descripcionPreliminar" className="block text-sm font-medium text-gray-700 mb-1">
                      Descripción preliminar:
                    </label>
                    <textarea
                      id="descripcionPreliminar"
                      rows={3}
                      className={`${baseTextarea} min-h-[80px] ${hasError('descripcionPreliminar') ? 'ring-2 ring-red-400 border-red-300' : ''}`}
                      placeholder="Resumen breve de lo ocurrido…"
                      value={descripcionPreliminar}
                      onChange={(e) => setDescripcionPreliminar(e.target.value)}
                    />
                  </div>
                  {/* FIN NUEVOS CAMPOS */}
                </div>
              </Card>

              {/* 2. Datos del Lugar */}
              <Card title="2. Datos del Lugar" titleIcon={<Home className="text-blue-600" />}>
                <div className="grid md:grid-cols-3 gap-3">
                  <div data-error-key="regionId">
                    <label htmlFor="region" className="block text-sm font-medium text-gray-700 mb-1">Región:</label>
                    <Select
                      inputId="region"
                      isSearchable
                      isClearable
                      isDisabled={loadingRegiones || !!errorRegiones}
                      isLoading={loadingRegiones}
                      options={regionOptions}
                      value={selectedRegionOption}
                      placeholder={
                        loadingRegiones
                          ? 'Cargando regiones...'
                          : errorRegiones
                            ? errorRegiones
                            : 'Buscar región...'
                      }
                      noOptionsMessage={() =>
                        loadingRegiones ? 'Cargando...' : 'No se encontraron regiones'
                      }
                      onChange={(option) => {
                        if (!option) {
                          setRegionId('');
                          if (pendingInitRef.current.appliedComuna) setComunaId('');
                        } else {
                          const numeric = Number(option.value);
                          setRegionId(Number.isNaN(numeric) ? '' : numeric);
                          if (pendingInitRef.current.appliedComuna) setComunaId('');
                        }
                        if (errors.regionId) setErrors((prev) => ({ ...prev, regionId: undefined }));
                      }}
                      filterOption={(candidate, rawInput) => {
                        if (!rawInput) return true;
                        const term = rawInput.toLowerCase();
                        const nameMatch = candidate.label.toLowerCase().includes(term);
                        const extraMatch = candidate.data?.nombre?.includes(term);
                        return nameMatch || extraMatch;
                      }}
                      styles={commonSelectStyles}
                      classNamePrefix="region-select"
                      menuPortalTarget={selectMenuPortalTarget}
                    />
                    {hasError('regionId') && <p className="mt-1 text-xs text-red-600">{errors.regionId}</p>}
                  </div>

                  <div data-error-key="comunaId">
                    <label htmlFor="comuna" className="block text-sm font-medium text-gray-700 mb-1">Comuna:</label>
                    <Select
                      inputId="comuna"
                      isSearchable
                      isClearable
                      isDisabled={regionId === '' || loadingComunas || !!errorComunas}
                      isLoading={loadingComunas}
                      options={comunaOptions}
                      value={selectedComunaOption}
                      placeholder={
                        regionId === ''
                          ? 'Selecciona primero una región...'
                          : loadingComunas
                            ? 'Cargando comunas...'
                            : errorComunas || 'Buscar comuna...'
                      }
                      noOptionsMessage={() =>
                        regionId === ''
                          ? 'Selecciona primero una región'
                          : loadingComunas
                            ? 'Cargando...'
                            : 'No se encontraron comunas'
                      }
                      onChange={(option) => {
                        if (!option) {
                          setComunaId('');
                        } else {
                          const numeric = Number(option.value);
                          setComunaId(Number.isNaN(numeric) ? '' : numeric);
                        }
                        if (errors.comunaId) setErrors((prev) => ({ ...prev, comunaId: undefined }));
                      }}
                      filterOption={(candidate, rawInput) => {
                        if (!rawInput) return true;
                        const term = rawInput.toLowerCase();
                        const nameMatch = candidate.label.toLowerCase().includes(term);
                        const extraMatch = candidate.data?.nombre?.includes(term);
                        return nameMatch || extraMatch;
                      }}
                      styles={commonSelectStyles}
                      classNamePrefix="comuna-select"
                      menuPortalTarget={selectMenuPortalTarget}
                    />
                    {hasError('comunaId') && <p className="mt-1 text-xs text-red-600">{errors.comunaId}</p>}
                  </div>

                  <div className="md:col-span-1" data-error-key="calle">
                    <label htmlFor="calle" className="block text-sm font-medium text-gray-700 mb-1">Calle:</label>
                    <input
                      type="text"
                      id="calle"
                      name="calle"
                      className={inputCls('calle')}
                      value={calleTxt}
                      onChange={(e) => { setCalleTxt(e.target.value); if (errors.calle) setErrors(p => ({ ...p, calle: undefined })); }}
                    />
                    {hasError('calle') && <p className="mt-1 text-xs text-red-600">{errors.calle}</p>}
                  </div>

                  <div>
                    <label htmlFor="numero" className="block text-sm font-medium text-gray-700 mb-1">Número:</label>
                    <input
                      type="number"
                      id="numero"
                      name="numero"
                      min={0}
                      step={1}
                      inputMode="numeric"
                      pattern="[0-9]*"
                      className={baseInput}
                      value={numeroTxt}
                      onChange={(e) => {
                        const raw = e.target.value;
                        if (raw === '') {
                          setNumeroTxt('');
                          return;
                        }
                        const sanitized = raw.replace(/\D+/g, '');
                        setNumeroTxt(sanitized);
                      }}
                      onWheel={(e) => e.currentTarget.blur()}
                    />
                  </div>

                  <div>
                    <label htmlFor="depto" className="block text-sm font-medium text-gray-700 mb-1">Número Departamento</label>
                    <input
                      type="text"
                      id="depto"
                      name="depto"
                      placeholder="(opcional)"
                      className={baseInput}
                      value={deptoTxt}
                      onChange={(e) => setDeptoTxt(e.target.value)}
                    />
                  </div>

                  <div className="md:col-span-3">
                    <label htmlFor="referencia" className="block text-sm font-medium text-gray-700 mb-1">Referencia:</label>
                    <input
                      type="text"
                      id="referencia"
                      name="referencia"
                      className={baseInput}
                      value={referenciaTxt}
                      onChange={(e) => setReferenciaTxt(e.target.value)}
                    />
                  </div>
                </div>
              </Card>
            </>
          )}

          {/* ---------- TAB 1: Tipo de emergencia + Características (incluye inmuebles/vehículos) ---------- */}
          {activeTabIdx === 1 && (
            <>
              {/* 4. Tipo de Emergencia */}
              <Card title="4. Tipo de Emergencia" titleIcon={<AlertTriangle className="text-blue-600" />}>
                <div className="text-sm text-gray-700 mb-2">Clasificación</div>
                {loadingClasificaciones && <div className="text-sm text-gray-500 mb-3">Cargando clasificaciones…</div>}
                {errorClasificaciones && <div className="text-sm text-red-600 mb-3">{errorClasificaciones}</div>}

                <div className="grid sm:grid-cols-3 gap-3 mb-4" data-error-key="clasificacionId">
                  {clasificaciones.map((cls) => (
                    <SelectableCard
                      key={cls.id}
                      selected={Number(clasificacionId) === Number(cls.id)}
                      onClick={() => {
                        setClasificacionId(Number(cls.id));
                        setSubtipoId('');
                        if (errors.clasificacionId) setErrors(p => ({ ...p, clasificacionId: undefined }));
                      }}
                      icon={Home}
                      label={cls.nombre ?? cls.label ?? `Clasificación ${cls.id}`}
                    />
                  ))}
                </div>
                {hasError('clasificacionId') && <p className="mt-1 text-xs text-red-600">{errors.clasificacionId}</p>}

                {clasificacionId !== '' && (
                  <div className="grid sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2" data-error-key="subtipoId">
                       {/* Renombrado a "Clave Radial" */}
                       <label htmlFor="subtipo" className="block text-sm font-medium text-gray-700 mb-1">
                         Clave Radial (según clasificación seleccionada):
                       </label>
                       <Select
                         inputId="subtipo"
                         isSearchable
                         isClearable
                         isDisabled={loadingSubtipos || !!errorSubtipos}
                         isLoading={loadingSubtipos}
                         options={claveRadialOptions}
                         value={selectedClaveRadialOption}
                         placeholder={
                           loadingSubtipos
                             ? 'Cargando claves…'
                             : errorSubtipos
                               ? errorSubtipos
                               : 'Buscar clave radial...'
                         }
                         noOptionsMessage={() =>
                           loadingSubtipos ? 'Cargando...' : 'No se encontraron claves'
                         }
                         onChange={(option) => {
                           if (!option) {
                             setSubtipoId('');
                             setTipoIncendioEnabled(false); setTipoIncendioId('');
                             setFaseEnabled(false); setFaseId('');
                           } else {
                             const numeric = Number(option.value);
                             setSubtipoId(Number.isNaN(numeric) ? '' : numeric);
                             setTipoIncendioEnabled(false); setTipoIncendioId('');
                             setFaseEnabled(false); setFaseId('');
                           }
                           if (errors.subtipoId) setErrors((p) => ({ ...p, subtipoId: undefined }));
                         }}
                         filterOption={(candidate, rawInput) => {
                           if (!rawInput) return true;
                           const term = rawInput.toLowerCase();
                           const labelMatch = candidate.label.toLowerCase().includes(term);
                           const extraMatch = candidate.data?.codigo?.includes(term) || candidate.data?.nombre?.includes(term);
                           return labelMatch || extraMatch;
                         }}
                         styles={commonSelectStyles}
                         classNamePrefix="subtipo-select"
                         menuPortalTarget={selectMenuPortalTarget}
                       />
                       {hasError('subtipoId') && <p className="mt-1 text-xs text-red-600">{errors.subtipoId}</p>}
                     </div>
                  </div>
                )}

                {subtipoId !== '' && (
                  <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4">
                    <div className="text-sm font-medium text-blue-900 mb-2">Resumen de tipo de emergencia</div>
                    <div className="grid sm:grid-cols-3 gap-3">
                      <div>
                        <div className="text-xs text-blue-800/80">Clasificación</div>
                        <div className="text-sm text-blue-950">
                          {selectedClasificacion?.nombre ?? selectedClasificacion?.label ?? `Clasificación ${selectedClasificacion?.id ?? ''}`}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-blue-800/80">Código radial tipo</div>
                        <div className="text-sm text-blue-950">
                          <code className="rounded bg-blue-100 px-1">
                            {selectedSubtipo?.claveRadial ?? selectedSubtipo?.codigoRadial ?? '—'}
                          </code>
                        </div>
                      </div>
                    </div>
                    {selectedSubtipo?.descripcion && <p className="mt-3 text-sm text-blue-950/90">{selectedSubtipo.descripcion}</p>}
                  </div>
                )}
              </Card>

              {/* 5. Características (condicionada por flags de la clave radial) */}
              <Card title="5. Características" titleIcon={<AlertTriangle className="text-blue-600" />}>
                {/* Tipo de incendio + Fase SOLO si la clave radial contiene fuego */}
                {hasFuego && (
                  <>
                    {/* Tipo de incendio */}
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-gray-900">Tipo de incendio</h4>
                      <Switch
                        id="switch-tipo-incendio"
                        checked={tipoIncendioEnabled}
                        onChange={(v) => { setTipoIncendioEnabled(v); if (!v) setTipoIncendioId(''); }}
                        label={tipoIncendioEnabled ? 'Activo' : 'Inactivo'}
                      />
                    </div>
                    {tipoIncendioEnabled && (
                      <>
                        {loadingTiposDano && <div className="text-sm text-gray-500 mb-2">Cargando tipos…</div>}
                        {errorTiposDano && <div className="text-sm text-red-600 mb-2">{errorTiposDano}</div>}
                        <div className="grid sm:grid-cols-3 gap-3 mb-6">
                          {tiposDano.map((t) => (
                            <SelectableCard
                              key={t.id}
                              selected={Number(tipoIncendioId) === Number(t.id)}
                              onClick={() => setTipoIncendioId(Number(t.id))}
                              icon={Home}
                              label={t.nombre ?? t.label ?? `Tipo ${t.id}`}
                            />
                          ))}
                        </div>
                      </>
                    )}

                    {/* Fase */}
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-gray-900">Fase</h4>
                      <Switch
                        id="switch-fase"
                        checked={faseEnabled}
                        onChange={(v) => { setFaseEnabled(v); if (!v) setFaseId(''); }}
                        label={faseEnabled ? 'Activo' : 'Inactivo'}
                      />
                    </div>
                    {faseEnabled && (
                      <>
                        {loadingFases && <div className="text-sm text-gray-500 mb-2">Cargando fases…</div>}
                        {errorFases && <div className="text-sm text-red-600 mb-2">{errorFases}</div>}
                        <div className="grid sm:grid-cols-3 gap-3">
                          {fasesIncidente.map((f) => (
                            <SelectableCard
                              key={f.id}
                              selected={Number(faseId) === Number(f.id)}
                              onClick={() => setFaseId(Number(f.id))}
                              icon={AlertTriangle}
                              label={f.nombre ?? f.label ?? `Fase ${f.id}`}
                            />
                          ))}
                        </div>
                      </>
                    )}

                    {(tipoIncendioId || faseId) && (
                      <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-4">
                        <div className="text-sm font-medium text-gray-900 mb-2">Resumen de características</div>
                        <div className="grid sm:grid-cols-2 gap-3 text-sm">
                          <div>
                            <div className="text-xs text-gray-600">Tipo de incendio</div>
                            <div className="text-gray-900">{(selectedTipoDano?.nombre ?? selectedTipoDano?.label) || '—'}</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-600">Fase</div>
                            <div className="text-gray-900">{(selectedFase?.nombre ?? selectedFase?.label) || '—'}</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Inmuebles: solo si la clave radial los contiene */}
                {hasInmuebles && (
                  <div className="mt-8" data-error-key="inmuebles">
                    {hasError('inmuebles') && (
                      <div className="mb-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-2">
                        {errors.inmuebles}
                      </div>
                    )}
                    <div className="text-sm font-medium text-gray-900 mb-3">Inmuebles afectados</div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {inmuebles.map((inm, idx) => (
                        <InmuebleCard
                          key={inm.id}
                          value={inm}
                          index={idx}
                          onChange={(next) => updateInmueble(idx, next)}
                          onRemove={() => removeInmueble(idx)}
                        />
                      ))}
                      <button
                        type="button"
                        onClick={addInmueble}
                        className="rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50/50 hover:bg-blue-50 transition p-4 flex items-center justify-center"
                        title="Agregar inmueble"
                      >
                        <div className="flex flex-col items-center text-blue-600">
                          <Plus className="h-7 w-7" />
                          <span className="text-sm mt-1">Agregar inmueble</span>
                        </div>
                      </button>
                    </div>
                  </div>
                )}

                {/* Vehículos: solo si la clave radial los contiene */}
                {hasVehiculos && (
                  <div className="mt-10" data-error-key="vehiculos">
                    {hasError('vehiculos') && (
                      <div className="mb-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-2">
                        {errors.vehiculos}
                      </div>
                    )}
                    <div className="text-sm font-medium text-gray-900 mb-3">Vehículos involucrados</div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {vehiculos.map((veh, idx) => (
                        <VehicleCard
                          key={veh.id}
                          value={veh}
                          index={idx}
                          onChange={(next) => updateVehiculo(idx, next)}
                          onRemove={() => removeVehiculo(idx)}
                        />
                      ))}
                      <button
                        type="button"
                        onClick={addVehiculo}
                        className="rounded-2xl border-2 border-dashed border-amber-200 bg-amber-50/50 hover:bg-amber-50 transition p-4 flex items-center justify-center"
                        title="Agregar vehículo"
                      >
                        <div className="flex flex-col items-center text-amber-600">
                          <Plus className="h-7 w-7" />
                          <span className="text-sm mt-1">Agregar vehículo</span>
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </Card>
            </>
          )}

          {/* ---------- TAB 2: Material mayor ---------- */}
          {activeTabIdx === 2 && (
            <Card title="7. Material mayor y bomberos a cargo" titleIcon={<Users className="text-blue-600" />}>
              {hasError('materialMayor') && (
                <div className="mb-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-2" data-error-key="materialMayor">
                  {errors.materialMayor}
                </div>
              )}
              <div className="grid sm:grid-cols-1 gap-4">
                {materialMayor.map((row, idx) => {
                  const usedUnidadIdsLocal = materialMayor.map(r => r.unidadId).filter(Boolean).map(String);
                  const usedConductorIdsLocal = materialMayor.map(r => r.conductorId).filter(Boolean).map(String);
                  const unidadesDisponibles = carros.filter(u => !usedUnidadIdsLocal.includes(String(u.id)) || String(row.unidadId) === String(u.id));
                  const conductoresDisponibles = conductores.filter(c => !usedConductorIdsLocal.includes(String(c.id)) || String(row.conductorId) === String(c.id));
                  return (
                    <UnidadCard
                      key={row.id}
                      value={row}
                      index={idx}
                      onChange={(next) => {
                        updateUnidad(idx, next);
                        if (errors.materialMayor) setErrors(p => ({ ...p, materialMayor: undefined }));
                      }}
                      onRemove={() => removeUnidad(idx)}
                      unidades={unidadesDisponibles}
                      loadingUnidades={loadingCarros}
                      errorUnidades={errorCarros}
                      conductores={conductoresDisponibles}
                      loadingConductores={loadingConductores}
                      bomberos={bomberos}
                      loadingBomberos={loadingBomberos}
                      companiaSeleccionada={companiaId}
                    />
                  );
                })}

                <button
                  type="button"
                  onClick={addUnidad}
                  className="rounded-2xl border-2 border-dashed border-teal-200 bg-teal-50/50 hover:bg-teal-50 transition p-4 flex items-center justify-center"
                  title="Agregar unidad"
                >
                  <div className="flex flex-col items-center text-teal-600">
                    <Plus className="h-7 w-7" />
                    <span className="text-sm mt-1">Agregar unidad</span>
                  </div>
                </button>
              </div>

              <div className="mt-4 flex items-center justify-between text-sm">
                <div className="text-gray-600">Registros: <span className="font-medium text-gray-900">{materialMayor.length}</span></div>
                <div className="text-gray-600">Total voluntarios: <span className="font-medium text-gray-900">{totalVoluntarios}</span></div>
              </div>
            </Card>
          )}

          {/* ---------- TAB 3: Accidentados + Otros servicios ---------- */}
          {activeTabIdx === 3 && (
            <>
              {/* 8. Bomberos Accidentados */}
              <Card title="8. Bomberos Accidentados" titleIcon={<Users className="text-red-600" />}>
                <div className="space-y-4">
                  {accidentados.map((row, idx) => (
                    <AccidentadoCard
                      key={row.id}
                      value={row}
                      index={idx}
                      onChange={(next) => updateAccidentado(idx, next)}
                      onRemove={() => removeAccidentado(idx)}
                      companias={companias}
                      bomberosDeCompania={bomberosByCompania[row.companiaId] || []}
                      loadingBomberos={!!loadingByCompania[row.companiaId]}
                      errorBomberos={errorByCompania[row.companiaId] || ''}
                      ensureLoaded={ensureLoaded}
                    />
                  ))}

                  <button
                    type="button"
                    onClick={addAccidentado}
                    className="rounded-2xl border-2 border-dashed border-red-200 bg-red-50/50 hover:bg-red-50 transition p-4 flex items-center justify-center"
                    title="Agregar accidentado"
                  >
                    <div className="flex flex-col items-center text-red-600">
                      <Plus className="h-7 w-7" />
                      <span className="text-sm mt-1">Agregar accidentado</span>
                    </div>
                  </button>
                </div>
              </Card>

              {/* 9. Otros servicios */}
              <Card title="9. Otros servicios de emergencia en el lugar" titleIcon={<Handshake className="text-blue-600" />}>
                <div className="space-y-4">
                  {otrosServicios.map((row, idx) => (
                    <ServicioExternoCard
                      key={row.id}
                      value={row}
                      index={idx}
                      onChange={(next) => updateOtroServicio(idx, next)}
                      onRemove={() => removeOtroServicio(idx)}
                      servicios={servicios}
                      loadingServicios={loadingServicios}
                      errorServicios={errorServicios}
                    />
                  ))}

                  <button
                    type="button"
                    onClick={addOtroServicio}
                    className="rounded-2xl border-2 border-dashed border-indigo-200 bg-indigo-50/50 hover:bg-indigo-50 transition p-4 flex items-center justify-center"
                    title="Agregar servicio"
                  >
                    <div className="flex flex-col items-center text-indigo-600">
                      <Plus className="h-7 w-7" />
                      <span className="text-sm mt-1">Agregar servicio</span>
                    </div>
                  </button>
                </div>
              </Card>
            </>
          )}

          {/* ---------- TAB 4: Asistencia ---------- */}
          {activeTabIdx === 4 && (
            <Card title="10. Asistencia" titleIcon={<Users className="text-blue-600" />}>
              {hasError('asistenciaLugar') && (
                <div className="mb-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-2" data-error-key="asistenciaLugar">
                  {errors.asistenciaLugar}
                </div>
              )}
              <div className="grid md:grid-cols-2 gap-6">
                {/* A) En el lugar */}
                <div>
                  <div className="text-sm font-medium text-gray-900 mb-2">En el lugar</div>
                  <div className="mb-2">
                    <input
                      className={baseInput}
                      placeholder="Buscar voluntario…"
                      value={searchLugar}
                      onChange={(e) => setSearchLugar(e.target.value)}
                      disabled={!companiaId || loadingBomberos}
                    />
                  </div>
                  <div className={`relative overflow-visible rounded-xl ring-1 ring-gray-200 bg-white ${hasError('asistenciaLugar') ? 'ring-2 ring-red-400' : ''}`}>
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm">
                        <thead className="bg-gray-50 text-gray-600">
                          <tr>
                            <th className="px-3 py-2 text-left">Voluntario</th>
                            <th className="px-3 py-2 text-left">Asistencia</th>
                          </tr>
                        </thead>
                        <tbody>
                          {bomberosLugarFiltrados.map((b) => {
                            const present = !!asistenciaLugar[String(b.id)];
                            const disabledRow = !companiaId || loadingBomberos;
                            return (
                              <tr key={b.id} className="border-t">
                                <td className="px-3 py-2">{nombreBombero(b)}</td>
                                <td className="px-3 py-2">
                                  <Switch
                                    id={`switch-lugar-${b.id}`}
                                    checked={present}
                                    onChange={(val) => {
                                      toggleLugar(b.id, val);
                                      if (errors.asistenciaLugar) setErrors(p => ({ ...p, asistenciaLugar: undefined }));
                                    }}
                                    label={present ? 'Presente' : 'Ausente'}
                                    disabled={disabledRow}
                                  />
                                </td>
                              </tr>
                            );
                          })}
                          {bomberosLugarFiltrados.length === 0 && (
                            <tr>
                              <td className="px-3 py-3 text-gray-500" colSpan={2}>
                                {(!companiaId && 'Seleccione compañía en Datos generales…') ||
                                  (loadingBomberos && 'Cargando…') ||
                                  'Sin resultados'}
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* B) En cuartel */}
                <div>
                  <div className="text-sm font-medium text-gray-900 mb-2">En cuartel</div>
                  <div className="mb-2">
                    <input
                      className={baseInput}
                      placeholder="Buscar voluntario…"
                      value={searchCuartel}
                      onChange={(e) => setSearchCuartel(e.target.value)}
                      disabled={!companiaId || loadingBomberos}
                    />
                  </div>
                  <div className="relative overflow-visible rounded-xl ring-1 ring-gray-200 bg-white">
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm">
                        <thead className="bg-gray-50 text-gray-600">
                          <tr>
                            <th className="px-3 py-2 text-left">Voluntario</th>
                            <th className="px-3 py-2 text-left">Asistencia</th>
                          </tr>
                        </thead>
                        <tbody>
                          {bomberosCuartelFiltrados.map((b) => {
                            const present = !!asistenciaCuartel[String(b.id)];
                            const disabledRow = !companiaId || loadingBomberos;
                            return (
                              <tr key={b.id} className="border-t">
                                <td className="px-3 py-2">{nombreBombero(b)}</td>
                                <td className="px-3 py-2">
                                  <Switch
                                    id={`switch-cuartel-${b.id}`}
                                    checked={present}
                                    onChange={(val) => toggleCuartel(b.id, val)}
                                    label={present ? 'Presente' : 'Ausente'}
                                    disabled={disabledRow}
                                  />
                                </td>
                              </tr>
                            );
                          })}
                          {bomberosCuartelFiltrados.length === 0 && (
                            <tr>
                              <td className="px-3 py-3 text-gray-500" colSpan={2}>
                                {(!companiaId && 'Seleccione compañía en Datos generales…') ||
                                  (loadingBomberos && 'Cargando…') ||
                                  'Sin resultados'}
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </main>

        {/* Barra de acciones fija: navegación + submit */}
        <div className="bg-white border-t border-gray-200 p-3 sticky bottom-0 z-50">
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={goPrev}
                disabled={isFirst}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                title="Anterior"
              >
                Anterior
              </button>
              <button
                type="button"
                onClick={goNext}
                disabled={isLast}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg bg-slate-600 text-white hover:bg-slate-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                title="Siguiente"
              >
                Siguiente
              </button>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 text-white px-4 py-2.5 text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              title="Actualizar parte"
            >
              {submitting ? 'Actualizando…' : 'Actualizar parte'}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default EditarParte;
