# Cómo correr los tests de la API

El backend tiene una colección de **[Bruno](https://www.usebruno.com/)** en `bruno/` que prueba los 8 grupos de endpoints (auth, productos, inventario, dashboard, usuarios, retiros, sucursales), con casos correctos y de error para cada uno.

✅ **Ya la corrí completa contra una base de prueba y quedó en verde: 27/27 requests, 39/39 asserts.** Estos son los pasos para que la corras vos, tal cual la verifiqué.

---

## Opción A — Base de prueba descartable con Docker (la más rápida)

No necesitás tu SQL Server real ni tener datos cargados. Levanta un SQL Server limpio en un contenedor, le crea el esquema y le carga 2-3 filas de ejemplo.

### 1. Levantar SQL Server

```bash
docker run -d --name gondolapro-sql-test \
  -e "ACCEPT_EULA=Y" \
  -e "MSSQL_SA_PASSWORD=GondolaPRO!2026" \
  -p 1433:1433 \
  mcr.microsoft.com/mssql/server:2022-latest
```

Esperá ~15-20 segundos a que arranque. Podés chequear con:

```bash
docker exec gondolapro-sql-test /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P 'GondolaPRO!2026' -C -Q "SELECT 1"
```

### 2. Crear el esquema y cargar datos de ejemplo

```bash
docker cp bruno/seed.sql gondolapro-sql-test:/tmp/seed.sql
docker exec gondolapro-sql-test /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P 'GondolaPRO!2026' -C -i /tmp/seed.sql
```

Esto crea la base `ProyectoBD` con las tablas (`Roles`, `Sucursales`, `Departamentos`, `Usuarios`, `Productos`, `Inventario`, `Retiros`) y un usuario de prueba (`admin@gondolapro.com` / contraseña `1234` / PIN `1234`), que ya coincide con las variables del entorno **Local** de Bruno.

### 3. Configurar y levantar el backend

Creá un `.env` (no se versiona) apuntando a ese contenedor:

```env
PORT=3000
DB_SERVER=localhost
DB_DATABASE=ProyectoBD
DB_USER=sa
DB_PASSWORD=GondolaPRO!2026
DB_PORT=1433
```

```bash
npm install
npm run dev
```

Deberías ver `Conectado a SQL Server` y `Servidor corriendo en puerto 3000`.

### 4. Al terminar, tirar el contenedor descartable

```bash
docker rm -f gondolapro-sql-test
```

(y borrar el `.env` de prueba si no lo vas a usar más).

---

## Opción B — Tu propia base SQL Server

Si ya tenés un SQL Server con la base real cargada, saltá el paso de Docker: solo configurá el `.env` con tus datos (ver `README.md`, sección "Variables de Entorno") y `npm run dev`. Después editá el entorno **Local** de Bruno (`bruno/environments/Local.bru`) con un usuario, producto, sucursal e IDs de inventario que existan de verdad en tu base.

---

## Correr la colección

### Con la app de Bruno (visual)

1. Instalar Bruno — en Arch/CachyOS: `yay -S bruno-bin` (o Flatpak: `flatpak install flathub com.usebruno.Bruno`).
2. **Open Collection** → carpeta `bruno/` de este repo.
3. Elegir el entorno **Local** (arriba a la derecha).
4. Un request suelto: abrilo y tocá **Send** — mirá la pestaña **Assert Results**.
5. Toda la colección: click derecho sobre la colección → **Run**, o el ícono ▶ del **Collection Runner**. Corre los 27 requests en orden y muestra un resumen visual pass/fail por cada uno.

### Sin instalar la app (CLI, para terminal/CI)

```bash
npx @usebruno/cli run bruno --env Local -r
```

Es el mismo comando que usé para validar la colección; imprime cada request con sus asserts (✓/✕) y un resumen final.

---

## Notas

- El backend bloquea el arranque (`connectDB()`) hasta conectar a SQL Server — si la base no está disponible, reintenta 5 veces y termina el proceso. Por eso hace falta tener la base (Opción A o B) levantada **antes** de `npm run dev`.
- La colección tiene estado: **"Agregar item (correcto)"** crea una fila nueva en cada corrida, y **"Eliminar item"** borra la fila `id_inventario_eliminar` (fija en `2` por el seed). Si corrés la colección muchas veces y ese registro ya no existe, ese request va a dar 404 en vez de 200 — es esperable, no es un bug: actualizá `id_inventario_eliminar` en el entorno **Local** con un registro que exista, o volvé a correr `bruno/seed.sql` para resetear los datos.
- Más detalle de qué prueba cada carpeta en [`bruno/README.md`](./bruno/README.md).
