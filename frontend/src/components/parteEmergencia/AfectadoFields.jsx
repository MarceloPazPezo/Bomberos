import { UserIcon } from '@heroicons/react/24/outline';

// === Subcomponente: Campos de afectado (dueño / habitante / chofer / pasajero)
function AfectadoFields({ value, onChange, title, showEsEmpresa = false }) {
  const baseInput =
    'w-full border border-gray-300 rounded-md px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-400';

  const set = (k, v) => onChange({ ...value, [k]: v });

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-3">
      <div className="flex items-center gap-2 mb-2">
        <UserIcon className="h-4 w-4 text-gray-600" />
        <div className="text-sm font-medium text-gray-900">{title}</div>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <input
          className={baseInput}
          placeholder="Nombre completo"
          value={value.nombreCompleto || ''}
          onChange={(e) => set('nombreCompleto', e.target.value)}
        />
        <input
          className={baseInput}
          placeholder="RUN"
          value={value.run || ''}
          onChange={(e) => set('run', e.target.value)}
        />
        <input
          className={baseInput}
          placeholder="Teléfono"
          value={value.telefono || ''}
          onChange={(e) => set('telefono', e.target.value)}
        />
        <input
          className={baseInput}
          placeholder="Edad"
          type="number"
          min={0}
          value={value.edad ?? ''}
          onChange={(e) => set('edad', e.target.value === '' ? '' : Number(e.target.value))}
        />
        <input
          className={baseInput}
          placeholder="Descripción de gravedad"
          value={value.descripcionGravedad || ''}
          onChange={(e) => set('descripcionGravedad', e.target.value)}
        />
        {showEsEmpresa && (
          <label className="inline-flex items-center text-sm text-gray-700 gap-2">
            <input
              type="checkbox"
              checked={!!value.esEmpresa}
              onChange={(e) => set('esEmpresa', e.target.checked)}
            />
            Es empresa
          </label>
        )}
      </div>
    </div>
  );
}

export default AfectadoFields;