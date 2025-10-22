import dayjs from 'dayjs';

export const formatHeaderFecha = (ev) => {
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

// Convierte eventos API a formato FullCalendar con colores por tipo
export const mapEventosConColores = (eventosApi, tiposOptions, getColorForTipo) => {
  const tipoLabelMap = new Map((tiposOptions || []).map((t) => [String(t.value), t.label]));
  return (eventosApi || []).map((e) => {
    const tipoId = e.idTipoEvento ?? e.tipoEvento?.id ?? e.tipoId ?? null;
    const col = (tipoId != null) ? getColorForTipo(tipoId) : undefined;
    const tipoLabel = tipoId != null ? (tipoLabelMap.get(String(tipoId)) || 'General') : undefined;
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
};
