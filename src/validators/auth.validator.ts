import { body } from "express-validator";

export const loginValidator = [
  body("email").isEmail().withMessage("Email invalido").normalizeEmail(),
  body("password").isString().notEmpty().withMessage("Password requerido")
];

