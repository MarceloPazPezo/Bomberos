// src/components/parte/steps/Paso3.jsx
import React from "react";
import Card from "@components/ui/Card";
import { Field, Input, Textarea } from "@components/ui/FormControls";
import { Users, Car, ClipboardList } from "lucide-react";
import { isPosInt } from "@helpers/run.helpers";
import { UserSelect } from "@components/UserSelect";
import RunInput from "@components/parte/RunInput";
import Row from "@components/parte/Row";
import BtnAdd from "@components/parte/BtnAdd";

export default function Paso3({ register, unidadesFA, accidentadosFA, otrosServiciosFA, watch, setValue, errors }) {
  const unidades = watch("compañia.unidades");
  return (
    <div className="space-y-6">
      <Card
        title="7. Material mayor y oficial al mando"
        titleIcon={<Car className="text-blue-600" />}
        action={<BtnAdd onClick={() => unidadesFA.append({ unidad: "", conductorId: null, oficialAlMandoId: null, nVoluntarios: "" })} />}
      >
        {unidadesFA.fields.map((f, i) => (
          <Row key={f.id} title={`Unidad #${i + 1}`} onRemove={() => unidadesFA.remove(i)}>
            <div className="grid md:grid-cols-4 gap-3">
              <Input label="Unidad" {...register(`compañia.unidades.${i}.unidad`)} />
              <Field label="Conductor">
                <UserSelect value={unidades?.[i]?.conductorId ?? null} onChange={(id) => setValue(`compañia.unidades.${i}.conductorId`, id)} />
              </Field>
              <Field label="Oficial al mando">
                <UserSelect value={unidades?.[i]?.oficialAlMandoId ?? null} onChange={(id) => setValue(`compañia.unidades.${i}.oficialAlMandoId`, id)} />
              </Field>
              <Input label="N° voluntarios" type="number" step="1" {...register(`compañia.unidades.${i}.nVoluntarios`, {
                validate: (v) => (v === "" || isPosInt(v)) || "Debe ser entero positivo (> 0)"
              })} error={errors?.compañia?.unidades?.[i]?.nVoluntarios?.message} />
            </div>
          </Row>
        ))}
      </Card>

      <Card title="8. Bomberos accidentados" titleIcon={<Users className="text-blue-600" />} action={<BtnAdd onClick={() => accidentadosFA.append({})} />}>
        {accidentadosFA.fields.map((f, i) => (
          <Row key={f.id} title={`Accidentado #${i + 1}`} onRemove={() => accidentadosFA.remove(i)}>
            <div className="grid md:grid-cols-6 gap-3">
              <Input label="Compañía" {...register(`compañia.accidentados.${i}.compañia`)} />
              <Field label="Bombero accidentado">
                <UserSelect value={watch(`compañia.accidentados.${i}.bomberoId`) ?? null} onChange={(id) => setValue(`compañia.accidentados.${i}.bomberoId`, id)} />
              </Field>
              <RunInput label="RUN" name={`compañia.accidentados.${i}.run`} register={register} setValue={setValue} error={errors?.compañia?.accidentados?.[i]?.run?.message} />
              <Input label="Lesiones" {...register(`compañia.accidentados.${i}.lesiones`)} />
              <Input label="Constancia" {...register(`compañia.accidentados.${i}.constancia`)} />
              <Input label="Comisaría" {...register(`compañia.accidentados.${i}.comisaria`)} />
            </div>
            <div className="grid md:grid-cols-1 gap-3 mt-3">
              <Textarea label="Acciones" rows={2} {...register(`compañia.accidentados.${i}.acciones`)} />
            </div>
          </Row>
        ))}
      </Card>

      <Card title="9. Otros servicios de emergencia en el lugar" titleIcon={<ClipboardList className="text-blue-600" />} action={<BtnAdd onClick={() => otrosServiciosFA.append({})} />}>
        {otrosServiciosFA.fields.map((f, i) => (
          <Row key={f.id} title={`Servicio #${i + 1}`} onRemove={() => otrosServiciosFA.remove(i)}>
            <div className="grid md:grid-cols-5 gap-3">
              <Input label="Servicio (Samu, Carabineros, etc.)" {...register(`compañia.otrosServicios.${i}.servicio`)} />
              <Input label="Unidad" {...register(`compañia.otrosServicios.${i}.unidad`)} />
              <Input label="A cargo" {...register(`compañia.otrosServicios.${i}.aCargo`)} />
              <Input label="N° personal" type="number" step="1" {...register(`compañia.otrosServicios.${i}.nPersonal`, {
                validate: (v) => (v === "" || isPosInt(v)) || "Debe ser entero positivo (> 0)"
              })} error={errors?.compañia?.otrosServicios?.[i]?.nPersonal?.message} />
              <Input label="Observaciones" {...register(`compañia.otrosServicios.${i}.observaciones`)} />
            </div>
          </Row>
        ))}
      </Card>
    </div>
  );
}
