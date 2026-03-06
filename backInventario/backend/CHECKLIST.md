# ✅ Checklist de Verificación - Backend

Usa esta lista para verificar que todo esté configurado correctamente.

---

## 📋 FASE 1: Instalación de Software

- [ ] **Python 3.8+** instalado
  - Verificar: `python --version` o `python3 --version`
  - Descargar: https://www.python.org/downloads/

- [ ] **PostgreSQL** instalado y corriendo
  - Verificar: Abrir pgAdmin o ejecutar `psql --version`
  - Descargar: https://www.postgresql.org/download/

- [ ] **Visual Studio Code** instalado
  - Descargar: https://code.visualstudio.com/

- [ ] **Base de datos** `heladeria_db` creada
  - Verificar en pgAdmin: Debe aparecer en la lista de databases

- [ ] **Tablas** creadas en la base de datos
  - Verificar: Expandir heladeria_db → Schemas → public → Tables
  - Debe haber 7 tablas: productos, categorias, inventario, etc.

- [ ] **Datos** cargados en las tablas
  - Verificar: Query en pgAdmin: `SELECT COUNT(*) FROM productos;`
  - Debe retornar más de 80 productos

---

## 📋 FASE 2: Configuración del Proyecto

- [ ] Carpeta **backend** descargada
  - Debe contener: app/, .vscode/, requirements.txt, etc.

- [ ] **VSCode abierto** en la carpeta backend
  - `File → Open Folder → Seleccionar carpeta backend`

- [ ] **Extensiones de VSCode** instaladas
  - [ ] Python (Microsoft)
  - [ ] Pylance (Microsoft)
  - [ ] Thunder Client (opcional pero recomendado)
  - Verificar: `Ctrl + Shift + X` → Buscar "Python"

- [ ] **Entorno virtual** creado
  - Debe existir carpeta `venv/` en el proyecto
  - Verificar: `ls venv` o ver carpeta en VSCode

- [ ] **Entorno virtual** activado
  - Ver `(venv)` al inicio de la línea en la terminal
  - Si no: `Ctrl + Shift + P` → "Python: Select Interpreter"

- [ ] **Dependencias** instaladas
  - Ejecutar: `pip list`
  - Debe aparecer: fastapi, uvicorn, sqlalchemy, psycopg2-binary

- [ ] **Password de PostgreSQL** configurada
  - Archivo: `app/database/connection.py`
  - Línea debe tener tu password real (no "tu_password")

---

## 📋 FASE 3: Ejecución del Servidor

- [ ] **Servidor ejecutándose**
  - Ejecutar: `uvicorn app.main:app --reload` o presionar `F5`
  - Terminal debe mostrar: "Application startup complete"
  - No debe haber errores rojos

- [ ] **Puerto 8000** libre y funcionando
  - Verificar: http://localhost:8000
  - Debe mostrar JSON: `{"mensaje": "API de Gestión de Heladería"...}`

- [ ] **Documentación Swagger** accesible
  - Abrir: http://localhost:8000/docs
  - Debe mostrar interfaz interactiva con todos los endpoints

- [ ] **Endpoints básicos** funcionando
  - [ ] GET http://localhost:8000/productos/ → Retorna lista de productos
  - [ ] GET http://localhost:8000/dashboard/resumen → Retorna resumen
  - Probar desde Swagger o Thunder Client

---

## 📋 FASE 4: Verificación de Funcionalidad

### Test 1: Listar Productos
- [ ] Ir a http://localhost:8000/docs
- [ ] Click en `GET /productos/`
- [ ] Click en "Try it out"
- [ ] Click en "Execute"
- [ ] Debe retornar lista con más de 80 productos
- [ ] Status code: 200

### Test 2: Ver Stock
- [ ] Endpoint: `GET /productos/con-stock`
- [ ] "Try it out" → "Execute"
- [ ] Debe mostrar productos con stock_actual, stock_minimo
- [ ] Status code: 200

### Test 3: Ver Dashboard
- [ ] Endpoint: `GET /dashboard/resumen`
- [ ] "Try it out" → "Execute"
- [ ] Debe mostrar métricas: total_productos, valor_inventario, etc.
- [ ] Status code: 200

### Test 4: Registrar Venta
- [ ] Endpoint: `POST /ventas/`
- [ ] "Try it out"
- [ ] Llenar datos de ejemplo:
  ```json
  {
    "producto_id": 10,
    "cantidad_vendida": 1,
    "precio_venta": 4210,
    "fecha": "2024-11-12"
  }
  ```
- [ ] "Execute"
- [ ] Debe retornar la venta creada
- [ ] Status code: 201

### Test 5: Verificar Stock se Actualizó
- [ ] Endpoint: `GET /inventario/producto/10`
- [ ] Verificar que stock_actual disminuyó en 1
- [ ] Status code: 200

---

