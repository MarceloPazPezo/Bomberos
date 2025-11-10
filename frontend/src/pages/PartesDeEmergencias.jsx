// PartesDeEmergencias.jsx
import React, { useMemo, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getEstadosReportes } from "../services/estadosParte.service.js";
import { getIncidentesResumen } from "../services/incidentes.service.js";
import { borrarIncidente } from "../services/borrarParte.service.js";
import { useAuth } from "@hooks/auth/useAuth";
// PrimeReact
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Calendar as PRCalendar } from 'primereact/calendar';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import Card from '@components/Card';

// 🔰 Iconos
import {
  ClipboardList,
  Kanban,
  Plus,
  Search,
  Eye,
  ChevronLeft,
  ChevronRight,
  X,
  Calendar,
  Radio,
  Pencil,
  FileText,
  Send,
  CheckCircle2,
  Edit3,
  MapPin,
  User,
  Building2,
  Clock,
  Tag,
} from "lucide-react";

/* =========================
  Definición de columnas (dinámicas desde API)
========================= */
// getEstadosReportes() debe devolver arreglo de estados.
// Cada uno se normaliza a: { id?, key, label, dot }

/* =========================
  Datos desde backend
========================= */
const EMPTY_LIST = [];

const TYPE_CHIP = {
  Incendio: "bg-orange-100 text-orange-800",
  Rescate: "bg-sky-100 text-sky-800",
  "Mat. Pelig.": "bg-fuchsia-100 text-fuchsia-800",
  Asistencia: "bg-amber-100 text-amber-800",
};

// 🎨 Colores por estado (para tabs y acentos, NO para tarjetas/filas)
const STYLE_BY_ESTADO = {
  BORRADOR: "border-gray-400 bg-gray-50 text-gray-700",
  ENVIADO: "border-blue-500 bg-blue-50 text-blue-700",
  APROBADO: "border-green-500 bg-green-50 text-green-700",
  CORREGIR: "border-red-500 bg-red-50 text-red-700",
};

// 🧱 Colores del CONTENEDOR por estado (columnas del tablero y wrapper de tabla)
const CONTAINER_STYLE_BY_ESTADO = {
  BORRADOR: "border-gray-300 bg-gray-50",
  ENVIADO: "border-blue-300 bg-blue-50",
  APROBADO: "border-green-300 bg-green-50",
  CORREGIR: "border-red-300 bg-red-50",
};

// 🧩 Iconos por estado
const ICON_BY_ESTADO = {
  BORRADOR: <FileText className="h-4 w-4 text-gray-600" />,
  ENVIADO: <Send className="h-4 w-4 text-blue-600" />,
  APROBADO: <CheckCircle2 className="h-4 w-4 text-green-600" />,
  CORREGIR: <Edit3 className="h-4 w-4 text-red-600" />,
};

// 🎛️ Estilos del encabezado de columna (banda sólida)
const HEADER_STYLE_BY_ESTADO = {
  BORRADOR: "bg-gray-600 text-white",
  ENVIADO: "bg-blue-600 text-white",
  APROBADO: "bg-green-600 text-white",
  CORREGIR: "bg-red-600 text-white",
};

// 🏷️ Chips por estado (para badges dentro del panel)
const CHIP_STYLE_BY_ESTADO = {
  BORRADOR: "bg-gray-100 text-gray-800 border border-gray-200",
  ENVIADO: "bg-blue-50 text-blue-700 border border-blue-200",
  APROBADO: "bg-green-50 text-green-700 border border-green-200",
  CORREGIR: "bg-red-50 text-red-700 border border-red-200",
};

