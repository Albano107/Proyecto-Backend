import sql from '../config/db.js';
import { calcularConteos } from '../services/semaforo.service.js';

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

// Público y sin autenticación: lo consume la pantalla de login antes de que
// exista una sesión, para el slider del "parte del día" que recorre todas
// las sucursales. No devuelve nada sensible: por sucursal, sólo su nombre y
// los tres conteos de vencimiento (+ el total, suma de los tres).
export const obtenerResumenSucursales = async (req, res) => {
    try {
        const sucursalesResult = await sql.query(`
            SELECT id_sucursal, nombre
            FROM Sucursales
            ORDER BY nombre
        `);

        const inventarioResult = await sql.query(`
            SELECT
                i.id_sucursal,
                d.dias_alerta,
                i.fecha_vencimiento
            FROM Inventario i
            INNER JOIN Productos p
                ON i.id_producto = p.id_producto
            INNER JOIN Departamentos d
                ON p.id_departamento = d.id_departamento
        `);

        const filasPorSucursal = new Map();
        inventarioResult.recordset.forEach((fila) => {
            const filas = filasPorSucursal.get(fila.id_sucursal) ?? [];
            filas.push(fila);
            filasPorSucursal.set(fila.id_sucursal, filas);
        });

        const resumenes = sucursalesResult.recordset.map(({ id_sucursal, nombre }) => {
            const conteos = calcularConteos(filasPorSucursal.get(id_sucursal) ?? []);
            return {
                sucursal: nombre,
                ...conteos,
                total: conteos.verdes + conteos.amarillos + conteos.rojos
            };
        });

        res.status(200).json(resumenes);

    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al obtener el resumen de sucursales' });
    }
};