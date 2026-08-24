# Tests de API (Bruno)

Colección de [Bruno](https://www.usebruno.com/) para probar visualmente todos los endpoints del backend, sin depender de ninguna página web propia del proyecto. Los requests viven como archivos de texto (`.bru`) dentro de este repo, así que quedan versionados junto al código.

> Para levantar todo desde cero (incluida una base de prueba descartable con Docker) seguí [`../TESTING.md`](../TESTING.md). Esta página se enfoca en qué prueba cada request de la colección.

## 1. Instalar Bruno

Es una app de escritorio, gratis y sin cuenta. En CachyOS/Arch:

```bash
# AUR (recomendado)
yay -S bruno-bin

# o Flatpak
flatpak install flathub com.usebruno.Bruno
```

También hay AppImage/`.deb` en https://www.usebruno.com/downloads si preferís no usar el AUR.

## 2. Abrir la colección

En Bruno: **Open Collection** → seleccioná esta carpeta (`GongolaPRO-back/bruno`).

Arriba a la derecha, elegí el entorno **Local** (ya viene cargado con `baseUrl: http://localhost:3000` y datos de ejemplo).

## 3. Levantar el backend

```bash
cd GongolaPRO-back
npm install
npm run dev
```

Necesita una base SQL Server real y con datos (usuarios, productos, sucursales, inventario) para que los tests de login y de negocio pasen.

## 4. Ajustar las variables de entorno de Bruno

Editá el entorno **Local** (ícono de engranaje) con datos que existan en tu base:

| Variable | Uso |
|---|---|
| `email` / `password` | Un usuario real para `POST /auth/login` |
| `pin` | El PIN de ese mismo usuario para `POST /auth/login-pin` |
| `id_producto` | Un `id_producto` activo existente |
| `id_sucursal` | Un `id_sucursal` existente |
| `id_inventario` | Un registro de `Inventario` existente (se usa para editar/eliminar/retirar) |
| `id_usuario` | Un `id_usuario` existente (se usa para retiros y cambio de estado) |

## 5. Correr los tests

- **Un endpoint suelto:** abrí el request y tocá **Send**; en la pestaña **Assert Results** ves en verde/rojo si pasó.
- **Todo junto (estilo test runner):** click derecho sobre la colección → **Run** (o el ícono ▶ "Collection Runner"). Corre todos los requests en orden y muestra un resumen visual con cuántos pasaron/fallaron y el detalle de cada assert, endpoint por endpoint.

## Qué cubre

Un request por cada función del backend, incluyendo casos de error (no solo el camino feliz):

- **Health:** `GET /`
- **Auth:** login por email (correcto/incorrecto), login por PIN (correcto/incorrecto)
- **Productos:** listado
- **Inventario:** listado simple, paginado, con filtro/búsqueda, alta (correcta/datos faltantes/producto inexistente), edición (correcta/inexistente), baja (existente/inexistente)
- **Dashboard:** resumen general
- **Usuarios:** listado, activar/desactivar
- **Retiros:** listado, filtro inválido, resumen, alta (correcta/datos faltantes/inventario inexistente)
- **Sucursales:** listado

## Nota sobre estado

Como el backend no tiene un endpoint de "reset", correr toda la colección dos veces seguidas puede hacer fallar algunos requests por el estado que dejó la corrida anterior — por ejemplo, **"Eliminar item"** borra `id_inventario` de la variable de entorno, así que si lo corrés de nuevo sin cambiar ese id va a dar 404 en vez de 200 (igual que pasaría con cualquier test end-to-end contra una base real). Si eso pasa, simplemente actualizá `id_inventario` en el entorno **Local** con un registro que sí exista.
