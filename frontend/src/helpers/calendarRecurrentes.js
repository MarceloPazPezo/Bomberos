import dayjs from 'dayjs';
import { REC_COLORS } from './calendarColors';

const safeDateParts = (isoLike) => {
  if (!isoLike) return null;
  const [y, m, d] = isoLike.split('-').map((v) => parseInt(v, 10));
  if (!y || !m || !d) return null;
  return { y, m, d };
};

// Mapea respuesta de API a eventos recurrentes de FullCalendar (rrule)
export const mapRecurrentesToEvents = (data) => {
  const events = [];
  const personas = data?.eventos || [];
  for (const p of personas) {
    const cumple = safeDateParts(p.fecha_cumpleanos);
    if (cumple) {
      const color = REC_COLORS.cumple;
      events.push({
        id: `rec_cumple_${p.idBombero}`,
        title: `Cumple: ${p.nombre} ${p.apellido}`,
        allDay: true,
        backgroundColor: color.bg,
        borderColor: color.border,
        textColor: color.text,
        extendedProps: {
          tipoRec: 'cumple',
          idBombero: p.idBombero,
          email: p.email,
          baseDate: p.fecha_cumpleanos,
          nombre: p.nombre,
          apellido: p.apellido,
        },
        rrule: {
          freq: 'yearly',
          bymonth: cumple.m,
          bymonthday: cumple.d,
          dtstart: `${String(cumple.y).padStart(4, '0')}-${String(cumple.m).padStart(2, '0')}-${String(cumple.d).padStart(2, '0')}T00:00:00`,
        },
      });
    }

    const ingreso = safeDateParts(p.fecha_ingreso);
    if (ingreso) {
      const color = REC_COLORS.ingreso;
      events.push({
        id: `rec_ingreso_${p.idBombero}`,
        title: `Ingreso: ${p.nombre} ${p.apellido}`,
        allDay: true,
        backgroundColor: color.bg,
        borderColor: color.border,
        textColor: color.text,
        extendedProps: {
          tipoRec: 'ingreso',
          idBombero: p.idBombero,
          email: p.email,
          baseDate: p.fecha_ingreso,
          nombre: p.nombre,
          apellido: p.apellido,
        },
        rrule: {
          freq: 'yearly',
          interval: 5,
          bymonth: ingreso.m,
          bymonthday: ingreso.d,
          dtstart: `${String(ingreso.y).padStart(4, '0')}-${String(ingreso.m).padStart(2, '0')}-${String(ingreso.d).padStart(2, '0')}T00:00:00`,
        },
      });
    }
  }

  const companias = data?.companias || [];
  for (const c of companias) {
    const fund = safeDateParts(c.fechaFundacion);
    if (fund) {
      const color = REC_COLORS.fundacion;
      events.push({
        id: `rec_fundacion_${c.id}`,
        title: `Fundación: ${c.nombre}`,
        allDay: true,
        backgroundColor: color.bg,
        borderColor: color.border,
        textColor: color.text,
        extendedProps: {
          tipoRec: 'fundacion',
          idCompania: c.id,
          baseDate: c.fechaFundacion,
          nombreCompania: c.nombre,
        },
        rrule: {
          freq: 'yearly',
          bymonth: fund.m,
          bymonthday: fund.d,
          dtstart: `${String(fund.y).padStart(4, '0')}-${String(fund.m).padStart(2, '0')}-${String(fund.d).padStart(2, '0')}T00:00:00`,
        },
      });
    }
  }
  return events;
};

