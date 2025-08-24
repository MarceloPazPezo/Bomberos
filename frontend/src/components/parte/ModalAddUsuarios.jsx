// src/components/parte/ModalAddUsuarios.jsx
import React from "react";
import { MdClose, MdSearch } from "react-icons/md";

export default function ModalAddUsuarios({ open, title, onClose, allUsers, excludeIds, onConfirm }) {
  const [q, setQ] = React.useState("");
  const [selected, setSelected] = React.useState([]);

  React.useEffect(() => { if (open) { setQ(""); setSelected([]); } }, [open]);
  if (!open) return null;

  const list = (allUsers || []).filter((u) =>
    !excludeIds.has(u.id) &&
    (`${u.nombres} ${u.apellidos} ${u.run}`.toLowerCase().includes(q.toLowerCase()))
  );
  const toggle = (id) => setSelected((arr) => (arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id]));

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><MdClose size={18} /></button>
        </div>

        <div className="p-4">
          <div className="relative mb-3">
            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              placeholder="Buscar por nombre o RUN..."
              className="w-full border border-gray-300 rounded-md pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-400"
              value={q} onChange={(e) => setQ(e.target.value)}
            />
          </div>

          <div className="max-h-72 overflow-auto border rounded-xl">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="text-left p-3">Nombre</th>
                  <th className="text-left p-3">RUN</th>
                  <th className="text-right p-3">Seleccionar</th>
                </tr>
              </thead>
              <tbody>
                {list.map((u) => (
                  <tr key={u.id} className="border-t">
                    <td className="p-3">{u.nombres} {u.apellidos}</td>
                    <td className="p-3">{u.run}</td>
                    <td className="p-3 text-right">
                      <input
                        type="checkbox"
                        className="w-5 h-5 accent-blue-600"
                        checked={selected.includes(u.id)}
                        onChange={() => toggle(u.id)}
                      />
                    </td>
                  </tr>
                ))}
                {list.length === 0 && (
                  <tr><td colSpan={3} className="p-6 text-center text-gray-500">No hay usuarios disponibles.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-4 border-t">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50">Cancelar</button>
          <button
            onClick={() => { onConfirm(selected); onClose(); }}
            disabled={selected.length === 0}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            Añadir {selected.length > 0 ? `(${selected.length})` : ""}
          </button>
        </div>
      </div>
    </div>
  );
}
