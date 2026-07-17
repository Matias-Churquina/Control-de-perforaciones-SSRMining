import { Request, Response } from "express";
import { authService } from "../services/auth.service";

export const authController = {
  login: async (req: Request, res: Response) => {
    const result = await authService.login(req.body.email, req.body.password);
    res.status(200).json(result);
  },

  me: (req: Request, res: Response) => {
    res.status(200).json({ usuario: req.usuario });
  }
};

