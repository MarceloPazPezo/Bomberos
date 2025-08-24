// src/components/parte/TableAsistencia.jsx
import React from "react";
import { MdDelete } from "react-icons/md";

export default function TableAsistencia({ rows, onRemove }) {
  return (
    <div className="overflow-auto rounded-xl border">
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="text-left p-3">Nombre</th>
            <th className="text-left p-3">RUN</th>
            <th className="text-right p-3">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((u) => (
            <tr key={u.id} className="border-t">
              <td className="p-3">{u.nombres} {u.apellidos}</td>
              <td className="p-3">{u.run}</td>
              <td className="p-3 text-right">
                <button
                  type="button"
                  onClick={() => onRemove(u.id)}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-red-300 text-red-700 hover:bg-red-50"
                >
                  <MdDelete size={16} /> Quitar
                </button>
              </td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr><td colSpan={3} className="p-6 text-center text-gray-500">Sin registros.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
