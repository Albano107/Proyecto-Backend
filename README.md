# Proyecto Backend - Plataforma de Monitoreo de Productos en Góndola

Backend desarrollado con Node.js, Express y SQL Server para la gestión de productos próximos a vencer y control de mermas en supermercados.

---

# 📦 Tecnologías Utilizadas

- Node.js
- Express.js
- SQL Server
- JWT
- Docker (pendiente)
- React (Frontend)
- Git y GitHub

---

# 📂 Estructura del Proyecto

```txt
Proyecto-Backend/
│
├── src/
│   │
│   ├── config/
│   │   └── db.js
│   │
│   ├── controllers/
│   │
│   ├── routes/
│   │
│   ├── services/
│   │
│   ├── middlewares/
│   │
│   ├── utils/
│   │
│   ├── app.js
│   │
│   └── server.js
│
├── .env
├── .gitignore
├── package.json
└── README.md
```

---

# 📂 Explicación de Carpetas

## 📂 src/config
Contiene configuraciones generales del sistema.

### db.js
Archivo encargado de establecer la conexión con SQL Server.

---

## 📂 src/controllers
Contiene la lógica principal de cada módulo del sistema.

### auth.controller.js
Maneja autenticación y login de usuarios.

### productos.controller.js
Gestiona operaciones relacionadas con productos.

### inventario.controller.js
Gestiona el registro y consulta de productos controlados en góndola.

### retiros.controller.js
Gestiona el registro de productos retirados por vencimiento o merma.

### dashboard.controller.js
Genera estadísticas y datos para el panel principal.

---

## 📂 src/routes
Define los endpoints de la API REST.

### auth.routes.js
Rutas relacionadas con autenticación.

### productos.routes.js
Rutas para gestión de productos.

### inventario.routes.js
Rutas para control de inventario y alertas.

### retiros.routes.js
Rutas para registro y consulta de mermas.

### dashboard.routes.js
Rutas para estadísticas y reportes.

---

## 📂 src/services
Contiene lógica reutilizable del sistema.

### semaforo.service.js
Calcula el estado de los productos:
- Verde
- Amarillo
- Rojo

según fecha de vencimiento y días de alerta del departamento.

---

## 📂 src/middlewares
Middlewares utilizados por Express.

### auth.middleware.js
Valida autenticación mediante JWT.

### role.middleware.js
Controla permisos según rol del usuario.

---

## 📂 src/utils
Funciones auxiliares reutilizables.

### helpers.js
Funciones de apoyo para validaciones, fechas y utilidades generales.

---

## 📄 src/app.js
Configura Express, middlewares y rutas principales.

---

## 📄 src/server.js
Inicializa y levanta el servidor backend.

---

## 📄 .env
Archivo de variables de entorno.

Ejemplos:
- conexión a base de datos
- puerto
- claves JWT

---

## 📄 package.json
Archivo de configuración del proyecto Node.js y dependencias.

---

## 📄 .gitignore
Define archivos y carpetas que Git no debe subir.

---

## 📄 README.md
Documentación general del backend y estructura del proyecto.

---

# 🚀 Inicialización del Proyecto

## Crear proyecto Node.js

```bash
npm init -y
```

---

# 📦 Instalación de Dependencias

## Dependencias principales

```bash
npm install express mssql dotenv cors jsonwebtoken bcryptjs
```

## Dependencia para conexión Windows + SQL Server

```bash
npm install msnodesqlv8
```

## Dependencia de desarrollo

```bash
npm install --save-dev nodemon
```

---

# 📦 Dependencias Utilizadas

| Dependencia | Función |
|---|---|
| express | Framework backend |
| mssql | Conexión con SQL Server |
| dotenv | Variables de entorno |
| cors | Comunicación Frontend/Backend |
| jsonwebtoken | Autenticación JWT |
| bcryptjs | Encriptación de contraseñas |
| nodemon | Reinicio automático del servidor |
| msnodesqlv8 | Driver para conexión SQL Server con autenticación Windows |

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

DB_DRIVER=msnodesqlv8
DB_SERVER=ALBANO\SQLEXPRESS01
DB_DATABASE=ProyectoBD

JWT_SECRET=proyecto_secreto
```

---

# 🚫 Archivo .gitignore

```txt
node_modules
.env
```

---

# 📄 app.js

```js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.json({
        mensaje: 'Backend funcionando correctamente'
    });
});

export default app;
```

---

# 📄 server.js

```js
import app from './app.js';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';

dotenv.config();

const PORT = process.env.PORT || 3000;

connectDB();

app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});
```

---

# 📄 db.js

```js
import sql from 'mssql/msnodesqlv8.js';
import dotenv from 'dotenv';

dotenv.config();

const config = {
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    driver: process.env.DB_DRIVER,
    options: {
        trustedConnection: true
    }
};

export const connectDB = async () => {
    try {
        await sql.connect(config);
        console.log('Conectado a SQL Server');
    } catch (error) {
        console.error('Error de conexión:', error);
    }
};

export default sql;
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
- [x] Conexión con SQL Server
- [x] Variables de entorno
- [x] Estructura de carpetas
- [x] Endpoint de prueba funcionando
- [ ] Implementación de endpoints
- [ ] Autenticación JWT
- [ ] Dashboard
- [ ] Dockerización

---