import React from "react";
import { useDisponibilidad } from "@context/DisponibilidadContext";
import { useGlobalFireAlert } from "@components/FireAlertProvider";
import { disponibilidadCreatedToast, disponibilidadClosedToast } from "@helpers/toastHelper.jsx";
import { FaUserCheck, FaUsers, FaClock, FaSync, FaBolt } from "react-icons/fa";
import {
  MdAccessTime,
  MdEvent,
  MdDriveEta,
  MdEmergency,
  MdLocalFireDepartment,
} from "react-icons/md";
import LoadingPage from "@components/LoadingPage";
import DatePicker from "@components/DatePicker";
import TimePicker from "@components/TimePicker";
import { createDisponibilidad, cerrarDisponibilidad } from "@services/disponibilidad.service";
import dateHelper from "@helpers/dateHelper";
import { useGlobalAvailability } from "@context/GlobalAvailabilityContext";

/**
 * Componente para marcar disponibilidad
 * Incluye formulario, acceso rápido y vista del personal disponible
 */
const DisponibilidadMarcarTab = () => {
  const { fireError, fireWarning, fireConfirm } = useGlobalFireAlert();
  const { updateAvailability, clearAvailability } = useGlobalAvailability();
  const {
    // Datos
    disponibilidades,
    stats,
    loading,
    error,

    // Estados del formulario
    updatingMyStatus,
    setUpdatingMyStatus,
    miDisponibilidad,
    setMiDisponibilidad,
    fechaInicio,
    setFechaInicio,
    fechaTermino,
    setFechaTermino,
    usarFechaTermino,
    setUsarFechaTermino,
    autoAjustado,
    setAutoAjustado,

    // Funciones
    triggerRefresh,
    initializeFechas,
    getBomberoInfo,

    // Contextos externos
    bombero,
    hasPermiso,
  } = useDisponibilidad();

  // Función para mostrar confirmación de acceso rápido con FireAlert
  const handleAccesoRapido = async (preset) => {
    if (!bombero?.id) {
      fireError("Error de Autenticación", "Bombero no válido");
      return;
    }

    // Si ya hay disponibilidad activa, mostrar error
    if (miDisponibilidad) {
      fireWarning(
        "Disponibilidad Activa",
        "Ya tienes una disponibilidad activa. Ciérrala antes de crear una nueva."
      );
      return;
    }

    // Obtener información del preset para la confirmación
    const presetInfo = getPresetInfo(preset);

    try {
      // Usar FireAlert para confirmación
      const confirmed = await fireConfirm(
        `${presetInfo.icono} ${presetInfo.titulo}`,
        `${presetInfo.descripcion}\n\nTiempo: ${presetInfo.tiempo}\n\nEsta acción creará inmediatamente tu registro de disponibilidad.`,
        {
          confirmText: "Crear Disponibilidad",
          cancelText: "Cancelar",
        }
      );

      // Si se confirmó, proceder a crear la disponibilidad
      if (confirmed) {
        confirmarAccesoRapido(preset);
      }
    } catch (error) {
      console.error("Error en fireConfirm:", error);
      fireError("Error", "Hubo un problema al mostrar la confirmación");
    }
  };

  // Función para confirmar y crear disponibilidad
  const confirmarAccesoRapido = async (preset) => {
    if (!preset) return;

    try {
      setUpdatingMyStatus(true);

      const now = dateHelper.now();

      // Configurar fechas según el preset
      let fechaInicioStr = dateHelper.toInputFormat(now);
      let fechaTerminoStr = "";
      let usarTermino = false;
      let descripcionPreset = "";

      switch (preset) {
        case "ahora":
          descripcionPreset = "disponibilidad inmediata";
          break;
        case "15m":
          fechaTerminoStr = dateHelper.toInputFormat(now.plus({ minutes: 15 }));
          usarTermino = true;
          descripcionPreset = "disponibilidad por 15 minutos";
          break;
        case "2h":
          fechaTerminoStr = dateHelper.toInputFormat(now.plus({ hours: 2 }));
          usarTermino = true;
          descripcionPreset = "disponibilidad por 2 horas";
          break;
        case "4h":
          fechaTerminoStr = dateHelper.toInputFormat(now.plus({ hours: 4 }));
          usarTermino = true;
          descripcionPreset = "disponibilidad por 4 horas";
          break;
        case "8h":
          fechaTerminoStr = dateHelper.toInputFormat(now.plus({ hours: 8 }));
          usarTermino = true;
          descripcionPreset = "disponibilidad por 8 horas";
          break;
        case "22h":
          const hasta22 = now.set({ hour: 22, minute: 0, second: 0, millisecond: 0 });
          if (hasta22 <= now) {
            hasta22.plus({ days: 1 });
          }
          fechaTerminoStr = dateHelper.toInputFormat(hasta22);
          usarTermino = true;
          descripcionPreset = "disponibilidad hasta las 22:00";
          break;
        case "noche":
          let hasta6am = now
            .plus({ days: 1 })
            .set({ hour: 6, minute: 0, second: 0, millisecond: 0 });
          fechaTerminoStr = dateHelper.toInputFormat(hasta6am);
          usarTermino = true;
          descripcionPreset = "disponibilidad hasta las 06:00";
          break;
        default:
          descripcionPreset = "disponibilidad";
      }

      const disponibilidadData = {
        idBombero: bombero.id,
        fechaInicio: fechaInicioStr,
        ...(usarTermino && fechaTerminoStr && { fechaTermino: fechaTerminoStr }),
      };

      const newDisponibilidad = await createDisponibilidad(disponibilidadData);
      setMiDisponibilidad(newDisponibilidad);
      updateAvailability(newDisponibilidad);

      disponibilidadCreatedToast(
        `¡${
          descripcionPreset.charAt(0).toUpperCase() + descripcionPreset.slice(1)
        } creada correctamente!`
      );

      // Actualizar datos
      triggerRefresh();
    } catch (err) {
      console.error("Error al crear disponibilidad:", err);
      fireError("Error en la Operación", "Error al crear la disponibilidad. Inténtalo nuevamente.");
    } finally {
      setUpdatingMyStatus(false);
    }
  };

  // Función para obtener información del preset para el modal
  const getPresetInfo = (preset) => {
    const now = dateHelper.now();
    switch (preset) {
      case "ahora":
        return {
          titulo: "Disponible Ahora",
          tiempo: "Indefinida",
          descripcion: "Te marcarás como disponible inmediatamente sin hora de término específica.",
          icono: <MdEmergency className="w-6 h-6" />,
        };
      case "15m":
        return {
          titulo: "Disponible 15 Minutos",
          tiempo: `Hasta ${now.plus({ minutes: 15 }).toFormat("HH:mm")}`,
          descripcion: "Te marcarás como disponible por los próximos 15 minutos.",
          icono: <FaBolt className="w-6 h-6" />,
        };
      case "2h":
        return {
          titulo: "Disponible 2 Horas",
          tiempo: `Hasta ${now.plus({ hours: 2 }).toFormat("HH:mm")}`,
          descripcion: "Te marcarás como disponible por las próximas 2 horas.",
          icono: <MdAccessTime className="w-6 h-6" />,
        };
      case "4h":
        return {
          titulo: "Disponible 4 Horas",
          tiempo: `Hasta ${now.plus({ hours: 4 }).toFormat("HH:mm")}`,
          descripcion: "Te marcarás como disponible por las próximas 4 horas.",
          icono: "🕐",
        };
      case "8h":
        return {
          titulo: "Disponible 8 Horas",
          tiempo: `Hasta ${now.plus({ hours: 8 }).toFormat("HH:mm")}`,
          descripcion: "Te marcarás como disponible por las próximas 8 horas.",
          icono: "🕘",
        };
      case "22h":
        const hasta22 = now.set({ hour: 22, minute: 0 });
        return {
          titulo: "Hasta las 22:00",
          tiempo: `Hasta ${hasta22.toFormat("HH:mm")}`,
          descripcion: "Te marcarás como disponible hasta las 22:00 horas de hoy.",
          icono: "🌙",
        };
      case "noche":
        return {
          titulo: "Turno Nocturno",
          tiempo: "Hasta las 06:00",
          descripcion: "Te marcarás como disponible para el turno nocturno hasta las 6:00 AM.",
          icono: "🌃",
        };
      default:
        return {
          titulo: "Disponible",
          tiempo: "",
          descripcion: "Te marcarás como disponible.",
          icono: <MdLocalFireDepartment className="w-6 h-6" />,
        };
    }
  };

  const handleCreateDisponibilidad = async () => {
    if (!bombero?.id) {
      fireError("Error de Autenticación", "Bombero no válido");
      return;
    }

    // Validaciones adicionales
    if (!fechaInicio) {
      fireError("Fecha Requerida", "Debes seleccionar una fecha y hora de inicio");
      return;
    }

    const ahora = dateHelper.now();
    const inicioDateTime = dateHelper.fromInputFormat(fechaInicio);

    // Solo validar si es en el pasado (con un margen de 1 minuto para evitar problemas de sincronización)
    if (inicioDateTime < ahora.minus({ minutes: 1 })) {
      fireError("Fecha Inválida", "La fecha y hora de inicio no puede ser en el pasado");
      return;
    }

    if (usarFechaTermino && fechaTermino) {
      const terminoDateTime = dateHelper.fromInputFormat(fechaTermino);
      if (terminoDateTime <= inicioDateTime) {
        fireError(
          "Fecha de Término Inválida",
          "La fecha de término debe ser posterior a la fecha de inicio"
        );
        return;
      }
    }

    try {
      setUpdatingMyStatus(true);

      const disponibilidadData = {
        idBombero: bombero.id,
        fechaInicio,
        ...(usarFechaTermino && fechaTermino && { fechaTermino }),
      };

      const newDisponibilidad = await createDisponibilidad(disponibilidadData);
      setMiDisponibilidad(newDisponibilidad);
      updateAvailability(newDisponibilidad);

      // Reiniciar formulario
      initializeFechas();

      disponibilidadCreatedToast("¡Disponibilidad creada correctamente!");

      // Actualizar datos
      triggerRefresh();
    } catch (err) {
      console.error("Error al crear disponibilidad:", err);
      fireError("Error en la Operación", "Error al crear la disponibilidad. Inténtalo nuevamente.");
    } finally {
      setUpdatingMyStatus(false);
    }
  };

  const handleCerrarDisponibilidad = async () => {
    if (!miDisponibilidad || !bombero?.id) return;

    try {
      setUpdatingMyStatus(true);

      const disponibilidadData = {
        idBombero: bombero.id,
      };

      await cerrarDisponibilidad(disponibilidadData);
      setMiDisponibilidad(null);
      clearAvailability();

      disponibilidadClosedToast("Disponibilidad cerrada correctamente");

      // Actualizar datos
      triggerRefresh();
    } catch (err) {
      console.error("Error al cerrar disponibilidad:", err);
      fireError(
        "Error en la Operación",
        "Error al cerrar la disponibilidad. Inténtalo nuevamente."
      );
    } finally {
      setUpdatingMyStatus(false);
    }
  };

  const formatFecha = (fecha) => {
    try {
      return dateHelper.format(dateHelper.toSantiago(fecha), "dd/MM/yyyy HH:mm");
    } catch (error) {
      return "Fecha inválida";
    }
  };

  const calcularDuracion = (fechaInicio, fechaTermino) => {
    try {
      const inicio = dateHelper.toSantiago(fechaInicio);
      let fin;

      if (fechaTermino) {
        fin = dateHelper.toSantiago(fechaTermino);
      } else {
        fin = dateHelper.now();
      }

      const diff = fin.diff(inicio, ["hours", "minutes"]);

      if (diff.hours < 0 || diff.minutes < 0) {
        return "0m";
      }

      if (diff.hours >= 1) {
        return `${Math.floor(diff.hours)}h ${Math.floor(diff.minutes)}m`;
      } else {
        return `${Math.floor(diff.minutes)}m`;
      }
    } catch (error) {
      return "Duración inválida";
    }
  };

  const estaDisponible = (disponibilidad) => {
    return !disponibilidad.fechaTermino || new Date(disponibilidad.fechaTermino) > new Date();
  };

  // Logs de debugging removidos para producción

  if (loading) {
    return <LoadingPage />;
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Formulario de Disponibilidad - 2 partes */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Mi Disponibilidad</h2>
            {miDisponibilidad && (
              <div className="flex items-center gap-2 text-sm">
                <FaUserCheck className="text-green-600" />
                <span className="font-medium text-green-600">ACTIVA</span>
              </div>
            )}
          </div>

          {/* Si hay disponibilidad activa, mostrar información */}
          {miDisponibilidad ? (
            <div className="text-center">
              <div className="border-2 rounded-lg p-4 mb-4 bg-green-50 border-green-200">
                <p className="text-sm text-gray-600 mb-2">
                  Disponible desde:{" "}
                  <span className="font-medium">{formatFecha(miDisponibilidad.fechaInicio)}</span>
                </p>
                {miDisponibilidad.fechaTermino && (
                  <p className="text-sm text-gray-600">
                    Hasta:{" "}
                    <span className="font-medium">
                      {formatFecha(miDisponibilidad.fechaTermino)}
                    </span>
                  </p>
                )}
              </div>

              <button
                onClick={handleCerrarDisponibilidad}
                disabled={updatingMyStatus}
                className="w-full py-3 px-4 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updatingMyStatus ? "Cerrando..." : "Cerrar Disponibilidad"}
              </button>
            </div>
          ) : (
            // Formulario para crear disponibilidad
            <div className="space-y-4">
              {/* Botones de acceso rápido */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-lg flex items-center justify-center">
                    <FaClock className="h-3 w-3 text-white" />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-800">Acceso Rápido</h3>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleAccesoRapido("ahora")}
                    disabled={updatingMyStatus || miDisponibilidad}
                    className="group flex flex-col items-center gap-2 px-3 py-2.5 text-sm font-medium text-blue-700 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="w-6 h-6 bg-blue-100 group-hover:bg-blue-200 rounded-lg flex items-center justify-center transition-colors">
                      <FaClock className="h-3 w-3 text-blue-600" />
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-xs">Ahora</div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleAccesoRapido("2h")}
                    disabled={updatingMyStatus || miDisponibilidad}
                    className="group flex flex-col items-center gap-2 px-3 py-2.5 text-sm font-medium text-green-700 bg-white border border-green-200 rounded-lg hover:bg-green-50 hover:border-green-300 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="w-6 h-6 bg-green-100 group-hover:bg-green-200 rounded-lg flex items-center justify-center transition-colors">
                      <MdAccessTime className="h-3 w-3 text-green-600" />
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-xs">2 Horas</div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleAccesoRapido("4h")}
                    disabled={updatingMyStatus || miDisponibilidad}
                    className="group flex flex-col items-center gap-2 px-3 py-2.5 text-sm font-medium text-orange-700 bg-white border border-orange-200 rounded-lg hover:bg-orange-50 hover:border-orange-300 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="w-6 h-6 bg-orange-100 group-hover:bg-orange-200 rounded-lg flex items-center justify-center transition-colors">
                      <MdAccessTime className="h-3 w-3 text-orange-600" />
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-xs">4 Horas</div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleAccesoRapido("8h")}
                    disabled={updatingMyStatus || miDisponibilidad}
                    className="group flex flex-col items-center gap-2 px-3 py-2.5 text-sm font-medium text-purple-700 bg-white border border-purple-200 rounded-lg hover:bg-purple-50 hover:border-purple-300 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="w-6 h-6 bg-purple-100 group-hover:bg-purple-200 rounded-lg flex items-center justify-center transition-colors">
                      <MdAccessTime className="h-3 w-3 text-purple-600" />
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-xs">8 Horas</div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleAccesoRapido("22h")}
                    disabled={updatingMyStatus || miDisponibilidad}
                    className="group flex flex-col items-center gap-2 px-3 py-2.5 text-sm font-medium text-indigo-700 bg-white border border-indigo-200 rounded-lg hover:bg-indigo-50 hover:border-indigo-300 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="w-6 h-6 bg-indigo-100 group-hover:bg-indigo-200 rounded-lg flex items-center justify-center transition-colors">
                      <MdEvent className="h-3 w-3 text-indigo-600" />
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-xs">Hasta 22:00</div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleAccesoRapido("noche")}
                    disabled={updatingMyStatus || miDisponibilidad}
                    className="group flex flex-col items-center gap-2 px-3 py-2.5 text-sm font-medium text-red-700 bg-white border border-red-200 rounded-lg hover:bg-red-50 hover:border-red-300 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="w-6 h-6 bg-red-100 group-hover:bg-red-200 rounded-lg flex items-center justify-center transition-colors">
                      <MdAccessTime className="h-3 w-3 text-red-600" />
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-xs">Hasta 06:00</div>
                    </div>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de Inicio
                  </label>
                  <DatePicker
                    value={
                      fechaInicio
                        ? dateHelper.fromInputFormat(fechaInicio).toFormat("yyyy-MM-dd")
                        : ""
                    }
                    onChange={(e) => {
                      const fechaSeleccionada = e.target.value;
                      if (fechaSeleccionada) {
                        // Mantener la hora actual si existe, o usar 09:00 por defecto
                        const horaActual = fechaInicio
                          ? dateHelper.fromInputFormat(fechaInicio).toFormat("HH:mm")
                          : "09:00";
                        const nuevaFecha = `${fechaSeleccionada}T${horaActual}:00`;
                        setFechaInicio(nuevaFecha);

                        // Auto-ajustar fecha de término si está establecida y es anterior a la nueva fecha de inicio
                        if (usarFechaTermino && fechaTermino) {
                          const fechaTerminoActual = dateHelper.fromInputFormat(fechaTermino);
                          const nuevaFechaObj = dateHelper.fromInputFormat(nuevaFecha);
                          if (fechaTerminoActual <= nuevaFechaObj) {
                            const nuevaFechaTermino = nuevaFechaObj.plus({ hours: 2 });
                            setFechaTermino(dateHelper.toInputFormat(nuevaFechaTermino));
                            setAutoAjustado(true);
                            setTimeout(() => setAutoAjustado(false), 3000);
                          }
                        }
                      } else {
                        setFechaInicio("");
                      }
                    }}
                    placeholder="Seleccionar fecha"
                    minDate={dateHelper.now().toFormat("yyyy-MM-dd")}
                    maxDate={dateHelper.now().plus({ years: 1 }).toFormat("yyyy-MM-dd")}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hora de Inicio
                  </label>
                  <TimePicker
                    value={
                      fechaInicio
                        ? dateHelper.fromInputFormat(fechaInicio).toFormat("HH:mm")
                        : "09:00"
                    }
                    onChange={(e) => {
                      const horaSeleccionada = e.target.value;
                      if (horaSeleccionada && fechaInicio) {
                        const fechaActual = dateHelper
                          .fromInputFormat(fechaInicio)
                          .toFormat("yyyy-MM-dd");
                        const nuevaFecha = `${fechaActual}T${horaSeleccionada}:00`;
                        setFechaInicio(nuevaFecha);

                        // Auto-ajustar fecha de término si está establecida y es anterior a la nueva fecha de inicio
                        if (usarFechaTermino && fechaTermino) {
                          const fechaTerminoActual = dateHelper.fromInputFormat(fechaTermino);
                          const nuevaFechaObj = dateHelper.fromInputFormat(nuevaFecha);
                          if (fechaTerminoActual <= nuevaFechaObj) {
                            const nuevaFechaTermino = nuevaFechaObj.plus({ hours: 2 });
                            setFechaTermino(dateHelper.toInputFormat(nuevaFechaTermino));
                            setAutoAjustado(true);
                            setTimeout(() => setAutoAjustado(false), 3000);
                          }
                        }
                      } else if (horaSeleccionada) {
                        // Si no hay fecha pero sí hora, usar la fecha de hoy
                        const hoy = dateHelper.now().toFormat("yyyy-MM-dd");
                        const nuevaFecha = `${hoy}T${horaSeleccionada}:00`;
                        setFechaInicio(nuevaFecha);
                      }
                    }}
                    placeholder="Seleccionar hora"
                    format="24h"
                    step={1}
                    className="w-full"
                  />
                </div>
              </div>

              <div>
                <div
                  className="flex items-center justify-between mb-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => document.getElementById("usarFechaTermino").click()}
                >
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-700">
                      Establecer fecha y hora de término
                    </div>
                  </div>

                  {/* Switch personalizado */}
                  <label htmlFor="usarFechaTermino" className="relative cursor-pointer">
                    <input
                      type="checkbox"
                      id="usarFechaTermino"
                      checked={usarFechaTermino}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setUsarFechaTermino(checked);

                        if (!checked) {
                          setFechaTermino("");
                        } else {
                          // Establecer fecha de término por defecto (2 horas después del inicio)
                          if (fechaInicio) {
                            const inicioDateTime = dateHelper.fromInputFormat(fechaInicio);
                            const terminoDateTime = inicioDateTime.plus({ hours: 2 });
                            setFechaTermino(dateHelper.toInputFormat(terminoDateTime));
                          } else {
                            // Si no hay fecha de inicio, usar ahora + 2 horas
                            const now = dateHelper.now();
                            const terminoDateTime = now.plus({ hours: 2 });
                            setFechaTermino(dateHelper.toInputFormat(terminoDateTime));
                          }
                        }
                      }}
                      className="sr-only"
                    />
                    <div
                      className={`
                      relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 ease-in-out
                      ${
                        usarFechaTermino
                          ? "bg-blue-600 shadow-lg shadow-blue-200"
                          : "bg-gray-300 hover:bg-gray-400"
                      }
                      hover:scale-105 focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2
                    `}
                    >
                      <span
                        className={`
                        inline-block h-4 w-4 transform rounded-full bg-white transition-all duration-300 ease-in-out shadow-md
                        ${usarFechaTermino ? "translate-x-6 scale-110" : "translate-x-1"}
                      `}
                      >
                        {/* Icono dentro del switch */}
                        <span
                          className={`
                          absolute inset-0 flex items-center justify-center transition-opacity duration-200
                          ${usarFechaTermino ? "opacity-100" : "opacity-0"}
                        `}
                        >
                          <MdEvent className="h-2.5 w-2.5 text-blue-600" />
                        </span>
                        <span
                          className={`
                          absolute inset-0 flex items-center justify-center transition-opacity duration-200
                          ${!usarFechaTermino ? "opacity-100" : "opacity-0"}
                        `}
                        >
                          <FaSync className="h-2 w-2 text-gray-400" />
                        </span>
                      </span>
                    </div>
                  </label>
                </div>

                <div className="flex items-start gap-2 text-xs text-gray-600 mb-3 bg-gray-50 rounded-lg">
                  {usarFechaTermino ? (
                    <>
                      <MdAccessTime className="text-blue-500 mt-0.5 flex-shrink-0" />
                      <span>
                        Tu disponibilidad terminará automáticamente en la fecha y hora especificada.
                      </span>
                    </>
                  ) : (
                    <>
                      <FaSync className="text-green-500 mt-0.5 flex-shrink-0" />
                      <span>
                        Tu disponibilidad permanecerá activa hasta que la cierres manualmente.
                      </span>
                    </>
                  )}
                </div>

                {/* Campos de fecha de término con animación */}
                <div
                  className={`
                  overflow-visible transition-all duration-500 ease-in-out
                  ${
                    usarFechaTermino
                      ? "max-h-96 opacity-100 transform translate-y-0"
                      : "max-h-0 opacity-0 transform -translate-y-2"
                  }
                `}
                >
                  <div className="pt-2">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Fecha de Término</label>
                        <DatePicker
                          value={
                            fechaTermino
                              ? dateHelper.fromInputFormat(fechaTermino).toFormat("yyyy-MM-dd")
                              : ""
                          }
                          onChange={(e) => {
                            const fechaSeleccionada = e.target.value;
                            if (fechaSeleccionada) {
                              // Mantener la hora actual si existe, o usar 2 horas después del inicio
                              const horaActual = fechaTermino
                                ? dateHelper.fromInputFormat(fechaTermino).toFormat("HH:mm")
                                : fechaInicio
                                ? dateHelper
                                    .fromInputFormat(fechaInicio)
                                    .plus({ hours: 2 })
                                    .toFormat("HH:mm")
                                : "11:00";
                              const nuevaFecha = `${fechaSeleccionada}T${horaActual}:00`;
                              setFechaTermino(nuevaFecha);
                            } else {
                              setFechaTermino("");
                            }
                          }}
                          placeholder="Seleccionar fecha"
                          minDate={
                            fechaInicio
                              ? dateHelper.fromInputFormat(fechaInicio).toFormat("yyyy-MM-dd")
                              : dateHelper.now().toFormat("yyyy-MM-dd")
                          }
                          maxDate={dateHelper.now().plus({ years: 1 }).toFormat("yyyy-MM-dd")}
                          className="w-full"
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Hora de Término</label>
                        <TimePicker
                          value={
                            fechaTermino
                              ? dateHelper.fromInputFormat(fechaTermino).toFormat("HH:mm")
                              : fechaInicio
                              ? dateHelper
                                  .fromInputFormat(fechaInicio)
                                  .plus({ hours: 2 })
                                  .toFormat("HH:mm")
                              : "11:00"
                          }
                          onChange={(e) => {
                            const horaSeleccionada = e.target.value;
                            if (horaSeleccionada && fechaTermino) {
                              const fechaActual = dateHelper
                                .fromInputFormat(fechaTermino)
                                .toFormat("yyyy-MM-dd");
                              const nuevaFecha = `${fechaActual}T${horaSeleccionada}:00`;
                              setFechaTermino(nuevaFecha);
                            } else if (horaSeleccionada && fechaInicio) {
                              // Si no hay fecha de término pero sí de inicio, usar la misma fecha
                              const fechaInicioActual = dateHelper
                                .fromInputFormat(fechaInicio)
                                .toFormat("yyyy-MM-dd");
                              const nuevaFecha = `${fechaInicioActual}T${horaSeleccionada}:00`;
                              setFechaTermino(nuevaFecha);
                            }
                          }}
                          placeholder="Seleccionar hora"
                          format="24h"
                          step={1}
                          minTime={
                            fechaInicio
                              ? dateHelper.fromInputFormat(fechaInicio).toFormat("HH:mm")
                              : undefined
                          }
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Indicador de auto-ajuste */}
                {autoAjustado && (
                  <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-700 flex items-center gap-2">
                    <MdAccessTime className="flex-shrink-0" />
                    <span>Fecha ajustada automáticamente para ser posterior al inicio</span>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={(e) => {
                  console.log("[DisponibilidadMarcarTab] ONCLICK ejecutado");
                  e.preventDefault();
                  e.stopPropagation();
                  console.log("[DisponibilidadMarcarTab] Estado del botón:", {
                    updatingMyStatus,
                    fechaInicio,
                    fechaTermino,
                    usarFechaTermino,
                    isDisabled: updatingMyStatus || !fechaInicio,
                  });
                  handleCreateDisponibilidad();
                }}
                disabled={updatingMyStatus || !fechaInicio}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 relative z-10"
              >
                {updatingMyStatus ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Creando...
                  </>
                ) : (
                  <>
                    <FaUserCheck className="h-4 w-4" />
                    Marcar como Disponible
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Resumen del Personal - 3 partes */}
        {hasPermiso("disponibilidad:obtener") && (
          <div className="lg:col-span-3 bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Personal Disponible</h2>
              <div className="flex items-center gap-2 text-sm text-gray-600 bg-blue-50 px-3 py-1 rounded-full">
                <FaUsers />
                {stats.disponibles}
              </div>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto">
              {Array.isArray(disponibilidades) &&
                disponibilidades
                  .filter((d) => estaDisponible(d))
                  .reduce((unique, disponibilidad) => {
                    const existingIndex = unique.findIndex(
                      (d) => d.idBombero === disponibilidad.idBombero
                    );
                    if (existingIndex === -1) {
                      unique.push(disponibilidad);
                    } else {
                      // Si el actual es más reciente, reemplazar
                      const existing = unique[existingIndex];
                      const currentDate = new Date(disponibilidad.fechaInicio);
                      const existingDate = new Date(existing.fechaInicio);

                      if (currentDate > existingDate) {
                        unique[existingIndex] = disponibilidad;
                      }
                    }
                    return unique;
                  }, [])
                  .map((disponibilidad, index) => {
                    const tieneLicenciaClaseF =
                      disponibilidad.licenciaClaseF ||
                      disponibilidad.bombero?.licenciaClaseF ||
                      false;

                    return (
                      <div
                        key={disponibilidad.id}
                        className="border-b border-gray-100 last:border-b-0"
                      >
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg mb-2">
                          {/* Columna de numeración */}
                          <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm font-medium">
                            {index + 1}
                          </div>

                          <div className="flex-shrink-0 flex items-center gap-1.5">
                            <FaUserCheck className="text-green-600 text-sm" />
                            {tieneLicenciaClaseF && (
                              <MdDriveEta
                                className="text-orange-600 text-base"
                                title="Maquinista (Licencia Clase F)"
                              />
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 text-sm truncate">
                              {getBomberoInfo(disponibilidad.idBombero, disponibilidad)}
                              {tieneLicenciaClaseF && (
                                <span
                                  className="ml-2 text-xs text-orange-600 font-medium"
                                  title="Maquinista"
                                >
                                  (Maquinista)
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatFecha(disponibilidad.fechaInicio).split(" ")[1]}
                              {disponibilidad.fechaTermino &&
                                ` - ${formatFecha(disponibilidad.fechaTermino).split(" ")[1]}`}
                              <span className="text-blue-600 font-medium ml-2">
                                (
                                {calcularDuracion(
                                  disponibilidad.fechaInicio,
                                  disponibilidad.fechaTermino
                                )}
                                )
                              </span>
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}

              {Array.isArray(disponibilidades) &&
                disponibilidades.filter((d) => estaDisponible(d)).length === 0 && (
                  <div className="text-center py-6">
                    <FaUsers className="mx-auto h-8 w-8 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">No hay personal disponible</p>
                  </div>
                )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DisponibilidadMarcarTab;
