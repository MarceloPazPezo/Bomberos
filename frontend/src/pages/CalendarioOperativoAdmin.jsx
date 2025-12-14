import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import ReactDOMServer from "react-dom/server";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import "dayjs/locale/es";
import {
  MdCalendarToday,
  MdHelpOutline,
  MdEdit,
  MdDelete,
  MdCake,
  MdCheckCircle,
  MdStar,
} from "react-icons/md";
import Tooltip from "@components/Tooltip.jsx";
import { useAuth } from "@hooks/auth/useAuth";

// Servicios
import {
  getEventos,
  createEvento,
  getTiposEvento,
  updateEvento,
  deleteEvento,
  getEventosRecurrentes,
  obtenerActaEvento,
  guardarActaEvento,
  generarActaEventoPdf,
} from "../services/calendario.service.js";
import { getRegiones, getComunas } from "../services/region.service.js";
import { getDireccion } from "../services/direccion.service.js";

// FullCalendar
import FullCalendar from "@fullcalendar/react";
import interactionPlugin from "@fullcalendar/interaction";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import multiMonthPlugin from "@fullcalendar/multimonth";
import rrulePlugin from "@fullcalendar/rrule";

// PrimeReact
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Calendar as PRCalendar } from "primereact/calendar";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { TabView, TabPanel } from "primereact/tabview";

import { toast } from "react-toastify";
import CalendarToolbar from "@components/calendar/CalendarToolbar";
import CalendarRecToolbar from "@components/calendar/CalendarRecToolbar";
import ProximosEventosPanel from "@components/calendar/ProximosEventosPanel";
import AsistenciaEventoDialog from "@components/calendar/AsistenciaEventoDialog";
import { FC_TRUNCATE_CSS } from "@helpers/calendarCss";
import { buildTipoColorMap, getTipoBgFromMap } from "@helpers/calendarColors";
import { formatHeaderFecha, mapEventosConColores } from "@helpers/calendarFormat";
import {
  mapRecurrentesToEvents,
  computeProximosEventos,
  computeProximosRecurrentes,
} from "@helpers/calendarRecurrentes";
import { showConfirmAlert } from "@helpers/fireAlert.js";

dayjs.extend(localizedFormat);
dayjs.locale("es");

const VISTAS = {
  year: "multiMonthYear",
  month: "dayGridMonth",
  week: "timeGridWeek",
  day: "timeGridDay",
};

