import { Router } from "express";

export const equipoRouter = Router();

equipoRouter.get("/", (_req, res) => {
  res.status(501).json({ message: "Listado de equipos pendiente de implementar" });
});
