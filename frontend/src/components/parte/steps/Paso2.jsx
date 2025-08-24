// src/components/parte/steps/Paso2.jsx
import React from "react";
import Card from "@components/ui/Card";
import { Label, Input, Textarea, Field } from "@components/ui/FormControls";
import { Users, Home, Car, Flame, Layers, LayoutGrid, Zap, TrendingUp, TrendingDown, PauseCircle, ClipboardList } from "lucide-react";
import { isPosInt, isAge } from "@helpers/run.helpers";
import RunInput from "@components/parte/RunInput";
import SelectableCard from "@components/parte/SelectableCard";
import Row from "@components/parte/Row";
import BtnAdd from "@components/parte/BtnAdd";
import OcupantesSubform from "@components/parte/OcupantesSubform";

export default function Paso2({ register, otrosInmueblesFA, vehiculosFA, control, setValue, errors, watch }) {
  const g = watch("general");

  const tipo_incendioOptions = [
    { value: "COMPARTIMENTAL", label: "compartimental", icon: LayoutGrid },
    { value: "MULTICOMPARTIMENTAL", label: "Multicompartimental", icon: Layers },
    { value: "ESTRUCTURAL", label: "Estructural", icon: Home },
  ];
  const faseOptions = [
    { value: "IGNICION", label: "Ignición", icon: Flame },
    { value: "INCREMENTO", label: "Incremento", icon: TrendingUp },
    { value: "LIBRE COMBUSTIÓN", label: "Libre combustión", icon: Zap },
    { value: "DECAIMIENTO", label: "Decaimiento", icon: TrendingDown },
    { value: "LATENTE", label: "Latente", icon: PauseCircle },
  ];

  return (
    <div className="space-y-6">
      {/* 3. Propietario */}
      <Card title="3. Propietario" titleIcon={<Users className="text-blue-600" />}>
        <div className="grid md:grid-cols-4 gap-3">
          <RunInput label="RUN" name="general.propietario.run" register={register} setValue={setValue} error={errors?.general?.propietario?.run?.message} />
          <Input label="Nombres*" {...register("general.propietario.nombres")} />
          <Input label="Apellidos*" {...register("general.propietario.apellidos")} />
          <Input label="Teléfono" {...register("general.propietario.telefono")} />
          <Input label="Dirección" {...register("general.propietario.direccion")} />
          <Input label="Edad" type="number" step="1" min={0} {...register("general.propietario.edad", {
            validate: (v) => (v === "" || isAge(v)) || "Debe ser entero y mayor a 0"
          })} error={errors?.general?.propietario?.edad?.message} />
          <Input label="Estado civil" {...register("general.propietario.estadoCivil")} />
        </div>
      </Card>

      {/* 4. Características */}
      <Card title="4. Características" titleIcon={<Flame className="text-blue-600" />}>
        <Label>Tipo de incendio</Label>
        <div className="grid sm:grid-cols-3 gap-3 mb-3">
          {tipo_incendioOptions.map((op) => (
            <SelectableCard
              key={op.value}
              selected={g.tipo_incendio === op.value}
              onClick={() => setValue("general.tipo_incendio", op.value, { shouldDirty: true })}
              icon={op.icon}
              label={op.label}
            />
          ))}
        </div>

        <Label>Fase alcanzada</Label>
        <div className="grid sm:grid-cols-5 gap-3">
          {faseOptions.map((op) => (
            <SelectableCard
              key={op.value}
              selected={g.fase_alcanzada === op.value}
              onClick={() => setValue("general.fase_alcanzada", op.value, { shouldDirty: true })}
              icon={op.icon}
              label={op.label}
            />
          ))}
        </div>

        <div className="mt-4">
          <Textarea label="Descripción preliminar" rows={3} {...register("general.descripcion_preliminar")} />
        </div>
      </Card>

      {/* Construcción y daños */}
      <Card title="Construcción y daños" titleIcon={<Layers className="text-blue-600" />}>
        <div className="grid md:grid-cols-3 gap-3">
          <Input label="Tipo de construcción" {...register("general.tipo_construccion")} />
          <Input label="Daños de la vivienda" {...register("general.daños_vivienda")} />
          <Input label="M2 de construcción" type="number" step="1" min={0} {...register("general.m_2_construccion", {
            validate: (v) => (v === "" || isPosInt(v)) || "Debe ser entero positivo (> 0)"
          })} error={errors?.general?.m_2_construccion?.message} />
          <Input label="N° de pisos" type="number" step="1" min={1} {...register("general.n_pisos", {
            validate: (v) => (v === "" || isPosInt(v)) || "Debe ser entero positivo (> 0)"
          })} error={errors?.general?.n_pisos?.message} />
          <Input label="Daños enseres" {...register("general.daños_enseres")} />
          <Input label="M2 afectado" type="number" step="1" min={0} {...register("general.m_2_afectado", {
            validate: (v) => (v === "" || isPosInt(v)) || "Debe ser entero positivo (> 0)"
          })} error={errors?.general?.m_2_afectado?.message} />
        </div>
      </Card>

      {/* 5. y 6. */}
      <Card title="5. Otros inmuebles afectados" titleIcon={<Home className="text-blue-600" />} action={<BtnAdd onClick={() => otrosInmueblesFA.append({})} />}>
        {otrosInmueblesFA.fields.map((f, i) => (
          <Row key={f.id} title={`Inmueble #${i + 1}`} onRemove={() => otrosInmueblesFA.remove(i)}>
            <div className="grid md:grid-cols-5 gap-3">
              <Input label="Dirección" {...register(`afectados.otrosInmuebles.${i}.direccion`)} />
              <RunInput label="RUN" name={`afectados.otrosInmuebles.${i}.run`} register={register} setValue={setValue} error={errors?.afectados?.otrosInmuebles?.[i]?.run?.message} />
              <Input label="Nombre" {...register(`afectados.otrosInmuebles.${i}.nombres`)} />
              <Input label="Apellidos" {...register(`afectados.otrosInmuebles.${i}.apellidos`)} />
              <Input label="Edad" type="number" step="1" {...register(`afectados.otrosInmuebles.${i}.edad`, {
                validate: (v) => (v === "" || isAge(v)) || "Debe ser entero entre 1 y 129"
              })} error={errors?.afectados?.otrosInmuebles?.[i]?.edad?.message} />
              <Input label="Estado civil" {...register(`afectados.otrosInmuebles.${i}.estado_civil`)} />
            </div>
          </Row>
        ))}
      </Card>

      <Card
        title="6. Antecedentes del vehículo"
        titleIcon={<Car className="text-blue-600" />}
        action={
          <BtnAdd
            onClick={() =>
              vehiculosFA.append({
                tipo_vehiculo: "",
                marca: "",
                modelo: "",
                color: "",
                patente: "",
                conductor_nombres: "",
                conductor_apellidos: "",
                conductor_run: "",
                ocupantes: [{ nombre: "", apellidos:"" , edad: "", run: "", ocupantes: "", vinculo: "", gravedad: "" }],
              })
            }
          />
        }
      >
        {vehiculosFA.fields.map((f, i) => (
          <Row key={f.id} title={`Vehículo #${i + 1}`} onRemove={() => vehiculosFA.remove(i) }>
            <div className="grid md:grid-cols-5 gap-3 border-b-2 border-gray-400 pb-5">
              <Input label="Tipo de vehículo" {...register(`afectados.vehiculos.${i}.tipo_vehiculo`)} />
              <Input label="Marca" {...register(`afectados.vehiculos.${i}.marca`)} />
              <Input label="Modelo" {...register(`afectados.vehiculos.${i}.modelo`)} />
              <Input label="Color" {...register(`afectados.vehiculos.${i}.color`)} />
              <Input label="Patente" {...register(`afectados.vehiculos.${i}.patente`)} />
              <Input label="Nombres conductor" {...register(`afectados.vehiculos.${i}.conductor_nombres`)} />
              <Input label="Apellidos conductor" {...register(`afectados.vehiculos.${i}.conductor_apellidos`)} />
              <RunInput label="RUN (conductor)" name={`afectados.vehiculos.${i}.conductor_run`} register={register} setValue={setValue} error={errors?.afectados?.vehiculos?.[i]?.run?.message} />
            </div>

            <div className="mt-4 ">
            
              <p className="text-sm font-medium mb-2">Ocupantes del vehículo</p>
              <OcupantesSubform prefix={`afectados.vehiculos.${i}.ocupantes`} register={register} setValue={setValue} errors={errors} />
            </div>
          </Row>
        ))}
      </Card>
    </div>
  );
}
