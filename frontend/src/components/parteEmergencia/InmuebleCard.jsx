import { Home, Plus, Trash2 } from 'lucide-react';
import AfectadoFields from './AfectadoFields.jsx';

// === Helpers básicos
const genId = () => Math.random().toString(36).slice(2, 10);

function InmuebleCard({ value, onChange, onRemove, index }) {
  const baseInput =
    'w-full border border-gray-300 rounded-md px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-400';

  const setField = (k, v) => onChange({ ...value, [k]: v });
  const setHabitante = (i, v) => {
    const copy = [...(value.habitantes || [])];
    copy[i] = v;
    onChange({ ...value, habitantes: copy });
  };
  const addHabitante = () => onChange({ ...value, habitantes: [...(value.habitantes || []), { id: genId() }] });
  const removeHabitante = (i) => {
    const copy = [...(value.habitantes || [])];
    copy.splice(i, 1);
    onChange({ ...value, habitantes: copy });
  };

  return (
    <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 relative">
      <button
        type="button"
        onClick={onRemove}
        className="absolute right-2 top-2 inline-flex items-center gap-1 text-xs text-red-700 hover:text-red-900"
        title="Eliminar inmueble"
      >
        <Trash2 className="h-4 w-4" />
      </button>

      <div className="flex items-center gap-2 mb-3">
        <Home className="h-4 w-4 text-blue-700" />
        <div className="font-medium text-blue-900">Inmueble #{index + 1}</div>
      </div>

      {/* Datos del inmueble */}
      <div className="grid sm:grid-cols-2 gap-3 mb-4">
        <input
          className={baseInput}
          placeholder="Tipo de construcción"
          value={value.tipo_construccion || ''}
          onChange={(e) => setField('tipo_construccion', e.target.value)}
        />
        <input
          className={baseInput}
          placeholder="N° de pisos"
          type="number"
          min={0}
          value={value.n_pisos ?? ''}
          onChange={(e) => setField('n_pisos', e.target.value === '' ? '' : Number(e.target.value))}
        />
        <input
          className={baseInput}
          placeholder="m² construcción"
          type="number"
          min={0}
          value={value.m2_construccion ?? ''}
          onChange={(e) => setField('m2_construccion', e.target.value === '' ? '' : Number(e.target.value))}
        />
        <input
          className={baseInput}
          placeholder="m² afectado"
          type="number"
          min={0}
          value={value.m2_afectado ?? ''}
          onChange={(e) => setField('m2_afectado', e.target.value === '' ? '' : Number(e.target.value))}
        />
        <input
          className={baseInput}
          placeholder="Daños vivienda (breve)"
          value={value.danos_vivienda || ''}
          onChange={(e) => setField('danos_vivienda', e.target.value)}
        />
      </div>

      {/* Dueño (opcional, máximo 1) */}
      <div className="mt-2">
        {!value.dueno ? (
          <button
            type="button"
            onClick={() => onChange({ ...value, dueno: { id: genId() } })}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm hover:bg-gray-50"
          >
            <Plus className="h-4 w-4" /> Agregar dueño
          </button>
        ) : (
          <div className="relative">
            <button
              type="button"
              onClick={() => onChange({ ...value, dueno: null })}
              className="absolute right-2 top-2 inline-flex items-center gap-1 text-xs text-red-700 hover:text-red-900"
            >
              <Trash2 className="h-4 w-4" /> Eliminar dueño
            </button>
            <AfectadoFields
              title="Dueño"
              value={value.dueno}
              onChange={(v) => onChange({ ...value, dueno: v })}
            />
          </div>
        )}
      </div>

      {/* Habitantes */}
      <div className="mt-4">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-medium text-gray-900">Habitantes durante el incidente</div>
          <button
            type="button"
            onClick={addHabitante}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm hover:bg-gray-50"
          >
            <Plus className="h-4 w-4" /> Agregar habitante
          </button>
        </div>

        {(value.habitantes || []).length === 0 && (
          <div className="text-xs text-gray-500 mb-2">Sin habitantes registrados.</div>
        )}

        <div className="space-y-3">
          {(value.habitantes || []).map((h, i) => (
            <div key={h.id || i} className="relative">
              <button
                type="button"
                onClick={() => removeHabitante(i)}
                className="absolute right-2 top-2 inline-flex items-center gap-1 text-xs text-red-700 hover:text-red-900"
                title="Eliminar habitante"
              >
                <Trash2 className="h-4 w-4" />
              </button>
              <AfectadoFields title={`Habitante #${i + 1}`} value={h} onChange={(v) => setHabitante(i, v)} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default InmuebleCard;