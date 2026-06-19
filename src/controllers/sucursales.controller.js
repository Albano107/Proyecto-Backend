import sql from '../config/db.js';

export const obtenerSucursales = async (req, res) => {
    try {
        const resultado = await sql.query(`
            SELECT id_sucursal, nombre
            FROM Sucursales
            ORDER BY nombre
        `);

        res.status(200).json(resultado.recordset);

    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al obtener sucursales' });
    }
};