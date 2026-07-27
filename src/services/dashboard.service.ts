import { Decimal } from "@prisma/client/runtime/library";
import { DashboardFilters, dashboardRepository } from "../repositories/dashboard.repository";
import { ApiError } from "../utils/apiError";

type DashboardQuery = {
  fechaDesde?: string;
  fechaHasta?: string;
  estado?: string;
  idEquipo?: string;
  idUsuarioRegistro?: string;
  fase?: string;
  banco?: string;
};

type NumericGroup = {
  name: string;
  value: number;
};

type PrecisionGroup = {
  name: string;
  diseno: number;
  perforado: number;
  real: number;
};

type PrecisionAccumulator = {
  diseno: number;
  perforado: number;
  real: number;
};

type RopGroup = {
  name: string;
  sum: number;
  count: number;
};

const toNumber = (value: Decimal | number) => Number(value);

const round = (value: number, decimals = 2) => Number(value.toFixed(decimals));

const parseDateOnly = (value: string) => {
  const date = new Date(`${value}T00:00:00.000Z`);

  if (Number.isNaN(date.getTime())) {
    throw new ApiError(400, "Fecha invalida");
  }

  return date;
};

const normalizeString = (value: string) => value.trim().replace(/\s+/g, " ");

const durationHours = (horaInicio: Date, horaFin: Date) => {
  const start = horaInicio.getUTCHours() + horaInicio.getUTCMinutes() / 60;
  let end = horaFin.getUTCHours() + horaFin.getUTCMinutes() / 60;

  if (end <= start) {
    end += 24;
  }

  return end - start;
};

const addToGroup = (groups: Record<string, number>, key: string, value: number) => {
  groups[key] = (groups[key] ?? 0) + value;
};

const addPrecision = (
  groups: Record<string, PrecisionAccumulator>,
  key: string,
  diseno: number,
  perforado: number,
  real: number
) => {
  groups[key] = groups[key] ?? { diseno: 0, perforado: 0, real: 0 };
  groups[key].diseno += diseno;
  groups[key].perforado += perforado;
  groups[key].real += real;
};

const buildFilters = (query: DashboardQuery): DashboardFilters => ({
  fechaDesde: query.fechaDesde ? parseDateOnly(query.fechaDesde) : undefined,
  fechaHasta: query.fechaHasta ? parseDateOnly(query.fechaHasta) : undefined,
  estado: query.estado?.trim().toUpperCase(),
  idEquipo: query.idEquipo ? Number(query.idEquipo) : undefined,
  idUsuarioRegistro: query.idUsuarioRegistro ? Number(query.idUsuarioRegistro) : undefined,
  fase: query.fase ? normalizeString(query.fase) : undefined,
  banco: query.banco ? Number(query.banco) : undefined
});

const toSortedGroups = (groups: Record<string, number>): NumericGroup[] =>
  Object.entries(groups)
    .map(([name, value]) => ({ name, value: round(value) }))
    .sort((a, b) => b.value - a.value);

const toPrecisionGroups = (groups: Record<string, PrecisionAccumulator>): PrecisionGroup[] =>
  Object.entries(groups).map(([name, value]) => ({
    name,
    diseno: round(value.diseno),
    perforado: round(value.perforado),
    real: round(value.real)
  }));

