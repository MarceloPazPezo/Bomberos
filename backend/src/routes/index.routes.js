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
import debugRoutes from "./debug.routes.js";

const router = Router();

router
  .use("/auth", authRoutes)
  .use("/bombero", bomberoRoutes)
  .use("/perfil", perfilRoutes)
  .use("/rol", rolRoutes)
  .use("/permiso", permisoRoutes)
  .use("/disponibilidad", disponibilidadRoutes)
  .use("/compania", companiaRoutes)
  .use("/debug", debugRoutes)
  .use("/health", healthRoutes);

export default router;
