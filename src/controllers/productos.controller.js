import sql from '../config/db.js';

export const obtenerProductos = async (req, res) => {
    try {

        const resultado = await sql.query(`
            SELECT
                p.id_producto,
                p.nombre,
                p.codigo_barras,
                d.nombre AS departamento
            FROM Productos p
            INNER JOIN Departamentos d
                ON p.id_departamento = d.id_departamento
            ORDER BY p.nombre
        `);

        res.status(200).json(resultado.recordset);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            mensaje: 'Error al obtener productos'
        });

    }
};