export const calcularEstado = (fechaVencimiento, diasAlerta) => {

    const hoy = new Date();

    const vencimiento = new Date(fechaVencimiento);

    const diferenciaDias = Math.ceil(
        (vencimiento - hoy) / (1000 * 60 * 60 * 24)
    );

    if (diferenciaDias < 0) {
        return "ROJO";
    }

    if (diferenciaDias <= diasAlerta) {
        return "AMARILLO";
    }

    return "VERDE";
};

// Único punto que agrega filas de Inventario en los tres conteos del
// semáforo. Reutilizado por el dashboard autenticado (global) y por los
// resúmenes públicos que consume el login (por sucursal y global) — así el
// criterio de "qué cuenta como vencido/por vencer" no se repite tres veces.
export const calcularConteos = (filas) => {
    const conteos = { verdes: 0, amarillos: 0, rojos: 0 };

    filas.forEach(({ fecha_vencimiento, dias_alerta }) => {
        const estado = calcularEstado(fecha_vencimiento, dias_alerta);

        if (estado === "VERDE") conteos.verdes++;
        if (estado === "AMARILLO") conteos.amarillos++;
        if (estado === "ROJO") conteos.rojos++;
    });

    return conteos;
};