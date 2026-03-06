# Backend API - Sistema de Gestión de Heladería

API REST desarrollada con FastAPI para gestión integral de heladería: inventario, ventas, productos y reportes.

## 🚀 Instalación y Configuración

### 1. Requisitos Previos

- Python 3.8 o superior
- PostgreSQL instalado y corriendo
- Base de datos `heladeria_db` creada (ver Fase 1)

### 2. Instalación de Dependencias

```bash
# Navegar a la carpeta backend
cd backend

# Instalar dependencias
pip install -r requirements.txt
```

### 3. Configuración de Variables de Entorno

```bash
# Copiar el archivo de ejemplo
cp .env.example .env

# Editar .env con tus credenciales
```

Contenido del archivo `.env`:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=heladeria_db
DB_USER=postgres
DB_PASSWORD=tu_password_aqui

API_HOST=0.0.0.0
API_PORT=8000
```

### 4. Verificar Conexión a Base de Datos

```bash
python database.py
```

Deberías ver:
```
✓ Conexión exitosa a PostgreSQL
  Versión: PostgreSQL 15.x...
```

### 5. Iniciar el Servidor

```bash
# Opción 1: Usando Python directamente
python main.py

# Opción 2: Usando uvicorn
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

El servidor estará disponible en:
- **API**: http://localhost:8000
- **Documentación interactiva**: http://localhost:8000/docs
- **Documentación alternativa**: http://localhost:8000/redoc

---

## 📚 Documentación de la API

### Endpoints Principales

#### **Productos** (`/api/productos`)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/productos` | Lista todos los productos |
| GET | `/api/productos/{id}` | Obtiene un producto específico |
| GET | `/api/productos/stock-bajo` | Productos con stock bajo |
| POST | `/api/productos` | Crea un nuevo producto |
| PUT | `/api/productos/{id}` | Actualiza un producto |
| DELETE | `/api/productos/{id}` | Elimina (desactiva) un producto |

#### **Inventario** (`/api/inventario`)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/inventario` | Inventario completo |
| GET | `/api/inventario/producto/{id}` | Inventario de un producto |
| GET | `/api/inventario/movimientos` | Historial de movimientos |
| GET | `/api/inventario/valor-total` | Valor total del inventario |
| GET | `/api/inventario/mas-vendidos` | Productos más vendidos |
| POST | `/api/inventario/movimientos` | Registra entrada/salida/ajuste |
| PUT | `/api/inventario/stock-minimo/{id}` | Actualiza stock mínimo |

#### **Ventas** (`/api/ventas`)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/ventas` | Lista de ventas |
| GET | `/api/ventas/resumen-dia` | Resumen del día |
| GET | `/api/ventas/por-producto` | Ventas por producto |
| GET | `/api/ventas/por-categoria` | Ventas por categoría |
| GET | `/api/ventas/top-productos` | Top productos vendidos |
| POST | `/api/ventas` | Registra una venta |
| POST | `/api/ventas/masivas` | Registra múltiples ventas |

---

## 🔧 Ejemplos de Uso

### 1. Listar todos los productos

```bash
curl http://localhost:8000/api/productos
```

### 2. Crear un nuevo producto

```bash
curl -X POST http://localhost:8000/api/productos \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "DULCE DE LECHE PREMIUM",
    "categoria_id": 2,
    "unidad_medida": "kg",
    "precio_actual": 5200,
    "costo_unitario": 3000
  }'
```

### 3. Registrar entrada de inventario

```bash
curl -X POST http://localhost:8000/api/inventario/movimientos \
  -H "Content-Type: application/json" \
  -d '{
    "producto_id": 1,
    "tipo": "entrada",
    "cantidad": 10,
    "observacion": "Compra mensual",
    "usuario": "admin"
  }'
```

### 4. Registrar una venta

```bash
curl -X POST http://localhost:8000/api/ventas \
  -H "Content-Type: application/json" \
  -d '{
    "producto_id": 1,
    "cantidad_vendida": 2,
    "precio_venta": 2240
  }'
```

