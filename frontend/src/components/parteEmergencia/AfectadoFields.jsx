import { UserIcon } from '@heroicons/react/24/outline';

// === Subcomponente: Campos de afectado (dueño / habitante / chofer / pasajero)
function AfectadoFields({ value, onChange, title }) {
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
        <select
          className={baseInput}
          value={value.gravedad || ''}
          onChange={(e) => set('gravedad', e.target.value)}
        >
          <option value="">Gravedad (opcional)</option>
          <option value="LEVE">Leve</option>
          <option value="MODERADA">Moderada</option>
          <option value="GRAVE">Grave</option>
        </select>
      </div>
    </div>
  );
}

export default AfectadoFields;