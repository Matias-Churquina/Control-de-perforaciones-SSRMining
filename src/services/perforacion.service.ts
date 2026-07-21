import { Decimal } from "@prisma/client/runtime/library";
import { ESTADOS_EQUIPO } from "../constants/estadosEquipo";
import { ESTADOS_PERFORACION } from "../constants/estadosPerforacion";
import { ROLES } from "../constants/roles";
import { equipoRepository } from "../repositories/equipo.repository";
import { PerforacionFilters, perforacionRepository } from "../repositories/perforacion.repository";
import { ApiError } from "../utils/apiError";
import { JwtPayload } from "../utils/jwt";

type CreatePerforacionInput = {
  codigoPerforacion?: string;
  fecha: string;
  fase: string;
  banco: number;
  malla: string;
  idPozo: string;
  tipoRoca: string;
  profundidadDiseno: number;
  metrosPerforados: number;
  profundidadReal: number;
  horaInicio: string;
  horaFin: string;
  tipoPozo: string;
  observaciones?: string;
  idEquipo: number;
};

type UpdatePerforacionInput = Partial<CreatePerforacionInput>;

type CancelPerforacionInput = {
  motivoRechazo: string;
};

export type ListPerforacionInput = {
  fechaDesde?: string;
  fechaHasta?: string;
  estado?: string;
  idEquipo?: string;
  idUsuarioRegistro?: string;
  fase?: string;
  banco?: string;
};

const normalizeString = (value: string) => value.trim().replace(/\s+/g, " ");

const parseDateOnly = (value: string) => {
  const date = new Date(`${value}T00:00:00.000Z`);

  if (Number.isNaN(date.getTime())) {
    throw new ApiError(400, "Fecha invalida");
  }

  return date;
};

const parseTime = (value: string) => {
  const [hours, minutes] = value.split(":").map(Number);

  if (Number.isNaN(hours) || Number.isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    throw new ApiError(400, "Hora invalida");
  }

  return new Date(Date.UTC(1970, 0, 1, hours, minutes, 0, 0));
};

const durationHours = (horaInicio: string, horaFin: string) => {
  const [startHour, startMinute] = horaInicio.split(":").map(Number);
  const [endHour, endMinute] = horaFin.split(":").map(Number);
  const start = startHour + startMinute / 60;
  let end = endHour + endMinute / 60;

  if (end <= start) {
    end += 24;
  }

  return end - start;
};

const toNumber = (value: Decimal | number) => Number(value);

const decoratePerforacion = (perforacion: Awaited<ReturnType<typeof perforacionRepository.findById>>) => {
  if (!perforacion) return null;

  const metrosPerforados = toNumber(perforacion.metrosPerforados);
  const profundidadDiseno = toNumber(perforacion.profundidadDiseno);
  const inicio = perforacion.horaInicio.toISOString().slice(11, 16);
  const fin = perforacion.horaFin.toISOString().slice(11, 16);
  const horas = durationHours(inicio, fin);

  return {
    ...perforacion,
    calculos: {
      duracionHoras: Number(horas.toFixed(2)),
      rop: horas > 0 ? Number((metrosPerforados / horas).toFixed(2)) : 0,
      adherencia: profundidadDiseno > 0 ? Number(((metrosPerforados / profundidadDiseno) * 100).toFixed(2)) : 0
    }
  };
};

const validateDepths = (
  input: Pick<CreatePerforacionInput, "profundidadDiseno" | "metrosPerforados" | "profundidadReal">,
  codigoEquipo: string
) => {
  const maxDepth = codigoEquipo === "PE 907" ? 20 : 12;
  const values = [input.profundidadDiseno, input.metrosPerforados, input.profundidadReal];

  if (values.some((value) => value < 1 || value > maxDepth)) {
    throw new ApiError(400, `Para ${codigoEquipo} los metros deben estar entre 1 y ${maxDepth}`);
  }

  const minTolerance = input.profundidadDiseno * 0.3;
  const maxTolerance = input.profundidadDiseno * 1.7;

  if (input.metrosPerforados < minTolerance || input.metrosPerforados > maxTolerance) {
    throw new ApiError(400, "Metros perforados fuera de tolerancia QA/QC");
  }

  if (input.profundidadReal < minTolerance || input.profundidadReal > maxTolerance) {
    throw new ApiError(400, "Profundidad real fuera de tolerancia QA/QC");
  }
};

