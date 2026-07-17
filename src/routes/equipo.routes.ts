import { Router } from "express";
import { equipoController } from "../controllers/equipo.controller";
import { ROLES } from "../constants/roles";
import { authMiddleware } from "../middleware/auth.middleware";
import { requireRoles } from "../middleware/roles.middleware";
import { validationMiddleware } from "../middleware/validation.middleware";
import { asyncHandler } from "../utils/asyncHandler";
import {
  changeEstadoEquipoValidator,
  createEquipoValidator,
  idEquipoValidator,
  updateEquipoValidator
} from "../validators/equipo.validator";

export const equipoRouter = Router();

equipoRouter.use(authMiddleware);

equipoRouter.get("/", requireRoles(ROLES.ADMINISTRADOR, ROLES.SUPERVISOR), asyncHandler(equipoController.list));
equipoRouter.get(
  "/:idEquipo",
  requireRoles(ROLES.ADMINISTRADOR, ROLES.SUPERVISOR),
  idEquipoValidator,
  validationMiddleware,
  asyncHandler(equipoController.getById)
);
equipoRouter.post(
  "/",
  requireRoles(ROLES.ADMINISTRADOR),
  createEquipoValidator,
  validationMiddleware,
  asyncHandler(equipoController.create)
);
equipoRouter.put(
  "/:idEquipo",
  requireRoles(ROLES.ADMINISTRADOR),
  updateEquipoValidator,
  validationMiddleware,
  asyncHandler(equipoController.update)
);
equipoRouter.patch(
  "/:idEquipo/estado",
  requireRoles(ROLES.ADMINISTRADOR, ROLES.SUPERVISOR),
  changeEstadoEquipoValidator,
  validationMiddleware,
  asyncHandler(equipoController.changeEstado)
);
equipoRouter.delete(
  "/:idEquipo",
  requireRoles(ROLES.ADMINISTRADOR),
  idEquipoValidator,
  validationMiddleware,
  asyncHandler(equipoController.deactivate)
);
