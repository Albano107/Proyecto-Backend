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

export const registrarRetiro = async (req, res) => {
    try {
        const { id_inventario, cantidad, motivo, id_usuario } = req.body;

        if (!id_inventario || !cantidad || !id_usuario) {
            return res.status(400).json({
                mensaje: 'Faltan datos obligatorios'
            });
        }

        const inventario = await sql.query`
            SELECT cantidad
            FROM Inventario
            WHERE id_inventario = ${id_inventario}
        `;

        if (inventario.recordset.length === 0) {
            return res.status(404).json({
                mensaje: 'Registro de inventario no encontrado'
            });
        }

        const cantidadActual = inventario.recordset[0].cantidad;

        if (cantidad > cantidadActual) {
            return res.status(400).json({
                mensaje: 'La cantidad retirada no puede ser mayor a la cantidad disponible'
            });
        }

        await sql.query`
            INSERT INTO Retiros
            (id_inventario, cantidad, motivo, fecha_retiro, id_usuario)
            VALUES
            (${id_inventario}, ${cantidad}, ${motivo || 'Vencimiento'}, GETDATE(), ${id_usuario})
        `;

        await sql.query`
            UPDATE Inventario
            SET cantidad = cantidad - ${cantidad}
            WHERE id_inventario = ${id_inventario}
        `;

        res.status(201).json({
            mensaje: 'Retiro registrado correctamente'
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            mensaje: 'Error al registrar retiro'
        });
    }
};