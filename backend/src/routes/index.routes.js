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
import serviciosRoutes from "./servicios.routes.js";
import parteEmergenciaRoutes from "./parteEmergencia.routes.js";


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
  .use("/servicios", serviciosRoutes)
  .use("/parteEmergencia", parteEmergenciaRoutes);


export default router;
