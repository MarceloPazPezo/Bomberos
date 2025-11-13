import { useMemo } from 'react';
import { Truck, UsersRound, Trash2 } from 'lucide-react';
import Select from 'react-select';
import { formatRutForDisplay } from '@helpers/rutFormatter.js';

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
  const set = (k, v) => onChange({ ...value, [k]: v });

  const noCompania = !companiaSeleccionada;
  // IDs seleccionados como string para comparar con opciones
  const selectedUnidadId = value.unidadId === '' || value.unidadId === undefined || value.unidadId === null ? '' : String(value.unidadId);
  const selectedConductorId = value.conductorId === '' || value.conductorId === undefined || value.conductorId === null ? '' : String(value.conductorId);
  const selectedBomberoId = value.bomberoId === '' || value.bomberoId === undefined || value.bomberoId === null ? '' : String(value.bomberoId);

  const selectStyles = useMemo(() => ({
    control: (base, state) => ({
      ...base,
      borderColor: state.isFocused ? '#4EB9FA' : '#D1D5DB',
      borderWidth: '2px',
      boxShadow: state.isFocused ? '0 0 0 3px rgba(78, 185, 250, 0.1)' : 'none',
      '&:hover': {
        borderColor: '#4EB9FA',
      },
      minHeight: '42px',
      borderRadius: '10px',
      fontSize: '0.85rem',
    }),
    menu: (base) => ({
      ...base,
      zIndex: 30,
      borderRadius: '10px',
      overflow: 'hidden',
    }),
    menuList: (base) => ({
      ...base,
      maxHeight: '260px',
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? '#4EB9FA'
        : state.isFocused
          ? '#E0F2FE'
          : 'white',
      color: state.isSelected ? '#FFFFFF' : '#1F2937',
      fontSize: '0.85rem',
    }),
    placeholder: (base) => ({
      ...base,
      fontSize: '0.85rem',
      color: '#9CA3AF',
    }),
    singleValue: (base) => ({
      ...base,
      fontSize: '0.85rem',
      color: '#1F2937',
    }),
    menuPortal: (base) => ({
      ...base,
      zIndex: 9999,
    }),
    input: (base) => ({
      ...base,
      fontSize: '0.85rem',
    }),
  }), []);

  const unidadOptions = useMemo(() => {
    return unidades.map((u) => {
      const label =
        u.nombre ??
        u.alias ??
        u.codigo ??
        u.patente ??
        u.nombreCorto ??
        `Carro ${u.id}`;
      return {
        value: String(u.id),
        label,
      };
    });
  }, [unidades]);

  const conductorOptions = useMemo(() => {
    return conductores.map((c) => {
      const nombre = [c.nombres, c.apellidos].filter(Boolean).join(' ').trim() || c.nombreCompleto || `Bombero ${c.id}`;
      const run = formatRutForDisplay(c.run);
      return {
        value: String(c.id),
        label: run ? `${run} • ${nombre}` : nombre,
        data: {
          run: (run || '').toLowerCase(),
          nombre: nombre.toLowerCase(),
        },
      };
    });
  }, [conductores]);

  const bomberoOptions = useMemo(() => {
    return bomberos.map((b) => {
      const nombre = [b.nombres, b.apellidos].filter(Boolean).join(' ').trim() || `Bombero ${b.id}`;
      const run = formatRutForDisplay(b.run);
      return {
        value: String(b.id),
        label: run ? `${run} • ${nombre}` : nombre,
        data: {
          run: (run || '').toLowerCase(),
          nombre: nombre.toLowerCase(),
        },
      };
    });
  }, [bomberos]);

  const unidadValue = useMemo(() => {
    if (!selectedUnidadId) return null;
    return (
      unidadOptions.find((opt) => opt.value === selectedUnidadId) || {
        value: selectedUnidadId,
        label: `Unidad ${selectedUnidadId} (no disponible)`,
        isDisabled: true,
      }
    );
  }, [selectedUnidadId, unidadOptions]);

  const conductorValue = useMemo(() => {
    if (!selectedConductorId) return null;
    return (
      conductorOptions.find((opt) => opt.value === selectedConductorId) ||
      (() => {
        const ref = bomberos.find((b) => String(b.id) === selectedConductorId);
        const nombre = ref ? [ref.nombres, ref.apellidos].filter(Boolean).join(' ').trim() : '';
        const label = `${nombre || `Bombero ${selectedConductorId}`} (sin licencia disponible)`;
        return { value: selectedConductorId, label, isDisabled: true };
      })()
    );
  }, [selectedConductorId, conductorOptions, bomberos]);

  const bomberoValue = useMemo(() => {
    if (!selectedBomberoId) return null;
    return (
      bomberoOptions.find((opt) => opt.value === selectedBomberoId) ||
      (() => {
        const ref = bomberos.find((o) => String(o.id) === selectedBomberoId);
        const nombre = ref ? [ref.nombres, ref.apellidos].filter(Boolean).join(' ').trim() : '';
        const label = `${nombre || `Bombero ${selectedBomberoId}`} (no en listado actual)`;
        return { value: selectedBomberoId, label, isDisabled: true };
      })()
    );
  }, [selectedBomberoId, bomberoOptions, bomberos]);

  const filterOptionByLabelOrRun = (candidate, input) => {
    if (!input) return true;
    const term = input.toLowerCase();
    const labelMatch = candidate.label.toLowerCase().includes(term);
    const metaMatch =
      candidate.data?.run?.includes(term) ||
      candidate.data?.nombre?.includes(term);
    return labelMatch || metaMatch;
  };

  const selectMenuPortalTarget = typeof window !== 'undefined' ? document.body : null;

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

  <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs text-gray-600 mb-1">Unidad</label>
          <Select
            isDisabled={noCompania || loadingUnidades || !!errorUnidades}
            isLoading={loadingUnidades}
            value={unidadValue}
            options={unidadOptions}
            menuPortalTarget={selectMenuPortalTarget}
            onChange={(option) => {
              set('unidadId', option?.value ?? '');
            }}
            placeholder={
              noCompania
                ? 'Seleccione compañía en Datos generales…'
                : loadingUnidades
                  ? 'Cargando…'
                  : errorUnidades || 'Buscar unidad...'
            }
            noOptionsMessage={() =>
              loadingUnidades ? 'Cargando...' : 'No hay unidades disponibles'
            }
            styles={selectStyles}
            classNamePrefix="unidad-select"
            filterOption={filterOptionByLabelOrRun}
            isClearable
          />
        </div>

        <div>
          <label className="block text-xs text-gray-600 mb-1">Conductor</label>
          <Select
            isDisabled={noCompania || loadingConductores}
            isLoading={loadingConductores}
            value={conductorValue}
            options={conductorOptions}
            menuPortalTarget={selectMenuPortalTarget}
            onChange={(option) => set('conductorId', option?.value ?? '')}
            placeholder={
              noCompania
                ? 'Seleccione compañía en Datos generales…'
                : loadingConductores
                  ? 'Cargando…'
                  : 'Buscar conductor...'
            }
            noOptionsMessage={() =>
              loadingConductores ? 'Cargando...' : 'No hay conductores disponibles'
            }
            styles={selectStyles}
            classNamePrefix="conductor-select"
            filterOption={filterOptionByLabelOrRun}
            isClearable
          />
        </div>

        <div>
          <label className="block text-xs text-gray-600 mb-1">Bombero a cargo</label>
          <Select
            isDisabled={noCompania || loadingBomberos}
            isLoading={loadingBomberos}
            value={bomberoValue}
            options={bomberoOptions}
            menuPortalTarget={selectMenuPortalTarget}
            onChange={(option) => set('bomberoId', option?.value ?? '')}
            placeholder={
              noCompania
                ? 'Seleccione compañía en Datos generales…'
                : loadingBomberos
                  ? 'Cargando…'
                  : 'Buscar bombero...'
            }
            noOptionsMessage={() =>
              loadingBomberos ? 'Cargando...' : 'No hay bomberos disponibles'
            }
            styles={selectStyles}
            classNamePrefix="bombero-select"
            filterOption={filterOptionByLabelOrRun}
            isClearable
          />
        </div>

        <div className="sm:col-span-2 md:col-span-1">
          <label className="block text-xs text-gray-600 mb-1">N° total de voluntarios en unidad</label>
          <input
            type="number"
            min={0}
            step={1}
            inputMode="numeric"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-400"
            value={value.voluntarios ?? ''}
            onChange={(e) => {
              const raw = e.target.value;
              if (raw === '') return set('voluntarios', '');
              const n = Number(raw);
              if (Number.isFinite(n) && n >= 0) set('voluntarios', Math.trunc(n));
            }}
            placeholder="0"
          />
        </div>

        <div className="sm:col-span-2 md:col-span-1">
          <label className="block text-xs text-gray-600 mb-1">KM salida</label>
          <input
            type="number"
            min={0}
            step={1}
            inputMode="numeric"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-400"
            value={value.kmSalida ?? ''}
            onChange={(e) => {
              const raw = e.target.value;
              if (raw === '') return set('kmSalida', '');
              const n = Number(raw);
              if (Number.isFinite(n) && n >= 0) set('kmSalida', Math.trunc(n));
            }}
            placeholder="Ej: 12345"
          />
        </div>
        <div className="sm:col-span-2 md:col-span-1">
          <label className="block text-xs text-gray-600 mb-1">KM llegada</label>
          <input
            type="number"
            min={0}
            step={1}
            inputMode="numeric"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-400"
            value={value.kmLlegada ?? ''}
            onChange={(e) => {
              const raw = e.target.value;
              if (raw === '') return set('kmLlegada', '');
              const n = Number(raw);
              if (Number.isFinite(n) && n >= 0) set('kmLlegada', Math.trunc(n));
            }}
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