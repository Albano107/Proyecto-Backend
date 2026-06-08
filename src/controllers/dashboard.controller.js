import sql from '../config/db.js';
import { calcularEstado } from '../services/semaforo.service.js';

export const obtenerDashboard = async (req, res) => {

    try {

        // Inventario + Departamentos
        const inventarioResult = await sql.query(`
            SELECT
                p.nombre AS producto,
                d.dias_alerta,
                i.fecha_vencimiento
            FROM Inventario i
            INNER JOIN Productos p
                ON i.id_producto = p.id_producto
            INNER JOIN Departamentos d
                ON p.id_departamento = d.id_departamento
        `);

        // Usuarios activos
        const usuariosResult = await sql.query(`
            SELECT *
            FROM Usuarios
            WHERE activo = 1
        `);

        // Últimos retiros
        const retirosResult = await sql.query(`
            SELECT TOP 5
                r.cantidad,
                r.motivo,
                r.fecha_retiro,
                p.nombre AS producto
            FROM Retiros r
            INNER JOIN Inventario i
                ON r.id_inventario = i.id_inventario
            INNER JOIN Productos p
                ON i.id_producto = p.id_producto
            ORDER BY r.fecha_retiro DESC
        `);

        let verdes = 0;
        let amarillos = 0;
        let rojos = 0;

        const productosCriticos = [];

        inventarioResult.recordset.forEach(item => {

            const estado = calcularEstado(
                item.fecha_vencimiento,
                item.dias_alerta
            );

            if (estado === 'VERDE') {
                verdes++;
            }

            if (estado === 'AMARILLO') {
                amarillos++;
            }

            if (estado === 'ROJO') {
                rojos++;
            }

            if (estado !== 'VERDE') {

                productosCriticos.push({
                    producto: item.producto,
                    estado
                });

            }

        });

        res.status(200).json({
            verdes,
            amarillos,
            rojos,
            usuariosActivos: usuariosResult.recordset.length,
            productosCriticos,
            retiros: retirosResult.recordset
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            mensaje: 'Error al obtener dashboard'
        });

    }

};