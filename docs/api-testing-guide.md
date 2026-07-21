# Guia de Pruebas API

Preparado por **Credere.Dev**.

## 1. Objetivo

Esta guia describe como probar el backend V1 desde Swagger, Postman o cualquier cliente HTTP. Incluye orden recomendado, credenciales seed, headers, payloads y resultados esperados.

## 2. URL base

```text
http://localhost:3000/api/v1
```

Swagger:

```text
http://localhost:3000/api/docs
```

Health:

```text
http://localhost:3000/health
```

## 3. Preparacion

Antes de probar:

```bash
npm.cmd run prisma:generate
npm.cmd run prisma:migrate
npm.cmd run db:seed
npm.cmd run dev
```

Verificar:

```text
GET /health
```

Respuesta esperada:

```json
{
  "status": "ok",
  "service": "SSRMining API"
}
```

## 4. Autenticacion

### Login

Endpoint:

```text
POST /api/v1/auth/login
```

Body:

```json
{
  "email": "admin@ssrmining.local",
  "password": "Admin12345!"
}
```

Respuesta esperada:

```json
{
  "token": "JWT...",
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

Guardar el token.

### Header para endpoints protegidos

```http
Authorization: Bearer <TOKEN>
```

## 5. Orden recomendado de pruebas manuales

1. Health check.
2. Login.
3. Ver usuario autenticado.
4. Listar roles.
5. Listar usuarios.
6. Crear usuario operador.
7. Listar equipos.
8. Crear equipo de prueba.
9. Cambiar estado de equipo.
10. Crear perforacion.
11. Editar perforacion pendiente.
12. Anular perforacion pendiente.
13. Consultar dashboard.

## 6. Usuarios y roles

### Ver usuario autenticado

```text
GET /api/v1/auth/me
```

Debe devolver los datos embebidos en el token.

### Listar roles

```text
GET /api/v1/roles
```

Requiere `ADMINISTRADOR`.

### Crear usuario

```text
POST /api/v1/usuarios
```

Body:

```json
{
  "idRol": 3,
  "legajo": "OP-1001",
  "nombre": "Juan",
  "apellido": "Perez",
  "email": "juan.perez@ssrmining.local",
  "password": "Usuario12345!"
}
```

Validaciones esperadas:

- email unico;
- legajo unico;
- rol activo;
- password minimo 8 caracteres.

### Desactivar usuario

```text
DELETE /api/v1/usuarios/{idUsuario}
```

Reglas:

- no se puede desactivar el propio usuario;
- no se puede desactivar el ultimo administrador activo.

## 7. Equipos

### Listar equipos

```text
GET /api/v1/equipos
```

Permitido para:

- administrador;
- supervisor.

### Crear equipo

```text
POST /api/v1/equipos
```

Body:

```json
{
  "codigo": "PE 910",
  "descripcion": "Perforadora PE 910",
  "modelo": "Perforadora operativa",
  "estado": "ACTIVO"
}
```

### Cambiar estado

```text
PATCH /api/v1/equipos/{idEquipo}/estado
```

Body:

```json
{
  "estado": "MANTENIMIENTO"
}
```

Estados validos:

- `ACTIVO`
- `INACTIVO`
- `MANTENIMIENTO`

### Desactivar equipo

```text
DELETE /api/v1/equipos/{idEquipo}
```

Resultado esperado:

```text
estado = INACTIVO
```

## 8. Perforaciones

### Crear perforacion valida

```text
POST /api/v1/perforaciones
```

Body:

```json
{
  "codigoPerforacion": "PERF-DEMO-001",
  "fecha": "2026-07-17",
  "fase": "Fase 7",
  "banco": 4110,
  "malla": "04",
  "idPozo": "105",
  "tipoRoca": "Toba (Blanda)",
  "profundidadDiseno": 10,
  "metrosPerforados": 10,
  "profundidadReal": 10,
  "horaInicio": "08:00",
  "horaFin": "08:20",
  "tipoPozo": "Produccion",
  "observaciones": "Registro de prueba",
  "idEquipo": 1
}
```

Respuesta esperada:

```text
estado = PENDIENTE
```

Debe incluir:

```json
{
  "calculos": {
    "duracionHoras": 0.33,
    "rop": 30,
    "adherencia": 100
  }
}
```

### Casos negativos recomendados

#### Banco invalido

Enviar:

```json
{
  "banco": 10
}
```

Resultado esperado:

```text
400 Bad Request
```

#### Profundidad fuera de rango

Enviar profundidad `30` para equipo distinto de `PE 907`.

Resultado esperado:

```text
400 Bad Request
```

#### Equipo inactivo

Crear perforacion con equipo `INACTIVO` o `MANTENIMIENTO`.

Resultado esperado:

```text
400 Bad Request
```

### Editar perforacion pendiente

```text
PUT /api/v1/perforaciones/{idPerforacion}
```

Body parcial:

```json
{
  "metrosPerforados": 9.8,
  "profundidadReal": 9.9,
  "observaciones": "Ajuste de carga"
}
```

Solo se permite si la perforacion esta:

```text
PENDIENTE
```

### Anular perforacion pendiente

```text
DELETE /api/v1/perforaciones/{idPerforacion}
```

Body:

```json
{
  "motivoRechazo": "Carga incorrecta detectada antes de revision"
}
```

Resultado esperado:

```text
estado = RECHAZADA
```

## 9. Dashboard

Endpoint:

```text
GET /api/v1/dashboard/resumen
```

Ejemplo con filtros:

```text
GET /api/v1/dashboard/resumen?fechaDesde=2026-07-01&fechaHasta=2026-07-31&estado=PENDIENTE
```

Respuesta esperada:

```json
{
  "data": {
    "kpis": {
      "metrosTotales": 100,
      "pozosCompletados": 10,
      "ropPromedio": 28.5,
      "adherenciaDiseno": 92
    },
    "graficos": {
      "metrosPorRoca": [],
      "distribucionTipoPozo": [],
      "metrosPorEquipo": [],
      "metrosPorFase": [],
      "metrosPorBanco": [],
      "rankingOperadores": [],
      "ropPorRoca": []
    }
  }
}
```

## 10. Pruebas automatizadas

Ejecutar:

```bash
npm.cmd test
```

Tipos de pruebas actuales:

- pruebas de disponibilidad;
- pruebas de autenticacion;
- pruebas de autorizacion;
- pruebas CRUD;
- pruebas de reglas de negocio;
- pruebas de validacion;
- pruebas de dashboard.

## 11. Criterio de aceptacion

Para considerar la API lista para demo:

- login exitoso;
- Swagger disponible;
- todos los tests pasan;
- se puede crear una perforacion valida;
- el dashboard devuelve KPIs;
- endpoints protegidos rechazan requests sin token.