## 📋 FASE 5: Configuración de VSCode

- [ ] **Terminal integrada** funciona
  - `Ctrl + ñ` abre/cierra terminal
  - Muestra `(venv)` al inicio

- [ ] **Debugger** configurado
  - Presionar `F5` ejecuta el servidor
  - No hay errores

- [ ] **Breakpoints** funcionan
  - Poner un breakpoint en cualquier línea (click izquierdo del número)
  - Ejecutar con `F5`
  - Hacer un request
  - VSCode debe detenerse en el breakpoint

- [ ] **Autocompletado** funciona
  - Escribir `router.` y presionar `Ctrl + Space`
  - Debe mostrar opciones: get, post, put, delete, etc.

- [ ] **Snippets** funcionan
  - Escribir `fastapi-get` y presionar `Tab`
  - Debe crear un template de endpoint

- [ ] **Thunder Client** listo (opcional)
  - Click en icono ⚡ en barra lateral
  - "New Request"
  - GET http://localhost:8000/productos/
  - "Send" → Debe retornar productos

---

## 📋 FASE 6: Testing Completo

### CRUD de Productos

- [ ] **Listar** productos: `GET /productos/` ✅
- [ ] **Obtener** un producto: `GET /productos/1` ✅
- [ ] **Crear** producto: `POST /productos/` ✅
- [ ] **Actualizar** producto: `PUT /productos/{id}` ✅
- [ ] **Desactivar** producto: `DELETE /productos/{id}` ✅

### Inventario

- [ ] Ver inventario: `GET /inventario/` ✅
- [ ] Stock bajo: `GET /inventario/stock-bajo` ✅
- [ ] Registrar entrada: `POST /inventario/movimiento` (tipo: entrada) ✅
- [ ] Registrar salida: `POST /inventario/movimiento` (tipo: salida) ✅
- [ ] Ver movimientos: `GET /inventario/movimientos` ✅

### Ventas

- [ ] Registrar venta: `POST /ventas/` ✅
- [ ] Ver ventas: `GET /ventas/` ✅
- [ ] Ventas de hoy: `GET /ventas/hoy` ✅
- [ ] Total del día: `GET /ventas/total-dia` ✅
- [ ] Total del mes: `GET /ventas/total-mes` ✅
- [ ] Reporte por producto: `GET /ventas/reporte/por-producto` ✅

### Dashboard

- [ ] Resumen: `GET /dashboard/resumen` ✅
- [ ] Top vendidos: `GET /dashboard/productos-mas-vendidos` ✅
- [ ] Alertas: `GET /dashboard/alertas` ✅

---

## 📋 VERIFICACIÓN FINAL

### Checklist Rápido

1. [ ] VSCode abierto en carpeta backend
2. [ ] Terminal muestra `(venv)`
3. [ ] Servidor corriendo (F5 o terminal)
4. [ ] http://localhost:8000/docs abre correctamente
5. [ ] Todos los endpoints en verde (sin errores)
6. [ ] Al menos 3 endpoints probados exitosamente
7. [ ] Debugger funciona (F5 + breakpoint)
8. [ ] Puedo crear/editar/guardar archivos

### Si TODO está ✅

**¡Felicitaciones! El backend está completamente configurado y funcionando.** 🎉

Estás listo para:
- Desarrollar nuevos endpoints
- Personalizar la lógica de negocio
- Pasar a la Fase 3: Frontend

---

## ❌ Si algo NO funciona

### Problemas Comunes

**Servidor no arranca:**
1. Verificar PostgreSQL corriendo
2. Verificar password en `connection.py`
3. Verificar entorno virtual activo `(venv)`
4. Ver errores en la terminal

**Import errors:**
1. `Ctrl + Shift + P`
2. "Python: Select Interpreter"
3. Seleccionar `./venv/Scripts/python.exe`
4. Reiniciar VSCode

**No hay productos en la API:**
1. Verificar que ejecutaste `insertar_datos.sql` en pgAdmin
2. Consultar en pgAdmin: `SELECT COUNT(*) FROM productos;`

**Puerto 8000 ocupado:**
1. Cambiar puerto: `uvicorn app.main:app --reload --port 8001`
2. O detener el proceso que usa el puerto 8000

---

## 📞 Ayuda Adicional

Si tienes problemas, revisar:

1. **INICIO_RAPIDO.md** - Setup básico
2. **GUIA_VSCODE.md** - Configuración detallada
3. **README_BACKEND.md** - Solución de problemas técnicos

---

## 🎯 Siguiente Paso

Una vez que TODO esté ✅:

**Opción A:** Explorar y personalizar el código
**Opción B:** Empezar con el frontend (Fase 3)
**Opción C:** Agregar más funcionalidades al backend

---

**Estado actual:** [ ] Setup Completo | [ ] Listo para Desarrollar | [ ] Listo para Frontend
