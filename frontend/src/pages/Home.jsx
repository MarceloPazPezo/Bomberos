import React, { useState, useEffect } from "react";
import { useAuth } from "@hooks/auth/useAuth";
import { useCompaniaBombero } from "@hooks/compania/useCompaniaBombero";
import { useActiveBomberos } from "@hooks/bomberos/useActiveBomberos";
import CompaniaBanner from "@components/companias/CompaniaBanner";
import companiaImageService from "@services/companiaImage.service";
import axios from "@services/root.service";
import { getDisponibilidades } from "@services/disponibilidad.service";
import {
  MdLocalFireDepartment,
  MdGroup,
  MdLocationOn,
  MdPhone,
  MdEmail,
  MdCalendarToday,
  MdPeople,
  MdSecurity,
  MdCheckCircle,
  MdSchedule,
  MdTrendingUp,
  MdInventory,
  MdHelpOutline,
  MdOpenInNew,
  MdLanguage,
} from "react-icons/md";
import { useNavigate } from "react-router-dom";
import Tooltip from "@components/Tooltip.jsx";

import { getEventos, getTiposEvento, getEventosRecurrentes } from "@services/calendario.service";
import {
  mapRecurrentesToEvents,
  computeProximosEventos,
  computeProximosRecurrentes,
} from "@helpers/calendarRecurrentes";
import { mapEventosConColores } from "@helpers/calendarFormat";
import { buildTipoColorMap } from "@helpers/calendarColors";
import { getIncidentesPorPeriodo } from "@services/dashboard.service";
import dayjs from "dayjs";
import "dayjs/locale/es";
import localizedFormat from "dayjs/plugin/localizedFormat";

dayjs.extend(localizedFormat);
dayjs.locale("es");

