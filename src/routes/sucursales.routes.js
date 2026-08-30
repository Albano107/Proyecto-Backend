import { Router } from 'express';
import { obtenerSucursales, obtenerResumenSucursales } from '../controllers/sucursales.controller.js';

const router = Router();

router.get('/', obtenerSucursales);
// Sin middleware de auth a propósito: lo llama la pantalla de login antes de
// que exista un token.
router.get('/resumen', obtenerResumenSucursales);

export default router;