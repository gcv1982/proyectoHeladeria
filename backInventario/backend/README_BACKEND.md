# Backend - Sistema de Gestión de Heladería

API REST construida con **FastAPI** para gestionar inventario, ventas y productos de heladería.

---

## 🚀 Instalación y Configuración

### 1. Requisitos Previos

- Python 3.8 o superior
- PostgreSQL instalado y corriendo
- Base de datos `heladeria_db` creada y con datos cargados (Fase 1)

### 2. Instalar Dependencias

```bash
# Navegar a la carpeta backend
cd backend

# Instalar las dependencias
pip install -r requirements.txt
```

### 3. Configurar Variables de Entorno

Editar el archivo `app/database/connection.py` y cambiar la línea:

```python
DATABASE_URL = "postgresql://postgres:TU_PASSWORD@localhost:5432/heladeria_db"
```

Reemplazar `TU_PASSWORD` con tu contraseña de PostgreSQL.

### 4. Ejecutar el Servidor

```bash
# Desde la carpeta backend
uvicorn app.main:app --reload
```

El servidor se levantará en: **http://localhost:8000**

---

## 📚 Documentación Automática

FastAPI genera documentación interactiva automáticamente:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

Podés probar todos los endpoints directamente desde el navegador.

---

## 🔌 Endpoints Disponibles

### **Productos** (`/productos`)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/productos/` | Lista todos los productos |
| GET | `/productos/con-stock` | Lista productos con información de stock |
| GET | `/productos/{id}` | Obtiene un producto específico |
| POST | `/productos/` | Crea un nuevo producto |
| PUT | `/productos/{id}` | Actualiza un producto |
| DELETE | `/productos/{id}` | Desactiva un producto |
| GET | `/productos/categoria/{id}` | Lista productos por categoría |

**Ejemplos:**

```bash
# Listar todos los productos
curl http://localhost:8000/productos/

# Buscar productos
curl http://localhost:8000/productos/?buscar=chocolate

# Productos con stock bajo
curl http://localhost:8000/productos/con-stock?stock_bajo=true
```

---

### **Inventario** (`/inventario`)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/inventario/` | Lista todo el inventario |
| GET | `/inventario/stock-bajo` | Productos con stock bajo |
| GET | `/inventario/producto/{id}` | Inventario de un producto |
| PUT | `/inventario/producto/{id}` | Actualiza stock mínimo |
| POST | `/inventario/movimiento` | Registra movimiento (entrada/salida) |
| GET | `/inventario/movimientos` | Lista movimientos |
| GET | `/inventario/valor-total` | Calcula valor total del inventario |

**Ejemplos:**

```bash
# Ver stock bajo
curl http://localhost:8000/inventario/stock-bajo

# Registrar entrada de mercadería
curl -X POST http://localhost:8000/inventario/movimiento \
  -H "Content-Type: application/json" \
  -d '{
    "producto_id": 1,
    "tipo": "entrada",
    "cantidad": 10,
    "observacion": "Recepción de mercadería"
  }'

# Registrar salida (por merma, rotura, etc)
curl -X POST http://localhost:8000/inventario/movimiento \
  -H "Content-Type: application/json" \
  -d '{
    "producto_id": 1,
    "tipo": "salida",
    "cantidad": 2,
    "observacion": "Merma"
  }'
```

---

### **Ventas** (`/ventas`)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/ventas/` | Registra una venta |
| GET | `/ventas/` | Lista ventas con filtros |
| GET | `/ventas/hoy` | Ventas del día actual |
| GET | `/ventas/total-dia` | Total de ventas del día |
| GET | `/ventas/total-mes` | Total de ventas del mes |
| GET | `/ventas/reporte/por-producto` | Reporte por producto |
| GET | `/ventas/reporte/por-categoria` | Reporte por categoría |
| GET | `/ventas/producto/{id}` | Ventas de un producto |

**Ejemplos:**

```bash
# Registrar una venta
curl -X POST http://localhost:8000/ventas/ \
  -H "Content-Type: application/json" \
  -d '{
    "producto_id": 1,
    "cantidad_vendida": 2,
    "precio_venta": 2240,
    "fecha": "2024-11-12"
  }'

# Ver ventas de hoy
curl http://localhost:8000/ventas/hoy

# Total del día
curl http://localhost:8000/ventas/total-dia

# Total del mes
curl http://localhost:8000/ventas/total-mes

# Reporte por producto
curl http://localhost:8000/ventas/reporte/por-producto
```

---

### **Categorías** (`/categorias`)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/categorias/` | Lista todas las categorías |
| GET | `/categorias/{id}` | Obtiene una categoría |
| POST | `/categorias/` | Crea una nueva categoría |

---

