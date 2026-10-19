
import sql from '../config/db.js';
import { registrarAuditoria, ACCIONES } from '../services/auditoria.service.js';
import { generarToken } from '../services/token.service.js';

// ==========================================
// LOGIN CON EMAIL Y CONTRASEÑA
// ==========================================

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Buscar usuario activo y obtener su rol y sucursal.
        const resultado = await sql.query`
            SELECT
                u.id_usuario,
                u.nombre,
                u.email,
                r.nombre AS rol,
                s.id_sucursal,
                s.nombre AS sucursal
            FROM Usuarios u
            INNER JOIN Roles r
                ON u.id_rol = r.id_rol
            LEFT JOIN Sucursales s
                ON u.id_sucursal = s.id_sucursal
            WHERE u.email = ${email}
              AND u.password = ${password}
              AND u.activo = 1
        `;

        // Validar credenciales.
        if (resultado.recordset.length === 0) {
            return res.status(401).json({
                mensaje: 'Credenciales incorrectas'
            });
        }

        const usuarioLogueado = resultado.recordset[0];

        // Generar token JWT con duración de 8 horas.
        const token = generarToken(usuarioLogueado);

        // Registrar el inicio de sesión en auditorías.
        await registrarAuditoria({
            id_usuario: usuarioLogueado.id_usuario,
            accion: ACCIONES.SESION,
            detalle: 'Inicio de sesión con email',
            id_sucursal: usuarioLogueado.id_sucursal,
        });

        // Devolver los datos originales más el token.
        return res.status(200).json({
            ...usuarioLogueado,
            token
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            mensaje: 'Error al iniciar sesión'
        });
    }
};


// ==========================================
// LOGIN CON PIN DE 4 DÍGITOS
// ==========================================

export const loginPin = async (req, res) => {
    try {
        const { pin } = req.body;

        // Buscar usuario activo por PIN.
        const resultado = await sql.query`
            SELECT
                u.id_usuario,
                u.nombre,
                r.nombre AS rol,
                s.id_sucursal,
                s.nombre AS sucursal
            FROM Usuarios u
            INNER JOIN Roles r
                ON u.id_rol = r.id_rol
            LEFT JOIN Sucursales s
                ON u.id_sucursal = s.id_sucursal
            WHERE u.pin = ${pin}
              AND u.activo = 1
        `;

        // Validar el PIN ingresado.
        if (resultado.recordset.length === 0) {
            return res.status(401).json({
                mensaje: 'PIN incorrecto'
            });
        }

        const usuarioLogueado = resultado.recordset[0];

        // Generar token JWT con duración de 8 horas.
        const token = generarToken(usuarioLogueado);

        // Registrar el inicio de sesión en auditorías.
        await registrarAuditoria({
            id_usuario: usuarioLogueado.id_usuario,
            accion: ACCIONES.SESION,
            detalle: 'Inicio de sesión con PIN',
            id_sucursal: usuarioLogueado.id_sucursal,
        });

        // Devolver los datos originales más el token.
        return res.status(200).json({
            ...usuarioLogueado,
            token
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            mensaje: 'Error al iniciar sesión con PIN'
        });
    }
};
