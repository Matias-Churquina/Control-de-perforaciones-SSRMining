import { Router } from "express";

export const usuarioRouter = Router();

usuarioRouter.get("/", (_req, res) => {
  res.status(501).json({ message: "Listado de usuarios pendiente de implementar" });
});
