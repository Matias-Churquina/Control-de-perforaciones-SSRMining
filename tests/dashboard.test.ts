import request from "supertest";
import { app } from "../src/app";

const loginAdmin = async () => {
  const response = await request(app).post("/api/v1/auth/login").send({
    email: "admin@ssrmining.local",
    password: "Admin12345!"
  });

  return response.body.token as string;
};

describe("Dashboard", () => {
  it("bloquea resumen sin token", async () => {
    const response = await request(app).get("/api/v1/dashboard/resumen");

    expect(response.status).toBe(401);
  });

  it("devuelve KPIs y datasets con token administrador", async () => {
    const token = await loginAdmin();

    const response = await request(app)
      .get("/api/v1/dashboard/resumen?fechaDesde=2026-07-01&fechaHasta=2026-07-31")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.data.kpis).toEqual({
      metrosTotales: expect.any(Number),
      pozosCompletados: expect.any(Number),
      ropPromedio: expect.any(Number),
      adherenciaDiseno: expect.any(Number)
    });
    expect(response.body.data.graficos).toEqual(
      expect.objectContaining({
        metrosPorRoca: expect.any(Array),
        distribucionTipoPozo: expect.any(Array),
        metrosPorEquipo: expect.any(Array),
        metrosPorFase: expect.any(Array),
        metrosPorBanco: expect.any(Array),
        rankingOperadores: expect.any(Array),
        ropPorRoca: expect.any(Array)
      })
    );
  });

  it("valida filtros del resumen", async () => {
    const token = await loginAdmin();

    const response = await request(app)
      .get("/api/v1/dashboard/resumen?banco=10")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(400);
  });
});