const buildCodigoPerforacion = (input: CreatePerforacionInput) =>
  `${input.fecha}-${input.idEquipo}-${normalizeString(input.idPozo).toUpperCase()}`;

const ensureCanMutate = (perforacion: NonNullable<Awaited<ReturnType<typeof perforacionRepository.findById>>>, usuario: JwtPayload) => {
  if (perforacion.estado !== ESTADOS_PERFORACION.PENDIENTE) {
    throw new ApiError(400, "Solo se pueden modificar perforaciones pendientes");
  }

  if (usuario.rol === ROLES.OPERADOR && perforacion.idUsuarioRegistro !== usuario.idUsuario) {
    throw new ApiError(403, "No tiene permisos para modificar esta perforacion");
  }
};

const buildFilters = (query: ListPerforacionInput, usuario: JwtPayload): PerforacionFilters => ({
  fechaDesde: query.fechaDesde ? parseDateOnly(query.fechaDesde) : undefined,
  fechaHasta: query.fechaHasta ? parseDateOnly(query.fechaHasta) : undefined,
  estado: query.estado?.trim().toUpperCase(),
  idEquipo: query.idEquipo ? Number(query.idEquipo) : undefined,
  idUsuarioRegistro:
    usuario.rol === ROLES.OPERADOR
      ? usuario.idUsuario
      : query.idUsuarioRegistro
        ? Number(query.idUsuarioRegistro)
        : undefined,
  fase: query.fase ? normalizeString(query.fase) : undefined,
  banco: query.banco ? Number(query.banco) : undefined
});

