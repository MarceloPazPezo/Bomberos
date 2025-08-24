// src/components/parte/SelectableCard.jsx
import React from "react";

export default function SelectableCard({ selected, onClick, icon: Icon, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-3 w-full px-3 py-3 rounded-xl ring-1 transition
      ${selected ? "bg-blue-600 text-white ring-blue-600" : "bg-white ring-gray-200 hover:bg-gray-50"}`}
    >
      <span className={`flex items-center justify-center w-9 h-9 rounded-full ${selected ? "bg-white/20" : "bg-gray-100 text-gray-700"}`}>
        {Icon ? <Icon size={18} className={selected ? "text-white" : "text-gray-700"} /> : null}
      </span>
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}
