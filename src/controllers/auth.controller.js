import sql from '../config/db.js';
import { registrarAuditoria, ACCIONES } from '../services/auditoria.service.js';

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const resultado = await sql.query`
            SELECT
                u.id_usuario,
                u.nombre,
                u.email,
                r.nombre AS rol,
                s.id_sucursal,
                s.nombre  AS sucursal
            FROM Usuarios u
            INNER JOIN Roles r
                ON u.id_rol = r.id_rol
            LEFT JOIN Sucursales s
                ON u.id_sucursal = s.id_sucursal
            WHERE u.email = ${email}
              AND u.password = ${password}
              AND u.activo = 1
        `;

        if (resultado.recordset.length === 0) {
            return res.status(401).json({ mensaje: 'Credenciales incorrectas' });
        }

        const usuarioLogueado = resultado.recordset[0];

        await registrarAuditoria({
            id_usuario: usuarioLogueado.id_usuario,
            accion: ACCIONES.SESION,
            detalle: 'Inicio de sesión con email',
            id_sucursal: usuarioLogueado.id_sucursal,
        });

        res.status(200).json(usuarioLogueado);

    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al iniciar sesión' });
    }
};


export const loginPin = async (req, res) => {
    try {
        const { pin } = req.body;

        const resultado = await sql.query`
            SELECT
                u.id_usuario,
                u.nombre,
                r.nombre AS rol,
                s.id_sucursal,
                s.nombre  AS sucursal
            FROM Usuarios u
            INNER JOIN Roles r
                ON u.id_rol = r.id_rol
            LEFT JOIN Sucursales s
                ON u.id_sucursal = s.id_sucursal
            WHERE u.pin = ${pin}
              AND u.activo = 1
        `;

        if (resultado.recordset.length === 0) {
            return res.status(401).json({ mensaje: 'PIN incorrecto' });
        }

        const usuarioLogueado = resultado.recordset[0];

        await registrarAuditoria({
            id_usuario: usuarioLogueado.id_usuario,
            accion: ACCIONES.SESION,
            detalle: 'Inicio de sesión con PIN',
            id_sucursal: usuarioLogueado.id_sucursal,
        });

        res.status(200).json(usuarioLogueado);

    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al iniciar sesión' });
    }
};
