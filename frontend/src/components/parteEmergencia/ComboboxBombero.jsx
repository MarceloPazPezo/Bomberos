import React, { useState, useEffect, useRef } from 'react';

const nombreBombero = (b) => {
  const n = [b.nombres, b.apellidos].filter(Boolean).join(' ').trim();
  return n || `Bombero ${b.id}`;
};


function ComboBombero({ value, onChange, options = [], placeholder = 'Buscar voluntario…', disabled }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const ref = useRef(null);

  const selected = options.find(o => String(o.id) === String(value)) || null;
  const filtered = query
    ? options.filter(o => nombreBombero(o).toLowerCase().includes(query.toLowerCase()))
    : options;

  useEffect(() => {
    const onClickOutside = (e) => {
      if (!ref.current || ref.current.contains(e.target)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <input
        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-400"
        placeholder={placeholder}
        value={open ? query : (selected ? nombreBombero(selected) : '')}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        disabled={disabled}
      />
      {value && (
        <button
          type="button"
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
          onClick={() => { onChange(''); setQuery(''); }}
          tabIndex={-1}
          aria-label="Limpiar"
        >
          ✕
        </button>
      )}
      {open && !disabled && (
        <div className="absolute z-10 mt-1 w-full max-h-56 overflow-auto rounded-md border border-gray-200 bg-white shadow">
          {filtered.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-500">Sin resultados</div>
          ) : (
            filtered.map((o) => (
              <button
                key={o.id}
                type="button"
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                onClick={() => {
                  onChange(o.id);
                  setOpen(false);
                  setQuery('');
                }}
              >
                {nombreBombero(o)}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}


export default ComboBombero;