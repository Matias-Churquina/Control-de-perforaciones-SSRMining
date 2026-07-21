# Backend V1 - Documentacion Tecnica

Preparado por **Credere.Dev**.

## 1. Proposito

El backend V1 del Sistema de Control de Perforaciones SSRMining centraliza la gestion de usuarios, roles, equipos, perforaciones y metricas operativas. Su objetivo es proveer una API segura, documentada y testeada para luego ser consumida por un frontend web y, en una etapa posterior, por una aplicacion movil o PWA orientada a tablets.

## 2. Alcance actual

El backend V1 incluye los siguientes modulos:

- Autenticacion y sesion.
- Roles.
- Usuarios.
- Equipos.
- Perforaciones.
- Dashboard operativo.
- Documentacion OpenAPI.
- Pruebas automatizadas.

Quedan fuera de este alcance inicial:

- frontend Angular;
- notificaciones;
- auditoria avanzada;
- carga masiva;
- integracion con sistemas externos;
- despliegue productivo;
- dashboard frontend.

## 3. Tecnologias

### Runtime y API

- **Node.js** como entorno de ejecucion.
- **Express** como framework HTTP.
- **TypeScript** para tipado estatico y mejor mantenibilidad.

### Base de datos

- **SQL Server 2022 Developer** para desarrollo local.
- Proyeccion futura a **Azure SQL Database**.
- **Prisma ORM 6.19.3** como capa de acceso a datos y migraciones.

### Seguridad

- **JWT** para autenticacion stateless.
- **bcrypt** para hash de passwords.
- **Helmet** para cabeceras HTTP seguras.
- **CORS** para control de origen frontend.
- **express-rate-limit** para limitar abuso basico.
- **express-validator** para validacion de entrada.

### Documentacion y calidad

- **Swagger UI** para documentacion interactiva.
- **OpenAPI YAML** como contrato de API.
- **Jest** como framework de pruebas.
- **Supertest** para pruebas HTTP.

## 4. Arquitectura por capas

```text
HTTP Request
  -> routes
  -> validators
  -> middleware
  -> controllers
  -> services
  -> repositories
  -> Prisma
  -> SQL Server
```

### Routes

Definen paths, middlewares y validadores.

Ejemplos:

- `src/routes/auth.routes.ts`
- `src/routes/usuario.routes.ts`
- `src/routes/equipo.routes.ts`
- `src/routes/perforacion.routes.ts`
- `src/routes/dashboard.routes.ts`

### Validators

Validan campos de entrada antes de llegar a la logica de negocio.

Ejemplos:

- email valido;
- password requerido;
- banco entre 2500 y 5000;
- estados validos;
- horas con formato `HH:mm`.

### Middleware

Responsabilidades:

- validar JWT;
- exigir roles;
- transformar errores de validacion;
- manejar recursos no encontrados;
- manejar errores globales.

### Controllers

Traducen request/response HTTP. No contienen reglas de negocio complejas.

### Services

Contienen reglas de negocio. Ejemplos:

- actualizar `ultimoAcceso`;
- impedir desactivar el ultimo administrador;
- validar equipo activo al crear perforacion;
- calcular ROP y adherencia;
- restringir operador a sus propias perforaciones.

### Repositories

Unifican el acceso a Prisma. La API no consulta Prisma directamente desde controladores.

## 5. Modelo de dominio

### Rol

Define permisos generales del usuario.

Roles seed:

- `ADMINISTRADOR`
- `SUPERVISOR`
- `OPERADOR`

### Usuario

Representa personas que usan el sistema. Puede registrar perforaciones o revisar registros.

Campos clave:

- legajo;
- nombre;
- apellido;
- email;
- passwordHash;
- activo;
- ultimoAcceso;
- rol.

### Equipo

Representa perforadoras o equipos operativos.

Estados:

- `ACTIVO`
- `INACTIVO`
- `MANTENIMIENTO`

### Perforacion

Registro operativo central del sistema.

Campos clave:

- fecha;
- fase;
- banco;
- malla;
- idPozo;
- tipoRoca;
- profundidadDiseno;
- metrosPerforados;
- profundidadReal;
- horaInicio;
- horaFin;
- tipoPozo;
- estado;
- usuario registrador;
- supervisor de revision;
- equipo.

Estados:

- `PENDIENTE`
- `APROBADA`
- `RECHAZADA`

## 6. Seguridad y permisos

### Autenticacion

Endpoint:

```text
POST /api/v1/auth/login
```

Entrada:

```json
{
  "email": "admin@ssrmining.local",
  "password": "Admin12345!"
}
```

Salida:

```json
{
  "token": "...",
  "usuario": {
    "idUsuario": 1,
    "legajo": "ADMIN-001",
    "nombre": "Administrador",
    "apellido": "SSRMining",
    "email": "admin@ssrmining.local",
    "rol": "ADMINISTRADOR"
  }
}
```

### Autorizacion

Los endpoints protegidos requieren:

```http
Authorization: Bearer <token>
```

### Matriz resumida de permisos

| Modulo | ADMINISTRADOR | SUPERVISOR | OPERADOR |
|---|---:|---:|---:|
| Roles | CRUD | No | No |
| Usuarios | CRUD | No | No |
| Equipos listar/ver | Si | Si | No |
| Equipos crear/editar/desactivar | Si | No | No |
| Equipos cambiar estado | Si | Si | No |
| Perforaciones listar | Si | Si | Propias |
| Perforaciones crear | Si | Si | Si |
| Perforaciones editar pendientes | Si | Si | Propias |
| Perforaciones anular pendientes | Si | Si | Propias |
| Dashboard | Si | Si | No |

## 7. Migraciones y seeds

### Migraciones

Prisma genera la estructura SQL Server a partir de `prisma/schema.prisma`.

Comando:

```bash
npm.cmd run prisma:migrate
```

### Seeds

El seed inicial carga:

- roles base;
- usuario administrador;
- equipos iniciales.

Comando:

```bash
npm.cmd run db:seed
```

## 8. Swagger

Swagger se expone en:

```text
http://localhost:3000/api/docs
```

La fuente del contrato esta en:

```text
docs/openapi.yaml
```

## 9. Criterios tecnicos de V1

El backend V1 se considera estable si:

- compila con TypeScript;
- las pruebas automatizadas pasan;
- Swagger abre correctamente;
- login seed funciona;
- migraciones corren contra SQL Server local;
- seed carga datos iniciales;
- endpoints protegidos bloquean requests sin token;
- reglas criticas del negocio estan cubiertas por tests.

