import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import productosRoutes from './routes/productos.routes.js';

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
app.use('/productos', productosRoutes);

export default app;