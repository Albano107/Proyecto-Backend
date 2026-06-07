import { Router } from 'express';
import { login, loginPin } from '../controllers/auth.controller.js';

const router = Router();

router.post('/login', login);
router.post('/login-pin', loginPin);

export default router;