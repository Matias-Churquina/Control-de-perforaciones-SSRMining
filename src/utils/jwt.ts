import jwt, { SignOptions } from "jsonwebtoken";
import { env } from "../config/env";

export type JwtPayload = {
  idUsuario: number;
  legajo: string;
  email: string;
  rol: string;
};

export const signToken = (payload: JwtPayload) => {
  const options: SignOptions = {
    expiresIn: env.jwtExpiresIn as SignOptions["expiresIn"]
  };

  return jwt.sign(payload, env.jwtSecret, options);
};

export const verifyToken = (token: string) => jwt.verify(token, env.jwtSecret) as JwtPayload;

