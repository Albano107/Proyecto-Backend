import sql from '../config/db.js';

export const obtenerRetiros = async (req, res) => {

    try {

        const resultado = await sql.query(`
            SELECT
                r.id_retiro,
                p.nombre AS producto,
                r.cantidad,
                r.motivo,
                r.fecha_retiro,
                u.nombre AS usuario
            FROM Retiros r
            INNER JOIN Inventario i
                ON r.id_inventario = i.id_inventario
            INNER JOIN Productos p
                ON i.id_producto = p.id_producto
            INNER JOIN Usuarios u
                ON r.id_usuario = u.id_usuario
            ORDER BY r.fecha_retiro DESC
        `);

        res.status(200).json(resultado.recordset);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            mensaje: 'Error al obtener retiros'
        });

    }

};