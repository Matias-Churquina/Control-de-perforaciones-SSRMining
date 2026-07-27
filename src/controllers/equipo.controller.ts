import { Request, Response } from "express";
import { equipoService } from "../services/equipo.service";

export const equipoController = {
  list: async (_req: Request, res: Response) => {
    const equipos = await equipoService.list();
    res.status(200).json({ data: equipos });
  },

  options: async (_req: Request, res: Response) => {
    const equipos = await equipoService.listActiveOptions();
    res.status(200).json({ data: equipos });
  },

  getById: async (req: Request, res: Response) => {
    const equipo = await equipoService.getById(Number(req.params.idEquipo));
    res.status(200).json({ data: equipo });
  },

  create: async (req: Request, res: Response) => {
    const equipo = await equipoService.create(req.body);
    res.status(201).json({ data: equipo });
  },

  update: async (req: Request, res: Response) => {
    const equipo = await equipoService.update(Number(req.params.idEquipo), req.body);
    res.status(200).json({ data: equipo });
  },

  changeEstado: async (req: Request, res: Response) => {
    const equipo = await equipoService.changeEstado(Number(req.params.idEquipo), req.body.estado);
    res.status(200).json({ data: equipo });
  },

  deactivate: async (req: Request, res: Response) => {
    const equipo = await equipoService.deactivate(Number(req.params.idEquipo));
    res.status(200).json({ data: equipo });
  }
};

