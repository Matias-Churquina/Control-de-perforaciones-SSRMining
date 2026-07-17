import { rolRepository } from "../repositories/rol.repository";
import { ApiError } from "../utils/apiError";

export const rolService = {
  list: () => rolRepository.list(),

  getById: async (idRol: number) => {
    const rol = await rolRepository.findById(idRol);

    if (!rol) {
      throw new ApiError(404, "Rol no encontrado");
    }

    return rol;
  },

  create: async (input: { nombre: string; descripcion?: string }) => {
    const nombre = input.nombre.trim().toUpperCase();

    if (await rolRepository.findByNombre(nombre)) {
      throw new ApiError(409, "Ya existe un rol con ese nombre");
    }

    return rolRepository.create({
      nombre,
      descripcion: input.descripcion
    });
  },

  update: async (idRol: number, input: { nombre?: string; descripcion?: string; activo?: boolean }) => {
    await rolService.getById(idRol);

    const nombre = input.nombre?.trim().toUpperCase();

    if (nombre) {
      const existente = await rolRepository.findByNombre(nombre);
      if (existente && existente.idRol !== idRol) {
        throw new ApiError(409, "Ya existe un rol con ese nombre");
      }
    }

    return rolRepository.update(idRol, {
      nombre,
      descripcion: input.descripcion,
      activo: input.activo
    });
  },

  deactivate: async (idRol: number) => {
    await rolService.getById(idRol);
    return rolRepository.update(idRol, { activo: false });
  }
};