/* =========================
   Tarjeta compacta (GitHub‑like) — NEUTRA
========================= */
function KanbanCard({ parte, onClick }) {
  const desc = parte?.detalle?.descripcionPreliminar || parte?.titulo || "";
  const clave = parte?.detalle?.claveRadial || "";
  const shortDesc = desc && desc.length > 40 ? `${desc.slice(0, 40)} ...` : desc;
  const estadoKey = (parte?.estado || "").toUpperCase();
  const icon = null;

  // Extraer "calle y número" desde direccion (string u objeto)
  const rawDir = parte?.detalle?.direccion;
  const getStreetNumber = (d) => {
    if (!d) return "";
    if (typeof d === "object") {
      const street = d.calle || d.street || d.nombreCalle || d.via || "";
      const number = d.numero || d.number || d.num || "";
      return `${street}${number ? ` ${number}` : ""}`.trim();
    }
    const first = String(d).split(",")[0]?.trim();
    return first || "";
  };
  const streetNumber = getStreetNumber(rawDir);
  const lineText = shortDesc ? (streetNumber ? `${shortDesc}, ${streetNumber}` : shortDesc) : (streetNumber || "");

  return (
    <button
      onClick={() => onClick(parte)}
      className="w-full text-left rounded-md border border-gray-200 bg-white text-gray-900 shadow-sm hover:shadow transition p-2"
      title={desc}
    >
      <div className="flex items-center justify-between text-[11px] text-gray-600">
        <span className="inline-flex items-center gap-1 font-mono">
          <Calendar className="h-3.5 w-3.5" />
          {parte?.fecha || ""}
        </span>
        {clave ? (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded border border-amber-200 bg-amber-50 text-amber-800">
            <Radio className="h-3.5 w-3.5" />
            {clave}
          </span>
        ) : null}
      </div>
      <div className="mt-1 text-[13px] line-clamp-1 inline-flex items-center gap-2">
        {icon}
        <span>{lineText}</span>
      </div>
    </button>
  );
}

