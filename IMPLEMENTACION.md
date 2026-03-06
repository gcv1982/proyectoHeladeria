# 🍦 IMPLEMENTACIÓN CONEXIÓN BACKEND-FRONTEND - GUÍA RÁPIDA

## ✅ Lo que ya está hecho

### Backend (Express):
- ✅ Tabla de usuarios con hash de contraseña
- ✅ Tabla de ventas (JSON para items y pagos)
- ✅ Tabla de retiros y cajas
- ✅ Endpoint POST /api/login (autenticación con JWT)
- ✅ Endpoint POST /api/ventas (guardar venta)
- ✅ Endpoint GET /api/ventas (listar ventas)
- ✅ Endpoint GET /api/ventas/:id (obtener venta por ID)
- ✅ Endpoint GET /api/ventas-reporte (reporte de ventas)
- ✅ CORS configurado para localhost:3000
- ✅ Usuarios demo inyectados automáticamente

### Frontend (React):
- ✅ AuthContext actualizado para conectarse al API
- ✅ Login Page actualizada para usar email (no username)
- ✅ App.js conectado al API para guardar ventas
- ✅ Función apiGuardarVenta implementada
- ✅ confirmarVenta async para guardar en BD

### Base de Datos:
- ✅ Tabla usuarios con roles (admin, vendedor, gerente)
- ✅ Tabla ventas con JSON para items y pagos
- ✅ Índices para búsquedas rápidas

---

## 🚀 PASOS PARA EJECUTAR

### Paso 1: Inicializar Backend

```bash
cd backend
npm install
npm run dev
```

**Resultado esperado:**
```
✅ Conexión a la base de datos exitosa
✅ Tabla usuarios verificada
✅ Tabla ventas verificada
✅ Tabla retiros verificada
✅ Tabla cajas verificada
✅ Usuario admin creado
✅ Usuario vendedor creado
✅ Base de datos inicializada correctamente
🚀 Servidor corriendo en http://localhost:3000
```

### Paso 2: Inicializar Frontend

En otra terminal:

```bash
cd frontend
npm install
npm start
```

**Resultado esperado:**
```
Compiled successfully!
On Your Network: http://192.168.x.x:3000
```

Se abrirá navegador en http://localhost:3000

---

## 🔐 CREDENCIALES DE PRUEBA

**Admin:**
- Email: admin@heladeria.com
- Password: admin123
- Rol: admin

**Vendedor:**
- Email: vendedor@heladeria.com
- Password: vend123
- Rol: vendedor

---

## 🧪 TESTS - FLUJO COMPLETO

### 1. Login
Click en "Entrar como ADMIN"
- ✅ Debe mostrar la interfaz POS
- ✅ Nombre del usuario debe aparecer arriba a la derecha

### 2. Abrir Caja
- Ingresa denominaciones (ej: 1x billete de 20000)
- Click "Confirmar e Iniciar Caja"
- ✅ Caja debe mostrar "Abierta"

### 3. Hacer una Venta
- Selecciona categoría (ej: TENTACIONES)
- Agrega productos al carrito (ej: 2 x Chocolate)
- Click "COBRAR"
- Selecciona método de pago (EFECTIVO)
- Click "CONFIRMAR VENTA"
- ✅ Debe guardar en BD sin errores
- ✅ Debe mostrar "Venta Guardada en BD" en consola

### 4. Verificar en Base de Datos

En terminal MySQL:
```sql
USE proyectoheladeria;
SELECT * FROM ventas ORDER BY id DESC LIMIT 1;
```

Debe mostrar la venta que acabas de crear con:
- usuario_id: ID del usuario
- total: Total de la venta
- items: JSON con los productos
- pagos: JSON con métodos de pago

---

## 🔄 Flow del Guardado de Ventas

