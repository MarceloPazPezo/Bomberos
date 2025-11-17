import { useEffect, useMemo } from 'react';
import { Trash2 } from 'lucide-react';
import Select from 'react-select';
import { formatRutForDisplay } from '@helpers/rutFormatter.js';


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

  const companiaOptions = useMemo(() => {
    return companias
      .map((c) => {
        const optionValue = c.id?.toString() ?? '';
        if (!optionValue) return null;
        return {
          value: optionValue,
          label: c.nombre || `Compañía ${optionValue}`,
          data: {
            nombre: (c.nombre || '').toLowerCase(),
          },
        };
      })
      .filter(Boolean);
  }, [companias]);

  const selectedCompaniaOption = useMemo(() => {
    if (value.companiaId === '' || value.companiaId === null || value.companiaId === undefined) return null;
    return companiaOptions.find((opt) => opt.value === value.companiaId.toString()) || null;
  }, [value.companiaId, companiaOptions]);

  const bomberoOptions = useMemo(() => {
    return bomberosDeCompania.map((b) => {
      const nombre = [b.nombres, b.apellidos].filter(Boolean).join(' ').trim() || `Bombero ${b.id}`;
      const run = formatRutForDisplay(b.run);
      return {
        value: String(b.id),
        label: run ? `${run} • ${nombre}` : nombre,
        data: {
          nombre: nombre.toLowerCase(),
          run: (run || '').toLowerCase(),
        },
      };
    });
  }, [bomberosDeCompania]);

  const selectedBomberoOption = useMemo(() => {
    if (value.bomberoId === '' || value.bomberoId === null || value.bomberoId === undefined) return null;
    return bomberoOptions.find((opt) => opt.value === value.bomberoId.toString()) || null;
  }, [value.bomberoId, bomberoOptions]);

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

  const filterOption = (candidate, rawInput) => {
    if (!rawInput) return true;
    const term = rawInput.toLowerCase();
    const labelMatch = candidate.label.toLowerCase().includes(term);
    const extraMatch =
      candidate.data?.nombre?.includes(term) ||
      candidate.data?.run?.includes(term);
    return labelMatch || extraMatch;
  };
  const selectMenuPortalTarget = typeof window !== 'undefined' ? document.body : null;

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
        <Select
          inputId={`accidentado-compania-${index}`}
          isSearchable
          isClearable
          options={companiaOptions}
          value={selectedCompaniaOption}
          menuPortalTarget={selectMenuPortalTarget}
          onChange={(option) => {
            if (!option) {
              onChange({ ...value, companiaId: '', bomberoId: '' });
            } else {
              const numeric = Number(option.value);
              onChange({
                ...value,
                companiaId: Number.isNaN(numeric) ? '' : numeric,
                bomberoId: '',
              });
            }
          }}
          placeholder="Buscar compañía..."
          noOptionsMessage={() => 'No se encontraron compañías'}
          styles={selectStyles}
          classNamePrefix="accidentado-compania"
          filterOption={filterOption}
        />

        {/* Bombero accidentado */}
        <Select
          inputId={`accidentado-bombero-${index}`}
          isSearchable
          isClearable
          isDisabled={!value.companiaId || loadingBomberos}
          isLoading={loadingBomberos}
          options={bomberoOptions}
          value={selectedBomberoOption}
          menuPortalTarget={selectMenuPortalTarget}
          onChange={(option) => {
            if (!option) {
              set('bomberoId', '');
            } else {
              const numeric = Number(option.value);
              set('bomberoId', Number.isNaN(numeric) ? '' : numeric);
            }
          }}
          placeholder={
            !value.companiaId
              ? 'Selecciona compañía primero'
              : loadingBomberos
                ? 'Cargando bomberos...'
                : errorBomberos || 'Buscar bombero...'
          }
          noOptionsMessage={() =>
            loadingBomberos ? 'Cargando...' : 'No se encontraron bomberos'
          }
          styles={selectStyles}
          classNamePrefix="accidentado-bombero"
          filterOption={filterOption}
        />

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