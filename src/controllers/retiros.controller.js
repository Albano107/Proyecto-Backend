import sql from '../config/db.js';
import { registrarAuditoria, ACCIONES } from '../services/auditoria.service.js';

const RANGOS_DIAS_VALIDOS = [7, 30, 365];

// Valida id_sucursal (opcional) y dias (7/30/365, default 30) desde
// req.query. Devuelve null si id_sucursal vino pero no es numérico.
const leerFiltros = (query) => {
    let idSucursal = null;

    if (query.id_sucursal) {
        idSucursal = parseInt(query.id_sucursal, 10);

        if (Number.isNaN(idSucursal)) {
            return null;
        }
    }

    const diasSolicitados = parseInt(query.dias, 10);
    const dias = RANGOS_DIAS_VALIDOS.includes(diasSolicitados) ? diasSolicitados : 30;

    return { idSucursal, dias };
};

// Arma un Request nuevo con @dias/@dias2 (dias*2) y, si corresponde,
// @id_sucursal ya cargados, listo para pegarle un WHERE con esos nombres.
const crearRequest = ({ idSucursal, dias }) => {
    const request = new sql.Request();

    request.input('dias', sql.Int, dias);
    request.input('dias2', sql.Int, dias * 2);

    if (idSucursal !== null) {
        request.input('id_sucursal', sql.Int, idSucursal);
    }

    return request;
};

const FROM_JOIN = `
    FROM Retiros r
    INNER JOIN Inventario i
        ON r.id_inventario = i.id_inventario
    INNER JOIN Productos p
        ON i.id_producto = p.id_producto
    INNER JOIN Departamentos d
        ON p.id_departamento = d.id_departamento
    INNER JOIN Usuarios u
        ON r.id_usuario = u.id_usuario
    INNER JOIN Sucursales s
        ON i.id_sucursal = s.id_sucursal
`;

const condicionSucursal = ({ idSucursal }) =>
    idSucursal !== null ? 'AND s.id_sucursal = @id_sucursal' : '';

// Ventana actual: últimos @dias días (incluye hoy).
const condicionPeriodoActual = (filtros) => `
    WHERE r.fecha_retiro >= DATEADD(DAY, -@dias, CAST(GETDATE() AS DATE))
    ${condicionSucursal(filtros)}
`;

// Ventana anterior: los @dias días previos a la ventana actual, para el
// comparativo de tendencia.
const condicionPeriodoAnterior = (filtros) => `
    WHERE r.fecha_retiro >= DATEADD(DAY, -@dias2, CAST(GETDATE() AS DATE))
      AND r.fecha_retiro <  DATEADD(DAY, -@dias, CAST(GETDATE() AS DATE))
    ${condicionSucursal(filtros)}
`;

// GET /retiros?id_sucursal=&dias=7|30|365
export const obtenerRetiros = async (req, res) => {
    try {
        const filtros = leerFiltros(req.query);

        if (filtros === null) {
            return res.status(400).json({ mensaje: 'Sucursal inválida' });
        }

        const request = crearRequest(filtros);

        const resultado = await request.query(`
            SELECT TOP 100
                r.id_retiro,
                p.nombre AS producto,
                p.codigo_barras,
                d.nombre AS departamento,
                r.cantidad,
                r.motivo,
                r.fecha_retiro,
                u.nombre AS usuario,
                s.id_sucursal,
                s.nombre AS sucursal
            ${FROM_JOIN}
            ${condicionPeriodoActual(filtros)}
            ORDER BY r.fecha_retiro DESC
        `);

        res.status(200).json(resultado.recordset);

    } catch (error) {
        console.error(error);
        res.status(500).json({
            mensaje: 'Error al obtener retiros'
        });
    }
};

