import sql from '../config/db.js';
import { calcularEstado } from '../services/semaforo.service.js';

export const obtenerInventario = async (req, res) => {

    try {

        const resultado = await sql.query(`
            SELECT
                i.id_inventario,
                p.nombre AS producto,
                d.nombre AS departamento,
                d.dias_alerta,
                s.nombre AS sucursal,
                i.cantidad,
                i.fecha_vencimiento
            FROM Inventario i
            INNER JOIN Productos p
                ON i.id_producto = p.id_producto
            INNER JOIN Departamentos d
                ON p.id_departamento = d.id_departamento
            INNER JOIN Sucursales s
                ON i.id_sucursal = s.id_sucursal
        `);

        const inventario = resultado.recordset.map(item => ({
            ...item,
            estado: calcularEstado(
                item.fecha_vencimiento,
                item.dias_alerta
            )
        }));

        res.status(200).json(inventario);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            mensaje: 'Error al obtener inventario'
        });

    }

};