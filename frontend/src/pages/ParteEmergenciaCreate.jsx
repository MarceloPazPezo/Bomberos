// src/pages/ParteEmergenciaCreate.jsx
import React from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { UserSelect } from "@components/UserSelect";
import { crearParteEmergencia } from "@services/parteEmergencia.service";
import { useNavigate } from "react-router-dom";
import { getUsers } from "@services/usuario.service";

// Íconos (lucide + md)
import {
  ChevronLeft, ChevronRight, Users, Home, Car, ClipboardList,
  CheckCircle, Flame, Layers, LayoutGrid, Zap, TrendingUp,
  TrendingDown, PauseCircle
} from "lucide-react";
import { MdAdd, MdClose, MdPersonAdd, MdDelete, MdSearch } from "react-icons/md";

/* ----------------- HELPERS: RUN (formato + módulo 11) ----------------- */
const onlyDigitsK = (v="") => v.replace(/[^0-9kK]/g, "");
function formatRun(v="") {
  const s = onlyDigitsK(v).toUpperCase();
  if (!s) return "";
  const body = s.slice(0, -1);
  const dv = s.slice(-1);
  let rev = body.split("").reverse().join("");
  let formatted = "";
  for (let i = 0; i < rev.length; i++) {
    if (i !== 0 && i % 3 === 0) formatted = "." + formatted;
    formatted = rev[i] + formatted;
  }
  return (formatted ? formatted : body) + (dv ? `-${dv}` : "");
}
function cleanRun(v="") {
  return v.replace(/\./g, "").replace(/-/g, "").toUpperCase();
}
function isValidRunModulo11(v="") {
  const s = cleanRun(v);
  if (s.length < 2) return false;
  const body = s.slice(0, -1);
  const dv = s.slice(-1);
  if (!/^\d+$/.test(body)) return false;
  let sum = 0, mul = 2;
  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i], 10) * mul;
    mul = mul === 7 ? 2 : mul + 1;
  }
  const res = 11 - (sum % 11);
  const dvCalc = res === 11 ? "0" : res === 10 ? "K" : String(res);
  return dv.toUpperCase() === dvCalc;
}
/* ----------------- HELPERS: Validadores numéricos ----------------- */
const isPosInt = (v) => Number.isInteger(Number(v)) && Number(v) > 0;
const isAge = (v) => Number.isInteger(Number(v)) && Number(v) > 0 && Number(v) < 130;
const yearGT1900 = (v) => {
  if (!v) return true;
  const y = parseInt(String(v).slice(0, 4), 10);
  return y > 1900;
};

const defaultValues = {
  general: {
    fecha: new Date().toISOString().split("T")[0],
    compania: "",
    tipoServicio: "",
    horaDespacho: "",
    hora6_0: "",
    hora6_3: "",
    hora6_9: "",
    hora6_10: "",
    kmSalida: "",
    kmLlegada: "",
    comuna: "",
    direccion: "",
    villaPoblacion: "",
    propietario: { rut: "", nombres: "", apellidos: "", telefono: "" },
    tipoIncendio: "",
    faseAlcanzada: "",
    descripcionPreliminar: "",
    tipoConstruccion: "",
    danosVivienda: "",
    m2Construccion: "",
    nPisos: "",
    danosEnseres: "",
    m2Afectado: "",
    redactorId: null,
    oficialACargoId: null,
  },
  afectados: {
    otrosInmuebles: [{ direccion: "", nombre: "", rut: "", edad: "", estadoCivil: "" }],
    vehiculos: [
      {
        tipoVehiculo: "",
        marca: "",
        modelo: "",
        color: "",
        patente: "",
        conductor: "",
        rut: "",
        ocupantes: [{ nombre: "", edad: "", rut: "", ocupantes: "", vinculo: "", gravedad: "" }],
      },
    ],
  },
  compania: {
    unidades: [{ unidad: "", conductorId: null, oficialAlMandoId: null, nVoluntarios: "" }],
    accidentados: [{ compania: "", bomberoId: null, rut: "", lesiones: "", constancia: "", comisaria: "", acciones: "" }],
    otrosServicios: [{ servicio: "", unidad: "", aCargo: "", nPersonal: "" , observaciones: ""}],
  },
  asistencia: {
    enEmergenciaUserIds: [],
    enCuartelUserIds: [],
  },
};

