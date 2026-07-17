import { env } from "./src/config/env";
import { app } from "./src/app";
import { prisma } from "./src/config/prisma";

async function bootstrap() {
  try {
    await prisma.$connect();
    console.log("Conexion exitosa a SQL Server");

    app.listen(env.port, () => {
      console.log(`SSRMining API running on port ${env.port}`);
    });
  } catch (error) {
    console.error("Error al conectar con SQL Server");
    console.error(error);
    process.exit(1);
  }
}

bootstrap();