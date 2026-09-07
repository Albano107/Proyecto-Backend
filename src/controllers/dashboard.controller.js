import sql from '../config/db.js';
import { calcularEstado } from '../services/semaforo.service.js';

const PRIORIDAD_ESTADO = { ROJO: 0, AMARILLO: 1 };

export const obtenerDashboard = async (req, res) => {

    try {

        const { id_sucursal } = req.query;

        let sucursalId = null;

        if (id_sucursal) {
            sucursalId = parseInt(id_sucursal, 10);

            if (Number.isNaN(sucursalId)) {
                return res.status(400).json({
                    mensaje: 'Sucursal inválida'
                });
            }
        }

        const filtroSucursalInventario = sucursalId
            ? `WHERE i.id_sucursal = ${sucursalId}`
            : '';

        const filtroSucursalRetiros = sucursalId
            ? `WHERE i.id_sucursal = ${sucursalId}`
            : '';

        // Inventario + Departamentos + Sucursales
        const inventarioResult = await sql.query(`
            SELECT
                p.nombre AS producto,
                p.codigo_barras,
                d.nombre AS departamento,
                d.dias_alerta,
                s.nombre AS sucursal,
                i.fecha_vencimiento
            FROM Inventario i
            INNER JOIN Productos p
                ON i.id_producto = p.id_producto
            INNER JOIN Departamentos d
                ON p.id_departamento = d.id_departamento
            INNER JOIN Sucursales s
                ON i.id_sucursal = s.id_sucursal
            ${filtroSucursalInventario}
        `);

        // Usuarios activos
        const usuariosResult = await sql.query(`
            SELECT COUNT(*) AS cantidad
            FROM Usuarios
            WHERE activo = 1
        `);

        // Últimos retiros
        const retirosResult = await sql.query(`
            SELECT TOP 5
                r.cantidad,
                r.motivo,
                r.fecha_retiro,
                p.nombre AS producto,
                u.nombre AS usuario,
                s.nombre AS sucursal
            FROM Retiros r
            INNER JOIN Inventario i
                ON r.id_inventario = i.id_inventario
            INNER JOIN Productos p
                ON i.id_producto = p.id_producto
            INNER JOIN Usuarios u
                ON r.id_usuario = u.id_usuario
            INNER JOIN Sucursales s
                ON i.id_sucursal = s.id_sucursal
            ${filtroSucursalRetiros}
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
                    codigo_barras: item.codigo_barras,
                    departamento: item.departamento,
                    sucursal: item.sucursal,
                    fecha_vencimiento: item.fecha_vencimiento,
                    estado
                });

            }

        });

        // Los más urgentes (vencidos) primero, y acotamos el listado para
        // que el panel de "productos críticos" del Inicio quede compacto.
        productosCriticos.sort(
            (a, b) => PRIORIDAD_ESTADO[a.estado] - PRIORIDAD_ESTADO[b.estado]
        );

        res.status(200).json({
            verdes,
            amarillos,
            rojos,
            usuariosActivos: usuariosResult.recordset[0].cantidad,
            productosCriticos: productosCriticos.slice(0, 8),
            retiros: retirosResult.recordset
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            mensaje: 'Error al obtener dashboard'
        });

    }

};
