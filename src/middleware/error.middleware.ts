import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/apiError";

export const errorMiddleware = (
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  const statusCode = error instanceof ApiError ? error.statusCode : 500;

  res.status(statusCode).json({
    message: error instanceof ApiError ? error.message : "Error interno del servidor",
    detail: process.env.NODE_ENV === "production" ? undefined : error.message
  });
};
