// src/components/parte/steps/Paso1.jsx
import React from "react";
import Card from "@components/ui/Card";
import { Field, Input } from "@components/ui/FormControls";
import { Users, Home, ClipboardList } from "lucide-react";
import { yearGT1900, isPosInt } from "@helpers/run.helpers";
import { UserSelect } from "@components/UserSelect";

export default function Paso1({ register, watch, setValue, errors }) {
  return (
    <div className="space-y-6">
      <Card title="1. Datos generales" titleIcon={<ClipboardList className="text-blue-600" />}>
        <div className="grid md:grid-cols-4 gap-3">
          <Input label="Fecha*" type="date" {...register("general.fecha", { validate: (v) => yearGT1900(v) || "El año debe ser mayor a 1900" })} error={errors?.general?.fecha?.message} />
          <Input label="Compañía" {...register("general.compañia")} />
          <Input label="Tipo de servicio" {...register("general.tipo_servicio")} />
          <Input label="Hora despacho" type="time" {...register("general.hora_despacho")} />
          <Input label="Hora 6-0" type="time" {...register("general.hora_6_0")} />
          <Input label="Hora 6-3" type="time" {...register("general.hora_6_3")} />
          <Input label="Hora 6-9" type="time" {...register("general.hora_6_9")} />
          <Input label="Hora 6-10" type="time" {...register("general.hora_6_10")} />
          <Input label="Km salida" type="number" step="1" min={1} {...register("general.km_salida", {
            validate: (v) => (v === "" || isPosInt(v)) || "Debe ser entero positivo (> 0)"
          })} error={errors?.general?.km_salida?.message} />
          <Input label="Km llegada" type="number" step="1" min={1} {...register("general.km_llegada", {
            validate: (v) => (v === "" || isPosInt(v)) || "Debe ser entero positivo (> 0)"
          })} error={errors?.general?.km_llegada?.message} />
        </div>
      </Card>

      <Card title="2. Datos del lugar" titleIcon={<Home className="text-blue-600" />}>
        <div className="grid md:grid-cols-3 gap-3">
          <Input label="Comuna" {...register("general.comuna")} />
          <Input label="Dirección" {...register("general.direccion")} />
          <Input label="Villa/Población" {...register("general.villa_poblacion")} />
        </div>
      </Card>

      <Card title="Redactor*" titleIcon={<Users className="text-blue-600" />}>
        <div className="grid md:grid-cols-2 gap-3">
          <Field label="">
            <UserSelect value={watch("general.redactorId") ?? null} onChange={(id) => setValue("general.redactorId", id)} />
          </Field>
        </div>
      </Card>
    </div>
  );
}
