import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.routes.js';
import productosRoutes from './routes/productos.routes.js';
import inventarioRoutes from './routes/inventario.routes.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());


app.get('/', (req, res) => {
    res.json({
        mensaje: 'Backend funcionando correctamente'
    });
});

// Rutas
app.use('/auth', authRoutes);
app.use('/productos', productosRoutes);
app.use('/inventario', inventarioRoutes);

export default app;