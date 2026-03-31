# Guía de Instalación — Sistema de Heladería

Seguí estos pasos en orden para poner en marcha el sistema en una PC nueva.

---

## PASO 1 — Instalar los programas necesarios

### Node.js
1. Ir a https://nodejs.org
2. Descargar la versión **LTS** (la recomendada)
3. Instalar con todas las opciones por defecto
4. Para verificar que quedó bien instalado, abrir una terminal (CMD o PowerShell) y escribir:
   ```
   node --version
   ```
   Tiene que aparecer algo como `v20.x.x`

### PostgreSQL
1. Ir a https://www.postgresql.org/download/windows/
2. Descargar el instalador
3. Durante la instalación:
   - Dejar el puerto por defecto: **5432**
   - Poner una contraseña para el usuario `postgres` — **anotarla, la vas a necesitar**
   - Instalar también **pgAdmin** (viene incluido, tildar esa opción)
4. Para verificar, abrir pgAdmin desde el menú de inicio

---

## PASO 2 — Copiar los archivos del proyecto

Copiar la carpeta del proyecto a la nueva PC. La estructura debe quedar así:

```
ProyectoProgramaHeladeria/
  backend/
  frontend/
  INSTALACION.md
```

> Si copiás desde un pendrive o ZIP, asegurate de que estén las carpetas `backend` y `frontend`.
> **No es necesario copiar las carpetas `node_modules`** si existen — son pesadas y se regeneran.

---

## PASO 3 — Crear la base de datos

1. Abrir **pgAdmin**
2. Conectarse al servidor (usar la contraseña que pusiste al instalar)
3. En el panel izquierdo, hacer clic derecho en **Databases** → **Create** → **Database...**
4. En el campo **Database** escribir exactamente: `heladeria_db`
5. Hacer clic en **Save**

Ahora cargar las tablas:

6. Hacer clic derecho sobre `heladeria_db` → **Query Tool**
7. En la ventana que se abre, hacer clic en el ícono de carpeta (abrir archivo)
8. Navegar hasta la carpeta `backend/` del proyecto y abrir el archivo `init-db.sql`
9. Presionar el botón **Run** (triángulo verde) o `F5`
10. Tiene que aparecer un mensaje de éxito sin errores en rojo

---

## PASO 4 — Configurar la conexión a la base de datos

Dentro de la carpeta `backend/`, crear un archivo llamado **`.env`** (con el punto adelante, sin extensión).

> En Windows, si el explorador de archivos no te deja crear archivos que empiezan con punto, podés hacerlo desde el Bloc de notas: Archivo → Guardar como → poner `.env` entre comillas `".env"` y guardar en la carpeta `backend/`.

El contenido del archivo debe ser exactamente esto (reemplazando `TU_CONTRASEÑA` por la que pusiste al instalar PostgreSQL):

```
JWT_SECRET=clave_super_secreta_heladeria

DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=TU_CONTRASEÑA
DB_NAME=heladeria_db
```

---

## PASO 5 — Instalar dependencias

Abrir una terminal (CMD, PowerShell, o Terminal de Windows) y ejecutar los siguientes comandos.

**Primero para el backend:**
```
cd ruta\a\ProyectoProgramaHeladeria\backend
npm install
```

**Luego para el frontend:**
```
cd ruta\a\ProyectoProgramaHeladeria\frontend
npm install
```

> El `npm install` puede tardar unos minutos la primera vez. Es normal.

---

## PASO 6 — Crear los usuarios iniciales

Con el backend configurado, ejecutar este comando una sola vez para crear los usuarios de prueba:

```
cd ruta\a\ProyectoProgramaHeladeria\backend
node check-users.js
```

Esto crea automáticamente:

| Usuario | Email | Contraseña | Rol |
|---|---|---|---|
| Administrador | admin@heladeria.com | admin123 | admin |
| Vendedor Demo | vendedor@heladeria.com | vend123 | vendedor |

---

## PASO 7 — Iniciar el sistema

Necesitás tener **dos terminales abiertas al mismo tiempo**.

**Terminal 1 — Backend (servidor):**
```
cd ruta\a\ProyectoProgramaHeladeria\backend
npm start
```
Debe aparecer:
```
Servidor corriendo en http://localhost:5000
Conexión a la base de datos exitosa
```

**Terminal 2 — Frontend (interfaz):**
```
cd ruta\a\ProyectoProgramaHeladeria\frontend
npm start
```
El navegador se abre automáticamente en `http://localhost:3000`.

---

## Acceso al sistema

Una vez iniciado, ingresar con alguno de los usuarios creados:

- **Admin:** `admin@heladeria.com` / `admin123`
- **Vendedor:** `vendedor@heladeria.com` / `vend123`

---

## Solución de problemas comunes

| Error | Causa probable | Solución |
|---|---|---|
| `ECONNREFUSED` al iniciar backend | PostgreSQL no está corriendo | Abrir Servicios de Windows y verificar que el servicio `postgresql-x64-xx` esté iniciado |
| `password authentication failed` | Contraseña incorrecta en `.env` | Verificar la contraseña en el archivo `.env` |
| `database "heladeria_db" does not exist` | No se creó la base | Repetir el Paso 3 |
| Puerto 3000 ocupado | Otra app usa ese puerto | El frontend pregunta si usar otro puerto — responder `y` |
| `npm install` falla con errores | Versión de Node muy vieja | Actualizar Node.js a la versión LTS |
| El navegador no abre solo | - | Abrir manualmente `http://localhost:3000` |

---

## Para cerrar el sistema

En cada terminal presionar `Ctrl + C` para detener el proceso.
