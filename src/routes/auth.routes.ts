import { Router } from "express";

export const authRouter = Router();

authRouter.post("/login", (_req, res) => {
  res.status(501).json({ message: "Login pendiente de implementar" });
});
