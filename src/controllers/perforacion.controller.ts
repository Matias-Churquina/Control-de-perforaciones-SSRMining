import { Request, Response } from "express";
import { perforacionService } from "../services/perforacion.service";

export const perforacionController = {
  list: async (req: Request, res: Response) => {
    const perforaciones = await perforacionService.list(req.query, req.usuario!);
    res.status(200).json({ data: perforaciones });
  },

  getById: async (req: Request, res: Response) => {
    const perforacion = await perforacionService.getById(Number(req.params.idPerforacion), req.usuario!);
    res.status(200).json({ data: perforacion });
  },

  create: async (req: Request, res: Response) => {
    const perforacion = await perforacionService.create(req.body, req.usuario!);
    res.status(201).json({ data: perforacion });
  }
};

