import { MultiSelect } from 'primereact/multiselect';

// Toolbar para calendario normal (con filtro por tipos y botones de vista)
const CalendarToolbar = ({
  tipos = [],
  filtroTipos = [],
  onChangeFiltro,
  vista,
  VISTAS,
  onChangeVista,
  loading = false,
  title = null,
  getTipoBg,
  extraRight = null,
}) => {
  return (
    <div className="flex items-center justify-between py-4 px-2">
      {title ? <h1 className="text-2xl font-semibold text-slate-800">{title}</h1> : <div />}
      <div className="flex items-center gap-2">
        <MultiSelect
          value={filtroTipos}
          onChange={(e) => onChangeFiltro?.(e.value)}
          options={tipos}
          optionLabel="label"
          optionValue="value"
          placeholder="Filtrar tipos"
          display="chip"
          className="w-64"
          showClear
          itemTemplate={(option) => (
            <div className="flex items-center gap-2">
              <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: getTipoBg?.(option.value) }} />
              <span>{option.label}</span>
            </div>
          )}
          selectedItemTemplate={(value) => {
            const opt = tipos.find((t) => String(t.value) === String(value));
            if (!opt) return null;
            return (
              <div className="flex items-center gap-1">
                <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: getTipoBg?.(opt.value) }} />
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
            onClick={() => onChangeVista?.(t.key)}
            className={`px-3 py-1.5 rounded-md text-sm border transition ${
              vista === t.key ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {t.label}
          </button>
        ))}
        {extraRight}
        {loading && <i className="pi pi-spinner pi-spin text-slate-500 ml-2" aria-label="Cargando" />}
      </div>
    </div>
  );
};

export default CalendarToolbar;
