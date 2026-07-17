import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import { ApiError } from "../utils/apiError";

export const validationMiddleware = (req: Request, _res: Response, next: NextFunction) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    throw new ApiError(400, errors.array().map((error) => error.msg).join("; "));
  }

  next();
};

