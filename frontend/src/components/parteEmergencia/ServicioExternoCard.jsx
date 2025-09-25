import { Handshake, Trash2 } from 'lucide-react';


function ServicioExternoCard({
  value,
  onChange,
  onRemove,
  index,
  servicios = [],
  loadingServicios = false,
  errorServicios = '',
}) {
  const baseInput =
    'w-full border border-gray-300 rounded-md px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-400';

  const set = (k, v) => onChange({ ...value, [k]: v });

  const setPersonal = (raw) => {
    if (raw === '') return set('personal', '');
    const n = Number(raw);
    if (Number.isFinite(n) && n > 0) set('personal', Math.trunc(n));
  };

  return (
    <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-4 relative">
      <button
        type="button"
        onClick={onRemove}
        className="absolute right-2 top-2 inline-flex items-center gap-1 text-xs text-red-700 hover:text-red-900"
        title="Eliminar servicio"
      >
        <Trash2 className="h-4 w-4" /> Eliminar
      </button>

      <div className="flex items-center gap-2 mb-3">
        <Handshake className="h-4 w-4 text-indigo-700" />
        <div className="font-medium text-indigo-900">Servicio #{index + 1}</div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Desplegable de servicio */}
        <div className="lg:col-span-2">
          <label className="block text-xs text-gray-600 mb-1">Servicio</label>
          <select
            className={baseInput}
            value={value.servicioId || ''}
            onChange={(e) => set('servicioId', e.target.value || '')}
            disabled={loadingServicios}
          >
            <option value="">{loadingServicios ? 'Cargando…' : 'Selecciona servicio…'}</option>
            {errorServicios && <option value="" disabled>{errorServicios}</option>}
            {servicios.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nombre ?? s.label ?? `Servicio ${s.id}`}
              </option>
            ))}
          </select>
        </div>

        {/* Tipo de unidad */}
        <div>
          <label className="block text-xs text-gray-600 mb-1">Tipo de unidad</label>
          <input
            className={baseInput}
            placeholder="Ej: Ambulancia, Patrulla…"
            value={value.tipoUnidad || ''}
            onChange={(e) => set('tipoUnidad', e.target.value)}
          />
        </div>

        {/* Responsable */}
        <div>
          <label className="block text-xs text-gray-600 mb-1">Nombre de la persona a cargo</label>
          <input
            className={baseInput}
            placeholder="Nombre completo"
            value={value.responsable || ''}
            onChange={(e) => set('responsable', e.target.value)}
          />
        </div>

        {/* Personal */}
        <div>
          <label className="block text-xs text-gray-600 mb-1">N° de personal</label>
          <input
            type="number"
            min={1}
            step={1}
            inputMode="numeric"
            className={baseInput}
            value={value.personal ?? ''}
            onChange={(e) => setPersonal(e.target.value)}
            placeholder="1"
          />
        </div>

        {/* Observaciones */}
        <div className="lg:col-span-4">
          <label className="block text-xs text-gray-600 mb-1">Observaciones</label>
          <input
            className={baseInput}
            placeholder="Observaciones (opcional)"
            value={value.observaciones || ''}
            onChange={(e) => set('observaciones', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}

export default ServicioExternoCard;