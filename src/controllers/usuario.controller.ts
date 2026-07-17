import { Request, Response } from "express";
import { usuarioService } from "../services/usuario.service";

export const usuarioController = {
  list: async (_req: Request, res: Response) => {
    const usuarios = await usuarioService.list();
    res.status(200).json({ data: usuarios });
  },

  getById: async (req: Request, res: Response) => {
    const usuario = await usuarioService.getById(Number(req.params.idUsuario));
    res.status(200).json({ data: usuario });
  },

  create: async (req: Request, res: Response) => {
    const usuario = await usuarioService.create(req.body);
    res.status(201).json({ data: usuario });
  },

  update: async (req: Request, res: Response) => {
    const usuario = await usuarioService.update(Number(req.params.idUsuario), req.body);
    res.status(200).json({ data: usuario });
  },

  deactivate: async (req: Request, res: Response) => {
    const usuario = await usuarioService.deactivate(Number(req.params.idUsuario), req.usuario!.idUsuario);
    res.status(200).json({ data: usuario });
  }
};
