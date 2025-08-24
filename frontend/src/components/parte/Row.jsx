// src/components/parte/Row.jsx
import React from "react";

export default function Row({ title, children, onRemove }) {
  return (
    <div className="rounded-xl ring-1 ring-gray-200 p-3 mb-3 bg-gray-50/60">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium">{title}</p>
        <button type="button" onClick={onRemove} className="text-sm text-red-600 hover:underline">Quitar</button>
      </div>
      {children}
    </div>
  );
}
