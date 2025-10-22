import { Router } from "express";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import {getRegiones,getComunas, getDireccion } from "../controllers/direccion.controller.js";
import { authorizePermisos } from "../middlewares/authorization.middleware.js";
import DireccionController from "../controllers/direccion.controller.js";
import { getAllRegiones, getComunaById } from "../controllers/region.controller.js";

const router = Router();
router.use(authenticateJwt);

// Rutas existentes (usando el controlador de región, sin permisos específicos)
router
  .get("/:id", getDireccion)
  .get("/regiones", getAllRegiones)
  .get("/comuna/:id", getComunaById);

router.post("/", DireccionController.createDireccion);
router.get("/:id", DireccionController.getDireccionById);
router.patch("/:id", DireccionController.updateDireccion);
router.delete("/:id", DireccionController.deleteDireccion);
router.get("/search/criterios", DireccionController.searchDirecciones);


export default router;









