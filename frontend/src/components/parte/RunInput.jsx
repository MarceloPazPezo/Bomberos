// src/components/parte/RunInput.jsx
import React from "react";
import { formatRun, isValidRunModulo11 } from "@helpers/run.helpers";

export default function RunInput({ label = "RUN", name, register, setValue, error }) {
  return (
    <label className="block">
      <span className="block text-sm mb-1 text-gray-700">{label}</span>
      <input
        {...register(name, {
          onChange: (e) => setValue(name, formatRun(e.target.value), { shouldValidate: true, shouldDirty: true }),
          validate: (v) => (!v || isValidRunModulo11(v)) || "RUN inválido (módulo 11)",
        })}
        maxLength={12}
        placeholder="12.345.678-9"
        className={`w-full border ${error ? "border-red-400" : "border-gray-300"} rounded-md px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 ${error ? "focus:ring-red-200 focus:border-red-400" : "focus:ring-gray-300 focus:border-gray-400"}`}
      />
      {error && <span className="text-xs text-red-600 mt-1 block">{error}</span>}
    </label>
  );
}
