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

    for (const perforacion of perforaciones) {
      const metros = toNumber(perforacion.metrosPerforados);
      const diseno = toNumber(perforacion.profundidadDiseno);
      const real = toNumber(perforacion.profundidadReal);
      const horas = durationHours(perforacion.horaInicio, perforacion.horaFin);
      const rop = horas > 0 ? metros / horas : 0;
      const operador = `${perforacion.usuarioRegistro.apellido}, ${perforacion.usuarioRegistro.nombre}`;

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
      addToGroup(metrosPorEquipo, perforacion.equipo.codigo, metros);
      addToGroup(metrosPorFase, perforacion.fase, metros);
      addToGroup(metrosPorBanco, String(perforacion.banco), metros);
      addToGroup(rankingOperadores, operador, metros);

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
      graficos: {
        metrosPorRoca: toSortedGroups(metrosPorRoca),
        distribucionTipoPozo: toSortedGroups(distribucionTipoPozo),
        metrosPorEquipo: toSortedGroups(metrosPorEquipo),
        metrosPorFase: toSortedGroups(metrosPorFase),
        metrosPorBanco: toSortedGroups(metrosPorBanco),
        rankingOperadores: toSortedGroups(rankingOperadores),
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

