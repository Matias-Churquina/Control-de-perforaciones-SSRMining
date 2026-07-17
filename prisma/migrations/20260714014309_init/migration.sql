BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[Roles] (
    [idRol] INT NOT NULL IDENTITY(1,1),
    [nombre] NVARCHAR(50) NOT NULL,
    [descripcion] NVARCHAR(255),
    [activo] BIT NOT NULL CONSTRAINT [Roles_activo_df] DEFAULT 1,
    [fechaCreacion] DATETIME2 NOT NULL CONSTRAINT [Roles_fechaCreacion_df] DEFAULT CURRENT_TIMESTAMP,
    [fechaActualizacion] DATETIME2 NOT NULL,
    CONSTRAINT [Roles_pkey] PRIMARY KEY CLUSTERED ([idRol]),
    CONSTRAINT [Roles_nombre_key] UNIQUE NONCLUSTERED ([nombre])
);

-- CreateTable
CREATE TABLE [dbo].[Usuarios] (
    [idUsuario] INT NOT NULL IDENTITY(1,1),
    [idRol] INT NOT NULL,
    [legajo] NVARCHAR(50) NOT NULL,
    [nombre] NVARCHAR(100) NOT NULL,
    [apellido] NVARCHAR(100) NOT NULL,
    [email] NVARCHAR(150) NOT NULL,
    [passwordHash] NVARCHAR(255) NOT NULL,
    [activo] BIT NOT NULL CONSTRAINT [Usuarios_activo_df] DEFAULT 1,
    [fechaAlta] DATETIME2 NOT NULL CONSTRAINT [Usuarios_fechaAlta_df] DEFAULT CURRENT_TIMESTAMP,
    [ultimoAcceso] DATETIME2,
    CONSTRAINT [Usuarios_pkey] PRIMARY KEY CLUSTERED ([idUsuario]),
    CONSTRAINT [Usuarios_legajo_key] UNIQUE NONCLUSTERED ([legajo]),
    CONSTRAINT [Usuarios_email_key] UNIQUE NONCLUSTERED ([email])
);

-- CreateTable
CREATE TABLE [dbo].[Equipos] (
    [idEquipo] INT NOT NULL IDENTITY(1,1),
    [codigo] NVARCHAR(50) NOT NULL,
    [descripcion] NVARCHAR(150) NOT NULL,
    [modelo] NVARCHAR(100),
    [estado] NVARCHAR(20) NOT NULL CONSTRAINT [Equipos_estado_df] DEFAULT 'ACTIVO',
    [fechaAlta] DATETIME2 NOT NULL CONSTRAINT [Equipos_fechaAlta_df] DEFAULT CURRENT_TIMESTAMP,
    [fechaActualizacion] DATETIME2 NOT NULL,
    CONSTRAINT [Equipos_pkey] PRIMARY KEY CLUSTERED ([idEquipo]),
    CONSTRAINT [Equipos_codigo_key] UNIQUE NONCLUSTERED ([codigo])
);

-- CreateTable
CREATE TABLE [dbo].[Perforaciones] (
    [idPerforacion] INT NOT NULL IDENTITY(1,1),
    [codigoPerforacion] NVARCHAR(50) NOT NULL,
    [fecha] DATE NOT NULL,
    [fase] NVARCHAR(50) NOT NULL,
    [banco] INT NOT NULL,
    [malla] NVARCHAR(50) NOT NULL,
    [idPozo] NVARCHAR(50) NOT NULL,
    [tipoRoca] NVARCHAR(50) NOT NULL,
    [profundidadDiseno] DECIMAL(10,2) NOT NULL,
    [metrosPerforados] DECIMAL(10,2) NOT NULL,
    [profundidadReal] DECIMAL(10,2) NOT NULL,
    [horaInicio] TIME NOT NULL,
    [horaFin] TIME NOT NULL,
    [tipoPozo] NVARCHAR(50) NOT NULL,
    [observaciones] NVARCHAR(max),
    [estado] NVARCHAR(20) NOT NULL CONSTRAINT [Perforaciones_estado_df] DEFAULT 'PENDIENTE',
    [idUsuarioRegistro] INT NOT NULL,
    [idSupervisorRevision] INT,
    [fechaRevision] DATETIME2,
    [motivoRechazo] NVARCHAR(255),
    [idEquipo] INT NOT NULL,
    [fechaCreacion] DATETIME2 NOT NULL CONSTRAINT [Perforaciones_fechaCreacion_df] DEFAULT CURRENT_TIMESTAMP,
    [fechaActualizacion] DATETIME2 NOT NULL,
    CONSTRAINT [Perforaciones_pkey] PRIMARY KEY CLUSTERED ([idPerforacion]),
    CONSTRAINT [Perforaciones_codigoPerforacion_key] UNIQUE NONCLUSTERED ([codigoPerforacion])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Perforaciones_fecha_idx] ON [dbo].[Perforaciones]([fecha]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Perforaciones_estado_idx] ON [dbo].[Perforaciones]([estado]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Perforaciones_idEquipo_idx] ON [dbo].[Perforaciones]([idEquipo]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Perforaciones_idUsuarioRegistro_idx] ON [dbo].[Perforaciones]([idUsuarioRegistro]);

-- AddForeignKey
ALTER TABLE [dbo].[Usuarios] ADD CONSTRAINT [Usuarios_idRol_fkey] FOREIGN KEY ([idRol]) REFERENCES [dbo].[Roles]([idRol]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Perforaciones] ADD CONSTRAINT [Perforaciones_idUsuarioRegistro_fkey] FOREIGN KEY ([idUsuarioRegistro]) REFERENCES [dbo].[Usuarios]([idUsuario]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Perforaciones] ADD CONSTRAINT [Perforaciones_idSupervisorRevision_fkey] FOREIGN KEY ([idSupervisorRevision]) REFERENCES [dbo].[Usuarios]([idUsuario]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Perforaciones] ADD CONSTRAINT [Perforaciones_idEquipo_fkey] FOREIGN KEY ([idEquipo]) REFERENCES [dbo].[Equipos]([idEquipo]) ON DELETE NO ACTION ON UPDATE NO ACTION;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
