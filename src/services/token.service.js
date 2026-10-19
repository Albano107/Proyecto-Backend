import jwt from 'jsonwebtoken';

// Genera un token de sesión para el usuario autenticado.
export const generarToken = (usuario) => {
    const secreto = process.env.JWT_SECRET;

    // Nunca generar tokens sin una clave configurada.
    if (!secreto) {
        throw new Error('Falta configurar JWT_SECRET');
    }

    return jwt.sign(
        {
            id_usuario: usuario.id_usuario
        },
        secreto,
        {
            expiresIn: '8h',
            algorithm: 'HS256'
        }
    );
};