import sql from '../config/db.js';

// Acciones registradas en la tabla Auditorias. Si se agrega una acción nueva,
// sumarla acá y usar esta constante en el controller correspondiente (así
// el filtro de auditorías del frontend y ACCION_ESTILO quedan sincronizados
// con lo que realmente puede llegar desde el backend).
export const ACCIONES = {
    RETIRO: 'RETIRO',
    ALTA: 'ALTA',
    EDICION: 'EDICIÓN',
    ELIMINACION: 'ELIMINACIÓN',
    SESION: 'SESIÓN',
    ALTA_USUARIO: 'ALTA USUARIO',
    BAJA_USUARIO: 'BAJA USUARIO',
};

// Registra un evento de auditoría. Nunca debe interrumpir la operación que
// la originó: si falla el insert, se loguea el error y se sigue de largo.
export const registrarAuditoria = async ({ id_usuario, accion, detalle, id_sucursal }) => {
    try {
        await sql.query`
            INSERT INTO Auditorias (id_usuario, accion, detalle, id_sucursal, fecha)
            VALUES (${id_usuario || null}, ${accion}, ${detalle || null}, ${id_sucursal || null}, GETDATE())
        `;
    } catch (error) {
        console.error('Error registrando auditoría:', error);
    }
};
