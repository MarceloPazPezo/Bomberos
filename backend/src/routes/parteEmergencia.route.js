import { Router } from "express";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { authorizePermissions } from "../middlewares/authorization.middleware.js";
import { paso1SaveParteEmergencia, paso2UpdateParteEmergencia } from "../controllers/parteEmergencia.controller.js";


const router = Router();
router.use(authenticateJwt);

router
    .post("/paso1",authorizePermissions(["usuario:leer_todos"]), paso1SaveParteEmergencia)
    .post("/paso2",authorizePermissions(["usuario:leer_todos"]), paso2UpdateParteEmergencia);


export default router;
