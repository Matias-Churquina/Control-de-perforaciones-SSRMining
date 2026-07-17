import { Router } from "express";
import { authController } from "../controllers/auth.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { validationMiddleware } from "../middleware/validation.middleware";
import { asyncHandler } from "../utils/asyncHandler";
import { loginValidator } from "../validators/auth.validator";

export const authRouter = Router();

authRouter.post("/login", loginValidator, validationMiddleware, asyncHandler(authController.login));
authRouter.get("/me", authMiddleware, authController.me);
