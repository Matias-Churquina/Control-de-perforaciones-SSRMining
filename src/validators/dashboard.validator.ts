import { query } from "express-validator";

export const dashboardResumenValidator = [
  query("fechaDesde").optional().isISO8601().withMessage("fechaDesde invalida"),
  query("fechaHasta").optional().isISO8601().withMessage("fechaHasta invalida"),
  query("estado").optional().isIn(["PENDIENTE", "APROBADA", "RECHAZADA"]).withMessage("Estado invalido"),
  query("idEquipo").optional().isInt({ min: 1 }).withMessage("idEquipo invalido"),
  query("idUsuarioRegistro").optional().isInt({ min: 1 }).withMessage("idUsuarioRegistro invalido"),
  query("fase").optional().trim().isLength({ min: 3, max: 50 }).withMessage("Fase invalida"),
  query("banco").optional().isInt({ min: 2500, max: 5000 }).withMessage("Banco invalido")
];

