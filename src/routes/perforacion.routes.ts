import { Router } from "express";

export const perforacionRouter = Router();

perforacionRouter.get("/", (_req, res) => {
  res.status(501).json({ message: "Listado de perforaciones pendiente de implementar" });
});
