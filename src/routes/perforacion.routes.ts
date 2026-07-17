import { Router } from "express";
import { perforacionController } from "../controllers/perforacion.controller";
import { ROLES } from "../constants/roles";
import { authMiddleware } from "../middleware/auth.middleware";
import { requireRoles } from "../middleware/roles.middleware";
import { validationMiddleware } from "../middleware/validation.middleware";
import { asyncHandler } from "../utils/asyncHandler";
import {
  createPerforacionValidator,
  idPerforacionValidator,
  listPerforacionValidator
} from "../validators/perforacion.validator";

export const perforacionRouter = Router();

perforacionRouter.use(authMiddleware);

perforacionRouter.get("/", listPerforacionValidator, validationMiddleware, asyncHandler(perforacionController.list));
perforacionRouter.get(
  "/:idPerforacion",
  idPerforacionValidator,
  validationMiddleware,
  asyncHandler(perforacionController.getById)
);
perforacionRouter.post(
  "/",
  requireRoles(ROLES.ADMINISTRADOR, ROLES.SUPERVISOR, ROLES.OPERADOR),
  createPerforacionValidator,
  validationMiddleware,
  asyncHandler(perforacionController.create)
);
