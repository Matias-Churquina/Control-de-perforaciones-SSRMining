import { body, param, query } from "express-validator";

export const idPerforacionValidator = [
  param("idPerforacion").isInt({ min: 1 }).withMessage("idPerforacion debe ser numerico")
];

export const listPerforacionValidator = [
  query("fechaDesde").optional().isISO8601().withMessage("fechaDesde invalida"),
  query("fechaHasta").optional().isISO8601().withMessage("fechaHasta invalida"),
  query("estado").optional().isIn(["PENDIENTE", "APROBADA", "RECHAZADA"]).withMessage("Estado invalido"),
  query("idEquipo").optional().isInt({ min: 1 }).withMessage("idEquipo invalido"),
  query("idUsuarioRegistro").optional().isInt({ min: 1 }).withMessage("idUsuarioRegistro invalido"),
  query("banco").optional().isInt({ min: 2500, max: 5000 }).withMessage("Banco invalido")
];

export const createPerforacionValidator = [
  body("codigoPerforacion").optional().trim().isLength({ min: 3, max: 50 }).withMessage("Codigo invalido"),
  body("fecha").isISO8601().withMessage("Fecha invalida"),
  body("fase").trim().isLength({ min: 3, max: 50 }).withMessage("Fase invalida"),
  body("banco").isInt({ min: 2500, max: 5000 }).withMessage("Banco invalido"),
  body("malla").trim().isLength({ min: 1, max: 50 }).withMessage("Malla invalida"),
  body("idPozo").trim().isLength({ min: 1, max: 50 }).withMessage("Pozo invalido"),
  body("tipoRoca").trim().isLength({ min: 3, max: 50 }).withMessage("Tipo de roca invalido"),
  body("profundidadDiseno").isFloat({ min: 1 }).withMessage("Profundidad de diseno invalida"),
  body("metrosPerforados").isFloat({ min: 1 }).withMessage("Metros perforados invalidos"),
  body("profundidadReal").isFloat({ min: 1 }).withMessage("Profundidad real invalida"),
  body("horaInicio").matches(/^([01]\d|2[0-3]):[0-5]\d$/).withMessage("Hora inicio invalida"),
  body("horaFin").matches(/^([01]\d|2[0-3]):[0-5]\d$/).withMessage("Hora fin invalida"),
  body("tipoPozo").trim().isLength({ min: 3, max: 50 }).withMessage("Tipo de pozo invalido"),
  body("observaciones").optional().trim().isLength({ max: 4000 }).withMessage("Observaciones demasiado largas"),
  body("idEquipo").isInt({ min: 1 }).withMessage("idEquipo invalido")
];

export const updatePerforacionValidator = [
  ...idPerforacionValidator,
  body("codigoPerforacion").optional().trim().isLength({ min: 3, max: 50 }).withMessage("Codigo invalido"),
  body("fecha").optional().isISO8601().withMessage("Fecha invalida"),
  body("fase").optional().trim().isLength({ min: 3, max: 50 }).withMessage("Fase invalida"),
  body("banco").optional().isInt({ min: 2500, max: 5000 }).withMessage("Banco invalido"),
  body("malla").optional().trim().isLength({ min: 1, max: 50 }).withMessage("Malla invalida"),
  body("idPozo").optional().trim().isLength({ min: 1, max: 50 }).withMessage("Pozo invalido"),
  body("tipoRoca").optional().trim().isLength({ min: 3, max: 50 }).withMessage("Tipo de roca invalido"),
  body("profundidadDiseno").optional().isFloat({ min: 1 }).withMessage("Profundidad de diseno invalida"),
  body("metrosPerforados").optional().isFloat({ min: 1 }).withMessage("Metros perforados invalidos"),
  body("profundidadReal").optional().isFloat({ min: 1 }).withMessage("Profundidad real invalida"),
  body("horaInicio").optional().matches(/^([01]\d|2[0-3]):[0-5]\d$/).withMessage("Hora inicio invalida"),
  body("horaFin").optional().matches(/^([01]\d|2[0-3]):[0-5]\d$/).withMessage("Hora fin invalida"),
  body("tipoPozo").optional().trim().isLength({ min: 3, max: 50 }).withMessage("Tipo de pozo invalido"),
  body("observaciones").optional().trim().isLength({ max: 4000 }).withMessage("Observaciones demasiado largas"),
  body("idEquipo").optional().isInt({ min: 1 }).withMessage("idEquipo invalido")
];

export const cancelPerforacionValidator = [
  ...idPerforacionValidator,
  body("motivoRechazo").trim().isLength({ min: 5, max: 255 }).withMessage("Motivo de anulacion invalido")
];
