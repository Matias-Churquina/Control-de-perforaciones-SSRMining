import { usuarioRepository } from "../repositories/usuario.repository";
import { rolRepository } from "../repositories/rol.repository";
import { ApiError } from "../utils/apiError";
import { hashPassword } from "../utils/password";

type CreateUsuarioInput = {
  idRol: number;
  legajo: string;
  nombre: string;
  apellido: string;
  email: string;
  password: string;
};

type UpdateUsuarioInput = Partial<Omit<CreateUsuarioInput, "password">> & {
  password?: string;
  activo?: boolean;
};

const sanitizeUsuario = (usuario: Awaited<ReturnType<typeof usuarioRepository.findById>>) => {
  if (!usuario) return null;

  return {
    idUsuario: usuario.idUsuario,
    idRol: usuario.idRol,
    legajo: usuario.legajo,
    nombre: usuario.nombre,
    apellido: usuario.apellido,
    email: usuario.email,
    activo: usuario.activo,
    fechaAlta: usuario.fechaAlta,
    ultimoAcceso: usuario.ultimoAcceso,
    rol: usuario.rol
  };
};

export const usuarioService = {
  list: async () => {
    const usuarios = await usuarioRepository.list();
    return usuarios.map(sanitizeUsuario);
  },

  getById: async (idUsuario: number) => {
    const usuario = await usuarioRepository.findById(idUsuario);

    if (!usuario) {
      throw new ApiError(404, "Usuario no encontrado");
    }

    return sanitizeUsuario(usuario);
  },

  create: async (input: CreateUsuarioInput) => {
    const rol = await rolRepository.findById(input.idRol);

    if (!rol || !rol.activo) {
      throw new ApiError(400, "Rol inexistente o inactivo");
    }

    if (await usuarioRepository.findByEmail(input.email)) {
      throw new ApiError(409, "Ya existe un usuario con ese email");
    }

    if (await usuarioRepository.findByLegajo(input.legajo)) {
      throw new ApiError(409, "Ya existe un usuario con ese legajo");
    }

    const usuario = await usuarioRepository.create({
      idRol: input.idRol,
      legajo: input.legajo,
      nombre: input.nombre,
      apellido: input.apellido,
      email: input.email,
      passwordHash: await hashPassword(input.password)
    });

    return sanitizeUsuario(usuario);
  },

  update: async (idUsuario: number, input: UpdateUsuarioInput) => {
    await usuarioService.getById(idUsuario);

    if (input.idRol) {
      const rol = await rolRepository.findById(input.idRol);
      if (!rol || !rol.activo) {
        throw new ApiError(400, "Rol inexistente o inactivo");
      }
    }

    const usuario = await usuarioRepository.update(idUsuario, {
      idRol: input.idRol,
      legajo: input.legajo,
      nombre: input.nombre,
      apellido: input.apellido,
      email: input.email,
      activo: input.activo,
      passwordHash: input.password ? await hashPassword(input.password) : undefined
    });

    return sanitizeUsuario(usuario);
  },

  deactivate: async (idUsuario: number) => {
    await usuarioService.getById(idUsuario);
    const usuario = await usuarioRepository.update(idUsuario, { activo: false });
    return sanitizeUsuario(usuario);
  }
};
