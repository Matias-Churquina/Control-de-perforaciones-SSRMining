import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/apiError";

export const requireRoles =
  (...rolesPermitidos: string[]) =>
  (req: Request, _res: Response, next: NextFunction) => {
    if (!req.usuario) {
      throw new ApiError(401, "Usuario no autenticado");
    }

    if (!rolesPermitidos.includes(req.usuario.rol)) {
      throw new ApiError(403, "No tiene permisos para realizar esta accion");
    }

    next();
  };

