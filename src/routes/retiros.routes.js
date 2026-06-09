import { Router } from 'express';
import { obtenerRetiros } from '../controllers/retiros.controller.js';

const router = Router();

router.get('/', obtenerRetiros);

export default router;