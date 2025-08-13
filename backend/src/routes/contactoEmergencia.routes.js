"use strict";
import { Router } from "express";
import {
    getContactoEmergencia
} from "../controllers/contactoEmergencia.controller.js";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { authorizePermissions } from "../middlewares/authorization.middleware.js";

const router = Router();
router.use(authenticateJwt);

router.get("/:id", getContactoEmergencia);

export default router;