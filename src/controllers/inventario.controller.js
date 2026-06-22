import sql from '../config/db.js';
import { calcularEstado } from '../services/semaforo.service.js';

// GET /inventario
export const obtenerInventario = async (req, res) => {
    try {
        const { id_sucursal } = req.query;

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
            FROM Inventario i
            INNER JOIN Productos p
                ON i.id_producto = p.id_producto
            INNER JOIN Departamentos d
                ON p.id_departamento = d.id_departamento
            INNER JOIN Sucursales s
                ON i.id_sucursal = s.id_sucursal
        `;

        if (id_sucursal) {
            query += ` WHERE i.id_sucursal = ${parseInt(id_sucursal)}`;
        }

        const resultado = await sql.query(query);

        const inventario = resultado.recordset.map(item => ({
            ...item,
            estado: calcularEstado(item.fecha_vencimiento, item.dias_alerta)
        }));

        res.status(200).json(inventario);

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

        // Verificar que el producto existe y está activo
        const producto = await sql.query`
            SELECT id_producto FROM Productos
            WHERE id_producto = ${id_producto} AND activo = 1
        `;
        if (producto.recordset.length === 0) {
            return res.status(404).json({ mensaje: 'Producto no encontrado' });
        }

        // Verificar que la sucursal existe
        const sucursal = await sql.query`
            SELECT id_sucursal FROM Sucursales
            WHERE id_sucursal = ${id_sucursal}
        `;
        if (sucursal.recordset.length === 0) {
            return res.status(404).json({ mensaje: 'Sucursal no encontrada' });
        }

        await sql.query`
            INSERT INTO Inventario (id_producto, id_sucursal, fecha_vencimiento, cantidad, fecha_registro)
            VALUES (${id_producto}, ${id_sucursal}, ${fecha_vencimiento}, ${cantidad}, GETDATE())
        `;

        res.status(201).json({ mensaje: 'Producto agregado al inventario correctamente' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al agregar producto al inventario' });
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

        // Verificar que el registro existe
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

        res.status(200).json({ mensaje: 'Inventario actualizado correctamente' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al editar inventario' });
    }
};

// DELETE /inventario/:id
export const eliminarInventario = async (req, res) => {
    try {
        const { id } = req.params;

        // Verificar que el registro existe
        const existente = await sql.query`
            SELECT id_inventario FROM Inventario
            WHERE id_inventario = ${id}
        `;
        if (existente.recordset.length === 0) {
            return res.status(404).json({ mensaje: 'Registro de inventario no encontrado' });
        }

        // Verificar si tiene retiros asociados
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

        res.status(200).json({ mensaje: 'Registro eliminado correctamente' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al eliminar inventario' });
    }
};