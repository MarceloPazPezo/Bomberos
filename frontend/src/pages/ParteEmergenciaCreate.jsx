// src/pages/ParteEmergenciaCreate.jsx
import React from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { crearParteEmergencia, actualizarPaso2ParteEmergencia } from "@services/parteEmergencia.service";
import { useNavigate } from "react-router-dom";

// Íconos
import { ChevronLeft, ChevronRight, ClipboardList } from "lucide-react";
import { MdSave, MdSend } from "react-icons/md";

// Helpers
import { toIntOrNull, emptyToNull } from "@helpers/cast.helpers";

// Componentes
import PasoIndicator from "@components/parte/PasoIndicator";
import Paso1 from "@components/parte/steps/Paso1";
import Paso2 from "@components/parte/steps/Paso2";
import Paso3 from "@components/parte/steps/Paso3";
import Paso4 from "@components/parte/steps/Paso4";

const defaultValues = {
  general: {
    fecha: "",
    compañia: "",
    tipo_servicio: "",
    hora_despacho: "",
    hora_6_0: "",
    hora_6_3: "",
    hora_6_9: "",
    hora_6_10: "",
    km_salida: "",
    km_llegada: "",
    comuna: "",
    direccion: "",
    villa_poblacion: "",
    propietario: { run: "", nombres: "", apellidos: "", telefono: "" },
    tipo_incendio: "",
    fase_alcanzada: "",
    descripcion_preliminar: "",
    tipo_construccion: "",
    daños_vivienda: "",
    m_2_construccion: "",
    n_pisos: "",
    daños_enseres: "",
    m_2_afectado: "",
    redactor_id: null,
  },
  afectados: {
    otrosInmuebles: [],
    vehiculos: [],
  },
  compañia: {
    unidades: [],
    accidentados: [],
    otrosServicios: [],
  },
  asistencia: {
    enEmergenciaUserIds: [],
    enCuartelUserIds: [],
  },
};

