import { useEffect, useMemo, useRef, useState } from 'react';
import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import 'dayjs/locale/es';

// Servicios
import { getEventos, createEvento, getTiposEvento,  updateEvento, deleteEvento } from '../services/calendario.service.js';
import { getRegiones, getComunas, getDireccion } from '../services/direccion.service.js';

// FullCalendar
import FullCalendar from '@fullcalendar/react';
import interactionPlugin from '@fullcalendar/interaction';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import multiMonthPlugin from '@fullcalendar/multimonth';

// PrimeReact
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Calendar as PRCalendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { MultiSelect } from 'primereact/multiselect';
import { Accordion, AccordionTab } from 'primereact/accordion';

import { toast } from 'react-toastify';
import tinycolor from 'tinycolor2';
import { showConfirmAlert } from '@helpers/fireAlert.js';
import { MdEdit, MdDelete } from 'react-icons/md';

dayjs.extend(localizedFormat);
dayjs.locale('es');

const VISTAS = {
    year: 'multiMonthYear',
    month: 'dayGridMonth',
    week: 'timeGridWeek',
    day: 'timeGridDay',
};

const CalendarioOperativo = () => {
    const calendarRef = useRef(null);

    const [loading, setLoading] = useState(false);
    const [eventos, setEventos] = useState([]);
    const [tipos, setTipos] = useState([]);
    const [filtroTipos, setFiltroTipos] = useState([]);
    const [detalleVisible, setDetalleVisible] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [editForm, setEditForm] = useState(null);
    const [direccionDetalle, setDireccionDetalle] = useState(null);
    const [direccionLoading, setDireccionLoading] = useState(false);
    const [direccionError, setDireccionError] = useState(null);
    // Cache de direcciones para "Próximos eventos"
    const [dirCache, setDirCache] = useState({}); // { [idDireccion]: direccion | {__error: true} | null }
    const dirSolicitadasRef = useRef(new Set());

    const [vista, setVista] = useState(VISTAS.month);
    const [dialogoVisible, setDialogoVisible] = useState(false);
    const [form, setForm] = useState({
        titulo: '',
        descripcion: '',
        allDay: false,
        inicio: null,
        fin: null,
        fecha: null, // para allDay
        tipo: null,
        agregarDireccion: false,
        regionId: null,
        comunaId: null,
        calle: '',
        numero: '',
    });

    const [regiones, setRegiones] = useState([]);
    const [comunas, setComunas] = useState([]);
    const [comunasEdit, setComunasEdit] = useState([]);

    // Selección de color de texto usando WCAG: intenta AA (isReadable) y si no, usa mayor contraste
    const pickTextColor = (bgHex) => {
        const dark = '#111827';
        const light = '#ffffff';
        const opts = { level: 'AA', size: 'small' };
        const darkOk = tinycolor.isReadable(bgHex, dark, opts);
        const lightOk = tinycolor.isReadable(bgHex, light, opts);
        if (darkOk && !lightOk) return dark;
        if (lightOk && !darkOk) return light;
        // Si ambos pasan o ambos fallan, elegir el de mayor legibilidad
        const darkScore = tinycolor.readability(bgHex, dark);
        const lightScore = tinycolor.readability(bgHex, light);
        return darkScore >= lightScore ? dark : light;
    };

    // Mapa de colores por tipo (bg, border, text), basado en paleta triádica de #318CE7.
    // Si hay más de 3 tipos, se varía el brillo (lighten/darken) por "anillos".
    const tipoColorMap = useMemo(() => {
        if (!tipos || tipos.length === 0) return {};
        const triad = tinycolor('#318CE7').triad();
        const tipoIndexMap = new Map((tipos || []).map((t, i) => [String(t.value), i]));
        const colorForTipo = (tipoId) => {
            const idx = tipoIndexMap.get(String(tipoId)) ?? 0;
            const anchor = triad[idx % 3].clone();
            const level = Math.floor(idx / 3);
            // Variar brillo por anillos: 1er anillo aclara, 2do oscurece, etc.
            let variant = anchor.clone();
            if (level > 0) {
                const brightAmt = Math.min(10 + (level - 1) * 8, 35); // más notorio
                const satAmt = Math.min(8 + (level - 1) * 4, 24);
                variant = (level % 2 === 1) ? anchor.lighten(brightAmt) : anchor.darken(brightAmt);
                // Alternar saturación para distinguir aún más
                if (level % 3 === 1) variant = variant.saturate(satAmt);
                else if (level % 3 === 2) variant = variant.desaturate(satAmt);
                else variant = variant.saturate(4);
            }
            const bg = variant.toHexString();
            const border = variant.darken(14).toHexString();
            const text = pickTextColor(bg);
            return { bg, border, text };
        };
        const map = {};
        for (const t of tipos) {
            map[String(t.value)] = colorForTipo(t.value);
        }
        return map;
    }, [tipos]);

    const getTipoBg = (id) => tipoColorMap[String(id)]?.bg || '#318CE7';

    // Cargar tipos y eventos
    useEffect(() => {
        const cargar = async () => {
            setLoading(true);
            try {
                const [ev, tps, regs] = await Promise.all([
                    getEventos().catch(() => []),
                    getTiposEvento().catch(() => []),
                    getRegiones().catch(() => []),
                ]);
                console.log({ ev, tps });

                const tiposOpt = (tps?.data || tps || []).map((t) => ({
                    label: t?.nombre || t?.name || t?.label || 'General',
                    value: t?.id || t?.value || t?.codigo || 'general',
                    color: t?.color || undefined,
                }));
                setTipos(tiposOpt);

                // Paleta triádica basada en #318CE7
                const triad = tinycolor('#318CE7').triad();
                const tipoIndexMap = new Map((tiposOpt || []).map((t, i) => [String(t.value), i]));
                const colorForTipo = (tipoId) => {
                    const idx = tipoIndexMap.get(String(tipoId)) ?? 0;
                    const anchor = triad[idx % 3].clone();
                    const    level = Math.floor(idx / 3); // anillos sobre triada
                    let variant = anchor.clone();
                    if (level > 0) {
                        const brightAmt = Math.min(10 + (level - 1) * 8, 35);
                        const satAmt = Math.min(8 + (level - 1) * 4, 24);
                        variant = (level % 2 === 1) ? anchor.lighten(brightAmt) : anchor.darken(brightAmt);
                        if (level % 3 === 1) variant = variant.saturate(satAmt);
                        else if (level % 3 === 2) variant = variant.desaturate(satAmt);
                        else variant = variant.saturate(4);
                    }
                    const bg = variant.toHexString();
                    const border = variant.darken(14).toHexString();
                    const text = pickTextColor(bg);
                    return { bg, border, text };
                };

                const tipoLabelMap = new Map((tiposOpt || []).map((t) => [String(t.value), t.label]));
                const mapped = (ev?.data || ev || []).map((e) => {
                    const tipoId = e.idTipoEvento ?? e.tipoEvento?.id ?? e.tipoId ?? null;
                    const col = (tipoId != null) ? colorForTipo(tipoId) : undefined;
                    const tipoLabel = tipoId != null ? (tipoLabelMap.get(String(tipoId)) || 'General') : undefined;
                    return {
                        id: e.id ?? e._id ?? String(Math.random()),
                        title: e.nombre ?? e.title ?? 'NO CARGO',
                        start: e.fechaHoraInicio ? dayjs(e.fechaHoraInicio).toISOString() : dayjs(e.start).toISOString(),
                        end: e.fechaHoraFin ? dayjs(e.fechaHoraFin).toISOString() : (e.end ? dayjs(e.end).toISOString() : undefined),
                        allDay: Boolean(e.esTodoElDia ?? e.allDay),
                        tipoId: tipoId != null ? String(tipoId) : null,
                        tipoLabel,
                        descripcion: e.descripcion ?? e.description ?? '',
                        idDireccion: e.idDireccion ?? e.direccion?.id ?? null,
                        backgroundColor: col?.bg,
                        borderColor: col?.border,
                        textColor: col?.text,
                    };
                });
                setEventos(mapped);

                const regionesOpt = (regs || []).map((r) => ({
                    label: r.nombre || r.name,
                    value: r.id || r.codigo || r.value,
                }));
                setRegiones(regionesOpt);
            } catch (err) {
                console.error('Error cargando calendario', err);
                toast.error('No se pudieron cargar los eventos');
            } finally {
                setLoading(false);
            }
        };
        cargar();
    }, []);

    const eventosFiltrados = useMemo(() => {
        if (!filtroTipos || filtroTipos.length === 0) return eventos;
        const set = new Set((filtroTipos || []).map((v) => String(v)));
        return eventos.filter((e) => set.has(String(e.tipoId)));
    }, [eventos, filtroTipos]);

    const proximosEventos = useMemo(() => {
        const ahora = dayjs();
        return [...eventosFiltrados]
            .filter((e) => dayjs(e.start).isAfter(ahora))
            .sort((a, b) => dayjs(a.start).valueOf() - dayjs(b.start).valueOf())
            .slice(0, 5);
    }, [eventosFiltrados]);

    // Carga perezosa de direcciones de próximos eventos (si tienen idDireccion)
    useEffect(() => {
        proximosEventos.forEach((e) => {
            const id = e.idDireccion;
            if (!id) return;
            const key = String(id);
            if (dirSolicitadasRef.current.has(key) || Object.prototype.hasOwnProperty.call(dirCache, key)) {
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
            titulo: '',
            descripcion: '',
            allDay: false,
            inicio,
            fin,
            fecha: dayjs(info.date).startOf('day').toDate(),
            tipo: null,
            agregarDireccion: false,
            regionId: null,
            comunaId: null,
            calle: '',
            numero: '',
        }));
        setDialogoVisible(true);
    };

    const abrirDialogoCrear = () => {
        const baseDate = dayjs();
        const inicio = baseDate.hour(10).minute(0).second(0).millisecond(0).toDate();
        const fin = baseDate.hour(11).minute(0).second(0).millisecond(0).toDate();
        setForm((f) => ({
            ...f,
            titulo: '',
            descripcion: '',
            allDay: false,
            inicio,
            fin,
            fecha: baseDate.startOf('day').toDate(),
            tipo: null,
            agregarDireccion: false,
            regionId: null,
            comunaId: null,
            calle: '',
            numero: '',
        }));
        setDialogoVisible(true);
    };

    const onGuardarEvento = async () => {
        try {
            if (!form.titulo || (form.allDay ? !form.fecha : (!form.inicio || !form.fin)) || !form.tipo) {
                toast.warn('Completa título y fechas');
                return;
            }
            const eventodata = {
                nombre: form.titulo,
                descripcion: form.descripcion || null,
                fechaHoraInicio: form.allDay ? dayjs(form.fecha).startOf('day').toISOString() : dayjs(form.inicio).toISOString(),
                fechaHoraFin: form.allDay ? dayjs(form.fecha).endOf('day').toISOString() : dayjs(form.fin).toISOString(),
                esTodoElDia: !!form.allDay,
                idTipoEvento: Number(form.tipo) || form.tipo,
                // idDireccion se podría setear si ya existiera, pero aquí se crea aparte en el backend
            };

            const direcciondata = form.agregarDireccion && form.comunaId && form.calle && form.numero
                ? {
                    calle: form.calle,
                    numero: String(form.numero),
                    idComuna: Number(form.comunaId) || form.comunaId,
                }
                : undefined;

            await createEvento({ eventodata, direcciondata });
            toast.success('Evento creado');
            setDialogoVisible(false);
            // refrescar
            const ev = await getEventos();
            // Reusar la misma lógica con paleta triádica, usando los tipos actuales del estado
            const triad2 = tinycolor('#318CE7').triad();
            const tipoIndexMap2 = new Map((tipos || []).map((t, i) => [String(t.value), i]));
            const colorForTipo2 = (tipoId) => {
                const idx = tipoIndexMap2.get(String(tipoId)) ?? 0;
                const anchor = triad2[idx % 3].clone();
                const level = Math.floor(idx / 3);
                let variant = anchor.clone();
                if (level > 0) {
                    const brightAmt = Math.min(10 + (level - 1) * 8, 35);
                    const satAmt = Math.min(8 + (level - 1) * 4, 24);
                    variant = (level % 2 === 1) ? anchor.lighten(brightAmt) : anchor.darken(brightAmt);
                    if (level % 3 === 1) variant = variant.saturate(satAmt);
                    else if (level % 3 === 2) variant = variant.desaturate(satAmt);
                    else variant = variant.saturate(4);
                }
                const bg = variant.toHexString();
                const border = variant.darken(14).toHexString();
                const text = pickTextColor(bg);
                return { bg, border, text };
            };
            const mapped = (ev?.data || ev || []).map((e) => {
                const tipoId = e.idTipoEvento ?? e.tipoEvento?.id ?? e.tipoId ?? null;
                const col = (tipoId != null) ? colorForTipo2(tipoId) : undefined;
                const tipoLabel = tipoId != null ? (tipos.find((t) => String(t.value) === String(tipoId))?.label || 'General') : undefined;
                return {
                    id: e.id ?? e._id ?? String(Math.random()),
                    title: e.nombre ?? e.title ?? 'Evento',
                    start: e.fechaHoraInicio ? dayjs(e.fechaHoraInicio).toISOString() : dayjs(e.start).toISOString(),
                    end: e.fechaHoraFin ? dayjs(e.fechaHoraFin).toISOString() : (e.end ? dayjs(e.end).toISOString() : undefined),
                    allDay: Boolean(e.esTodoElDia ?? e.allDay),
                    tipoId: tipoId != null ? String(tipoId) : null,
                    tipoLabel,
                    descripcion: e.descripcion ?? e.description ?? '',
                    idDireccion: e.idDireccion ?? e.direccion?.id ?? null,
                    backgroundColor: col?.bg,
                    borderColor: col?.border,
                    textColor: col?.text,
                };
            });
            setEventos(mapped);
        } catch (err) {
            console.error(err);
            toast.error('No se pudo crear el evento');
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
            // Construimos un objeto de solo lectura para el detalle
            const data = {
                id: ev.id,
                title: ev.title,
                start: ev.start ?? (ev._instance?.range?.start ?? null),
                end: ev.end ?? (ev._instance?.range?.end ?? null),
                allDay: ev.allDay,
                backgroundColor: ev.backgroundColor,
                borderColor: ev.borderColor,
                textColor: ev.textColor,
                tipoId: ev.extendedProps?.tipoId ?? null,
                tipoLabel: ev.extendedProps?.tipoLabel ?? undefined,
                descripcion: ev.extendedProps?.descripcion ?? '',
                idDireccion: ev.extendedProps?.idDireccion ?? null,
            };
            setSelectedEvent(data);
            setDetalleVisible(true);
            setEditMode(false);
            setEditForm(null);

            // limpiar estado de dirección y cargar si corresponde
            setDireccionDetalle(null);
            setDireccionError(null);
            if (data.idDireccion) {
                setDireccionLoading(true);
                try {
                    const resp = await getDireccion(data.idDireccion);
                    const dir = resp?.data || resp || null;
                    setDireccionDetalle(dir);
                } catch (e) {
                    setDireccionError('No se pudo cargar la dirección');
                } finally {
                    setDireccionLoading(false);
                }
            }
        } catch (e) {
            // No bloquear el click en caso de estructura inesperada
            setSelectedEvent(null);
            setDetalleVisible(false);
        }
    };

    const prefillEditFormFromSelected = () => {
        if (!selectedEvent) return null;
        return {
            titulo: selectedEvent.title || '',
            descripcion: selectedEvent.descripcion || '',
            allDay: !!selectedEvent.allDay,
            inicio: selectedEvent.start ? new Date(selectedEvent.start) : null,
            fin: selectedEvent.end ? new Date(selectedEvent.end) : null,
            fecha: selectedEvent.start ? dayjs(selectedEvent.start).startOf('day').toDate() : null,
            tipo: selectedEvent.tipoId || null,
            // Dirección: si existe, mostrar campos llenos; si no, permitir agregar
            agregarDireccion: !!selectedEvent.idDireccion,
            regionId: null,
            comunaId: null,
            calle: direccionDetalle?.calle || '',
            numero: direccionDetalle?.numero || '',
        };
    };

    // Reemplazado por versión asíncrona más abajo
    const onEditClick = async () => {
        const f = prefillEditFormFromSelected();
        setEditForm(f);
        setEditMode(true);

        // Si hay dirección, asegurar que región/comuna quedan preseleccionadas y comunas cargadas
        try {
            let dir = direccionDetalle;
            if (selectedEvent?.idDireccion && !dir) {
                // Cargar dirección si aún no está
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
                    const comunasOpt = (comunasApi || []).map((c) => ({ label: c.nombre || c.name, value: c.id || c.codigo || c.value }));
                    setComunasEdit(comunasOpt);
                } catch {
                    setComunasEdit([]);
                }
            }
        } catch {
            // Silencioso: edición continúa aunque no se precargue región/comuna
        }
    };

    const onCancelarEdicion = () => {
        setEditMode(false);
        setEditForm(null);
    };

    const onDeleteClick = async () => {
        try {
            if (!selectedEvent?.id) return;

            // Cerrar el popup de detalle para evitar que la confirmación quede detrás
            setDetalleVisible(false);
            await new Promise((r) => setTimeout(r, 0));

            // Confirmación de eliminación usando el helper común
            const result = await showConfirmAlert(
                'Eliminar evento',
                `¿Deseas eliminar el evento "${selectedEvent.title}"? Esta acción no se puede deshacer.`,
                'Sí, eliminar',
                'Cancelar'
            );
            if (!result?.isConfirmed) {
                // Si el usuario cancela, reabrimos el detalle
                setDetalleVisible(true);
                return;
            }
            await deleteEvento(selectedEvent.id);
            toast.success('Evento eliminado');
            setDetalleVisible(false);
            // refrescar eventos
            const ev = await getEventos();
            const triad2 = tinycolor('#318CE7').triad();
            const tipoIndexMap2 = new Map((tipos || []).map((t, i) => [String(t.value), i]));
            const colorForTipo2 = (tipoId) => {
                const idx = tipoIndexMap2.get(String(tipoId)) ?? 0;
                const anchor = triad2[idx % 3].clone();
                const level = Math.floor(idx / 3);
                let variant = anchor.clone();
                if (level > 0) {
                    const brightAmt = Math.min(10 + (level - 1) * 8, 35);
                    const satAmt = Math.min(8 + (level - 1) * 4, 24);
                    variant = (level % 2 === 1) ? anchor.lighten(brightAmt) : anchor.darken(brightAmt);
                    if (level % 3 === 1) variant = variant.saturate(satAmt);
                    else if (level % 3 === 2) variant = variant.desaturate(satAmt);
                    else variant = variant.saturate(4);
                }
                const bg = variant.toHexString();
                const border = variant.darken(14).toHexString();
                const text = pickTextColor(bg);
                return { bg, border, text };
            };
            const mapped = (ev?.data || ev || []).map((e) => {
                const tipoId = e.idTipoEvento ?? e.tipoEvento?.id ?? e.tipoId ?? null;
                const col = (tipoId != null) ? colorForTipo2(tipoId) : undefined;
                const tipoLabel = tipoId != null ? (tipos.find((t) => String(t.value) === String(tipoId))?.label || 'General') : undefined;
                return {
                    id: e.id ?? e._id ?? String(Math.random()),
                    title: e.nombre ?? e.title ?? 'Evento',
                    start: e.fechaHoraInicio ? dayjs(e.fechaHoraInicio).toISOString() : dayjs(e.start).toISOString(),
                    end: e.fechaHoraFin ? dayjs(e.fechaHoraFin).toISOString() : (e.end ? dayjs(e.end).toISOString() : undefined),
                    allDay: Boolean(e.esTodoElDia ?? e.allDay),
                    tipoId: tipoId != null ? String(tipoId) : null,
                    tipoLabel,
                    descripcion: e.descripcion ?? e.description ?? '',
                    idDireccion: e.idDireccion ?? e.direccion?.id ?? null,
                    backgroundColor: col?.bg,
                    borderColor: col?.border,
                    textColor: col?.text,
                };
            });
            setEventos(mapped);
        } catch (err) {
            console.error(err);
            toast.error('No se pudo eliminar el evento');
        }
    };

    const onGuardarEdicion = async () => {
        try {
            if (!selectedEvent) return;
            const f = editForm;
            if (!f) return;
            if (!f.titulo || (f.allDay ? !f.fecha : (!f.inicio || !f.fin)) || !f.tipo) {
                toast.warn('Completa título y fechas');
                return;
            }
            const eventodata = {
                nombre: f.titulo,
                descripcion: f.descripcion || null,
                fechaHoraInicio: f.allDay ? dayjs(f.fecha).startOf('day').toISOString() : dayjs(f.inicio).toISOString(),
                fechaHoraFin: f.allDay ? dayjs(f.fecha).endOf('day').toISOString() : dayjs(f.fin).toISOString(),
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
                // Remover dirección si existía: enviar nulos según la convención
                eventodata.idDireccion = null;
                direcciondata = null;
            }

            await updateEvento(selectedEvent.id, { eventodata, direcciondata });
            toast.success('Evento actualizado');
            setEditMode(false);
            setEditForm(null);
            setDetalleVisible(false);
            // refrescar eventos
            const ev = await getEventos();
            const triad2 = tinycolor('#318CE7').triad();
            const tipoIndexMap2 = new Map((tipos || []).map((t, i) => [String(t.value), i]));
            const colorForTipo2 = (tipoId) => {
                const idx = tipoIndexMap2.get(String(tipoId)) ?? 0;
                const anchor = triad2[idx % 3].clone();
                const level = Math.floor(idx / 3);
                let variant = anchor.clone();
                if (level > 0) {
                    const brightAmt = Math.min(10 + (level - 1) * 8, 35);
                    const satAmt = Math.min(8 + (level - 1) * 4, 24);
                    variant = (level % 2 === 1) ? anchor.lighten(brightAmt) : anchor.darken(brightAmt);
                    if (level % 3 === 1) variant = variant.saturate(satAmt);
                    else if (level % 3 === 2) variant = variant.desaturate(satAmt);
                    else variant = variant.saturate(4);
                }
                const bg = variant.toHexString();
                const border = variant.darken(14).toHexString();
                const text = pickTextColor(bg);
                return { bg, border, text };
            };
            const mapped = (ev?.data || ev || []).map((e) => {
                const tipoId = e.idTipoEvento ?? e.tipoEvento?.id ?? e.tipoId ?? null;
                const col = (tipoId != null) ? colorForTipo2(tipoId) : undefined;
                const tipoLabel = tipoId != null ? (tipos.find((t) => String(t.value) === String(tipoId))?.label || 'General') : undefined;
                return {
                    id: e.id ?? e._id ?? String(Math.random()),
                    title: e.nombre ?? e.title ?? 'Evento',
                    start: e.fechaHoraInicio ? dayjs(e.fechaHoraInicio).toISOString() : dayjs(e.start).toISOString(),
                    end: e.fechaHoraFin ? dayjs(e.fechaHoraFin).toISOString() : (e.end ? dayjs(e.end).toISOString() : undefined),
                    allDay: Boolean(e.esTodoElDia ?? e.allDay),
                    tipoId: tipoId != null ? String(tipoId) : null,
                    tipoLabel,
                    descripcion: e.descripcion ?? e.description ?? '',
                    idDireccion: e.idDireccion ?? e.direccion?.id ?? null,
                    backgroundColor: col?.bg,
                    borderColor: col?.border,
                    textColor: col?.text,
                };
            });
            setEventos(mapped);
        } catch (err) {
            console.error(err);
            toast.error('No se pudo actualizar el evento');
        }
    };

    // Formatea una línea de fecha para el header del detalle (estilo Google Calendar)
    const formatHeaderFecha = (ev) => {
        if (!ev || !ev.start) return '';
        const start = dayjs(ev.start);
        const end = ev.end ? dayjs(ev.end) : null;
        if (ev.allDay) return start.format('dddd, D [de] MMMM');
        if (end && start.isSame(end, 'day')) {
            return start.format('dddd, D [de] MMMM');
        }
        if (end) {
            return `${start.format('ddd D MMM')} — ${end.format('ddd D MMM')}`;
        }
        return start.format('dddd, D [de] MMMM');
    };

    const Toolbar = () => (
        <div className="flex items-center justify-between py-4 px-2">
            <h1 className="text-2xl font-semibold text-slate-800">Calendario Operativo</h1>
            <div className="flex items-center gap-2">
                <MultiSelect
                    value={filtroTipos}
                    onChange={(e) => setFiltroTipos(e.value)}
                    options={tipos}
                    optionLabel="label"
                    optionValue="value"
                    placeholder="Filtrar tipos"
                    display="chip"
                    className="w-64"
                    showClear
                    itemTemplate={(option) => (
                        <div className="flex items-center gap-2">
                            <span
                                className="inline-block h-2.5 w-2.5 rounded-full"
                                style={{ backgroundColor: getTipoBg(option.value) }}
                            />
                            <span>{option.label}</span>
                        </div>
                    )}
                    selectedItemTemplate={(value) => {
                        const opt = tipos.find((t) => String(t.value) === String(value));
                        if (!opt) return null;
                        return (
                            <div className="flex items-center gap-1">
                                <span
                                    className="inline-block h-2 w-2 rounded-full"
                                    style={{ backgroundColor: getTipoBg(opt.value) }}
                                />
                                <span className="text-xs">{opt.label}</span>
                            </div>
                        );
                    }}
                />
                {[
                    { key: VISTAS.year, label: 'Año' },
                    { key: VISTAS.month, label: 'Mes' },
                    { key: VISTAS.week, label: 'Semana' },
                    { key: VISTAS.day, label: 'Día' },
                ].map((t) => (
                    <button
                        key={t.key}
                        onClick={() => cambiarVista(t.key)}
                        className={`px-3 py-1.5 rounded-md text-sm border transition ${
                            vista === t.key
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                    >
                        {t.label}
                    </button>
                ))}
                <Button icon="pi pi-plus" label="Crear evento" onClick={abrirDialogoCrear} className="ml-2" />
                {loading && <i className="pi pi-spinner pi-spin text-slate-500 ml-2" aria-label="Cargando" />}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="mx-auto px-4 sm:px-6 lg:px-1 ">
                <Toolbar />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Calendario */}
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-4 fc-compact">
                        <FullCalendar
                            ref={calendarRef}
                            plugins={[interactionPlugin, dayGridPlugin, timeGridPlugin, listPlugin, multiMonthPlugin]}
                            initialView={vista}
                            headerToolbar={{ left: 'prev', center: 'title', right: 'next' }}
                            locale="es"
                            height="auto"
                            firstDay={1}
                            navLinks={true}
                            selectable={true}
                            dayMaxEvents={3}
                            events={eventosFiltrados}
                            eventClick={onEventClick}
                            eventDidMount={(info) => {
                                if (info.event.extendedProps?.textColor) {
                                    info.el.style.color = info.event.extendedProps.textColor;
                                }
                            }}
                            dateClick={onDateClick}
                            eventTimeFormat={{ hour: '2-digit', minute: '2-digit', meridiem: false }}
                            slotMinTime="07:00:00"
                            slotMaxTime="23:00:00"
                            nowIndicator={true}
                            loading={(isLoading) => setLoading(isLoading)}
                            multiMonthMaxColumns={8}
                        />
                    </div>

                    {/* Próximos eventos */}
                    <aside className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                        <h2 className="text-lg font-medium text-slate-800 mb-4">Próximos eventos</h2>
                        {proximosEventos.length === 0 ? (
                            <div className="text-sm text-slate-500">No hay eventos próximos</div>
                        ) : (
                            <Accordion >
                                {proximosEventos.map((e) => (
                                    <AccordionTab
                                        key={e.id}
                                        header={
                                            <div className="flex items-center gap-3">
                                                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: e.backgroundColor || '#2563eb' }} />
                                                <div className="text-sm">
                                                    <div className="font-medium text-slate-800">{e.title}</div>
                                                    <div className="text-xs text-slate-500">
                                                        {dayjs(e.start).format('ddd D MMM, HH:mm')} {e.end ? `- ${dayjs(e.end).format('HH:mm')}` : ''}
                                                    </div>
                                                </div>
                                            </div>
                                        }
                                    >
                                        <div className="text-sm text-slate-700 space-y-2">
                                            {/* Inicio / Fin */}
                                            <div className="flex items-start gap-2">
                                                <i className="pi pi-calendar text-slate-500 mt-0.5" />
                                                <div>
                                                    {e.allDay ? (
                                                        <>
                                                            <div><span className="font-medium">Inicio: </span>{e.start ? dayjs(e.start).format('dddd D [de] MMMM') : '—'}</div>
                                                            <div><span className="font-medium">Fin: </span>{e.end ? dayjs(e.end).format('dddd D [de] MMMM') : '—'}</div>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <div><span className="font-medium">Inicio: </span>{e.start ? dayjs(e.start).format('ddd D MMM, HH:mm') : '—'}</div>
                                                            <div><span className="font-medium">Fin: </span>{e.end ? dayjs(e.end).format('ddd D MMM, HH:mm') : '—'}</div>
                                                        </>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Dirección */}
                                            <div className="flex items-start gap-2">
                                                <i className="pi pi-map-marker text-slate-500 mt-0.5" />
                                                <div>
                                                    {e.idDireccion ? (
                                                        (() => {
                                                            const key = String(e.idDireccion);
                                                            const dir = dirCache[key];
                                                            if (dir === undefined) {
                                                                return <span className="text-slate-500 flex items-center gap-2"><i className="pi pi-spinner pi-spin" /> Cargando dirección...</span>;
                                                            }
                                                            if (dir && dir.__error) {
                                                                return <span className="text-red-600">No se pudo cargar la dirección</span>;
                                                            }
                                                            if (!dir) {
                                                                return <span className="text-slate-500">Sin datos de dirección</span>;
                                                            }
                                                            return (
                                                                <div>
                                                                    <div>{dir.calle || 'Calle'} {dir.numero || ''}</div>
                                                                    {dir.comuna?.nombre && (
                                                                        <div className="text-slate-500">{dir.comuna.nombre}</div>
                                                                    )}
                                                                    {dir.comuna?.region?.nombre && (
                                                                        <div className="text-slate-500">{dir.comuna.region.nombre}</div>
                                                                    )}
                                                                </div>
                                                            );
                                                        })()
                                                    ) : (
                                                        <span className="text-slate-500">Sin dirección</span>
                                                    )}
                                                </div>
                                            </div>

                                            {e.tipoLabel && (
                                                <div className="flex items-center gap-2">
                                                    <i className="pi pi-bookmark text-slate-500" />
                                                    <span>{e.tipoLabel}</span>
                                                </div>
                                            )}
                                            {e.descripcion && (
                                                <div className="flex items-start gap-2">
                                                    <i className="pi pi-align-left text-slate-500 mt-0.5" />
                                                    <p className="whitespace-pre-line">{e.descripcion}</p>
                                                </div>
                                            )}
                                        </div>
                                    </AccordionTab>
                                ))}
                            </Accordion>
                        )}
                    </aside>
                </div>
            </div>

            {/* Diálogo crear/editar evento */}
            <Dialog
                header="Nuevo evento"
                visible={dialogoVisible}
                style={{ width: '32rem' }}
                modal
                onHide={() => setDialogoVisible(false)}
                footer={
                    <div className="flex justify-end gap-2">
                        <Button label="Cancelar" className="p-button-text" onClick={() => setDialogoVisible(false)} />
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
                        <label htmlFor="allDayChk" className="text-sm text-slate-700">Todo el día</label>
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
                            valueTemplate={(option, props) => (
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
                            )}
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
                            <label htmlFor="agregarDirChk" className="text-sm text-slate-700">Agregar dirección</label>
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
                                            const comunasOpt = (comunasApi || []).map((c) => ({ label: c.nombre || c.name, value: c.id || c.codigo || c.value }));
                                            setComunas(comunasOpt);
                                        } catch {
                                            setComunas([]);
                                        }
                                    }}
                                    options={regiones}
                                    placeholder="Región"
                                    className="w-full min-w-0 flex-1"
                                    style={{ maxWidth: '100%' }}
                                    valueTemplate={(option, props) => (
                                        !option ? (
                                            <span className="text-slate-400">{props.placeholder}</span>
                                        ) : (
                                            <span className="block truncate max-w-full">{option.label ?? option.nombre ?? option.name}</span>
                                        )
                                    )}
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
                                    style={{ maxWidth: '100%' }}
                                    valueTemplate={(option, props) => (
                                        !option ? (
                                            <span className="text-slate-400">{props.placeholder}</span>
                                        ) : (
                                            <span className="block truncate max-w-full">{option.label ?? option.nombre ?? option.name}</span>
                                        )
                                    )}
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

            {/* Diálogo detalle de evento */}
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
                                    {selectedEvent?.title || 'Detalle de evento'}
                                </div>
                                <div className="text-sm text-slate-500">
                                    {formatHeaderFecha(selectedEvent)}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-1 text-slate-500">
                            <button className="p-1 rounded hover:bg-slate-100" title="Editar" type="button" onClick={onEditClick}>
                                <MdEdit className="h-4 w-4" />
                            </button>
                            <button className="p-1 rounded hover:bg-slate-100" title="Eliminar" type="button" onClick={onDeleteClick}>
                                <MdDelete className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                }
                visible={detalleVisible}
                style={{ width: '30rem' }}
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
                            <Button label="Cerrar" className="p-button-text" onClick={() => setDetalleVisible(false)} />
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
                                        <label htmlFor="editAllDayChk" className="text-sm text-slate-700">Todo el día</label>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-sm text-slate-700">
                                    {selectedEvent.allDay ? (
                                        <div>
                                            <div><span className="font-medium">Inicio: </span>{selectedEvent.start ? dayjs(selectedEvent.start).format('dddd D [de] MMMM') : '—'}</div>
                                            <div><span className="font-medium">Fin: </span>{selectedEvent.end ? dayjs(selectedEvent.end).format('dddd D [de] MMMM') : '—'}</div>
                                        </div>
                                    ) : (
                                        <div>
                                            <div><span className="font-medium">Inicio: </span>{selectedEvent.start ? dayjs(selectedEvent.start).format('ddd D MMM, HH:mm') : '—'}</div>
                                            <div><span className="font-medium">Fin: </span>{selectedEvent.end ? dayjs(selectedEvent.end).format('ddd D MMM, HH:mm') : '—'}</div>
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
                                        value={editForm?.descripcion || ''}
                                        onChange={(e) => setEditForm((f) => ({ ...f, descripcion: e.target.value }))}
                                        placeholder="Descripción del evento"
                                    />
                                ) : (
                                    <div>
                                        <p className="text-sm text-slate-700 whitespace-pre-line">{selectedEvent.descripcion}</p>
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

                        {/* Título editable */}
                        <div className="flex items-start gap-2">
                            <i className="pi pi-tag text-slate-500 mt-0.5" />
                            {editMode ? (
                                <InputText
                                    className="w-full"
                                    value={editForm?.titulo || ''}
                                    onChange={(e) => setEditForm((f) => ({ ...f, titulo: e.target.value }))}
                                    placeholder="Título del evento"
                                />
                            ) : (
                                <div className="text-sm text-slate-700">{selectedEvent.title}</div>
                            )}
                        </div>
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
                                                onChange={(e) => setEditForm((f) => ({ ...f, agregarDireccion: e.target.checked }))}
                                            />
                                            <label htmlFor="editAgregarDirChk" className="text-sm text-slate-700">Agregar dirección</label>
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
                                                                const comunasOpt = (comunasApi || []).map((c) => ({ label: c.nombre || c.name, value: c.id || c.codigo || c.value }));
                                                                setComunasEdit(comunasOpt);
                                                            } catch {
                                                                setComunasEdit([]);
                                                            }
                                                        }}
                                                        options={regiones}
                                                        placeholder="Región"
                                                        className="w-full min-w-0 flex-1"
                                                        style={{ maxWidth: '100%' }}
                                                        valueTemplate={(option, props) => (
                                                            !option ? (
                                                                <span className="text-slate-400">{props.placeholder}</span>
                                                            ) : (
                                                                <span className="block truncate max-w-full">{option.label ?? option.nombre ?? option.name}</span>
                                                            )
                                                        )}
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
                                                        style={{ maxWidth: '100%' }}
                                                        valueTemplate={(option, props) => (
                                                            !option ? (
                                                                <span className="text-slate-400">{props.placeholder}</span>
                                                            ) : (
                                                                <span className="block truncate max-w-full">{option.label ?? option.nombre ?? option.name}</span>
                                                            )
                                                        )}
                                                    />
                                                </div>
                                                <div className="flex items-center gap-2 md:col-span-1">
                                                    <i className="pi pi-map text-slate-500" />
                                                    <InputText
                                                        className="w-full"
                                                        value={editForm?.calle || ''}
                                                        onChange={(e) => setEditForm((f) => ({ ...f, calle: e.target.value }))}
                                                        placeholder="Calle"
                                                    />
                                                </div>
                                                <div className="flex items-center gap-2 md:col-span-1">
                                                    <i className="pi pi-hashtag text-slate-500" />
                                                    <InputText
                                                        className="w-full"
                                                        value={editForm?.numero || ''}
                                                        onChange={(e) => setEditForm((f) => ({ ...f, numero: e.target.value }))}
                                                        placeholder="Número"
                                                    />
                                                </div>
                                                {/* Región/Comuna ahora disponibles en edición */}
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
                                        {direccionError && (
                                            <div className="text-sm text-red-600">{direccionError}</div>
                                        )}
                                        {!direccionLoading && !direccionError && (
                                            selectedEvent.idDireccion ? (
                                                direccionDetalle ? (
                                                    <div className="text-sm text-slate-700">
                                                        {(() => {
                                                            const calle = direccionDetalle.calle || '';
                                                            const numero = direccionDetalle.numero || '';
                                                            const comuna = direccionDetalle.comuna?.nombre || '';
                                                            const region = direccionDetalle.comuna?.region?.nombre || '';
                                                            const linea = [
                                                                [calle, numero].filter(Boolean).join(' '),
                                                                comuna,
                                                                region,
                                                            ].filter(Boolean).join(', ');
                                                            return <div>{linea || 'Sin datos de dirección'}</div>;
                                                        })()}
                                                    </div>
                                                ) : (
                                                    <div className="text-sm text-slate-500">Sin datos de dirección</div>
                                                )
                                            ) : (
                                                <div className="text-sm text-slate-500">Este evento no tiene dirección asociada</div>
                                            )
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-sm text-slate-500">No se pudo cargar el detalle del evento.</div>
                )}
            </Dialog>

            {/* Toasts mostrados por react-toastify global */}
        </div>
    );
};

export default CalendarioOperativo;