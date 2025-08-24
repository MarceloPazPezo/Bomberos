// src/components/parte/OcupantesSubform.jsx
import React from "react";
import { Input } from "@components/ui/FormControls";
import RunInput from "@components/parte/RunInput";
import { isAge } from "@helpers/run.helpers";
import { MdDelete } from "react-icons/md";

export default function OcupantesSubform({ prefix, register, setValue, errors }) {
  const [rows, setRows] = React.useState([0]);
  return (
    <div className="space-y-3">
      {rows.map((_, idx) => (
        <div key={idx} className="grid md:grid-cols-4 gap-3 items-start">
          <Input label="Nombres" {...register(`${prefix}.${idx}.nombres`)} />
          <Input label="Apellidos" {...register(`${prefix}.${idx}.apellidos`)} />
          <Input
            label="Edad"
            type="number"
            step="1"
            {...register(`${prefix}.${idx}.edad`, {
              validate: (v) => (v === "" || isAge(v)) || "Debe ser entero entre 1 y 129"
            })}
            error={errors?.[prefix]?.[idx]?.edad?.message}
          />
          <RunInput label="RUN" name={`${prefix}.${idx}.run`} register={register} setValue={setValue} error={errors?.[prefix]?.[idx]?.run?.message} />
          <Input label="Ocupantes" {...register(`${prefix}.${idx}.ocupantes`)} />
          <Input label="Vínculo" {...register(`${prefix}.${idx}.vinculo`)} />
          <div>
            <Input label="Gravedad" {...register(`${prefix}.${idx}.gravedad`)} />
            <div className="text-right mt-2">
              <button
                type="button"
                onClick={() => setRows((r) => r.filter((__, i) => i !== idx))}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-red-300 text-red-700 hover:bg-red-50"
              >
                <MdDelete size={16} /> Eliminar
              </button>
            </div>
          </div>
        </div>
      ))}
      <button type="button" onClick={() => setRows((r) => [...r, r.length])} className="text-sm text-blue-600">
        + Agregar ocupante
      </button>
    </div>
  );
}