export default function ParteEmergenciaCreate() {
  const nav = useNavigate();
  const [step, setStep] = React.useState(1);

  // ids persistentes devueltos por el backend al guardar Paso 1
  const [parteId, setParteId] = React.useState(null);
  const [afectadoId, setAfectadoId] = React.useState(null);
  const [inmuebleAfectadoId, setInmuebleAfectadoId] = React.useState(null);
  const [savingPaso1, setSavingPaso1] = React.useState(false);
  const [savingPaso2, setSavingPaso2] = React.useState(false);

  const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm({
    defaultValues,
    mode: "onChange",
  });

  // field arrays
  const otrosInmueblesFA = useFieldArray({ control, name: "afectados.otrosInmuebles" });
  const vehiculosFA = useFieldArray({ control, name: "afectados.vehiculos" });
  const unidadesFA = useFieldArray({ control, name: "compañia.unidades" });
  const accidentadosFA = useFieldArray({ control, name: "compañia.accidentados" });
  const otrosServiciosFA = useFieldArray({ control, name: "compañia.otrosServicios" });

  /* ----------------- Guardar Paso 1 ----------------- */
  const savePaso1 = async () => {
    const g = watch("general");

    const payload = {
      parteEmergencia: {
        id: parteId ?? null,
        fecha: g.fecha || null,
        compañia: emptyToNull(g.compañia),
        tipo_servicio: emptyToNull(g.tipo_servicio),
        hora_despacho: emptyToNull(g.hora_despacho),
        hora_6_0: emptyToNull(g.hora_6_0),
        hora_6_3: emptyToNull(g.hora_6_3),
        hora_6_9: emptyToNull(g.hora_6_9),
        hora_6_10: emptyToNull(g.hora_6_10),
        km_salida: g.km_salida === "" ? null : toIntOrNull(g.km_salida),
        km_llegada: g.km_llegada === "" ? null : toIntOrNull(g.km_llegada),
        comuna: emptyToNull(g.comuna),
        direccion: emptyToNull(g.direccion),
        villa_poblacion: emptyToNull(g.villa_poblacion),
        tipo_incendio: emptyToNull(g.tipo_incendio),
        fase_alcanzada: emptyToNull(g.fase_alcanzada),
        descripcion_preliminar: emptyToNull(g.descripcion_preliminar),
        redactor_id: g.redactorId ?? null,
      },
      afectado: {
        id: afectadoId ?? null,
        parte_id: parteId ?? null,
        run: emptyToNull(g.propietario?.run),
        nombres: emptyToNull(g.propietario?.nombres),
        apellidos: emptyToNull(g.propietario?.apellidos),
        telefono: emptyToNull(g.propietario?.telefono),
      },
      inmuebleAfectado: {
        id: inmuebleAfectadoId ?? null,
        parte_id: parteId ?? null,
        comuna: emptyToNull(g.comuna),
        direccion: emptyToNull(g.direccion),
        villa_poblacion: emptyToNull(g.villa_poblacion),
        tipo_construccion: emptyToNull(g.tipo_construccion),
        daños_vivienda: emptyToNull(g.daños_vivienda),
        m_2_construccion: g.m_2_construccion === "" ? null : toIntOrNull(g.m_2_construccion),
        n_pisos: g.n_pisos === "" ? null : toIntOrNull(g.n_pisos),
        daños_enseres: emptyToNull(g.daños_enseres),
        m_2_afectado: g.m_2_afectado === "" ? null : toIntOrNull(g.m_2_afectado),
      },
    };

    setSavingPaso1(true);
    try {
      const res = await crearParteEmergencia(payload);
      const dataIds = res?.data ?? res;
      if (dataIds) {
        if (dataIds.parteEmergenciaId) setParteId(dataIds.parteEmergenciaId);
        if (dataIds.afectadoId) setAfectadoId(dataIds.afectadoId);
        if (dataIds.inmuebleAfectadoId) setInmuebleAfectadoId(dataIds.inmuebleAfectadoId);
      }
      console.log("Paso 1 guardado OK:", dataIds);
    } catch (err) {
      console.error("Error al guardar Paso 1:", err);
      alert("No se pudo guardar el Paso 1. Revisa los datos obligatorios o vuelve a intentar.", err);
      throw err;
    } finally {
      setSavingPaso1(false);
    }
  };

  /* -------- Helper: Inyecta IDs devueltos por el backend en el form -------- */
  const applyPaso2IdsToForm = (data) => {
    if (!data) return;

    // parte_id (por si viene)
    if (data.parte_id && !parteId) setParteId(data.parte_id);

    // propietario e inmueble principal
    if (data.propietario_Id && !afectadoId) setAfectadoId(data.propietario_Id);
    if (data.inmuebleAfectado_Id && !inmuebleAfectadoId) setInmuebleAfectadoId(data.inmuebleAfectado_Id);

    // Otros inmuebles: array de IDs, mismo orden del front
    const otrosIds = Array.isArray(data.otrosInmueblesAfectados_Ids) ? data.otrosInmueblesAfectados_Ids : [];
    otrosInmueblesFA.fields.forEach((f, i) => {
      const id = otrosIds[i] ?? null;
      if (id) {
        setValue(`afectados.otrosInmuebles.${i}.id`, id, { shouldDirty: false, shouldTouch: false });
      }
    });

    // Vehículos y ocupantes: resp.vehiculos = [{vehiculoId, ocupantes: [ids...]}]
    const vehResp = Array.isArray(data.vehiculos) ? data.vehiculos : [];
    vehiculosFA.fields.forEach((f, i) => {
      const row = vehResp[i];
      if (!row) return;

      // id del vehículo
      if (row.vehiculoId) {
        setValue(`afectados.vehiculos.${i}.id`, row.vehiculoId, { shouldDirty: false, shouldTouch: false });
      }

      // ids de ocupantes en el mismo orden
      const ocIds = Array.isArray(row.ocupantes) ? row.ocupantes : [];
      const ocPath = `afectados.vehiculos.${i}.ocupantes`;
      const ocFields = watch(ocPath) || [];
      ocFields.forEach((o, j) => {
        const oid = ocIds[j] ?? null;
        if (oid) {
          setValue(`${ocPath}.${j}.id`, oid, { shouldDirty: false, shouldTouch: false });
        }
      });
    });
  };

  /* ----------------- Guardar Paso 2 ----------------- */
  const savePaso2 = async () => {
    const g = watch("general");
    const a = watch("afectados");

    // --- propietario ---
    const propietarioPayload = {
      id: afectadoId ?? null,
      parte_id: parteId ?? null,
      run: emptyToNull(g?.propietario?.run),
      nombres: emptyToNull(g?.propietario?.nombres),
      apellidos: emptyToNull(g?.propietario?.apellidos),
      telefono: emptyToNull(g?.propietario?.telefono),
      direccion: emptyToNull(g?.propietario?.direccion),
      edad: g?.propietario?.edad === "" || g?.propietario?.edad == null ? null : toIntOrNull(g?.propietario?.edad),
      estado_civil: emptyToNull(g?.propietario?.estadoCivil),
    };

    // --- caracteristicas / parte_emergencia (update) ---
    const caracteristicasPayload = {
      id: parteId,
      compañia: emptyToNull(g.compañia),
      tipo_servicio: emptyToNull(g.tipo_servicio),
      hora_despacho: emptyToNull(g.hora_despacho),
      hora_6_0: emptyToNull(g.hora_6_0),
      hora_6_3: emptyToNull(g.hora_6_3),
      hora_6_9: emptyToNull(g.hora_6_9),
      hora_6_10: emptyToNull(g.hora_6_10),
      km_salida: g.km_salida === "" ? null : toIntOrNull(g.km_salida),
      km_llegada: g.km_llegada === "" ? null : toIntOrNull(g.km_llegada),
      comuna: emptyToNull(g.comuna),
      direccion: emptyToNull(g.direccion),
      villa_poblacion: emptyToNull(g.villa_poblacion),
      tipo_incendio: emptyToNull(g.tipo_incendio),
      fase_alcanzada: emptyToNull(g.fase_alcanzada),
      descripcion_preliminar: emptyToNull(g.descripcion_preliminar),
      redactor_id: g.redactorId ?? null,
    };

    // --- inmueble principal ---
    const inmuebleAfectadoPayload = {
      id: inmuebleAfectadoId ?? null,
      parte_id: parteId ?? null,
      propietario_id: afectadoId ?? null,
      tipo_construccion: emptyToNull(g.tipo_construccion),
      daños_vivienda: emptyToNull(g.daños_vivienda),
      daños_enseres: emptyToNull(g.daños_enseres),
      m_2_construccion: g.m_2_construccion === "" ? null : toIntOrNull(g.m_2_construccion),
      n_pisos: g.n_pisos === "" ? null : toIntOrNull(g.n_pisos),
      m_2_afectado: g.m_2_afectado === "" ? null : toIntOrNull(g.m_2_afectado),
    };

    // --- otros inmuebles (array) ---
    const otrosInmueblesPayload = (a?.otrosInmuebles ?? []).map((it) => ({
      id: it?.id ?? null,
      parte_id: parteId,
      propietario_id: afectadoId ?? null,
      direccion: emptyToNull(it?.direccion),
      nombres: emptyToNull(it?.nombres),
      apellidos: emptyToNull(it?.apellidos),
      edad: it?.edad === "" || it?.edad == null ? null : toIntOrNull(it?.edad),
      estado_civil: emptyToNull(it?.estado_civil),
      run: emptyToNull(it?.run),
    }));

    // --- vehiculos (array con ocupantes) ---
    const vehiculosPayload = (a?.vehiculos ?? []).map((v) => {
      const ocupantes = (v?.ocupantes ?? []).map((o) => ({
        id: o?.id ?? null,
        vehiculo_id: v?.id ?? null, // si el vehículo es nuevo, el backend lo setea
        nombres: emptyToNull(o?.nombres),
        apellidos: emptyToNull(o?.apellidos),
        edad: o?.edad === "" || o?.edad == null ? null : toIntOrNull(o?.edad),
        run: emptyToNull(o?.run),
        ocupantes: emptyToNull(o?.ocupantes), // notas
        vinculo: emptyToNull(o?.vinculo),
        gravedad: emptyToNull(o?.gravedad),
      }));

      return {
        id: v?.id ?? null,
        parte_id: parteId,
        propietario_id: v?.propietario_id ?? (afectadoId ?? null),
        tipo_vehiculo: emptyToNull(v?.tipo_vehiculo),
        marca: emptyToNull(v?.marca),
        modelo: emptyToNull(v?.modelo),
        color: emptyToNull(v?.color),
        patente: emptyToNull(v?.patente),
        conductor_nombres: emptyToNull(v?.conductor_nombres),
        conductor_apellidos: emptyToNull(v?.conductor_apellidos),
        conductor_run: emptyToNull(v?.conductor_run),
        ocupantes,
      };
    });

    const payloadPaso2 = {
      propietario: propietarioPayload,
      caracteristicas: caracteristicasPayload,
      inmueble_afectado: inmuebleAfectadoPayload,
      otros_inmuebles: otrosInmueblesPayload,
      vehiculos: vehiculosPayload,
    };

    setSavingPaso2(true);
    try {
      const resp = await actualizarPaso2ParteEmergencia(payloadPaso2);
      const data = resp?.data ?? resp;

      // Inyectamos IDs en el formulario para siguientes guardados
      applyPaso2IdsToForm(data);

      console.log("Paso 2 guardado OK:", data);
    } catch (err) {
      console.error("Error de red al guardar Paso 2:", err);
      // Por requerimiento, NO bloqueamos el avance.
    } finally {
      setSavingPaso2(false);
    }
  };

  /* ----------------- Submit final (guardado completo) ----------------- */
  const onSubmit = async (payload) => {
    payload.general.km_salida = toIntOrNull(payload.general.km_salida);
    payload.general.km_llegada = toIntOrNull(payload.general.km_llegada);
    payload.general.m_2_construccion = toIntOrNull(payload.general.m_2_construccion);
    payload.general.m_2_afectado = toIntOrNull(payload.general.m_2_afectado);
    payload.general.n_pisos = toIntOrNull(payload.general.n_pisos);
    payload.compañia.unidades = payload.compañia.unidades.map((u) => ({ ...u, nVoluntarios: toIntOrNull(u.nVoluntarios) }));
    payload.compañia.otrosServicios = payload.compañia.otrosServicios.map((o) => ({ ...o, nPersonal: toIntOrNull(o.nPersonal) }));

    nav("/partes-emergencia");
  };

  /* ----------------- Navegación entre pasos ----------------- */
  const handleNext = async () => {
    if (step === 1) {
      const g = watch("general");
      if (!g.fecha) { alert("Debe ingresar la Fecha."); return; }
      if (!g.redactorId) { alert("Debe seleccionar un Redactor."); return; }
      try { await savePaso1(); } catch { return; }
    }

    if (step === 2) {
      await savePaso2(); // guardado silencioso + inyección de IDs
    }

    setStep((s) => Math.min(4, s + 1));
  };

  return (
    <div className="p-4 md:p-6">
      {/* Encabezado */}
      <div className="bg-white rounded-3xl shadow-sm p-6 mb-6 sticky top-0 z-40">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <ClipboardList className="text-blue-600" />
            <h1 className="text-xl font-semibold">Nuevo Parte de Emergencia</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-800 hover:bg-gray-50"
              title="Guardar borrador"
              onClick={async () => {
                if (step === 1) { await savePaso1(); }
                if (step === 2) { await savePaso2(); }
              }}
              disabled={(savingPaso1 && step === 1) || (savingPaso2 && step === 2)}
            >
              <MdSave size={18} /> {(savingPaso1 && step === 1) || (savingPaso2 && step === 2) ? "Guardando..." : "Guardar"}
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
              title="Enviar parte"
              onClick={async () => {
                if (step === 1) { try { await savePaso1(); } catch { return; } }
                if (step === 2) { await savePaso2(); }
                nav("/partes-emergencia");
              }}
              disabled={(savingPaso1 && step === 1) || (savingPaso2 && step === 2)}
            >
              <MdSend size={18} /> Enviar
            </button>
          </div>
        </div>

        <PasoIndicator step={step} setStep={setStep} />
      </div>

      {/* Formulario */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6
        [&_input]:w-full [&_input]:border [&_input]:border-gray-300 [&_input]:rounded-md [&_input]:px-3 [&_input]:py-2 [&_input]:text-sm
        [&_input]:placeholder:text-gray-400 [&_input]:focus:outline-none [&_input]:focus:ring-2 [&_input]:focus:ring-gray-300 [&_input]:focus:border-gray-400
        [&_textarea]:w-full [&_textarea]:border [&_textarea]:border-gray-300 [&_textarea]:rounded-md [&_textarea]:px-3 [&_textarea]:py-2 [&_textarea]:text-sm
        [&_textarea]:placeholder:text-gray-400 [&_textarea]:focus:outline-none [&_textarea]:focus:ring-2 [&_textarea]:focus:ring-gray-300 [&_textarea]:focus:border-gray-400"
      >
        {step === 1 && <Paso1 {...{ register, watch, setValue, errors }} />}
        {step === 2 && <Paso2 {...{ register, otrosInmueblesFA, vehiculosFA, control, setValue, errors, watch }} />}
        {step === 3 && <Paso3 {...{ register, unidadesFA, accidentadosFA, otrosServiciosFA, watch, setValue, errors }} />}
        {step === 4 && <Paso4 {...{ watch, setValue }} />}

        {/* Navegación inferior */}
        <div className="flex justify-between pt-4">
          <button type="button" onClick={() => setStep(Math.max(1, step - 1))} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50">
            <ChevronLeft size={18} /> Atrás
          </button>
          {step < 4 ? (
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
              disabled={(savingPaso1 && step === 1) || (savingPaso2 && step === 2)}
            >
              {(step === 1 && savingPaso1) || (step === 2 && savingPaso2) ? "Guardando..." : "Siguiente"} <ChevronRight size={18} />
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