const Home = () => {
  const { bombero } = useAuth();
  const { companiaInfo, loading: loadingCompania } = useCompaniaBombero();
  const { activeBomberos, isConnected, connectionError } = useActiveBomberos();
  const navigate = useNavigate();

  const [logoUrl, setLogoUrl] = useState(null);
  const [logoError, setLogoError] = useState(false);
  const [dashboardStats, setDashboardStats] = useState({
    bomberosStats: null,
    eppStats: null,
    disponibilidadStats: null,
    incidentesStats: null,
    loading: true,
  });
  const [stableCompaniaId, setStableCompaniaId] = useState(null);
  const [isUsingFallback, setIsUsingFallback] = useState(false);

  // Estados para próximos eventos
  const [upcomingEvents, setUpcomingEvents] = useState({ operativo: [], hitos: [] });
  const [loadingEvents, setLoadingEvents] = useState(true);

  // Cargar próximos eventos (7 días)
  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoadingEvents(true);
        const [evResponse, tipResponse, recResponse] = await Promise.all([
          getEventos().catch(() => []),
          getTiposEvento().catch(() => []),
          getEventosRecurrentes().catch(() => ({})),
        ]);

        const tiposOpt = (tipResponse?.data || tipResponse || []).map((t) => ({
          label: t?.nombre || t?.name || t?.label || "General",
          value: t?.id || t?.value || t?.codigo || "general",
          color: t?.color || undefined,
        }));

        const colorMap = buildTipoColorMap(tiposOpt);
        const getColorForTipo = (tipoId) => colorMap[String(tipoId)];

        const rawEvents = evResponse?.data || evResponse || [];
        const mappedEvents = mapEventosConColores(rawEvents, tiposOpt, getColorForTipo);
        const nextEvents = computeProximosEventos(mappedEvents, 1); // 1 semana

        const rawRec = recResponse?.data || recResponse || {};
        const mappedRec = mapRecurrentesToEvents(rawRec);
        const nextRec = computeProximosRecurrentes(mappedRec, 1); // 1 semana

        setUpcomingEvents({
          operativo: nextEvents,
          hitos: nextRec,
        });
      } catch (e) {
        console.error("Error loading events", e);
      } finally {
        setLoadingEvents(false);
      }
    };
    loadEvents();
  }, []);

  // Cargar logo de la compañía
  useEffect(() => {
    const loadLogo = async () => {
      if (!companiaInfo?.id) {
        setLogoUrl(null);
        setLogoError(false);
        return;
      }

      try {
        setLogoError(false);
        const url = await companiaImageService.getCompaniaLogoURL(companiaInfo.id);
        if (url) {
          setLogoUrl(url);
        } else {
          setLogoUrl(null);
          setLogoError(true);
        }
      } catch (error) {
        console.error("[Home] Error cargando logo:", error);
        setLogoUrl(null);
        setLogoError(true);
      }
    };

    loadLogo();
  }, [companiaInfo?.id]);

  // Cargar estadísticas del dashboard
  useEffect(() => {
    const loadDashboardStats = async () => {
      if (!bombero?.companiaId && !companiaInfo?.id) {
        setDashboardStats((prev) => ({ ...prev, loading: false }));
        return;
      }

      try {
        setDashboardStats((prev) => ({ ...prev, loading: true }));

        const companiaId = bombero?.companiaId || companiaInfo?.id;

        // Calcular fechas para estadísticas de incidentes (este mes y este año)
        const ahora = new Date();
        const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
        const finMes = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 0);
        const inicioAno = new Date(ahora.getFullYear(), 0, 1);
        const finAno = new Date(ahora.getFullYear(), 11, 31);

        const statsPromises = [
          axios
            .get("/bombero/mi-compania/estadisticas")
            .then((r) => r.data)
            .catch((err) => {
              console.error("[Home] Error obteniendo estadísticas de bomberos:", err);
              return null;
            }),
          axios
            .get("/epp/stats")
            .then((r) => r.data)
            .catch((err) => {
              console.error("[Home] Error obteniendo estadísticas de EPP:", err);
              return null;
            }),
          getDisponibilidades().catch((err) => {
            console.error("[Home] Error obteniendo disponibilidades:", err);
            return null;
          }),
          // Obtener bomberos de la compañía para filtrar disponibilidades
          companiaId
            ? axios
                .get("/bombero/mi-compania/bomberos")
                .then((r) => r.data)
                .catch(() => null)
            : Promise.resolve(null),
          // Obtener estadísticas de incidentes
          companiaId
            ? Promise.all([
                getIncidentesPorPeriodo(
                  Math.floor(inicioMes.getTime() / 1000),
                  Math.floor(finMes.getTime() / 1000),
                  companiaId,
                  "dias"
                ).catch(() => []),
                getIncidentesPorPeriodo(
                  Math.floor(inicioAno.getTime() / 1000),
                  Math.floor(finAno.getTime() / 1000),
                  companiaId,
                  "meses"
                ).catch(() => []),
              ])
                .then(([mesData, anoData]) => {
                  const totalMes =
                    mesData?.data?.reduce((sum, item) => sum + (item.cantidad || 0), 0) || 0;
                  const totalAno =
                    anoData?.data?.reduce((sum, item) => sum + (item.cantidad || 0), 0) || 0;
                  return {
                    totalMes,
                    totalAno,
                    mesData: mesData?.data || [],
                    anoData: anoData?.data || [],
                  };
                })
                .catch((err) => {
                  console.error("[Home] Error obteniendo estadísticas de incidentes:", err);
                  return { totalMes: 0, totalAno: 0, mesData: [], anoData: [] };
                })
            : Promise.resolve({ totalMes: 0, totalAno: 0, mesData: [], anoData: [] }),
        ];

        const [bomberosRes, eppRes, disponibilidades, bomberosCompaniaRes, incidentesStats] =
          await Promise.all(statsPromises);

        // Extraer datos de las respuestas del backend
        // bomberosRes es r.data (la respuesta completa del backend)
        // bomberosRes.data contiene { compania: {...}, estadisticas: {...} }
        // bomberosRes.data.estadisticas contiene las estadísticas reales
        const bomberosStats = bomberosRes?.data?.estadisticas || null;
        const eppStats = eppRes?.data || null;

        console.log("[Home] Respuesta completa bomberos:", bomberosRes);
        console.log("[Home] Estadísticas recibidas:", {
          bomberosStats,
          eppStats,
          disponibilidades: disponibilidades?.length,
          bomberosResData: bomberosRes?.data,
        });

        // Calcular estadísticas de disponibilidad
        let disponibilidadStats = null;
        if (Array.isArray(disponibilidades)) {
          const now = new Date();

          // Obtener IDs de bomberos de la compañía para filtrar disponibilidades
          let bomberosIdsCompania = [];
          if (bomberosCompaniaRes?.data?.bomberos) {
            const bomberosCompania = Array.isArray(bomberosCompaniaRes.data.bomberos)
              ? bomberosCompaniaRes.data.bomberos
              : [];
            bomberosIdsCompania = bomberosCompania.map((b) => b.id);
          }

          // Filtrar disponibilidades: primero por compañía (si tenemos los IDs), luego por fecha
          let disponibilidadesCompania = disponibilidades;
          if (bomberosIdsCompania.length > 0) {
            disponibilidadesCompania = disponibilidades.filter(
              (d) => d.bombero && bomberosIdsCompania.includes(d.bombero.id)
            );
          }

          // Filtrar solo las disponibilidades activas
          const disponibles = disponibilidadesCompania.filter((d) => {
            if (!d.fechaInicio) return false;
            try {
              const fechaInicio = new Date(d.fechaInicio);
              const fechaTermino = d.fechaTermino ? new Date(d.fechaTermino) : null;
              return fechaInicio <= now && (!fechaTermino || fechaTermino > now);
            } catch (error) {
              console.warn("[Home] Error al procesar fecha de disponibilidad:", error);
              return false;
            }
          }).length;

          disponibilidadStats = {
            disponibles,
            total: disponibilidadesCompania.length,
          };
        }

        setDashboardStats({
          bomberosStats,
          eppStats,
          disponibilidadStats,
          incidentesStats,
          loading: false,
        });
      } catch (error) {
        console.error("[Home] Error cargando estadísticas:", error);
        setDashboardStats((prev) => ({ ...prev, loading: false }));
      }
    };

    loadDashboardStats();
  }, [bombero?.companiaId, companiaInfo?.id]);

  // Mantener companiaId estable para evitar parpadeo del banner
  useEffect(() => {
    const newCompaniaId = bombero?.companiaId || companiaInfo?.id;
    if (newCompaniaId && !stableCompaniaId) {
      setStableCompaniaId(newCompaniaId);
    }
  }, [bombero?.companiaId, companiaInfo?.id, stableCompaniaId]);

  const companiaId = stableCompaniaId || bombero?.companiaId || companiaInfo?.id;
  const companyName = companiaInfo?.nombre || "Bomberos de Chile";
  const companyCity = companiaInfo?.comuna?.nombre || "";
  const companyRegion = companiaInfo?.comuna?.region?.nombre || "";
  const companyPhone = companiaInfo?.telefono || "";
  const companyEmail = companiaInfo?.email || "";
  const companyAddress = companiaInfo?.direccion?.calle
    ? `${companiaInfo.direccion.calle}${
        companiaInfo.direccion.numero ? ` ${companiaInfo.direccion.numero}` : ""
      }`
    : "";
  const companyDescripcion = companiaInfo?.descripcion || "";
  const companySitioWeb = companiaInfo?.sitioWeb || "";

  // Debug log para ver qué datos están llegando
  console.log("🔍 [Home] companiaInfo completa:", companiaInfo);
  console.log("🔍 [Home] Datos extraídos:", {
    companyName,
    companyCity,
    companyRegion,
    companyPhone,
    companyEmail,
    companyAddress,
    companyDescripcion,
    companySitioWeb,
  });

  // Helper render function
  const renderEventCard = (evt, idx, isHito = false) => {
    const now = dayjs();
    const start = dayjs(evt.start);
    const end = evt.end ? dayjs(evt.end) : null;

    // Status Logic
    const isEnCurso = start.isBefore(now) && end && end.isAfter(now);
    const isMultiDay = end && end.diff(start, "day") >= 1;
    const isSameDay = end && start.isSame(end, "day");

    // Tag Logic
    let tags = [];

    // Tag 1: Date Tag
    let dateTagText = "";
    if (isMultiDay && end) {
      dateTagText = `${start.format("D")} - ${end.format("D [de] MMMM")}`.toUpperCase();
    } else {
      dateTagText = start.format("D [DE] MMMM").toUpperCase();
    }
    tags.push({ text: dateTagText, type: "range", icon: "pi pi-calendar" });

    // Tag 2: En Curso
    if (isEnCurso) {
      let cursoText = "EN CURSO";
      if (end) {
        if (end.isSame(now, "day")) {
          cursoText = `EN CURSO (Hasta las ${end.format("HH:mm")})`;
        } else if (end.isSame(now.add(1, "day"), "day")) {
          cursoText = `EN CURSO (Hasta mañana)`;
        } else {
          cursoText = `EN CURSO (Hasta el ${end.format("D [de] MMM")})`;
        }
      }
      tags.push({ text: cursoText, type: "curso", icon: "pi pi-bolt" });
    }

    // Tag 3: Duration (multiday)
    if (isMultiDay && end) {
      const diffHours = end.diff(start, "hours");
      const diffDays = Math.max(1, Math.ceil(diffHours / 24));
      tags.push({ text: `Dura ${diffDays} Días`, type: "duration" });
    }

    // Bottom Detail Logic
    let detailText = "";
    const formatTime = (d) => d.format("HH:mm [h]");

    let startLabel = start.format("ddd D MMM");
    if (start.isSame(now, "day")) startLabel = "Hoy";
    else if (start.isSame(now.add(1, "day"), "day")) startLabel = "Mañana";
    else startLabel = start.format("dddd, D [de] MMMM");

    startLabel = startLabel.charAt(0).toUpperCase() + startLabel.slice(1);

    if (evt.allDay) {
      detailText = `${startLabel} (Todo el día)`;
      if (isMultiDay && end) {
        let endLabel = end.format("ddd D MMM");
        if (end.isSame(now, "day")) endLabel = "Hoy";
        else if (end.isSame(now.add(1, "day"), "day")) endLabel = "Mañana";
        detailText = `${startLabel} - ${endLabel} Fin`;
      }
    } else {
      const startTime = formatTime(start);
      const endTime = end ? formatTime(end) : "";

      if (isSameDay) {
        detailText = `${startLabel}, ${startTime} - ${endTime}`;
      } else if (end) {
        let endLabel = "";
        if (end.isSame(now.add(1, "day"), "day")) {
          endLabel = `Mañana ${end.format("HH:mm [h]")}`;
        } else {
          endLabel = `${end.format("ddd. D [de] MMMM HH:mm [h]")}`;
        }

        detailText = `${startLabel} ${startTime} (Inicio) - ${endLabel} Fin`;
      } else {
        detailText = `${startLabel}, ${startTime}`;
      }
    }

    return (
      <div
        key={`${evt.id}-${evt.start}-${idx}`}
        className="bg-white rounded-lg shadow-sm border border-slate-200 p-3 hover:shadow-md transition-all group flex flex-col gap-1.5 relative overflow-hidden shrink-0"
      >
        {/* Left Border Color Stripe */}
        <div
          className="absolute top-0 left-0 bottom-0 w-1"
          style={{ backgroundColor: evt.backgroundColor || "#318CE7" }}
        />

        {/* Navigation Button */}
        <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate("/calendario", {
                state: {
                  eventId: evt.id,
                  date: evt.start,
                  isRecurrent: isHito,
                },
              });
            }}
            className="p-1 text-[#318CE7] hover:bg-blue-50 rounded-full transition-colors bg-white/80 backdrop-blur-sm shadow-sm border border-blue-100"
            title="Ver en calendario"
          >
            <MdOpenInNew className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="pl-2">
          {/* Title */}
          <h3 className="text-sm font-bold text-slate-800 leading-tight mb-1">{evt.title}</h3>

          {/* Tags Row */}
          <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
            {tags.map((tag, tIdx) => (
              <span
                key={tIdx}
                className={`
                                inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide
                                ${tag.type === "curso" ? "bg-orange-100 text-orange-700" : ""}
                                ${tag.type === "range" ? "bg-blue-100 text-blue-700" : ""}
                                ${tag.type === "duration" ? "bg-amber-100 text-amber-700" : ""}
                            `}
              >
                {tag.icon && <i className={`${tag.icon} mr-1 text-[10px]`}></i>}
                {tag.text}
              </span>
            ))}
          </div>

          {/* Detail Info */}
          <div className="text-xs text-slate-500 font-medium">{detailText}</div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-orange-50">
      {/* Hero Section con Banner */}
      <div className="relative overflow-hidden">
        {companiaId || stableCompaniaId ? (
          <div className="relative h-80 md:h-96">
            <CompaniaBanner
              compania={{ id: companiaId || stableCompaniaId }}
              nombre={companyName}
              size="hero"
              className="w-full h-full"
              alt={`Banner ${companyName}`}
              onFallback={setIsUsingFallback}
            />
            {!isUsingFallback && (
              <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60"></div>
            )}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white px-4 max-w-4xl mx-auto">
                {/* Logo de la compañía - Solo mostrar si hay URL válida y no hay error */}
                {logoUrl && !logoError ? (
                  <div className="mb-6 flex justify-center">
                    <img
                      src={logoUrl}
                      alt={`Logo ${companyName}`}
                      className="h-24 w-24 md:h-32 md:w-32 rounded-full bg-white/20 backdrop-blur-sm p-2 shadow-2xl object-contain"
                      onError={() => {
                        setLogoUrl(null);
                        setLogoError(true);
                      }}
                      onLoad={() => {
                        setLogoError(false);
                      }}
                    />
                  </div>
                ) : null}

                {/* Nombre de la compañía */}
                <h1 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg">
                  {loadingCompania ? (
                    <div className="inline-block h-12 w-64 bg-white/20 rounded animate-pulse"></div>
                  ) : (
                    companyName
                  )}
                </h1>

                {/* Mensaje de bienvenida */}
                <p className="text-xl md:text-2xl text-white/95 mb-6 drop-shadow-md">
                  {bombero ? (
                    <>
                      ¡Bienvenido/a de vuelta,{" "}
                      <span className="font-semibold">
                        {(() => {
                          const nombres = Array.isArray(bombero.nombres)
                            ? bombero.nombres.join(" ")
                            : bombero.nombres || "";
                          const apellidos = Array.isArray(bombero.apellidos)
                            ? bombero.apellidos.join(" ")
                            : bombero.apellidos || "";
                          return [nombres, apellidos].filter(Boolean).join(" ");
                        })()}
                      </span>
                      !
                    </>
                  ) : (
                    "Sistema de Gestión para Cuerpos de Bomberos"
                  )}
                </p>

                {/* Ubicación */}
                {(companyCity || companyRegion) && !loadingCompania && (
                  <div className="flex items-center justify-center text-white/90 mb-2 drop-shadow-md">
                    <MdLocationOn className="h-5 w-5 mr-2" />
                    <span>
                      {companyCity}
                      {companyRegion && `, ${companyRegion}`}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="relative overflow-hidden bg-gradient-to-r from-red-600 via-orange-600 to-red-700">
            <div className="absolute inset-0 bg-black opacity-30"></div>
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-24">
              <div className="text-center">
                <div className="flex justify-center mb-6">
                  <MdLocalFireDepartment className="h-20 w-20 text-white drop-shadow-lg" />
                </div>
                <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg">
                  {loadingCompania ? "Cargando..." : companyName}
                </h1>
                <p className="text-xl md:text-2xl text-white/95 mb-6 drop-shadow-md">
                  {bombero ? (
                    <>
                      ¡Bienvenido/a de vuelta,{" "}
                      <span className="font-semibold">
                        {(() => {
                          const nombres = Array.isArray(bombero.nombres)
                            ? bombero.nombres.join(" ")
                            : bombero.nombres || "";
                          const apellidos = Array.isArray(bombero.apellidos)
                            ? bombero.apellidos.join(" ")
                            : bombero.apellidos || "";
                          return [nombres, apellidos].filter(Boolean).join(" ");
                        })()}
                      </span>
                      !
                    </>
                  ) : (
                    "Sistema de Gestión para Cuerpos de Bomberos"
                  )}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Contenido Principal */}
      <div className="max-w-7xl mx-auto px-4 mt-2">
        {/* Layout Principal: 2 Columnas */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Columna Izquierda: Agenda Semanal (2/3 del ancho) */}
          <div className="lg:col-span-2 flex flex-col">
            <section className="flex-1 flex flex-col">
              <div className="bg-white/80 backdrop-blur-lg border border-[#4EB9FA]/20 shadow-md rounded-2xl p-4 flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <MdCalendarToday className="h-6 w-6 text-[#4EB9FA]" />
                    Agenda Semanal
                  </h2>
                  <button
                    onClick={() => navigate("/calendario")}
                    className="p-2 text-[#4EB9FA] hover:bg-blue-50 rounded-full transition-colors relative group"
                    title="Ver calendario completo"
                  >
                    <MdCalendarToday className="h-6 w-6" />
                  </button>
                </div>

                {loadingEvents ? (
                  <div className="flex items-center justify-center p-8 text-slate-500 flex-1">
                    <i className="pi pi-spin pi-spinner mr-2"></i> Cargando eventos...
                  </div>
                ) : (
                  <div className="flex flex-col space-y-6 flex-1">
                    {/* Sección 1: Calendario Operativo */}
                    <div className="flex flex-col space-y-4 flex-1">
                      <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2 border-b pb-2">
                        Calendario Operativo
                      </h3>
                      {upcomingEvents.operativo.length === 0 ? (
                        <div className="text-center p-6 text-slate-400 bg-slate-50 rounded-lg border border-dashed border-slate-200 text-sm flex-1 flex items-center justify-center">
                          No hay eventos operativos próximos.
                        </div>
                      ) : (
                        <div className="flex flex-col space-y-3 flex-1 overflow-y-auto p-2 custom-scrollbar min-h-0">
                          {upcomingEvents.operativo.map((evt, idx) => renderEventCard(evt, idx))}
                        </div>
                      )}
                    </div>

                    {/* Sección 2: Hitos Conmemorativos */}
                    <div className="flex flex-col space-y-4 flex-1">
                      <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2 border-b pb-2">
                        Hitos Conmemorativos
                      </h3>
                      {upcomingEvents.hitos.length === 0 ? (
                        <div className="text-center p-6 text-slate-400 bg-slate-50 rounded-lg border border-dashed border-slate-200 text-sm flex-1 flex items-center justify-center">
                          No hay hitos próximos.
                        </div>
                      ) : (
                        <div className="flex flex-col space-y-3 flex-1 overflow-y-auto p-2 custom-scrollbar min-h-0">
                          {upcomingEvents.hitos.map((evt, idx) => renderEventCard(evt, idx, true))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Columna Derecha: Módulos en Stack Vertical (1/3 del ancho) */}
          <div className="lg:col-span-1 space-y-6">
            {/* Módulo 1: Estadística Compañía */}
            <div className="bg-white/80 backdrop-blur-lg border border-[#4EB9FA]/20 shadow-md rounded-2xl p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">Estadística Compañía</h3>
                <div className="p-2 bg-blue-100 rounded-full">
                  <MdTrendingUp className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Total Bomberos</span>
                  <span className="text-lg font-semibold text-blue-600">
                    {dashboardStats.loading
                      ? "--"
                      : dashboardStats.bomberosStats?.totalSistema ?? 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Activos</span>
                  <span className="text-lg font-semibold text-green-600">
                    {dashboardStats.loading
                      ? "--"
                      : dashboardStats.bomberosStats?.bomberosActivos ?? 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Disponibles</span>
                  <span className="text-lg font-semibold text-green-600">
                    {dashboardStats.disponibilidadStats?.disponibles ?? "--"}
                  </span>
                </div>
              </div>
            </div>

            {/* Módulo 2: Inventario EPP */}
            <div
              className="bg-white/80 backdrop-blur-lg border border-[#4EB9FA]/20 shadow-md rounded-2xl p-4 hover:shadow-lg transition-all duration-200 cursor-pointer"
              onClick={() => navigate("/inventario-epp")}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">Inventario EPP</h3>
                <div className="p-2 bg-orange-100 rounded-full">
                  <MdInventory className="h-6 w-6 text-orange-600" />
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Total EPP</span>
                  <span className="text-lg font-semibold text-slate-900">
                    {dashboardStats.loading ? "--" : dashboardStats.eppStats?.totalEpps ?? 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">En Bodega</span>
                  <span className="text-lg font-semibold text-orange-600">
                    {dashboardStats.loading ? "--" : dashboardStats.eppStats?.eppsDisponibles ?? 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Asignados</span>
                  <span className="text-lg font-semibold text-slate-900">
                    {dashboardStats.loading ? "--" : dashboardStats.eppStats?.eppsAsignados ?? 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Disponibilidad</span>
                  <span className="text-lg font-semibold text-green-600">
                    {dashboardStats.eppStats?.porcentajeDisponibilidad ?? 0}%
                  </span>
                </div>
              </div>
            </div>

            {/* Módulo 3: Personal de la Compañía */}
            <div
              className="bg-white/80 backdrop-blur-lg border border-[#4EB9FA]/20 shadow-md rounded-2xl p-4 hover:shadow-lg transition-all duration-200 cursor-pointer"
              onClick={() => navigate("/bomberos")}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">Personal de la Compañía</h3>
                <div className="p-2 bg-blue-100 rounded-full">
                  <MdPeople className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Habilitados para acceder</span>
                  <span className="text-lg font-semibold text-green-600">
                    {dashboardStats.loading
                      ? "--"
                      : dashboardStats.bomberosStats?.bomberosActivos ?? 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Sin acceso al sistema</span>
                  <span className="text-lg font-semibold text-gray-600">
                    {dashboardStats.loading
                      ? "--"
                      : dashboardStats.bomberosStats?.bomberosInactivos ?? 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Módulo 4: Incidentes */}
            <div
              className="bg-white/80 backdrop-blur-lg border border-[#4EB9FA]/20 shadow-md rounded-2xl p-4 hover:shadow-lg transition-all duration-200 cursor-pointer"
              onClick={() => navigate("/dashboard")}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">Incidentes</h3>
                <div className="p-2 bg-red-100 rounded-full">
                  <MdLocalFireDepartment className="h-6 w-6 text-red-600" />
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Este Mes</span>
                  <span className="text-lg font-semibold text-red-600">
                    {dashboardStats.loading ? "--" : dashboardStats.incidentesStats?.totalMes ?? 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Este Año</span>
                  <span className="text-lg font-semibold text-red-600">
                    {dashboardStats.loading ? "--" : dashboardStats.incidentesStats?.totalAno ?? 0}
                  </span>
                </div>
                {isConnected && (
                  <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                    <span className="text-sm text-slate-600">Bomberos en línea</span>
                    <span className="text-lg font-semibold text-green-600">{activeBomberos}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Información de Contacto */}
        {(companyAddress ||
          companyPhone ||
          companyEmail ||
          companyCity ||
          companyRegion ||
          companyDescripcion ||
          companySitioWeb) && (
          <section className="mb-8">
            <div className="bg-white/80 backdrop-blur-lg border border-[#4EB9FA]/20 shadow-md rounded-2xl p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
                <MdLocalFireDepartment className="h-6 w-6 text-red-600 mr-2" />
                Información de la Compañía
              </h2>

              {/* Descripción - Si existe, mostrarla primero con ancho completo */}
              {companyDescripcion && (
                <div className="mb-6 pb-6 border-b border-slate-200">
                  <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
                    Acerca de Nosotros
                  </h3>
                  <p className="text-slate-700 leading-relaxed">{companyDescripcion}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {companyAddress && (
                  <div className="flex items-start space-x-3">
                    <MdLocationOn className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
                        Dirección
                      </p>
                      <p className="text-slate-700 font-medium">{companyAddress}</p>
                    </div>
                  </div>
                )}
                {(companyCity || companyRegion) && (
                  <div className="flex items-start space-x-3">
                    <MdLocationOn className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
                        Ubicación
                      </p>
                      <p className="text-slate-700 font-medium">
                        {companyCity}
                        {companyRegion && `, ${companyRegion}`}
                      </p>
                    </div>
                  </div>
                )}
                {companyPhone && (
                  <div className="flex items-start space-x-3">
                    <MdPhone className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
                        Teléfono
                      </p>
                      <a
                        href={`tel:${companyPhone}`}
                        className="text-slate-700 font-medium hover:text-blue-600 transition-colors"
                      >
                        {companyPhone}
                      </a>
                    </div>
                  </div>
                )}
                {companyEmail && (
                  <div className="flex items-start space-x-3">
                    <MdEmail className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
                        Email
                      </p>
                      <a
                        href={`mailto:${companyEmail}`}
                        className="text-slate-700 font-medium hover:text-blue-600 transition-colors break-all"
                      >
                        {companyEmail}
                      </a>
                    </div>
                  </div>
                )}
                {companySitioWeb && (
                  <div className="flex items-start space-x-3">
                    <MdLanguage className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
                        Sitio Web
                      </p>
                      <a
                        href={companySitioWeb}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-700 font-medium hover:text-blue-600 transition-colors break-all"
                      >
                        {companySitioWeb.replace(/^https?:\/\//, "")}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Footer */}
        <footer className="text-center mt-12 pb-8 text-slate-500">
          <p className="text-sm">
            © {new Date().getFullYear()} {companyName}. Sistema de Gestión para Cuerpos de Bomberos.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Home;
