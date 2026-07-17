import { body, param } from "express-validator";

export const idRolValidator = [
  param("idRol").isInt({ min: 1 }).withMessage("idRol debe ser numerico")
];

export const createRolValidator = [
  body("nombre").trim().isLength({ min: 3, max: 50 }).withMessage("Nombre de rol invalido"),
  body("descripcion").optional().trim().isLength({ max: 255 }).withMessage("Descripcion demasiado larga")
];

export const updateRolValidator = [
  ...idRolValidator,
  body("nombre").optional().trim().isLength({ min: 3, max: 50 }).withMessage("Nombre de rol invalido"),
  body("descripcion").optional().trim().isLength({ max: 255 }).withMessage("Descripcion demasiado larga"),
  body("activo").optional().isBoolean().withMessage("activo debe ser booleano")
];