/* =========================
   Tabla de registros (por estado) — NEUTRA
========================= */
function EstadoTable({ rows, onOpen, containerClass = "" }) {
  const navigate = useNavigate();
  const [deleting, setDeleting] = useState(false);
  
  // Aplanar datos para filtros y sort
  const data = useMemo(() => rows.map(r => ({
    ...r,
    fechaStr: r.fecha || '',
    claveRadial: r?.detalle?.claveRadial || '',
    descripcionText: r?.detalle?.descripcionPreliminar || r?.titulo || '',
  })), [rows]);

  // Filtros locales
  const [globalFilter, setGlobalFilter] = useState('');
  const [claveFilter, setClaveFilter] = useState(null);
  const [descFilter, setDescFilter] = useState('');
  const [dateFilter, setDateFilter] = useState(null);

  // Opciones únicas para Dropdown de clave radial
  const claveOptions = useMemo(() => {
    const set = new Set();
    for (const r of data) {
      if (r.claveRadial) set.add(r.claveRadial);
    }
    return Array.from(set).sort().map(v => ({ label: v, value: v }));
  }, [data]);

  const header = (
    <div className="flex flex-col gap-2 p-2 text-sm">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 items-center">
        <div className="flex items-center gap-2">
          <i className="pi pi-calendar text-gray-500" />
          <PRCalendar
            value={dateFilter}
            onChange={(e) => setDateFilter(e.value)}
            dateFormat="yy-mm-dd"
            placeholder="Buscar por fecha"
            inputClassName="w-full"
            showIcon
          />
        </div>
        <div className="flex items-center gap-2">
          <i className="pi pi-bolt text-gray-500" />
          <Dropdown
            value={claveFilter}
            onChange={(e) => setClaveFilter(e.value)}
            options={claveOptions}
            placeholder="Filtrar por clave radial"
            className="w-full"
            showClear
            filter
          />
        </div>
        <div className="flex items-center gap-2 md:col-span-2">
          <i className="pi pi-search text-gray-500" />
          <InputText
            value={descFilter}
            onChange={(e) => setDescFilter(e.target.value)}
            placeholder="Buscar por descripción"
            className="w-full"
          />
        </div>
      </div>
    </div>
  );

  const filtered = useMemo(() => {
    let arr = data;
    if (dateFilter) {
      const y = dateFilter.getFullYear();
      const m = String(dateFilter.getMonth() + 1).padStart(2, '0');
      const d = String(dateFilter.getDate()).padStart(2, '0');
      const s = `${y}-${m}-${d}`;
      arr = arr.filter(r => (r.fechaStr || '').startsWith(s));
    }
    if (claveFilter) {
      arr = arr.filter(r => (r.claveRadial || '') === claveFilter);
    }
    if (descFilter.trim()) {
      const q = descFilter.toLowerCase();
      arr = arr.filter(r => (r.descripcionText || '').toLowerCase().includes(q));
    }
    if (globalFilter.trim()) {
      const q = globalFilter.toLowerCase();
      arr = arr.filter(r =>
        (r.fechaStr || '').toLowerCase().includes(q) ||
        (r.claveRadial || '').toLowerCase().includes(q) ||
        (r.descripcionText || '').toLowerCase().includes(q)
      );
    }
    return arr;
  }, [data, dateFilter, claveFilter, descFilter, globalFilter]);

  const accionesBody = (row) => {
    const estadoKey = (row.estado || '').toUpperCase();
    const canEdit = estadoKey === 'BORRADOR' || estadoKey === 'CORREGIR';
    const puedeBorrar = estadoKey === 'BORRADOR' || estadoKey === 'CORREGIR';
    
    const onDelete = async (parte) => {
      if (!parte?.id || deleting) return;
      confirmDialog({
        message: '¿Estás seguro de eliminar este parte? Esta acción no se puede deshacer.',
        header: 'Confirmar eliminación',
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: 'Sí, eliminar',
        rejectLabel: 'Cancelar',
        acceptClassName: 'p-button-danger',
        rejectClassName: 'p-button-text',
        defaultFocus: 'reject',
        accept: async () => {
          try {
            setDeleting(true);
            await borrarIncidente(parte.id);
            // Recargar la página para refrescar datos
            window.location.reload();
          } catch (e) {
            alert(e?.message || 'No se pudo borrar el parte');
          } finally {
            setDeleting(false);
          }
        },
      });
    };

    return (
      <div className="flex items-center gap-1">
        <Button 
          icon="pi pi-eye" 
          className="p-button-sm p-button-text" 
          onClick={() => onOpen(row)} 
          tooltip="Ver"
          tooltipOptions={{ position: 'top' }}
        />
        {canEdit && (
          <Button 
            icon="pi pi-pencil" 
            className="p-button-sm p-button-text p-button-warning" 
            onClick={() => navigate(`/editarparte/${row.id}`)} 
            tooltip="Actualizar"
            tooltipOptions={{ position: 'top' }}
          />
        )}
        {puedeBorrar && (
          <Button 
            icon="pi pi-trash" 
            className="p-button-sm p-button-text p-button-danger" 
            onClick={() => onDelete(row)} 
            tooltip="Eliminar"
            tooltipOptions={{ position: 'top' }}
            disabled={deleting}
          />
        )}
      </div>
    );
  };

  const descripcionBody = (row) => {
    const txt = row.descripcionText || '';
    const short = txt.length > 150 ? txt.slice(0, 150) + '…' : txt;
    return <span title={txt}>{short}</span>;
  };

  return (
    <Card title="Registros" titleIcon={<ClipboardList className="h-4 w-4" />}>
      <div className={`rounded-md border ${containerClass || "border-gray-200 bg-white"}`}>
        <DataTable
          value={filtered}
          dataKey="id"
          paginator rows={8}
          rowsPerPageOptions={[8, 15, 30]}
          size="small"
          sortMode="single"
          sortField="fechaStr" sortOrder={-1}
          header={header}
          emptyMessage="Sin registros"
        >
          <Column field="fechaStr" header="Fecha" sortable style={{ minWidth: '8rem' }}></Column>
          <Column field="claveRadial" header="Clave radial" sortable style={{ minWidth: '8rem' }}></Column>
          <Column field="descripcionText" header="Descripción" body={descripcionBody} style={{ minWidth: '14rem' }}></Column>
          <Column field="tipo" header="Tipo" style={{ minWidth: '7rem' }}></Column>
          <Column field="compania" header="Compañía" style={{ minWidth: '9rem' }}></Column>
          <Column header="Acciones" body={accionesBody} style={{ width: '7rem' }}></Column>
        </DataTable>
      </div>
    </Card>
  );
}

