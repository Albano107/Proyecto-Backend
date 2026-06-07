import { Router } from 'express';
import { obtenerInventario } from '../controllers/inventario.controller.js';

const router = Router();

router.get('/', obtenerInventario);

export default router;