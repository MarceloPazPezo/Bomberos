"use strict";
import { Router } from "express";
import usuarioRoutes from "./usuario.routes.js";
import authRoutes from "./auth.routes.js";
import perfilRoutes from "./perfil.routes.js";
import rolRoutes from "./rol.routes.js";
import locationRoutes from "./location.routes.js";
import permisoRoutes from "./permiso.routes.js";
import healthRoutes from "./health.routes.js";
import sistemaRoutes from "./sistema.routes.js";
// import disponibilidadRoutes from "./disponibilidad.routes.js";
import contactoEmergenciaRoutes from "./contactoEmergencia.routes.js";

const router = Router();

router
  .use("/auth", authRoutes)
  .use("/usuario", usuarioRoutes)
  .use("/perfil", perfilRoutes)
  .use("/rol", rolRoutes)
  .use("/locations", locationRoutes)
  .use("/permiso", permisoRoutes)
  .use("/sistema", sistemaRoutes)
  // .use("/disponibilidad", disponibilidadRoutes)
  .use("/health", healthRoutes)
  .use("/contactoEmergencia", contactoEmergenciaRoutes);

export default router;
