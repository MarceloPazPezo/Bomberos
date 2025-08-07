"use strict";
import { Router } from "express";
import {
  createLocation,
  getLocation,
  getLocations,
  getNearbyLocations,
  getLocationsInBounds,
  getLocationsInPolygon,
  updateLocation,
  deleteLocation,
  getLocationStats,
} from "../controllers/location.controller.js";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { authorizePermissions } from "../middlewares/authorization.middleware.js";

const router = Router();

router.get("/nearby", getNearbyLocations);
router.get("/bounds", getLocationsInBounds);
router.post("/polygon", getLocationsInPolygon);
router.get("/stats", getLocationStats);
router.get("/:id", getLocation);
router.get("/", getLocations);

router.use(authenticateJwt);
router.post("/", createLocation);
router.put("/:id", updateLocation);
router.delete("/:id", deleteLocation);
router.use(authorizePermissions(["locations:admin"]));

export default router;
