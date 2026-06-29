import { Router } from 'express';

import {
    obtenerRetiros,
    obtenerResumenRetiros,
    registrarRetiro
} from '../controllers/retiros.controller.js';

const router = Router();

router.get('/', obtenerRetiros);
router.get('/resumen', obtenerResumenRetiros);
router.post('/', registrarRetiro);

export default router;