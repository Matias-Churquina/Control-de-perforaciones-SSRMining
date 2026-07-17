import request from "supertest";
import { app } from "../src/app";

const loginAdmin = async () => {
  const response = await request(app).post("/api/v1/auth/login").send({
    email: "admin@ssrmining.local",
    password: "Admin12345!"
  });

  return response.body.token as string;
};

describe("Usuarios y roles", () => {
  it("lista roles con token administrador", async () => {
    const token = await loginAdmin();

    const response = await request(app)
      .get("/api/v1/roles")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.data.length).toBeGreaterThanOrEqual(3);
  });

  it("lista usuarios con token administrador", async () => {
    const token = await loginAdmin();

    const response = await request(app)
      .get("/api/v1/usuarios")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.data.length).toBeGreaterThanOrEqual(1);
  });

  it("crea y desactiva un usuario operativo", async () => {
    const token = await loginAdmin();
    const rolesResponse = await request(app)
      .get("/api/v1/roles")
      .set("Authorization", `Bearer ${token}`);

    const operador = rolesResponse.body.data.find((rol: { nombre: string }) => rol.nombre === "OPERADOR");
    const unique = Date.now();

    const createResponse = await request(app)
      .post("/api/v1/usuarios")
      .set("Authorization", `Bearer ${token}`)
      .send({
        idRol: operador.idRol,
        legajo: `TEST-${unique}`,
        nombre: "Usuario",
        apellido: "Prueba",
        email: `usuario.prueba.${unique}@ssrmining.local`,
        password: "Usuario12345!"
      });

    expect(createResponse.status).toBe(201);
    expect(createResponse.body.data.activo).toBe(true);

    const deactivateResponse = await request(app)
      .delete(`/api/v1/usuarios/${createResponse.body.data.idUsuario}`)
      .set("Authorization", `Bearer ${token}`);

    expect(deactivateResponse.status).toBe(200);
    expect(deactivateResponse.body.data.activo).toBe(false);
  });
});

