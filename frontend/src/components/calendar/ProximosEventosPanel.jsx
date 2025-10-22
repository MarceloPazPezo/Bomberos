import dayjs from 'dayjs';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { Button } from 'primereact/button';

// Panel reutilizable de "Próximos eventos"
// props:
// - titulo: string
// - items: array de eventos (id, title, start, end, allDay, backgroundColor, idDireccion?, tipoLabel?, descripcion?)
// - dirCache?: mapa idDireccion -> direccion
// - showDireccion: 'auto' | 'none' (auto muestra si hay idDireccion)
// - onVerEnCalendario: (date) => void
export default function ProximosEventosPanel({ titulo = 'Próximos eventos', items = [], dirCache = {}, showDireccion = 'auto', onVerEnCalendario }) {
  return (
    <aside className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
      <h2 className="text-lg font-medium text-slate-800 mb-4">{titulo}</h2>
      {(!items || items.length === 0) ? (
        <div className="text-sm text-slate-500">No hay eventos próximos</div>
      ) : (
        <Accordion>
          {items.map((e) => (
            <AccordionTab
              key={`${e.id}-${dayjs(e.start).format('YYYYMMDD')}`}
              header={
                <div className="flex items-center gap-3">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: e.backgroundColor || '#2563eb' }} />
                  <div className="text-sm">
                    <div className="font-medium text-slate-800">{e.title}</div>
                    <div className="text-xs text-slate-500">
                      {e.allDay ? dayjs(e.start).format('ddd D MMM') : `${dayjs(e.start).format('ddd D MMM, HH:mm')}${e.end ? ` - ${dayjs(e.end).format('HH:mm')}` : ''}`}
                    </div>
                  </div>
                </div>
              }
            >
              <div className="text-sm text-slate-700 space-y-2">
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

                {showDireccion !== 'none' && (
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
                          if (dir && dir.__error) return <span className="text-red-600">No se pudo cargar la dirección</span>;
                          if (!dir) return <span className="text-slate-500">Sin datos de dirección</span>;
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
                )}

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

                <div>
                  <Button
                    label="Ver en calendario"
                    icon="pi pi-search"
                    className="p-button-text p-button-sm p-0"
                    onClick={() => onVerEnCalendario?.(e.start)}
                  />
                </div>
              </div>
            </AccordionTab>
          ))}
        </Accordion>
      )}
    </aside>
  );
}
