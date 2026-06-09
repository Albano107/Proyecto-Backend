import { Router } from 'express';
import {
    obtenerUsuarios,
    cambiarEstadoUsuario
} from '../controllers/usuarios.controller.js';

const router = Router();

router.get('/', obtenerUsuarios);
router.patch('/:id', cambiarEstadoUsuario);

export default router;