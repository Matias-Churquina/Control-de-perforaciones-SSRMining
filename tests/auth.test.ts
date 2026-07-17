import request from "supertest";
import { app } from "../src/app";

describe("Auth", () => {
  it("inicia sesion con el administrador seed", async () => {
    const response = await request(app).post("/api/v1/auth/login").send({
      email: "admin@ssrmining.local",
      password: "Admin12345!"
    });

    expect(response.status).toBe(200);
    expect(response.body.token).toEqual(expect.any(String));
    expect(response.body.usuario).toMatchObject({
      email: "admin@ssrmining.local",
      rol: "ADMINISTRADOR"
    });
  });

  it("rechaza credenciales invalidas", async () => {
    const response = await request(app).post("/api/v1/auth/login").send({
      email: "admin@ssrmining.local",
      password: "incorrecta"
    });

    expect(response.status).toBe(401);
  });

  it("devuelve el usuario autenticado con token valido", async () => {
    const login = await request(app).post("/api/v1/auth/login").send({
      email: "admin@ssrmining.local",
      password: "Admin12345!"
    });

    const response = await request(app)
      .get("/api/v1/auth/me")
      .set("Authorization", `Bearer ${login.body.token}`);

    expect(response.status).toBe(200);
    expect(response.body.usuario).toMatchObject({
      email: "admin@ssrmining.local",
      rol: "ADMINISTRADOR"
    });
  });

  it("bloquea rutas protegidas sin token", async () => {
    const response = await request(app).get("/api/v1/usuarios");

    expect(response.status).toBe(401);
  });
});

