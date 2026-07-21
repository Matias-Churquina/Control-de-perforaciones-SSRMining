import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const PASSWORDS = {
  admin: "Admin12345!",
  supervisor: "Supervisor12345!",
  operador: "Operador12345!"
};

const time = (value: string) => {
  const [hours, minutes] = value.split(":").map(Number);
  return new Date(Date.UTC(1970, 0, 1, hours, minutes, 0, 0));
};

const dateOnly = (value: string) => new Date(`${value}T00:00:00.000Z`);

async function seedRoles() {
  const roles = [
    { nombre: "ADMINISTRADOR", descripcion: "Administra usuarios, roles, equipos y parametros del sistema." },
    { nombre: "SUPERVISOR", descripcion: "Revisa, aprueba y rechaza perforaciones registradas." },
    { nombre: "OPERADOR", descripcion: "Registra perforaciones operativas." }
  ];

  for (const rol of roles) {
    await prisma.rol.upsert({
      where: { nombre: rol.nombre },
      update: rol,
      create: rol
    });
  }
}

async function seedUsuarios() {
  const [adminRole, supervisorRole, operadorRole] = await Promise.all([
    prisma.rol.findUniqueOrThrow({ where: { nombre: "ADMINISTRADOR" } }),
    prisma.rol.findUniqueOrThrow({ where: { nombre: "SUPERVISOR" } }),
    prisma.rol.findUniqueOrThrow({ where: { nombre: "OPERADOR" } })
  ]);

  const usuarios = [
    {
      idRol: adminRole.idRol,
      legajo: "ADMIN-001",
      nombre: "Administrador",
      apellido: "SSRMining",
      email: "admin@ssrmining.local",
      password: PASSWORDS.admin
    },
    {
      idRol: supervisorRole.idRol,
      legajo: "SUP-001",
      nombre: "Valeria",
      apellido: "Quispe",
      email: "supervisor@ssrmining.local",
      password: PASSWORDS.supervisor
    },
    {
      idRol: operadorRole.idRol,
      legajo: "OP-001",
      nombre: "Martin",
      apellido: "Rojas",
      email: "operador1@ssrmining.local",
      password: PASSWORDS.operador
    },
    {
      idRol: operadorRole.idRol,
      legajo: "OP-002",
      nombre: "Carla",
      apellido: "Mamani",
      email: "operador2@ssrmining.local",
      password: PASSWORDS.operador
    }
  ];

  for (const usuario of usuarios) {
    await prisma.usuario.upsert({
      where: { email: usuario.email },
      update: {
        idRol: usuario.idRol,
        legajo: usuario.legajo,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        activo: true
      },
      create: {
        idRol: usuario.idRol,
        legajo: usuario.legajo,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
        passwordHash: await bcrypt.hash(usuario.password, 12)
      }
    });
  }
}

async function seedEquipos() {
  const equipos = [
    { codigo: "PE 901", descripcion: "Perforadora PE 901 - frente norte", modelo: "Epiroc DM45", estado: "ACTIVO" },
    { codigo: "PE 903", descripcion: "Perforadora PE 903 - banco central", modelo: "Sandvik D75KS", estado: "ACTIVO" },
    { codigo: "PE 907", descripcion: "Perforadora PE 907 - alta profundidad", modelo: "Epiroc PV-271", estado: "ACTIVO" },
    { codigo: "PE 908", descripcion: "Perforadora PE 908 - reserva operacional", modelo: "Sandvik DR412i", estado: "MANTENIMIENTO" },
    { codigo: "PE 910", descripcion: "Perforadora PE 910 - equipo historico", modelo: "Atlas Copco DM30", estado: "INACTIVO" }
  ];

  for (const equipo of equipos) {
    await prisma.equipo.upsert({
      where: { codigo: equipo.codigo },
      update: equipo,
      create: equipo
    });
  }
}