### 5. Ver productos con stock bajo

```bash
curl http://localhost:8000/api/productos/stock-bajo
```

### 6. Obtener resumen de ventas del día

```bash
curl http://localhost:8000/api/ventas/resumen-dia
```

### 7. Ver valor total del inventario

```bash
curl http://localhost:8000/api/inventario/valor-total
```

---

## 📊 Estructura del Proyecto

```
backend/
├── main.py                 # Aplicación principal FastAPI
├── config.py              # Configuración y variables de entorno
├── database.py            # Conexión a PostgreSQL
├── models.py              # Modelos Pydantic (validación)
├── requirements.txt       # Dependencias
├── .env.example          # Ejemplo de variables de entorno
│
├── routers/              # Endpoints de la API
│   ├── __init__.py
│   ├── productos.py
│   ├── inventario.py
│   └── ventas.py
│
└── services/             # Lógica de negocio
    ├── __init__.py
    ├── producto_service.py
    ├── inventario_service.py
    └── venta_service.py
```

---

## 🎯 Características Principales

### ✅ Gestión de Productos
- CRUD completo de productos
- Clasificación por categorías
- Control de precios históricos
- Estados activo/inactivo

### ✅ Control de Inventario
- Stock en tiempo real
- Movimientos (entradas/salidas/ajustes)
- Alertas de stock bajo
- Historial completo de movimientos
- Cálculo de valor total

### ✅ Registro de Ventas
- Ventas individuales y masivas
- Descuento automático de inventario
- Reportes por producto
- Reportes por categoría
- Top productos vendidos
- Resúmenes diarios

### ✅ Validaciones Automáticas
- Stock suficiente antes de vender
- Tipos de datos correctos
- Cantidades positivas
- Fechas válidas

### ✅ Documentación Interactiva
- Swagger UI en `/docs`
- ReDoc en `/redoc`
- Ejemplos de uso
- Esquemas de datos

---

## 🔐 Seguridad (Próximamente)

En futuras versiones se agregará:
- Autenticación JWT
- Roles y permisos
- Rate limiting
- Validación de tokens

---

## 🐛 Solución de Problemas

### Error: "Connection refused"
```bash
# Verificar que PostgreSQL esté corriendo
sudo service postgresql status

# Iniciar si está detenido
sudo service postgresql start
```

### Error: "ModuleNotFoundError"
```bash
# Asegurarse de estar en el entorno virtual correcto
pip install -r requirements.txt
```

### Error: "Database does not exist"
```bash
# Verificar que la base de datos esté creada
psql -U postgres -c "SELECT datname FROM pg_database WHERE datname='heladeria_db';"
```

### El servidor no arranca
```bash
# Verificar que el puerto 8000 no esté en uso
lsof -i :8000

# Si está ocupado, matar el proceso o cambiar el puerto en .env
```

---

## 📈 Próximas Mejoras

- [ ] Autenticación y autorización
- [ ] WebSocket para actualizaciones en tiempo real
- [ ] Exportación de reportes (PDF, Excel)
- [ ] Backup automático de base de datos
- [ ] Envío de alertas por email
- [ ] Dashboard de métricas
- [ ] Integración con sistemas de pago

---

## 🧪 Testing (Futuro)

```bash
# Instalar dependencias de testing
pip install pytest pytest-asyncio httpx

# Ejecutar tests
pytest
```

---

## 📝 Notas Importantes

- El servidor usa **auto-reload** en desarrollo (se reinicia automáticamente al cambiar código)
- Todos los endpoints están documentados en `/docs`
- Los errores devuelven mensajes descriptivos en JSON
- Las fechas se manejan en formato ISO (YYYY-MM-DD)
- Los decimales se usan para cantidades y precios (precisión exacta)

---

## 🆘 Soporte

Para reportar bugs o sugerir mejoras, crear un issue en el repositorio.

---

**Estado:** ✅ Backend Completo y Funcional
**Siguiente:** Frontend con React 🔜