const CalendarioOperativo = () => {
  const { bombero, hasPermiso } = useAuth();
  const navigate = useNavigate();
  const calendarRef = useRef(null);

  // Verificar permisos
  const puedeObtenerEventos = hasPermiso("evento:obtener") || hasPermiso("evento:admin");
  const puedeCrearEventos = hasPermiso("evento:crear") || hasPermiso("evento:admin");
  const puedeActualizarEventos = hasPermiso("evento:actualizar") || hasPermiso("evento:admin");
  const puedeEliminarEventos = hasPermiso("evento:eliminar") || hasPermiso("evento:admin");

  // CSS importado desde helper

  // ====== Estado pestaña seleccionada ======
  const [activeIndex, setActiveIndex] = useState(0); // 0: Normal, 1: Recurrentes

  // ====== Estado Calendario Normal (como estaba) ======
  const [loading, setLoading] = useState(false);
  const [eventos, setEventos] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [filtroTipos, setFiltroTipos] = useState([]);
  const [detalleVisible, setDetalleVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedIsRecurrent, setSelectedIsRecurrent] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [direccionDetalle, setDireccionDetalle] = useState(null);
  const [direccionLoading, setDireccionLoading] = useState(false);
  const [direccionError, setDireccionError] = useState(null);
  // ====== Acta de reunión ======
  const [actaDescripcion, setActaDescripcion] = useState("");
  const [actaTemasText, setActaTemasText] = useState(""); // 1 tema por línea
  const [actaLoading, setActaLoading] = useState(false);
  // ====== Asistencia a evento ======
  const [asistenciaVisible, setAsistenciaVisible] = useState(false);
  // Cache de direcciones para "Próximos eventos"
  const [dirCache, setDirCache] = useState({});
  const dirSolicitadasRef = useRef(new Set());

  const [vista, setVista] = useState(VISTAS.month);
  const [dialogoVisible, setDialogoVisible] = useState(false);
  const [form, setForm] = useState({
    titulo: "",
    descripcion: "",
    allDay: false,
    inicio: null,
    fin: null,
    fecha: null, // para allDay
    tipo: null,
    agregarDireccion: false,
    regionId: null,
    comunaId: null,
    calle: "",
    numero: "",
  });

  const [regiones, setRegiones] = useState([]);
  const [comunas, setComunas] = useState([]);
  const [comunasEdit, setComunasEdit] = useState([]);

  // ====== Utilidades de color (compartidas) ======
  const tipoColorMap = useMemo(() => buildTipoColorMap(tipos), [tipos]);

  const getTipoBg = (id) => getTipoBgFromMap(tipoColorMap, id);

  // ====== Cargar tipos y eventos (calendario normal) ======
  useEffect(() => {
    if (!puedeObtenerEventos) {
      setLoading(false);
      return;
    }
    const cargar = async () => {
      setLoading(true);
      try {
        const [ev, tps, regs] = await Promise.all([
          getEventos().catch(() => []),
          getTiposEvento().catch(() => []),
          getRegiones().catch(() => []),
        ]);

        const tiposOpt = (tps?.data || tps || []).map((t) => ({
          label: t?.nombre || t?.name || t?.label || "General",
          value: t?.id || t?.value || t?.codigo || "general",
          color: t?.color || undefined,
        }));
        setTipos(tiposOpt);
        const colorMap = buildTipoColorMap(tiposOpt);
        const getColorForTipo = (tipoId) => colorMap[String(tipoId)];
        const mapped = mapEventosConColores(ev?.data || ev || [], tiposOpt, getColorForTipo);
        setEventos(mapped);

        const regionesArray = regs?.data?.regiones || regs?.regiones || [];
        const regionesOpt = regionesArray.map((r) => ({
          label: r.nombre || r.name,
          value: r.id || r.codigo || r.value,
        }));
        setRegiones(regionesOpt);
      } catch (err) {
        console.error("Error cargando calendario", err);
        toast.error("No se pudieron cargar los eventos");
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, [puedeObtenerEventos]);

  const eventosFiltrados = useMemo(() => {
    if (!filtroTipos || filtroTipos.length === 0) return eventos;
    const set = new Set((filtroTipos || []).map((v) => String(v)));
    return eventos.filter((e) => set.has(String(e.tipoId)));
  }, [eventos, filtroTipos]);

  const proximosEventos = useMemo(
    () => computeProximosEventos(eventosFiltrados, 4),
    [eventosFiltrados]
  );

  // Carga perezosa de direcciones de próximos eventos (si tienen idDireccion)
  useEffect(() => {
    proximosEventos.forEach((e) => {
      const id = e.idDireccion;
      if (!id) return;
      const key = String(id);
      if (
        dirSolicitadasRef.current.has(key) ||
        Object.prototype.hasOwnProperty.call(dirCache, key)
      ) {
        return;
      }
      dirSolicitadasRef.current.add(key);
      getDireccion(id)
        .then((resp) => {
          const data = resp?.data || resp || null;
          setDirCache((prev) => ({ ...prev, [key]: data }));
        })
        .catch(() => {
          setDirCache((prev) => ({ ...prev, [key]: { __error: true } }));
        });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proximosEventos]);

  const onDateClick = (info) => {
    const inicio = dayjs(info.date).hour(10).minute(0).second(0).millisecond(0).toDate();
    const fin = dayjs(info.date).hour(11).minute(0).second(0).millisecond(0).toDate();
    setForm((f) => ({
      ...f,
      titulo: "",
      descripcion: "",
      allDay: false,
      inicio,
      fin,
      fecha: dayjs(info.date).startOf("day").toDate(),
      tipo: null,
      agregarDireccion: false,
      regionId: null,
      comunaId: null,
      calle: "",
      numero: "",
    }));
    setDialogoVisible(true);
  };

  const abrirDialogoCrear = () => {
    if (!puedeCrearEventos) {
      toast.error("No tienes permisos para crear eventos");
      return;
    }
    const baseDate = dayjs();
    const inicio = baseDate.hour(10).minute(0).second(0).millisecond(0).toDate();
    const fin = baseDate.hour(11).minute(0).second(0).millisecond(0).toDate();
    setForm((f) => ({
      ...f,
      titulo: "",
      descripcion: "",
      allDay: false,
      inicio,
      fin,
      fecha: baseDate.startOf("day").toDate(),
      tipo: null,
      agregarDireccion: false,
      regionId: null,
      comunaId: null,
      calle: "",
      numero: "",
    }));
    setDialogoVisible(true);
  };

  const onGuardarEvento = async () => {
    if (!puedeCrearEventos) {
      toast.error("No tienes permisos para crear eventos");
      return;
    }
    try {
      if (!form.titulo || (form.allDay ? !form.fecha : !form.inicio || !form.fin) || !form.tipo) {
        toast.warn("Completa título y fechas");
        return;
      }
      const eventodata = {
        nombre: form.titulo,
        descripcion: form.descripcion || null,
        fechaHoraInicio: form.allDay
          ? dayjs(form.fecha).startOf("day").toISOString()
          : dayjs(form.inicio).toISOString(),
        fechaHoraFin: form.allDay
          ? dayjs(form.fecha).endOf("day").toISOString()
          : dayjs(form.fin).toISOString(),
        esTodoElDia: !!form.allDay,
        idTipoEvento: Number(form.tipo) || form.tipo,
      };

      const direcciondata =
        form.agregarDireccion && form.comunaId && form.calle && form.numero
          ? {
              calle: form.calle,
              numero: String(form.numero),
              idComuna: Number(form.comunaId) || form.comunaId,
            }
          : undefined;

      await createEvento({ eventodata, direcciondata });
      toast.success("Evento creado");
      setDialogoVisible(false);
      // refrescar
      const ev = await getEventos();
      const colorMap = buildTipoColorMap(tipos);
      const getColorForTipo = (tipoId) => colorMap[String(tipoId)];
      const mapped = mapEventosConColores(ev?.data || ev || [], tipos, getColorForTipo);
      setEventos(mapped);
    } catch (err) {
      console.error(err);
      toast.error("No se pudo crear el evento");
    }
  };

  const cambiarVista = (v) => {
    setVista(v);
    const api = calendarRef.current?.getApi?.();
    api?.changeView(v);
  };

  const onEventClick = async (info) => {
    try {
      const ev = info?.event;
      if (!ev) return;
      const data = {
        id: ev.id,
        title: ev.title,
        start: ev.start ?? ev._instance?.range?.start ?? null,
        end: ev.end ?? ev._instance?.range?.end ?? null,
        allDay: ev.allDay,
        backgroundColor: ev.backgroundColor,
        borderColor: ev.borderColor,
        textColor: ev.textColor,
        tipoId: ev.extendedProps?.tipoId ?? null,
        tipoLabel: ev.extendedProps?.tipoLabel ?? undefined,
        descripcion: ev.extendedProps?.descripcion ?? "",
        idDireccion: ev.extendedProps?.idDireccion ?? null,
      };
      setSelectedEvent(data);
      setSelectedIsRecurrent(false);
      setDetalleVisible(true);
      setEditMode(false);
      setEditForm(null);

      setDireccionDetalle(null);
      setDireccionError(null);
      if (data.idDireccion) {
        setDireccionLoading(true);
        try {
          const resp = await getDireccion(data.idDireccion);
          const dir = resp?.data || resp || null;
          setDireccionDetalle(dir);
        } catch {
          setDireccionError("No se pudo cargar la dirección");
        } finally {
          setDireccionLoading(false);
        }
      }
    } catch {
      setSelectedEvent(null);
      setDetalleVisible(false);
    }
  };

  const prefillEditFormFromSelected = () => {
    if (!selectedEvent) return null;
    return {
      titulo: selectedEvent.title || "",
      descripcion: selectedEvent.descripcion || "",
      allDay: !!selectedEvent.allDay,
      inicio: selectedEvent.start ? new Date(selectedEvent.start) : null,
      fin: selectedEvent.end ? new Date(selectedEvent.end) : null,
      fecha: selectedEvent.start ? dayjs(selectedEvent.start).startOf("day").toDate() : null,
      tipo: selectedEvent.tipoId || null,
      agregarDireccion: !!selectedEvent.idDireccion,
      regionId: null,
      comunaId: null,
      calle: direccionDetalle?.calle || "",
      numero: direccionDetalle?.numero || "",
    };
  };

  const onEditClick = async () => {
    if (!puedeActualizarEventos) {
      toast.error("No tienes permisos para editar eventos");
      return;
    }
    const f = prefillEditFormFromSelected();
    setEditForm(f);
    setEditMode(true);

    try {
      let dir = direccionDetalle;
      if (selectedEvent?.idDireccion && !dir) {
        const resp = await getDireccion(selectedEvent.idDireccion);
        dir = resp?.data || resp || null;
        setDireccionDetalle(dir);
      }
      const regionId = dir?.comuna?.region?.id || null;
      const comunaId = dir?.comuna?.id || null;
      if (regionId) {
        setEditForm((prev) => ({ ...(prev || {}), regionId, comunaId }));
        try {
          const comunasApi = await getComunas(regionId);
          const comunasArray = comunasApi?.data || comunasApi || [];
          const comunasOpt = comunasArray.map((c) => ({
            label: c.nombre || c.name,
            value: c.id || c.codigo || c.value,
          }));
          setComunasEdit(comunasOpt);
        } catch {
          setComunasEdit([]);
        }
      }
    } catch {
      void 0; // no-op
    }
  };

  const onCancelarEdicion = () => {
    setEditMode(false);
    setEditForm(null);
  };

  const onRegistrarAsistencia = () => {
    // Abrir diálogo para registrar asistencia de la compañía del usuario

    setAsistenciaVisible(true);
  };

  useEffect(() => {}, [asistenciaVisible]);

  const guardarAsistenciaEvento = async ({ presentes }) => {
    // TODO: integrar con endpoint de backend para persistir asistencia por evento
    // Por ahora solo mostramos un toast con el conteo seleccionado
    toast.success(`Asistencia registrada para ${presentes.length} voluntarios`);
  };

  const onDeleteClick = async () => {
    if (!puedeEliminarEventos) {
      toast.error("No tienes permisos para eliminar eventos");
      return;
    }
    try {
      if (!selectedEvent?.id) return;

      setDetalleVisible(false);
      await new Promise((r) => setTimeout(r, 0));

      const result = await showConfirmAlert(
        "Eliminar evento",
        `¿Deseas eliminar el evento "${selectedEvent.title}"? Esta acción no se puede deshacer.`,
        "Sí, eliminar",
        "Cancelar"
      );
      if (!result?.isConfirmed) {
        setDetalleVisible(true);
        return;
      }
      await deleteEvento(selectedEvent.id);
      toast.success("Evento eliminado");
      setDetalleVisible(false);
      const ev = await getEventos();
      const colorMap = buildTipoColorMap(tipos);
      const getColorForTipo = (tipoId) => colorMap[String(tipoId)];
      const mapped = mapEventosConColores(ev?.data || ev || [], tipos, getColorForTipo);
      setEventos(mapped);
    } catch (err) {
      console.error(err);
      toast.error("No se pudo eliminar el evento");
    }
  };

  const onGuardarEdicion = async () => {
    if (!puedeActualizarEventos) {
      toast.error("No tienes permisos para actualizar eventos");
      return;
    }
    try {
      if (!selectedEvent) return;
      const f = editForm;
      if (!f) return;
      if (!f.titulo || (f.allDay ? !f.fecha : !f.inicio || !f.fin) || !f.tipo) {
        toast.warn("Completa título y fechas");
        return;
      }
      const eventodata = {
        nombre: f.titulo,
        descripcion: f.descripcion || null,
        fechaHoraInicio: f.allDay
          ? dayjs(f.fecha).startOf("day").toISOString()
          : dayjs(f.inicio).toISOString(),
        fechaHoraFin: f.allDay
          ? dayjs(f.fecha).endOf("day").toISOString()
          : dayjs(f.fin).toISOString(),
        esTodoElDia: !!f.allDay,
        idTipoEvento: Number(f.tipo) || f.tipo,
      };
      let direcciondata;
      if (f.agregarDireccion && f.calle && f.numero && f.comunaId) {
        direcciondata = {
          calle: f.calle,
          numero: String(f.numero),
          idComuna: Number(f.comunaId) || f.comunaId,
        };
      } else if (!f.agregarDireccion) {
        eventodata.idDireccion = null;
        direcciondata = null;
      }

      await updateEvento(selectedEvent.id, { eventodata, direcciondata });
      toast.success("Evento actualizado");
      setEditMode(false);
      setEditForm(null);
      setDetalleVisible(false);
      const ev = await getEventos();
      const colorMap = buildTipoColorMap(tipos);
      const getColorForTipo = (tipoId) => colorMap[String(tipoId)];
      const mapped = mapEventosConColores(ev?.data || ev || [], tipos, getColorForTipo);
      setEventos(mapped);
    } catch (err) {
      console.error(err);
      toast.error("No se pudo actualizar el evento");
    }
  };

  // formatHeaderFecha importado desde helper

  const ToolbarNormal = () => (
    <CalendarToolbar
      tipos={tipos}
      filtroTipos={filtroTipos}
      onChangeFiltro={setFiltroTipos}
      vista={vista}
      VISTAS={VISTAS}
      onChangeVista={cambiarVista}
      loading={loading}
      getTipoBg={getTipoBg}
      extraRight={
        puedeCrearEventos ? (
          <Button
            icon="pi pi-plus"
            label="Crear evento"
            onClick={abrirDialogoCrear}
            className="ml-2 p-button-sm"
          />
        ) : null
      }
    />
  );

  // ====== ---------------- Pestaña: Recurrentes (solo ver) ---------------- ======
  const recCalendarRef = useRef(null);
  // Navegar a una fecha específica en el calendario normal
  const gotoFechaNormal = (date) => {
    try {
      // Cambiar a pestaña Calendario si no está activa
      if (activeIndex !== 0) {
        setActiveIndex(0);
        // Esperar al siguiente tick para asegurar render
        setTimeout(() => {
          const api = calendarRef.current?.getApi?.();
          if (api && date) api.gotoDate(date);
        }, 0);
      } else {
        const api = calendarRef.current?.getApi?.();
        if (api && date) api.gotoDate(date);
      }
    } catch {
      void 0; // no-op
    }
  };

  // Navegar a una fecha específica en el calendario recurrente
  const gotoFechaRec = (date) => {
    try {
      if (activeIndex !== 1) {
        setActiveIndex(1);
        setTimeout(() => {
          const api = recCalendarRef.current?.getApi?.();
          if (api && date) api.gotoDate(date);
        }, 0);
      } else {
        const api = recCalendarRef.current?.getApi?.();
        if (api && date) api.gotoDate(date);
      }
    } catch {
      void 0; // no-op
    }
  };
  const [recLoading, setRecLoading] = useState(false);
  const [recEventos, setRecEventos] = useState([]);
  const [recVista, setRecVista] = useState(VISTAS.month);
  // Se reutiliza el diálogo de detalle principal, por lo que no se requieren estados separados
  const [recFiltroTipos, setRecFiltroTipos] = useState(["cumple", "ingreso", "fundacion"]); // filtros simples

  // Reutilizamos helpers de recurrentes

  const cargarRecurrentes = async () => {
    setRecLoading(true);
    try {
      const resp = await getEventosRecurrentes();
      const data = resp?.data || resp || {};
      const mapped = mapRecurrentesToEvents(data);
      setRecEventos(mapped);
    } catch (e) {
      console.error(e);
      toast.error("No se pudieron cargar los eventos recurrentes");
      setRecEventos([]);
    } finally {
      setRecLoading(false);
    }
  };

  useEffect(() => {
    // Cargar recurrentes solo cuando se entra a la pestaña Recurrentes por primera vez
    if (activeIndex === 1 && recEventos.length === 0 && !recLoading) {
      cargarRecurrentes();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex]);

  const cambiarVistaRec = (v) => {
    setRecVista(v);
    const api = recCalendarRef.current?.getApi?.();
    api?.changeView(v);
  };

  const onRecEventClick = (info) => {
    const ev = info?.event;
    if (!ev) return;
    const props = ev.extendedProps || {};
    const data = {
      id: ev.id,
      title: ev.title,
      start: ev.start ?? ev._instance?.range?.start ?? null,
      end: ev.end ?? ev._instance?.range?.end ?? null,
      allDay: ev.allDay,
      backgroundColor: ev.backgroundColor,
      borderColor: ev.borderColor,
      textColor: ev.textColor,
      tipoId: null,
      tipoLabel:
        props?.tipoRec === "cumple"
          ? "Cumpleaños"
          : props?.tipoRec === "ingreso"
          ? "Ingreso"
          : props?.tipoRec === "fundacion"
          ? "Fundación"
          : undefined,
      descripcion: props?.descripcion || "",
      idDireccion: null,
      __recurrentExtras: {
        tipoRec: props.tipoRec,
        nombre: props.nombre,
        apellido: props.apellido,
        nombreCompania: props.nombreCompania,
        email: props.email,
        baseDate: props.baseDate,
      },
    };
    setSelectedEvent(data);
    setSelectedIsRecurrent(true);
    setDetalleVisible(true);
    setEditMode(false);
  };

  // opciones de filtros de recurrentes gestionadas dentro del toolbar reutilizable

  const recToolbar = () => (
    <CalendarRecToolbar
      recFiltroTipos={recFiltroTipos}
      onChangeFiltro={setRecFiltroTipos}
      recVista={recVista}
      VISTAS={VISTAS}
      onChangeVista={cambiarVistaRec}
      recLoading={recLoading}
    />
  );

  const recEventosFiltrados = useMemo(() => {
    if (!recFiltroTipos || recFiltroTipos.length === 0) return [];
    const set = new Set(recFiltroTipos);
    return recEventos.filter((e) => set.has(e.extendedProps?.tipoRec));
  }, [recEventos, recFiltroTipos]);

  // Próximas ocurrencias para Recurrentes (top 5)
  const proximosRecEventos = useMemo(
    () => computeProximosRecurrentes(recEventosFiltrados, 4),
    [recEventosFiltrados]
  );

  // ===================== RENDER =====================
  return (
    <div className="min-h-[80vh]">
      <style>{FC_TRUNCATE_CSS}</style>

      {/* Header principal con estilo glassmorphism */}
      <div className="px-4 py-3">
        <div className="bg-white/80 backdrop-blur-lg border border-[#4EB9FA]/20 shadow-md rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MdCalendarToday className="h-8 w-8 text-[#4EB9FA]" />
              <div>
                <h1 className="text-2xl font-bold text-[#2C3E50]">Calendario Operativo (Admin)</h1>
              </div>
              <Tooltip
                id="calendario-admin-help"
                content="Calendario operativo administrativo. Aquí puedes crear, editar y eliminar eventos operativos, gestionar los tipos de eventos, y ver los hitos institucionales. También puedes registrar asistencia de bomberos a eventos."
                place="right"
                variant="dark"
              >
                <MdHelpOutline className="h-4 w-4 text-gray-400 hover:text-[#4EB9FA] transition-colors cursor-help" />
              </Tooltip>
            </div>
          </div>

          {/* Pestañas */}
          <div className="mt-4 border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveIndex(0)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeIndex === 0
                    ? "border-[#4EB9FA] text-[#4EB9FA]"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Calendario Operativo
              </button>
              <button
                onClick={() => setActiveIndex(1)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeIndex === 1
                    ? "border-[#4EB9FA] text-[#4EB9FA]"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Hitos de la institución
              </button>
            </nav>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="px-4 mt-2">
        <div className="bg-white/80 backdrop-blur-lg border border-[#4EB9FA]/20 shadow-md rounded-2xl p-4">
          <style>{`
            .p-tabview-nav {
              display: none !important;
            }
          `}</style>
          <TabView
            activeIndex={activeIndex}
            onTabChange={(e) => setActiveIndex(e.index)}
            className="border-0"
          >
            {/* =================== Pestaña 1: Calendario normal =================== */}
            <TabPanel header="Calendario Operativo">
              <ToolbarNormal />

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Calendario */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-4 fc-compact">
                  <FullCalendar
                    ref={calendarRef}
                    plugins={[
                      interactionPlugin,
                      dayGridPlugin,
                      timeGridPlugin,
                      listPlugin,
                      multiMonthPlugin,
                    ]}
                    initialView={vista}
                    headerToolbar={{ left: "prev", center: "title", right: "next" }}
                    locale="es"
                    height="auto"
                    firstDay={1}
                    navLinks={true}
                    selectable={puedeCrearEventos}
                    dayMaxEvents={3}
                    events={eventosFiltrados}
                    eventClick={onEventClick}
                    eventDidMount={(info) => {
                      if (info.event.extendedProps?.textColor) {
                        info.el.style.color = info.event.extendedProps.textColor;
                      }
                    }}
                    dateClick={puedeCrearEventos ? onDateClick : undefined}
                    eventTimeFormat={{ hour: "2-digit", minute: "2-digit", meridiem: false }}
                    slotMinTime="07:00:00"
                    slotMaxTime="23:00:00"
                    nowIndicator={true}
                    loading={(isLoading) => setLoading(isLoading)}
                    multiMonthMaxColumns={8}
                  />
                </div>

                {/* Próximos eventos */}
                <ProximosEventosPanel
                  titulo="Próximos eventos"
                  items={proximosEventos}
                  dirCache={dirCache}
                  showDireccion="auto"
                  onVerEnCalendario={gotoFechaNormal}
                />
              </div>
            </TabPanel>

            {/* =================== Pestaña 2: Recurrentes (solo ver) =================== */}
            <TabPanel header="Hitos de la institución">
              {recToolbar()}

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Calendario recurrente */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-4 fc-compact">
                  <FullCalendar
                    ref={recCalendarRef}
                    plugins={[
                      interactionPlugin,
                      dayGridPlugin,
                      timeGridPlugin,
                      listPlugin,
                      multiMonthPlugin,
                      rrulePlugin,
                    ]}
                    initialView={recVista}
                    headerToolbar={{ left: "prev", center: "title", right: "next" }}
                    locale="es"
                    height="auto"
                    firstDay={1}
                    dayMaxEvents={3}
                    events={recEventosFiltrados}
                    eventClick={onRecEventClick}
                    eventContent={(arg) => {
                      try {
                        const ev = arg.event;
                        const props = ev.extendedProps || {};
                        let text = ev.title || "";

                        if (props?.tipoRec === "fundacion" && props?.baseDate && ev.start) {
                          const base = dayjs(props.baseDate);
                          const occ = dayjs(ev.start);
                          if (base.isValid() && occ.isValid()) {
                            const years = occ.year() - base.year();
                            text = `Aniversario #${years} ${props.nombreCompania || ""}`.trim();
                          }
                        } else if (props?.tipoRec === "ingreso" && props?.baseDate && ev.start) {
                          const base = dayjs(props.baseDate);
                          const occ = dayjs(ev.start);
                          if (base.isValid() && occ.isValid()) {
                            const years = occ.year() - base.year();
                            const nombre = [props.nombre, props.apellido]
                              .filter(Boolean)
                              .join(" ")
                              .trim();
                            text = `Aniversario de ingreso N°${years} ${nombre}`.trim();
                          }
                        }

                        // Obtener icono según tipo usando react-icons
                        let iconSvg = "";
                        if (props?.tipoRec === "cumple") {
                          // Icono de pastel/cumpleaños de Material Design
                          iconSvg = ReactDOMServer.renderToStaticMarkup(
                            <MdCake
                              style={{
                                width: "14px",
                                height: "14px",
                                display: "inline-block",
                                verticalAlign: "middle",
                                marginRight: "4px",
                              }}
                            />
                          );
                        } else if (props?.tipoRec === "ingreso") {
                          // Icono de check circle de Material Design
                          iconSvg = ReactDOMServer.renderToStaticMarkup(
                            <MdCheckCircle
                              style={{
                                width: "14px",
                                height: "14px",
                                display: "inline-block",
                                verticalAlign: "middle",
                                marginRight: "4px",
                              }}
                            />
                          );
                        } else if (props?.tipoRec === "fundacion") {
                          // Icono de estrella de Material Design
                          iconSvg = ReactDOMServer.renderToStaticMarkup(
                            <MdStar
                              style={{
                                width: "14px",
                                height: "14px",
                                display: "inline-block",
                                verticalAlign: "middle",
                                marginRight: "4px",
                              }}
                            />
                          );
                        }

                        const container = document.createElement("div");
                        container.style.display = "inline-flex";
                        container.style.alignItems = "center";
                        container.style.gap = "4px";
                        if (iconSvg) {
                          const iconDiv = document.createElement("span");
                          iconDiv.innerHTML = iconSvg;
                          container.appendChild(iconDiv);
                        }
                        const textNode = document.createTextNode(text);
                        container.appendChild(textNode);

                        return { domNodes: [container] };
                      } catch {
                        return { domNodes: [document.createTextNode(arg.event.title || "")] };
                      }
                    }}
                    // Solo ver: sin dateClick, sin selectable, sin modificar/eliminar
                    selectable={false}
                    editable={false}
                    eventStartEditable={false}
                    eventDurationEditable={false}
                    eventDidMount={(info) => {
                      // Aplicar color de texto si viene en el evento
                      const tc = info.event.extendedProps?.textColor || info.event.textColor;
                      if (tc) info.el.style.color = tc;
                      // Filtrado extra por tipo (evitar render de tipos NO seleccionados si el source mezcló)
                      const tipoRec = info.event.extendedProps?.tipoRec;
                      if (tipoRec && !recFiltroTipos.includes(tipoRec)) {
                        info.el.style.display = "none";
                      }
                    }}
                    eventTimeFormat={{ hour: "2-digit", minute: "2-digit", meridiem: false }}
                    multiMonthMaxColumns={8}
                    loading={(isLoading) => setRecLoading(isLoading)}
                  />
                </div>

                {/* Próximos eventos recurrentes */}
                <ProximosEventosPanel
                  titulo="Próximos eventos"
                  items={proximosRecEventos}
                  dirCache={{}}
                  showDireccion="none"
                  onVerEnCalendario={gotoFechaRec}
                />
              </div>
            </TabPanel>
          </TabView>
        </div>
      </div>

      {/* ====== Diálogo: Crear (normal) ====== */}
      <Dialog
        header="Nuevo evento"
        visible={dialogoVisible}
        style={{ width: "32rem" }}
        modal
        onHide={() => setDialogoVisible(false)}
        footer={
          <div className="flex justify-end gap-2">
            <Button
              label="Cancelar"
              className="p-button-text"
              onClick={() => setDialogoVisible(false)}
            />
            <Button label="Guardar" icon="pi pi-check" onClick={onGuardarEvento} />
          </div>
        }
      >
        <div className="space-y-4">
          {/* Título */}
          <div className="flex items-center gap-2">
            <i className="pi pi-tag text-slate-500" />
            <InputText
              className="w-full"
              value={form.titulo}
              onChange={(e) => setForm((f) => ({ ...f, titulo: e.target.value }))}
              placeholder="Título del evento"
            />
          </div>

          {/* Descripción */}
          <div className="flex items-center gap-2">
            <i className="pi pi-align-left text-slate-500" />
            <InputText
              className="w-full"
              value={form.descripcion}
              onChange={(e) => setForm((f) => ({ ...f, descripcion: e.target.value }))}
              placeholder="Descripción del evento"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              id="allDayChk"
              type="checkbox"
              className="h-4 w-4"
              checked={form.allDay}
              onChange={(e) => setForm((f) => ({ ...f, allDay: e.target.checked }))}
            />
            <label htmlFor="allDayChk" className="text-sm text-slate-700">
              Todo el día
            </label>
          </div>

          {form.allDay ? (
            <div className="flex items-center gap-2">
              <i className="pi pi-calendar text-slate-500" />
              <PRCalendar
                value={form.fecha}
                onChange={(e) => setForm((f) => ({ ...f, fecha: e.value }))}
                dateFormat="dd/mm/yy"
                placeholder="Fecha del evento"
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <i className="pi pi-calendar text-slate-500" />
                <PRCalendar
                  value={form.inicio}
                  onChange={(e) => setForm((f) => ({ ...f, inicio: e.value }))}
                  showTime
                  hourFormat="24"
                  dateFormat="dd/mm/yy"
                  placeholder="Inicio"
                />
              </div>
              <div className="flex items-center gap-2">
                <i className="pi pi-calendar text-slate-500" />
                <PRCalendar
                  value={form.fin}
                  onChange={(e) => setForm((f) => ({ ...f, fin: e.value }))}
                  showTime
                  hourFormat="24"
                  dateFormat="dd/mm/yy"
                  placeholder="Fin"
                />
              </div>
            </div>
          )}

          <div className="flex items-center gap-2">
            <i className="pi pi-list text-slate-500" />
            <Dropdown
              value={form.tipo}
              onChange={(e) => setForm((f) => ({ ...f, tipo: e.value }))}
              options={tipos}
              placeholder="Tipo de evento"
              className="w-full"
              valueTemplate={(option, props) =>
                !option ? (
                  <span className="text-slate-400">{props.placeholder}</span>
                ) : (
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-block h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: getTipoBg(option.value) }}
                    />
                    <span>{option.label}</span>
                  </div>
                )
              }
              itemTemplate={(option) => (
                <div className="flex items-center gap-2">
                  <span
                    className="inline-block h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: getTipoBg(option.value) }}
                  />
                  <span>{option.label}</span>
                </div>
              )}
            />
          </div>

          {/* Agregar dirección */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <input
                id="agregarDirChk"
                type="checkbox"
                className="h-4 w-4"
                checked={form.agregarDireccion}
                onChange={(e) => setForm((f) => ({ ...f, agregarDireccion: e.target.checked }))}
              />
              <label htmlFor="agregarDirChk" className="text-sm text-slate-700">
                Agregar dirección
              </label>
            </div>
          </div>

          {form.agregarDireccion && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2 min-w-0">
                <i className="pi pi-globe text-slate-500" />
                <Dropdown
                  value={form.regionId}
                  onChange={async (e) => {
                    const regionId = e.value;
                    setForm((f) => ({ ...f, regionId, comunaId: null }));
                    try {
                      const comunasApi = await getComunas(regionId);
                      const comunasArray = comunasApi?.data || comunasApi || [];
                      const comunasOpt = comunasArray.map((c) => ({
                        label: c.nombre || c.name,
                        value: c.id || c.codigo || c.value,
                      }));
                      setComunas(comunasOpt);
                    } catch {
                      setComunas([]);
                    }
                  }}
                  options={regiones}
                  placeholder="Región"
                  className="w-full min-w-0 flex-1"
                  style={{ maxWidth: "100%" }}
                  valueTemplate={(option, props) =>
                    !option ? (
                      <span className="text-slate-400">{props.placeholder}</span>
                    ) : (
                      <span className="block truncate max-w-full">
                        {option.label ?? option.nombre ?? option.name}
                      </span>
                    )
                  }
                />
              </div>
              <div className="flex items-center gap-2 min-w-0">
                <i className="pi pi-map-marker text-slate-500" />
                <Dropdown
                  value={form.comunaId}
                  onChange={(e) => setForm((f) => ({ ...f, comunaId: e.value }))}
                  options={comunas}
                  placeholder="Comuna"
                  disabled={!form.regionId}
                  className="w-full min-w-0 flex-1"
                  style={{ maxWidth: "100%" }}
                  valueTemplate={(option, props) =>
                    !option ? (
                      <span className="text-slate-400">{props.placeholder}</span>
                    ) : (
                      <span className="block truncate max-w-full">
                        {option.label ?? option.nombre ?? option.name}
                      </span>
                    )
                  }
                />
              </div>
              <div className="flex items-center gap-2 md:col-span-1">
                <i className="pi pi-map text-slate-500" />
                <InputText
                  className="w-full"
                  value={form.calle}
                  onChange={(e) => setForm((f) => ({ ...f, calle: e.target.value }))}
                  placeholder="Calle"
                />
              </div>
              <div className="flex items-center gap-2 md:col-span-1">
                <i className="pi pi-hashtag text-slate-500" />
                <InputText
                  className="w-full"
                  value={form.numero}
                  onChange={(e) => setForm((f) => ({ ...f, numero: e.target.value }))}
                  placeholder="Número"
                />
              </div>
            </div>
          )}
        </div>
      </Dialog>

      {/* ====== Diálogo detalle (normal) ====== */}
      <Dialog
        header={
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <span
                className="mt-1 inline-block h-3 w-3 rounded-sm"
                style={{ backgroundColor: getTipoBg(selectedEvent?.tipoId) }}
              />
              <div>
                <div className="text-base font-semibold text-slate-800">
                  {selectedIsRecurrent &&
                  selectedEvent?.__recurrentExtras?.baseDate &&
                  selectedEvent?.start
                    ? (() => {
                        const base = dayjs(selectedEvent.__recurrentExtras.baseDate);
                        const occ = dayjs(selectedEvent.start);
                        if (base.isValid() && occ.isValid()) {
                          const years = occ.year() - base.year();
                          if (selectedEvent.__recurrentExtras?.tipoRec === "fundacion") {
                            return `Aniversario N°${years} ${
                              selectedEvent.__recurrentExtras?.nombreCompania || ""
                            }`;
                          }
                          if (selectedEvent.__recurrentExtras?.tipoRec === "ingreso") {
                            const nombre = [
                              selectedEvent.__recurrentExtras?.nombre,
                              selectedEvent.__recurrentExtras?.apellido,
                            ]
                              .filter(Boolean)
                              .join(" ")
                              .trim();
                            return `Aniversario de ingreso N°${years} ${nombre}`.trim();
                          }
                        }
                        return selectedEvent?.title || "Detalle de evento";
                      })()
                    : selectedEvent?.title || "Detalle de evento"}
                </div>
                <div className="text-sm text-slate-500">{formatHeaderFecha(selectedEvent)}</div>
              </div>
            </div>
            <div className="flex items-center gap-1 text-slate-500">
              {selectedIsRecurrent ? (
                <span className="text-xs text-slate-400 italic">Solo lectura</span>
              ) : (
                <>
                  {puedeActualizarEventos && (
                    <button
                      className="p-1 rounded hover:bg-slate-100"
                      title="Editar"
                      type="button"
                      onClick={onEditClick}
                    >
                      <MdEdit className="h-4 w-4" />
                    </button>
                  )}
                  {puedeEliminarEventos && (
                    <button
                      className="p-1 rounded hover:bg-slate-100"
                      title="Eliminar"
                      type="button"
                      onClick={onDeleteClick}
                    >
                      <MdDelete className="h-4 w-4" />
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        }
        visible={detalleVisible}
        style={{ width: "30rem" }}
        modal
        closable={false}
        closeOnEscape={false}
        dismissableMask={false}
        onHide={() => setDetalleVisible(false)}
        footer={
          editMode ? (
            <div className="flex justify-end gap-2">
              <Button label="Cancelar" className="p-button-text" onClick={onCancelarEdicion} />
              <Button label="Actualizar" icon="pi pi-check" onClick={onGuardarEdicion} />
            </div>
          ) : (
            <div className="flex justify-end gap-2">
              {!selectedIsRecurrent && (
                <Button
                  label="Registrar asistencia"
                  icon="pi pi-users"
                  className="p-button-text"
                  onClick={onRegistrarAsistencia}
                />
              )}
              <Button
                label="Cerrar"
                className="p-button-text"
                onClick={() => setDetalleVisible(false)}
              />
            </div>
          )
        }
      >
        {selectedEvent ? (
          <div className="space-y-4">
            {/* Inicio / Fin */}
            <div className="flex items-start gap-2">
              <i className="pi pi-calendar text-slate-500 mt-0.5" />
              {editMode ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                  {editForm?.allDay ? (
                    <div className="md:col-span-2 flex items-center gap-2">
                      <PRCalendar
                        value={editForm.fecha}
                        onChange={(e) => setEditForm((f) => ({ ...f, fecha: e.value }))}
                        dateFormat="dd/mm/yy"
                      />
                    </div>
                  ) : (
                    <>
                      <PRCalendar
                        value={editForm?.inicio || null}
                        onChange={(e) => setEditForm((f) => ({ ...f, inicio: e.value }))}
                        showTime
                        hourFormat="24"
                        dateFormat="dd/mm/yy"
                        placeholder="Inicio"
                      />
                      <PRCalendar
                        value={editForm?.fin || null}
                        onChange={(e) => setEditForm((f) => ({ ...f, fin: e.value }))}
                        showTime
                        hourFormat="24"
                        dateFormat="dd/mm/yy"
                        placeholder="Fin"
                      />
                    </>
                  )}
                  <div className="md:col-span-2 flex items-center gap-2">
                    <input
                      id="editAllDayChk"
                      type="checkbox"
                      className="h-4 w-4"
                      checked={!!editForm?.allDay}
                      onChange={(e) => setEditForm((f) => ({ ...f, allDay: e.target.checked }))}
                    />
                    <label htmlFor="editAllDayChk" className="text-sm text-slate-700">
                      Todo el día
                    </label>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-slate-700">
                  {selectedEvent.allDay ? (
                    <div>
                      <div>
                        <span className="font-medium">Inicio: </span>
                        {selectedEvent.start
                          ? dayjs(selectedEvent.start).format("dddd D [de] MMMM")
                          : "—"}
                      </div>
                      <div>
                        <span className="font-medium">Fin: </span>
                        {selectedEvent.end
                          ? dayjs(selectedEvent.end).format("dddd D [de] MMMM")
                          : "—"}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div>
                        <span className="font-medium">Inicio: </span>
                        {selectedEvent.start
                          ? dayjs(selectedEvent.start).format("ddd D MMM, HH:mm")
                          : "—"}
                      </div>
                      <div>
                        <span className="font-medium">Fin: </span>
                        {selectedEvent.end
                          ? dayjs(selectedEvent.end).format("ddd D MMM, HH:mm")
                          : "—"}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Descripción */}
            {(editMode || selectedEvent.descripcion) && (
              <div className="flex items-start gap-2">
                <i className="pi pi-align-left text-slate-500 mt-0.5" />
                {editMode ? (
                  <InputText
                    className="w-full"
                    value={editForm?.descripcion || ""}
                    onChange={(e) => setEditForm((f) => ({ ...f, descripcion: e.target.value }))}
                    placeholder="Descripción del evento"
                  />
                ) : (
                  <div>
                    <p className="text-sm text-slate-700 whitespace-pre-line">
                      {selectedEvent.descripcion}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Datos adicionales para eventos recurrentes */}
            {selectedIsRecurrent && selectedEvent?.__recurrentExtras && !editMode && (
              <div className="space-y-2 text-sm text-slate-700">
                {selectedEvent.__recurrentExtras.tipoRec === "cumple" && (
                  <>
                    <div>
                      <span className="font-medium">Voluntario: </span>
                      {selectedEvent.__recurrentExtras.nombre}{" "}
                      {selectedEvent.__recurrentExtras.apellido}
                    </div>
                  </>
                )}
                {selectedEvent.__recurrentExtras.tipoRec === "ingreso" && (
                  <>
                    <div>
                      <span className="font-medium">Voluntario: </span>
                      {selectedEvent.__recurrentExtras.nombre}{" "}
                      {selectedEvent.__recurrentExtras.apellido}
                    </div>
                    <div>
                      <span className="font-medium">Fecha de ingreso: </span>
                      {dayjs(selectedEvent.__recurrentExtras.baseDate).format("DD/MM/YYYY")}
                    </div>
                  </>
                )}
                {selectedEvent.__recurrentExtras.tipoRec === "fundacion" && (
                  <>
                    <div>
                      <span className="font-medium">Compañía: </span>
                      {selectedEvent.__recurrentExtras.nombreCompania}
                    </div>
                    <div>
                      <span className="font-medium">Fundación: </span>
                      {dayjs(selectedEvent.__recurrentExtras.baseDate).format("DD/MM/YYYY")}
                    </div>
                  </>
                )}
                {selectedEvent.__recurrentExtras.email && (
                  <div>
                    <span className="font-medium">Email: </span>
                    {selectedEvent.__recurrentExtras.email}
                  </div>
                )}
              </div>
            )}

            {/* Tipo */}
            {(editMode || selectedEvent.tipoLabel) && (
              <div className="flex items-start gap-2">
                <i className="pi pi-bookmark text-slate-500 mt-0.5" />
                {editMode ? (
                  <Dropdown
                    value={editForm?.tipo || null}
                    onChange={(e) => setEditForm((f) => ({ ...f, tipo: e.value }))}
                    options={tipos}
                    placeholder="Tipo de evento"
                    className="w-full"
                  />
                ) : (
                  <div className="text-sm text-slate-700">{selectedEvent.tipoLabel}</div>
                )}
              </div>
            )}

            {/* Dirección */}
            <div className="flex items-start gap-2">
              <div className="flex-1">
                {editMode ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2 flex items-center gap-2">
                      <input
                        id="editAgregarDirChk"
                        type="checkbox"
                        className="h-4 w-4"
                        checked={!!editForm?.agregarDireccion}
                        onChange={(e) =>
                          setEditForm((f) => ({ ...f, agregarDireccion: e.target.checked }))
                        }
                      />
                      <label htmlFor="editAgregarDirChk" className="text-sm text-slate-700">
                        Agregar dirección
                      </label>
                    </div>
                    {editForm?.agregarDireccion && (
                      <>
                        <div className="flex items-center gap-2 md:col-span-1 min-w-0">
                          <i className="pi pi-globe text-slate-500" />
                          <Dropdown
                            value={editForm?.regionId || null}
                            onChange={async (e) => {
                              const regionId = e.value;
                              setEditForm((f) => ({ ...f, regionId, comunaId: null }));
                              try {
                                const comunasApi = await getComunas(regionId);
                                const comunasArray = comunasApi?.data || comunasApi || [];
                                const comunasOpt = comunasArray.map((c) => ({
                                  label: c.nombre || c.name,
                                  value: c.id || c.codigo || c.value,
                                }));
                                setComunasEdit(comunasOpt);
                              } catch {
                                setComunasEdit([]);
                              }
                            }}
                            options={regiones}
                            placeholder="Región"
                            className="w-full min-w-0 flex-1"
                            style={{ maxWidth: "100%" }}
                            valueTemplate={(option, props) =>
                              !option ? (
                                <span className="text-slate-400">{props.placeholder}</span>
                              ) : (
                                <span className="block truncate max-w-full">
                                  {option.label ?? option.nombre ?? option.name}
                                </span>
                              )
                            }
                          />
                        </div>
                        <div className="flex items-center gap-2 md:col-span-1 min-w-0">
                          <i className="pi pi-map-marker text-slate-500" />
                          <Dropdown
                            value={editForm?.comunaId || null}
                            onChange={(e) => setEditForm((f) => ({ ...f, comunaId: e.value }))}
                            options={comunasEdit}
                            placeholder="Comuna"
                            disabled={!editForm?.regionId}
                            className="w-full min-w-0 flex-1"
                            style={{ maxWidth: "100%" }}
                            valueTemplate={(option, props) =>
                              !option ? (
                                <span className="text-slate-400">{props.placeholder}</span>
                              ) : (
                                <span className="block truncate max-w-full">
                                  {option.label ?? option.nombre ?? option.name}
                                </span>
                              )
                            }
                          />
                        </div>
                        <div className="flex items-center gap-2 md:col-span-1">
                          <i className="pi pi-map text-slate-500" />
                          <InputText
                            className="w-full"
                            value={editForm?.calle || ""}
                            onChange={(e) => setEditForm((f) => ({ ...f, calle: e.target.value }))}
                            placeholder="Calle"
                          />
                        </div>
                        <div className="flex items-center gap-2 md:col-span-1">
                          <i className="pi pi-hashtag text-slate-500" />
                          <InputText
                            className="w-full"
                            value={editForm?.numero || ""}
                            onChange={(e) => setEditForm((f) => ({ ...f, numero: e.target.value }))}
                            placeholder="Número"
                          />
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <>
                    {direccionLoading && (
                      <div className="text-sm text-slate-500 flex items-center gap-2">
                        <i className="pi pi-spinner pi-spin" /> Cargando dirección...
                      </div>
                    )}
                    {direccionError && <div className="text-sm text-red-600">{direccionError}</div>}
                    {!direccionLoading &&
                      !direccionError &&
                      (selectedEvent?.idDireccion ? (
                        direccionDetalle ? (
                          <div className="text-sm text-slate-700">
                            {(() => {
                              const calle = direccionDetalle.calle || "";
                              const numero = direccionDetalle.numero || "";
                              const comuna = direccionDetalle.comuna?.nombre || "";
                              const region = direccionDetalle.comuna?.region?.nombre || "";
                              const linea = [
                                [calle, numero].filter(Boolean).join(" "),
                                comuna,
                                region,
                              ]
                                .filter(Boolean)
                                .join(", ");
                              return <div>{linea || "Sin datos de dirección"}</div>;
                            })()}
                          </div>
                        ) : (
                          <div className="text-sm text-slate-500">Sin datos de dirección</div>
                        )
                      ) : (
                        <div className="text-sm text-slate-500">
                          Este evento no tiene dirección asociada
                        </div>
                      ))}
                  </>
                )}
              </div>
            </div>

            {/* Acta de reunión */}
            {!selectedIsRecurrent && !editMode && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <i className="pi pi-file-edit text-slate-500" />
                  <span className="text-sm font-medium text-slate-700">Acta de reunión</span>
                  {actaLoading && (
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <i className="pi pi-spin pi-spinner" />
                      Cargando…
                    </span>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-slate-500">Descripción/Resumen</label>
                  <textarea
                    value={actaDescripcion}
                    onChange={(e) => setActaDescripcion(e.target.value)}
                    className="w-full border rounded px-3 py-2 text-sm"
                    rows={4}
                    placeholder="Resumen de lo tratado"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-slate-500">Temas tratados (uno por línea)</label>
                  <textarea
                    value={actaTemasText}
                    onChange={(e) => setActaTemasText(e.target.value)}
                    className="w-full border rounded px-3 py-2 text-sm"
                    rows={4}
                    placeholder="Ej:&#10;1. Seguridad en cuartel&#10;2. Capacitación próxima"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    label="Guardar Acta"
                    icon="pi pi-save"
                    className="p-button-text"
                    onClick={async () => {
                      try {
                        const temas = actaTemasText
                          .split(/\r?\n/)
                          .map((t) => t.trim())
                          .filter(Boolean);
                        await guardarActaEvento(selectedEvent.id, {
                          descripcionActa: actaDescripcion,
                          temas,
                        });
                        toast.success("Acta guardada");
                      } catch (e) {
                        console.error("No se pudo guardar el acta", e);
                        toast.error("No se pudo guardar el acta");
                      }
                    }}
                  />
                  <Button
                    label="Generar Acta PDF"
                    icon="pi pi-file-pdf"
                    className="p-button-text"
                    onClick={async () => {
                      try {
                        const temas = actaTemasText
                          .split(/\r?\n/)
                          .map((t) => t.trim())
                          .filter(Boolean);
                        await guardarActaEvento(selectedEvent.id, {
                          descripcionActa: actaDescripcion,
                          temas,
                        });
                        navigate(`/calendario/evento/${selectedEvent.id}/acta/pdf`, {
                          state: { actaData: { descripcionActa: actaDescripcion, temas } },
                        });
                      } catch (e) {
                        console.error("No se pudo generar el PDF del acta", e);
                        toast.error("No se pudo generar el PDF");
                      }
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-sm text-slate-500">No se pudo cargar el detalle del evento.</div>
        )}
      </Dialog>

      {/* Diálogo: Registrar asistencia */}
      <AsistenciaEventoDialog
        visible={asistenciaVisible}
        onHide={() => setAsistenciaVisible(false)}
        companiaId={bombero?.idCompania || bombero?.companiaId || bombero?.compania?.id || null}
        eventId={selectedEvent?.id}
        eventTitle={selectedEvent?.title}
        onSave={guardarAsistenciaEvento}
      />

      {/* Diálogo recurrente eliminado: se reutiliza el diálogo principal */}
      {/* Toasts mostrados por react-toastify global */}
    </div>
  );
};

export default CalendarioOperativo;