export const perforacionService = {
  list: async (query: ListPerforacionInput, usuario: JwtPayload) => {
    const perforaciones = await perforacionRepository.list(buildFilters(query, usuario));
    return perforaciones.map(decoratePerforacion);
  },

  getById: async (idPerforacion: number, usuario: JwtPayload) => {
    const perforacion = await perforacionRepository.findById(idPerforacion);

    if (!perforacion) {
      throw new ApiError(404, "Perforacion no encontrada");
    }

    if (usuario.rol === ROLES.OPERADOR && perforacion.idUsuarioRegistro !== usuario.idUsuario) {
      throw new ApiError(403, "No tiene permisos para ver esta perforacion");
    }

    return decoratePerforacion(perforacion);
  },

  create: async (rawInput: CreatePerforacionInput, usuario: JwtPayload) => {
    const input = {
      ...rawInput,
      fase: normalizeString(rawInput.fase),
      malla: normalizeString(rawInput.malla),
      idPozo: normalizeString(rawInput.idPozo),
      tipoRoca: normalizeString(rawInput.tipoRoca),
      tipoPozo: normalizeString(rawInput.tipoPozo),
      observaciones: rawInput.observaciones?.trim()
    };

    if (input.banco < 2500 || input.banco > 5000) {
      throw new ApiError(400, "Banco debe estar entre 2500 y 5000");
    }

    const equipo = await equipoRepository.findById(input.idEquipo);

    if (!equipo || equipo.estado !== ESTADOS_EQUIPO.ACTIVO) {
      throw new ApiError(400, "Equipo inexistente o no activo");
    }

    validateDepths(input, equipo.codigo);
    parseTime(input.horaInicio);
    parseTime(input.horaFin);

    const codigoPerforacion = input.codigoPerforacion?.trim() || buildCodigoPerforacion(input);

    if (await perforacionRepository.findByCodigo(codigoPerforacion)) {
      throw new ApiError(409, "Ya existe una perforacion con ese codigo");
    }

    const perforacion = await perforacionRepository.create({
      codigoPerforacion,
      fecha: parseDateOnly(input.fecha),
      fase: input.fase,
      banco: input.banco,
      malla: input.malla,
      idPozo: input.idPozo,
      tipoRoca: input.tipoRoca,
      profundidadDiseno: input.profundidadDiseno,
      metrosPerforados: input.metrosPerforados,
      profundidadReal: input.profundidadReal,
      horaInicio: parseTime(input.horaInicio),
      horaFin: parseTime(input.horaFin),
      tipoPozo: input.tipoPozo,
      observaciones: input.observaciones,
      estado: ESTADOS_PERFORACION.PENDIENTE,
      idUsuarioRegistro: usuario.idUsuario,
      idEquipo: input.idEquipo
    });

    return decoratePerforacion(perforacion);
  },

  update: async (idPerforacion: number, rawInput: UpdatePerforacionInput, usuario: JwtPayload) => {
    const current = await perforacionRepository.findById(idPerforacion);

    if (!current) {
      throw new ApiError(404, "Perforacion no encontrada");
    }

    ensureCanMutate(current, usuario);

    const merged: CreatePerforacionInput = {
      codigoPerforacion: rawInput.codigoPerforacion ?? current.codigoPerforacion,
      fecha: rawInput.fecha ?? current.fecha.toISOString().slice(0, 10),
      fase: rawInput.fase ?? current.fase,
      banco: rawInput.banco ?? current.banco,
      malla: rawInput.malla ?? current.malla,
      idPozo: rawInput.idPozo ?? current.idPozo,
      tipoRoca: rawInput.tipoRoca ?? current.tipoRoca,
      profundidadDiseno: rawInput.profundidadDiseno ?? toNumber(current.profundidadDiseno),
      metrosPerforados: rawInput.metrosPerforados ?? toNumber(current.metrosPerforados),
      profundidadReal: rawInput.profundidadReal ?? toNumber(current.profundidadReal),
      horaInicio: rawInput.horaInicio ?? current.horaInicio.toISOString().slice(11, 16),
      horaFin: rawInput.horaFin ?? current.horaFin.toISOString().slice(11, 16),
      tipoPozo: rawInput.tipoPozo ?? current.tipoPozo,
      observaciones: rawInput.observaciones ?? current.observaciones ?? undefined,
      idEquipo: rawInput.idEquipo ?? current.idEquipo
    };

    const input = {
      ...merged,
      fase: normalizeString(merged.fase),
      malla: normalizeString(merged.malla),
      idPozo: normalizeString(merged.idPozo),
      tipoRoca: normalizeString(merged.tipoRoca),
      tipoPozo: normalizeString(merged.tipoPozo),
      observaciones: merged.observaciones?.trim()
    };

    if (input.banco < 2500 || input.banco > 5000) {
      throw new ApiError(400, "Banco debe estar entre 2500 y 5000");
    }

    const equipo = await equipoRepository.findById(input.idEquipo);

    if (!equipo || equipo.estado !== ESTADOS_EQUIPO.ACTIVO) {
      throw new ApiError(400, "Equipo inexistente o no activo");
    }

    validateDepths(input, equipo.codigo);

    const codigoPerforacion = input.codigoPerforacion?.trim() || buildCodigoPerforacion(input);
    const existente = await perforacionRepository.findByCodigo(codigoPerforacion);

    if (existente && existente.idPerforacion !== idPerforacion) {
      throw new ApiError(409, "Ya existe una perforacion con ese codigo");
    }

    const perforacion = await perforacionRepository.update(idPerforacion, {
      codigoPerforacion,
      fecha: parseDateOnly(input.fecha),
      fase: input.fase,
      banco: input.banco,
      malla: input.malla,
      idPozo: input.idPozo,
      tipoRoca: input.tipoRoca,
      profundidadDiseno: input.profundidadDiseno,
      metrosPerforados: input.metrosPerforados,
      profundidadReal: input.profundidadReal,
      horaInicio: parseTime(input.horaInicio),
      horaFin: parseTime(input.horaFin),
      tipoPozo: input.tipoPozo,
      observaciones: input.observaciones,
      idEquipo: input.idEquipo
    });

    return decoratePerforacion(perforacion);
  },

  cancel: async (idPerforacion: number, input: CancelPerforacionInput, usuario: JwtPayload) => {
    const current = await perforacionRepository.findById(idPerforacion);

    if (!current) {
      throw new ApiError(404, "Perforacion no encontrada");
    }

    ensureCanMutate(current, usuario);

    const motivoRechazo = input.motivoRechazo.trim();

    if (motivoRechazo.length < 5) {
      throw new ApiError(400, "Motivo de anulacion requerido");
    }

    const perforacion = await perforacionRepository.update(idPerforacion, {
      estado: ESTADOS_PERFORACION.RECHAZADA,
      motivoRechazo,
      idSupervisorRevision: usuario.idUsuario,
      fechaRevision: new Date()
    });

    return decoratePerforacion(perforacion);
  }
};
