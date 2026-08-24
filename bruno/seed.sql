-- Esquema + datos mínimos para poder correr la colección de Bruno end-to-end.
-- Inferido de las columnas que usan los controllers en src/controllers/*.js.
-- Pensado para una base de PRUEBA descartable (ver TESTING.md en la raíz del backend).

IF DB_ID('ProyectoBD') IS NULL
    CREATE DATABASE ProyectoBD;
GO

USE ProyectoBD;
GO

CREATE TABLE Roles (
    id_rol INT IDENTITY PRIMARY KEY,
    nombre NVARCHAR(50) NOT NULL
);

CREATE TABLE Sucursales (
    id_sucursal INT IDENTITY PRIMARY KEY,
    nombre NVARCHAR(100) NOT NULL
);

CREATE TABLE Departamentos (
    id_departamento INT IDENTITY PRIMARY KEY,
    nombre NVARCHAR(100) NOT NULL,
    dias_alerta INT NOT NULL
);

CREATE TABLE Usuarios (
    id_usuario INT IDENTITY PRIMARY KEY,
    nombre NVARCHAR(100) NOT NULL,
    email NVARCHAR(150) NOT NULL,
    password NVARCHAR(100) NOT NULL,
    pin NVARCHAR(10) NULL,
    activo BIT NOT NULL DEFAULT 1,
    id_rol INT NOT NULL FOREIGN KEY REFERENCES Roles(id_rol),
    id_sucursal INT NULL FOREIGN KEY REFERENCES Sucursales(id_sucursal)
);

CREATE TABLE Productos (
    id_producto INT IDENTITY PRIMARY KEY,
    nombre NVARCHAR(150) NOT NULL,
    codigo_barras NVARCHAR(100) NULL,
    id_departamento INT NOT NULL FOREIGN KEY REFERENCES Departamentos(id_departamento),
    activo BIT NOT NULL DEFAULT 1
);

CREATE TABLE Inventario (
    id_inventario INT IDENTITY PRIMARY KEY,
    id_producto INT NOT NULL FOREIGN KEY REFERENCES Productos(id_producto),
    id_sucursal INT NOT NULL FOREIGN KEY REFERENCES Sucursales(id_sucursal),
    fecha_vencimiento DATE NOT NULL,
    cantidad INT NOT NULL,
    fecha_registro DATETIME NOT NULL DEFAULT GETDATE()
);

CREATE TABLE Retiros (
    id_retiro INT IDENTITY PRIMARY KEY,
    id_inventario INT NOT NULL FOREIGN KEY REFERENCES Inventario(id_inventario),
    cantidad INT NOT NULL,
    motivo NVARCHAR(200) NULL,
    fecha_retiro DATETIME NOT NULL DEFAULT GETDATE(),
    id_usuario INT NOT NULL FOREIGN KEY REFERENCES Usuarios(id_usuario)
);
GO

INSERT INTO Roles (nombre) VALUES ('Administrador'), ('Operario');
INSERT INTO Sucursales (nombre) VALUES ('Sucursal Centro');
INSERT INTO Departamentos (nombre, dias_alerta) VALUES ('Lacteos', 5);

-- Usuario de prueba: coincide con las variables email/password/pin del entorno "Local" de Bruno
INSERT INTO Usuarios (nombre, email, password, pin, activo, id_rol, id_sucursal)
VALUES ('Admin Demo', 'admin@gondolapro.com', '1234', '1234', 1, 1, 1);

INSERT INTO Productos (nombre, codigo_barras, id_departamento, activo)
VALUES ('Leche entera 1L', '7791234567890', 1, 1);

-- Dos registros de inventario: id 1 se usa para editar/retirar, id 2 se usa (y se borra) en los tests de baja
INSERT INTO Inventario (id_producto, id_sucursal, fecha_vencimiento, cantidad, fecha_registro)
VALUES (1, 1, '2026-09-01', 10, GETDATE());

INSERT INTO Inventario (id_producto, id_sucursal, fecha_vencimiento, cantidad, fecha_registro)
VALUES (1, 1, '2026-10-01', 5, GETDATE());
GO
