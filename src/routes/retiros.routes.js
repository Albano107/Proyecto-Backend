import { Router } from 'express';
import {
    obtenerRetiros,
    registrarRetiro
} from '../controllers/retiros.controller.js';

const router = Router();

router.get('/', obtenerRetiros);
router.post('/', registrarRetiro);

export default router;