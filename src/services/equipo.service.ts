import { ESTADOS_EQUIPO, ESTADOS_EQUIPO_VALUES } from "../constants/estadosEquipo";
import { equipoRepository } from "../repositories/equipo.repository";
import { ApiError } from "../utils/apiError";

type CreateEquipoInput = {
  codigo: string;
  descripcion: string;
  modelo?: string;
  estado?: string;
};

type UpdateEquipoInput = Partial<CreateEquipoInput>;

const normalizeCodigo = (codigo: string) => codigo.trim().toUpperCase().replace(/\s+/g, " ");

const normalizeInput = <T extends CreateEquipoInput | UpdateEquipoInput>(input: T): T => ({
  ...input,
  codigo: input.codigo ? normalizeCodigo(input.codigo) : input.codigo,
  descripcion: input.descripcion?.trim(),
  modelo: input.modelo?.trim(),
  estado: input.estado?.trim().toUpperCase()
});

const ensureValidEstado = (estado?: string) => {
  if (estado && !ESTADOS_EQUIPO_VALUES.includes(estado as (typeof ESTADOS_EQUIPO_VALUES)[number])) {
    throw new ApiError(400, "Estado de equipo invalido");
  }
};

export const equipoService = {
  list: () => equipoRepository.list(),

  getById: async (idEquipo: number) => {
    const equipo = await equipoRepository.findById(idEquipo);

    if (!equipo) {
      throw new ApiError(404, "Equipo no encontrado");
    }

    return equipo;
  },

  create: async (rawInput: CreateEquipoInput) => {
    const input = normalizeInput(rawInput);
    ensureValidEstado(input.estado);

    if (await equipoRepository.findByCodigo(input.codigo)) {
      throw new ApiError(409, "Ya existe un equipo con ese codigo");
    }

    return equipoRepository.create({
      codigo: input.codigo,
      descripcion: input.descripcion,
      modelo: input.modelo,
      estado: input.estado ?? ESTADOS_EQUIPO.ACTIVO
    });
  },

  update: async (idEquipo: number, rawInput: UpdateEquipoInput) => {
    const input = normalizeInput(rawInput);
    await equipoService.getById(idEquipo);
    ensureValidEstado(input.estado);

    if (input.codigo) {
      const existente = await equipoRepository.findByCodigo(input.codigo);

      if (existente && existente.idEquipo !== idEquipo) {
        throw new ApiError(409, "Ya existe un equipo con ese codigo");
      }
    }

    return equipoRepository.update(idEquipo, {
      codigo: input.codigo,
      descripcion: input.descripcion,
      modelo: input.modelo,
      estado: input.estado
    });
  },

  changeEstado: async (idEquipo: number, estado: string) => {
    const normalizedEstado = estado.trim().toUpperCase();
    await equipoService.getById(idEquipo);
    ensureValidEstado(normalizedEstado);

    return equipoRepository.update(idEquipo, {
      estado: normalizedEstado
    });
  },

  deactivate: async (idEquipo: number) =>
    equipoService.changeEstado(idEquipo, ESTADOS_EQUIPO.INACTIVO)
};