// GET /retiros/resumen?id_sucursal=&dias=7|30|365
export const obtenerResumenRetiros = async (req, res) => {
    try {
        const filtros = leerFiltros(req.query);

        if (filtros === null) {
            return res.status(400).json({ mensaje: 'Sucursal inválida' });
        }

        const totalResult = await crearRequest(filtros).query(`
            SELECT
                COUNT(*) AS totalRetiros,
                ISNULL(SUM(r.cantidad), 0) AS totalUnidades
            ${FROM_JOIN}
            ${condicionPeriodoActual(filtros)}
        `);

        const anteriorResult = await crearRequest(filtros).query(`
            SELECT ISNULL(SUM(r.cantidad), 0) AS unidades
            ${FROM_JOIN}
            ${condicionPeriodoAnterior(filtros)}
        `);

        const porMotivoResult = await crearRequest(filtros).query(`
            SELECT r.motivo, SUM(r.cantidad) AS unidades
            ${FROM_JOIN}
            ${condicionPeriodoActual(filtros)}
            GROUP BY r.motivo
            ORDER BY unidades DESC
        `);

        const porSucursalResult = await crearRequest(filtros).query(`
            SELECT s.nombre AS sucursal, SUM(r.cantidad) AS unidades
            ${FROM_JOIN}
            ${condicionPeriodoActual(filtros)}
            GROUP BY s.nombre
            ORDER BY unidades DESC
        `);

        const topProductosResult = await crearRequest(filtros).query(`
            SELECT TOP 5 p.nombre AS producto, SUM(r.cantidad) AS unidades
            ${FROM_JOIN}
            ${condicionPeriodoActual(filtros)}
            GROUP BY p.nombre
            ORDER BY unidades DESC
        `);

        const total = totalResult.recordset[0];
        const totalUnidades = total.totalUnidades || 0;

        res.status(200).json({
            totalRetiros: total.totalRetiros || 0,
            totalUnidades,
            unidadesPeriodoAnterior: anteriorResult.recordset[0].unidades || 0,
            porMotivo: porMotivoResult.recordset,
            porSucursal: porSucursalResult.recordset,
            topProductos: topProductosResult.recordset,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            mensaje: 'Error al obtener resumen de retiros'
        });
    }
};

// POST /retiros
export const registrarRetiro = async (req, res) => {
    try {
        const { id_inventario, cantidad, motivo, id_usuario } = req.body;

        if (!id_inventario || !cantidad || !id_usuario) {
            return res.status(400).json({
                mensaje: 'Faltan datos obligatorios'
            });
        }

        if (cantidad <= 0) {
            return res.status(400).json({
                mensaje: 'La cantidad debe ser mayor a 0'
            });
        }

        const inventario = await sql.query`
            SELECT i.cantidad, i.id_sucursal, p.nombre AS producto, s.nombre AS sucursal
            FROM Inventario i
            INNER JOIN Productos p ON i.id_producto = p.id_producto
            INNER JOIN Sucursales s ON i.id_sucursal = s.id_sucursal
            WHERE i.id_inventario = ${id_inventario}
        `;

        if (inventario.recordset.length === 0) {
            return res.status(404).json({
                mensaje: 'Registro de inventario no encontrado'
            });
        }

        const cantidadActual = inventario.recordset[0].cantidad;

        if (cantidad > cantidadActual) {
            return res.status(400).json({
                mensaje: 'La cantidad retirada no puede ser mayor a la cantidad disponible'
            });
        }

        await sql.query`
            INSERT INTO Retiros
            (id_inventario, cantidad, motivo, fecha_retiro, id_usuario)
            VALUES
            (${id_inventario}, ${cantidad}, ${motivo || 'Vencimiento'}, GETDATE(), ${id_usuario})
        `;

        await sql.query`
            UPDATE Inventario
            SET cantidad = cantidad - ${cantidad}
            WHERE id_inventario = ${id_inventario}
        `;

        const fila = inventario.recordset[0];

        await registrarAuditoria({
            id_usuario,
            accion: ACCIONES.RETIRO,
            detalle: `${fila.producto} — ${cantidad} u. · motivo: ${motivo || 'Vencimiento'}`,
            id_sucursal: fila.id_sucursal,
        });

        res.status(201).json({
            mensaje: 'Retiro registrado correctamente'
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            mensaje: 'Error al registrar retiro'
        });
    }
};
