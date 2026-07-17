import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";

export const equipoRepository = {
  list: () =>
    prisma.equipo.findMany({
      orderBy: [{ estado: "asc" }, { codigo: "asc" }]
    }),

  findById: (idEquipo: number) => prisma.equipo.findUnique({ where: { idEquipo } }),

  findByCodigo: (codigo: string) => prisma.equipo.findUnique({ where: { codigo } }),

  create: (data: Prisma.EquipoCreateInput) => prisma.equipo.create({ data }),

  update: (idEquipo: number, data: Prisma.EquipoUpdateInput) =>
    prisma.equipo.update({
      where: { idEquipo },
      data
    })
};

