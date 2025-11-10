"use strict";
import { Router } from "express";
import authRoutes from "./auth.routes.js";
import bomberoRoutes from "./bombero.routes.js";
import perfilRoutes from "./perfil.routes.js";
import rolRoutes from "./rol.routes.js";
import permisoRoutes from "./permiso.routes.js";
import healthRoutes from "./health.routes.js";
import disponibilidadRoutes from "./disponibilidad.routes.js";
import companiaRoutes from "./compania.routes.js";
import direccionRoutes from "./direccion.routes.js";
import subtipoIncidenteRoutes from "./subtipoIncidente.routes.js";
import carroRoutes from "./carro.routes.js";
import servicioRoutes from "./servicio.routes.js";
import regionRoutes from "./region.routes.js";
import comunaRoutes from "./comuna.routes.js";
import debugRoutes from "./debug.routes.js";
import parteEmergenciaRoutes from "./parteEmergencia.routes.js";
import estadosParteRoutes from "./estadosParte.routes.js";
import incidenteResumenRoutes from "./incidenteResumen.routes.js";
import revisionPartesRoutes from "./revisionPartes.routes.js";
import incidenteEstadoRoutes from "./incidenteEstado.routes.js";
import eventoRoutes from "./evento.routes.js";

import fileRoutes from "./file.routes.js";
import tilesRoutes from "./tiles.routes.js";
import fichaBomberoRoutes from "./fichaBombero.routes.js";
import notificationRoutes from "./notification.routes.js";
import eppRoutes from "./epp.routes.js";
import perfilCompletoRoutes from "./perfilCompleto.routes.js";
import tipoSangreRoutes from "./tipoSangre.routes.js";
import estadoCivilRoutes from "./estadoCivil.routes.js";
import tipoEventoRoutes from "./tipoEvento.routes.js";

import tipoPuntoRoutes from "./tipoPunto.routes.js";
import puntoGeograficoRoutes from "./puntoGeografico.routes.js";
import jurisdiccionRoutes from "./jurisdiccion.routes.js";
import tipoEppRoutes from "./tipoEpp.routes.js";
import estadoEppRoutes from "./estadoEpp.routes.js";
import vinculoRoutes from "./vinculo.routes.js";
import claveRadialRoutes from "./claveRadial.routes.js";
import clasificacionEmergenciaRoutes from "./clasificacionEmergencia.routes.js";
import geocodingRoutes from "./geocoding.routes.js";
import historialRoutes from "./historial.routes.js";
import dashboardRoutes from "./dashboard.routes.js";


const router = Router();

router
  .use("/auth", authRoutes)
  .use("/bombero", bomberoRoutes)
  .use("/perfil", perfilRoutes)
  .use("/rol", rolRoutes)
  .use("/permiso", permisoRoutes)
  .use("/disponibilidad", disponibilidadRoutes)
  .use("/compania", companiaRoutes)
  .use("/health", healthRoutes)
  .use("/direccion", direccionRoutes)
  .use("/subtipoIncidente", subtipoIncidenteRoutes)
  .use("/carro", carroRoutes)
  .use("/servicios", servicioRoutes)
  .use("/region", regionRoutes)
  .use("/comuna", comunaRoutes)
  .use("/debug", debugRoutes)
  .use("/health", healthRoutes)
  .use("/parteEmergencia", parteEmergenciaRoutes)
  .use("/estadosParte", estadosParteRoutes)
  .use("/incidentes", incidenteResumenRoutes)
  .use("/incidentes", revisionPartesRoutes)
  .use("/incidentes", incidenteEstadoRoutes)
  .use("/calendario", eventoRoutes)
  .use("/files", fileRoutes)
  .use("/tiles", tilesRoutes)
  .use("/fichaBombero", fichaBomberoRoutes)
  .use("/notifications", notificationRoutes)
  .use("/epp", eppRoutes)
  .use("/perfil-completo", perfilCompletoRoutes)
  .use("/tipoSangre", tipoSangreRoutes)
  .use("/estado-civil", estadoCivilRoutes)
  .use("/tipo-evento", tipoEventoRoutes)
  .use("/tipos-punto", tipoPuntoRoutes)
  .use("/puntos-geograficos", puntoGeograficoRoutes)
  .use("/jurisdicciones", jurisdiccionRoutes)
  .use("/tipo-epp", tipoEppRoutes)
  .use("/estado-epp", estadoEppRoutes)
  .use("/vinculo", vinculoRoutes)
  .use("/clave-radial", claveRadialRoutes)
  .use("/geocoding", geocodingRoutes)
  .use("/clasificacion-emergencia", clasificacionEmergenciaRoutes)
  .use("/historial", historialRoutes)
  .use("/dashboard", dashboardRoutes);


export default router;
