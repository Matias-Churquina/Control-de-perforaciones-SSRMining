import { body, param } from "express-validator";

export const idUsuarioValidator = [
  param("idUsuario").isInt({ min: 1 }).withMessage("idUsuario debe ser numerico")
];

export const createUsuarioValidator = [
  body("idRol").isInt({ min: 1 }).withMessage("idRol requerido"),
  body("legajo").trim().isLength({ min: 2, max: 50 }).withMessage("Legajo invalido"),
  body("nombre").trim().isLength({ min: 2, max: 100 }).withMessage("Nombre invalido"),
  body("apellido").trim().isLength({ min: 2, max: 100 }).withMessage("Apellido invalido"),
  body("email").isEmail().withMessage("Email invalido").normalizeEmail(),
  body("password").isLength({ min: 8 }).withMessage("Password debe tener al menos 8 caracteres")
];

export const updateUsuarioValidator = [
  ...idUsuarioValidator,
  body("idRol").optional().isInt({ min: 1 }).withMessage("idRol invalido"),
  body("legajo").optional().trim().isLength({ min: 2, max: 50 }).withMessage("Legajo invalido"),
  body("nombre").optional().trim().isLength({ min: 2, max: 100 }).withMessage("Nombre invalido"),
  body("apellido").optional().trim().isLength({ min: 2, max: 100 }).withMessage("Apellido invalido"),
  body("email").optional().isEmail().withMessage("Email invalido").normalizeEmail(),
  body("password").optional().isLength({ min: 8 }).withMessage("Password debe tener al menos 8 caracteres"),
  body("activo").optional().isBoolean().withMessage("activo debe ser booleano")
];

