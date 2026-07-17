import { body, param } from "express-validator";
import { ESTADOS_EQUIPO_VALUES } from "../constants/estadosEquipo";

export const idEquipoValidator = [
  param("idEquipo").isInt({ min: 1 }).withMessage("idEquipo debe ser numerico")
];

export const createEquipoValidator = [
  body("codigo").trim().isLength({ min: 2, max: 50 }).withMessage("Codigo de equipo invalido"),
  body("descripcion").trim().isLength({ min: 3, max: 150 }).withMessage("Descripcion invalida"),
  body("modelo").optional().trim().isLength({ max: 100 }).withMessage("Modelo demasiado largo"),
  body("estado").optional().isIn(ESTADOS_EQUIPO_VALUES).withMessage("Estado de equipo invalido")
];

export const updateEquipoValidator = [
  ...idEquipoValidator,
  body("codigo").optional().trim().isLength({ min: 2, max: 50 }).withMessage("Codigo de equipo invalido"),
  body("descripcion").optional().trim().isLength({ min: 3, max: 150 }).withMessage("Descripcion invalida"),
  body("modelo").optional().trim().isLength({ max: 100 }).withMessage("Modelo demasiado largo"),
  body("estado").optional().isIn(ESTADOS_EQUIPO_VALUES).withMessage("Estado de equipo invalido")
];

export const changeEstadoEquipoValidator = [
  ...idEquipoValidator,
  body("estado").isIn(ESTADOS_EQUIPO_VALUES).withMessage("Estado de equipo invalido")
];

