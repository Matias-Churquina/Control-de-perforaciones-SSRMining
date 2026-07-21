# Estrategia de Calidad Backend

Preparado por **Credere.Dev**.

## 1. Objetivo

La estrategia de calidad busca asegurar que el backend sea confiable, demostrable y mantenible antes de avanzar al frontend. En esta etapa se prioriza estabilidad funcional, pruebas automatizadas, documentacion y trazabilidad de reglas de negocio.

## 2. Capas de calidad

### Calidad estatica

Herramienta:

```bash
npm.cmd run build
```

Valida:

- tipado TypeScript;
- imports;
- errores estructurales;
- compatibilidad de tipos Prisma;
- errores de compilacion.

### Calidad funcional automatizada

Herramienta:

```bash
npm.cmd test
```

Stack:

- Jest;
- Supertest;
- Express app;
- Prisma Client;
- SQL Server local.

### Calidad documental

Evidencias:

- `README.md`;
- `docs/openapi.yaml`;
- `docs/backend-v1.md`;
- `docs/business-rules.md`;
- `docs/api-testing-guide.md`;
- `docs/executive-summary.md`.

## 3. Tipos de pruebas implementadas

### Smoke tests

Validan que el servicio responda.

Ejemplo:

- `GET /health`

### Pruebas de autenticacion

Validan:

- login exitoso;
- login invalido;
- obtencion de usuario autenticado;
- token requerido.

### Pruebas de autorizacion

Validan:

- rutas protegidas sin token devuelven `401`;
- usuarios sin rol adecuado no deberian acceder a rutas administrativas;
- reglas de rol aplican por middleware.

### Pruebas CRUD

Cubren:

- usuarios;
- roles;
- equipos;
- perforaciones.

### Pruebas de reglas de negocio

Cubren:

- bloqueo de auto-desactivacion de administrador;
- bloqueo de ultimo administrador activo;
- equipo activo requerido para perforacion;
- profundidad por equipo;
- tolerancia QA/QC;
- anulacion de perforaciones pendientes.

### Pruebas de dashboard

Validan:

- endpoint protegido;
- filtros;
- estructura de KPIs;
- estructura de datasets.

## 4. Comandos obligatorios antes de PR

```bash
npm.cmd run build
npm.cmd test
```

Ambos deben finalizar correctamente.

## 5. Riesgos actuales

### Base compartida para pruebas

Las pruebas actuales escriben sobre la base local de desarrollo. Esto es aceptable en etapa inicial, pero para madurez superior se recomienda:

- base separada de test;
- reset automatico antes de suite;
- seed especifico de test;
- transacciones por suite o limpieza por prefijos `TEST`.

### Credenciales seed

Las credenciales seed son utiles para desarrollo, pero deben cambiarse fuera de local.

### Permisos amplios de desarrollo

El usuario `ssrmining_app` tiene permisos altos para permitir migraciones locales. En produccion debe usarse un esquema mas estricto.

## 6. Mejoras recomendadas para siguiente iteracion

- Agregar script `check`.
- Agregar environment `.env.test`.
- Separar base `SSRMiningControlTest`.
- Agregar pruebas de supervisor en Fase 8.
- Agregar pruebas negativas de roles para cada modulo.
- Agregar cobertura de codigo.
- Exportar coleccion Postman.
- Agregar pipeline CI en GitHub Actions.

## 7. Evidencia de calidad esperada

Una entrega candidata debe presentar:

- captura o log de `npm run build`;
- captura o log de `npm test`;
- Swagger navegable;
- base migrada;
- seed cargado;
- README actualizado;
- version/tag o commit de entrega.

## 8. Criterios de salida de Fase 10

La Fase 10 se considera cerrada cuando:

- la documentacion esta actualizada;
- Swagger identifica correctamente la API;
- README permite instalar desde cero;
- pruebas principales estan documentadas;
- reglas de negocio estan explicitadas;
- marca Credere.Dev esta incluida en documentacion;
- el repositorio queda sin cambios pendientes.