1. Usuario hace clic en "CONFIRMAR VENTA"
2. `confirmarVenta()` llama a `apiGuardarVenta(venta)`
3. `apiGuardarVenta()` hace POST a `http://localhost:3000/api/ventas`
4. Backend recibe venta, valida datos, inserta en DB
5. Retorna `{ success: true, venta_id: 123, total: 15000 }`
6. React actualiza estado local y muestra confirmación
7. Venta está permanentemente guardada en la BD

---

## ⚠️ ERRORES COMUNES Y SOLUCIONES

### Error: "No hay sesión activa"
- ✅ Asegúrate de estar logueado
- ✅ Verifica que el token esté en localStorage (F12 → Application)

### Error: "Error de conexión: Backend no responde"
- ✅ Verifica que backend esté corriendo en puerto 3000
- ✅ Ejecuta: `netstat -an | grep 3000` (Windows: `netstat -ano | findstr :3000`)

### Error: "Usuario no encontrado"
- ✅ Verifica email exacto: admin@heladeria.com (no admin)
- ✅ Usa credenciales de prueba: admin123 / vend123

### Error: CORS blocked
- ✅ Verifica que CORS esté configurado en app.js
- ✅ Origen debe incluir http://localhost:3000

### Error: "Table doesn't exist"
- ✅ Espera a que initDB se ejecute (ver console del backend)
- ✅ Si no aparece, ejecuta manualmente: `node -e "require('./initDB').default()"`

---

## 📊 ENDPOINTS DISPONIBLES

### Autenticación
```
POST /api/login
Body: { "email": "admin@heladeria.com", "password": "admin123" }
Response: { "token": "eyJhbGc..." }
```

### Ventas
```
POST /api/ventas
Headers: Authorization: Bearer {token}
Body: {
  "usuario_id": 1,
  "items": [{id: 93, nombre: "Chocolate", cantidad: 2, precio: 7500}],
  "total": 15000,
  "pagos": [{metodo: "EFECTIVO", monto: 15000}]
}

GET /api/ventas
Headers: Authorization: Bearer {token}
Query: ?usuario_id=1&fecha_inicio=2025-02-01&fecha_fin=2025-02-28&limite=100

GET /api/ventas/:id
Headers: Authorization: Bearer {token}

GET /api/ventas-reporte
Headers: Authorization: Bearer {token}
Query: ?usuario_id=1&fecha_inicio=2025-02-01
```

---

## 📱 ACCESO REMOTO (Próximo paso)

Para ver el sistema desde otra ubicación:

### Opción 1: Ngrok (Fácil)
```bash
ngrok http 3000
```
Obtiene URL pública: `https://xxxxx.ngrok.io`

### Opción 2: Servidor en la nube (Recomendado)
- Heroku
- AWS EC2
- DigitalOcean
- Render

### Opción 3: DNS Dinámico (DIY)
- NoIP
- DynDNS
- CloudFlare

---

## ✨ NOTAS IMPORTANTES

- El token JWT expira en **8 horas**
- Las ventas se guardan con **timestamp automático**
- Los datos están en **MySQL** (persistentes)
- CORS permite orígenes: localhost:3000, localhost:5500, 127.0.0.1
- El sistema está optimizado para móvil (responsive design)

---

## 🎯 PRÓXIMOS PASOS

1. ✅ Probar flujo completo localmente
2. ⏳ Configurar acceso remoto (Ngrok o VPS)
3. ⏳ Optimizar para móvil (viewport, touch events)
4. ⏳ Agregar reportes exportables (PDF, CSV)
5. ⏳ Implementar sincronización offline

---

## 📞 AYUDA RÁPIDA

**Ver logs del backend:**
```bash
npm run dev
```

**Ver logs del frontend (F12):**
Press F12 en navegador → Console

**Verificar BD:**
```bash
mysql -u root -p proyectoheladeria
SELECT COUNT(*) FROM ventas;
```

**Limpiar localStorage:**
```javascript
localStorage.clear();
location.reload();
```

---

**Creado:** 2025-02-10
**Versión:** 1.0.0 FUNCIONAL
