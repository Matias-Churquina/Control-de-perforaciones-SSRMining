import { Router } from "express";
import { rolController } from "../controllers/rol.controller";
import { ROLES } from "../constants/roles";
import { authMiddleware } from "../middleware/auth.middleware";
import { requireRoles } from "../middleware/roles.middleware";
import { validationMiddleware } from "../middleware/validation.middleware";
import { asyncHandler } from "../utils/asyncHandler";
import { createRolValidator, idRolValidator, updateRolValidator } from "../validators/rol.validator";

export const rolRouter = Router();

rolRouter.use(authMiddleware);
rolRouter.use(requireRoles(ROLES.ADMINISTRADOR));

rolRouter.get("/", asyncHandler(rolController.list));
rolRouter.get("/:idRol", idRolValidator, validationMiddleware, asyncHandler(rolController.getById));
rolRouter.post("/", createRolValidator, validationMiddleware, asyncHandler(rolController.create));
rolRouter.put("/:idRol", updateRolValidator, validationMiddleware, asyncHandler(rolController.update));
rolRouter.delete("/:idRol", idRolValidator, validationMiddleware, asyncHandler(rolController.deactivate));
