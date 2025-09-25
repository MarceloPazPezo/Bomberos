import { Router } from "express";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import {getRegiones,getComunas } from "../controllers/direccion.controller.js";



const router = Router();
router.use(authenticateJwt);

router
  .get("/regiones", getRegiones)
  .get("/comuna/:id", getComunas)


export default router;









