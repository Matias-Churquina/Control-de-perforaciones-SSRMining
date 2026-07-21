import { Router } from "express";
import { dashboardController } from "../controllers/dashboard.controller";
import { ROLES } from "../constants/roles";
import { authMiddleware } from "../middleware/auth.middleware";
import { requireRoles } from "../middleware/roles.middleware";
import { validationMiddleware } from "../middleware/validation.middleware";
import { asyncHandler } from "../utils/asyncHandler";
import { dashboardResumenValidator } from "../validators/dashboard.validator";

export const dashboardRouter = Router();

dashboardRouter.use(authMiddleware);
dashboardRouter.use(requireRoles(ROLES.ADMINISTRADOR, ROLES.SUPERVISOR));

dashboardRouter.get(
  "/resumen",
  dashboardResumenValidator,
  validationMiddleware,
  asyncHandler(dashboardController.resumen)
);

