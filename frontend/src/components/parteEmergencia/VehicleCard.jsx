import { Car, Plus, Trash2 } from 'lucide-react';
import AfectadoFields from './AfectadoFields';

// === Helpers básicos
const genId = () => Math.random().toString(36).slice(2, 10);

function VehicleCard({ value, onChange, onRemove, index }) {
  const baseInput =
    'w-full border border-gray-300 rounded-md px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-400';

  const setField = (k, v) => onChange({ ...value, [k]: v });

  const setPasajero = (i, v) => {
    const copy = [...(value.pasajeros || [])];
    copy[i] = v;
    onChange({ ...value, pasajeros: copy });
  };
  const addPasajero = () => onChange({ ...value, pasajeros: [...(value.pasajeros || []), { id: genId() }] });
  const removePasajero = (i) => {
    const copy = [...(value.pasajeros || [])];
    copy.splice(i, 1);
    onChange({ ...value, pasajeros: copy });
  };

  return (
    <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4 relative">
      <button
        type="button"
        onClick={onRemove}
        className="absolute right-2 top-2 inline-flex items-center gap-1 text-xs text-red-700 hover:text-red-900"
        title="Eliminar vehículo"
      >
        <Trash2 className="h-4 w-4" />
      </button>

      <div className="flex items-center gap-2 mb-3">
        <Car className="h-4 w-4 text-amber-700" />
        <div className="font-medium text-amber-900">Vehículo #{index + 1}</div>
      </div>

      {/* Datos del vehículo */}
      <div className="grid sm:grid-cols-2 gap-3 mb-4">
        <input
          className={baseInput}
          placeholder="Patente"
          value={value.patente || ''}
          onChange={(e) => setField('patente', e.target.value)}
        />
        <input
          className={baseInput}
          placeholder="Marca"
          value={value.marca || ''}
          onChange={(e) => setField('marca', e.target.value)}
        />
        <input
          className={baseInput}
          placeholder="Modelo"
          value={value.modelo || ''}
          onChange={(e) => setField('modelo', e.target.value)}
        />
        <input
          className={baseInput}
          placeholder="Año"
          type="number"
          min={1900}
          max={2100}
          value={value.anio ?? ''}
          onChange={(e) => setField('anio', e.target.value === '' ? '' : Number(e.target.value))}
        />
        <input
          className={baseInput}
          placeholder="Color"
          value={value.color || ''}
          onChange={(e) => setField('color', e.target.value)}
        />
        <input
          className={baseInput}
          placeholder="Daños vehículo (breve)"
          value={value.danos_vehiculo || ''}
          onChange={(e) => setField('danos_vehiculo', e.target.value)}
        />
      </div>

      {/* Dueño del vehículo (opcional, máximo 1) */}
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
              title="Dueño del vehículo"
              value={value.dueno}
              onChange={(v) => onChange({ ...value, dueno: v })}
            />
          </div>
        )}
      </div>

      {/* Chofer (opcional, máximo 1) */}
      <div className="mt-4">
        {!value.chofer ? (
          <button
            type="button"
            onClick={() => onChange({ ...value, chofer: { id: genId() } })}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm hover:bg-gray-50"
          >
            <Plus className="h-4 w-4" /> Agregar chofer
          </button>
        ) : (
          <div className="relative">
            <button
              type="button"
              onClick={() => onChange({ ...value, chofer: null })}
              className="absolute right-2 top-2 inline-flex items-center gap-1 text-xs text-red-700 hover:text-red-900"
            >
              <Trash2 className="h-4 w-4" /> Eliminar chofer
            </button>
            <AfectadoFields
              title="Chofer"
              value={value.chofer}
              onChange={(v) => onChange({ ...value, chofer: v })}
            />
          </div>
        )}
      </div>

      {/* Pasajeros */}
      <div className="mt-4">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-medium text-gray-900">Pasajeros</div>
          <button
            type="button"
            onClick={addPasajero}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm hover:bg-gray-50"
          >
            <Plus className="h-4 w-4" /> Agregar pasajero
          </button>
        </div>

        {(value.pasajeros || []).length === 0 && (
          <div className="text-xs text-gray-500 mb-2">Sin pasajeros registrados.</div>
        )}

        <div className="space-y-3">
          {(value.pasajeros || []).map((p, i) => (
            <div key={p.id || i} className="relative">
              <button
                type="button"
                onClick={() => removePasajero(i)}
                className="absolute right-2 top-2 inline-flex items-center gap-1 text-xs text-red-700 hover:text-red-900"
                title="Eliminar pasajero"
              >
                <Trash2 className="h-4 w-4" />
              </button>
              <AfectadoFields title={`Pasajero #${i + 1}`} value={p} onChange={(v) => setPasajero(i, v)} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default VehicleCard;