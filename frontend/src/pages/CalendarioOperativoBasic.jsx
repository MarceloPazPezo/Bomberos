import { useEffect, useMemo, useRef, useState } from 'react';
import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import 'dayjs/locale/es';

// Servicios (solo lectura)
import { getEventos, getTiposEvento } from '../services/calendario.service.js';
import { getDireccion } from '../services/direccion.service.js';

// FullCalendar
import FullCalendar from '@fullcalendar/react';
import interactionPlugin from '@fullcalendar/interaction';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import multiMonthPlugin from '@fullcalendar/multimonth';

// PrimeReact
import { Dialog } from 'primereact/dialog';
import { MultiSelect } from 'primereact/multiselect';
import { Accordion, AccordionTab } from 'primereact/accordion';

import { toast } from 'react-toastify';
import tinycolor from 'tinycolor2';

dayjs.extend(localizedFormat);
dayjs.locale('es');

const VISTAS = {
	year: 'multiMonthYear',
	month: 'dayGridMonth',
	week: 'timeGridWeek',
	day: 'timeGridDay',
};

const CalendarioOperativoBasic = () => {
	const calendarRef = useRef(null);

	const [loading, setLoading] = useState(false);
	const [eventos, setEventos] = useState([]);
	const [tipos, setTipos] = useState([]);
	const [filtroTipos, setFiltroTipos] = useState([]);
	const [detalleVisible, setDetalleVisible] = useState(false);
	const [selectedEvent, setSelectedEvent] = useState(null);
	const [direccionDetalle, setDireccionDetalle] = useState(null);
	const [direccionLoading, setDireccionLoading] = useState(false);
	const [direccionError, setDireccionError] = useState(null);
	// Cache de direcciones para "Próximos eventos"
	const [dirCache, setDirCache] = useState({}); // { [idDireccion]: direccion | {__error: true} | null }
	const dirSolicitadasRef = useRef(new Set());

	const [vista, setVista] = useState(VISTAS.month);

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
		const map = {};
		for (const t of tipos) {
			map[String(t.value)] = colorForTipo(t.value);
		}
		return map;
	}, [tipos]);

	const getTipoBg = (id) => tipoColorMap[String(id)]?.bg || '#318CE7';

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

				// Paleta triádica basada en #318CE7
				const triad = tinycolor('#318CE7').triad();
				const tipoIndexMap = new Map((tiposOpt || []).map((t, i) => [String(t.value), i]));
				const colorForTipo = (tipoId) => {
					const idx = tipoIndexMap.get(String(tipoId)) ?? 0;
					const anchor = triad[idx % 3].clone();
					const level = Math.floor(idx / 3); // anillos sobre triada
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
			setSelectedEvent(null);
			setDetalleVisible(false);
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

					{/* Próximos eventos */}
					<aside className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
						<h2 className="text-lg font-medium text-slate-800 mb-4">Próximos eventos</h2>
						{proximosEventos.length === 0 ? (
							<div className="text-sm text-slate-500">No hay eventos próximos</div>
						) : (
							<Accordion>
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
									{selectedEvent?.title || 'Detalle de evento'}
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
						{/* Inicio / Fin */}
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

						{/* Descripción */}
						{selectedEvent.descripcion && (
							<div className="flex items-start gap-2">
								<i className="pi pi-align-left text-slate-500 mt-0.5" />
								<div>
									<p className="text-sm text-slate-700 whitespace-pre-line">{selectedEvent.descripcion}</p>
								</div>
							</div>
						)}

						{/* Tipo */}
						{selectedEvent.tipoLabel && (
							<div className="flex items-start gap-2">
								<i className="pi pi-bookmark text-slate-500 mt-0.5" />
								<div className="text-sm text-slate-700">{selectedEvent.tipoLabel}</div>
							</div>
						)}

						{/* Dirección */}
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

