import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";

export type DashboardFilters = {
  fechaDesde?: Date;
  fechaHasta?: Date;
  estado?: string;
  idEquipo?: number;
  idUsuarioRegistro?: number;
  fase?: string;
  banco?: number;
};

const buildWhere = (filters: DashboardFilters): Prisma.PerforacionWhereInput => ({
  fecha:
    filters.fechaDesde || filters.fechaHasta
      ? {
          gte: filters.fechaDesde,
          lte: filters.fechaHasta
        }
      : undefined,
  estado: filters.estado,
  idEquipo: filters.idEquipo,
  idUsuarioRegistro: filters.idUsuarioRegistro,
  fase: filters.fase,
  banco: filters.banco
});

export const dashboardRepository = {
  getPerforaciones: (filters: DashboardFilters) =>
    prisma.perforacion.findMany({
      where: buildWhere(filters),
      include: {
        equipo: true,
        usuarioRegistro: { include: { rol: true } }
      },
      orderBy: [{ fecha: "desc" }, { fechaCreacion: "desc" }]
    })
};