async function seedPerforaciones() {
  const [supervisor, operador1, operador2] = await Promise.all([
    prisma.usuario.findUniqueOrThrow({ where: { email: "supervisor@ssrmining.local" } }),
    prisma.usuario.findUniqueOrThrow({ where: { email: "operador1@ssrmining.local" } }),
    prisma.usuario.findUniqueOrThrow({ where: { email: "operador2@ssrmining.local" } })
  ]);

  const equipos = await prisma.equipo.findMany({
    where: { codigo: { in: ["PE 901", "PE 903", "PE 907"] } }
  });

  const equipoByCodigo = new Map(equipos.map((equipo) => [equipo.codigo, equipo]));

  const perforaciones = [
    {
      codigoPerforacion: "PERF-DEMO-20260701-001",
      fecha: "2026-07-01",
      fase: "Fase 7",
      banco: 4110,
      malla: "M-04",
      idPozo: "P-4110-001",
      tipoRoca: "Toba blanda",
      profundidadDiseno: 10.5,
      metrosPerforados: 10.3,
      profundidadReal: 10.4,
      horaInicio: "08:00",
      horaFin: "08:28",
      tipoPozo: "Produccion",
      observaciones: "Registro demo aprobado para tablero ejecutivo.",
      estado: "APROBADA",
      equipo: "PE 901",
      operador: operador1.idUsuario,
      supervisor: supervisor.idUsuario
    },
    {
      codigoPerforacion: "PERF-DEMO-20260702-002",
      fecha: "2026-07-02",
      fase: "Fase 7",
      banco: 4110,
      malla: "M-04",
      idPozo: "P-4110-002",
      tipoRoca: "Andesita media",
      profundidadDiseno: 11.2,
      metrosPerforados: 10.9,
      profundidadReal: 11.0,
      horaInicio: "09:10",
      horaFin: "09:42",
      tipoPozo: "Produccion",
      observaciones: "Desvio menor dentro de tolerancia QA/QC.",
      estado: "APROBADA",
      equipo: "PE 903",
      operador: operador2.idUsuario,
      supervisor: supervisor.idUsuario
    },
    {
      codigoPerforacion: "PERF-DEMO-20260703-003",
      fecha: "2026-07-03",
      fase: "Fase 8",
      banco: 4160,
      malla: "M-08",
      idPozo: "P-4160-014",
      tipoRoca: "Brecha silicificada",
      profundidadDiseno: 16.0,
      metrosPerforados: 15.6,
      profundidadReal: 15.8,
      horaInicio: "10:00",
      horaFin: "10:55",
      tipoPozo: "Produccion",
      observaciones: "Equipo PE 907 usado por mayor capacidad de profundidad.",
      estado: "PENDIENTE",
      equipo: "PE 907",
      operador: operador1.idUsuario
    },
    {
      codigoPerforacion: "PERF-DEMO-20260704-004",
      fecha: "2026-07-04",
      fase: "Fase 8",
      banco: 4160,
      malla: "M-09",
      idPozo: "P-4160-022",
      tipoRoca: "Toba alterada",
      profundidadDiseno: 9.8,
      metrosPerforados: 9.1,
      profundidadReal: 9.0,
      horaInicio: "11:20",
      horaFin: "11:49",
      tipoPozo: "Control",
      observaciones: "Pendiente de revision de supervisor.",
      estado: "PENDIENTE",
      equipo: "PE 901",
      operador: operador2.idUsuario
    },
    {
      codigoPerforacion: "PERF-DEMO-20260705-005",
      fecha: "2026-07-05",
      fase: "Fase 8",
      banco: 4210,
      malla: "M-12",
      idPozo: "P-4210-031",
      tipoRoca: "Andesita dura",
      profundidadDiseno: 11.5,
      metrosPerforados: 7.1,
      profundidadReal: 7.0,
      horaInicio: "13:00",
      horaFin: "13:45",
      tipoPozo: "Produccion",
      observaciones: "Registro rechazado por diferencia operacional a revisar.",
      estado: "RECHAZADA",
      motivoRechazo: "Diferencia de profundidad fuera del criterio operativo definido por supervision.",
      equipo: "PE 903",
      operador: operador1.idUsuario,
      supervisor: supervisor.idUsuario
    }
  ];

  for (const perforacion of perforaciones) {
    const equipo = equipoByCodigo.get(perforacion.equipo);

    if (!equipo) {
      throw new Error(`Equipo demo no encontrado: ${perforacion.equipo}`);
    }

    await prisma.perforacion.upsert({
      where: { codigoPerforacion: perforacion.codigoPerforacion },
      update: {
        fecha: dateOnly(perforacion.fecha),
        fase: perforacion.fase,
        banco: perforacion.banco,
        malla: perforacion.malla,
        idPozo: perforacion.idPozo,
        tipoRoca: perforacion.tipoRoca,
        profundidadDiseno: perforacion.profundidadDiseno,
        metrosPerforados: perforacion.metrosPerforados,
        profundidadReal: perforacion.profundidadReal,
        horaInicio: time(perforacion.horaInicio),
        horaFin: time(perforacion.horaFin),
        tipoPozo: perforacion.tipoPozo,
        observaciones: perforacion.observaciones,
        estado: perforacion.estado,
        motivoRechazo: perforacion.motivoRechazo,
        idUsuarioRegistro: perforacion.operador,
        idSupervisorRevision: perforacion.supervisor,
        fechaRevision: perforacion.supervisor ? new Date() : null,
        idEquipo: equipo.idEquipo
      },
      create: {
        codigoPerforacion: perforacion.codigoPerforacion,
        fecha: dateOnly(perforacion.fecha),
        fase: perforacion.fase,
        banco: perforacion.banco,
        malla: perforacion.malla,
        idPozo: perforacion.idPozo,
        tipoRoca: perforacion.tipoRoca,
        profundidadDiseno: perforacion.profundidadDiseno,
        metrosPerforados: perforacion.metrosPerforados,
        profundidadReal: perforacion.profundidadReal,
        horaInicio: time(perforacion.horaInicio),
        horaFin: time(perforacion.horaFin),
        tipoPozo: perforacion.tipoPozo,
        observaciones: perforacion.observaciones,
        estado: perforacion.estado,
        motivoRechazo: perforacion.motivoRechazo,
        idUsuarioRegistro: perforacion.operador,
        idSupervisorRevision: perforacion.supervisor,
        fechaRevision: perforacion.supervisor ? new Date() : null,
        idEquipo: equipo.idEquipo
      }
    });
  }
}

async function main() {
  await seedRoles();
  await seedUsuarios();
  await seedEquipos();
  await seedPerforaciones();

  console.log("Seed SSRMining completado.");
  console.log("Admin: admin@ssrmining.local / Admin12345!");
  console.log("Supervisor: supervisor@ssrmining.local / Supervisor12345!");
  console.log("Operador: operador1@ssrmining.local / Operador12345!");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
