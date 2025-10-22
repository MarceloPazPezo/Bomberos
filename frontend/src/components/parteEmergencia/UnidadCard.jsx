import { Truck, UsersRound, Trash2 } from 'lucide-react';



function UnidadCard({
  value,
  onChange,
  onRemove,
  index,
  conductores,
  bomberos,
  loadingConductores,
  loadingBomberos,
  companiaSeleccionada,
  unidades = [],
  loadingUnidades = false,
  errorUnidades = '',
}) {
  const baseInput =
    'w-full border border-gray-300 rounded-md px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-400';
  const set = (k, v) => onChange({ ...value, [k]: v });

  const setVoluntarios = (raw) => {
    if (raw === '') return set('voluntarios', '');
    const n = Number(raw);
    if (Number.isFinite(n) && n >= 0) set('voluntarios', Math.trunc(n));
  };
  const setKm = (k, raw) => {
    if (raw === '') return set(k, '');
    const n = Number(raw);
    if (Number.isFinite(n) && n > 0) set(k, Math.trunc(n));
  };

  const noCompania = !companiaSeleccionada;
  // IDs seleccionados como string para comparar con opciones
  const selectedUnidadId = value.unidadId === '' || value.unidadId === undefined || value.unidadId === null ? '' : String(value.unidadId);
  const selectedConductorId = value.conductorId === '' || value.conductorId === undefined || value.conductorId === null ? '' : String(value.conductorId);
  const selectedBomberoId = value.bomberoId === '' || value.bomberoId === undefined || value.bomberoId === null ? '' : String(value.bomberoId);

  const unidadExiste = selectedUnidadId ? unidades.some(u => String(u.id) === selectedUnidadId) : false;
  const conductorExiste = selectedConductorId ? conductores.some(c => String(c.id) === selectedConductorId) : false;
  const bomberoExiste = selectedBomberoId ? bomberos.some(b => String(b.id) === selectedBomberoId) : false;

  return (
    <div className="rounded-2xl border border-teal-200 bg-teal-50 p-4 relative">
      <button
        type="button"
        onClick={onRemove}
        className="absolute right-2 top-2 inline-flex items-center gap-1 text-xs text-red-700 hover:text-red-900"
        title="Eliminar registro"
      >
        <Trash2 className="h-4 w-4" /> Eliminar
      </button>

      <div className="flex items-center gap-2 mb-3">
        <Truck className="h-4 w-4 text-teal-700" />
        <div className="font-medium text-teal-900">Unidad #{index + 1}</div>
      </div>

  <div className="grid sm:grid-cols-2 lg:grid-cols-6 gap-3">
        <div>
          <label className="block text-xs text-gray-600 mb-1">Unidad</label>
          <select
            className={baseInput}
            value={selectedUnidadId}
            onChange={(e) => onChange({ ...value, unidadId: e.target.value || '' })}
            disabled={noCompania || loadingUnidades}
          >
            <option value="">
              {noCompania
                ? 'Seleccione compañía en Datos generales…'
                : loadingUnidades
                  ? 'Cargando…'
                  : 'Selecciona unidad…'}
            </option>
            {errorUnidades && (
              <option value="" disabled>{errorUnidades}</option>
            )}
            {/* Fallback si la unidad precargada no está en la lista actual */}
            {!unidadExiste && selectedUnidadId && (
              <option value={selectedUnidadId}>
                {`Unidad ${selectedUnidadId} (no disponible en esta compañía)`}
              </option>
            )}
            {unidades.map((u) => {
              const label =
                u.nombre ??
                u.alias ??
                u.codigo ??
                u.patente ??
                u.nombreCorto ??
                `Carro ${u.id}`;
              return (
                <option key={u.id} value={String(u.id)}>
                  {label}
                </option>
              );
            })}
          </select>
        </div>

        <div>
          <label className="block text-xs text-gray-600 mb-1">Conductor</label>
          <select
            className={baseInput}
            value={selectedConductorId}
            onChange={(e) => set('conductorId', e.target.value || '')}
            disabled={noCompania || loadingConductores}
          >
            <option value="">
              {noCompania ? 'Seleccione compañía en Datos generales…' : loadingConductores ? 'Cargando…' : 'Selecciona conductor…'}
            </option>
            {/* Fallback si el conductor precargado no tiene licencia o no está en la lista */}
            {!conductorExiste && selectedConductorId && (
              <option value={selectedConductorId}>
                {(() => {
                  const ref = bomberos.find(b => String(b.id) === selectedConductorId);
                  const nombre = ref ? [ref.nombres, ref.apellidos].filter(Boolean).join(' ').trim() : '';
                  return `${nombre || `Bombero ${selectedConductorId}`} (no habilitado para conducir)`;
                })()}
              </option>
            )}
            {conductores.map((c) => {
              const nombre = [c.nombres, c.apellidos].filter(Boolean).join(' ').trim();
              const label = nombre || c.nombreCompleto || `Bombero ${c.id}`;
              return (
                <option key={c.id} value={String(c.id)}>{label}</option>
              );
            })}
          </select>
        </div>

        <div>
          <label className="block text-xs text-gray-600 mb-1">Bombero a cargo</label>
          <select
            className={baseInput}
            value={selectedBomberoId}
            onChange={(e) => set('bomberoId', e.target.value || '')}
            disabled={noCompania || loadingBomberos}
          >
            <option value="">
              {noCompania ? 'Seleccione compañía en Datos generales…' : loadingBomberos ? 'Cargando…' : 'Selecciona bombero…'}
            </option>
            {/* Fallback si el bombero precargado no está en la lista actual */}
            {!bomberoExiste && selectedBomberoId && (
              <option value={selectedBomberoId}>
                {(() => {
                  const ref = bomberos.find(o => String(o.id) === selectedBomberoId);
                  const nombre = ref ? [ref.nombres, ref.apellidos].filter(Boolean).join(' ').trim() : '';
                  return `${nombre || `Bombero ${selectedBomberoId}`} (no en listado actual)`;
                })()}
              </option>
            )}
            {bomberos.map((o) => {
              const nombre = [o.nombres, o.apellidos].filter(Boolean).join(' ').trim();
              const label = nombre || `Bombero ${o.id}`;
              return (
                <option key={o.id} value={String(o.id)}>{label}</option>
              );
            })}
          </select>
        </div>

        <div className="col-span-2 lg:col-span-1">
          <label className="block text-xs text-gray-600 mb-1">N° total de voluntarios en unidad</label>
          <input
            type="number"
            min={0}
            step={1}
            inputMode="numeric"
            className={baseInput}
            value={value.voluntarios ?? ''}
            onChange={(e) => setVoluntarios(e.target.value)}
            placeholder="0"
          />
        </div>

        <div className="col-span-2 lg:col-span-1">
          <label className="block text-xs text-gray-600 mb-1">KM salida</label>
          <input
            type="number"
            min={1}
            step={1}
            inputMode="numeric"
            className={baseInput}
            value={value.kmSalida ?? ''}
            onChange={(e) => setKm('kmSalida', e.target.value)}
            placeholder="Ej: 12345"
          />
        </div>
        <div className="col-span-2 lg:col-span-1">
          <label className="block text-xs text-gray-600 mb-1">KM llegada</label>
          <input
            type="number"
            min={1}
            step={1}
            inputMode="numeric"
            className={baseInput}
            value={value.kmLlegada ?? ''}
            onChange={(e) => setKm('kmLlegada', e.target.value)}
            placeholder="Ej: 12350"
          />
        </div>
      </div>

      <div className="mt-3 text-xs text-gray-600 flex items-center gap-2">
        <UsersRound className="h-3.5 w-3.5" />
        <span>
          {value.voluntarios ? `${value.voluntarios} voluntarios` : 'Sin voluntarios informados'}
        </span>
      </div>
    </div>
  );
}
export default UnidadCard;