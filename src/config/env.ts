import dotenv from "dotenv";

dotenv.config();

const parseCorsOrigins = (value?: string) =>
  (value ?? "http://localhost:4200")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 3000),
  jwtSecret: process.env.JWT_SECRET ?? "development-secret",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "8h",
  corsOrigins: parseCorsOrigins(process.env.CORS_ORIGIN)
};
