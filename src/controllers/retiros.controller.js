import sql from '../config/db.js';

const armarFiltroSucursal = (id_sucursal) => {
    if (!id_sucursal) {
        return "";
    }

    const sucursalId = parseInt(id_sucursal, 10);

    if (Number.isNaN(sucursalId)) {
        return null;
    }

    return `WHERE s.id_sucursal = ${sucursalId}`;
};

// GET /retiros
export const obtenerRetiros = async (req, res) => {
    try {
        const { id_sucursal } = req.query;

        const filtroSucursal = armarFiltroSucursal(id_sucursal);

        if (filtroSucursal === null) {
            return res.status(400).json({
                mensaje: 'Sucursal inválida'
            });
        }

        const resultado = await sql.query(`
            SELECT
                r.id_retiro,
                p.nombre AS producto,
                r.cantidad,
                r.motivo,
                r.fecha_retiro,
                u.nombre AS usuario,
                s.id_sucursal,
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
            ${filtroSucursal}
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

// GET /retiros/resumen
export const obtenerResumenRetiros = async (req, res) => {
    try {
        const { id_sucursal } = req.query;

        const filtroSucursal = armarFiltroSucursal(id_sucursal);

        if (filtroSucursal === null) {
            return res.status(400).json({
                mensaje: 'Sucursal inválida'
            });
        }

        const fromJoin = `
            FROM Retiros r
            INNER JOIN Inventario i
                ON r.id_inventario = i.id_inventario
            INNER JOIN Productos p
                ON i.id_producto = p.id_producto
            INNER JOIN Usuarios u
                ON r.id_usuario = u.id_usuario
            INNER JOIN Sucursales s
                ON i.id_sucursal = s.id_sucursal
        `;

        const totalResult = await sql.query(`
            SELECT
                COUNT(*) AS totalRetiros,
                ISNULL(SUM(r.cantidad), 0) AS totalUnidades
            ${fromJoin}
            ${filtroSucursal}
        `);

        const productoResult = await sql.query(`
            SELECT TOP 1
                p.nombre AS producto,
                SUM(r.cantidad) AS unidades
            ${fromJoin}
            ${filtroSucursal}
            GROUP BY p.nombre
            ORDER BY unidades DESC
        `);

        const sucursalResult = await sql.query(`
            SELECT TOP 1
                s.nombre AS sucursal,
                SUM(r.cantidad) AS unidades
            ${fromJoin}
            ${filtroSucursal}
            GROUP BY s.nombre
            ORDER BY unidades DESC
        `);

        const total = totalResult.recordset[0];
        const producto = productoResult.recordset[0];
        const sucursal = sucursalResult.recordset[0];

        res.status(200).json({
            totalRetiros: total.totalRetiros || 0,
            totalUnidades: total.totalUnidades || 0,
            productoMasRetirado: producto?.producto || '-',
            unidadesProductoMasRetirado: producto?.unidades || 0,
            sucursalMasRetiro: sucursal?.sucursal || '-',
            unidadesSucursalMasRetiro: sucursal?.unidades || 0
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            mensaje: 'Error al obtener resumen de retiros'
        });
    }
};

// POST /retiros
export const registrarRetiro = async (req, res) => {
    try {
        const { id_inventario, cantidad, motivo, id_usuario } = req.body;

        if (!id_inventario || !cantidad || !id_usuario) {
            return res.status(400).json({
                mensaje: 'Faltan datos obligatorios'
            });
        }

        if (cantidad <= 0) {
            return res.status(400).json({
                mensaje: 'La cantidad debe ser mayor a 0'
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