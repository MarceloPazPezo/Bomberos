"use strict";
import { Router } from "express";
import {
    getContactoEmergencia,
    createContactoEmergencia,
    deleteContactoEmergencia,
    updateContactoEmergencia,
} from "../controllers/contactoEmergencia.controller.js";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { authorizePermissions } from "../middlewares/authorization.middleware.js";

const router = Router();
router.use(authenticateJwt);

router.get("/:id", authorizePermissions(["usuario:leer_todos"]), getContactoEmergencia);
router.post("/", authorizePermissions(["usuario:leer_todos"]), createContactoEmergencia);
router.delete("/:id", authorizePermissions(["usuario:leer_todos"]), deleteContactoEmergencia);
router.patch("/:id", authorizePermissions(["usuario:leer_todos"]), updateContactoEmergencia);

export default router;