// Calcular próximos eventos simples (no recurrentes) en una ventana (por defecto 4 semanas), respetando allDay actuales
export const computeProximosEventos = (eventos, limiteSemanas = 4) => {
  const ahora = dayjs();
  const limite = ahora.add(limiteSemanas, 'week');
  return [...(eventos || [])]
    .filter((e) => {
      const s = dayjs(e.start);
      // Logic adjusted: Include events that started in the past IF they end in the future (are "ongoing" or "en curso")
      // OR events that start in the future within the window.

      let isActiveOrFuture = false;
      if (e.end) {
        const end = dayjs(e.end);
        // Active if end is after now
        isActiveOrFuture = end.isAfter(ahora) || end.isSame(ahora, 'minute');
      } else {
        // If no end, assume point event. Must be future or today.
        isActiveOrFuture = s.isAfter(ahora) || s.isSame(ahora, 'day');
      }

      // Check if it falls within the lookahead window (start is before limit)
      // If started in past, satisfy window check trivially for start, 
      // but practically we want them if they are relevant now.
      const startsInWindow = s.isBefore(limite) || s.isSame(limite, 'day');
      // If ongoing (starts before now), it's definitely interesting.

      return isActiveOrFuture && startsInWindow;
    })
    .sort((a, b) => dayjs(a.start).valueOf() - dayjs(b.start).valueOf())
    .slice(0, 5);
};

// Calcular próximas ocurrencias para recurrentes (top 5, 4 semanas)
export const computeProximosRecurrentes = (recEventosFiltrados, limiteSemanas = 4) => {
  const ahora = dayjs();
  const limite = ahora.add(limiteSemanas, 'week');
  const list = [];
  for (const e of recEventosFiltrados || []) {
    let bymonth = e?.rrule?.bymonth;
    let bymonthday = e?.rrule?.bymonthday;
    if ((!bymonth || !bymonthday) && e?.extendedProps?.baseDate) {
      const d = dayjs(e.extendedProps.baseDate);
      if (d.isValid()) {
        bymonth = d.month() + 1;
        bymonthday = d.date();
      }
    }
    if (!bymonth || !bymonthday) continue;
    let next = dayjs()
      .year(ahora.year())
      .month(bymonth - 1)
      .date(bymonthday)
      .hour(0)
      .minute(0)
      .second(0)
      .millisecond(0);
    if (next.isBefore(ahora, 'day')) {
      next = next.add(1, 'year');
    }
    let displayTitle = e.title;
    if (e?.extendedProps?.tipoRec === 'fundacion' && e?.extendedProps?.baseDate) {
      const base = dayjs(e.extendedProps.baseDate);
      if (base.isValid()) {
        const years = next.year() - base.year();
        displayTitle = `Aniversario #${years} Fundación: ${e.extendedProps?.nombreCompania || ''}`.trim();
      }
    }
    if (e?.extendedProps?.tipoRec === 'ingreso' && e?.extendedProps?.baseDate) {
      const base = dayjs(e.extendedProps.baseDate);
      if (base.isValid()) {
        const years = next.year() - base.year();
        if (years % 5 !== 0) continue;
        const nombre = [e?.extendedProps?.nombre, e?.extendedProps?.apellido].filter(Boolean).join(' ').trim();
        displayTitle = `Aniversario de ingreso N°${years} ${nombre}`.trim();
      }
    }
    list.push({
      id: e.id,
      title: displayTitle,
      start: next.toDate(),
      end: undefined,
      allDay: e.allDay ?? true,
      backgroundColor: e.backgroundColor,
      borderColor: e.borderColor,
      textColor: e.textColor,
      extendedProps: e.extendedProps,
      tipoRec: e.extendedProps?.tipoRec,
      tipoLabel:
        e.extendedProps?.tipoRec === 'cumple' ? 'Cumpleaños' :
          e.extendedProps?.tipoRec === 'ingreso' ? 'Ingreso' :
            e.extendedProps?.tipoRec === 'fundacion' ? 'Fundación' : undefined,
      descripcion: e.extendedProps?.descripcion || '',
      idDireccion: null,
    });
  }
  return list
    .filter((e) => {
      const s = dayjs(e.start);
      const noPasado = s.isAfter(ahora) || s.isSame(ahora, 'day');
      const enVentana = s.isBefore(limite) || s.isSame(limite, 'day');
      return noPasado && enVentana;
    })
    .sort((a, b) => dayjs(a.start).valueOf() - dayjs(b.start).valueOf())
    .slice(0, 5);
};
