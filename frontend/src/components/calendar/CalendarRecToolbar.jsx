import { MultiSelect } from 'primereact/multiselect';
import { REC_COLORS } from '@helpers/calendarColors';

const CalendarRecToolbar = ({
  recFiltroTipos = [],
  onChangeFiltro,
  recVista,
  VISTAS,
  onChangeVista,
  recLoading = false,
}) => {
  const recTiposOptions = [
    { label: 'Cumpleaños', value: 'cumple' },
    { label: 'Ingreso', value: 'ingreso' },
    { label: 'Fundación', value: 'fundacion' },
  ];
  const colorFor = (value) =>
    value === 'cumple' ? REC_COLORS.cumple.bg : value === 'ingreso' ? REC_COLORS.ingreso.bg : REC_COLORS.fundacion.bg;

  return (
    <div className="flex items-center justify-between py-4 px-2">
      <MultiSelect
        value={recFiltroTipos}
        onChange={(e) => onChangeFiltro?.(e.value)}
        options={recTiposOptions}
        optionLabel="label"
        optionValue="value"
        placeholder="Filtrar tipos"
        display="chip"
        className="w-64"
        showClear
        itemTemplate={(option) => (
          <div className="flex items-center gap-2">
            <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: colorFor(option.value) }} />
            <span>{option.label}</span>
          </div>
        )}
        selectedItemTemplate={(value) => {
          const opt = recTiposOptions.find((t) => t.value === value);
          if (!opt) return null;
          return (
            <div className="flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: colorFor(value) }} />
              <span className="text-xs">{opt.label}</span>
            </div>
          );
        }}
      />
      <div className="flex items-center gap-2">
        {[
          { key: VISTAS.year, label: 'Año' },
          { key: VISTAS.month, label: 'Mes' },
          { key: VISTAS.week, label: 'Semana' },
          { key: VISTAS.day, label: 'Día' },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => onChangeVista?.(t.key)}
            className={`px-3 py-1.5 rounded-md text-sm border transition ${
              recVista === t.key ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {t.label}
          </button>
        ))}
        {recLoading && <i className="pi pi-spinner pi-spin text-slate-500 ml-2" aria-label="Cargando" />}
      </div>
    </div>
  );
};

export default CalendarRecToolbar;
