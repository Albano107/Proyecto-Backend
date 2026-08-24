# Proyecto Backend - Plataforma de Monitoreo de Productos en Góndola

Backend desarrollado con Node.js, Express y SQL Server para la gestión de productos próximos a vencer y control de mermas en supermercados.

> 🧪 **Tests de API:** hay una colección de [Bruno](https://www.usebruno.com/) lista para probar todos los endpoints de forma visual — ver [`TESTING.md`](./TESTING.md) para correrla (incluye una base de prueba descartable con Docker) y [`bruno/README.md`](./bruno/README.md) para el detalle de cada request.

---

# 📦 Tecnologías Utilizadas

- Node.js
- Express 5
- SQL Server (driver `mssql`, conexión estándar por usuario/contraseña)
- dotenv
- cors
- Docker
- React (Frontend)
- Git y GitHub

---

# 📂 Estructura del Proyecto

```txt
GongolaPRO-back/
│
├── src/
│   │
│   ├── config/
│   │   └── db.js
│   │
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── productos.controller.js
│   │   ├── inventario.controller.js
│   │   ├── dashboard.controller.js
│   │   ├── usuarios.controller.js
│   │   ├── retiros.controller.js
│   │   └── sucursales.controller.js
│   │
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── productos.routes.js
│   │   ├── inventario.routes.js
│   │   ├── dashboard.routes.js
│   │   ├── usuarios.routes.js
│   │   ├── retiros.routes.js
│   │   └── sucursales.routes.js
│   │
│   ├── services/
│   │   └── semaforo.service.js
│   │
│   ├── app.js
│   │
│   └── server.js
│
├── bruno/              # colección de tests de API (ver TESTING.md)
├── Dockerfile
├── .env
├── .gitignore
├── package.json
├── README.md
└── TESTING.md          # cómo correr los tests vos mismo
```

> Nota: `middlewares/` y `utils/` todavía no existen — no hay validación de JWT ni control de rol a nivel de backend por ahora (ver "Estado actual").

---

# 📂 Explicación de Carpetas

## 📂 src/config
Contiene configuraciones generales del sistema.

### db.js
Establece la conexión con SQL Server usando `mssql` (usuario/contraseña, sin autenticación Windows) y reintenta la conexión hasta 5 veces con 5s de espera antes de fallar.

---

## 📂 src/controllers
Contiene la lógica principal de cada módulo del sistema.

### auth.controller.js
Login por email/contraseña y por PIN. Consulta directamente `Usuarios` (con su `Rol` y `Sucursal`) y compara la contraseña en texto plano.

### productos.controller.js
Lista el catálogo de productos.

### inventario.controller.js
CRUD del inventario controlado en góndola (alta, edición, baja y listado con paginación/filtros).

### dashboard.controller.js
Genera estadísticas y datos para el panel principal (`inicio`).

### usuarios.controller.js
Lista usuarios y permite activar/desactivar cuentas.

### retiros.controller.js
Registra retiros de productos por vencimiento o merma, y expone su historial y resumen.

### sucursales.controller.js
Lista las sucursales, usadas como filtro en Inventario y Reportes.

---

## 📂 src/routes
Define los endpoints de la API REST. Todas montadas en `app.js` bajo su propio prefijo.

| Prefijo | Rutas | Descripción |
|---|---|---|
| `/auth` | `POST /login`, `POST /login-pin` | Autenticación por email/contraseña o PIN |
| `/productos` | `GET /` | Catálogo de productos |
| `/inventario` | `GET /`, `POST /`, `PUT /:id`, `DELETE /:id` | CRUD de inventario en góndola |
| `/dashboard` | `GET /` | Resumen/estadísticas para Inicio |
| `/usuarios` | `GET /`, `PATCH /:id` | Listado y alta/baja de usuarios |
| `/retiros` | `GET /`, `GET /resumen`, `POST /` | Historial, resumen y registro de retiros/mermas |
| `/sucursales` | `GET /` | Listado de sucursales |

---

## 📂 src/services
Contiene lógica reutilizable del sistema.

### semaforo.service.js
Calcula el estado de un producto (`calcularEstado(fechaVencimiento, diasAlerta)`):
- **ROJO** → ya venció
- **AMARILLO** → vence dentro de los días de alerta configurados
- **VERDE** → fuera de la ventana de alerta

---

## 📄 src/app.js
Configura Express (`cors`, `express.json`) y monta las 7 rutas anteriores.

---

## 📄 src/server.js
Espera a `connectDB()` y luego levanta el servidor con `app.listen`.

---

## 📄 .env
Archivo de variables de entorno (no versionado).

---

## 📄 package.json
Archivo de configuración del proyecto Node.js y dependencias.

---

## 📄 Dockerfile
Imagen `node:20`, instala dependencias, copia el código y arranca con `npm run start`. Expone el puerto `3000`.

---

## 📄 .gitignore
Define archivos y carpetas que Git no debe subir.

---

# 🚀 Inicialización del Proyecto

## Crear proyecto Node.js

```bash
npm init -y
```

---

# 📦 Dependencias Utilizadas

| Dependencia | Función |
|---|---|
| express | Framework backend |
| mssql | Conexión con SQL Server |
| dotenv | Variables de entorno |
| cors | Comunicación Frontend/Backend |
| nodemon | Reinicio automático del servidor (dev) |

> `jsonwebtoken`, `bcryptjs` y `msnodesqlv8` (autenticación Windows) ya no forman parte del proyecto — la conexión actual a SQL Server usa usuario/contraseña estándar y el login todavía no emite JWT ni hashea contraseñas (ver "Lo que falta").

---

# ⚙️ Configuración package.json

```json
{
  "name": "proyecto-backend",
  "version": "1.0.0",
  "description": "Backend del sistema de monitoreo de vencimientos",
  "type": "module",
  "main": "src/server.js",
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js"
  }
}
```

---

# 🔐 Variables de Entorno

## Archivo `.env`

```env
PORT=3000

DB_SERVER=localhost
DB_DATABASE=ProyectoBD
DB_USER=sa
DB_PASSWORD=tu_password
DB_PORT=1433
```

---

# 🚫 Archivo .gitignore

```txt
node_modules
.env
```

---

# 🐳 Docker

```bash
docker build -t gondolapro-back .
docker run -p 3000:3000 --env-file .env gondolapro-back
```

---

# 🚀 Ejecución del Proyecto

## Instalar dependencias

```bash
npm install
```

## Ejecutar en desarrollo

```bash
npm run dev
```

## Ejecutar en producción

```bash
npm start
```

---

# 🌐 Endpoint de prueba

## Endpoint

```txt
GET /
```

## Respuesta esperada

```json
{
   "mensaje": "Backend funcionando correctamente"
}
```

---

# ✅ Estado Actual del Proyecto

- [x] Configuración inicial del backend
- [x] Conexión con SQL Server (con reintentos)
- [x] Variables de entorno
- [x] Estructura de carpetas
- [x] Endpoints de auth, productos, inventario, dashboard, usuarios, retiros y sucursales
- [x] Dockerización
- [x] Colección de tests de API visual (Bruno) cubriendo todos los endpoints
- [ ] Autenticación real con JWT (el login solo valida contra la base y devuelve los datos del usuario, sin emitir token)
- [ ] Hash de contraseñas (hoy se comparan en texto plano)
- [ ] Middleware de autenticación y control de acceso por rol
- [ ] Exportación de reportes a Excel/PDF

---
