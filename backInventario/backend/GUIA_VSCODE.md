# 🎨 Guía de Visual Studio Code - Backend Heladería

Guía completa para configurar y usar el backend con Visual Studio Code.

---

## 📥 PASO 1: Instalar Visual Studio Code

1. Descargar desde: https://code.visualstudio.com/
2. Instalar con las opciones por defecto
3. Abrir Visual Studio Code

---

## 🔌 PASO 2: Instalar Extensiones Necesarias

Abrir VSCode y presionar `Ctrl + Shift + X` (o `Cmd + Shift + X` en Mac) para abrir el panel de extensiones.

### Extensiones OBLIGATORIAS:

1. **Python** (Microsoft)
   - ID: `ms-python.python`
   - Autocompletado, debugging, linting

2. **Pylance** (Microsoft)
   - ID: `ms-python.vscode-pylance`
   - IntelliSense mejorado para Python

### Extensiones RECOMENDADAS:

3. **SQLTools** 
   - ID: `mtxr.sqltools`
   - Para conectarte a PostgreSQL desde VSCode

4. **SQLTools PostgreSQL/Cockroach Driver**
   - ID: `mtxr.sqltools-driver-pg`
   - Driver para PostgreSQL

5. **Thunder Client** 
   - ID: `rangav.vscode-thunder-client`
   - Para probar la API (alternativa a Postman)

6. **Better Comments**
   - ID: `aaron-bond.better-comments`
   - Comentarios más legibles

7. **Error Lens**
   - ID: `usernamehw.errorlens`
   - Muestra errores inline

### Cómo instalar:
- Buscar cada extensión por nombre en el panel de extensiones
- Click en "Install"
- Reiniciar VSCode si lo pide

---

## 📂 PASO 3: Abrir el Proyecto

1. Abrir VSCode
2. `File` → `Open Folder` (o `Ctrl + K, Ctrl + O`)
3. Navegar a la carpeta `backend` del proyecto
4. Click en "Select Folder"

La estructura debería verse así:
```
backend/
├── app/
│   ├── database/
│   ├── models/
│   ├── routers/
│   ├── schemas/
│   └── main.py
├── requirements.txt
├── README_BACKEND.md
├── iniciar.bat
└── iniciar.sh
```

---

## 🐍 PASO 4: Configurar el Intérprete de Python

1. Presionar `Ctrl + Shift + P` (o `Cmd + Shift + P` en Mac)
2. Escribir: `Python: Select Interpreter`
3. Seleccionar el intérprete de Python instalado (ejemplo: `Python 3.11.x`)

### Si no aparece ningún intérprete:
```bash
# Verificar que Python está instalado
python --version

# Si no está instalado, descargar de:
# https://www.python.org/downloads/
```

---

## 📦 PASO 5: Crear Entorno Virtual (Recomendado)

Un entorno virtual mantiene las dependencias aisladas.

### Opción A: Desde VSCode (Recomendado)

1. Presionar `Ctrl + Shift + P`
2. Escribir: `Python: Create Environment`
3. Seleccionar `Venv`
4. Seleccionar el intérprete de Python
5. Marcar el checkbox de `requirements.txt`
6. Click en "OK"

VSCode creará automáticamente el entorno virtual e instalará las dependencias.

### Opción B: Desde la Terminal de VSCode

1. Abrir la terminal integrada: `Ctrl + ñ` o `View` → `Terminal`
2. Ejecutar:

