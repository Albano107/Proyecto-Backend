
import jwt from 'jsonwebtoken';
import sql from '../config/db.js';

// ==========================================
// VERIFICAR AUTENTICACIÓN
// ==========================================

// Comprueba el token JWT recibido en cada petición protegida.
export const verificarToken = async (req, res, next) => {
    const autorizacion = req.headers.authorization;

    // Rechazar solicitudes que no incluyan un token.
    if (!autorizacion || !/^Bearer\s+\S+$/i.test(autorizacion)) {
        return res.status(401).json({
            mensaje: 'Debés iniciar sesión para continuar.'
        });
    }

    // La clave secreta debe estar configurada.
    const secreto = process.env.JWT_SECRET;

    if (!secreto) {
        console.error('Falta configurar JWT_SECRET');

        return res.status(500).json({
            mensaje: 'Error de configuración de autenticación.'
        });
    }

    try {
        const token = autorizacion.replace(/^Bearer\s+/i, '').trim();

        // Comprobar firma y vencimiento del JWT.
        const datos = jwt.verify(token, secreto, {
            algorithms: ['HS256']
        });

        if (!Number.isInteger(datos.id_usuario) || datos.id_usuario <= 0) {
            return res.status(401).json({
                mensaje: 'Token inválido.'
            });
        }

        // Consultar la base para obtener el rol actual.
        // Esto también impide que usuarios desactivados sigan operando.
        const resultado = await sql.query`
            SELECT
                u.id_usuario,
                u.nombre,
                u.id_sucursal,
                r.nombre AS rol
            FROM Usuarios u
            INNER JOIN Roles r
                ON u.id_rol = r.id_rol
            WHERE u.id_usuario = ${datos.id_usuario}
              AND u.activo = 1
        `;

        if (resultado.recordset.length === 0) {
            return res.status(401).json({
                mensaje: 'Usuario inexistente o desactivado.'
            });
        }

        // Guardar los datos verificados para los siguientes controles.
        req.usuario = resultado.recordset[0];

        next();

    } catch (error) {
        if (
            error.name === 'JsonWebTokenError' ||
            error.name === 'TokenExpiredError' ||
            error.name === 'NotBeforeError'
        ) {
            return res.status(401).json({
                mensaje: 'Sesión inválida o vencida. Iniciá sesión nuevamente.'
            });
        }

        console.error('Error verificando autenticación:', error);

        return res.status(500).json({
            mensaje: 'Error al verificar la sesión.'
        });
    }
};


// ==========================================
// VERIFICAR PERMISOS POR ROL
// ==========================================

// Permite acceder únicamente a los roles indicados.
export const permitirRoles = (...rolesPermitidos) => {
    return (req, res, next) => {

        // Debe ejecutarse después de verificarToken.
        if (!req.usuario) {
            return res.status(401).json({
                mensaje: 'Usuario no autenticado.'
            });
        }

        // Comprobar que el rol esté autorizado.
        if (!rolesPermitidos.includes(req.usuario.rol)) {
            return res.status(403).json({
                mensaje: 'No tenés permisos para realizar esta operación.'
            });
        }

        next();
    };
};
