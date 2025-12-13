import { useEffect, useMemo, useRef, useState } from 'react';
import ReactDOMServer from 'react-dom/server';
import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import 'dayjs/locale/es';
import { MdCalendarToday, MdHelpOutline, MdCake, MdCheckCircle, MdStar } from 'react-icons/md';
import Tooltip from '@components/Tooltip.jsx';

// Servicios (solo lectura)
import { getEventos, getTiposEvento, getEventosRecurrentes } from '../services/calendario.service.js';
import { getDireccion } from '../services/direccion.service.js';

// FullCalendar
import FullCalendar from '@fullcalendar/react';
import interactionPlugin from '@fullcalendar/interaction';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import multiMonthPlugin from '@fullcalendar/multimonth';
import rrulePlugin from '@fullcalendar/rrule';

// PrimeReact
import { Dialog } from 'primereact/dialog';
import { TabView, TabPanel } from 'primereact/tabview';

import { toast } from 'react-toastify';
import CalendarToolbar from '@components/calendar/CalendarToolbar';
import CalendarRecToolbar from '@components/calendar/CalendarRecToolbar';
import ProximosEventosPanel from '@components/calendar/ProximosEventosPanel';
import { FC_TRUNCATE_CSS } from '@helpers/calendarCss';
import { buildTipoColorMap, getTipoBgFromMap } from '@helpers/calendarColors';
import { formatHeaderFecha, mapEventosConColores } from '@helpers/calendarFormat';
import { mapRecurrentesToEvents, computeProximosEventos, computeProximosRecurrentes } from '@helpers/calendarRecurrentes';

dayjs.extend(localizedFormat);
dayjs.locale('es');

const VISTAS = {
	year: 'multiMonthYear',
	month: 'dayGridMonth',
	week: 'timeGridWeek',
	day: 'timeGridDay',
};

import { useLocation } from 'react-router-dom';

