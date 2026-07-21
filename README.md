# Sistema de Control de Perforaciones SSRMining

Backend API para gestion operativa, supervision, control QA/QC y dashboard de perforaciones mineras.

Desarrollado por **Credere.Dev**.

## Estado del backend V1

El backend V1 ya incluye:

- Autenticacion con JWT.
- Roles y autorizacion por perfil.
- Administracion de usuarios.
- Administracion de equipos.
- Registro operativo de perforaciones.
- Edicion y anulacion de perforaciones pendientes.
- Dashboard operativo con KPIs y datasets para graficos.
- Documentacion Swagger/OpenAPI.
- Pruebas automatizadas con Jest y Supertest.

## Stack tecnico

- Node.js
- Express
- TypeScript
- Prisma ORM
- SQL Server 2022 Developer local
- SQL Server Management Studio
- JWT
- bcrypt
- Helmet
- CORS
- express-rate-limit
- express-validator
- Swagger / OpenAPI
- Jest
- Supertest

## Arquitectura

El backend sigue una arquitectura por capas:

```text
src/
  controllers/   Entrada HTTP y respuestas
  services/      Logica de negocio
  repositories/  Acceso a datos con Prisma
  routes/        Definicion de endpoints
  middleware/    Auth, roles, validaciones y errores
  validators/    Reglas de entrada por endpoint
  constants/     Roles y estados del dominio
  utils/         JWT, password, errores y async handler
```

Mas detalle en:

- [Arquitectura Backend V1](docs/backend-v1.md)
- [Reglas de Negocio](docs/business-rules.md)
- [Guia de Pruebas API](docs/api-testing-guide.md)
- [Estrategia de Calidad](docs/quality-strategy.md)
- [Resumen Ejecutivo](docs/executive-summary.md)

## Requisitos locales

- Node.js instalado.
- SQL Server 2022 Developer instalado.
- SQL Server Management Studio o Azure Data Studio.
- SQL Server con modo mixto habilitado.
- Puerto fijo recomendado para SQL Server 2022: `14330`.

## Configuracion de SQL Server

Crear base de datos:

```sql
CREATE DATABASE SSRMiningControl;
GO
```

Crear login y usuario de aplicacion:

```sql
USE master;
GO

CREATE LOGIN ssrmining_app
WITH PASSWORD = 'SsrMining12345!',
CHECK_POLICY = OFF,
CHECK_EXPIRATION = OFF;
GO

USE SSRMiningControl;
GO

CREATE USER ssrmining_app FOR LOGIN ssrmining_app;
GO

ALTER ROLE db_owner ADD MEMBER ssrmining_app;
GO
```

Para `prisma migrate dev`, en entorno local el usuario necesita crear shadow databases:

```sql
USE master;
GO

ALTER SERVER ROLE dbcreator ADD MEMBER ssrmining_app;
GO
```

## Variables de entorno

Copiar `.env.example` como `.env`.

Ejemplo local recomendado:

```env
NODE_ENV=development
PORT=3000
DATABASE_URL="sqlserver://localhost:14330;database=SSRMiningControl;user=ssrmining_app;password=SsrMining12345!;encrypt=true;trustServerCertificate=true"
JWT_SECRET="change-this-secret"
JWT_EXPIRES_IN="8h"
CORS_ORIGIN="http://localhost:4200"
```

## Instalacion

```bash
npm install
npm.cmd run prisma:generate
npm.cmd run prisma:migrate
npm.cmd run db:seed
```

## Ejecucion local

```bash
npm.cmd run dev
```

Servidor:

```text
http://localhost:3000
```

Swagger:

```text
http://localhost:3000/api/docs
```

Health check:

```text
GET http://localhost:3000/health
```

## Usuario seed inicial

```text
Email: admin@ssrmining.local
Password: Admin12345!
Rol: ADMINISTRADOR
```

Cambiar estas credenciales antes de cualquier uso fuera del entorno local.

## Scripts

```bash
npm.cmd run dev              # servidor en modo desarrollo
npm.cmd run build            # compilacion TypeScript
npm.cmd test                 # pruebas automatizadas
npm.cmd run prisma:generate  # genera Prisma Client
npm.cmd run prisma:migrate   # ejecuta migraciones dev
npm.cmd run db:seed          # carga roles, admin y equipos iniciales
npm.cmd run prisma:studio    # abre Prisma Studio
```

## Endpoints principales

- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`
- `GET /api/v1/roles`
- `POST /api/v1/usuarios`
- `GET /api/v1/equipos`
- `POST /api/v1/perforaciones`
- `GET /api/v1/dashboard/resumen`

La especificacion completa esta en:

```text
docs/openapi.yaml
```

## Calidad actual

La suite cubre:

- health check;
- autenticacion;
- autorizacion por token;
- usuarios;
- roles;
- equipos;
- perforaciones;
- dashboard.

Comando recomendado antes de cada PR:

```bash
npm.cmd run build
npm.cmd test
```

## Troubleshooting rapido

Si Prisma no conecta:

- verificar `DATABASE_URL`;
- verificar puerto SQL Server con `Test-NetConnection localhost -Port 14330`;
- verificar que SQL Server use modo mixto;
- verificar que `ssrmining_app` pueda conectarse desde SSMS;
- ejecutar `npm.cmd run prisma:generate`.

Si `prisma migrate dev` falla con permisos de shadow database:

```sql
ALTER SERVER ROLE dbcreator ADD MEMBER ssrmining_app;
GO
```
