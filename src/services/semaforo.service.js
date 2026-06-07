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