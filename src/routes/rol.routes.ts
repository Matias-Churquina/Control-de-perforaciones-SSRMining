import { Router } from "express";

export const rolRouter = Router();

rolRouter.get("/", (_req, res) => {
  res.status(501).json({ message: "Listado de roles pendiente de implementar" });
});
