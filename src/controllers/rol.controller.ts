import { Request, Response } from "express";
import { rolService } from "../services/rol.service";

export const rolController = {
  list: async (_req: Request, res: Response) => {
    const roles = await rolService.list();
    res.status(200).json({ data: roles });
  },

  getById: async (req: Request, res: Response) => {
    const rol = await rolService.getById(Number(req.params.idRol));
    res.status(200).json({ data: rol });
  },

  create: async (req: Request, res: Response) => {
    const rol = await rolService.create(req.body);
    res.status(201).json({ data: rol });
  },

  update: async (req: Request, res: Response) => {
    const rol = await rolService.update(Number(req.params.idRol), req.body);
    res.status(200).json({ data: rol });
  },

  deactivate: async (req: Request, res: Response) => {
    const rol = await rolService.deactivate(Number(req.params.idRol));
    res.status(200).json({ data: rol });
  }
};
