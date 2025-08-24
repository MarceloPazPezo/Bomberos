// src/components/parte/PasoIndicator.jsx
import React from "react";
import { CheckCircle } from "lucide-react";

export default function PasoIndicator({ step, setStep }) {
  const steps = [
    { id: 1, label: "Información general" },
    { id: 2, label: "Afectados" },
    { id: 3, label: "Información compañía" },
    { id: 4, label: "Asistencia" },
  ];
  return (
    <div className="flex items-center gap-4">
      {steps.map((s, idx) => {
        const active = step === s.id;
        const done = step > s.id;
        return (
          <button type="button" key={s.id} onClick={() => setStep(s.id)} className="flex items-center gap-2 group">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition
              ${active ? "bg-blue-600 text-white" : done ? "bg-green-600 text-white" : "bg-gray-200 text-gray-700"}`}
            >
              {done ? <CheckCircle size={18} /> : s.id}
            </div>
            <span className={`text-sm ${active ? "text-blue-700 font-medium" : "text-gray-600"}`}>{s.label}</span>
            {idx < steps.length - 1 && <div className="w-12 h-[2px] bg-gray-200 mx-2 group-last:hidden" />}
          </button>
        );
      })}
    </div>
  );
}
