# Despliegue demo SSRMining

Guia para publicar una primera muestra funcional sin comprometer el camino empresarial con SQL Server local o Azure SQL Database.

## Objetivo

La demo publica usa:

- Frontend Angular en Vercel, Netlify o Render Static Site.
- Backend Node.js + Express en Render Web Service.
- Base de datos PostgreSQL en Supabase o Render Postgres.

La arquitectura empresarial se mantiene:

- El schema principal `prisma/schema.prisma` sigue usando SQL Server.
- El schema demo `prisma/schema.postgres.prisma` solo se usa para hosting gratuito.
- La logica de negocio, controladores, servicios, validadores y rutas no cambian por proveedor de base de datos.

## Estrategia reversible

Para demo:

```bash
npm run build:demo
npm run db:prepare:demo
npm run start:demo
```

Para desarrollo local o servidor empresarial con SQL Server:

```bash
npm run prisma:generate
npm run prisma:migrate
npm run db:seed
npm run build
npm start
```

La vuelta a Azure SQL o SQL Server local consiste en:

1. Usar `prisma/schema.prisma`.
2. Configurar `DATABASE_URL` con cadena SQL Server.
3. Ejecutar `npm run prisma:generate`.
4. Ejecutar migraciones SQL Server.
5. Desplegar backend en Azure App Service, IIS/Node, VM o servidor interno.

## Backend en Render

1. Subir la rama `feature/deploy-demo` al repositorio remoto.
2. Entrar a Render.
3. Crear un nuevo `Web Service`.
4. Conectar el repositorio backend.
5. Configurar:

```text
Runtime: Node
Plan: Free
Build Command: npm ci && npm run build:demo
Start Command: npm run start:demo
```

6. Agregar variables de entorno:

```text
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require
JWT_SECRET=<clave-larga-segura>
JWT_EXPIRES_IN=8h
CORS_ORIGIN=https://<frontend-demo>.vercel.app,http://localhost:4200
```

7. Desplegar.
8. Abrir:

```text
https://<backend-render>.onrender.com/health
https://<backend-render>.onrender.com/api/docs
```

## Base de datos demo

Opcion recomendada: Supabase PostgreSQL.

1. Crear proyecto en Supabase.
2. Ir a `Project Settings > Database`.
3. Copiar connection string compatible con Prisma.
4. Agregar `?sslmode=require` si no esta incluido.
5. Guardarla en Render como `DATABASE_URL`.

Luego preparar tablas y datos:

```bash
npm run db:prepare:demo
```

En Render Free no hay shell interactiva. Alternativas:

- Ejecutar el comando localmente apuntando `DATABASE_URL` a Supabase.
- Crear temporalmente un `Job`/comando manual si el plan lo permite.
- Ejecutar desde una terminal local antes de presentar.

Credenciales demo generadas por seed:

```text
Administrador: admin@ssrmining.local / Admin12345!
Supervisor: supervisor@ssrmining.local / Supervisor12345!
Operador: operador1@ssrmining.local / Operador12345!
```

## Frontend en Vercel

1. Actualizar `src/environments/environment.demo.ts` con la URL real del backend:

```ts
apiUrl: 'https://<backend-render>.onrender.com/api/v1'
```

2. Subir la rama del frontend.
3. Crear proyecto en Vercel.
4. Configurar:

```text
Framework Preset: Angular
Build Command: npm run build:demo
Output Directory: dist/ssrmining-control-frontend/browser
```

5. Desplegar.
6. Copiar la URL final del frontend.
7. Agregar esa URL en `CORS_ORIGIN` del backend en Render.
8. Redesplegar backend.

## Checklist de validacion

Backend:

- `GET /health` responde `status: ok`.
- Swagger abre en `/api/docs`.
- Login responde token con usuario valido.
- Dashboard responde KPIs y graficos.
- CRUD de equipos funciona con administrador.
- Registro de perforacion funciona con operador.
- Revision funciona con supervisor.

Frontend:

- Login de administrador.
- Login de operador.
- Login de supervisor.
- Dashboard carga con filtros por flota, fase y operador.
- Alta de equipo.
- Alta de usuario.
- Registro de perforacion.
- Revision/aprobacion/rechazo de perforacion.
- Refrescar una ruta interna no da 404.

## Consideraciones para presentacion

Render Free puede dormir el backend tras inactividad. Antes de mostrar el sistema:

1. Abrir `/health`.
2. Esperar que responda.
3. Abrir el frontend.
4. Iniciar sesion con usuario demo.

La primera carga puede tardar cerca de un minuto si el servicio estaba dormido.

## Camino empresarial posterior

Cuando SSRMining apruebe la demo, las opciones recomendadas son:

- Azure App Service + Azure SQL Database.
- Servidor interno Windows/Linux con Node.js + SQL Server local.
- Docker Compose interno con backend y SQL Server, si la empresa permite contenedores.

Para ese paso no se debe usar `schema.postgres.prisma`; se vuelve al schema principal SQL Server.
