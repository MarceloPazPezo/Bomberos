import { Router } from "express";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { authorizePermisos } from "../middlewares/authorization.middleware.js";
import DireccionController from "../controllers/direccion.controller.js";
import { getAllRegiones, getComunaById } from "../controllers/region.controller.js";

const router = Router();
router.use(authenticateJwt);

// Rutas existentes (usando el controlador de región, sin permisos específicos)
router
  .get("/regiones", getAllRegiones)
  .get("/comuna/:id", getComunaById);

// Nuevas rutas para CRUD de direcciones (sin permisos específicos)
router.post("/", DireccionController.createDireccion);
router.get("/:id", DireccionController.getDireccionById);
router.patch("/:id", DireccionController.updateDireccion);
router.delete("/:id", DireccionController.deleteDireccion);
router.get("/search/criterios", DireccionController.searchDirecciones);


export default router;









