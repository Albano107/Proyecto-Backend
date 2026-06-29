import sql from '../config/db.js';
import { calcularEstado } from '../services/semaforo.service.js';

// GET /inventario
export const obtenerInventario = async (req, res) => {
    try {
        const { id_sucursal, page, limit } = req.query;

        const usarPaginacion = page !== undefined || limit !== undefined;

        const pagina = Math.max(parseInt(page || "1", 10), 1);

        const limiteSolicitado = parseInt(limit || "10", 10);
        const limitesPermitidos = [10, 30, 50, 100, 500];

        const limite = limitesPermitidos.includes(limiteSolicitado)
            ? limiteSolicitado
            : 10;

        const offset = (pagina - 1) * limite;

        let whereClause = "";

        if (id_sucursal) {
            const sucursalId = parseInt(id_sucursal, 10);

            if (Number.isNaN(sucursalId)) {
                return res.status(400).json({
                    mensaje: "Sucursal inválida"
                });
            }

            whereClause = `WHERE i.id_sucursal = ${sucursalId}`;
        }

        const fromJoin = `
            FROM Inventario i
            INNER JOIN Productos p
                ON i.id_producto = p.id_producto
            INNER JOIN Departamentos d
                ON p.id_departamento = d.id_departamento
            INNER JOIN Sucursales s
                ON i.id_sucursal = s.id_sucursal
        `;

        let query = `
            SELECT
                i.id_inventario,
                p.nombre AS producto,
                d.nombre AS departamento,
                d.dias_alerta,
                s.id_sucursal,
                s.nombre AS sucursal,
                i.cantidad,
                i.fecha_vencimiento
            ${fromJoin}
            ${whereClause}
            ORDER BY i.fecha_vencimiento ASC, i.id_inventario ASC
        `;

        if (usarPaginacion) {
            query += `
                OFFSET ${offset} ROWS
                FETCH NEXT ${limite} ROWS ONLY
            `;
        }

        const resultado = await sql.query(query);

        const inventario = resultado.recordset.map(item => ({
            ...item,
            estado: calcularEstado(item.fecha_vencimiento, item.dias_alerta)
        }));

        // Si no viene page/limit, mantiene compatibilidad con código anterior
        if (!usarPaginacion) {
            return res.status(200).json(inventario);
        }

        const totalQuery = `
            SELECT COUNT(*) AS total
            ${fromJoin}
            ${whereClause}
        `;

        const resumenQuery = `
            SELECT
                COUNT(*) AS totalProductos,

                ISNULL(SUM(i.cantidad), 0) AS totalUnidades,

                ISNULL(SUM(
                    CASE
                        WHEN DATEDIFF(DAY, CAST(GETDATE() AS DATE), CAST(i.fecha_vencimiento AS DATE)) > d.dias_alerta
                        THEN 1 ELSE 0
                    END
                ), 0) AS verdesProductos,

                ISNULL(SUM(
                    CASE
                        WHEN DATEDIFF(DAY, CAST(GETDATE() AS DATE), CAST(i.fecha_vencimiento AS DATE)) >= 0
                         AND DATEDIFF(DAY, CAST(GETDATE() AS DATE), CAST(i.fecha_vencimiento AS DATE)) <= d.dias_alerta
                        THEN 1 ELSE 0
                    END
                ), 0) AS amarillosProductos,

                ISNULL(SUM(
                    CASE
                        WHEN DATEDIFF(DAY, CAST(GETDATE() AS DATE), CAST(i.fecha_vencimiento AS DATE)) < 0
                        THEN 1 ELSE 0
                    END
                ), 0) AS rojosProductos,

                ISNULL(SUM(
                    CASE
                        WHEN DATEDIFF(DAY, CAST(GETDATE() AS DATE), CAST(i.fecha_vencimiento AS DATE)) > d.dias_alerta
                        THEN i.cantidad ELSE 0
                    END
                ), 0) AS verdesUnidades,

                ISNULL(SUM(
                    CASE
                        WHEN DATEDIFF(DAY, CAST(GETDATE() AS DATE), CAST(i.fecha_vencimiento AS DATE)) >= 0
                         AND DATEDIFF(DAY, CAST(GETDATE() AS DATE), CAST(i.fecha_vencimiento AS DATE)) <= d.dias_alerta
                        THEN i.cantidad ELSE 0
                    END
                ), 0) AS amarillosUnidades,

                ISNULL(SUM(
                    CASE
                        WHEN DATEDIFF(DAY, CAST(GETDATE() AS DATE), CAST(i.fecha_vencimiento AS DATE)) < 0
                        THEN i.cantidad ELSE 0
                    END
                ), 0) AS rojosUnidades
            ${fromJoin}
            ${whereClause}
        `;

        const totalResultado = await sql.query(totalQuery);
        const resumenResultado = await sql.query(resumenQuery);

        const total = totalResultado.recordset[0].total;
        const totalPaginas = Math.max(Math.ceil(total / limite), 1);

        res.status(200).json({
            datos: inventario,
            pagina,
            limite,
            total,
            totalPaginas,
            resumen: resumenResultado.recordset[0]
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al obtener inventario' });
    }
};

// POST /inventario
export const agregarInventario = async (req, res) => {
    try {
        const { id_producto, id_sucursal, fecha_vencimiento, cantidad } = req.body;

        if (!id_producto || !id_sucursal || !fecha_vencimiento || cantidad == null) {
            return res.status(400).json({ mensaje: 'Faltan datos obligatorios' });
        }

        if (cantidad <= 0) {
            return res.status(400).json({ mensaje: 'La cantidad debe ser mayor a 0' });
        }

        const producto = await sql.query`
            SELECT id_producto FROM Productos
            WHERE id_producto = ${id_producto} AND activo = 1
        `;

        if (producto.recordset.length === 0) {
            return res.status(404).json({ mensaje: 'Producto no encontrado' });
        }

        const sucursal = await sql.query`
            SELECT id_sucursal FROM Sucursales
            WHERE id_sucursal = ${id_sucursal}
        `;

        if (sucursal.recordset.length === 0) {
            return res.status(404).json({ mensaje: 'Sucursal no encontrada' });
        }

        await sql.query`
            INSERT INTO Inventario
            (id_producto, id_sucursal, fecha_vencimiento, cantidad, fecha_registro)
            VALUES
            (${id_producto}, ${id_sucursal}, ${fecha_vencimiento}, ${cantidad}, GETDATE())
        `;

        res.status(201).json({
            mensaje: 'Producto agregado al inventario correctamente'
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            mensaje: 'Error al agregar producto al inventario'
        });
    }
};

// PUT /inventario/:id
export const editarInventario = async (req, res) => {
    try {
        const { id } = req.params;
        const { fecha_vencimiento, cantidad } = req.body;

        if (!fecha_vencimiento || cantidad == null) {
            return res.status(400).json({ mensaje: 'Faltan datos obligatorios' });
        }

        if (cantidad < 0) {
            return res.status(400).json({ mensaje: 'La cantidad no puede ser negativa' });
        }

        const existente = await sql.query`
            SELECT id_inventario FROM Inventario
            WHERE id_inventario = ${id}
        `;

        if (existente.recordset.length === 0) {
            return res.status(404).json({ mensaje: 'Registro de inventario no encontrado' });
        }

        await sql.query`
            UPDATE Inventario
            SET fecha_vencimiento = ${fecha_vencimiento},
                cantidad = ${cantidad}
            WHERE id_inventario = ${id}
        `;

        res.status(200).json({
            mensaje: 'Inventario actualizado correctamente'
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            mensaje: 'Error al editar inventario'
        });
    }
};

// DELETE /inventario/:id
export const eliminarInventario = async (req, res) => {
    try {
        const { id } = req.params;

        const existente = await sql.query`
            SELECT id_inventario FROM Inventario
            WHERE id_inventario = ${id}
        `;

        if (existente.recordset.length === 0) {
            return res.status(404).json({
                mensaje: 'Registro de inventario no encontrado'
            });
        }

        const retiros = await sql.query`
            SELECT TOP 1 id_retiro FROM Retiros
            WHERE id_inventario = ${id}
        `;

        if (retiros.recordset.length > 0) {
            return res.status(409).json({
                mensaje: 'No se puede eliminar: el registro tiene retiros asociados'
            });
        }

        await sql.query`
            DELETE FROM Inventario
            WHERE id_inventario = ${id}
        `;

        res.status(200).json({
            mensaje: 'Registro eliminado correctamente'
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            mensaje: 'Error al eliminar inventario'
        });
    }
};