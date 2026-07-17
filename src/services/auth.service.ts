import { usuarioRepository } from "../repositories/usuario.repository";
import { ApiError } from "../utils/apiError";
import { comparePassword } from "../utils/password";
import { signToken } from "../utils/jwt";

export const authService = {
  login: async (email: string, password: string) => {
    const usuario = await usuarioRepository.findByEmail(email);

    if (!usuario || !usuario.activo) {
      throw new ApiError(401, "Credenciales invalidas");
    }

    const passwordOk = await comparePassword(password, usuario.passwordHash);

    if (!passwordOk) {
      throw new ApiError(401, "Credenciales invalidas");
    }

    const token = signToken({
      idUsuario: usuario.idUsuario,
      legajo: usuario.legajo,
      email: usuario.email,
      rol: usuario.rol.nombre
    });

    return {
      token,
      usuario: {
        idUsuario: usuario.idUsuario,
        legajo: usuario.legajo,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
        rol: usuario.rol.nombre
      }
    };
  }
};

