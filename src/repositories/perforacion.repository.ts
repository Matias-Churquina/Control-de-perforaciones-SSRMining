import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";

export type PerforacionFilters = {
  fechaDesde?: Date;
  fechaHasta?: Date;
  estado?: string;
  idEquipo?: number;
  idUsuarioRegistro?: number;
  fase?: string;
  banco?: number;
};

const buildWhere = (filters: PerforacionFilters): Prisma.PerforacionWhereInput => ({
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

export const perforacionRepository = {
  list: (filters: PerforacionFilters) =>
    prisma.perforacion.findMany({
      where: buildWhere(filters),
      include: {
        equipo: true,
        usuarioRegistro: { include: { rol: true } },
        supervisorRevision: { include: { rol: true } }
      },
      orderBy: [{ fecha: "desc" }, { fechaCreacion: "desc" }]
    }),

  findById: (idPerforacion: number) =>
    prisma.perforacion.findUnique({
      where: { idPerforacion },
      include: {
        equipo: true,
        usuarioRegistro: { include: { rol: true } },
        supervisorRevision: { include: { rol: true } }
      }
    }),

  findByCodigo: (codigoPerforacion: string) =>
    prisma.perforacion.findUnique({
      where: { codigoPerforacion }
    }),

  create: (data: Prisma.PerforacionUncheckedCreateInput) =>
    prisma.perforacion.create({
      data,
      include: {
        equipo: true,
        usuarioRegistro: { include: { rol: true } },
        supervisorRevision: { include: { rol: true } }
      }
    }),

  update: (idPerforacion: number, data: Prisma.PerforacionUncheckedUpdateInput) =>
    prisma.perforacion.update({
      where: { idPerforacion },
      data,
      include: {
        equipo: true,
        usuarioRegistro: { include: { rol: true } },
        supervisorRevision: { include: { rol: true } }
      }
    })
};
