import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
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

  const adminRole = await prisma.rol.findUniqueOrThrow({
    where: { nombre: "ADMINISTRADOR" }
  });

  await prisma.usuario.upsert({
    where: { email: "admin@ssrmining.local" },
    update: {},
    create: {
      idRol: adminRole.idRol,
      legajo: "ADMIN-001",
      nombre: "Administrador",
      apellido: "SSRMining",
      email: "admin@ssrmining.local",
      passwordHash: await bcrypt.hash("Admin12345!", 12)
    }
  });

  const equipos = [
    { codigo: "PE 901", descripcion: "Perforadora PE 901", modelo: "Perforadora operativa" },
    { codigo: "PE 903", descripcion: "Perforadora PE 903", modelo: "Perforadora operativa" },
    { codigo: "PE 907", descripcion: "Perforadora PE 907", modelo: "Perforadora operativa" }
  ];

  for (const equipo of equipos) {
    await prisma.equipo.upsert({
      where: { codigo: equipo.codigo },
      update: equipo,
      create: equipo
    });
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