**Windows:**
```bash
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

**Linux/Mac:**
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Verificar que el entorno está activo:
Deberías ver `(venv)` al inicio de la línea en la terminal.

---

## ⚙️ PASO 6: Configurar la Conexión a PostgreSQL

### Editar el archivo de conexión:

1. Abrir el archivo: `app/database/connection.py`
2. Buscar la línea:
```python
DATABASE_URL = "postgresql://postgres:tu_password@localhost:5432/heladeria_db"
```
3. Reemplazar `tu_password` con tu contraseña de PostgreSQL
4. Guardar: `Ctrl + S`

### Ejemplo:
Si tu contraseña es `mipassword123`:
```python
DATABASE_URL = "postgresql://postgres:mipassword123@localhost:5432/heladeria_db"
```

---

## 🚀 PASO 7: Ejecutar el Servidor

### Opción A: Desde la Terminal de VSCode

1. Abrir terminal: `Ctrl + ñ`
2. Asegurarse que el entorno virtual está activo `(venv)`
3. Ejecutar:
```bash
uvicorn app.main:app --reload
```

### Opción B: Usar el Script de Inicio

**Windows:**
```bash
iniciar.bat
```

**Linux/Mac:**
```bash
./iniciar.sh
```

### Opción C: Crear una Tarea de VSCode (Más Profesional)

1. Crear carpeta `.vscode` en la raíz del proyecto (si no existe)
2. Crear archivo `.vscode/tasks.json`:

```json
{
    "version": "2.0.0",
    "tasks": [
        {
            "label": "Ejecutar Backend",
            "type": "shell",
            "command": "uvicorn",
            "args": [
                "app.main:app",
                "--reload",
                "--host",
                "0.0.0.0",
                "--port",
                "8000"
            ],
            "group": {
                "kind": "build",
                "isDefault": true
            },
            "presentation": {
                "reveal": "always",
                "panel": "new"
            },
            "problemMatcher": []
        }
    ]
}
```

3. Ejecutar con: `Ctrl + Shift + B` o `Terminal` → `Run Task` → `Ejecutar Backend`

---

## 🐛 PASO 8: Configurar Debugging

Crear archivo `.vscode/launch.json`:

```json
{
    "version": "0.2.0",
    "configurations": [
        {
            "name": "FastAPI",
            "type": "python",
            "request": "launch",
            "module": "uvicorn",
            "args": [
                "app.main:app",
                "--reload"
            ],
            "jinja": true,
            "justMyCode": true,
            "env": {
                "PYTHONPATH": "${workspaceFolder}"
            }
        }
    ]
}
```

### Usar el Debugger:

1. Poner breakpoints: Click a la izquierda del número de línea
2. Presionar `F5` o `Run` → `Start Debugging`
3. El servidor se ejecutará en modo debug
4. Hacer requests a la API
5. VSCode se detendrá en los breakpoints

---

## 🧪 PASO 9: Probar la API con Thunder Client

Thunder Client es como Postman pero integrado en VSCode.

### Instalar Thunder Client:
1. `Ctrl + Shift + X` → Buscar "Thunder Client"
2. Instalar la extensión

### Usar Thunder Client:

1. Click en el icono de rayo ⚡ en la barra lateral
2. Click en "New Request"
3. Probar algunos endpoints:

**Ejemplo 1: Listar productos**
```
GET http://localhost:8000/productos/
```

**Ejemplo 2: Crear un producto**
```
POST http://localhost:8000/productos/
Content-Type: application/json

{
    "nombre": "Helado Test",
    "categoria_id": 1,
    "unidad_medida": "kg",
    "precio_actual": 5000,
    "costo_unitario": 3000
}
```

**Ejemplo 3: Registrar venta**
```
POST http://localhost:8000/ventas/
Content-Type: application/json

{
    "producto_id": 1,
    "cantidad_vendida": 2,
    "precio_venta": 2240,
    "fecha": "2024-11-12"
}
```

---

## 🗄️ PASO 10: Conectar a PostgreSQL desde VSCode

Con SQLTools podés ver y consultar tu base de datos directamente en VSCode.

### Configurar SQLTools:

1. Click en el icono de base de datos en la barra lateral
2. Click en "Add New Connection"
3. Seleccionar "PostgreSQL"
4. Llenar los datos:
   - **Connection name**: Heladeria DB
   - **Server**: localhost
   - **Port**: 5432
   - **Database**: heladeria_db
   - **Username**: postgres
   - **Password**: tu_password (guardar password)
5. Click en "Test Connection"
6. Si funciona, click en "Save Connection"

### Usar SQLTools:

- Ver tablas expandiendo la conexión
- Click derecho en una tabla → "Show Table Records"
- Abrir nueva query: Click en "New SQL File"
- Ejecutar queries: `Ctrl + E, Ctrl + E`

**Ejemplo de query:**
```sql
SELECT * FROM productos LIMIT 10;
```

---

## ⚡ PASO 11: Atajos de Teclado Útiles

### Generales:
- `Ctrl + P` - Buscar archivos rápido
- `Ctrl + Shift + P` - Command Palette (comandos)
- `Ctrl + ñ` - Toggle Terminal
- `Ctrl + B` - Toggle Sidebar
- `Ctrl + \` - Split Editor

### Edición:
- `Alt + ↑/↓` - Mover línea arriba/abajo
- `Shift + Alt + ↑/↓` - Copiar línea arriba/abajo
- `Ctrl + D` - Seleccionar siguiente ocurrencia
- `Ctrl + /` - Comentar/Descomentar
- `Ctrl + Space` - Autocompletado

### Python específicos:
- `Shift + Alt + F` - Formatear código
- `F5` - Ejecutar con debugger
- `Ctrl + F5` - Ejecutar sin debugger

### Navegación:
- `Ctrl + Click` en un símbolo - Ir a definición
- `Alt + ←/→` - Navegar atrás/adelante
- `Ctrl + Shift + O` - Ir a símbolo en archivo
- `Ctrl + T` - Ir a símbolo en workspace

---

## 📝 PASO 12: Configuraciones Recomendadas

Crear archivo `.vscode/settings.json`:

```json
{
    "python.linting.enabled": true,
    "python.linting.pylintEnabled": false,
    "python.linting.flake8Enabled": true,
    "python.formatting.provider": "black",
    "python.formatting.blackArgs": ["--line-length", "100"],
    "editor.formatOnSave": true,
    "editor.codeActionsOnSave": {
        "source.organizeImports": true
    },
    "python.analysis.typeCheckingMode": "basic",
    "files.exclude": {
        "**/__pycache__": true,
        "**/*.pyc": true
    },
    "[python]": {
        "editor.defaultFormatter": "ms-python.black-formatter",
        "editor.tabSize": 4,
        "editor.insertSpaces": true
    },
    "terminal.integrated.env.windows": {
        "PYTHONPATH": "${workspaceFolder}"
    },
    "terminal.integrated.env.linux": {
        "PYTHONPATH": "${workspaceFolder}"
    }
}
```

---

## 📋 PASO 13: Snippets Útiles

Crear archivo `.vscode/python.code-snippets`:

```json
{
    "FastAPI Endpoint": {
        "prefix": "fastapi-get",
        "body": [
            "@router.get(\"/${1:endpoint}\")",
            "def ${2:function_name}(",
            "    db: Session = Depends(get_db)",
            "):",
            "    \"\"\"",
            "    ${3:Description}",
            "    \"\"\"",
            "    ${4:# TODO: Implementation}",
            "    return {\"message\": \"success\"}"
        ],
        "description": "FastAPI GET endpoint"
    },
    "FastAPI POST Endpoint": {
        "prefix": "fastapi-post",
        "body": [
            "@router.post(\"/${1:endpoint}\", status_code=201)",
            "def ${2:function_name}(",
            "    data: ${3:Schema},",
            "    db: Session = Depends(get_db)",
            "):",
            "    \"\"\"",
            "    ${4:Description}",
            "    \"\"\"",
            "    ${5:# TODO: Implementation}",
            "    return data"
        ],
        "description": "FastAPI POST endpoint"
    }
}
```

### Usar snippets:
- Escribir `fastapi-get` y presionar `Tab`
- Se creará un template de endpoint GET
- Navegar con `Tab` entre los campos

---

## 🔥 PASO 14: Workflow Recomendado

### 1. Iniciar sesión de trabajo:
```bash
# Abrir VSCode en la carpeta del proyecto
code .

