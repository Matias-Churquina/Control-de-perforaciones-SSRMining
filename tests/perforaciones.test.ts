import request from "supertest";
import { app } from "../src/app";

const loginAdmin = async () => {
  const response = await request(app).post("/api/v1/auth/login").send({
    email: "admin@ssrmining.local",
    password: "Admin12345!"
  });

  return response.body.token as string;
};

const getEquipoActivo = async (token: string) => {
  const response = await request(app)
    .get("/api/v1/equipos")
    .set("Authorization", `Bearer ${token}`);

  return response.body.data.find((equipo: { estado: string }) => equipo.estado === "ACTIVO");
};

const createPerforacion = async (token: string) => {
  const equipo = await getEquipoActivo(token);
  const unique = Date.now();

  return request(app)
    .post("/api/v1/perforaciones")
    .set("Authorization", `Bearer ${token}`)
    .send({
      codigoPerforacion: `PERF-${unique}`,
      fecha: "2026-07-17",
      fase: "Fase 7",
      banco: 4110,
      malla: "04",
      idPozo: `P-${unique}`,
      tipoRoca: "Toba (Blanda)",
      profundidadDiseno: 10,
      metrosPerforados: 10,
      profundidadReal: 10,
      horaInicio: "08:00",
      horaFin: "08:20",
      tipoPozo: "Produccion",
      observaciones: "Registro generado por prueba automatizada",
      idEquipo: equipo.idEquipo
    });
};

describe("Perforaciones", () => {
  it("bloquea listado de perforaciones sin token", async () => {
    const response = await request(app).get("/api/v1/perforaciones");

    expect(response.status).toBe(401);
  });

  it("crea una perforacion valida en estado pendiente", async () => {
    const token = await loginAdmin();
    const response = await createPerforacion(token);

    expect(response.status).toBe(201);
    expect(response.body.data.estado).toBe("PENDIENTE");
    expect(response.body.data.calculos.rop).toBeGreaterThan(0);
  });

  it("rechaza una perforacion fuera del rango de profundidad del equipo", async () => {
    const token = await loginAdmin();
    const equipo = await getEquipoActivo(token);
    const unique = Date.now();

    const response = await request(app)
      .post("/api/v1/perforaciones")
      .set("Authorization", `Bearer ${token}`)
      .send({
        codigoPerforacion: `PERF-INVALID-${unique}`,
        fecha: "2026-07-17",
        fase: "Fase 7",
        banco: 4110,
        malla: "04",
        idPozo: `PI-${unique}`,
        tipoRoca: "Toba (Blanda)",
        profundidadDiseno: 30,
        metrosPerforados: 30,
        profundidadReal: 30,
        horaInicio: "08:00",
        horaFin: "08:20",
        tipoPozo: "Produccion",
        idEquipo: equipo.idEquipo
      });

    expect(response.status).toBe(400);
  });

  it("lista perforaciones con filtros", async () => {
    const token = await loginAdmin();

    const response = await request(app)
      .get("/api/v1/perforaciones?estado=PENDIENTE&fechaDesde=2026-07-01&fechaHasta=2026-07-31")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  it("actualiza una perforacion pendiente", async () => {
    const token = await loginAdmin();
    const created = await createPerforacion(token);

    const response = await request(app)
      .put(`/api/v1/perforaciones/${created.body.data.idPerforacion}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        metrosPerforados: 9.8,
        profundidadReal: 9.9,
        observaciones: "Ajuste de prueba"
      });

    expect(response.status).toBe(200);
    expect(Number(response.body.data.metrosPerforados)).toBe(9.8);
    expect(response.body.data.observaciones).toBe("Ajuste de prueba");
  });

  it("anula una perforacion pendiente con motivo", async () => {
    const token = await loginAdmin();
    const created = await createPerforacion(token);

    const response = await request(app)
      .delete(`/api/v1/perforaciones/${created.body.data.idPerforacion}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        motivoRechazo: "Anulacion solicitada por prueba automatizada"
      });

    expect(response.status).toBe(200);
    expect(response.body.data.estado).toBe("RECHAZADA");
    expect(response.body.data.motivoRechazo).toBe("Anulacion solicitada por prueba automatizada");
  });
});
