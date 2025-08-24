// src/components/ui/Card.jsx
import React from "react";
import { MdPersonAdd } from "react-icons/md";

export default function Card({ title, titleIcon, action, children }) {
  return (
    <section className="bg-white rounded-2xl ring-1 ring-gray-200 p-4 md:p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {titleIcon}
          <h3 className="font-semibold">{title}</h3>
        </div>
        {action ? (
          <button
            type="button"
            onClick={action.props.onClick}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-50 text-blue-700 ring-1 ring-blue-200 hover:bg-blue-100"
          >
            <MdPersonAdd /> Añadir
          </button>
        ) : null}
      </div>
      {children}
    </section>
  );
}
