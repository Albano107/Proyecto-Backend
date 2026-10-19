

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.routes.js';
import productosRoutes from './routes/productos.routes.js';
import inventarioRoutes from './routes/inventario.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import usuariosRoutes from './routes/usuarios.routes.js';
import retirosRoutes from './routes/retiros.routes.js';
import sucursalesRoutes from './routes/sucursales.routes.js';
import auditoriasRoutes from './routes/auditorias.routes.js';

import {
    verificarToken,
    permitirRoles
} from './middlewares/auth.middleware.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// ==========================================
// VERIFICAR QUE EL BACKEND FUNCIONE
// ==========================================

app.get('/', (req, res) => {
    res.json({
        mensaje: 'Backend funcionando correctamente'
    });
});

// ==========================================
// LOGIN PUBLICO
// ==========================================

// Permite ingresar con email o PIN.
app.use('/auth', authRoutes);

// ==========================================
// SUCURSALES
// ==========================================

// El login consulta las sucursales y su resumen
// antes de autenticar al usuario.
// Solo esas consultas de lectura son publicas.
app.use('/sucursales', (req, res, next) => {

    const consultaPublica =
        req.method === 'GET' &&
        (req.path === '/' || req.path === '/resumen');

    if (consultaPublica) {
        return next();
    }

    return verificarToken(req, res, next);

}, sucursalesRoutes);

// ==========================================
// PRODUCTOS Y DASHBOARD
// ==========================================

app.use(
    '/productos',
    verificarToken,
    productosRoutes
);

app.use(
    '/dashboard',
    verificarToken,
    dashboardRoutes
);

// ==========================================
// INVENTARIO
// ==========================================

// Solo Administrador puede eliminar registros.
const verificarPermisoInventario = (req, res, next) => {

    if (req.method === 'DELETE') {
        return permitirRoles('Administrador')(req, res, next);
    }

    return next();
};

app.use(
    '/inventario',
    verificarToken,
    verificarPermisoInventario,
    inventarioRoutes
);

// ==========================================
// RETIROS
// ==========================================

// Administrador y Operario pueden registrar retiros.
app.use(
    '/retiros',
    verificarToken,
    retirosRoutes
);

// ==========================================
// ADMINISTRACION DE USUARIOS
// ==========================================

app.use(
    '/usuarios',
    verificarToken,
    permitirRoles('Administrador'),
    usuariosRoutes
);

// ==========================================
// AUDITORIAS
// ==========================================

app.use(
    '/auditorias',
    verificarToken,
    permitirRoles('Administrador'),
    auditoriasRoutes
);

export default app;
