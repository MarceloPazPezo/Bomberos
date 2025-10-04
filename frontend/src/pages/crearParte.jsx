import React, { useEffect, useState } from 'react';

// Services
import { regionService } from '../services/region.service.js';
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

// UI
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
const CrearParte = () => {
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
  // Inmuebles
  const [inmuebles, setInmuebles] = useState([]);
  const addInmueble = () =>
    setInmuebles((prev) => [...prev, {
      id: genId(),
      tipo_construccion: '',
      n_pisos: '',
      m2_construccion: '',
      m2_afectado: '',
      danos_vivienda: '',
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
    id: genId(), unidadId: '', conductorId: '', bomberoId: '', voluntarios: ''
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

  /* ---------- Envío del formulario ---------- */
  const [submitting, setSubmitting] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fd = new FormData(e.currentTarget);
      const payload = {
        companiaId,
        fecha: fd.get('fecha') || null,
        horaDespacho: fd.get('horadespacho') || null,
        hora6_0: fd.get('hora6_0') || null,
        hora6_3: fd.get('hora6_3') || null,
        hora6_9: fd.get('hora6_9') || null,
        hora6_10: fd.get('hora6_10') || null,
        regionId, comunaId,
        clasificacionId, subtipoId, tipoIncendioId, faseId,
        inmuebles, vehiculos, materialMayor, accidentados, otrosServicios,
        asistencia: {
          lugar: Object.keys(asistenciaLugar).filter((id) => asistenciaLugar[id]),
          cuartel: Object.keys(asistenciaCuartel).filter((id) => asistenciaCuartel[id]),
        },
      };
      console.log('Payload parte:', payload);
      // await crearParte(payload)
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
        const res = await regionService.getAllRegiones();
        setRegiones(normalizeArray(res));
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

  /* ---------- Efectos dependientes ---------- */
  // Comunas por región
  useEffect(() => {
    (async () => {
      if (!regionId && regionId !== 0) { setComunas([]); setComunaId(''); return; }
      try {
        setLoadingComunas(true); setErrorComunas('');
        const res = await regionService.getComunasByRegion(regionId);
        setComunas(normalizeArray(res));
      } catch {
        setErrorComunas('No se pudieron cargar las comunas de la región seleccionada.'); setComunas([]);
      } finally { setLoadingComunas(false); }
    })();
  }, [regionId]);

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

  // Bomberos / Conductores / Carros por compañía + Reset asistencia
  useEffect(() => {
    // Limpia filas dependientes de compañía
    setMaterialMayor((prev) => prev.map((row) => ({ ...row, unidadId: '', conductorId: '', bomberoId: '' })));
    setAsistenciaLugar({});
    setAsistenciaCuartel({});

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
  const baseInput =
    'w-full border border-gray-300 rounded-md px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-400';

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
  const [activeTabIdx, setActiveTabIdx] = useState(0);
  const isFirst = activeTabIdx === 0;
  const isLast  = activeTabIdx === tabs.length - 1;
  const goPrev  = () => !isFirst && setActiveTabIdx((i) => i - 1);
  const goNext  = () => !isLast && setActiveTabIdx((i) => i + 1);

  /* ---------- Render ---------- */
  return (
    <form onSubmit={handleSubmit} noValidate>
      <main className="p-4 md:p-6">
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
                    className={`relative py-2 text-sm whitespace-nowrap ${
                      active ? 'text-blue-600 font-medium' : 'text-gray-600 hover:text-gray-800'
                    }`}
                    title={t.label}
                  >
                    {t.label}
                    <span
                      className={`absolute left-0 right-0 -bottom-px h-0.5 transition-all ${
                        active ? 'bg-blue-600' : 'bg-transparent'
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
                <div className="md:col-span-2">
                  <label htmlFor="compania" className="block text-sm font-medium text-gray-700 mb-1">Compañía:</label>
                  <select
                    id="compania"
                    className={baseInput}
                    value={companiaId}
                    onChange={(e) => {
                      const v = e.target.value;
                      const next = v === '' ? '' : Number(v);
                      setCompaniaId(Number.isNaN(next) ? '' : next);
                    }}
                    disabled={loadingCompanias || !!errorCompanias}
                  >
                    <option value="">{loadingCompanias ? 'Cargando compañías…' : 'Selecciona compañía…'}</option>
                    {errorCompanias && <option value="" disabled>{errorCompanias}</option>}
                    {companias.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                  </select>
                </div>

                <div>
                  <label htmlFor="fecha" className="block text-sm font-medium text-gray-700 mb-1">Fecha:</label>
                  <input type="date" id="fecha" name="fecha" className={baseInput} />
                </div>

                <div>
                  <label htmlFor="horadespacho" className="block text-sm font-medium text-gray-700 mb-1">Hora Despacho:</label>
                  <input type="time" id="horadespacho" name="horadespacho" className={baseInput} />
                </div>

                <div>
                  <label htmlFor="hora6_0" className="block text-sm font-medium text-gray-700 mb-1">Hora 6_0</label>
                  <input type="time" id="hora6_0" name="hora6_0" className={baseInput} />
                </div>

                <div>
                  <label htmlFor="hora6_3" className="block text-sm font-medium text-gray-700 mb-1">Hora 6_3</label>
                  <input type="time" id="hora6_3" name="hora6_3" className={baseInput} />
                </div>

                <div>
                  <label htmlFor="hora6_9" className="block text-sm font-medium text-gray-700 mb-1">Hora 6_9</label>
                  <input type="time" id="hora6_9" name="hora6_9" className={baseInput} />
                </div>

                <div>
                  <label htmlFor="hora6_10" className="block text-sm font-medium text-gray-700 mb-1">Hora 6_10</label>
                  <input type="time" id="hora6_10" name="hora6_10" className={baseInput} />
                </div>
              </div>
            </Card>

            {/* 2. Datos del Lugar */}
            <Card title="2. Datos del Lugar" titleIcon={<Home className="text-blue-600" />}>
              <div className="grid md:grid-cols-3 gap-3">
                <div>
                  <label htmlFor="region" className="block text-sm font-medium text-gray-700 mb-1">Región:</label>
                  <select
                    id="region"
                    className={baseInput}
                    value={regionId}
                    onChange={(e) => {
                      const v = e.target.value;
                      const next = v === '' ? '' : Number(v);
                      setRegionId(Number.isNaN(next) ? '' : next);
                      setComunaId('');
                    }}
                    disabled={loadingRegiones || !!errorRegiones}
                  >
                    <option value="">{loadingRegiones ? 'Cargando regiones…' : 'Selecciona región…'}</option>
                    {errorRegiones && <option value="" disabled>{errorRegiones}</option>}
                    {regiones.map((r) => <option key={r.id} value={r.id}>{r.nombre}</option>)}
                  </select>
                </div>

                <div>
                  <label htmlFor="comuna" className="block text-sm font-medium text-gray-700 mb-1">Comuna:</label>
                  <select
                    id="comuna"
                    className={baseInput}
                    value={comunaId}
                    onChange={(e) => {
                      const v = e.target.value;
                      const next = v === '' ? '' : Number(v);
                      setComunaId(Number.isNaN(next) ? '' : next);
                    }}
                    disabled={regionId === '' || loadingComunas || !!errorComunas}
                  >
                    <option value="">
                      {regionId === '' ? 'Selecciona primero una región…' : loadingComunas ? 'Cargando comunas…' : 'Selecciona comuna…'}
                    </option>
                    {errorComunas && <option value="" disabled>{errorComunas}</option>}
                    {comunas.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                  </select>
                </div>

                <div>
                  <label htmlFor="calle" className="block text-sm font-medium text-gray-700 mb-1">Calle:</label>
                  <input type="text" id="calle" name="calle" className={baseInput} />
                </div>

                <div>
                  <label htmlFor="numero" className="block text-sm font-medium text-gray-700 mb-1">Número:</label>
                  <input type="number" id="numero" name="numero" min={0} className={baseInput} />
                </div>

                <div>
                  <label htmlFor="depto" className="block text-sm font-medium text-gray-700 mb-1">Número Departamento</label>
                  <input type="text" id="depto" name="depto" placeholder="(opcional)" className={baseInput} />
                </div>

                <div className="md:col-span-3">
                  <label htmlFor="referencia" className="block text-sm font-medium text-gray-700 mb-1">Referencia:</label>
                  <input type="text" id="referencia" name="referencia" className={baseInput} />
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

              <div className="grid sm:grid-cols-3 gap-3 mb-4">
                {clasificaciones.map((cls) => (
                  <SelectableCard
                    key={cls.id}
                    selected={clasificacionId === cls.id}
                    onClick={() => { setClasificacionId(cls.id); setSubtipoId(''); }}
                    icon={Home}
                    label={cls.nombre ?? cls.label ?? `Clasificación ${cls.id}`}
                  />
                ))}
              </div>

              {clasificacionId !== '' && (
                <div className="grid sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    {/* Renombrado a "Clave Radial" */}
                    <label htmlFor="subtipo" className="block text-sm font-medium text-gray-700 mb-1">
                      Clave Radial (según clasificación seleccionada):
                    </label>
                    <select
                      id="subtipo"
                      className={baseInput}
                      value={subtipoId}
                      onChange={(e) => {
                        const v = e.target.value;
                        const next = v === '' ? '' : Number(v);
                        setSubtipoId(Number.isNaN(next) ? '' : next);
                        // Opcional: limpiar campos dependientes
                        setTipoIncendioEnabled(false); setTipoIncendioId('');
                        setFaseEnabled(false); setFaseId('');
                      }}
                      disabled={loadingSubtipos || !!errorSubtipos}
                    >
                      <option value="">{loadingSubtipos ? 'Cargando claves…' : 'Selecciona clave radial…'}</option>
                      {errorSubtipos && <option value="" disabled>{errorSubtipos}</option>}
                      {subtipos.map((st) => (
                        <option key={st.id} value={st.id}>
                          {st.claveRadial ?? st.codigoRadial ?? `Clave ${st.id}`}
                        </option>
                      ))}
                    </select>
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
                            selected={tipoIncendioId === t.id}
                            onClick={() => setTipoIncendioId(t.id)}
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
                            selected={faseId === f.id}
                            onClick={() => setFaseId(f.id)}
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
                <div className="mt-8">
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
                <>
                  <div className="mt-10">
                    <div className="text-sm font-medium text-gray-900 mb-3">Vehículos involucrados</div>
                  </div>
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
                </>
              )}
            </Card>
          </>
        )}

        {/* ---------- TAB 2: Material mayor ---------- */}
        {activeTabIdx === 2 && (
          <Card title="7. Material mayor y bomberos a cargo" titleIcon={<Users className="text-blue-600" />}>
            <div className="grid sm:grid-cols-1 gap-4">
              {materialMayor.map((row, idx) => {
                const usedUnidadIds = materialMayor.map(r => r.unidadId).filter(Boolean).map(String);
                const usedConductorIds = materialMayor.map(r => r.conductorId).filter(Boolean).map(String);
                const unidadesDisponibles = carros.filter(u => !usedUnidadIds.includes(String(u.id)) || String(row.unidadId) === String(u.id));
                const conductoresDisponibles = conductores.filter(c => !usedConductorIds.includes(String(c.id)) || String(row.conductorId) === String(c.id));
                return (
                  <UnidadCard
                    key={row.id}
                    value={row}
                    index={idx}
                    onChange={(next) => updateUnidad(idx, next)}
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
              <div className="grid sm:grid-cols-2 gap-4">
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
              <div className="grid sm:grid-cols-1 gap-4">
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
                        {bomberosLugarFiltrados.map((b) => {
                          const present = !!asistenciaLugar[b.id];
                          const disabledRow = !companiaId || loadingBomberos;
                          return (
                            <tr key={b.id} className="border-t">
                              <td className="px-3 py-2">{nombreBombero(b)}</td>
                              <td className="px-3 py-2">
                                <Switch
                                  id={`switch-lugar-${b.id}`}
                                  checked={present}
                                  onChange={(val) => toggleLugar(b.id, val)}
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
                          const present = !!asistenciaCuartel[b.id];
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
              className="inline-flex items-center rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              title="Anterior"
            >
              Anterior
            </button>
            <button
              type="button"
              onClick={goNext}
              disabled={isLast}
              className="inline-flex items-center rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              title="Siguiente"
            >
              Siguiente
            </button>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 text-white px-4 py-2 text-sm hover:bg-blue-700 disabled:opacity-50"
            title="Guardar parte"
          >
            {submitting ? 'Guardando…' : 'Guardar parte'}
          </button>
        </div>
      </div>
    </form>
  );
};

export default CrearParte;
