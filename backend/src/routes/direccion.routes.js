import { Router } from "express";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { authorizePermisos } from "../middlewares/authorization.middleware.js";
import {
    createDireccion,
    deleteDireccion,
    getDireccion,
    searchDirecciones,
    updateDireccion
} from "../controllers/direccion.controller.js";
import { getRegiones, getComuna } from "../controllers/region.controller.js";

const router = Router();
router.use(authenticateJwt);

router.get("/regiones", getRegiones);
router.get("/comuna/:id", getComuna);
router.post("/", createDireccion);
router.get("/:id", getDireccion);
router.patch("/:id", updateDireccion);
router.delete("/:id", deleteDireccion);
router.get("/search/criterios", searchDirecciones);

export default router;