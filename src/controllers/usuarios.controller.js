import sql from '../config/db.js';
import { registrarAuditoria, ACCIONES } from '../services/auditoria.service.js';

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

        const idNum = parseInt(req.params.id, 10);
        const { activo, id_usuario_actor } = req.body;

        if (Number.isNaN(idNum)) {
            return res.status(400).json({ mensaje: 'Usuario inválido' });
        }

        const objetivo = await sql.query`
            SELECT nombre, id_sucursal FROM Usuarios
            WHERE id_usuario = ${idNum}
        `;

        if (objetivo.recordset.length === 0) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado' });
        }

        await sql.query`
            UPDATE Usuarios
            SET activo = ${activo ? 1 : 0}
            WHERE id_usuario = ${idNum}
        `;

        await registrarAuditoria({
            id_usuario: id_usuario_actor || null,
            accion: activo ? ACCIONES.ALTA_USUARIO : ACCIONES.BAJA_USUARIO,
            detalle: `${objetivo.recordset[0].nombre} pasó a ${activo ? 'activo' : 'inactivo'}`,
            id_sucursal: objetivo.recordset[0].id_sucursal,
        });

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