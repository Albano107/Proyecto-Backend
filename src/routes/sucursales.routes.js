import { Router } from 'express';
import { obtenerSucursales } from '../controllers/sucursales.controller.js';

const router = Router();

router.get('/', obtenerSucursales);

export default router;