/* =========================
   Panel de detalle (drawer)
========================= */
function DetailPanel({ parte, onClose, onNextPrev, siblings }) {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const handleClose = useCallback(() => {
    setVisible(false);
    // dar tiempo a la animación antes de desmontar
    setTimeout(() => onClose(), 250);
  }, [onClose]);
  const esc = useCallback((e) => {
    if (e.key === "Escape") handleClose();
  }, [handleClose]);
  useEffect(() => {
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, [esc]);
  useEffect(() => {
    if (parte) setVisible(true);
  }, [parte]);

  if (!parte) return null;
  const idx = siblings.findIndex((x) => x.id === parte.id);
  const estadoKey = (parte?.estado || "").toUpperCase();
  const headerStyle = HEADER_STYLE_BY_ESTADO[estadoKey] || "bg-slate-600 text-white";
  const estadoChip = CHIP_STYLE_BY_ESTADO[estadoKey] || "bg-slate-100 text-slate-800 border border-slate-200";
  const canEdit = estadoKey === 'BORRADOR' || estadoKey === 'CORREGIR';

  // Dirección resumida
  const getStreetNumber = (d) => {
    if (!d) return "";
    if (typeof d === "object") {
      const street = d.calle || d.street || d.nombreCalle || d.via || "";
      const number = d.numero || d.number || d.num || "";
      return `${street}${number ? ` ${number}` : ""}`.trim();
    }
    const first = String(d).split(",")[0]?.trim();
    return first || "";
  };
  const streetNumber = getStreetNumber(parte?.detalle?.direccion);
  const prettyEstado = estadoKey ? estadoKey.charAt(0) + estadoKey.slice(1).toLowerCase() : "";
  const puedeBorrar = estadoKey === 'BORRADOR' || estadoKey === 'CORREGIR';
  const onDelete = async () => {
    if (!parte?.id || deleting) return;
    confirmDialog({
      message: '¿Estás seguro de eliminar este parte? Esta acción no se puede deshacer.',
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      acceptClassName: 'p-button-danger',
      rejectClassName: 'p-button-text',
      defaultFocus: 'reject',
      accept: async () => {
        try {
          setDeleting(true);
          await borrarIncidente(parte.id);
          // quitar del listado actual
          onClose();
        } catch (e) {
          alert(e?.message || 'No se pudo borrar el parte');
        } finally {
          setDeleting(false);
        }
      },
    });
  };
  return (
    <>
      <div
        className={`fixed inset-0 bg-black/20 z-40 transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}
        onClick={handleClose}
      />
      <aside className={`fixed right-0 top-0 h-full w-full sm:w-[560px] bg-white z-50 shadow-xl border-l border-gray-200 flex flex-col transform transition-transform duration-300 ease-out ${visible ? 'translate-x-0' : 'translate-x-full'}`}>
        {/* Header con color por estado */}
        <header className={`px-4 py-3 border-b flex items-center justify-between ${headerStyle}`}>
          <div className="text-sm font-semibold inline-flex items-center gap-2">
            {ICON_BY_ESTADO[estadoKey] || <ClipboardList className="h-4 w-4" />}
            <span>Resumen del Reporte</span>
            {prettyEstado && (
              <span className={`ml-2 px-2 py-0.5 text-[11px] rounded-full ${estadoChip} bg-white/15 text-white border-white/30`}>{prettyEstado}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              className="rounded bg-white/10 hover:bg-white/20 text-white px-2 py-1 text-sm inline-flex items-center gap-1 border border-white/20"
              onClick={() => onNextPrev("prev")}
              title="Anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              className="rounded bg-white/10 hover:bg-white/20 text-white px-2 py-1 text-sm inline-flex items-center gap-1 border border-white/20"
              onClick={() => onNextPrev("next")}
              title="Siguiente"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <button
              className="rounded bg-white/10 hover:bg-white/20 text-white px-2 py-1 text-sm inline-flex items-center gap-1 border border-white/20"
              onClick={handleClose}
              title="Cerrar"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </header>

        {/* Contenido */}
        <div className="p-4 overflow-auto text-sm">
          {/* Chips superiores */}
          <div className="flex flex-wrap items-center gap-2">
            {parte.tipo ? (
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded ${TYPE_CHIP[parte.tipo] || "bg-gray-100 text-gray-800"}`}>
                <Tag className="h-3.5 w-3.5" /> {parte.tipo}
              </span>
            ) : null}
            {parte.detalle?.claveRadial ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-amber-200 bg-amber-50 text-amber-800">
                <Radio className="h-3.5 w-3.5" /> {parte.detalle.claveRadial}
              </span>
            ) : null}
            {streetNumber ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-gray-200 bg-gray-50 text-gray-700">
                <MapPin className="h-3.5 w-3.5" /> {streetNumber}
              </span>
            ) : null}
          </div>

          {/* Meta información */}
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-md border border-gray-200 bg-white p-3">
              <div className="text-gray-500 inline-flex items-center gap-1">
                <Clock className="h-4 w-4" /> Fecha
              </div>
              <div className="mt-0.5 font-medium">{parte.fecha || ""}</div>
            </div>
            <div className="rounded-md border border-gray-200 bg-white p-3">
              <div className="text-gray-500 inline-flex items-center gap-1">
                <Building2 className="h-4 w-4" /> Compañía
              </div>
              <div className="mt-0.5 font-medium">{parte.compania || ""}</div>
            </div>
            <div className="rounded-md border border-gray-200 bg-white p-3">
              <div className="text-gray-500 inline-flex items-center gap-1">
                <User className="h-4 w-4" /> Creador
              </div>
              <div className="mt-0.5 font-medium">{parte.creador || ""}</div>
            </div>
            <div className="rounded-md border border-gray-200 bg-white p-3">
              <div className="text-gray-500 inline-flex items-center gap-1">
                <FileText className="h-4 w-4" /> Estado
              </div>
              <div className="mt-0.5">
                {prettyEstado ? (
                  <span className={`px-2 py-0.5 rounded text-xs ${estadoChip}`}>{prettyEstado}</span>
                ) : (
                  <span className="text-gray-700">—</span>
                )}
              </div>
            </div>
          </div>

          {/* Dirección y clave */}
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-md border border-gray-200 bg-white p-3">
              <div className="text-gray-500 inline-flex items-center gap-1">
                <MapPin className="h-4 w-4" /> Dirección
              </div>
              <div className="mt-0.5 wrap-break-word">{parte.detalle?.direccion || ""}</div>
            </div>
            <div className="rounded-md border border-gray-200 bg-white p-3">
              <div className="text-gray-500 inline-flex items-center gap-1">
                <Radio className="h-4 w-4" /> Clave radial
              </div>
              <div className="mt-0.5">{parte.detalle?.claveRadial || ""}</div>
            </div>
          </div>

 

          {/* Descripción */}
          <div className="mt-4">
            <div className="text-gray-500 inline-flex items-center gap-1">
              <FileText className="h-4 w-4" /> Descripción preliminar
            </div>
            <div className="mt-1 whitespace-pre-line wrap-break-word rounded-md border border-gray-200 bg-gray-50 p-3">
              {parte.detalle?.descripcionPreliminar || ""}
            </div>
          </div>

          {/* Acciones */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              className="rounded-md border border-gray-300 px-3 py-2 hover:bg-gray-50 inline-flex items-center justify-center gap-2"
              onClick={() => parte?.id && navigate(`/vistaparte/${parte.id}`)}
            >
              <Eye className="h-4 w-4" /> Ver parte completo
            </button>
            {canEdit && (
              <button
                className="rounded-md bg-blue-600 text-white px-3 py-2 hover:bg-blue-700 inline-flex items-center justify-center gap-2"
                onClick={() => parte?.id && navigate(`/editarparte/${parte.id}`)}
              >
                <Pencil className="h-4 w-4" /> Actualizar parte
              </button>
            )}
            {puedeBorrar && (
              <button
                className="col-span-2 rounded-md bg-red-600 text-white px-3 py-2 hover:bg-red-700 inline-flex items-center justify-center gap-2 disabled:opacity-60"
                onClick={onDelete}
                disabled={deleting}
                title="Eliminar parte (sólo estados Borrador o Corregir)"
              >
                <i className="pi pi-trash" /> {deleting ? 'Eliminando…' : 'Eliminar parte'}
              </button>
            )}
          </div>

          <div className="mt-6 text-xs text-gray-500">
            {idx + 1} de {siblings.length} en esta columna.
          </div>
        </div>
      </aside>
    </>
  );
}

