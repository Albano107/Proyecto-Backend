import sql from '../config/db.js';

// GET /auditorias
export const obtenerAuditorias = async (req, res) => {
    try {
        const diasSolicitados = parseInt(req.query.dias, 10);
        const dias = [7, 30, 90].includes(diasSolicitados) ? diasSolicitados : 7;

        const request = new sql.Request();
        request.input('dias', sql.Int, dias);

        let query = `
            SELECT
                a.id_auditoria,
                a.fecha,
                a.accion,
                a.detalle,
                u.id_usuario,
                u.nombre AS usuario,
                r.nombre AS rol,
                s.id_sucursal,
                s.nombre AS sucursal
            FROM Auditorias a
            LEFT JOIN Usuarios u
                ON a.id_usuario = u.id_usuario
            LEFT JOIN Roles r
                ON u.id_rol = r.id_rol
            LEFT JOIN Sucursales s
                ON a.id_sucursal = s.id_sucursal
            WHERE a.fecha >= DATEADD(DAY, -@dias, CAST(GETDATE() AS DATE))
        `;

        const { accion, id_usuario } = req.query;

        if (accion && accion !== 'todo') {
            request.input('accion', sql.VarChar(30), accion);
            query += ' AND a.accion = @accion';
        }

        if (id_usuario) {
            const idUsuarioNum = parseInt(id_usuario, 10);

            if (Number.isNaN(idUsuarioNum)) {
                return res.status(400).json({ mensaje: 'Usuario inválido' });
            }

            request.input('id_usuario', sql.Int, idUsuarioNum);
            query += ' AND a.id_usuario = @id_usuario';
        }

        query += ' ORDER BY a.fecha DESC';

        const resultado = await request.query(query);

        res.status(200).json(resultado.recordset);

    } catch (error) {
        console.error(error);
        res.status(500).json({
            mensaje: 'Error al obtener auditorías'
        });
    }
};
