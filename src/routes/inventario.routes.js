import { Router } from 'express';
import {
    obtenerInventario,
    agregarInventario,
    editarInventario,
    eliminarInventario
} from '../controllers/inventario.controller.js';

const router = Router();

router.get('/',      obtenerInventario);
router.post('/',     agregarInventario);
router.put('/:id',   editarInventario);
router.delete('/:id',eliminarInventario);

export default router;