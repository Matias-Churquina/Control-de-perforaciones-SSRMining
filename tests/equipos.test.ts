import request from "supertest";
import { app } from "../src/app";

const loginAdmin = async () => {
  const response = await request(app).post("/api/v1/auth/login").send({
    email: "admin@ssrmining.local",
    password: "Admin12345!"
  });

  return response.body.token as string;
};

describe("Equipos", () => {
  it("bloquea listado de equipos sin token", async () => {
    const response = await request(app).get("/api/v1/equipos");

    expect(response.status).toBe(401);
  });

  it("lista equipos con token administrador", async () => {
    const token = await loginAdmin();

    const response = await request(app)
      .get("/api/v1/equipos")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.data.length).toBeGreaterThanOrEqual(3);
  });

  it("crea, cambia estado y desactiva un equipo", async () => {
    const token = await loginAdmin();
    const unique = Date.now();

    const createResponse = await request(app)
      .post("/api/v1/equipos")
      .set("Authorization", `Bearer ${token}`)
      .send({
        codigo: `TEST ${unique}`,
        descripcion: "Equipo de prueba automatizada",
        modelo: "Modelo QA"
      });

    expect(createResponse.status).toBe(201);
    expect(createResponse.body.data.estado).toBe("ACTIVO");

    const estadoResponse = await request(app)
      .patch(`/api/v1/equipos/${createResponse.body.data.idEquipo}/estado`)
      .set("Authorization", `Bearer ${token}`)
      .send({ estado: "MANTENIMIENTO" });

    expect(estadoResponse.status).toBe(200);
    expect(estadoResponse.body.data.estado).toBe("MANTENIMIENTO");

    const deleteResponse = await request(app)
      .delete(`/api/v1/equipos/${createResponse.body.data.idEquipo}`)
      .set("Authorization", `Bearer ${token}`);

    expect(deleteResponse.status).toBe(200);
    expect(deleteResponse.body.data.estado).toBe("INACTIVO");
  });
});