const CalendarioOperativoBasic = () => {
    const location = useLocation();
	const calendarRef = useRef(null);
    const recCalendarRef = useRef(null);

	// CSS truncado importado desde helper

  const [activeIndex, setActiveIndex] = useState(0); // 0: Normal, 1: Recurrentes

	const [loading, setLoading] = useState(false);
	const [eventos, setEventos] = useState([]);
	const [tipos, setTipos] = useState([]);
	const [filtroTipos, setFiltroTipos] = useState([]);
	const [detalleVisible, setDetalleVisible] = useState(false);
	const [selectedEvent, setSelectedEvent] = useState(null);
    const [selectedIsRecurrent, setSelectedIsRecurrent] = useState(false);
	const [direccionDetalle, setDireccionDetalle] = useState(null);
	const [direccionLoading, setDireccionLoading] = useState(false);
	const [direccionError, setDireccionError] = useState(null);
	// Cache de direcciones para "Próximos eventos"
	const [dirCache, setDirCache] = useState({}); // { [idDireccion]: direccion | {__error: true} | null }
	const dirSolicitadasRef = useRef(new Set());

	const [vista, setVista] = useState(VISTAS.month);
	// Recurrentes
	const [recLoading, setRecLoading] = useState(false);
	const [recEventos, setRecEventos] = useState([]);
	const [recVista, setRecVista] = useState(VISTAS.month);
		const [recFiltroTipos, setRecFiltroTipos] = useState(['cumple', 'ingreso', 'fundacion']);

	// Selección de color de texto usando WCAG: intenta AA (isReadable) y si no, usa mayor contraste
		// colores manejados por helpers

	// Mapa de colores por tipo (bg, border, text), basado en paleta triádica de #318CE7.
	// Si hay más de 3 tipos, se varía el brillo (lighten/darken) por "anillos".
		const tipoColorMap = useMemo(() => buildTipoColorMap(tipos), [tipos]);

		const getTipoBg = (id) => getTipoBgFromMap(tipoColorMap, id);

	// Cargar tipos y eventos (solo lectura)
	useEffect(() => {
		const cargar = async () => {
			setLoading(true);
			try {
				const [ev, tps] = await Promise.all([
					getEventos().catch(() => []),
					getTiposEvento().catch(() => []),
				]);

						const tiposOpt = (tps?.data || tps || []).map((t) => ({
					label: t?.nombre || t?.name || t?.label || 'General',
					value: t?.id || t?.value || t?.codigo || 'general',
					color: t?.color || undefined,
				}));
				setTipos(tiposOpt);
						const colorMap = buildTipoColorMap(tiposOpt);
						const getColorForTipo = (tipoId) => colorMap[String(tipoId)];
						const mapped = mapEventosConColores((ev?.data || ev || []), tiposOpt, getColorForTipo);
						setEventos(mapped);
                        
                        // DEEP LINKING LOGIC
                        if (location.state && location.state.eventId) {
                             const targetId = String(location.state.eventId);
                             const isRecurrent = location.state.isRecurrent;
                             const targetDate = location.state.date ? dayjs(location.state.date).toDate() : null;

                             if (!isRecurrent) {
                                 const found = mapped.find(e => String(e.id) === targetId);
                                 if (found) {
                                     setSelectedEvent(found);
                                     setSelectedIsRecurrent(false);
                                     setDetalleVisible(true);
                                     // Navigate calendar to that date
                                     if (found.start) {
                                         setTimeout(() => {
                                             const api = calendarRef.current?.getApi?.();
                                             api?.gotoDate(found.start);
                                         }, 500);
                                     }
                                 }
                             } else {
                                 // If recurrent, allow the other effect to handle it after switching tab and loading data
                                 setActiveIndex(1);
                             }
                        }

			} catch (err) {
				console.error('Error cargando calendario', err);
				toast.error('No se pudieron cargar los eventos');
			} finally {
				setLoading(false);
			}
		};
		cargar();
        // eslint-disable-next-line react-hooks/exhaustive-deps
	}, [location.state]); // Add location.state dependency

	const eventosFiltrados = useMemo(() => {
		if (!filtroTipos || filtroTipos.length === 0) return eventos;
		const set = new Set((filtroTipos || []).map((v) => String(v)));
		return eventos.filter((e) => set.has(String(e.tipoId)));
	}, [eventos, filtroTipos]);

		const proximosEventos = useMemo(() => computeProximosEventos(eventosFiltrados, 4), [eventosFiltrados]);

    // Handle Deep Linking for Recurrent Events
    useEffect(() => {
        if (location.state && location.state.eventId && location.state.isRecurrent) {
             // Only try to find if we have recurrent events loaded
             if (recEventos.length > 0) {
                 const targetId = String(location.state.eventId);
                 const found = recEventos.find(e => String(e.id) === targetId);
                 
                 if (found) {
                     // Need to construct the "display" event object same as onRecEventClick
                     const props = found.extendedProps || {};
                     const startDate = location.state.date ? dayjs(location.state.date).toDate() : (found.start ?? found._instance?.range?.start ?? null);
                     // If end is missing for recurrent event (usually allDay), assume 1 day duration
                     const endDate = (found.end ?? found._instance?.range?.end) || (startDate ? dayjs(startDate).add(1, 'day').toDate() : null);

                     const data = {
                        id: found.id,
                        title: found.title,
                        start: startDate,
                        end: endDate,
                        allDay: found.allDay,
                        backgroundColor: found.backgroundColor,
                        borderColor: found.borderColor,
                        textColor: found.textColor,
                        tipoId: null,
                        tipoLabel:
                            props?.tipoRec === 'cumple' ? 'Cumpleaños' :
                            props?.tipoRec === 'ingreso' ? 'Ingreso' :
                            props?.tipoRec === 'fundacion' ? 'Fundación' : undefined,
                        descripcion: props?.descripcion || '',
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

                     // Navigate
                     if (location.state.date) {
                         const d = dayjs(location.state.date).toDate();
                         setTimeout(() => {
                            const api = recCalendarRef.current?.getApi?.();
                            api?.gotoDate(d);
                        }, 500);
                     }
                 }
             }
        }
    }, [recEventos, location.state]);

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

	const cambiarVista = (v) => {
		setVista(v);
		const api = calendarRef.current?.getApi?.();
		api?.changeView(v);
	};

	// Navegar a una fecha específica en el calendario normal
	const gotoFechaNormal = (date) => {
		try {
			if (activeIndex !== 0) {
				setActiveIndex(0);
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
			setSelectedIsRecurrent(false);
			setDetalleVisible(true);

			// limpiar estado de dirección y cargar si corresponde
			setDireccionDetalle(null);
			setDireccionError(null);
			if (data.idDireccion) {
				setDireccionLoading(true);
				try {
					const resp = await getDireccion(data.idDireccion);
					const dir = resp?.data || resp || null;
					setDireccionDetalle(dir);
				} catch {
					setDireccionError('No se pudo cargar la dirección');
				} finally {
					setDireccionLoading(false);
				}
			}
		} catch {
			setSelectedEvent(null);
			setDetalleVisible(false);
		}
	};

	// ====== ---------------- Recurrentes (solo ver) ---------------- ======
		// recurrentes ahora con helper

	const cargarRecurrentes = async () => {
		setRecLoading(true);
		try {
			const resp = await getEventosRecurrentes();
			const data = resp?.data || resp || {};
			const mapped = mapRecurrentesToEvents(data);
			setRecEventos(mapped);
		} catch {
			// noop
			toast.error('No se pudieron cargar los eventos recurrentes');
			setRecEventos([]);
		} finally {
			setRecLoading(false);
		}
	};

	useEffect(() => {
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
				props?.tipoRec === 'cumple' ? 'Cumpleaños' :
				props?.tipoRec === 'ingreso' ? 'Ingreso' :
				props?.tipoRec === 'fundacion' ? 'Fundación' : undefined,
			descripcion: props?.descripcion || '',
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
	};

  // opciones de filtro para recurrentes gestionadas en CalendarRecToolbar

	const recEventosFiltrados = useMemo(() => {
		if (!recFiltroTipos || recFiltroTipos.length === 0) return [];
		const set = new Set(recFiltroTipos);
		return recEventos.filter((e) => set.has(e.extendedProps?.tipoRec));
	}, [recEventos, recFiltroTipos]);

		const proximosRecEventos = useMemo(() => computeProximosRecurrentes(recEventosFiltrados, 4), [recEventosFiltrados]);

	// Formatea una línea de fecha para el header del detalle (estilo Google Calendar)
		// usar helper formatHeaderFecha

	const Toolbar = () => (
		<CalendarToolbar
		  title="Calendario Operativo"
		  tipos={tipos}
		  filtroTipos={filtroTipos}
		  onChangeFiltro={setFiltroTipos}
		  vista={vista}
		  VISTAS={VISTAS}
		  onChangeVista={cambiarVista}
		  loading={loading}
		  getTipoBg={getTipoBg}
		/>
	);

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
								<h1 className="text-2xl font-bold text-[#2C3E50]">
									Calendario Operativo
								</h1>
							</div>
							<Tooltip
								id="calendario-operativo-help"
								content="Calendario operativo del cuerpo de bomberos. Aquí puedes ver todos los eventos operativos programados y los hitos institucionales como cumpleaños, aniversarios de ingreso y fundaciones de compañías."
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
										? 'border-[#4EB9FA] text-[#4EB9FA]'
										: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
								}`}
							>
								Calendario Operativo
							</button>
							<button
								onClick={() => setActiveIndex(1)}
								className={`py-2 px-1 border-b-2 font-medium text-sm ${
									activeIndex === 1
										? 'border-[#4EB9FA] text-[#4EB9FA]'
										: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
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
					<TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)} className="border-0">
						<TabPanel header="Calendario Operativo">
						<Toolbar />
						<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
									selectable={false}
									dayMaxEvents={3}
									events={eventosFiltrados}
									eventClick={onEventClick}
									eventDidMount={(info) => {
										if (info.event.extendedProps?.textColor) {
											info.el.style.color = info.event.extendedProps.textColor;
										}
									}}
									eventTimeFormat={{ hour: '2-digit', minute: '2-digit', meridiem: false }}
									slotMinTime="07:00:00"
									slotMaxTime="23:00:00"
									nowIndicator={true}
									loading={(isLoading) => setLoading(isLoading)}
									multiMonthMaxColumns={8}
								/>
							</div>
											<ProximosEventosPanel
												titulo="Próximos eventos"
												items={proximosEventos}
												dirCache={dirCache}
												showDireccion="auto"
												onVerEnCalendario={gotoFechaNormal}
											/>
						</div>
					</TabPanel>

						<TabPanel header="Hitos de la institución">
									<CalendarRecToolbar
										recFiltroTipos={recFiltroTipos}
										onChangeFiltro={setRecFiltroTipos}
										recVista={recVista}
										VISTAS={VISTAS}
										onChangeVista={cambiarVistaRec}
										recLoading={recLoading}
									/>

						<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
							<div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-4 fc-compact">
								<FullCalendar
									ref={recCalendarRef}
									plugins={[interactionPlugin, dayGridPlugin, timeGridPlugin, listPlugin, multiMonthPlugin, rrulePlugin]}
									initialView={recVista}
									headerToolbar={{ left: 'prev', center: 'title', right: 'next' }}
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
											let text = ev.title || '';
											
											if (props?.tipoRec === 'fundacion' && props?.baseDate && ev.start) {
												const base = dayjs(props.baseDate);
												const occ = dayjs(ev.start);
												if (base.isValid() && occ.isValid()) {
													const years = occ.year() - base.year();
													text = `Aniversario #${years} ${props.nombreCompania || ''}`.trim();
												}
											} else if (props?.tipoRec === 'ingreso' && props?.baseDate && ev.start) {
												const base = dayjs(props.baseDate);
												const occ = dayjs(ev.start);
												if (base.isValid() && occ.isValid()) {
													const years = occ.year() - base.year();
													const nombre = [props.nombre, props.apellido].filter(Boolean).join(' ').trim();
													text = `Aniversario de ingreso N°${years} ${nombre}`.trim();
												}
											}
											
											// Obtener icono según tipo usando react-icons
											let iconSvg = '';
											if (props?.tipoRec === 'cumple') {
												// Icono de pastel/cumpleaños de Material Design
												iconSvg = ReactDOMServer.renderToStaticMarkup(
													<MdCake style={{ width: '14px', height: '14px', display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} />
												);
											} else if (props?.tipoRec === 'ingreso') {
												// Icono de check circle de Material Design
												iconSvg = ReactDOMServer.renderToStaticMarkup(
													<MdCheckCircle style={{ width: '14px', height: '14px', display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} />
												);
											} else if (props?.tipoRec === 'fundacion') {
												// Icono de estrella de Material Design
												iconSvg = ReactDOMServer.renderToStaticMarkup(
													<MdStar style={{ width: '14px', height: '14px', display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} />
												);
											}
											
											const container = document.createElement('div');
											container.style.display = 'inline-flex';
											container.style.alignItems = 'center';
											container.style.gap = '4px';
											if (iconSvg) {
												const iconDiv = document.createElement('span');
												iconDiv.innerHTML = iconSvg;
												container.appendChild(iconDiv);
											}
											const textNode = document.createTextNode(text);
											container.appendChild(textNode);
											
											return { domNodes: [container] };
										} catch {
											return { domNodes: [document.createTextNode(arg.event.title || '')] };
										}
									}}
									selectable={false}
									editable={false}
									eventStartEditable={false}
									eventDurationEditable={false}
									eventDidMount={(info) => {
										const tc = info.event.extendedProps?.textColor || info.event.textColor;
										if (tc) info.el.style.color = tc;
										const tipoRec = info.event.extendedProps?.tipoRec;
										if (tipoRec && !recFiltroTipos.includes(tipoRec)) {
											info.el.style.display = 'none';
										}
									}}
									eventTimeFormat={{ hour: '2-digit', minute: '2-digit', meridiem: false }}
									multiMonthMaxColumns={8}
									loading={(isLoading) => setRecLoading(isLoading)}
								/>
							</div>
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

			{/* Diálogo detalle de evento (solo lectura) */}
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
									{selectedIsRecurrent && selectedEvent?.__recurrentExtras?.baseDate && selectedEvent?.start ? (
										(() => {
											const base = dayjs(selectedEvent.__recurrentExtras.baseDate);
											const occ = dayjs(selectedEvent.start);
											if (base.isValid() && occ.isValid()) {
												const years = occ.year() - base.year();
												if (selectedEvent.__recurrentExtras?.tipoRec === 'fundacion') {
													return `Aniversario N°${years} ${selectedEvent.__recurrentExtras?.nombreCompania || ''}`;
												}
												if (selectedEvent.__recurrentExtras?.tipoRec === 'ingreso') {
													const nombre = [selectedEvent.__recurrentExtras?.nombre, selectedEvent.__recurrentExtras?.apellido].filter(Boolean).join(' ').trim();
													return `Aniversario de ingreso N°${years} ${nombre}`.trim();
												}
											}
											return selectedEvent?.title || 'Detalle de evento';
										})()
									) : (
										selectedEvent?.title || 'Detalle de evento'
									)}
								</div>
								<div className="text-sm text-slate-500">
									{formatHeaderFecha(selectedEvent)}
								</div>
							</div>
						</div>
					</div>
				}
				visible={detalleVisible}
				style={{ width: '30rem' }}
				modal
				onHide={() => setDetalleVisible(false)}
				footer={
					<div className="flex justify-end gap-2">
						<button className="p-2 text-slate-700 hover:bg-slate-100 rounded" onClick={() => setDetalleVisible(false)}>Cerrar</button>
					</div>
				}
			>
				{selectedEvent ? (
					<div className="space-y-4">
						<div className="flex items-start gap-2">
							<i className="pi pi-calendar text-slate-500 mt-0.5" />
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
						</div>

						{selectedEvent.descripcion && (
							<div className="flex items-start gap-2">
								<i className="pi pi-align-left text-slate-500 mt-0.5" />
								<div>
									<p className="text-sm text-slate-700 whitespace-pre-line">{selectedEvent.descripcion}</p>
								</div>
							</div>
						)}

						{selectedEvent.tipoLabel && (
							<div className="flex items-start gap-2">
								<i className="pi pi-bookmark text-slate-500 mt-0.5" />
								<div className="text-sm text-slate-700">{selectedEvent.tipoLabel}</div>
							</div>
						)}

						<div className="flex items-start gap-2">
							<i className="pi pi-map-marker text-slate-500 mt-0.5" />
							<div className="flex-1">
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
							</div>
						</div>
					</div>
				) : (
					<div className="text-sm text-slate-500">No se pudo cargar el detalle del evento.</div>
				)}
			</Dialog>
		</div>
	);
};

export default CalendarioOperativoBasic;

