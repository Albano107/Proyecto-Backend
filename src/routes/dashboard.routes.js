import { Router } from 'express';
import { obtenerDashboard } from '../controllers/dashboard.controller.js';

const router = Router();

router.get('/', obtenerDashboard);

export default router;