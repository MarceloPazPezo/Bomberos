import { Router } from "express";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { authorizePermisos } from "../middlewares/authorization.middleware.js";
import DireccionController from "../controllers/direccion.controller.js";
import { getAllRegiones, getComunaById } from "../controllers/region.controller.js";

const router = Router();
router.use(authenticateJwt);

// Rutas para regiones y comunas
router.get("/regiones", getAllRegiones);
router.get("/comuna/:id", getComunaById);

// Rutas para direcciones
router.post("/", DireccionController.createDireccion);
router.get("/:id", DireccionController.getDireccionById);
router.patch("/:id", DireccionController.updateDireccion);
router.delete("/:id", DireccionController.deleteDireccion);
router.get("/search/criterios", DireccionController.searchDirecciones);


export default router;









