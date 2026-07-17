import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";

export const usuarioRepository = {
  findByEmail: (email: string) =>
    prisma.usuario.findUnique({
      where: { email },
      include: { rol: true }
    }),

  findById: (idUsuario: number) =>
    prisma.usuario.findUnique({
      where: { idUsuario },
      include: { rol: true }
    }),

  findByLegajo: (legajo: string) =>
    prisma.usuario.findUnique({
      where: { legajo },
      include: { rol: true }
    }),

  countActiveByRoleName: (nombreRol: string) =>
    prisma.usuario.count({
      where: {
        activo: true,
        rol: { nombre: nombreRol }
      }
    }),

  list: () =>
    prisma.usuario.findMany({
      include: { rol: true },
      orderBy: [{ activo: "desc" }, { apellido: "asc" }, { nombre: "asc" }]
    }),

  create: (data: Prisma.UsuarioUncheckedCreateInput) => prisma.usuario.create({ data, include: { rol: true } }),

  update: (idUsuario: number, data: Prisma.UsuarioUncheckedUpdateInput) =>
    prisma.usuario.update({
      where: { idUsuario },
      data,
      include: { rol: true }
    })
};
