import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/apiError";
import { verifyToken } from "../utils/jwt";

export const authMiddleware = (req: Request, _res: Response, next: NextFunction) => {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    throw new ApiError(401, "Token de autenticacion requerido");
  }

  const token = header.replace("Bearer ", "").trim();

  try {
    req.usuario = verifyToken(token);
    next();
  } catch {
    throw new ApiError(401, "Token invalido o expirado");
  }
};