export const dashboardService = {
  getResumen: async (query: DashboardQuery) => {
    const perforaciones = await dashboardRepository.getPerforaciones(buildFilters(query));

    let totalMetros = 0;
    let sumRop = 0;
    let ropCount = 0;
    let enRangoDiseno = 0;

    const metrosPorRoca: Record<string, number> = {};
    const distribucionTipoPozo: Record<string, number> = {};
    const metrosPorEquipo: Record<string, number> = {};
    const metrosPorFase: Record<string, number> = {};
    const metrosPorBanco: Record<string, number> = {};
    const rankingOperadores: Record<string, number> = {};
    const ropPorRoca: Record<string, RopGroup> = {};
    const precisionPorFase: Record<string, PrecisionAccumulator> = {};
    const precisionPorBanco: Record<string, PrecisionAccumulator> = {};
    const precisionPorOperador: Record<string, PrecisionAccumulator> = {};
    const estados: Record<string, number> = {};
    const opcionesFase = new Set<string>();
    const opcionesEquipo = new Set<string>();
    const opcionesOperador = new Set<string>();

    for (const perforacion of perforaciones) {
      const metros = toNumber(perforacion.metrosPerforados);
      const diseno = toNumber(perforacion.profundidadDiseno);
      const real = toNumber(perforacion.profundidadReal);
      const horas = durationHours(perforacion.horaInicio, perforacion.horaFin);
      const rop = horas > 0 ? metros / horas : 0;
      const operador = `${perforacion.usuarioRegistro.apellido}, ${perforacion.usuarioRegistro.nombre}`;
      const equipo = perforacion.equipo.codigo;
      const banco = String(perforacion.banco);

      totalMetros += metros;

      if (rop > 0) {
        sumRop += rop;
        ropCount++;
      }

      if (Math.abs(real - diseno) <= 0.5) {
        enRangoDiseno++;
      }

      addToGroup(metrosPorRoca, perforacion.tipoRoca, metros);
      addToGroup(distribucionTipoPozo, perforacion.tipoPozo, 1);
      addToGroup(metrosPorEquipo, equipo, metros);
      addToGroup(metrosPorFase, perforacion.fase, metros);
      addToGroup(metrosPorBanco, banco, metros);
      addToGroup(rankingOperadores, operador, metros);
      addToGroup(estados, perforacion.estado, 1);
      addPrecision(precisionPorFase, perforacion.fase, diseno, metros, real);
      addPrecision(precisionPorBanco, banco, diseno, metros, real);
      addPrecision(precisionPorOperador, operador, diseno, metros, real);
      opcionesFase.add(perforacion.fase);
      opcionesEquipo.add(equipo);
      opcionesOperador.add(operador);

      ropPorRoca[perforacion.tipoRoca] = ropPorRoca[perforacion.tipoRoca] ?? {
        name: perforacion.tipoRoca,
        sum: 0,
        count: 0
      };
      ropPorRoca[perforacion.tipoRoca].sum += rop;
      ropPorRoca[perforacion.tipoRoca].count++;
    }

    return {
      filtros: query,
      kpis: {
        metrosTotales: round(totalMetros),
        pozosCompletados: perforaciones.length,
        ropPromedio: ropCount > 0 ? round(sumRop / ropCount) : 0,
        adherenciaDiseno: perforaciones.length > 0 ? round((enRangoDiseno / perforaciones.length) * 100) : 0
      },
      opciones: {
        fases: Array.from(opcionesFase).sort(),
        equipos: Array.from(opcionesEquipo).sort(),
        operadores: Array.from(opcionesOperador).sort()
      },
      graficos: {
        metrosPorRoca: toSortedGroups(metrosPorRoca),
        distribucionTipoPozo: toSortedGroups(distribucionTipoPozo),
        metrosPorEquipo: toSortedGroups(metrosPorEquipo),
        metrosPorFase: toSortedGroups(metrosPorFase),
        metrosPorBanco: toSortedGroups(metrosPorBanco),
        estados: toSortedGroups(estados),
        rankingOperadores: toSortedGroups(rankingOperadores),
        precisionPorFase: toPrecisionGroups(precisionPorFase),
        precisionPorBanco: toPrecisionGroups(precisionPorBanco),
        precisionPorOperador: toPrecisionGroups(precisionPorOperador),
        ropPorRoca: Object.values(ropPorRoca)
          .map((group) => ({
            name: group.name,
            ropPromedio: group.count > 0 ? round(group.sum / group.count) : 0
          }))
          .sort((a, b) => b.ropPromedio - a.ropPromedio)
      }
    };
  }
};

