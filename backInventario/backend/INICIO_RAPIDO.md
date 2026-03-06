# 🚀 Inicio Rápido - Backend con VSCode

Guía super rápida para empezar en 5 minutos.

---

## ⚡ Setup en 5 Pasos

### 1️⃣ Abrir VSCode
```bash
# Navegar a la carpeta backend
cd ruta/a/backend

# Abrir VSCode
code .
```

### 2️⃣ Instalar Extensiones
Cuando abras VSCode, te va a aparecer un popup diciendo:
**"Este workspace recomienda extensiones"**

➡️ Click en **"Instalar todo"**

O manualmente:
- Presionar `Ctrl + Shift + X`
- Buscar e instalar:
  - ✅ Python (Microsoft)
  - ✅ Pylance (Microsoft)

### 3️⃣ Crear Entorno Virtual
Presionar `Ctrl + Shift + P` y escribir:
```
Python: Create Environment
```
- Seleccionar **Venv**
- Seleccionar tu Python
- ✅ Marcar `requirements.txt`
- Click en **OK**

VSCode instalará todo automáticamente. Esperar 1-2 minutos.

### 4️⃣ Configurar Base de Datos
Abrir: `app/database/connection.py`

Cambiar esta línea:
```python
DATABASE_URL = "postgresql://postgres:TU_PASSWORD@localhost:5432/heladeria_db"
```

Poner tu contraseña de PostgreSQL.

### 5️⃣ Ejecutar el Servidor

**Opción A - Atajo de teclado:**
Presionar `F5`

**Opción B - Terminal:**
Presionar `` Ctrl + ñ `` y escribir:
```bash
uvicorn app.main:app --reload
```

**Opción C - Tarea automatizada:**
Presionar `Ctrl + Shift + B`

---

## ✅ Verificar que Funciona

Abrir en el navegador:
```
http://localhost:8000/docs
```

Deberías ver la documentación interactiva de la API 🎉

---

## 🎯 Comandos Esenciales

| Acción | Atajo |
|--------|-------|
| Ejecutar con debugger | `F5` |
| Ejecutar tarea (servidor) | `Ctrl + Shift + B` |
| Abrir terminal | `Ctrl + ñ` |
| Command palette | `Ctrl + Shift + P` |
| Buscar archivo | `Ctrl + P` |
| Formatear código | `Shift + Alt + F` |
| Ir a definición | `F12` o `Ctrl + Click` |

---

## 🧪 Probar la API

### Desde el Navegador (Swagger)
1. Ir a http://localhost:8000/docs
2. Click en cualquier endpoint
3. Click en "Try it out"
4. Llenar parámetros
5. Click en "Execute"

### Desde Thunder Client (en VSCode)
1. Click en el icono ⚡ en la barra lateral
2. Click en "New Request"
3. Poner: `GET http://localhost:8000/productos/`
4. Click en "Send"

---

## 🐛 Debug Rápido

### Poner un Breakpoint
1. Click a la izquierda del número de línea (aparece un punto rojo)
2. Presionar `F5` para ejecutar en modo debug
3. Hacer un request a la API
4. VSCode se detendrá en tu breakpoint

### Ver Variables
Cuando el código se detenga:
- Panel izquierdo muestra todas las variables
- Pasar el mouse sobre variables en el código
- Console debug abajo para ejecutar comandos

---

## 📁 Archivos Importantes

```
backend/
├── app/
│   ├── main.py              ← Archivo principal
│   ├── routers/             ← Endpoints aquí
│   │   ├── productos.py
│   │   ├── inventario.py
│   │   └── ventas.py
│   ├── models/              ← Modelos de DB
│   └── database/            ← Configuración de DB
│       └── connection.py    ← CAMBIAR PASSWORD AQUÍ
└── .vscode/                 ← Configuración de VSCode
```

---

## 🔥 Tips Rápidos

### Autocompletado Inteligente
Escribir `router.` y presionar `Ctrl + Space` → VSCode muestra todos los métodos disponibles

### Crear Endpoints Rápido
1. Escribir `fastapi-get` 
2. Presionar `Tab`
3. Se crea un template completo
4. Navegar con `Tab` entre los campos

### Ver Documentación
Pasar el mouse sobre cualquier función → VSCode muestra la documentación

### Formatear Todo el Código
`Shift + Alt + F` → Código limpio y organizado

---

## ❗ Problemas Comunes

### "Import could not be resolved"
**Solución:**
- `Ctrl + Shift + P` → `Python: Select Interpreter`
- Seleccionar el que dice `./venv/...`

### Terminal no muestra (venv)
**Solución:**
Cerrar y abrir una nueva terminal en VSCode

### Servidor no arranca
**Verificar:**
1. PostgreSQL está corriendo
2. Password correcta en `connection.py`
3. Base de datos `heladeria_db` existe
4. Entorno virtual activo: ver `(venv)` en terminal

---

## 📚 Más Ayuda

- **Guía completa**: Ver `GUIA_VSCODE.md`
- **Documentación API**: Ver `README_BACKEND.md`
- **Shortcuts**: `Ctrl + K, Ctrl + S` en VSCode

---

¡Listo para programar! 🚀
