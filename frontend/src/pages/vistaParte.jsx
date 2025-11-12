import { useEffect, useMemo, useState, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { obtenerParteEmergenciaPorId } from '../services/parteEmergencia.service.js';
import { obtenerUltimoEstadoIncidente } from '@services/parteEmergencia.service.js';
import { cambiarEstadoIncidente } from '@services/incidentes.service.js';
import { getCompaniaById } from '@services/compania.service.js';
import { getRegiones, getComunas, regionService } from '@services/region.service.js';
import { AuthContext } from '../context/AuthContext.jsx';
import { getClasificacionesEmergencia, getSubtiposIncidente, getTiposDano, getFasesIncidente } from '@services/subtipoIncidente.service.js';
import { getBomberosPorCompania } from '@services/bombero.service.js';
import { getCarrosByCompania } from '@services/carro.service.js';
import { getServicios } from '@services/servicios.service.js';
import DateDisplay from '@components/DateDisplay';
import LoadingPage from '@components/LoadingPage';
import { toast } from 'react-toastify';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Card } from 'primereact/card';
import { Divider } from 'primereact/divider';
import { Timeline } from 'primereact/timeline';
import { Avatar } from 'primereact/avatar';
import { Badge } from 'primereact/badge';
import {
  MapPin,
  Calendar,
  Radio,
  Building2,
  Car,
  Users,
  ArrowLeft,
  Shield,
  FlameKindling,
  Flag,
  Home,
  Siren,
  User as UserIcon
} from 'lucide-react';

