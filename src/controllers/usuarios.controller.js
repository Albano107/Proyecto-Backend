import sql from '../config/db.js';

export const obtenerUsuarios = async (req, res) => {
    try {

        const resultado = await sql.query(`
            SELECT
                u.id_usuario,
                u.nombre,
                u.email,
                u.activo,
                r.nombre AS rol
            FROM Usuarios u
            INNER JOIN Roles r
                ON u.id_rol = r.id_rol
            ORDER BY u.nombre
        `);

        res.status(200).json(resultado.recordset);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            mensaje: 'Error al obtener usuarios'
        });

    }
};
export const cambiarEstadoUsuario = async (req, res) => {
    try {

        const { id } = req.params;
        const { activo } = req.body;

        await sql.query(`
            UPDATE Usuarios
            SET activo = ${activo ? 1 : 0}
            WHERE id_usuario = ${id}
        `);

        res.status(200).json({
            mensaje: 'Estado actualizado correctamente'
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            mensaje: 'Error al actualizar estado'
        });

    }
};