// CSS para truncar títulos y contenidos largos en FullCalendar
export const FC_TRUNCATE_CSS = `
  .fc-compact .fc-event,
  .fc-compact .fc-daygrid-event,
  .fc-compact .fc-timegrid-event {
    overflow: hidden;
  }

  .fc-compact .fc-event-title,
  .fc-compact .fc-event-title-container,
  .fc-compact .fc-event-main,
  .fc-compact .fc-list-event-title {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .fc-compact .fc-daygrid-event .fc-event-main-frame,
  .fc-compact .fc-timegrid-event .fc-event-main,
  .fc-compact .fc-event-main-frame {
    min-width: 0;
  }

  .fc-compact .fc-daygrid-event .fc-event-time,
  .fc-compact .fc-daygrid-event .fc-event-title {
    min-width: 0;
  }
`;