export default function ParteEmergenciaCreate() {
  const nav = useNavigate();
  const [step, setStep] = React.useState(1);

  const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm({
    defaultValues,
    mode: "onChange",
  });

  // field arrays
  const otrosInmueblesFA = useFieldArray({ control, name: "afectados.otrosInmuebles" });
  const vehiculosFA = useFieldArray({ control, name: "afectados.vehiculos" });
  const unidadesFA = useFieldArray({ control, name: "compania.unidades" });
  const accidentadosFA = useFieldArray({ control, name: "compania.accidentados" });
  const otrosServiciosFA = useFieldArray({ control, name: "compania.otrosServicios" });

  const onSubmit = async (payload) => {
    const clean = (v) => (v === "" || v === null ? null : v);
    // números opcionales -> entero
    const toIntOrNull = (v) => {
      const n = parseInt(v, 10);
      return Number.isNaN(n) ? null : n;
    };
    payload.general.kmSalida = toIntOrNull(payload.general.kmSalida);
    payload.general.kmLlegada = toIntOrNull(payload.general.kmLlegada);
    payload.general.m2Construccion = toIntOrNull(payload.general.m2Construccion);
    payload.general.m2Afectado = toIntOrNull(payload.general.m2Afectado);
    payload.general.nPisos = toIntOrNull(payload.general.nPisos);
    payload.compania.unidades = payload.compania.unidades.map((u) => ({
      ...u,
      nVoluntarios: toIntOrNull(u.nVoluntarios),
    }));
    payload.compania.otrosServicios = payload.compania.otrosServicios.map((o) => ({
      ...o,
      nPersonal: toIntOrNull(o.nPersonal),
    }));

    await crearParteEmergencia(payload);
    nav("/partes-emergencia");
  };

  return (
    <div className="p-4 md:p-6">
      {/* Encabezado + Stepper (lucide) */}
      <div className="bg-white rounded-3xl shadow-sm p-6 mb-6">
        <div className="flex items-center gap-3 mb-2">
          <ClipboardList className="text-blue-600" />
          <h1 className="text-xl font-semibold">Nuevo Parte de Emergencia</h1>
        </div>
        <PasoIndicator step={step} setStep={setStep} />
      </div>

      {/* wrapper: inputs bordes GRAY SOLO en esta página */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6
        [&_input]:w-full [&_input]:border [&_input]:border-gray-300 [&_input]:rounded-md [&_input]:px-3 [&_input]:py-2 [&_input]:text-sm
        [&_input]:placeholder:text-gray-400 [&_input]:focus:outline-none [&_input]:focus:ring-2 [&_input]:focus:ring-gray-300 [&_input]:focus:border-gray-400
        [&_textarea]:w-full [&_textarea]:border [&_textarea]:border-gray-300 [&_textarea]:rounded-md [&_textarea]:px-3 [&_textarea]:py-2 [&_textarea]:text-sm
        [&_textarea]:placeholder:text-gray-400 [&_textarea]:focus:outline-none [&_textarea]:focus:ring-2 [&_textarea]:focus:ring-gray-300 [&_textarea]:focus:border-gray-400"
      >
        {step === 1 && <Paso1 {...{ register, watch, setValue, errors }} />}
        {step === 2 && <Paso2 {...{ register, otrosInmueblesFA, vehiculosFA, control, setValue, errors }} />}
        {step === 3 && <Paso3 {...{ register, unidadesFA, accidentadosFA, otrosServiciosFA, watch, setValue, errors }} />}
        {step === 4 && <Paso4 {...{ watch, setValue }} />}

        <div className="flex justify-between pt-4">
          <button type="button" onClick={() => setStep(Math.max(1, step - 1))} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50">
            <ChevronLeft size={18} /> Atrás
          </button>
          {step < 4 ? (
            <button type="button" onClick={() => setStep(step + 1)} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">
              Siguiente <ChevronRight size={18} />
            </button>
          ) : (
            <button type="submit" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700">
              Guardar Parte
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

/* =========================
   PasoIndicator
   ========================= */
function PasoIndicator({ step, setStep }) {
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
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition
              ${active ? "bg-blue-600 text-white" : done ? "bg-green-600 text-white" : "bg-gray-200 text-gray-700"}`}>
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

/* =========================
   Paso 1: Información general (con validaciones)
   ========================= */
function Paso1({ register, watch, setValue, errors }) {
  const g = watch("general");

  const tipoIncendioOptions = [
    { value: "Compartimental", label: "Compartimental", icon: LayoutGrid },
    { value: "Multicompartimental", label: "Multicompartimental", icon: Layers },
    { value: "Estructural", label: "Estructural", icon: Home },
  ];
  const faseOptions = [
    { value: "Ignición", label: "Ignición", icon: Flame },
    { value: "Incremento", label: "Incremento", icon: TrendingUp },
    { value: "Libre combustión", label: "Libre combustión", icon: Zap },
    { value: "Decaimiento", label: "Decaimiento", icon: TrendingDown },
    { value: "Latente", label: "Latente", icon: PauseCircle },
  ];

  return (
    <div className="space-y-6">
      <Card title="1. Datos generales" titleIcon={<ClipboardList className="text-blue-600" />}>
        <div className="grid md:grid-cols-4 gap-3">
          <Input label="Fecha" type="date" {...register("general.fecha", { validate: (v) => yearGT1900(v) || "El año debe ser mayor a 1900" })} error={errors?.general?.fecha?.message} />
          <Input label="Compañía" {...register("general.compania")} />
          <Input label="Tipo de servicio" {...register("general.tipoServicio")} />
          <Input label="Hora despacho" type="time" {...register("general.horaDespacho")} />
          <Input label="Hora 6-0" type="time" {...register("general.hora6_0")} />
          <Input label="Hora 6-3" type="time" {...register("general.hora6_3")} />
          <Input label="Hora 6-9" type="time" {...register("general.hora6_9")} />
          <Input label="Hora 6-10" type="time" {...register("general.hora6_10")} />
          <Input label="Km salida" type="number" step="1" {...register("general.kmSalida", {
            validate: (v) => (v === "" || isPosInt(v)) || "Debe ser entero positivo (> 0)"
          })} error={errors?.general?.kmSalida?.message} />
          <Input label="Km llegada" type="number" step="1" {...register("general.kmLlegada", {
            validate: (v) => (v === "" || isPosInt(v)) || "Debe ser entero positivo (> 0)"
          })} error={errors?.general?.kmLlegada?.message} />
        </div>
      </Card>

      <Card title="2. Datos del lugar" titleIcon={<Home className="text-blue-600" />}>
        <div className="grid md:grid-cols-3 gap-3">
          <Input label="Comuna" {...register("general.comuna")} />
          <Input label="Dirección" {...register("general.direccion")} />
          <Input label="Villa/Población" {...register("general.villaPoblacion")} />
        </div>
      </Card>

      <Card title="3. Propietario" titleIcon={<Users className="text-blue-600" />}>
        <div className="grid md:grid-cols-4 gap-3">
          <RunInput label="RUN" name="general.propietario.rut" register={register} setValue={setValue} error={errors?.general?.propietario?.rut?.message} />
          <Input label="Nombres" {...register("general.propietario.nombres")} />
          <Input label="Apellidos" {...register("general.propietario.apellidos")} />
          <Input label="Teléfono" {...register("general.propietario.telefono")} />
        </div>
      </Card>

      <Card title="4. Características" titleIcon={<Flame className="text-blue-600" />}>
        <Label>Tipo de incendio</Label>
        <div className="grid sm:grid-cols-3 gap-3 mb-3">
          {tipoIncendioOptions.map((op) => (
            <SelectableCard
              key={op.value}
              selected={g.tipoIncendio === op.value}
              onClick={() => setValue("general.tipoIncendio", op.value, { shouldDirty: true })}
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
              selected={g.faseAlcanzada === op.value}
              onClick={() => setValue("general.faseAlcanzada", op.value, { shouldDirty: true })}
              icon={op.icon}
              label={op.label}
            />
          ))}
        </div>

        <div className="mt-4">
          <Textarea label="Descripción preliminar" rows={3} {...register("general.descripcionPreliminar")} />
        </div>
      </Card>

      <Card title="Construcción y daños" titleIcon={<Layers className="text-blue-600" />}>
        <div className="grid md:grid-cols-3 gap-3">
          <Input label="Tipo de construcción" {...register("general.tipoConstruccion")} />
          <Input label="Daños de la vivienda" {...register("general.danosVivienda")} />
          <Input label="M2 de construcción" type="number" step="1" {...register("general.m2Construccion", {
            validate: (v) => (v === "" || isPosInt(v)) || "Debe ser entero positivo (> 0)"
          })} error={errors?.general?.m2Construccion?.message} />
          <Input label="N° de pisos" type="number" step="1" {...register("general.nPisos", {
            validate: (v) => (v === "" || isPosInt(v)) || "Debe ser entero positivo (> 0)"
          })} error={errors?.general?.nPisos?.message} />
          <Input label="Daños enseres" {...register("general.danosEnseres")} />
          <Input label="M2 afectado" type="number" step="1" {...register("general.m2Afectado", {
            validate: (v) => (v === "" || isPosInt(v)) || "Debe ser entero positivo (> 0)"
          })} error={errors?.general?.m2Afectado?.message} />
        </div>
      </Card>

      <Card title="Responsables" titleIcon={<Users className="text-blue-600" />}>
        <div className="grid md:grid-cols-2 gap-3">
          <Field label="Redactor">
            <UserSelect value={g.redactorId ?? null} onChange={(id) => setValue("general.redactorId", id)} />
          </Field>
          <Field label="Oficial a cargo">
            <UserSelect value={g.oficialACargoId ?? null} onChange={(id) => setValue("general.oficialACargoId", id)} />
          </Field>
        </div>
      </Card>
    </div>
  );
}

/* =========================
   Paso 2: Afectados (con validaciones)
   ========================= */
function Paso2({ register, otrosInmueblesFA, vehiculosFA, control, setValue, errors }) {
  return (
    <div className="space-y-6">
      <Card title="5. Otros inmuebles afectados" titleIcon={<Home className="text-blue-600" />} action={<BtnAdd onClick={() => otrosInmueblesFA.append({})} />}>
        {otrosInmueblesFA.fields.map((f, i) => (
          <Row key={f.id} title={`Inmueble #${i + 1}`} onRemove={() => otrosInmueblesFA.remove(i)}>
            <div className="grid md:grid-cols-5 gap-3">
              <Input label="Dirección" {...register(`afectados.otrosInmuebles.${i}.direccion`)} />
              <Input label="Nombre" {...register(`afectados.otrosInmuebles.${i}.nombre`)} />
              <RunInput label="RUN" name={`afectados.otrosInmuebles.${i}.rut`} register={register} setValue={setValue} error={errors?.afectados?.otrosInmuebles?.[i]?.rut?.message} />
              <Input label="Edad"  type="number" step="1" {...register(`afectados.otrosInmuebles.${i}.edad`, {
                validate: (v) => (v === "" || isAge(v)) || "Debe ser entero entre 1 y 129"
              })} error={errors?.afectados?.otrosInmuebles?.[i]?.edad?.message} />
              <Input label="Estado civil" {...register(`afectados.otrosInmuebles.${i}.estadoCivil`)} />
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
                tipoVehiculo: "",
                marca: "",
                modelo: "",
                color: "",
                patente: "",
                conductor: "",
                rut: "",
                ocupantes: [{ nombre: "", edad: "", rut: "", ocupantes: "", vinculo: "", gravedad: "" }],
              })
            }
          />
        }
      >
        {vehiculosFA.fields.map((f, i) => (
          <Row key={f.id} title={`Vehículo #${i + 1}`} onRemove={() => vehiculosFA.remove(i)}>
            <div className="grid md:grid-cols-7 gap-3">
              <Input label="Tipo de vehículo" {...register(`afectados.vehiculos.${i}.tipoVehiculo`)} />
              <Input label="Marca" {...register(`afectados.vehiculos.${i}.marca`)} />
              <Input label="Modelo" {...register(`afectados.vehiculos.${i}.modelo`)} />
              <Input label="Color" {...register(`afectados.vehiculos.${i}.color`)} />
              <Input label="Patente" {...register(`afectados.vehiculos.${i}.patente`)} />
              <Input label="Conductor" {...register(`afectados.vehiculos.${i}.conductor`)} />
              <RunInput label="RUN (conductor)" name={`afectados.vehiculos.${i}.rut`} register={register} setValue={setValue} error={errors?.afectados?.vehiculos?.[i]?.rut?.message} />
            </div>

            <div className="mt-4">
              <p className="text-sm font-medium mb-2">Ocupantes del vehículo</p>
              <OcupantesSubform prefix={`afectados.vehiculos.${i}.ocupantes`} register={register} setValue={setValue} errors={errors} />
            </div>
          </Row>
        ))}
      </Card>
    </div>
  );
}