### **Dashboard** (`/dashboard`)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/dashboard/resumen` | Resumen general |
| GET | `/dashboard/productos-mas-vendidos` | Top productos vendidos |
| GET | `/dashboard/alertas` | Alertas del sistema |

**Ejemplos:**

```bash
# Resumen del dashboard
curl http://localhost:8000/dashboard/resumen

# Top 10 productos más vendidos
curl http://localhost:8000/dashboard/productos-mas-vendidos?limite=10

# Alertas
curl http://localhost:8000/dashboard/alertas
```

---

## 📊 Ejemplos de Uso Completos

### Ejemplo 1: Registrar una venta completa

```python
import requests

# 1. Ver productos disponibles
productos = requests.get("http://localhost:8000/productos/con-stock").json()
print(f"Productos disponibles: {len(productos)}")

# 2. Registrar venta
venta = {
    "producto_id": 10,  # ID del producto
    "cantidad_vendida": 3,
    "precio_venta": 4210,
    "fecha": "2024-11-12"
}

response = requests.post("http://localhost:8000/ventas/", json=venta)
print(f"Venta registrada: {response.json()}")

# 3. Ver stock actualizado
inventario = requests.get(f"http://localhost:8000/inventario/producto/10").json()
print(f"Stock actual: {inventario['stock_actual']}")
```

### Ejemplo 2: Obtener reporte de ventas

```python
import requests
from datetime import date, timedelta

# Reporte del último mes
fecha_hasta = date.today()
fecha_desde = fecha_hasta - timedelta(days=30)

params = {
    "fecha_desde": fecha_desde.isoformat(),
    "fecha_hasta": fecha_hasta.isoformat()
}

reporte = requests.get(
    "http://localhost:8000/ventas/reporte/por-producto",
    params=params
).json()

print("Top 5 productos más vendidos:")
for i, item in enumerate(reporte[:5], 1):
    print(f"{i}. {item['producto_nombre']}: ${item['total_ingresos']}")
```

---

## 🛠️ Características Automáticas

### ✅ Validación de Datos
- Pydantic valida todos los datos de entrada
- Errores claros y descriptivos

### ✅ Actualización Automática de Stock
- Al registrar una venta, el stock se actualiza automáticamente
- Se crea un movimiento de inventario

### ✅ Documentación Interactiva
- Swagger UI en `/docs`
- Probar endpoints directamente desde el navegador

### ✅ CORS Habilitado
- Permite requests desde cualquier frontend
- Listo para conectar con React/Vue/Angular

---

## 📁 Estructura del Proyecto

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                 # Aplicación principal
│   ├── database/
│   │   └── connection.py       # Configuración de DB
│   ├── models/
│   │   └── models.py           # Modelos SQLAlchemy
│   ├── schemas/
│   │   └── schemas.py          # Schemas Pydantic
│   └── routers/
│       ├── productos.py        # Endpoints de productos
│       ├── inventario.py       # Endpoints de inventario
│       ├── ventas.py           # Endpoints de ventas
│       └── otros.py            # Categorías y dashboard
├── requirements.txt            # Dependencias
└── .env.example               # Ejemplo de variables de entorno
```

---

## 🔧 Solución de Problemas

### Error: "ModuleNotFoundError: No module named 'app'"

```bash
# Ejecutar desde la carpeta backend (no desde app)
cd backend
uvicorn app.main:app --reload
```

### Error: "Connection refused" al conectar a PostgreSQL

1. Verificar que PostgreSQL esté corriendo
2. Verificar las credenciales en `app/database/connection.py`
3. Verificar que la base de datos `heladeria_db` exista

### Error: "Table 'productos' doesn't exist"

Asegurarte de haber ejecutado el `schema.sql` en la Fase 1.

---

## 🎯 Próximos Pasos

### Mejoras Sugeridas:
- [ ] Agregar autenticación (JWT)
- [ ] Sistema de usuarios y roles
- [ ] Backup automático de base de datos
- [ ] Reportes en PDF
- [ ] Notificaciones de stock bajo

### Para Producción:
- [ ] Usar variables de entorno con `.env`
- [ ] Configurar CORS específico
- [ ] Agregar rate limiting
- [ ] Logging estructurado
- [ ] Tests unitarios

---

## 📞 Testing con Postman

Podés importar los endpoints en Postman usando la URL de OpenAPI:

```
http://localhost:8000/openapi.json
```

---

## ✅ Estado del Proyecto

**Fase 2 - Backend API**: ✅ Completado

**Lo que tenés ahora:**
- ✅ API REST completamente funcional
- ✅ 30+ endpoints documentados
- ✅ Validación automática de datos
- ✅ Actualización automática de stock
- ✅ Reportes y estadísticas
- ✅ Listo para conectar con frontend

**Siguiente fase:** Frontend con React 🔜
