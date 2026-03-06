"""
Aplicación principal FastAPI
Sistema de Gestión de Heladería
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from config import get_settings
from database import test_connection
from routers import productos_router, inventario_router, ventas_router

settings = get_settings()

# Crear aplicación FastAPI
app = FastAPI(
    title=settings.api_title,
    version=settings.api_version,
    description=settings.api_description,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configurar CORS (permite peticiones desde el frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción, especificar dominios permitidos
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================
# ENDPOINTS BÁSICOS
# ============================================

@app.get("/", tags=["General"])
async def root():
    """Endpoint raíz - Información de la API"""
    return {
        "nombre": settings.api_title,
        "version": settings.api_version,
        "descripcion": settings.api_description,
        "documentacion": "/docs",
        "redoc": "/redoc",
        "estado": "activo"
    }


@app.get("/health", tags=["General"])
async def health_check():
    """Verifica el estado de la API y la conexión a la base de datos"""
    try:
        db_ok = test_connection()
        return {
            "status": "healthy" if db_ok else "unhealthy",
            "database": "connected" if db_ok else "disconnected",
            "api_version": settings.api_version
        }
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Error en health check: {str(e)}")


# ============================================
# REGISTRAR ROUTERS
# ============================================

app.include_router(productos_router, prefix="/api")
app.include_router(inventario_router, prefix="/api")
app.include_router(ventas_router, prefix="/api")


# ============================================
# MANEJADORES DE ERRORES GLOBALES
# ============================================

@app.exception_handler(404)
async def not_found_handler(request, exc):
    return JSONResponse(
        status_code=404,
        content={
            "error": "Recurso no encontrado",
            "detail": str(exc.detail) if hasattr(exc, 'detail') else "El endpoint solicitado no existe"
        }
    )


@app.exception_handler(500)
async def internal_error_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={
            "error": "Error interno del servidor",
            "detail": "Ha ocurrido un error inesperado. Por favor contacte al administrador."
        }
    )


# ============================================
# EVENTO DE INICIO
# ============================================

@app.on_event("startup")
async def startup_event():
    """Se ejecuta al iniciar la aplicación"""
    print("=" * 60)
    print(f"🚀 {settings.api_title} v{settings.api_version}")
    print("=" * 60)
    print(f"📊 Base de datos: {settings.db_name}")
    print(f"🌐 Host: {settings.api_host}:{settings.api_port}")
    print(f"📖 Documentación: http://localhost:{settings.api_port}/docs")
    print(f"🔄 Redoc: http://localhost:{settings.api_port}/redoc")
    
    # Verificar conexión a la base de datos
    if test_connection():
        print("✅ Conexión a base de datos: OK")
    else:
        print("❌ Conexión a base de datos: ERROR")
    
    print("=" * 60)


@app.on_event("shutdown")
async def shutdown_event():
    """Se ejecuta al cerrar la aplicación"""
    print("\n👋 Cerrando aplicación...")


# ============================================
# PUNTO DE ENTRADA
# ============================================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.api_host,
        port=settings.api_port,
        reload=True,  # Auto-reload en desarrollo
        log_level="info"
    )
