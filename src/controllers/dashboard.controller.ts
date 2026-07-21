import { Request, Response } from "express";
import { dashboardService } from "../services/dashboard.service";

export const dashboardController = {
  resumen: async (req: Request, res: Response) => {
    const resumen = await dashboardService.getResumen(req.query);
    res.status(200).json({ data: resumen });
  }
};

