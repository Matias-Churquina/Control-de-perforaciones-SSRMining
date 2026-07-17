import { usuarioRepository } from "../repositories/usuario.repository";
import { rolRepository } from "../repositories/rol.repository";
import { ROLES } from "../constants/roles";
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

const normalizeCreateInput = (input: CreateUsuarioInput) => ({
  ...input,
  legajo: input.legajo.trim(),
  nombre: input.nombre.trim(),
  apellido: input.apellido.trim(),
  email: input.email.trim().toLowerCase()
});

const normalizeUpdateInput = (input: UpdateUsuarioInput): UpdateUsuarioInput => ({
  ...input,
  legajo: input.legajo?.trim(),
  nombre: input.nombre?.trim(),
  apellido: input.apellido?.trim(),
  email: input.email?.trim().toLowerCase()
});

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

  create: async (rawInput: CreateUsuarioInput) => {
    const input = normalizeCreateInput(rawInput);
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

  update: async (idUsuario: number, rawInput: UpdateUsuarioInput) => {
    const input = normalizeUpdateInput(rawInput);
    await usuarioService.getById(idUsuario);

    if (input.idRol) {
      const rol = await rolRepository.findById(input.idRol);
      if (!rol || !rol.activo) {
        throw new ApiError(400, "Rol inexistente o inactivo");
      }
    }

    if (input.email) {
      const existente = await usuarioRepository.findByEmail(input.email);
      if (existente && existente.idUsuario !== idUsuario) {
        throw new ApiError(409, "Ya existe un usuario con ese email");
      }
    }

    if (input.legajo) {
      const existente = await usuarioRepository.findByLegajo(input.legajo);
      if (existente && existente.idUsuario !== idUsuario) {
        throw new ApiError(409, "Ya existe un usuario con ese legajo");
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

  deactivate: async (idUsuario: number, idUsuarioSolicitante: number) => {
    if (idUsuario === idUsuarioSolicitante) {
      throw new ApiError(403, "No puede desactivar su propio usuario");
    }

    const usuarioActual = await usuarioRepository.findById(idUsuario);

    if (!usuarioActual) {
      throw new ApiError(404, "Usuario no encontrado");
    }

    if (usuarioActual.activo && usuarioActual.rol.nombre === ROLES.ADMINISTRADOR) {
      const adminsActivos = await usuarioRepository.countActiveByRoleName(ROLES.ADMINISTRADOR);

      if (adminsActivos <= 1) {
        throw new ApiError(400, "No puede desactivar el ultimo administrador activo");
      }
    }

    const usuario = await usuarioRepository.update(idUsuario, { activo: false });
    return sanitizeUsuario(usuario);
  }
};