function OcupantesSubform({ prefix, register, setValue, errors }) {
  // NOTA: este subform debe usarse dentro de un FieldArray padre (vehículos)
  // Aquí mapeamos por indices existentes en el objeto con un truco: contamos cuántos hay mirando el propio form.
  // Para mantener simple y estable, pedimos al usuario que agregue ocupantes desde el padre (ya está).
  // Para eliminar/añadir, puedes gestionar desde el padre si lo prefieres. Aquí hacemos una gestión local mínima:
  const [rows, setRows] = React.useState([0]);
  return (
    <div className="space-y-3">
      {rows.map((_, idx) => (
        <div key={idx} className="grid md:grid-cols-6 gap-3 items-start">
          <Input label="Nombre" {...register(`${prefix}.${idx}.nombre`)} />
          <Input label="Edad" type="number" step="1" {...register(`${prefix}.${idx}.edad`, {
            validate: (v) => (v === "" || isAge(v)) || "Debe ser entero entre 1 y 129"
          })} error={errors?.[prefix]?.[idx]?.edad?.message} />
          <RunInput label="RUN" name={`${prefix}.${idx}.rut`} register={register} setValue={setValue} error={errors?.[prefix]?.[idx]?.rut?.message} />
          <Input label="Ocupantes" {...register(`${prefix}.${idx}.ocupantes`)} />
          <Input label="Vínculo" {...register(`${prefix}.${idx}.vinculo`)} />
          <div>
            <Input label="Gravedad" {...register(`${prefix}.${idx}.gravedad`)} />
            <div className="text-right mt-2">
              <button type="button" onClick={() => setRows((r) => r.filter((__, i) => i !== idx))} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-red-300 text-red-700 hover:bg-red-50">
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

/* =========================
   Paso 3: Información compañía (con validaciones)
   ========================= */
function Paso3({ register, unidadesFA, accidentadosFA, otrosServiciosFA, watch, setValue, errors }) {
  const unidades = watch("compania.unidades");
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
              <Input label="Unidad" {...register(`compania.unidades.${i}.unidad`)} />
              <Field label="Conductor">
                <UserSelect value={unidades?.[i]?.conductorId ?? null} onChange={(id) => setValue(`compania.unidades.${i}.conductorId`, id)} />
              </Field>
              <Field label="Oficial al mando">
                <UserSelect value={unidades?.[i]?.oficialAlMandoId ?? null} onChange={(id) => setValue(`compania.unidades.${i}.oficialAlMandoId`, id)} />
              </Field>
              <Input label="N° voluntarios" type="number" step="1" {...register(`compania.unidades.${i}.nVoluntarios`, {
                validate: (v) => (v === "" || isPosInt(v)) || "Debe ser entero positivo (> 0)"
              })} error={errors?.compania?.unidades?.[i]?.nVoluntarios?.message} />
            </div>
          </Row>
        ))}
      </Card>

      <Card title="8. Bomberos accidentados" titleIcon={<Users className="text-blue-600" />} action={<BtnAdd onClick={() => accidentadosFA.append({})} />}>
        {accidentadosFA.fields.map((f, i) => (
          <Row key={f.id} title={`Accidentado #${i + 1}`} onRemove={() => accidentadosFA.remove(i)}>
            <div className="grid md:grid-cols-6 gap-3">
              <Input label="Compañía" {...register(`compania.accidentados.${i}.compania`)} />
              <Field label="Bombero accidentado">
                <UserSelect value={watch(`compania.accidentados.${i}.bomberoId`) ?? null} onChange={(id) => setValue(`compania.accidentados.${i}.bomberoId`, id)} />
              </Field>
              <RunInput label="RUN" name={`compania.accidentados.${i}.rut`} register={register} setValue={setValue} error={errors?.compania?.accidentados?.[i]?.rut?.message} />
              <Input label="Lesiones" {...register(`compania.accidentados.${i}.lesiones`)} />
              <Input label="Constancia" {...register(`compania.accidentados.${i}.constancia`)} />
              <Input label="Comisaría" {...register(`compania.accidentados.${i}.comisaria`)} />
            </div>
            <div className="grid md:grid-cols-1 gap-3 mt-3">
              <Textarea label="Acciones" rows={2} {...register(`compania.accidentados.${i}.acciones`)} />
            </div>
          </Row>
        ))}
      </Card>

      <Card title="9. Otros servicios de emergencia en el lugar" titleIcon={<ClipboardList className="text-blue-600" />} action={<BtnAdd onClick={() => otrosServiciosFA.append({})} />}>
        {otrosServiciosFA.fields.map((f, i) => (
          <Row key={f.id} title={`Servicio #${i + 1}`} onRemove={() => otrosServiciosFA.remove(i)}>
            <div className="grid md:grid-cols-5 gap-3">
              <Input label="Servicio (Samu, Carabineros, etc.)" {...register(`compania.otrosServicios.${i}.servicio`)} />
              <Input label="Unidad" {...register(`compania.otrosServicios.${i}.unidad`)} />
              <Input label="A cargo" {...register(`compania.otrosServicios.${i}.aCargo`)} />
              <Input label="N° personal" type="number" step="1" {...register(`compania.otrosServicios.${i}.nPersonal`, {
                validate: (v) => (v === "" || isPosInt(v)) || "Debe ser entero positivo (> 0)"
              })} error={errors?.compania?.otrosServicios?.[i]?.nPersonal?.message} />
              <Input label="Observaciones" {...register(`compania.otrosServicios.${i}.observaciones`)} />
            </div>
          </Row>
        ))}
      </Card>
    </div>
  );
}

/* =========================
   Paso 4: Asistencia (tablas + modal) — sin cambios funcionales
   ========================= */
function Paso4({ watch, setValue }) {
  const enEmerg = watch("asistencia.enEmergenciaUserIds") || [];
  const enCuartel = watch("asistencia.enCuartelUserIds") || [];
  const [allUsers, setAllUsers] = React.useState([]);
  const [openEmerg, setOpenEmerg] = React.useState(false);
  const [openCuartel, setOpenCuartel] = React.useState(false);

  React.useEffect(() => { (async () => { const list = await getUsers(); setAllUsers(Array.isArray(list) ? list : []); })(); }, []);
  const selectedIds = React.useMemo(() => new Set([...(enEmerg || []), ...(enCuartel || [])]), [enEmerg, enCuartel]);

  const rowsEmerg = allUsers.filter((u) => enEmerg.includes(u.id));
  const rowsCuartel = allUsers.filter((u) => enCuartel.includes(u.id));

  const removeEmerg = (id) => setValue("asistencia.enEmergenciaUserIds", (enEmerg || []).filter((x) => x !== id), { shouldDirty: true });
  const removeCuartel = (id) => setValue("asistencia.enCuartelUserIds", (enCuartel || []).filter((x) => x !== id), { shouldDirty: true });

  const addManyEmerg = (ids) => { const cur = new Set(enEmerg || []); ids.forEach((id) => cur.add(id)); setValue("asistencia.enEmergenciaUserIds", Array.from(cur), { shouldDirty: true }); };
  const addManyCuartel = (ids) => { const cur = new Set(enCuartel || []); ids.forEach((id) => cur.add(id)); setValue("asistencia.enCuartelUserIds", Array.from(cur), { shouldDirty: true }); };

  return (
    <div className="space-y-6">
      <Card title="10. Asistencia en emergencia" titleIcon={<Users className="text-blue-600" />} action={<BtnAdd onClick={() => setOpenEmerg(true)} />}>
        <TableAsistencia rows={rowsEmerg} onRemove={removeEmerg} />
      </Card>
      <Card title="Asistencia en cuartel" titleIcon={<Users className="text-blue-600" />} action={<BtnAdd onClick={() => setOpenCuartel(true)} />}>
        <TableAsistencia rows={rowsCuartel} onRemove={removeCuartel} />
      </Card>

      <ModalAddUsuarios open={openEmerg} title="Añadir asistentes a la emergencia" onClose={() => setOpenEmerg(false)} allUsers={allUsers} excludeIds={selectedIds} onConfirm={addManyEmerg} />
      <ModalAddUsuarios open={openCuartel} title="Añadir asistentes en cuartel" onClose={() => setOpenCuartel(false)} allUsers={allUsers} excludeIds={selectedIds} onConfirm={addManyCuartel} />
    </div>
  );
}

/* =========================
   UI Helpers (con errores)
   ========================= */
function Card({ title, titleIcon, action, children }) {
  return (
    <section className="bg-white rounded-2xl ring-1 ring-gray-200 p-4 md:p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">{titleIcon}<h3 className="font-semibold">{title}</h3></div>
        {action ? (
          <button type="button" onClick={action.props.onClick} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-50 text-blue-700 ring-1 ring-blue-200 hover:bg-blue-100">
            <MdPersonAdd /> Añadir
          </button>
        ) : null}
      </div>
      {children}
    </section>
  );
}

const Field = ({ label, children }) => (
  <label className="block">
    <span className="block text-sm mb-1 text-gray-700">{label}</span>
    {children}
  </label>
);

const Input = React.forwardRef(({ label, className = "", error, ...props }, ref) => (
  <label className="block">
    <span className="block text-sm mb-1 text-gray-700">{label}</span>
    <input
      ref={ref}
      {...props}
      className={`w-full border ${error ? "border-red-400" : "border-gray-300"} rounded-md px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 ${error ? "focus:ring-red-200 focus:border-red-400" : "focus:ring-gray-300 focus:border-gray-400"} ${className}`}
    />
    {error && <span className="text-xs text-red-600 mt-1 block">{error}</span>}
  </label>
));

const Textarea = React.forwardRef(({ label, className = "", rows = 3, error, ...props }, ref) => (
  <label className="block">
    <span className="block text-sm mb-1 text-gray-700">{label}</span>
    <textarea
      ref={ref}
      rows={rows}
      {...props}
      className={`w-full border ${error ? "border-red-400" : "border-gray-300"} rounded-md px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 ${error ? "focus:ring-red-200 focus:border-red-400" : "focus:ring-gray-300 focus:border-gray-400"} ${className}`}
    />
    {error && <span className="text-xs text-red-600 mt-1 block">{error}</span>}
  </label>
));

function Label({ children }) {
  return <div className="text-sm font-medium text-gray-700 mb-2">{children}</div>;
}

function Row({ title, children, onRemove }) {
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

function BtnAdd({ onClick }) {
  return <button type="button" onClick={onClick} className="hidden" />;
}

function SelectableCard({ selected, onClick, icon: Icon, label }) {
  return (
    <button type="button" onClick={onClick} className={`flex items-center gap-3 w-full px-3 py-3 rounded-xl ring-1 transition
      ${selected ? "bg-blue-600 text-white ring-blue-600" : "bg-white ring-gray-200 hover:bg-gray-50"}`}>
      <span className={`flex items-center justify-center w-9 h-9 rounded-full ${selected ? "bg-white/20" : "bg-gray-100 text-gray-700"}`}>
        {Icon ? <Icon size={18} className={selected ? "text-white" : "text-gray-700"} /> : null}
      </span>
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}

/* ======= Tabla y Modal de Asistencia ======= */
function TableAsistencia({ rows, onRemove }) {
  return (
    <div className="overflow-auto rounded-xl border">
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr><th className="text-left p-3">Nombre</th><th className="text-left p-3">RUN</th><th className="text-right p-3">Acciones</th></tr>
        </thead>
        <tbody>
          {rows.map((u) => (
            <tr key={u.id} className="border-t">
              <td className="p-3">{u.nombres} {u.apellidos}</td>
              <td className="p-3">{u.run}</td>
              <td className="p-3 text-right">
                <button type="button" onClick={() => onRemove(u.id)} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-red-300 text-red-700 hover:bg-red-50">
                  <MdDelete size={16} /> Quitar
                </button>
              </td>
            </tr>
          ))}
          {rows.length === 0 && (<tr><td colSpan={3} className="p-6 text-center text-gray-500">Sin registros.</td></tr>)}
        </tbody>
      </table>
    </div>
  );
}

function ModalAddUsuarios({ open, title, onClose, allUsers, excludeIds, onConfirm }) {
  const [q, setQ] = React.useState("");
  const [selected, setSelected] = React.useState([]);
  React.useEffect(() => { if (open) { setQ(""); setSelected([]); } }, [open]);
  if (!open) return null;

  const list = (allUsers || []).filter((u) => !excludeIds.has(u.id) && (`${u.nombres} ${u.apellidos} ${u.run}`.toLowerCase().includes(q.toLowerCase())));
  const toggle = (id) => setSelected((arr) => (arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id]));

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><MdClose size={18} /></button>
        </div>

        <div className="p-4">
          <div className="relative mb-3">
            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              placeholder="Buscar por nombre o RUN..."
              className="w-full border border-gray-300 rounded-md pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-400"
              value={q} onChange={(e) => setQ(e.target.value)}
            />
          </div>

          <div className="max-h-72 overflow-auto border rounded-xl">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 sticky top-0"><tr><th className="text-left p-3">Nombre</th><th className="text-left p-3">RUN</th><th className="text-right p-3">Seleccionar</th></tr></thead>
              <tbody>
                {list.map((u) => (
                  <tr key={u.id} className="border-t">
                    <td className="p-3">{u.nombres} {u.apellidos}</td>
                    <td className="p-3">{u.run}</td>
                    <td className="p-3 text-right">
                      <input type="checkbox" className="w-5 h-5 accent-blue-600" checked={selected.includes(u.id)} onChange={() => toggle(u.id)} />
                    </td>
                  </tr>
                ))}
                {list.length === 0 && (<tr><td colSpan={3} className="p-6 text-center text-gray-500">No hay usuarios disponibles.</td></tr>)}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-4 border-t">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50">Cancelar</button>
          <button onClick={() => { onConfirm(selected); onClose(); }} disabled={selected.length === 0} className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50">
            Añadir {selected.length > 0 ? `(${selected.length})` : ""}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ========== Input especial para RUN ========== */
function RunInput({ label = "RUN", name, register, setValue, error }) {
  return (
    <label className="block">
      <span className="block text-sm mb-1 text-gray-700">{label}</span>
      <input
        {...register(name, {
          onChange: (e) => setValue(name, formatRun(e.target.value), { shouldValidate: true, shouldDirty: true }),
          validate: (v) => (!v || isValidRunModulo11(v)) || "RUN inválido (módulo 11)",
        })}
        placeholder="12.345.678-9"
        className={`w-full border ${error ? "border-red-400" : "border-gray-300"} rounded-md px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 ${error ? "focus:ring-red-200 focus:border-red-400" : "focus:ring-gray-300 focus:border-gray-400"}`}
      />
      {error && <span className="text-xs text-red-600 mt-1 block">{error}</span>}
    </label>
  );
}
