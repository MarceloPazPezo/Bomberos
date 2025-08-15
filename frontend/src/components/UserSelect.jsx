import React from 'react';
import { getUsers } from '@services/usuario.service';

function useUserOptions() {
  const [options, setOptions] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const list = await getUsers(); // ya viene formateado
        const opts = (list || []).map(u => ({
          label: `${u.nombres ?? ''} ${u.apellidos ?? ''}`.trim() || u.email || `Usuario ${u.id}`,
          value: Number(u.id)
        }));
        if (alive) setOptions(opts);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  return { options, loading };
}

export function UserSelect({ value, onChange, placeholder = 'Seleccionar usuario…', disabled }) {
  const { options, loading } = useUserOptions();

  return (
    <select
      className="w-full border rounded-lg px-3 py-2 bg-white"
      value={value ?? ''}
      onChange={e => onChange(e.target.value ? Number(e.target.value) : null)}
      disabled={disabled || loading}
    >
      <option value="">{loading ? 'Cargando…' : placeholder}</option>
      {options.map(o => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

export function UserMultiSelect({ values = [], onChange, placeholder = 'Seleccionar usuarios…' }) {
  const { options, loading } = useUserOptions();

  return (
    <select
      multiple
      className="w-full border rounded-lg px-3 py-2 bg-white h-44"
      value={values.map(String)}
      onChange={e => {
        const selected = Array.from(e.target.selectedOptions).map(o => Number(o.value));
        onChange(selected);
      }}
      disabled={loading}
    >
      <option disabled value="">{loading ? 'Cargando…' : placeholder}</option>
      {options.map(o => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}