# Activar entorno virtual (si no está activado)
# Se activa automáticamente al abrir la terminal

# Ejecutar el servidor
uvicorn app.main:app --reload
```

### 2. Hacer cambios:
- Editar archivos en `app/routers/` o `app/models/`
- VSCode mostrará errores en tiempo real
- Autocompletado con `Ctrl + Space`
- Guardar: `Ctrl + S`
- El servidor se recarga automáticamente (--reload)

### 3. Probar cambios:
- Opción A: Navegador → http://localhost:8000/docs
- Opción B: Thunder Client en VSCode
- Opción C: Debugger con breakpoints (`F5`)

### 4. Ver logs:
- La terminal de VSCode muestra los logs en tiempo real
- Errores aparecen en rojo
- Requests aparecen con códigos de estado

---

## 🐛 Solución de Problemas en VSCode

### Problema: "Import could not be resolved"

**Solución:**
1. `Ctrl + Shift + P` → `Python: Select Interpreter`
2. Seleccionar el intérprete del venv: `./venv/Scripts/python.exe`
3. Reiniciar VSCode

### Problema: Terminal no activa el entorno virtual automáticamente

**Solución:**
Agregar a `.vscode/settings.json`:
```json
{
    "python.terminal.activateEnvironment": true
}
```

### Problema: Pylance muestra errores pero el código funciona

**Solución:**
Agregar a `.vscode/settings.json`:
```json
{
    "python.analysis.extraPaths": ["./app"]
}
```

### Problema: El servidor no se ejecuta

**Verificar:**
1. Entorno virtual activo: `(venv)` en la terminal
2. Dependencias instaladas: `pip list`
3. PostgreSQL corriendo
4. Credenciales correctas en `connection.py`

---

## 📚 Recursos Adicionales

### Documentación oficial:
- VSCode Python: https://code.visualstudio.com/docs/python/python-tutorial
- FastAPI: https://fastapi.tiangolo.com/
- SQLAlchemy: https://docs.sqlalchemy.org/

### Video tutoriales:
- VSCode Python Setup: YouTube → "VSCode Python Tutorial"
- FastAPI Tutorial: YouTube → "FastAPI Full Course"

---

## ✅ Checklist Final

Antes de empezar a desarrollar, verificar:

- [ ] VSCode instalado
- [ ] Extensiones Python y Pylance instaladas
- [ ] Proyecto abierto en VSCode
- [ ] Entorno virtual creado y activo
- [ ] Dependencias instaladas (`pip list`)
- [ ] PostgreSQL corriendo
- [ ] Credenciales configuradas en `connection.py`
- [ ] Servidor se ejecuta correctamente
- [ ] http://localhost:8000/docs abre correctamente
- [ ] Thunder Client o Postman configurado
- [ ] SQLTools conectado a la base de datos (opcional)

---

## 🎓 Tips Pro

1. **Multi-cursor editing**: `Alt + Click` para editar varias líneas
2. **Format on save**: Activar en settings para código limpio
3. **Git integration**: VSCode tiene Git integrado (panel Source Control)
4. **Zen Mode**: `Ctrl + K, Z` para modo sin distracciones
5. **Terminal split**: Click en el `+` dropdown → Split Terminal

---

¡Listo! Ahora tenés VSCode completamente configurado para trabajar con el backend 🚀
