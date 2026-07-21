# Reglas de Negocio

Preparado por **Credere.Dev**.

## 1. Objetivo del dominio

El sistema controla registros de perforaciones mineras, permitiendo registrar datos operativos, validar consistencia QA/QC, administrar equipos y usuarios, y exponer metricas para supervision.

## 2. Roles

### ADMINISTRADOR

Responsable de configuracion general:

- administra usuarios;
- administra roles;
- administra equipos;
- puede registrar perforaciones;
- puede editar o anular perforaciones pendientes;
- puede consultar dashboard.

### SUPERVISOR

Responsable del control operativo:

- consulta equipos;
- cambia estado operativo de equipos;
- registra perforaciones;
- edita o anula perforaciones pendientes;
- consulta dashboard;
- en Fase 8 aprobara o rechazara perforaciones formalmente.

### OPERADOR

Responsable de carga operativa:

- registra perforaciones;
- consulta sus propias perforaciones;
- edita o anula sus propias perforaciones mientras esten pendientes.

## 3. Usuarios

### Alta

Un usuario requiere:

- rol activo;
- legajo unico;
- email unico;
- nombre;
- apellido;
- password minimo de 8 caracteres.

### Normalizacion

El backend normaliza:

- email a minusculas;
- legajo sin espacios extremos;
- nombre y apellido sin espacios extremos;
- espacios multiples a valores limpios donde aplica.

### Seguridad administrativa

Reglas implementadas:

- no se puede desactivar el propio usuario;
- no se puede desactivar el ultimo administrador activo;
- passwords se guardan como hash bcrypt;
- `ultimoAcceso` se actualiza en login exitoso.

## 4. Equipos

### Estados

Estados validos:

- `ACTIVO`
- `INACTIVO`
- `MANTENIMIENTO`

### Reglas

- codigo de equipo unico;
- solo equipos `ACTIVO` pueden usarse para registrar perforaciones;
- `DELETE /equipos/:idEquipo` no borra fisicamente, cambia estado a `INACTIVO`;
- supervisor y administrador pueden cambiar estado;
- solo administrador puede crear, editar o desactivar equipos.

## 5. Perforaciones

### Estado inicial

Toda perforacion creada nace como:

```text
PENDIENTE
```

### Estados validos

- `PENDIENTE`
- `APROBADA`
- `RECHAZADA`

### Campos requeridos

Una perforacion requiere:

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
- idEquipo.

### Validacion de banco

El banco debe estar entre:

```text
2500 y 5000
```

### Validacion de equipo

El equipo debe:

- existir;
- estar `ACTIVO`.

### Validacion de profundidad por equipo

Regla actual:

- `PE 907`: profundidad entre 1 y 20 metros.
- otros equipos: profundidad entre 1 y 12 metros.

Esta regla surge del prototipo operativo inicial y debe ser revisada con SSRMining si se agregan nuevos equipos con capacidades diferentes.

### Tolerancia QA/QC

Se valida contra `profundidadDiseno`.

Rango permitido:

```text
30% a 170% del diseno
```

Campos controlados:

- `metrosPerforados`
- `profundidadReal`

Si alguno queda fuera del rango, el backend rechaza el registro.

### Horas

Formato:

```text
HH:mm
```

Si `horaFin` es menor o igual a `horaInicio`, se interpreta cruce de medianoche.

Ejemplo:

```text
23:40 -> 00:20 = 0.67 horas
```

### Calculos derivados

No se almacenan en base.

Se calculan en respuestas:

#### Duracion

```text
duracionHoras = horaFin - horaInicio
```

#### ROP

```text
ROP = metrosPerforados / duracionHoras
```

#### Adherencia

```text
adherencia = (metrosPerforados / profundidadDiseno) * 100
```

## 6. Edicion de perforaciones

Solo se pueden editar perforaciones:

```text
PENDIENTE
```

Reglas de permiso:

- administrador puede editar pendientes;
- supervisor puede editar pendientes;
- operador puede editar solo sus propias pendientes.

## 7. Anulacion operativa

La anulacion operativa se realiza con:

```text
DELETE /api/v1/perforaciones/:idPerforacion
```

No borra fisicamente.

Cambia estado a:

```text
RECHAZADA
```

Requiere:

```json
{
  "motivoRechazo": "Carga incorrecta detectada antes de revision"
}
```

La anulacion operativa esta pensada para correccion temprana antes del flujo formal de revision.

## 8. Dashboard

El dashboard calcula datos agregados en base a perforaciones existentes.

KPIs:

- metros totales;
- pozos completados;
- ROP promedio;
- adherencia al diseno.

Series:

- metros por roca;
- distribucion por tipo de pozo;
- metros por equipo;
- metros por fase;
- metros por banco;
- ranking de operadores;
- ROP por roca.

## 9. Reglas pendientes para Fase 8

La revision del supervisor debe separar claramente:

- aprobacion formal;
- rechazo formal;
- motivo de rechazo;
- usuario supervisor;
- fecha de revision;
- bloqueo posterior de edicion.

