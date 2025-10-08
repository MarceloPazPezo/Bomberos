import React, { useEffect, useMemo, useState, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { obtenerParteEmergenciaPorId } from '../services/parteEmergencia.service.js';
import { obtenerUltimoEstadoIncidente } from '@services/parteEmergencia.service.js';
import { cambiarEstadoIncidente } from '@services/incidentes.service.js';
import { getCompaniaById } from '@services/compania.service.js';
import { getRegiones, getComunas } from '@services/direccion.service.js';
import { AuthContext } from '../context/AuthContext.jsx';
import { getClasificacionesEmergencia, getSubtiposIncidente, getTiposDano, getFasesIncidente } from '@services/subtipoIncidente.service.js';
import { getBomberosPorCompania } from '@services/bombero.service.js';
import { getCarrosByCompania } from '@services/carro.service.js';
import { getServicios } from '@services/servicios.service.js';
import DateDisplay from '@components/DateDisplay';
import LoadingPage from '@components/LoadingPage';
import { toast } from 'react-toastify';
import {
  MapPin,
  Calendar,
  Radio,
  Building2,
  Car,
  Users,
  ClipboardList,
  ArrowLeft,
  Shield,
  FlameKindling,
  Flag,
  Truck,
  Home,
  Siren,
  User as UserIcon,
  Check
} from 'lucide-react';

/* -------------------------------------------------------------
   UI helpers (versión compacta)
--------------------------------------------------------------*/
const Section = ({ index, title, subtitle, icon, children, className = '' }) => (
  <section className={`bg-white border border-gray-200 rounded-xl p-4 shadow-sm ${className}`}>
    <div className="flex items-center gap-2 mb-3">
      <div className="h-6 w-6 shrink-0 grid place-items-center rounded-full bg-gray-900 text-white text-[10px] font-semibold">
        {index}
      </div>
      <div className="flex items-center gap-1.5">
        {icon}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 tracking-tight">{title}</h3>
          {subtitle && <p className="text-[11px] text-gray-500">{subtitle}</p>}
        </div>
      </div>
    </div>
    <div className="text-[13px] text-gray-800">
      {children}
    </div>
  </section>
);

const KeyStat = ({ label, value }) => (
  <div className="bg-gray-50 border border-gray-200 rounded-md p-2">
    <div className="text-[11px] text-gray-500">{label}</div>
    <div className="text-[13px] font-medium text-gray-900">{value ?? '-'}</div>
  </div>
);

const SmallTable = ({ headers = [], rows = [] }) => (
  <div className="overflow-auto border border-gray-200 rounded-md">
    <table className="min-w-full text-[13px]">
      <thead className="bg-gray-50 text-gray-600">
        <tr>
          {headers.map((h, i) => (
            <th key={i} className="px-2 py-1.5 text-left whitespace-nowrap font-medium text-[12px]">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.length ? rows.map((r, i) => (
          <tr key={i} className="border-t">
            {r.map((c, j) => (
              <td key={j} className="px-2 py-1.5 align-top whitespace-pre-wrap">{c ?? '-'}</td>
            ))}
          </tr>
        )) : (
          <tr>
            <td className="px-2 py-1.5 text-gray-500" colSpan={headers.length}>Sin datos</td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
);

export default function VistaParte() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { bombero } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [parte, setParte] = useState(null);
  const [estadoActual, setEstadoActual] = useState('');
  const [enviando, setEnviando] = useState(false);

  // Utilidad local para formatear fecha a DD-MM-AAAA
  const formatDDMMYYYY = (value) => {
    if (!value) return null;
    const d = new Date(value);
    if (isNaN(d.getTime())) return null;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true); setError('');
        // El backend requiere redactorId como query param
        const redactorId = Number(bombero?.id) || Number(JSON.parse(localStorage.getItem('bombero') || '{}')?.id) || null;
        if (!Number.isInteger(redactorId)) {
          throw new Error("No se pudo determinar el redactor actual (id de usuario).");
        }
        const baseResp = await obtenerParteEmergenciaPorId(id, { idRedactor: redactorId });
        const p = baseResp?.data ?? baseResp;
        if (!p) throw new Error('Parte no encontrado');
        // cargar último estado para habilitar botón ENVIAR si corresponde
        try {
          const estResp = await obtenerUltimoEstadoIncidente(id);
          const e = estResp?.data ?? estResp;
          setEstadoActual((e?.estado || '').toString().toUpperCase());
        } catch { setEstadoActual(''); }

        const [
          regiones,
          clasificaciones,
          tiposDano,
          fases,
          companiasDetalle,
          bomberos,
          carros,
          servicios,
          comunas
        ] = await Promise.all([
          getRegiones().catch(() => []),
          getClasificacionesEmergencia().catch(() => []),
          getTiposDano().catch(() => []),
          getFasesIncidente().catch(() => []),
          p.companiaId ? getCompaniaById(p.companiaId).catch(() => null) : Promise.resolve(null),
          p.companiaId ? getBomberosPorCompania(p.companiaId).catch(() => []) : Promise.resolve([]),
          p.companiaId ? getCarrosByCompania(p.companiaId).catch(() => []) : Promise.resolve([]),
          getServicios().catch(() => []),
          p.regionId ? getComunas(p.regionId).catch(() => []) : Promise.resolve([]),
        ]);

        const subtipos = p.clasificacionId ? await getSubtiposIncidente(p.clasificacionId).catch(() => []) : [];

        const findById = (arr, id) => Array.isArray(arr) ? arr.find(x => String(x.id) === String(id)) : undefined;
        const companiaObj = companiasDetalle?.data ?? companiasDetalle ?? null;
        const clasificacionObj = findById(clasificaciones, p.clasificacionId) || null;
        const subtipoObj = findById(subtipos, p.subtipoId) || null;
        const tipoDanoObj = findById(tiposDano, p.tipoIncendioId) || null;
        const faseObj = findById(fases, p.faseId) || null;
        const regionObj = findById(regiones, p.regionId) || null;
        const comunaObj = findById(comunas, p.comunaId) || null;
        const bomberoById = (id) => {
          const b = findById(bomberos, id);
          if (!b) return id ? { id, nombreCompleto: `Bombero #${id}` } : null;
          const nombreCompleto = [b.nombres, b.apellidos].filter(Boolean).join(' ').trim() || `Bombero #${b.id}`;
          return { id: b.id, nombreCompleto, run: b.run };
        };
        const carroById = (id) => {
          const c = findById(carros, id);
          return c ? { id: c.id, patente: c.patente } : (id ? { id, patente: null } : null);
        };
        const servicioById = (id) => {
          const s = findById(servicios, id);
          return s ? { id: s.id, nombre: s.nombre } : (id ? { id, nombre: null } : null);
        };

        const parteDet = {
          id: p.id,
          compania: companiaObj ? { id: companiaObj.id, nombre: companiaObj.nombre } : (p.companiaId ? { id: p.companiaId, nombre: null } : null),
          fecha: p.fecha || null,
          horaDespacho: p.horaDespacho || null,
          hora6_0: p.hora6_0 || null,
          hora6_3: p.hora6_3 || null,
          hora6_9: p.hora6_9 || null,
          hora6_10: p.hora6_10 || null,
          descripcionPreliminar: p.descripcionPreliminar || '',
          direccion: {
            calle: p.calle || '',
            numero: p.numero || '',
            depto: p.depto || null,
            referencia: p.referencia || null,
            comuna: comunaObj ? { id: comunaObj.id, nombre: comunaObj.nombre } : (p.comunaId ? { id: p.comunaId, nombre: null } : null),
            region: regionObj ? { id: regionObj.id, nombre: regionObj.nombre } : (p.regionId ? { id: p.regionId, nombre: null } : null),
          },
          clasificacion: clasificacionObj ? { id: clasificacionObj.id, nombre: clasificacionObj.nombre } : (p.clasificacionId ? { id: p.clasificacionId, nombre: null } : null),
          subtipo: subtipoObj ? { id: subtipoObj.id, claveRadial: subtipoObj.claveRadial, descripcion: subtipoObj.descripcion } : (p.subtipoId ? { id: p.subtipoId } : null),
          incendio: {
            tipo: tipoDanoObj ? { id: tipoDanoObj.id, nombre: tipoDanoObj.nombre } : (p.tipoIncendioId ? { id: p.tipoIncendioId, nombre: null } : null),
            fase: faseObj ? { id: faseObj.id, nombre: faseObj.nombre } : (p.faseId ? { id: p.faseId, nombre: null } : null),
          },
          bomberoACargo: bomberoById(p.bomberoACargoId),
          redactor: bomberoById(p.idRedactor),
          inmuebles: Array.isArray(p.inmuebles) ? p.inmuebles : [],
          vehiculos: Array.isArray(p.vehiculos) ? p.vehiculos : [],
          materialMayor: Array.isArray(p.materialMayor) ? p.materialMayor.map(m => ({
            unidad: carroById(m.unidadId),
            conductor: bomberoById(m.conductorId),
            jefeUnidad: bomberoById(m.bomberoId),
            voluntarios: m.voluntarios ?? null,
            kmSalida: m.kmSalida ?? null,
            kmLlegada: m.kmLlegada ?? null,
          })) : [],
          accidentados: Array.isArray(p.accidentados) ? p.accidentados.map(a => ({
            bombero: bomberoById(a.bomberoId),
            compania: a.companiaId ? ((companiasDetalle?.data ?? companiasDetalle)?.id === a.companiaId ? { id: a.companiaId, nombre: (companiasDetalle?.data ?? companiasDetalle)?.nombre } : { id: a.companiaId, nombre: null }) : null,
            lesiones: a.lesiones || '',
            constancia: a.constancia || '',
            comisaria: a.comisaria || '',
            acciones: a.acciones || '',
          })) : [],
          otrosServicios: Array.isArray(p.otrosServicios) ? p.otrosServicios.map(s => ({
            servicio: servicioById(s.servicioId),
            tipoUnidad: s.tipoUnidad || '',
            responsable: s.responsable || '',
            personal: s.personal ?? null,
            observaciones: s.observaciones || '',
          })) : [],
          asistencia: {
            lugar: Array.isArray(p.asistencia?.lugar) ? p.asistencia.lugar.map(bomberoById) : [],
            cuartel: Array.isArray(p.asistencia?.cuartel) ? p.asistencia.cuartel.map(bomberoById) : [],
          },
          createdAt: p.createdAt,
          updatedAt: p.updatedAt,
          fechaHoraDespacho: p.fechaHoraDespacho
        };

        if (mounted) setParte(parteDet);
      } catch (e) {
        const msg = e?.message || 'No se pudo cargar el parte';
        setError(msg);
        toast.error(msg);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [id, bombero?.id]);

  const direccion = useMemo(() => {
    const calle = parte?.direccion?.calle || '';
    const numero = parte?.direccion?.numero || '';
    return [[calle, numero].filter(Boolean).join(' ')].filter(Boolean).join('');
  }, [parte?.direccion?.calle, parte?.direccion?.numero, parte?.direccion?.referencia]);

  const fechaIncidente = useMemo(() => formatDDMMYYYY(parte?.fecha) || (parte?.fecha ?? '-'), [parte?.fecha]);

  if (loading) return <LoadingPage message="Cargando parte..." />;
  if (error) return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-5 py-6">
      <div className="flex items-center gap-2 mb-3">
        <button className="inline-flex items-center gap-1.5 text-[13px] text-gray-700 hover:text-gray-900" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-3.5 w-3.5" /> Volver
        </button>
      </div>
      <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg">{error}</div>
    </div>
  );
  if (!parte) return null;

  const headerChips = (
    <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
      {parte?.subtipo && (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-amber-200 bg-amber-50 text-amber-800">
          <Radio className="h-3 w-3" /> {parte.subtipo.claveRadial ? `${parte.subtipo.claveRadial} — ${parte.subtipo.descripcion || ''}`.trim() : `Subtipo #${parte.subtipo.id}`}
        </span>
      )}
      {parte?.clasificacion && (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-sky-200 bg-sky-50 text-sky-800">
          <Shield className="h-3 w-3" /> {parte.clasificacion.nombre || `Clasificación #${parte.clasificacion.id}`}
        </span>
      )}
      {parte?.incendio?.tipo && (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-orange-200 bg-orange-50 text-orange-800">
          <FlameKindling className="h-3 w-3" /> {parte.incendio.tipo.nombre || `Tipo Incendio #${parte.incendio.tipo.id}`}
        </span>
      )}
      {parte?.incendio?.fase && (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-fuchsia-200 bg-fuchsia-50 text-fuchsia-800">
          <Flag className="h-3 w-3" /> {parte.incendio.fase.nombre || `Fase #${parte.incendio.fase.id}`}
        </span>
      )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-5 py-6 space-y-4">
      {/* Encabezado (PRIMERA TARJETA) */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2">
            <button className="inline-flex items-center gap-1.5 text-[13px] text-gray-700 hover:text-gray-900" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-3.5 w-3.5" /> Volver
            </button>
            <h1 className="text-xl font-bold text-gray-900">Parte de emergencia #{parte.id}</h1>
            <div className="flex flex-wrap gap-2 text-[13px] text-gray-700">
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-4 w-4 text-gray-500" /> {fechaIncidente}
              </span>
              {direccion && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-4 w-4 text-gray-500" /> {direccion}
                </span>
              )}
              <span className="inline-flex items-center gap-1">
                <Building2 className="h-4 w-4 text-gray-500" /> {parte?.compania?.nombre || `Compañía #${parte?.compania?.id || '-'}`}
              </span>
              {parte?.redactor && (
                <span className="inline-flex items-center gap-1">
                  <UserIcon className="h-4 w-4 text-gray-500" /> Redactor: {parte.redactor.nombreCompleto || `#${parte.redactor.id}`}
                </span>
              )}
            </div>
            {headerChips}
          </div>
          <div className="w-64">
            <DateDisplay fechaCreacion={parte?.createdAt || parte?.fechaHoraDespacho} fechaActualizacion={parte?.updatedAt} />
            {(estadoActual === 'BORRADOR' || estadoActual === 'CORREGIR') && (
              <div className="mt-3">
                <button
                  disabled={enviando}
                  onClick={async () => {
                    try {
                      setEnviando(true);
                      const redactorId = Number(bombero?.id) || Number(JSON.parse(localStorage.getItem('bombero') || '{}')?.id) || null;
                      await cambiarEstadoIncidente(parte.id, { estado: 'ENVIADO', idBombero: redactorId });
                      toast.success('Parte enviado');
                      // refrescar estado actual
                      const estResp = await obtenerUltimoEstadoIncidente(parte.id);
                      const e = estResp?.data ?? estResp;
                      setEstadoActual((e?.estado || '').toString().toUpperCase());
                    } catch (err) {
                      toast.error(err?.message || 'No se pudo enviar el parte');
                    } finally {
                      setEnviando(false);
                    }
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 rounded border border-blue-200 bg-blue-50 text-blue-700 px-3 py-2 hover:bg-blue-100 disabled:opacity-60"
                >
                  Enviar para revisión
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 1. Antecedentes generales */}
      <Section index={1} title="Antecedentes generales" subtitle="Datos operativos y ubicación" icon={<ClipboardList className="h-4 w-4 text-gray-700" />}>
        <div className="grid sm:grid-cols-2 xl:grid-cols-6 gap-2">
          <KeyStat label="Fecha del incidente" value={fechaIncidente} />
          <KeyStat label="Despacho" value={parte.horaDespacho || '-'} />
          <KeyStat label="6-0" value={parte.hora6_0 || '-'} />
          <KeyStat label="6-3" value={parte.hora6_3 || '-'} />
          <KeyStat label="6-9" value={parte.hora6_9 || '-'} />
          <KeyStat label="6-10" value={parte.hora6_10 || '-'} />
        </div>
        <div className="mt-3 grid sm:grid-cols-2 xl:grid-cols-3 gap-2">
          <KeyStat label="Bombero a cargo del incidente" value={parte?.bomberoACargo?.nombreCompleto || (parte?.bomberoACargo?.id ? `#${parte.bomberoACargo.id}` : '-')} />
          <KeyStat label="Redactor" value={parte?.redactor?.nombreCompleto || (parte?.redactor?.id ? `#${parte.redactor.id}` : '-')} />
        </div>
        <div className="mt-3 grid sm:grid-cols-2 xl:grid-cols-5 gap-2">
          <KeyStat label="Calle" value={parte?.direccion?.calle || '-'} />
          <KeyStat label="Número" value={parte?.direccion?.numero || '-'} />
          <KeyStat label="Comuna" value={parte?.direccion?.comuna?.nombre || (parte?.direccion?.comuna?.id ? `#${parte.direccion.comuna.id}` : '-')} />
          <KeyStat label="N° Depto" value={parte?.direccion?.depto || '-'} />
          <KeyStat label="Referencia" value={parte?.direccion?.referencia || '-'} />
        </div>
      </Section>

      {/* 2. Características del incidente */}
      <Section index={2} title="Características del incidente" subtitle="Clasificación, clave radial y fase" icon={<Shield className="h-4 w-4 text-gray-700" />}>
        <div className="grid sm:grid-cols-2 xl:grid-cols-5 gap-2">
          <KeyStat label="Clasificación" value={parte?.clasificacion?.nombre || (parte?.clasificacion?.id ? `#${parte.clasificacion.id}` : '-')} />
          <KeyStat label="Clave radial" value={parte?.subtipo?.claveRadial || (parte?.subtipo?.id ? `#${parte.subtipo.id}` : '-')} />
         
          <KeyStat label="Tipo de incendio" value={parte?.incendio?.tipo?.nombre || (parte?.incendio?.tipo?.id ? `#${parte.incendio.tipo.id}` : '-')} />
          <KeyStat label="Fase" value={parte?.incendio?.fase?.nombre || (parte?.incendio?.fase?.id ? `#${parte.incendio.fase.id}` : '-')} />
         
        </div>
        <div className='grid sm:grid-cols-2 xl:grid-cols-2 gap-2 mt-3'>
           <KeyStat label="Descripción preliminar" value={parte?.descripcionPreliminar || '-'} />
           <KeyStat label="Descripción clave" value={parte?.subtipo?.descripcion || '-'} />
        </div>
      </Section>

      {/* 3. Inmuebles / Vehículos involucrados */}
      {(Array.isArray(parte.inmuebles) && parte.inmuebles.length > 0) || (Array.isArray(parte.vehiculos) && parte.vehiculos.length > 0) ? (
        <Section index={3} title="Inmuebles / Vehículos involucrados" subtitle="Detalle de bienes afectados y su titularidad" icon={<Home className="h-4 w-4 text-gray-700" />}>
          {Array.isArray(parte.inmuebles) && parte.inmuebles.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-2 text-[13px] font-semibold text-gray-700 mb-2"><Building2 className="h-3.5 w-3.5" /> Inmuebles</div>
              <div className="space-y-3">
                {parte.inmuebles.map((inm, i) => {
                  const direccionInm = [[inm?.direccion?.calle || inm?.calle, inm?.direccion?.numero || inm?.numero].filter(Boolean).join(' '), inm?.depto ? `Depto ${inm.depto}` : null].filter(Boolean).join(' · ');
                  return (
                    <div key={i} className="border-2 border-blue-300  rounded-lg p-3 space-y-2.5">
                      <div className="font-medium text-gray-900">{direccionInm || `Inmueble #${i + 1}`}</div>
                      <SmallTable headers={["Tipo", "Pisos", "m² constr.", "m² afect.", "Daños", "Daños Anexos"]} rows={[[inm.tipo_construccion || '-', inm.n_pisos ?? '-', inm.m2_construccion ?? '-', inm.m2_afectado ?? '-', inm.danos_vivienda ?? '-', inm.danos_anexos ?? '-']]} />

                      <div>
                        <div className="text-[13px] font-semibold text-gray-700 mb-1.5">Dueño / Propietario</div>
                        <SmallTable headers={["Nombre", "RUN", "Telefono", "Edad", "Descripcion de Gravedad"]} rows={[[(inm.propietario?.nombreCompleto || inm.dueno?.nombreCompleto) ?? '-', (inm.propietario?.run || inm.dueno?.run) ?? '-', inm.dueno?.telefono ?? '-', inm.dueno?.edad ?? '-', inm.dueno?.descripcionGravedad ?? '-',]]} />
                      </div>


                      <div>
                        <div className="text-[13px] font-semibold text-gray-700 mb-1.5">Habitantes</div>
                        <SmallTable headers={["Nombre", "RUN", "Telefono", "Edad", "Descripcion de Gravedad"]} rows={(Array.isArray(inm.habitantes) ? inm.habitantes : []).map(h => [h?.nombreCompleto ?? '-', h?.run ?? '-', h?.telefono ?? '-', h?.edad ?? '-', h?.descripcionGravedad ?? '-'])} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {Array.isArray(parte.vehiculos) && parte.vehiculos.length > 0 && (
            <div>
              <div className="flex items-center gap-2 text-[13px] font-semibold text-gray-700 mb-2"><Car className="h-3.5 w-3.5" /> Vehículos</div>
              <div className="space-y-3">
                {parte.vehiculos.map((v, i) => (
                  <div key={i} className="border border-gray-200 rounded-lg p-3 space-y-2.5">
                    <div className="font-medium text-gray-900">{[v.marca, v.modelo, v.anio].filter(Boolean).join(' ') || `Vehículo #${i + 1}`}</div>
                    <SmallTable
                      headers={["Patente", "Marca", "Modelo", "Año", "Color", "Daños"]}
                      rows={[[
                        v.patente || '-',
                        v.marca || '-',
                        v.modelo || '-',
                        (v.anio ?? '-'),
                        v.color || '-',
                        v.danos_vehiculo || '-'
                      ]]}
                    />
                    <div className="grid md:grid-cols-2 gap-3">
                      <div>
                        <div className="text-[13px] font-semibold text-gray-700 mb-1.5">Dueño</div>
                        <SmallTable
                          headers={["Nombre", "RUN", "Teléfono", "Edad", "Descripción de Gravedad", "Es empresa"]}
                          rows={[[(v.dueno?.nombreCompleto ?? '-'), (v.dueno?.run ?? '-'), (v.dueno?.telefono ?? '-'), (v.dueno?.edad ?? '-'), (v.dueno?.descripcionGravedad ?? '-'), (typeof v.dueno?.esEmpresa === 'boolean' ? (v.dueno.esEmpresa ? 'Sí' : 'No') : '-')]]}
                        />
                      </div>
                      <div>
                        <div className="text-[13px] font-semibold text-gray-700 mb-1.5">Ocupantes (Chofer y Pasajeros)</div>
                        {(() => {
                          const pasajeros = Array.isArray(v.pasajeros) ? v.pasajeros : [];
                          const ocupantes = [
                            v.chofer ? { ...v.chofer, esChofer: true, vinculo: 'Chofer' } : null,
                            ...pasajeros.map(p => ({ ...p, esChofer: false }))
                          ].filter(Boolean);
                          return (
                            <SmallTable
                              headers={["Chofer", "Nombre", "RUN", "Teléfono", "Edad", "Descripción de Gravedad", "Vínculo", "Es empresa"]}
                              rows={
                                ocupantes.length
                                  ? ocupantes.map(o => [
                                      o.esChofer ? <Check className="h-4 w-4 text-emerald-600" /> : null,
                                      o?.nombreCompleto ?? '-',
                                      o?.run ?? '-',
                                      o?.telefono ?? '-',
                                      o?.edad ?? '-',
                                      o?.descripcionGravedad ?? '-',
                                      (o?.vinculo?.nombre ?? o?.vinculo ?? (o.esChofer ? 'Chofer' : 'Pasajero')),
                                      (typeof o?.esEmpresa === 'boolean' ? (o.esEmpresa ? 'Sí' : 'No') : '-')
                                    ])
                                  : [[null, '-', '-', '-', '-', '-', '-', '-']]
                              }
                            />
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Section>
      ) : null}

      {/* 4. Material mayor */}
      {Array.isArray(parte.materialMayor) && parte.materialMayor.length > 0 && (
        <Section index={4} title="Material mayor" subtitle="Recursos movilizados" icon={<Truck className="h-4 w-4 text-gray-700" />}>
          <div className="overflow-auto">
            <table className="min-w-full text-[13px]">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-2 py-1.5 text-left">Unidad</th>
                  <th className="px-2 py-1.5 text-left">Conductor</th>
                  <th className="px-2 py-1.5 text-left">Jefe de unidad</th>
                  <th className="px-2 py-1.5 text-left">Voluntarios</th>
                  <th className="px-2 py-1.5 text-left">KM salida</th>
                  <th className="px-2 py-1.5 text-left">KM llegada</th>
                </tr>
              </thead>
              <tbody>
                {parte.materialMayor.map((r, i) => (
                  <tr key={i} className="border-t">
                    <td className="px-2 py-1.5">{r.unidad?.patente || (r.unidad?.id ? `Unidad #${r.unidad.id}` : '-')}</td>
                    <td className="px-2 py-1.5">{r.conductor?.nombreCompleto || (r.conductor?.id ? `Bombero #${r.conductor.id}` : '-')}</td>
                    <td className="px-2 py-1.5">{r.jefeUnidad?.nombreCompleto || (r.jefeUnidad?.id ? `Bombero #${r.jefeUnidad.id}` : '-')}</td>
                    <td className="px-2 py-1.5">{r.voluntarios ?? '-'}</td>
                    <td className="px-2 py-1.5">{r.kmSalida ?? '-'}</td>
                    <td className="px-2 py-1.5">{r.kmLlegada ?? '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      )}

      {/* 5. Otros servicios de emergencia en el lugar */}
      {Array.isArray(parte.otrosServicios) && parte.otrosServicios.length > 0 && (
        <Section index={5} title="Otros servicios de emergencia en el lugar" subtitle="Apoyos externos" icon={<Siren className="h-4 w-4 text-gray-700" />}>
          <div className="overflow-auto">
            <table className="min-w-full text-[13px]">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-2 py-1.5 text-left">Servicio</th>
                  <th className="px-2 py-1.5 text-left">Tipo unidad</th>
                  <th className="px-2 py-1.5 text-left">Responsable</th>
                  <th className="px-2 py-1.5 text-left">Personal</th>
                  <th className="px-2 py-1.5 text-left">Observaciones</th>
                </tr>
              </thead>
              <tbody>
                {parte.otrosServicios.map((s, i) => (
                  <tr key={i} className="border-t">
                    <td className="px-2 py-1.5">{s.servicio?.nombre || `Servicio ${i + 1}`}</td>
                    <td className="px-2 py-1.5">{s.tipoUnidad || '-'}</td>
                    <td className="px-2 py-1.5">{s.responsable || '-'}</td>
                    <td className="px-2 py-1.5">{s.personal ?? '-'}</td>
                    <td className="px-2 py-1.5">{s.observaciones || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      )}

      {/* 6. Bomberos accidentados */}
      {Array.isArray(parte.accidentados) && parte.accidentados.length > 0 && (
        <Section index={6} title="Bomberos accidentados" subtitle="Antecedentes del personal" icon={<Users className="h-4 w-4 text-gray-700" />}>
          <div className="overflow-auto">
            <table className="min-w-full text-[13px]">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-2 py-1.5 text-left">Bombero</th>
                  <th className="px-2 py-1.5 text-left">Compañía</th>
                  <th className="px-2 py-1.5 text-left">Lesiones</th>
                  <th className="px-2 py-1.5 text-left">Constancia</th>
                  <th className="px-2 py-1.5 text-left">Comisaría</th>
                  <th className="px-2 py-1.5 text-left">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {parte.accidentados.map((a, i) => (
                  <tr key={i} className="border-t">
                    <td className="px-2 py-1.5">{a.bombero?.nombreCompleto || (a.bombero?.id ? `Bombero #${a.bombero.id}` : '-')}</td>
                    <td className="px-2 py-1.5">{a.compania?.nombre || (a.compania?.id ? `Compañía #${a.compania.id}` : '-')}</td>
                    <td className="px-2 py-1.5">{a.lesiones || '-'}</td>
                    <td className="px-2 py-1.5">{a.constancia || '-'}</td>
                    <td className="px-2 py-1.5">{a.comisaria || '-'}</td>
                    <td className="px-2 py-1.5">{a.acciones || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      )}

      {/* 7. Asistencia a la emergencia */}
      {parte.asistencia && (
        <Section index={7} title="Asistencia a la emergencia" subtitle="Distribución de personal" icon={<Users className="h-4 w-4 text-gray-700" />}>
          <div className="grid sm:grid-cols-2 gap-2">
            <KeyStat label="En el lugar" value={Array.isArray(parte.asistencia.lugar) ? parte.asistencia.lugar.map(x => x?.nombreCompleto || (x?.id ? `Bombero #${x.id}` : '')).filter(Boolean).join(', ') || '-' : '-'} />
            <KeyStat label="En cuartel" value={Array.isArray(parte.asistencia.cuartel) ? parte.asistencia.cuartel.map(x => x?.nombreCompleto || (x?.id ? `Bombero #${x.id}` : '')).filter(Boolean).join(', ') || '-' : '-'} />
          </div>
        </Section>
      )}
    </div>
  );
}