/* =========================
   Página
========================= */
export default function PartesDeEmergencias() {
  const navigate = useNavigate();
  const { bombero } = useAuth();
  const [query, setQuery] = useState("");
  const [items, setItems] = useState(EMPTY_LIST);
  const [selected, setSelected] = useState(null);
  const [columns, setColumns] = useState([]);
  const [loadingCols, setLoadingCols] = useState(true);
  const [errorCols, setErrorCols] = useState(null);
  const [loadingItems, setLoadingItems] = useState(true);
  const [errorItems, setErrorItems] = useState(null);
  // Paginación por columna (kanban)
  const [colPage, setColPage] = useState({});
  const PAGE_SIZE = 8;

  // Tab actual: "BOARD" (kanban) o uno de los estados
  const TABS = useMemo(() => ["BOARD", ...columns.map((c) => c.key)], [columns]);
  const [activeTab, setActiveTab] = useState("BOARD");

  // Cargar columnas desde backend
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoadingCols(true);
        setErrorCols(null);
        const resp = await getEstadosReportes();
        const data = resp?.data ?? resp;
        const palette = [
          "bg-green-500",
          "bg-blue-500",
          "bg-emerald-500",
          "bg-rose-500",
          "bg-amber-500",
          "bg-fuchsia-500",
          "bg-cyan-500",
          "bg-violet-500",
          "bg-teal-500",
          "bg-slate-500",
        ];
        const rawArray = Array.isArray(data) ? data : [];
        const mapped = rawArray.map((e, i) => {
          const id = e?.id ?? e?.idEstado ?? e?.idReporteEstado ?? null;
          const rawKey = e?.codigo ?? e?.key ?? e?.nombre ?? e?.descripcion ?? e;
          const label = e?.nombre ?? e?.label ?? String(rawKey).toUpperCase();
          const key = String(rawKey).toUpperCase();
          return { id, key, label, _idx: i };
        });
        const sorted = mapped.sort((a, b) => {
          const ai = typeof a.id === 'number' ? a.id : Number(a.id);
          const bi = typeof b.id === 'number' ? b.id : Number(b.id);
          const aValid = !Number.isNaN(ai);
          const bValid = !Number.isNaN(bi);
          if (aValid && bValid) return ai - bi;
          if (aValid) return -1;
          if (bValid) return 1;
          return (a._idx ?? 0) - (b._idx ?? 0);
        });
        const cols = sorted.map((e, i) => ({
          id: e.id,
          key: e.key,
          label: e.label,
          dot: palette[i % palette.length],
        }));
        if (mounted) setColumns(cols);
      } catch (err) {
        if (mounted) setErrorCols(err?.message || "Error al cargar estados");
      } finally {
        if (mounted) setLoadingCols(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Cargar incidentes (resumen) desde backend
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoadingItems(true);
        setErrorItems(null);
        const userId = Number(bombero?.id);
        if (!Number.isInteger(userId)) {
          // Si no hay id disponible aún, no consultamos y mostramos vacío temporalmente
          if (mounted) {
            setItems(EMPTY_LIST);
            setLoadingItems(false);
          }
          return;
        }
        const data = await getIncidentesResumen({ redactorId: userId });
        if (!mounted) return;
        const norm = (Array.isArray(data) ? data : []).map(x => ({
          ...x,
          estado: (x.estado || '').toUpperCase(),
          tipo: x.tipo || '',
          compania: x.compania || '',
          creador: x.creador || '',
          fecha: x.fecha || '',
        }));
        setItems(norm);
      } catch (err) {
        if (mounted) setErrorItems(err?.message || 'Error al cargar incidentes');
      } finally {
        if (mounted) setLoadingItems(false);
      }
    })();
    return () => { mounted = false; };
  }, [bombero?.id]);

  // agrupar + filtrar
  const grouped = useMemo(() => {
    const map = Object.fromEntries(columns.map((c) => [c.key, []]));
    for (const p of items) {
      if (!map[p.estado]) map[p.estado] = [];
      map[p.estado].push(p);
    }
    if (!query.trim()) return map;
    const q = query.toLowerCase();
    for (const k of Object.keys(map)) {
      map[k] = map[k].filter((p) =>
        (p.titulo || "").toLowerCase().includes(q) ||
        (p.tipo || "").toLowerCase().includes(q) ||
        (p.compania || "").toLowerCase().includes(q)
      );
    }
    return map;
  }, [items, query, columns]);

  // lista de la pestaña activa (si no es BOARD)
  const activeList = activeTab === "BOARD" ? [] : (grouped[activeTab] || []);

  const handleNextPrev = (dir) => {
    if (!selected) return;
    const col = (grouped[selected.estado] || []);
    const idx = col.findIndex((x) => x.id === selected.id);
    if (idx < 0 || col.length === 0) return;
    const nextIdx = dir === "next" ? (idx + 1) % col.length : (idx - 1 + col.length) % col.length;
    setSelected(col[nextIdx]);
  };

  return (
    <div className="min-h-[80vh]">
      {/* Confirmación global */}
      <ConfirmDialog />
      {/* Header superior con tabs de filtro */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold text-gray-900 inline-flex items-center gap-2">
              <ClipboardList className="h-5 w-5" /> Partes de Emergencias
            </h1>
            <div className="ml-auto flex items-center gap-2">
              <button
                type="button"
                onClick={() => navigate('/crearParte')}
                className="inline-flex items-center gap-2 rounded-md bg-blue-600 text-white px-3 py-1.5 text-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <Plus className="h-4 w-4" /> Crear parte de emergencia
              </button>

              {/* Search input con icono */}
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  placeholder="Filtrar por palabra clave"
                  className="w-72 rounded-md border border-gray-300 bg-white pl-8 pr-3 py-1.5 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-3 flex items-center gap-1 overflow-x-auto">
            <TabButton
              active={activeTab === "BOARD"}
              label={<span className="inline-flex items-center gap-2"><Kanban className="h-4 w-4" /> Tablero</span>}
              onClick={() => setActiveTab("BOARD")}
            />
            {loadingCols && (
              <span className="text-xs text-gray-500 ml-2">Cargando estados…</span>
            )}
            {errorCols && (
              <span className="text-xs text-rose-600 ml-2">{String(errorCols)}</span>
            )}
            {columns.map((c) => (
              <TabButton
                key={c.key}
                active={activeTab === c.key}
                estadoKey={c.key}
                label={
                  <div className="flex items-center gap-2">
                   
                    {c.label}
                    <span className="ml-1 text-[11px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-700">
                      {(grouped[c.key] || []).length}
                    </span>
                  </div>
                }
                onClick={() => setActiveTab(c.key)}
              />
            ))}
            {loadingItems && (
              <span className="text-xs text-gray-500 ml-2">Cargando registros…</span>
            )}
            {errorItems && (
              <span className="text-xs text-rose-600 ml-2">{String(errorItems)}</span>
            )}
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        {activeTab === "BOARD" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {columns.map((col) => {
              const list = grouped[col.key] || [];
              const containerStyle = CONTAINER_STYLE_BY_ESTADO[col.key] || "border-gray-200 bg-gray-50";
              const headerStyle = HEADER_STYLE_BY_ESTADO[col.key] || "bg-slate-500 text-white";
              const total = list.length;
              const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
              const currentPage = Math.min(Math.max(1, colPage[col.key] || 1), totalPages);
              const startIdx = (currentPage - 1) * PAGE_SIZE;
              const pageItems = list.slice(startIdx, startIdx + PAGE_SIZE);
              const goPrev = () => setColPage((p) => ({ ...p, [col.key]: Math.max(1, currentPage - 1) }));
              const goNext = () => setColPage((p) => ({ ...p, [col.key]: Math.min(totalPages, currentPage + 1) }));
              return (
                <section key={col.key} className={`rounded-lg border overflow-hidden ${containerStyle}`}>
                  {/* Encabezado de columna */}
                  <div className={`px-3 py-2 flex items-center justify-between ${headerStyle}`}>
                    <h2 className="text-sm font-semibold">{col.label}</h2>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/20 text-white border border-white/30">
                      {list.length}
                    </span>
                  </div>

                  {/* Contenido de tarjetas */}
                  <div className="p-3 space-y-2 min-h-[60vh] overflow-auto pr-1 bg-white/60">
                    {total === 0 ? (
                      <div className="text-xs italic text-gray-500 px-1 py-2">Sin elementos</div>
                    ) : (
                      pageItems.map((p) => (
                        <KanbanCard key={p.id} parte={p} onClick={setSelected} />
                      ))
                    )}
                  </div>
                  {/* Paginación */}
                  {totalPages > 1 && (
                    <div className="px-3 pb-3 pt-2 bg-white/60 border-t border-white/50 flex items-center justify-between text-[12px]">
                      <span className="text-gray-600">Página {currentPage} de {totalPages}</span>
                      <div className="inline-flex items-center gap-1">
                        <button
                          className="rounded border border-gray-300 bg-white px-2 py-1 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-1"
                          onClick={goPrev}
                          disabled={currentPage <= 1}
                          title="Anterior"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </button>
                        <button
                          className="rounded border border-gray-300 bg-white px-2 py-1 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-1"
                          onClick={goNext}
                          disabled={currentPage >= totalPages}
                          title="Siguiente"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        ) : (
          <EstadoTable
            rows={activeList}
            onOpen={setSelected}
            containerClass={CONTAINER_STYLE_BY_ESTADO[activeTab] || "border-gray-200 bg-white"}
          />
        )}
      </div>

      {/* Panel de detalle */}
      <DetailPanel
        parte={selected}
        onClose={() => setSelected(null)}
        onNextPrev={handleNextPrev}
        siblings={selected ? (grouped[selected.estado] || []) : []}
      />
    </div>
  );
}

/* =========================
   Botón de Tab con colores + iconos
========================= */
function TabButton({ active, label, onClick, estadoKey }) {
  const styleClass = estadoKey ? (STYLE_BY_ESTADO[estadoKey] || "border-gray-200 bg-gray-100 text-gray-700") : "bg-white border-gray-300 text-gray-900";
  const icon = estadoKey ? (ICON_BY_ESTADO[estadoKey] || null) : null;
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 text-sm rounded-md border inline-flex items-center gap-2 ${active
        ? `${styleClass} shadow-sm`
        : "bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-50"}`}
    >
      {icon}
      {label}
    </button>
  );
}
