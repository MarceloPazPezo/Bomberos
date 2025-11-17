"use strict";
import { Router } from "express";
import { login, logout, validateToken } from "../controllers/auth.controller.js";

const router = Router();

router
  .post("/login", login)
  .post("/logout", logout)
  .get("/validate", validateToken);

export default router;
