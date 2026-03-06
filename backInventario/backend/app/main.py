"""
Aplicación principal FastAPI - Sistema de Gestión de Heladería
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import productos, inventario, ventas, otros

# Crear la aplicación FastAPI
app = FastAPI(
    title="Sistema de Gestión de Heladería",
    description="API REST para gestión de inventario, ventas y productos de heladería",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configurar CORS (para permitir requests desde el frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción, especificar los dominios permitidos
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir los routers
app.include_router(productos.router)
app.include_router(inventario.router)
app.include_router(ventas.router)
app.include_router(otros.router)


@app.get("/")
def root():
    """
    Endpoint raíz - Información de la API
    """
    return {
        "mensaje": "API de Gestión de Heladería",
        "version": "1.0.0",
        "documentacion": "/docs",
        "estado": "activo"
    }


@app.get("/health")
def health_check():
    """
    Health check - Verificar que la API está funcionando
    """
    return {
        "status": "ok",
        "mensaje": "La API está funcionando correctamente"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
