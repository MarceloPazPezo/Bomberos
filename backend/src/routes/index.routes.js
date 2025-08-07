"use strict";
import { Router } from "express";
import userRoutes from "./user.routes.js";
import authRoutes from "./auth.routes.js";
import profileRoutes from "./profile.routes.js";
import roleRoutes from "./role.routes.js";
import locationRoutes from "./location.routes.js";
import permissionRoutes from "./permission.routes.js";
import healthRoutes from "./health.routes.js";

const router = Router();

router
  .use("/auth", authRoutes)
  .use("/user", userRoutes)
  .use("/profile", profileRoutes)
  .use("/role", roleRoutes)
  .use("/locations", locationRoutes)
  .use("/permission", permissionRoutes)
  .use("/health", healthRoutes);

export default router;
