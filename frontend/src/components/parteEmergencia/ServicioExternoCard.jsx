import { useMemo } from 'react';
import { Handshake, Trash2 } from 'lucide-react';
import Select from 'react-select';
import { toStartCase } from '@helpers/textFormatters.js';


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
      zIndex: 35,
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
    input: (base) => ({
      ...base,
      fontSize: '0.85rem',
    }),
    singleValue: (base) => ({
      ...base,
      fontSize: '0.85rem',
      color: '#1F2937',
    }),
  }), []);

  const servicioOptions = useMemo(() => servicios.map((s) => {
    const valueOption = s.id?.toString() ?? '';
    if (!valueOption) return null;
    const rawName = s.nombre ?? s.label ?? `Servicio ${valueOption}`;
    const formattedName = toStartCase(rawName);
    return {
      value: valueOption,
      label: formattedName,
      data: {
        nombre: (rawName || '').toLowerCase(),
      },
    };
  }).filter(Boolean), [servicios]);

  const selectedServicioOption = useMemo(() => {
    if (!value.servicioId) return null;
    return servicioOptions.find((opt) => opt.value === value.servicioId.toString()) || null;
  }, [value.servicioId, servicioOptions]);

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
          <Select
            isSearchable
            isClearable
            isDisabled={loadingServicios}
            isLoading={loadingServicios}
            options={servicioOptions}
            value={selectedServicioOption}
            onChange={(option) => set('servicioId', option?.value ?? '')}
            placeholder={loadingServicios ? 'Cargando servicios...' : errorServicios || 'Buscar servicio...'}
            noOptionsMessage={() => loadingServicios ? 'Cargando...' : 'Sin coincidencias'}
            styles={selectStyles}
            classNamePrefix="servicio-select"
          />
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