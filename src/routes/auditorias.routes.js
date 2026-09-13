import { Router } from 'express';
import { obtenerAuditorias } from '../controllers/auditorias.controller.js';

const router = Router();

router.get('/', obtenerAuditorias);

export default router;
