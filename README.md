# Control de Perforaciones SSRMining

Backend API para el sistema de control de perforaciones de SSRMining.

## Stack definido

- Node.js
- Express
- TypeScript
- Prisma ORM
- SQL Server local, con proyeccion a Azure SQL Database
- JWT, bcrypt, Helmet, CORS
- Swagger / OpenAPI
- Jest + Supertest

## Instalacion local de SQL Server

1. Instalar SQL Server Developer Edition desde Microsoft.
2. Durante la instalacion, elegir modo mixto si se desea usar usuario `sa`.
3. Definir una contrasena fuerte para `sa`.
4. Instalar SQL Server Management Studio o Azure Data Studio.
5. Abrir SQL Server Configuration Manager.
6. Habilitar TCP/IP en `SQL Server Network Configuration`.
7. Confirmar que SQL Server escuche en el puerto `1433`.
8. Reiniciar el servicio de SQL Server.
9. Crear la base de datos:

```sql
CREATE DATABASE SSRMiningControl;
GO
```

10. Copiar `.env.example` como `.env` y ajustar `DATABASE_URL`.

Ejemplo local:

```env
DATABASE_URL="sqlserver://localhost:1433;database=SSRMiningControl;user=sa;password=YourStrong!Passw0rd;encrypt=true;trustServerCertificate=true"
```

## Instalacion del backend

```bash
npm install
npm run prisma:generate
npm run prisma:migrate
npm run db:seed
npm run dev
```

## Endpoints iniciales

- Salud del servicio: `GET /health`
- Swagger: `GET /api/docs`
- API versionada: `/api/v1`

## Usuario seed inicial

- Email: `admin@ssrmining.local`
- Password: `Admin12345!`

Cambiar estos valores antes de usar el sistema fuera del entorno local.