export default function VistaParte({ showEnviarButton = true }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { bombero } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [parte, setParte] = useState(null);
  const [estadoActual, setEstadoActual] = useState('');
  const [enviando, setEnviando] = useState(false);
  // Row expansion states
  const [expandedInmuebles, setExpandedInmuebles] = useState(null);
  const [expandedVehiculos, setExpandedVehiculos] = useState(null);

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
          comunas,
          comunaDetalle
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
          p.comunaId ? regionService.getComunaById(p.comunaId).catch(() => null) : Promise.resolve(null),
        ]);

        const subtipos = p.clasificacionId ? await getSubtiposIncidente(p.clasificacionId).catch(() => []) : [];

        // Cargar bomberos y compañías de los accidentados
        const accidentadosCompaniaIds = Array.isArray(p.accidentados) 
          ? [...new Set(p.accidentados.map(a => a.companiaId).filter(Boolean))]
          : [];
        
        const accidentadosCompanias = await Promise.all(
          accidentadosCompaniaIds.map(id => getCompaniaById(id).catch(() => null))
        );

        const accidentadosBomberosPorCompania = await Promise.all(
          accidentadosCompaniaIds.map(id => getBomberosPorCompania(id).catch(() => []))
        );

        // Crear un mapa de compañías y bomberos de accidentados
        const companiaMap = {};
        const bomberoMap = {};
        
        accidentadosCompaniaIds.forEach((companiaId, idx) => {
          const companiaData = accidentadosCompanias[idx];
          if (companiaData) {
            const comp = companiaData?.data ?? companiaData;
            companiaMap[companiaId] = { id: comp.id, nombre: comp.nombre };
          }
          
          const bomberosData = accidentadosBomberosPorCompania[idx];
          if (Array.isArray(bomberosData)) {
            bomberosData.forEach(b => {
              const nombreCompleto = [b.nombres, b.apellidos].filter(Boolean).join(' ').trim() || null;
              bomberoMap[b.id] = { id: b.id, nombreCompleto, run: b.run };
            });
          }
        });

        const findById = (arr, id) => Array.isArray(arr) ? arr.find(x => String(x.id) === String(id)) : undefined;
        const companiaObj = companiasDetalle?.data ?? companiasDetalle ?? null;
        const clasificacionObj = findById(clasificaciones, p.clasificacionId) || null;
        const subtipoObj = findById(subtipos, p.subtipoId) || null;
        const tipoDanoObj = findById(tiposDano, p.tipoIncendioId) || null;
        const faseObj = findById(fases, p.faseId) || null;
        const regionObj = findById(regiones, p.regionId) || null;
        // Usar comunaDetalle (cargada por ID) o buscar en comunas (cargadas por región)
        const comunaDetalleData = comunaDetalle?.data ?? comunaDetalle;
        const comunaObj = comunaDetalleData || findById(comunas, p.comunaId) || null;
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
            bombero: bomberoMap[a.bomberoId] || (a.bomberoId ? { id: a.bomberoId, nombreCompleto: null } : null),
            compania: companiaMap[a.companiaId] || (a.companiaId ? { id: a.companiaId, nombre: null } : null),
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
  }, [parte?.direccion?.calle, parte?.direccion?.numero]);

  const fechaIncidente = useMemo(() => formatDDMMYYYY(parte?.fecha) || (parte?.fecha ?? '-'), [parte?.fecha]);
  // Formatea "HH:MM:SS" o "HH:MM" a solo "HH:MM"
  const formatHHMM = (value) => {
    if (!value) return '-';
    const parts = String(value).split(':');
    if (parts.length < 2) return String(value);
    const h = parts[0]?.padStart(2, '0') ?? '';
    const m = parts[1]?.padStart(2, '0') ?? '';
    return `${h}:${m}`;
  };
  const timelineItems = useMemo(() => ([
    { label: '6-0', time: parte?.hora6_0 || '-' },
    { label: '6-3', time: parte?.hora6_3 || '-' },
    { label: '6-9', time: parte?.hora6_9 || '-' },
    { label: '6-10', time: parte?.hora6_10 || '-' },
  ]), [parte?.hora6_0, parte?.hora6_3, parte?.hora6_9, parte?.hora6_10]);


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
            {showEnviarButton && (estadoActual === 'BORRADOR' || estadoActual === 'CORREGIR') && (
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

      {/* 1. Antecedentes generales (PrimeReact, clave:valor) */}
      <Card className="shadow-sm border border-gray-200" title="Antecedentes generales" >

       
        <div className="flex items-stretch gap-4 text-base text-gray-900">
          {/* Columna izquierda: datos generales */}
          <div className="flex-1 flex flex-col gap-2">
            <div className="flex items-center gap-3"><i className="pi pi-building text-2xl text-gray-700" /><span className="font-semibold">Compañía:</span><span>{parte?.compania?.nombre || (parte?.compania?.id ? `#${parte?.compania?.id}` : '-')}</span></div>
            <div className="flex items-center gap-3"><i className="pi pi-calendar text-2xl text-gray-700" /><span className="font-semibold">Fecha del despacho:</span><span>{fechaIncidente}</span></div>
            <div className="flex items-center gap-3"><i className="pi pi-clock text-2xl text-gray-700" /><span className="font-semibold">Hora de despacho:</span><span>{parte?.horaDespacho || '-'}</span></div>
          </div>
          {/* Divisor vertical */}
          <Divider layout="vertical" className="mx-2" />
          {/* Columna derecha: ubicación */}
          <div className="flex-1 flex flex-col gap-2">
            <div className="flex items-center gap-3"><i className="pi pi-map-marker text-2xl text-gray-700" /><span className="font-semibold">Dirección:</span><span>{direccion || '-'}</span></div>
            <div className="flex items-center gap-3"><i className="pi pi-compass text-2xl text-gray-700" /><span className="font-semibold">Comuna:</span><span>{parte?.direccion?.comuna?.nombre || '-'}</span></div>
            <div className="flex items-center gap-3"><i className="pi pi-building text-2xl text-gray-700" /><span className="font-semibold">Depto:</span><span>{parte?.direccion?.depto || '-'}</span></div>
            <div className="flex items-center gap-3"><i className="pi pi-info-circle text-2xl text-gray-700" /><span className="font-semibold">Referencia:</span><span>{parte?.direccion?.referencia || '-'}</span></div>
          </div>
        </div>


        <Divider align="left" type="solid">
          <span className=" text-gray-600">Responsables</span>
        </Divider>
        <div className="grid sm:grid-cols-2 gap-4 mb-3">
          <div className="flex items-center gap-3">
            <Avatar label={(parte?.bomberoACargo?.nombreCompleto || 'B')[0]} className="bg-indigo-100 text-indigo-700" shape="circle" size="large" />
            <div className="text-lg font-semibold text-gray-900">{parte?.bomberoACargo?.nombreCompleto || (parte?.bomberoACargo?.id ? `#${parte.bomberoACargo.id}` : '-')}</div>
            <Badge value="A cargo" severity="info" className="ml-1" />
          </div>
          <div className="flex items-center gap-3">
            <Avatar label={(parte?.redactor?.nombreCompleto || 'R')[0]} className="bg-emerald-100 text-emerald-700" shape="circle" size="large" />
            <div className="text-lg font-semibold text-gray-900">{parte?.redactor?.nombreCompleto || (parte?.redactor?.id ? `#${parte.redactor.id}` : '-')}</div>
            <Badge value="Redactor" severity="success" className="ml-1" />
          </div>
        </div>






        <Divider align="left" type="solid">
          <span className=" text-gray-600">Linea de Tiempo</span>
        </Divider>
        <div className="flex flex-col gap-2 mb-1">
          <Timeline
            value={timelineItems}
            layout="horizontal"
            align="bottom"
            opposite={(item) => <span className="text-[16px] text-gray-600 font-medium">{formatHHMM(item.time)} </span>}
            content={(item) => <span className="text-[14px] text-gray-900 font-semibold">{item.label}</span>}
          />
        </div>


        <Divider align="left" type="solid">Descripción preliminar</Divider>
        <div className="text-base text-gray-900 whitespace-pre-wrap">{parte?.descripcionPreliminar || '-'}</div>
      </Card>

      {/* 2. Características del incidente (PrimeReact) */}
      <Card className="shadow-sm border border-gray-200" title="Características del incidente" >
        {/* Formato tipo formulario en 2 columnas */}
        <div className="grid sm:grid-cols-2 gap-x-6 gap-y-3 text-base text-gray-900 mb-3">
          {parte?.clasificacion && (
            <div className="flex items-center gap-3">
     
              <span className="font-semibold">Clasificación:</span>
              <span>{parte.clasificacion.nombre || `#${parte.clasificacion.id}`}</span>
            </div>
          )}
          {parte?.subtipo && (
            <div className="flex items-center gap-3">
              <i className="pi pi-bolt text-2xl text-gray-700" />
              <span className="font-semibold">Clave radial:</span>
              <span>{parte.subtipo.claveRadial ? `${parte.subtipo.claveRadial} `.trim() : `Subtipo #${parte.subtipo.id}`}</span>
            </div>
          )}
          {parte?.incendio?.tipo && (
            <div className="flex items-center gap-3">
        
              <span className="font-semibold">Tipo de incendio:</span>
              <span>{parte.incendio.tipo.nombre || `#${parte.incendio.tipo.id}`}</span>
            </div>
          )}
          {parte?.incendio?.fase && (
            <div className="flex items-center gap-3">
              <i className="pi pi-flag text-2xl text-gray-700" />
              <span className="font-semibold">Fase:</span>
              <span>{parte.incendio.fase.nombre || `#${parte.incendio.fase.id}`}</span>
            </div>
          )}

        </div>
        <Divider align="left" type="solid">Descripción Tipo de Emergencia</Divider>
        <div className="text-base text-gray-900 whitespace-pre-wrap">{parte.subtipo.descripcion || '-'}</div>




      </Card>

      {/* 3. Inmuebles / Vehículos involucrados */}
      {(Array.isArray(parte.inmuebles) && parte.inmuebles.length > 0) || (Array.isArray(parte.vehiculos) && parte.vehiculos.length > 0) ? (
        <Card className="shadow-sm border border-gray-200" 
          title={
            <div className="flex items-center gap-2">
              <Home className="h-4 w-4 text-gray-700" />
              <span>Inmuebles / Vehículos involucrados</span>
            </div>
          }
          subTitle={<span className="text-gray-600">Detalle de bienes afectados y su titularidad</span>}
        >
          {Array.isArray(parte.inmuebles) && parte.inmuebles.length > 0 && (() => {
            const inmueblesData = parte.inmuebles.map((inm, i) => ({ __id: i, ...inm }));
            const direccionBody = (row) => {
              const dir = [[row?.direccion?.calle || row?.calle, row?.direccion?.numero || row?.numero].filter(Boolean).join(' '), row?.depto ? `Depto ${row.depto}` : null].filter(Boolean).join(' · ');
              return dir || `Inmueble #${(row.__id ?? 0) + 1}`;
            };
            const expansion = (row) => (
              <div className="p-2 text-[13px] space-y-3">
                <div>
                  <div className="text-[13px] font-semibold text-gray-700 mb-1.5">Dueño / Propietario</div>
                  <div className="border border-gray-200 rounded-md">
                    <DataTable value={[{ 
                      nombre: (row.propietario?.nombreCompleto || row.dueno?.nombreCompleto) ?? '-',
                      run: (row.propietario?.run || row.dueno?.run) ?? '-',
                      telefono: row.dueno?.telefono ?? '-',
                      edad: row.dueno?.edad ?? '-',
                      gravedad: row.dueno?.descripcionGravedad ?? '-',
                    }]} size="small">
                      <Column field="nombre" header="Nombre" />
                      <Column field="run" header="RUN" />
                      <Column field="telefono" header="Telefono" />
                      <Column field="edad" header="Edad" />
                      <Column field="gravedad" header="Descripcion de Gravedad" />
                    </DataTable>
                  </div>
                </div>
                <div>
                  <div className="text-[13px] font-semibold text-gray-700 mb-1.5">Habitantes</div>
                  <div className="border border-gray-200 rounded-md">
                    <DataTable value={
                      (Array.isArray(row.habitantes) && row.habitantes.length > 0)
                        ? row.habitantes.map(h => ({
                          nombre: h?.nombreCompleto ?? '-',
                          run: h?.run ?? '-',
                          telefono: h?.telefono ?? '-',
                          edad: h?.edad ?? '-',
                          gravedad: h?.descripcionGravedad ?? '-',
                        }))
                        : [{ nombre: '-', run: '-', telefono: '-', edad: '-', gravedad: '-' }]
                    } size="small">
                      <Column field="nombre" header="Nombre" />
                      <Column field="run" header="RUN" />
                      <Column field="telefono" header="Telefono" />
                      <Column field="edad" header="Edad" />
                      <Column field="gravedad" header="Descripcion de Gravedad" />
                    </DataTable>
                  </div>
                </div>
              </div>
            );
            return (
              <div className="mb-4">
                <div className="flex items-center gap-2 text-[13px] font-semibold text-gray-700 mb-2"><Building2 className="h-3.5 w-3.5" /> Inmuebles</div>
                <DataTable value={inmueblesData} dataKey="__id" expandedRows={expandedInmuebles} onRowToggle={(e) => setExpandedInmuebles(e.data)} rowExpansionTemplate={expansion} size="small" paginator rows={5} className="border border-gray-200 rounded-md">
                  <Column expander style={{ width: '2.5rem' }} />
                  <Column header="Dirección" body={direccionBody} style={{ minWidth: '14rem' }} />
                  <Column field="tipo_construccion" header="Tipo" style={{ minWidth: '8rem' }} />
                  <Column field="n_pisos" header="Pisos" style={{ minWidth: '6rem' }} />
                  <Column field="m2_construccion" header="m² constr." style={{ minWidth: '7rem' }} />
                  <Column field="m2_afectado" header="m² afect." style={{ minWidth: '7rem' }} />
                  <Column field="danos_vivienda" header="Daños" style={{ minWidth: '10rem' }} />
                  <Column field="danos_anexos" header="Daños Anexos" style={{ minWidth: '10rem' }} />
                </DataTable>
              </div>
            );
          })()}

          {Array.isArray(parte.vehiculos) && parte.vehiculos.length > 0 && (() => {
            const vehiculosData = parte.vehiculos.map((v, i) => ({ __id: i, ...v }));
            const tituloBody = (row) => ([row.marca, row.modelo, row.anio].filter(Boolean).join(' ') || `Vehículo #${(row.__id ?? 0) + 1}`);
            const expansionVeh = (row) => {
              const pasajeros = Array.isArray(row.pasajeros) ? row.pasajeros : [];
              const ocupantes = [
                row.chofer ? { ...row.chofer, esChofer: true, vinculo: 'Chofer' } : null,
                ...pasajeros.map(p => ({ ...p, esChofer: false }))
              ].filter(Boolean);
              return (
                <div className="p-2 text-[13px] space-y-3">
                  <div>
                    <div className="text-[13px] font-semibold text-gray-700 mb-1.5">Dueño</div>
                    <div className="border border-gray-200 rounded-md">
                      <DataTable value={[{
                        nombre: (row.dueno?.nombreCompleto ?? '-'),
                        run: (row.dueno?.run ?? '-'),
                        telefono: (row.dueno?.telefono ?? '-'),
                        edad: (row.dueno?.edad ?? '-'),
                        gravedad: (row.dueno?.descripcionGravedad ?? '-'),
                        esEmpresa: (typeof row.dueno?.esEmpresa === 'boolean' ? (row.dueno.esEmpresa ? 'Sí' : 'No') : '-')
                      }]} size="small">
                        <Column field="nombre" header="Nombre" />
                        <Column field="run" header="RUN" />
                        <Column field="telefono" header="Teléfono" />
                        <Column field="edad" header="Edad" />
                        <Column field="gravedad" header="Descripción de Gravedad" />
                        <Column field="esEmpresa" header="Es empresa" />
                      </DataTable>
                    </div>
                  </div>
                  <div>
                    <div className="text-[13px] font-semibold text-gray-700 mb-1.5">Ocupantes (Chofer y Pasajeros)</div>
                    <div className="border border-gray-200 rounded-md">
                      <DataTable value={
                        ocupantes.length
                          ? ocupantes.map(o => ({
                            chofer: o.esChofer ? 'Sí' : '',
                            nombre: o?.nombreCompleto ?? '-',
                            run: o?.run ?? '-',
                            telefono: o?.telefono ?? '-',
                            edad: o?.edad ?? '-',
                            gravedad: o?.descripcionGravedad ?? '-',
                            vinculo: (o?.vinculo?.nombre ?? o?.vinculo ?? (o.esChofer ? 'Chofer' : 'Pasajero')),
                            esEmpresa: (typeof o?.esEmpresa === 'boolean' ? (o.esEmpresa ? 'Sí' : 'No') : '-')
                          }))
                          : [{ chofer: '', nombre: '-', run: '-', telefono: '-', edad: '-', gravedad: '-', vinculo: '-', esEmpresa: '-' }]
                      } size="small">
                        <Column field="chofer" header="Chofer" />
                        <Column field="nombre" header="Nombre" />
                        <Column field="run" header="RUN" />
                        <Column field="telefono" header="Teléfono" />
                        <Column field="edad" header="Edad" />
                        <Column field="gravedad" header="Descripción de Gravedad" />
                        <Column field="vinculo" header="Vínculo" />
                        <Column field="esEmpresa" header="Es empresa" />
                      </DataTable>
                    </div>
                  </div>
                </div>
              );
            };
            return (
              <div>
                <div className="flex items-center gap-2 text-[13px] font-semibold text-gray-700 mb-2"><Car className="h-3.5 w-3.5" /> Vehículos</div>
                <DataTable value={vehiculosData} dataKey="__id" expandedRows={expandedVehiculos} onRowToggle={(e) => setExpandedVehiculos(e.data)} rowExpansionTemplate={expansionVeh} size="small" paginator rows={5} className="border border-gray-200 rounded-md">
                  <Column expander style={{ width: '2.5rem' }} />
                  <Column header="Vehículo" body={tituloBody} style={{ minWidth: '12rem' }} />
                  <Column field="patente" header="Patente" style={{ minWidth: '8rem' }} />
                  <Column field="color" header="Color" style={{ minWidth: '8rem' }} />
                  <Column field="danos_vehiculo" header="Daños" style={{ minWidth: '10rem' }} />
                </DataTable>
              </div>
            );
          })()}
        </Card>
      ) : null}

      {/* 4. Material mayor */}
      {Array.isArray(parte.materialMayor) && parte.materialMayor.length > 0 && (
        <Card title="Material mayor" subtitle="Recursos movilizados">
          <div className="border border-gray-200 rounded-md">
            <DataTable value={parte.materialMayor.map(r => ({
              unidad: r.unidad?.patente || (r.unidad?.id ? `Unidad #${r.unidad.id}` : '-'),
              conductor: r.conductor?.nombreCompleto || (r.conductor?.id ? `Bombero #${r.conductor.id}` : '-'),
              jefeUnidad: r.jefeUnidad?.nombreCompleto || (r.jefeUnidad?.id ? `Bombero #${r.jefeUnidad.id}` : '-'),
              voluntarios: r.voluntarios ?? '-',
              kmSalida: r.kmSalida ?? '-',
              kmLlegada: r.kmLlegada ?? '-',
            }))} size="small">
              <Column field="unidad" header="Unidad" />
              <Column field="conductor" header="Conductor" />
              <Column field="jefeUnidad" header="Jefe de unidad" />
              <Column field="voluntarios" header="Voluntarios" />
              <Column field="kmSalida" header="KM salida" />
              <Column field="kmLlegada" header="KM llegada" />
            </DataTable>
          </div>
        </Card>
      )}

      {/* 5. Otros servicios de emergencia en el lugar */}
      {Array.isArray(parte.otrosServicios) && parte.otrosServicios.length > 0 && (
        <Card className="shadow-sm border border-gray-200"
          title={<div className="flex items-center gap-2"><Siren className="h-4 w-4 text-gray-700" /> <span>Otros servicios de emergencia en el lugar</span></div>}
          subTitle={<span className="text-gray-600">Apoyos externos</span>}
        >
          <div className="border border-gray-200 rounded-md">
            <DataTable value={parte.otrosServicios.map(s => ({
              servicio: s.servicio?.nombre || '-',
              tipoUnidad: s.tipoUnidad || '-',
              responsable: s.responsable || '-',
              personal: s.personal ?? '-',
              observaciones: s.observaciones || '-',
            }))} size="small">
              <Column field="servicio" header="Servicio" />
              <Column field="tipoUnidad" header="Tipo unidad" />
              <Column field="responsable" header="Responsable" />
              <Column field="personal" header="Personal" />
              <Column field="observaciones" header="Observaciones" />
            </DataTable>
          </div>
        </Card>
      )}

      {/* 6. Bomberos accidentados */}
      {Array.isArray(parte.accidentados) && parte.accidentados.length > 0 && (
        <Card className="shadow-sm border border-gray-200"
          title={<div className="flex items-center gap-2"><Users className="h-4 w-4 text-gray-700" /> <span>Bomberos accidentados</span></div>}
          subTitle={<span className="text-gray-600">Antecedentes del personal</span>}
        >
          <div className="border border-gray-200 rounded-md">
            <DataTable value={parte.accidentados.map(a => ({
              bombero: a.bombero?.nombreCompleto || '-',
              compania: a.compania?.nombre || '-',
              lesiones: a.lesiones || '-',
              constancia: a.constancia || '-',
              comisaria: a.comisaria || '-',
              acciones: a.acciones || '-',
            }))} size="small">
              <Column field="bombero" header="Bombero" />
              <Column field="compania" header="Compañía" />
              <Column field="lesiones" header="Lesiones" />
              <Column field="constancia" header="Constancia" />
              <Column field="comisaria" header="Comisaría" />
              <Column field="acciones" header="Acciones" />
            </DataTable>
          </div>
        </Card>
      )}

      {/* 7. Asistencia a la emergencia */}
      {parte.asistencia && (
        <Card className="shadow-sm border border-gray-200"
          title={<div className="flex items-center gap-2"><Users className="h-4 w-4 text-gray-700" /> <span>Asistencia a la emergencia</span></div>}
          subTitle={<span className="text-gray-600">Distribución de personal</span>}
        >
          <div className="grid sm:grid-cols-2 gap-4">
            {/* En el lugar */}
            <div>
              <div className="flex items-center gap-2 text-[13px] font-semibold text-gray-700 mb-2">
                <Users className="h-3.5 w-3.5" /> En el lugar
              </div>
              <div className="border border-gray-200 rounded-md">
                <DataTable 
                  value={Array.isArray(parte.asistencia.lugar) ? parte.asistencia.lugar.map((x, idx) => ({
                    id: x?.id || idx,
                    nombre: x?.nombreCompleto || (x?.id ? `Bombero #${x.id}` : '-')
                  })) : []} 
                  size="small" 
                  paginator 
                  rows={5}
                  emptyMessage="Sin asistencia en el lugar"
                >
                  <Column field="nombre" header="Bombero" />
                </DataTable>
              </div>
            </div>

            {/* En cuartel */}
            <div>
              <div className="flex items-center gap-2 text-[13px] font-semibold text-gray-700 mb-2">
                <Users className="h-3.5 w-3.5" /> En cuartel
              </div>
              <div className="border border-gray-200 rounded-md">
                <DataTable 
                  value={Array.isArray(parte.asistencia.cuartel) ? parte.asistencia.cuartel.map((x, idx) => ({
                    id: x?.id || idx,
                    nombre: x?.nombreCompleto || (x?.id ? `Bombero #${x.id}` : '-')
                  })) : []} 
                  size="small" 
                  paginator 
                  rows={5}
                  emptyMessage="Sin asistencia en cuartel"
                >
                  <Column field="nombre" header="Bombero" />
                </DataTable>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
