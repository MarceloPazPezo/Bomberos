import { Trash2 } from 'lucide-react';
import { useEffect } from 'react';


function AccidentadoCard({
  value,
  onChange,
  onRemove,
  index,
  companias,
  bomberosDeCompania = [],
  loadingBomberos = false,
  errorBomberos = '',
  ensureLoaded,
}) {
  const baseInput =
    'w-full border border-gray-300 rounded-md px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-400';
  const set = (k, v) => onChange({ ...value, [k]: v });

  // cuando cambia la compañía, reset del bombero y carga lista
  useEffect(() => {
    if (value.companiaId) ensureLoaded(value.companiaId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value.companiaId]);

  const handleCompania = (e) => {
    const next = e.target.value === '' ? '' : Number(e.target.value) || e.target.value;
    onChange({ ...value, companiaId: next, bomberoId: '' });
  };

  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-4 relative">
      <button
        type="button"
        onClick={onRemove}
        className="absolute right-2 top-2 text-xs text-red-700 hover:text-red-900 flex items-center gap-1"
        title="Eliminar accidentado"
      >
        <Trash2 className="h-4 w-4" /> Eliminar
      </button>

      <div className="font-medium text-red-900 mb-3">Accidentado #{index + 1}</div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {/* Compañía */}
        <select className={baseInput} value={value.companiaId || ''} onChange={handleCompania}>
          <option value="">Selecciona compañía…</option>
          {companias.map((c) => (
            <option key={c.id} value={c.id}>{c.nombre}</option>
          ))}
        </select>

        {/* Bombero accidentado */}
        <select
          className={baseInput}
          value={value.bomberoId || ''}
          onChange={(e) => set('bomberoId', e.target.value || '')}
          disabled={!value.companiaId || loadingBomberos}
        >
          <option value="">
            {!value.companiaId
              ? 'Seleccione compañía primero'
              : loadingBomberos
              ? 'Cargando…'
              : 'Selecciona bombero…'}
          </option>
          {errorBomberos && <option value="" disabled>{errorBomberos}</option>}
          {bomberosDeCompania.map((b) => {
            const nombre = [b.nombres, b.apellidos].filter(Boolean).join(' ').trim();
            return <option key={b.id} value={b.id}>{nombre || `Bombero ${b.id}`}</option>;
          })}
        </select>

        {/* Lesiones */}
        <input
          className={baseInput}
          placeholder="Lesiones"
          value={value.lesiones || ''}
          onChange={(e) => set('lesiones', e.target.value)}
        />

        {/* Constancia */}
        <input
          className={baseInput}
          placeholder="Constancia"
          value={value.constancia || ''}
          onChange={(e) => set('constancia', e.target.value)}
        />

        {/* Comisaría */}
        <input
          className={baseInput}
          placeholder="Comisaría"
          value={value.comisaria || ''}
          onChange={(e) => set('comisaria', e.target.value)}
        />

        {/* Acciones */}
        <input
          className={baseInput}
          placeholder="Acciones"
          value={value.acciones || ''}
          onChange={(e) => set('acciones', e.target.value)}
        />
      </div>
    </div>
  );
}

export default AccidentadoCard;