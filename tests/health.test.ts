import request from "supertest";
import { app } from "../src/app";

describe("GET /health", () => {
  it("responde con el estado del servicio", async () => {
    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: "ok",
      service: "SSRMining API"
    });
  });
});
