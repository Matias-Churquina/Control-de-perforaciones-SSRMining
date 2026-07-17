import { prisma } from "../config/prisma";

export const rolRepository = {
  list: () =>
    prisma.rol.findMany({
      orderBy: { nombre: "asc" }
    }),

  findById: (idRol: number) => prisma.rol.findUnique({ where: { idRol } }),

  findByNombre: (nombre: string) => prisma.rol.findUnique({ where: { nombre } }),

  create: (data: { nombre: string; descripcion?: string }) => prisma.rol.create({ data }),

  update: (idRol: number, data: { nombre?: string; descripcion?: string; activo?: boolean }) =>
    prisma.rol.update({
      where: { idRol },
      data
    })
};
