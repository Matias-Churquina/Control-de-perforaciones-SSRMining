import { Router } from "express";
import { usuarioController } from "../controllers/usuario.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { requireRoles } from "../middleware/roles.middleware";
import { validationMiddleware } from "../middleware/validation.middleware";
import { ROLES } from "../constants/roles";
import { asyncHandler } from "../utils/asyncHandler";
import {
  createUsuarioValidator,
  idUsuarioValidator,
  updateUsuarioValidator
} from "../validators/usuario.validator";

export const usuarioRouter = Router();

usuarioRouter.use(authMiddleware);
usuarioRouter.use(requireRoles(ROLES.ADMINISTRADOR));

usuarioRouter.get("/", asyncHandler(usuarioController.list));
usuarioRouter.get("/:idUsuario", idUsuarioValidator, validationMiddleware, asyncHandler(usuarioController.getById));
usuarioRouter.post("/", createUsuarioValidator, validationMiddleware, asyncHandler(usuarioController.create));
usuarioRouter.put("/:idUsuario", updateUsuarioValidator, validationMiddleware, asyncHandler(usuarioController.update));
usuarioRouter.delete("/:idUsuario", idUsuarioValidator, validationMiddleware, asyncHandler(usuarioController.deactivate));
